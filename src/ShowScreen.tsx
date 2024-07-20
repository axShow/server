import React from "react";
import {Box, Tab} from "@mui/material";
import {TabContext, TabList, TabPanel} from "@mui/lab";
import UploadScreen from "./UploadScreen.tsx";
import {CopterData} from "./App.tsx";
import RunShowScreen from "./RunShowScreen.tsx";

interface ShowScreenProps {
    copters: CopterData[]
}

export default function ShowScreen(props: ShowScreenProps) {
    const [value, setValue] = React.useState('1');
    const handleChange = (event: React.SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };
    return (
        <TabContext value={value}>
            <Box sx={{borderBottom: 1, borderColor: 'divider'}}>
                <TabList onChange={handleChange} aria-label="lab API tabs example" centered>
                    <Tab label="SEND" value="1"/>
                    <Tab label="RUN" value="2"/>
                </TabList>
            </Box>
            <TabPanel value="1"><UploadScreen copters={props.copters}/></TabPanel>
            <TabPanel value="2"><RunShowScreen copters={props.copters}/></TabPanel>
        </TabContext>
    )
}