import * as React from 'react';
import {
    AppBar,
    Toolbar,
    Typography,
    IconButton,
    Button,
    Popover,
    Box,
    List,
    ListItemText, ListItemButton
} from '@mui/material';
import CloseIcon from "@mui/icons-material/Close";
import {invoke} from "@tauri-apps/api/tauri";

interface AppBarProps {
    selected: string[],
    handleUnselect: () => void
}

interface PopoutItem {
    title: string,
    method_name: string,
    args: object
}

interface PopoverProps {
    items: PopoutItem[],
    anchorEl: EventTarget & Element | null,
    handleClose: () => void,
    sendCommand: (cmd: PopoutItem) => void
}

function DynamicPopover(props: PopoverProps) {

    const open = Boolean(props.anchorEl);

    return (
        <Popover
            open={open}
            anchorEl={props.anchorEl}
            onClose={props.handleClose}
            anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
        >
            <Box>
                <List>
                    {props.items.map((item, index) => (
                        <ListItemButton key={index} onClick={() => props.sendCommand(item)}>
                            <ListItemText>{item.title}</ListItemText>
                        </ListItemButton>
                    ))}
                </List>
            </Box>
        </Popover>
    );
}

export default function BottomToolbar(props: AppBarProps) {
    const [anchorEl, setAnchorEl] =
        React.useState<EventTarget & Element | null>(null);
    const [selectedItems, setSeletedItems] =
        React.useState<PopoutItem[]>([])
    const testItems: PopoutItem[] = [
        {title: "Takeoff", method_name: "takeoff", args: {}},
        {title: "Blink led", method_name: "led", args: {r: 255, g: 255, b: 255, effect: "flash"}},
        {title: "Run self check", method_name: "self_check", args: {}},
    ]
    const restartItems: PopoutItem[] = [
        {title: "Restart RPI", method_name: "reboot_system", args: {}},
        {title: "Restart FCU", method_name: "reboot_fcu", args: {}},
        {title: "Rerun show-client", method_name: "restart_client", args: {}},
    ]
    const emergencyItems: PopoutItem[] = [
        {title: "Emergency land", method_name: "emergency_land", args: {}},
        {title: "Force disarm", method_name: "set_arming", args: {state: false}},
        {title: "Land", method_name: "land", args: {}},
        {title: "Kill show-client", method_name: "kill_client", args: {}}
    ]
    const handlePopoverOpen = (event: React.MouseEvent, items: PopoutItem[]) => {
        setAnchorEl(event.currentTarget);
        setSeletedItems(items)
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const sendCommand = (cmd: PopoutItem) => {
        //let args_str = cmd.args.map(item => typeof item === 'string' ? `"${item}"` : item).join(', ');
        invoke("send_mass_action", {
            addrNames: props.selected,
            query: {
                id: 123,
                method_name: cmd.method_name,
                args: cmd.args
            }
        })
    }
    return (
        <AppBar position={"fixed"} sx={{bottom: 56, top: "auto", marginRight: 2, borderTopRightRadius: "8px"}}>
            <Toolbar>
                <IconButton color="inherit" onClick={props.handleUnselect} style={{marginRight: '16px'}}>
                    <CloseIcon/>
                </IconButton>
                <Typography variant="body1" component="div" sx={{flexGrow: 1}}>
                    {props.selected.length} copters selected
                </Typography>
                <DynamicPopover anchorEl={anchorEl} handleClose={handlePopoverClose}
                                items={selectedItems} sendCommand={sendCommand}/>
                <Button color="inherit" sx={{marginRight: 3}} onClick={(event) =>
                    handlePopoverOpen(event, testItems)}>Testing</Button>
                <Button color="inherit" sx={{marginRight: 3}} onClick={(event) =>
                    handlePopoverOpen(event, restartItems)}>Restart</Button>
                <Button color="inherit" onClick={(event) =>
                    handlePopoverOpen(event, emergencyItems)}>Emergency</Button>
            </Toolbar>
        </AppBar>
    )
}