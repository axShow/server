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
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import GenMapScreen from "./GenMapScreen.tsx";

export interface CopterData {
    name: string;
    battery?: number | null;
    flight_mode: string;
    controller_state: string;
}


function App() {
    const [copters, setCopters] = useState<CopterData[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
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

        invoke("wait_for", {});
        update_copters().then(() => {
        }); // Fetch data immediately
        const intervalId = setInterval(update_copters, 500); // Fetch data every 0.5 seconds
        return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <BrowserRouter>
                <Routes>
                    <Route path="/" element={<ListScreen selected={selected} setSelected={setSelected}
                                                         copters={copters} update_copters={update_copters}/>}/>
                    <Route path="/setup" element={<SetupScreen copters={copters}/>}/>
                    <Route path="/gen_map" element={<GenMapScreen selected={selected}/>}/>
                    <Route path="/show" element={<ShowScreen copters={copters} selected={selected}/>}/>
                </Routes>

                <AppBottomNavigation/>
            </BrowserRouter>
            {/*{currentTab == 0 && <SetupScreen/>}*/}
            {/*{currentTab == 1 &&*/}
            {/*    <ListScreen selected={selected} setSelected={setSelected}*/}
            {/*                copters={copters} update_copters={update_copters}/>}*/}
            {/*{currentTab == 2 && <ShowScreen copters={copters} selected={selected}/>}*/}
        </ThemeProvider>
    );
}

export default App;
