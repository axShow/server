//use std::any::Any;
// Prevents additional console window on Wipub(crate)pub(crate)ndowspub(crate) in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

// mod setup;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[macro_use]
mod files_parser;

use mdns_sd::{ServiceDaemon, ServiceInfo};
use std::net::{IpAddr, UdpSocket};
use std::{fs, io, thread};
use std::io::{Read, Write};
use std::sync::{Arc};
use std::sync::mpsc::{channel, Sender, Receiver};
use std::time::{Duration, Instant, UNIX_EPOCH};
use std::str;
use serde::{Serialize, Deserialize};
use std::char;
use std::io::Cursor;
use std::path::PathBuf;
use serde_json::Result as ResultJson;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread::sleep;
use byteorder::{ReadBytesExt, LittleEndian, WriteBytesExt};
use dashmap::DashMap;
use dashmap::mapref::one::{Ref, RefMut};
//#[macro_use]
use lazy_static::lazy_static;
use local_ip_address::list_afinet_netifas;
use files_parser::{get_all_files, parse_animations};
#[macro_use]
extern crate log;
extern crate core;

use log::{error, info, warn};
// use mdns_sd::{ServiceDaemon, ServiceInfo};
use rand::{random, Rng};
use simpdiscoverylib::BeaconSender;
// use crate::setup::{is_clover_connected};

