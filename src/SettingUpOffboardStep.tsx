import {
    Box,
    Checkbox,
    FormControl,
    FormControlLabel,
    FormLabel,
    Grid, Radio, RadioGroup
} from "@mui/material";
interface SettingUpOffboardStep {
    useOptFlow: boolean,
    setUseOptFlow: (val: boolean) => void,
    useAruco: boolean,
    setUseAruco: (val: boolean) => void,
    useRangefinder: boolean,
    setUseRangefinder: (val: boolean) => void,
    cameraOrientation: string,
    setCameraOrientation: (val: string) => void
    setupController: boolean,
    setSetupController: (val: boolean) => void
}

export default function SettingUpOffboardStep(props: SettingUpOffboardStep) {
    return (
        <Box margin={5}>
            <Grid container spacing={2} direction="column">
                <Grid container item>
                    <Grid item xs={4}>
                        <FormControlLabel
                            control={
                                <Checkbox value={props.useOptFlow}
                                          onChange={(e) => props.setUseOptFlow(e.target.value as unknown as boolean)}/>
                            }
                            label={"Use optical flow"}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <FormControlLabel
                            control={
                                <Checkbox value={props.useAruco}
                                          onChange={(e) => props.setUseAruco(e.target.value as unknown as boolean)}/>
                            }
                            label={"Use aruco detect"}
                        />
                    </Grid>
                    <Grid item xs={4}>
                        <FormControlLabel
                            control={
                                <Checkbox value={props.useRangefinder}
                                          onChange={(e) => props.setUseRangefinder(e.target.value as unknown as boolean)}/>
                            }
                            label={"Use rangefinder"}
                        />
                    </Grid>
                </Grid>
                <Grid item>
                    <FormControl>
                        <FormLabel id="orientation-radio-buttons-group">Camera orientation</FormLabel>
                        <RadioGroup
                            aria-labelledby={"orientation-radio-buttons-group"}
                            name="orientation-radio-buttons-group"
                            value={props.cameraOrientation}
                            row
                            onChange={(e) => {
                                props.setCameraOrientation(e.target.value)
                            }}
                        >
                            <FormControlLabel value="backward" control={<Radio/>} label="Backward"/>
                            <FormControlLabel value="forward" control={<Radio/>} label="Forward"/>
                        </RadioGroup>
                    </FormControl>
                </Grid>
                <Grid item>
                    <FormControlLabel
                        control={
                            <Checkbox value={props.setupController}
                                      onChange={(e) => props.setSetupController(e.target.value as unknown as boolean)}/>
                        }
                        label={"Change flight-controller settings"}
                    />
                </Grid>
            </Grid>
        </Box>
    );
}