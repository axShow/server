import {Box, Divider, IconButton, List, ListItem, Paper, Typography} from "@mui/material";
import {CopterData} from "./App.tsx";
import {ArrowRight} from "@mui/icons-material";
import React from "react";

interface SelectingCopterProps {
    copters: CopterData[],
    handleNext: () => void,
    setChoosed: (name: string) => void
}

export default function SelectingCopterStep(props: SelectingCopterProps) {
    function handleSelect(name: string) {
        props.setChoosed(name);
        props.handleNext();
    }
    return (
        <Box margin={5}>
            <Typography gutterBottom variant={"h5"}>Select copter for configuration: </Typography>
            <List sx={{
                bgcolor: "rgba(0,0,0,0.06)", borderRadius: 2, p: 0,
                width: '100%',
                border: '1px solid',
                borderColor: 'divider',
            }}>
                {props.copters.map((copter, index) => (
                    <React.Fragment
                            key={copter.addr}>
                        <ListItem
                            sx={{margin: 1}}
                            onClick={() => handleSelect(copter.addr)}
                            secondaryAction={
                                <IconButton>
                                    <ArrowRight/>
                                </IconButton>
                            }
                        >
                            <Typography>{copter.name}</Typography>
                        </ListItem>
                        {index != props.copters.length - 1 && <Divider variant="middle" component="li"/>}
                    </React.Fragment>
                ))}
            </List>
            {props.copters.length == 0 &&
                <Paper sx={{
                    bgcolor: "rgba(0,0,0,0.06)", borderRadius: 2, p: 4,
                    width: '100%',
                    border: '1px solid',
                    borderColor: 'divider', textAlign: "center"
                }}>
                    No copters in local network
                </Paper>}
        </Box>
    );
}