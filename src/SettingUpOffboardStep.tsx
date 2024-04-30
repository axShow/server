import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid,
    InputLabel,
    MenuItem, Radio, RadioGroup,
    Select
} from "@mui/material";
import React from "react";
interface SettingUpOffboardStep {
    useOptFlow: boolean,
    setUseOptFlow: (val: boolean) => void,
    cameraOrientation: string,
    setCameraOrientation: (val: string) => void
    setupController: boolean,
    setSetupController: (val: boolean) => void
}
export default function SettingUpOffboardStep(props: SettingUpOffboardStep) {
    return (
        <Box margin={5}>
            <Grid container spacing={2} direction="column">
                <Grid item>
                    <FormControlLabel
                        control={
                            <Checkbox value={props.useOptFlow} onChange={(e) => props.setUseOptFlow(e.target.value as unknown as boolean)}/>
                        }
                        label={"Use optical flow"}
                    />
                </Grid>
                <Grid item>
                <FormControl>
                    <FormLabel id="orientation-radio-buttons-group">Camera orientation</FormLabel>
                    <RadioGroup
                        aria-labelledby={"orientation-radio-buttons-group"}
                        name="orientation-radio-buttons-group"
                        value={props.cameraOrientation}
                        row
                        onChange={(e) => {props.setCameraOrientation(e.target.value)}}
                    >
                        <FormControlLabel value="backward" control={<Radio/>} label="Backward"/>
                        <FormControlLabel value="forward" control={<Radio/>} label="Forward"/>
                    </RadioGroup>
                </FormControl>
                </Grid>
                <Grid item>
                    <FormControlLabel
                        control={
                            <Checkbox value={props.setupController} onChange={(e) => props.setSetupController(e.target.value as unknown as boolean)}/>
                        }
                        label={"Change flight-controller settings"}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}