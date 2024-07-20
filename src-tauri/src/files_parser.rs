use std::{fs, io};
use std::path::{Ancestors, PathBuf};
use std::str::FromStr;
use serde::{Deserialize, Serialize};
use serde_yaml;

#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct Animation {
    path: String,
    animation_name: String,
    object_name: String,
    start_position: (f32, f32),
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AnimationConfigExt {
    config: AnimationConfig
}
#[derive(Serialize, Deserialize, Debug, Clone)]
pub struct AnimationConfig {
    animation_name: String,
    object_name: String,
    start_position: (f32, f32),
    move_type: String,
    nav_frame: String,
    frame_delay: f32,
    start_action: String,
    end_action: String,
    takeoff_height: f32,
    coords_system: String
}

#[tauri::command()]
pub fn get_all_files(paths: Vec<String>) -> Result<Vec<String>, String> {
    let mut all_files: Vec<String> = Vec::new();
    for path_str in paths {
        let path = PathBuf::from(path_str.clone());
        if path.is_dir() {
            // Recursively call for subdirectories
            let mut sub_files = fs::read_dir(path).map_err(|err| err.to_string())?
                .into_iter()
                .filter_map(|entry| entry.ok()) // Filter out potential errors
                .map(|entry| entry.path().to_string_lossy().to_string()) // Convert to String
                .collect::<Vec<_>>();
            all_files.append(&mut sub_files);
        } else if path.is_file() {
            all_files.push(path_str.clone().to_string());
        } else {
            // Handle other path types (e.g., symlinks) if needed
            // ...
        }
    }
    Ok(all_files.clone())
}

fn get_animation_objects_names(animation_files: Vec<String>) -> Result<Vec<String>, String> {
    let mut first_lines: Vec<String> = Vec::new();
    for path_str in animation_files {
        let path = PathBuf::from(path_str);
        if path.is_file() {
            let first_line = fs::read_to_string(&path)
                .map(|content| content.lines().next().unwrap_or_default().to_string())
                .map_err(|err| err.to_string())?;
            first_lines.push(first_line);
        }
    }
    Ok(first_lines)
}
#[tauri::command()]
pub fn parse_animations(animation_files: Vec<String>) -> Result<Vec<Animation>, String> {
    let mut animations: Vec<Animation> = Vec::new();
    for path_str in animation_files {
        let path = PathBuf::from(path_str.clone());
        if path.is_file() {
            let file = fs::read_to_string(&path).unwrap_or_default();
            let mut spl = file.split("==================================");
            let config: AnimationConfigExt = serde_yaml::from_str(spl.next().unwrap()).unwrap();

            let frames = spl.next().unwrap().lines();
            // let mut lines = file.lines();
            let object_name = config.config.object_name;
            let animation_name = config.config.animation_name;
            let start_pos = config.config.start_position;
            // let first_frame: Vec<_> = lines.next().unwrap().split(",").collect();
            // if(first_frame.len() != 8) { continue; }
            // let first_x = f32::from_str(first_frame[2]).unwrap_or_default();
            // let first_y = f32::from_str(first_frame[1]).unwrap_or_default();
            let animation = Animation {
                path: path_str,
                animation_name,
                object_name,
                start_position: (start_pos.0, start_pos.1),
            };
            animations.push(animation)
        }
    }
    Ok(animations)
}
