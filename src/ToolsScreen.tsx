import {Box, Button} from "@mui/material";
import {CopterData} from "./App.tsx";
import {useNavigate} from "react-router-dom";

interface ShowScreenProps {
    selected: string[]
    copters: CopterData[]
}
export default function ToolsScreen(props: ShowScreenProps){
    const navigate = useNavigate();
    // console.log(props.copters)
    props
    return (
        <Box justifyContent="center" alignItems="center">
            <Button fullWidth={true} sx={{marginTop: 1, marginBottom: 1}} onClick={()=>navigate("/gen_map")}>Generate map</Button>
            <Button fullWidth={true} sx={{marginTop: 1, marginBottom: 1}} onClick={()=>navigate("/run")}>Run show</Button>
        </Box>
    )

}