lazy_static! {
    static ref TABLE: Arc<DashMap<String, CopterData>> = Arc::new(DashMap::new());
    static ref CHANNELS: Arc<DashMap<String, Sender<InternalPass>>> = Arc::new(DashMap::new());
}
#[derive(Serialize, Deserialize, Debug, Clone)]
struct CopterData {
    #[serde(skip_deserializing)]
    addr: String,
    #[serde(skip_deserializing)]
    last_timestamp: i64,
    #[serde(skip_deserializing)]
    time_offset: i64,
    name: String,
    #[serde(default = "default_battery")]
    battery: Option<f32>,
    #[serde(default = "default_flight_mode")]
    flight_mode: String,
    #[serde(default = "default_controller_state")]
    state: String,
    #[serde(default = "default_controller_status")]
    status: String,
    #[serde(default = "Vec::new")]
    responses: Vec<Response>,
    x: f32,
    y: f32,
    z: f32,
    color: (i16, i16, i16),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Response {
    id: i32,
    result: serde_json::Value,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Query {
    id: i32,
    method_name: String,
    args: serde_json::Value,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct Heartbeat {
    timestamp: i64,
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
enum Receive {
    Info(CopterData),
    Response(Response),
    Heartbeat(Heartbeat),
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
enum Send {
    Query(Query),
    Heartbeat(Heartbeat),
}

#[derive(Debug)]
struct InternalPass {
    addr_name: String,
    query: Query,
}
const BROADCAST_ADDRESS: &str = "255.255.0.0";

fn default_battery() -> Option<f32> {
    Some(0.0)
}

fn default_flight_mode() -> String {
    "ERROR".to_string()
}

fn default_controller_status() -> String {
    "ERROR".to_string()
}
fn default_controller_state() -> String {
    "EMRG".to_string()
}

fn decode_msg(data: &[u8]) -> Option<String> {
    let mut start = 0;
    let end = data.len();

    if data.len() >= 4 {
        let prefix_len = u32::from_be_bytes([data[0], data[1], data[2], data[3]]) as usize;
        if prefix_len == data.len() - 4 {
            start = 4;
        }
    }

    let mut rdr = Cursor::new(&data[start..end]);
    let mut u16_data = Vec::new();
    while let Ok(val) = rdr.read_u16::<LittleEndian>() {
        u16_data.push(val);
    }

    let mut s: String = u16_data.iter().filter_map(|&c| char::from_u32(c as u32)).collect();
    if s.starts_with('\u{feff}') {
        s = s.chars().skip(1).collect();
    }
    Some(s)
}

fn main() {
    std::env::set_var("RUST_LOG", "axshow=trace");
    env_logger::init();

    // Получаем все локальные IP-адреса
    let local_ips = list_afinet_netifas().unwrap_or_else(|_| {
        warn!("Failed to get network interfaces, using fallback IP");
        vec![("lo".to_string(), IpAddr::V4("127.0.0.1".parse().unwrap()))]
    });
    
    // Логируем все найденные IP-адреса
    for (interface, ip) in &local_ips {
        warn!("Found interface {} with IP: {}", interface, ip);
    }
    
    thread::spawn(move || {
        let socket = UdpSocket::bind("0.0.0.0:9009").expect("couldn't bind to address");
        info!("Listening on 0.0.0.0:9009");
        let mut buf = [0; 65535];
        loop {
            match socket.recv_from(&mut buf) {
                Ok((amt, src)) => {
                    let buf = &mut buf[..amt];
                    let s = match decode_msg(buf) {
                        Some(v) => v,
                        None => {
                            warn!("Failed to decode message from {}", src);
                            continue;
                        }
                    };
                    match serde_json::from_str::<CopterData>(&s) {
                        Ok(mut data) => {
                            data.addr = src.ip().to_string();
                            data.last_timestamp = std::time::SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64;
                            TABLE.insert(data.addr.clone(), data);
                        },
                        Err(e) => {
                            warn!("Failed to parse CopterData: {}", e);
                        }
                    }
                },
                Err(e) => {
                    warn!("couldn't receive a datagram: {}", e);
                }
            }
        }
    });

    let running = Arc::new(AtomicBool::new(true));
    let r = running.clone();

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_action, get_connected_clients, send_for_response,//wait_for,
            send_mass_action, get_all_files, parse_animations, upload_animation])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(move |_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { .. } => {
                sleep(Duration::from_secs(1));

                warn!("Bye!");
            }
            _ => {}
        });
}

#[tauri::command]
fn send_action(addr_name: &str, query: Query) {
    println!("{query:?}");
    match CHANNELS.get(addr_name) {
        None => {}
        Some(sender) => {
            sender.value().send(
                InternalPass {
                    addr_name: addr_name.to_string(),
                    query: query.clone(),
                }).unwrap_or_default();
        }
    }
}

#[tauri::command]
fn send_mass_action(addr_names: Vec<&str>, query: Query) {
    for addr_name in addr_names {
        send_action(addr_name, query.clone());
    }
}
fn remove_old_data() {
    let threshold = Duration::from_secs(10);
    let now = std::time::SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis() as i64;
    let threshold_ms = threshold.as_millis() as i64;
    let mut to_remove = Vec::new();
    for row in TABLE.clone().iter() {
        // info!("{} > {}", now - row.last_timestamp + row.time_offset, threshold_ms);
        if now - row.last_timestamp + row.time_offset > threshold_ms {
            to_remove.push(row.addr.clone());
        }
    }
    // info!("To remove: {:?} pcs", to_remove.len());
    for key in to_remove {
        TABLE.remove(&key);
    }
}
#[tauri::command]
fn get_connected_clients() -> Result<Vec<CopterData>, ()> {
    remove_old_data();
    let values: Vec<_> = TABLE.clone().iter().map(|v| v.value().clone()).collect();
    Ok(values)
}

#[tauri::command(async)]
async fn send_for_response(addr_name: &str, query: Query) -> Result<Response, ()> {
    match CHANNELS.get(addr_name) {
        None => {
            Err(())
        }
        Some(sender) => {
            sender.value().send(
                InternalPass {
                    addr_name: addr_name.to_string(),
                    query: query.clone(),
                }).unwrap_or_default();
            // let el = TABLE.iter().position(|v| v.value().name == addr_name).unwrap().clone();
            // let addr = TABLE.iter().last().unwrap().key().clone();
            // info!("Wait for {:?}", el.key());
            loop {
                let copter = TABLE.get(addr_name).unwrap().clone();
                let resps = copter.responses.iter().find(|v| v.id == query.id).to_owned();
                match resps.clone() {
                    Some(val) => {
                        // println!("{:?}", resps);
                        break Ok(val.clone());
                    }
                    _ => {
                        async_std::task::sleep(Duration::from_millis(500)).await;
                    }
                }
                // data = None;
            }
        }
    }
}

#[derive(Serialize, Deserialize, Debug, Clone)]
struct UploadArgs {
    data: String
}

#[tauri::command()]
fn upload_animation(anim_path: String, drone: &str) {
    match CHANNELS.get(drone) {
        None => {}
        Some(sender) => {
            let path = PathBuf::from(anim_path.clone());
            if path.is_file() {
                let file = fs::read_to_string(&path).unwrap_or_default();
                sender.value().send(
                    InternalPass {
                        addr_name: drone.to_string(),
                        query: Query {
                            id: random::<i32>(),
                            method_name: "upload_animation".to_string(),
                            args: serde_json::to_value(UploadArgs {
                                data: file
                            }).unwrap(),
                        },
                    }).unwrap_or_default();

            }
        }
    }
}
fn wait_for_connection() {
    println!("loop")
}
// #[tauri::command()]
// fn view_files() {
//     println!("loop")
// }
