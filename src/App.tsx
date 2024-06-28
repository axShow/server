import {useState} from "react";
import {invoke} from "@tauri-apps/api/tauri";
import "./App.css";
import {
    createTheme, CssBaseline, Snackbar,
    ThemeProvider, useMediaQuery
} from "@mui/material";
import React from "react";
import AppBottomNavigation from "./BottomNavigationBar.tsx";
import ListScreen from "./ListScreen.tsx";
import ShowScreen from "./ShowScreen.tsx";
import SetupScreen from "./SetupScreen.tsx";
import {BrowserRouter, Route, Routes} from 'react-router-dom';
import GenMapScreen from "./GenMapScreen.tsx";
import RunScreen from "./RunScreen.tsx";
import TuneScreen from "./TuneScreen.tsx";

export interface CopterData {
    addr: string;
    name: string;
    battery?: number | null;
    flight_mode: string;
    controller_state: string;
}

export interface Query {
    method_name: string;
    args?: any;
}

export interface Response {
    id: number;
    result: {
        result: boolean;
        details: string;
        payload?: unknown
    };
}

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
    const [copters, setCopters] = useState<CopterData[]>([]);
    const [selected, setSelected] = useState<string[]>([]);
    const [snack, setSnack] = useState<string>("");
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
        let data: CopterData[] = (await invoke("get_connected_clients", {}))
        setCopters(data);
        // console.log(data)
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
                    <Route path="/show" element={<ShowScreen copters={copters} selected={selected}/>}/>
                    <Route path="/run" element={<RunScreen copters={copters}/>}/>
                    <Route path="/tune" element={<TuneScreen send={get_from_copter} show_snack={setSnack}/>}/>
                </Routes>

                <AppBottomNavigation/>

                <Snackbar
                    open={snack != ""}
                    autoHideDuration={3000}
                    onClose={() => setSnack("")}
                    message={snack}
                />
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
