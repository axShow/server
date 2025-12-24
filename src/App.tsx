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
import ToolsScreen from "./ToolsScreen.tsx";
import SetupScreen from "./SetupScreen.tsx";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import GenMapScreen from "./GenMapScreen.tsx";
// import UploadScreen from "./UploadScreen.tsx";
import TuneScreen from "./TuneScreen.tsx";
import ShowScreen from "./ShowScreen.tsx";
import {toast, ToastContainer} from "react-toastify";
import { useStore } from "./utils/store.ts";
import { CopterData, Query, Response } from "./utils/types.ts";

export function generateRandomId() {
    return Math.floor(10000000 + Math.random() * (99999999 - 10000000 + 1))
}

export function send_message_to_copter(addr: string, query: Query) {
    invoke("send_action", {
        addrName: addr,
        query: {
            id: generateRandomId(),
            method_name: query.method_name,
            args: query.args
        }
    }).catch((r) => console.error(r));
}
export async function send_for_response(addr: string, query: Query) {
        return await invoke("send_for_response", {
            addrName: addr,
            query: {
                id: generateRandomId(),
                method_name: query.method_name,
                args: query.args
            }
        })
    }
function App() {
    const { copters, setCopters } = useStore();
    const [selected, setSelected] = useState<string[]>([]);
    function setSnack(message: string) {
        toast(message);
    }
    const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
    const theme = React.useMemo(
        () =>
            createTheme({
                palette: {
                    mode: 'light',
                },
            }),
        [prefersDarkMode],
    );
    // document.body.style.backgroundColor = '#00000000';

    async function update_copters() {
        let data: CopterData[] = (await invoke("get_connected_clients", {}))
        setCopters(data);
        console.log(data)
    }

    function send_for_response(addr: string, query: Query) {
        invoke("send_for_response", {
            addrName: addr,
            query: {
                id: generateRandomId(),
                method_name: query.method_name,
                args: query.args
            }
        }).then((r) => {
            let resp = r as Response;
            if (!resp.result.result)
                setSnack('"' + query.method_name + '" command give error: ' + resp.result.details);
        }).catch((r) => console.error(r));
    }

    async function get_from_copter(addr: string, query: Query) {
        return (await invoke("send_for_response", {
            addrName: addr,
            query: {
                id: generateRandomId(),
                method_name: query.method_name,
                args: query.args ? query.args : {}
            }
        })) as Response
    }

    React.useEffect(() => {

        // invoke("wait_for", {});
        update_copters().then(); // Fetch data immediately
        const intervalId = setInterval(update_copters, 250); // Fetch data every 0.5 seconds
        return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);


    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <BrowserRouter>
                <Routes>
                    <Route path="/"
                           element={<ListScreen selected={selected} setSelected={setSelected} send={send_for_response}
                                                copters={copters} update_copters={update_copters}/>}/>
                    <Route path="/setup" element={<SetupScreen copters={copters}/>}/>
                    <Route path="/gen_map" element={<GenMapScreen selected={selected} copters={copters} show_snack={setSnack} send={get_from_copter} />}/>
                    <Route path="/tools" element={<ToolsScreen copters={copters} selected={selected}/>}/>
                    <Route path="/show" element={<ShowScreen copters={copters}/>}/>
                    <Route path="/tune" element={<TuneScreen/>}/>
                </Routes>

                <AppBottomNavigation/>


                <ToastContainer position={"bottom-right"}/>
            </BrowserRouter>
            {/*{currentTab == 0 && <SetupScreen/>}*/}
            {/*{currentTab == 1 &&*/}
            {/*    <ListScreen selected={selected} setSelected={setSelected}*/}
            {/*                copters={copters} update_copters={update_copters}/>}*/}
            {/*{currentTab == 2 && <ToolsScreen copters={copters} selected={selected}/>}*/}
        </ThemeProvider>
    );
}

export default App;
