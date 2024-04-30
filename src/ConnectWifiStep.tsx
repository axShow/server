import {Box, Button, Grid, TextField, Typography} from "@mui/material";
import {useEffect} from "react";
interface ConnectWifiStepProps {
    changeSSID: (val: string) => void
    changePassword: (val: string) => void
    changeHostname: (val: string) => void
    SSID: string
    Password: string
    Hostname: string
}
export default function ConnectWifiStep(props: ConnectWifiStepProps) {
    return (
        <Box margin={5}>
            <Typography gutterBottom>Connect your copter to wifi:</Typography>
            <Grid container spacing={2}>
                <Grid item xs={4}>
                    <TextField required value={props.SSID} onChange={(e) => props.changeSSID(e.target.value)} fullWidth label="SSID" variant="outlined"/>
                </Grid>
                <Grid item xs={4}>
                    <TextField required value={props.Password} onChange={(e) => props.changePassword(e.target.value)} fullWidth label="Password" variant="outlined" type="password"/>
                </Grid>
                <Grid item xs={4}>
                    <TextField value={props.Hostname} onChange={(e) => props.changeHostname(e.target.value)} fullWidth label="HostName" variant="outlined"/>
                </Grid>
            </Grid>

        </Box>
    );
}