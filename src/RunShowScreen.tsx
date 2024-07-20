import {CopterData, generateRandomId, send_message_to_copter} from "./App.tsx";
import {Button} from "@mui/material";

interface RunShowScreenProps {
    copters: CopterData[]
}


export default function RunShowScreen(props: RunShowScreenProps) {
    const run = async () => {
        props.copters.forEach((copter) => {
            send_message_to_copter(copter.addr, {
                method_name: "run_show",
                args: {start_ts: Date.now()}
            })
        })
    }
    return (
        <Button onClick={run}>RUN</Button>
    )
}