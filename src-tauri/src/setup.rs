use std::fmt::Error;
use std::process::{Command, Output};
use port_scanner::scan_port_addr;
use serde::{Deserialize, Serialize};

#[tauri::command]
pub fn is_clover_connected() -> bool {
    scan_port_addr("192.168.11.1:80")
}