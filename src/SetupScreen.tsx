import {
    Avatar,
    Box,
    Button,
    Container,
    FormControl,
    InputLabel,
    MenuItem,
    Select, SelectChangeEvent,
    TextField,
    Typography
} from "@mui/material";
import {useState} from "react";

export default function SetupScreen() {
    const [wifiName, setWifiName] = useState('');
    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');
    const [hostname, setHostname] = useState('');

    const wifiNames = ['WiFi1', 'WiFi2', 'WiFi3', "Add New"]; // Replace with actual WiFi names

    const handleWifiChange = (event: SelectChangeEvent) => {
        setWifiName(event.target.value);
    };

    const handleConnect = () => {
        // Implement connection logic here
        console.log('Connecting to copter...');
    };
    return (
        <Container maxWidth="sm">
            <div style={{display: 'flex', alignItems: 'center', marginBottom: 16, marginTop: 32}}>
                <Avatar alt="AX" src="/axshow_main.png"
                        sx={{width: 120, height: 120, marginBottom: 2, marginRight: 5, border: "2px solid #CCC"}}/>
                <Typography variant="h4" gutterBottom>
                    COPTER SHOW 1
                </Typography>
            </div>
                <div>
                    <ul style={{listStyleType: 'none', paddingLeft: 0}}>
                        <li>Подключение</li>
                        <li>Установка</li>
                        <li>Настройка</li>
                    </ul>
                </div>
            <FormControl fullWidth margin="normal">
                <InputLabel id="wifi-name-label">Select WiFi</InputLabel>
                <Select
                    labelId="wifi-name-label"
                    id="wifi-name"
                    value={wifiName}
                    label="Select WiFi"
                    onChange={handleWifiChange}
                >
                    {wifiNames.map((name) => (
                        <MenuItem key={name} value={name}>
                            {name}
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>

            <form>
                {wifiName == "Add New" && <>
                    <TextField
                        label="SSID"
                        fullWidth
                        margin="normal"
                        value={ssid}
                        onChange={(e) => setSsid(e.target.value)}
                    />
                    <TextField
                        label="Password"
                        fullWidth
                        margin="normal"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                </>
                }
                <TextField
                    label="Hostname"
                    fullWidth
                    margin="normal"
                    value={hostname}
                    onChange={(e) => setHostname(e.target.value)}
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleConnect}
                    sx={{marginTop: 2}}
                >
                    Next
                </Button>
            </form>
            <Box sx={{height: "70px"}}/>
        </Container>
    )
        ;
}