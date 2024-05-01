//use std::any::Any;
// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod setup;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command

use std::net::{IpAddr, TcpListener, TcpStream};
use std::thread;
use std::io::{Read, Write};
use std::sync::{Arc};
use std::sync::mpsc::{channel, Sender, Receiver};
use std::time::Duration;
use std::str;
use serde::{Serialize, Deserialize};
use serde_json::Result as ResultJson;
use std::char;
use std::io::Cursor;
use std::sync::atomic::{AtomicBool, Ordering};
use std::thread::sleep;
use byteorder::{ReadBytesExt, LittleEndian, WriteBytesExt};
use dashmap::DashMap;
use dashmap::mapref::one::Ref;
//#[macro_use]
use lazy_static::lazy_static;
use local_ip_address::local_ip;

#[macro_use]
extern crate log;

use log::{error, info, warn};
use mdns_sd::{ServiceDaemon, ServiceInfo};
use rand::Rng;
use simpdiscoverylib::BeaconSender;
use crate::setup::{is_clover_connected};

const BEACON_SERVICE_PORT: u16 = 6900;
const BEACON_SERVICE_NAME: &str = "CopterShow";

lazy_static! {
    static ref TABLE: Arc<DashMap<String, CopterData>> = Arc::new(DashMap::new());
    static ref CHANNELS: Arc<DashMap<String, Sender<InternalPass>>> = Arc::new(DashMap::new());
}
#[derive(Serialize, Deserialize, Debug, Clone)]
struct CopterData {
    name: String,
    #[serde(default = "default_battery")]
    battery: Option<f32>,
    #[serde(default = "default_flight_mode")]
    flight_mode: String,
    #[serde(default = "default_controller_state")]
    controller_state: String,

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
    args: serde_json::Value
}

#[derive(Serialize, Deserialize, Debug, Clone)]
#[serde(tag = "type")]
enum Receive {
    Info(CopterData),
    Response(Response),
}

// #[derive(Serialize, Deserialize, Debug, Clone)]
// struct Query {
//     name: String,
//     #[serde(default = "default_battery")]
//     battery: Option<f32>,
//     #[serde(default = "default_flight_mode")]
//     flight_mode: String,
//     #[serde(default = "default_controller_state")]
//     controller_state: String,
//
// }
// #[derive(Serialize, Deserialize, Debug, Clone)]
// struct Response {
//     id: Integer,
//     method_name: String,
//     args:
// }
#[derive(Debug)]
struct InternalPass {
    addr_name: String,
    query: Query
}


fn default_battery() -> Option<f32> {
    Some(0.0)
}

fn default_flight_mode() -> String {
    "error".to_string()
}

fn default_controller_state() -> String {
    "error".to_string()
}

fn parse_raw(msg: &str) -> ResultJson<CopterData> {
    let data: CopterData = serde_json::from_str(msg)?;
    Ok(data)
}

fn parse_type(msg: &str) -> ResultJson<Receive> {
    let data: Receive = serde_json::from_str(msg)?;
    Ok(data)
}


fn send_msg(stream: &mut TcpStream, msg: &str) -> std::io::Result<()> {
    let msg = msg.encode_utf16().collect::<Vec<u16>>();
    let len = (msg.len() * 2) as u32; // Умножаем на 2, потому что каждый символ занимает 2 байта в UTF-16
    let len_bytes = len.to_be_bytes();
    stream.write_all(&len_bytes)?;

    for &c in &msg {
        stream.write_u16::<LittleEndian>(c)?; // Записываем каждый символ как 16-битное число в LittleEndian
    }
    Ok(())
}


fn recv_msg(stream: &mut TcpStream) -> std::io::Result<String> {
    let mut len_bytes = [0; 4];
    stream.read_exact(&mut len_bytes)?;
    let len = u32::from_be_bytes(len_bytes) as usize;

    let mut msg = vec![0; len];
    stream.read_exact(&mut msg)?;

    let mut rdr = Cursor::new(msg);
    let mut u16_data = Vec::new();
    while let Ok(val) = rdr.read_u16::<LittleEndian>() {
        u16_data.push(val);
    }

    let mut data: String = u16_data.iter().filter_map(|&c| char::from_u32(c as u32)).collect();
    if data.starts_with('\u{feff}') { // Если строка начинается с BOM
        data = data.chars().skip(1).collect(); // Удаляем BOM
    }
    Ok(data)
}


