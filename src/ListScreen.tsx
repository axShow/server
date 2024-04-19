import React from "react";
import {
    Box,
    Checkbox, IconButton,
    List,
    ListItem, ListItemSecondaryAction,
    ListItemText, Typography,
} from "@mui/material";
import {invoke} from "@tauri-apps/api/tauri";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GamepadIcon from "@mui/icons-material/Gamepad";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import BottomToolbar from "./ToolBar.tsx";
import {CopterData} from "./App.tsx";

interface ListScreenProps {
    setSelected: (selected: string[]) => void
    selected: string[]
    update_copters: () => void
    copters: CopterData[]
}

export default function ListScreen(props: ListScreenProps) {
    const handleUnselect = () => {
        props.setSelected([]);
    };
    const handleToggle = (value: string) => () => {
        const currentIndex = props.selected.indexOf(value);
        const newChecked = [...props.selected];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        props.setSelected(newChecked);
    };

    React.useEffect(() => {

        props.update_copters(); // Fetch data immediately

        const intervalId = setInterval(props.update_copters, 500); // Fetch data every 0.5 seconds

        return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);


    return (<>
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    height: '100vh', // Use full viewport height
                }}
            >
                <Box
                    sx={{
                        overflowY: 'auto', // Enable vertical scrolling
                        flexGrow: 1, // Take up all available space
                    }}
                >
                    <List>
                        {
                            props.copters.map((item) => (
                                <ListItem key={item.name}>
                                    <Checkbox
                                        edge="start"
                                        checked={props.selected.indexOf(item.name) !== -1}
                                        tabIndex={-1}
                                        disableRipple
                                        inputProps={{'aria-labelledby': `checkbox-list-label-${item.name}`}}
                                        onClick={handleToggle(item.name)}
                                    />
                                    <ListItemText
                                        primary={item.name}
                                        secondary={
                                            <Box display="flex" alignItems="center">
                                                <BatteryFullIcon fontSize="small"
                                                                 sx={{marginRight: 1}}/> {item.battery?.toFixed(2)}V
                                                <CheckCircleOutlineIcon fontSize="small"
                                                                        sx={{
                                                                            marginRight: 1,
                                                                            marginLeft: 2
                                                                        }}/> {item.controller_state}
                                                <GamepadIcon fontSize="small"
                                                             sx={{marginRight: 1, marginLeft: 2}}/> {item.flight_mode}
                                            </Box>
                                        }
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton edge="end" color="primary" style={{marginRight: '8px'}}
                                                    onClick={() => invoke("send_action", {
                                                        addrName: item.name,
                                                        action: "take_off()"
                                                    })}>
                                            <FlightTakeoffIcon/>
                                        </IconButton>

                                        <IconButton edge="end" color="primary" style={{marginRight: '4px'}}
                                                    onClick={() => invoke("send_action", {
                                                        addrName: item.name,
                                                        action: "led(255,255,255)"
                                                    })}>
                                            <FlashOnIcon/>
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))
                        }
                    </List>
                    {props.copters.length == 0 && <Typography align="center">No connected copters</Typography>}
            <Box height={props.selected.length >= 1 ? 120 : 40}/>
                </Box>
            </Box>
            {props.selected.length >= 1 && (
                <BottomToolbar handleUnselect={handleUnselect} selected={props.selected}/>
            )}
        </>
    );
}