use std::process::{Command, Output};
use serde::{Deserialize, Serialize};

fn get_output(command: &str, args: &[&str]) -> String {
    let output = Command::new(command)
        .args(args)
        .output()
        .expect("Failed to execute command");

    // Convert the output bytes to a UTF-16 string
    let utf16_output = String::from_utf8_lossy(&output.stdout);
    let utf16_output = utf16_output.encode_utf16().collect::<Vec<u16>>();
    let utf16_output_str = String::from_utf16_lossy(&utf16_output);

    utf16_output_str.to_string()
}
#[derive(Serialize, Deserialize, Debug)]
pub struct Wifi {
    ssid: String,
    password: String
}
#[tauri::command]
pub fn get_wifis() -> Vec<Wifi> {
    let output = get_output("netsh", &["wlan", "show", "profiles"]);
    let data = String::from(&output);
    let profiles: Vec<&str> = data
        .split('\n')
        .map(|line| line.split(":").nth(1).unwrap_or("").trim())
        .filter(| line | !line.eq(&""))
        .collect();
     debug!("Found profiles: {:?}", profiles);
    let mut result: Vec<Wifi> = Vec::new();
    for profile in profiles {
        if profile == "" {continue}
        let profile_output = get_output("netsh", &["wlan", "show", "profile", profile, "key=clear"]);
        let profile_data = String::from(&profile_output);
        let mut password = profile_data
            .split('\n')
            .filter(|line| line.split(":").nth(0).unwrap_or("").trim().chars().count() == 13)
            .map(| line | line.split(":").nth(1).unwrap_or("").trim())
            .next();

        match password {
            Some(p) => {
                result.push(Wifi {
                    ssid: profile.to_string(),
                    password: p.to_string()
                });
            }
            //println!("{:<30}| {:<}", profile, p),
            None => { info!("Password for {} not found!", profile)}//println!("{:<30}| ", profile),
        }
    }
    result
}