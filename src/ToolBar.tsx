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
    action: string,
    args: any[]
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
        {title: "Takeoff", action: "take_off", args: []},
        {title: "Blink led", action: "led", args: [255, 255, 255]},
        {title: "Run self check", action: "self_check", args: []},
    ]
    const restartItems: PopoutItem[] = [
        {title: "Restart RPI", action: "restart_system", args: []},
        {title: "Restart FCU", action: "restart_fcu", args: []},
        {title: "Rerun show-client", action: "restart_client", args: []},
    ]
    const emergencyItems: PopoutItem[] = [
        {title: "Emergency land", action: "emergency_land", args: []},
        {title: "Force disarm", action: "force_disarm", args: []},
        {title: "Land", action: "land", args: []},
        {title: "Kill show-client", action: "kill_yourself", args: []}
    ]
    const handlePopoverOpen = (event: React.MouseEvent, items: PopoutItem[]) => {
        setAnchorEl(event.currentTarget);
        setSeletedItems(items)
    };

    const handlePopoverClose = () => {
        setAnchorEl(null);
    };

    const sendCommand = (cmd: PopoutItem) => {
        let args_str = cmd.args.map(item => typeof item === 'string' ? `"${item}"` : item).join(', ');
        invoke("send_mass_action", {
            addrNames: props.selected,
            action: cmd.action + "(" + args_str + ")"
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