fn main() {
    std::env::set_var("RUST_LOG", "axshow=trace");
    env_logger::init();

    let my_local_ip = local_ip().unwrap_or(IpAddr::V4 { 0: "127.0.0.1".parse().unwrap() });
    let listener = TcpListener::bind("0.0.0.0:".to_owned() + &*BEACON_SERVICE_PORT.to_string()).unwrap();
    info!("Listening on: {}", listener.local_addr().unwrap());
    warn!("Broadcast set port to: {}", BEACON_SERVICE_PORT);
    thread::spawn(move || {
        for stream in listener.incoming() {
            let (tx, rx): (Sender<InternalPass>, Receiver<InternalPass>) = channel();
            match stream {
                Ok(stream) => {
                    thread::spawn(move || {
                        handle_client(stream, (tx, rx));
                    });
                }
                _ => {}
            }
        }
    });
    thread::spawn(move || {
        if let Ok(beacon) = BeaconSender::new(BEACON_SERVICE_PORT,
                                              BEACON_SERVICE_NAME.as_bytes(), 9002) {
            loop {
                beacon.send_loop(Duration::from_secs(1)).unwrap_or({});
                warn!("Error in broadcasting!");
            }
        }
    });
// Create a daemon
    let mdns = ServiceDaemon::new().expect("Failed to create daemon");
//
// Create a service Info.
    let service_type = "_cshow._tcp.local.";
    let instance_name = format!("server-{}", rand::thread_rng().gen::<u8>());
    let ip = my_local_ip.to_string();
    let host_name = format!("{}._cshow._tcp.local.", instance_name);
    let port = 6900;
    let properties = [("desc", "HOME Bonjour test")];

    let my_service = ServiceInfo::new(
        service_type,
        &*instance_name,
        &*host_name,
        ip,
        port,
        &properties[..],
    ).unwrap();

    // Register with the daemon, which publishes the service.
    mdns.register(my_service).expect("Failed to register our service");

    let running = Arc::new(AtomicBool::new(true));
    let r = running.clone();

    // while running.load(Ordering::SeqCst) {
    //     send_action("clover1", "take_off");
    //     Info!("Current table is: {:?}", get_connected_clients());
    //     sleep(Duration::from_secs(1));
    // }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_action, get_connected_clients, //wait_for,
            send_mass_action])
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(move |_app_handle, event| match event {
            tauri::RunEvent::ExitRequested { .. } => {
                sleep(Duration::from_secs(1));
                mdns.unregister(&*format!("{}.{}", instance_name, service_type)).expect("Error when unregistering");
                mdns.shutdown().expect("Error shutting down");
                warn!("Bye!");
            }
            _ => {}
        });

    // Gracefully shutdown the daemon
}

fn handle_client(mut stream: TcpStream, channel: (Sender<InternalPass>, Receiver<InternalPass>)) {
    let ip = stream.peer_addr().unwrap().to_string();
    info!("Received one request from {}", ip);
    let mut name: String = "".to_string();
    //TABLE.insert(ip.clone(), None);
    loop {
        match channel.1.try_recv() {
            Ok(data) => {
                info!("received {:?} for {}", data.query, data.addr_name);
                send_msg(&mut stream, &serde_json::to_string(&data.query).unwrap_or("ok".to_string())).unwrap_or_default();
            }
            Err(_) => {}
        }
        match recv_msg(&mut stream) {
            Ok(msg_str) => {
                let json: ResultJson<Receive> = serde_json::from_str(&msg_str);
                match json {
                    Ok(json_data) => {
                        debug!("{json_data:?}");
                        match json_data {
                            Receive::Info(info) => {
                                // debug!("Data received from client is: {info:?}");
                                let data_name = info.name.clone();
                                name = data_name;
                                if !CHANNELS.contains_key(&info.name.clone()) { CHANNELS.insert(info.name.clone(), channel.0.to_owned()); }
                                TABLE.insert(ip.clone(), info);
                                send_msg(&mut stream, "ok").unwrap_or_default();
                            }
                            Receive::Response(response) => {}
                        }
                        // match (json_data) {
                        //     copterdata => {
                        //         println!("received Info");
                        //         match parse_raw(&msg_str) {
                        //             Ok(data) => {
                        //                 debug!("Data received from client is: {:?}, {:?}, {:?}, {:?}", data.name,data.battery,data.flight_mode,data.controller_state);
                        //                 let data_name = data.name.clone();
                        //                 name = data_name;
                        //                 if !CHANNELS.contains_key(&data.name.clone()) { CHANNELS.insert(data.name.clone(), channel.0.to_owned()); }
                        //                 TABLE.insert(ip.clone(), data);
                        //                 send_msg(&mut stream, "ok").unwrap_or_default();
                        //             }
                        //             Err(e) => {
                        //                 error!("Failed to parse message: {:?}", e);
                        //             }
                        //         }
                        //     }
                        //     Response => {
                        //         println!("received response")
                        //     }
                        //     _ => {}
                        // }
                    }
                    Err(e) => {
                        error!("Failed to parse message: {:?}", e);
                    }
                }
            }
            Err(_) => {
                break;
            }
        }
    }

    warn!("Disconnected from {}", ip);

    CHANNELS.remove(&name);
    TABLE.remove(&ip);
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

#[tauri::command]
fn get_connected_clients() -> Result<Vec<CopterData>, ()> {
    println!("sending clients");
    let values: Vec<_> = TABLE.clone().iter().map(|v| v.value().clone()).collect();
    Ok(values)
}

#[tauri::command(async)]
fn wait_for_connection() {
    println!("loop")
}