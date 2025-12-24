import { useState, SyntheticEvent } from "react";
import { TabContext, TabList, TabPanel } from "@mui/lab";
import { Box, Tab } from "@mui/material";
import UAVView from "./views/UAVView.tsx";
import ThreeDView from "./views/ThreeDView.tsx";

export default function ShowViewPanel() {
    const [value, setValue] = useState("1");

    const handleChange = (_event: SyntheticEvent, newValue: string) => {
        setValue(newValue);
    };

    return (
        <div className="h-full flex flex-col bg-white">
            <TabContext value={value}>
                <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                    <TabList onChange={handleChange} aria-label="show views tabs">
                        <Tab label="UAV" value="1" />
                        <Tab label="View 2" value="2" />
                        <Tab label="View 3" value="3" />
                    </TabList>
                </Box>
                <TabPanel value="1" className="flex-1 overflow-hidden p-0">
                    <UAVView />
                </TabPanel>
                <TabPanel value="2" className="flex-1 overflow-auto">
                    Map
                </TabPanel>
                <TabPanel value="3" className="flex-1 overflow-hidden p-0">
                    <ThreeDView />
                </TabPanel>
            </TabContext>
        </div>
    );
}

