import {useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import "./App.css";
import {
    createTheme, CssBaseline,
    ThemeProvider, useMediaQuery
} from "@mui/material";
import React from "react";
import AppBottomNavigation from "./BottomNavigationBar.tsx";
import ListScreen from "./ListScreen.tsx";
import ShowScreen from "./ShowScreen.tsx";
import SetupScreen from "./SetupScreen.tsx";

export interface CopterData {
    name: string;
    battery?: number | null;
    flight_mode: string;
    controller_state: string;
}


function App() {
    const [copters, setCopters] = useState<CopterData[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [currentTab, switchTab] = React.useState<number>(1);
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: prefersDarkMode ? 'dark' : 'light',
                },
            }),
        [prefersDarkMode],
    );
    document.body.style.backgroundColor = '#00000000';

    async function update_copters() {
        setCopters((await invoke("get_connected_clients", {})));
    }

    React.useEffect(() => {
        update_copters().then(() => {}); // Fetch data immediately
        const intervalId = setInterval(update_copters, 500); // Fetch data every 0.5 seconds
        return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            {currentTab == 0 && <SetupScreen/>}
            {currentTab == 1 &&
            <ListScreen selected={selected} setSelected={setSelected}
                        copters={copters} update_copters={update_copters}/>}
            {currentTab == 2 && <ShowScreen/>}
            <AppBottomNavigation currentTab={currentTab} switchTab={switchTab}/>
        </ThemeProvider>
    );
}

export default App;
