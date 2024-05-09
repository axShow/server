import {
    Backdrop,
    Box,
    Button, CircularProgress,
     Snackbar, Stack, Step, StepIconProps, StepLabel, Stepper,
    Typography
} from "@mui/material";
import React, {useEffect, useState} from "react";
import StepConnector, {stepConnectorClasses} from '@mui/material/StepConnector';
import {styled} from "@mui/system";
import {Check} from "@mui/icons-material";
import ConnectWifiStep from "./ConnectWifiStep.tsx";
import SettingUpOffboardStep from "./SettingUpOffboardStep.tsx";
import SelectingCopterStep from "./SelectingCopterStep.tsx";
import {CopterData, Response, send_for_response, send_message_to_copter} from "./App.tsx";

const QontoConnector = styled(StepConnector)(({theme}) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
        top: 10,
        left: 'calc(-50% + 16px)',
        right: 'calc(50% + 16px)',
    },
    [`&.${stepConnectorClasses.active}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: '#784af4',
        },
    },
    [`&.${stepConnectorClasses.completed}`]: {
        [`& .${stepConnectorClasses.line}`]: {
            borderColor: '#784af4',
        },
    },
    [`& .${stepConnectorClasses.line}`]: {
        borderColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : '#eaeaf0',
        borderTopWidth: 3,
        borderRadius: 1,
    },
}));

const QontoStepIconRoot = styled('div')<{ ownerState: { active?: boolean } }>(
    ({theme, ownerState}) => ({
        color: theme.palette.mode === 'dark' ? theme.palette.grey[700] : '#eaeaf0',
        display: 'flex',
        height: 22,
        alignItems: 'center',
        ...(ownerState.active && {
            color: '#784af4',
        }),
        '& .QontoStepIcon-completedIcon': {
            color: '#784af4',
            zIndex: 1,
            fontSize: 18,
        },
        '& .QontoStepIcon-circle': {
            width: 8,
            height: 8,
            borderRadius: '50%',
            backgroundColor: 'currentColor',
        },
    }),
);

function QontoStepIcon(props: StepIconProps) {
    const {active, completed, className} = props;

    return (
        <QontoStepIconRoot ownerState={{active}} className={className}>
            {completed ? (
                <Check className="QontoStepIcon-completedIcon"/>
            ) : (
                <div className="QontoStepIcon-circle"/>
            )}
        </QontoStepIconRoot>
    );
}


const steps = ['Select copter', 'Connect to wifi', 'Setup offboard mode'];

interface SetupScreenProps {
    copters: CopterData[];
}

declare global {
    var loading: boolean;
}
var loading = window.loading;
export default function SetupScreen(props: SetupScreenProps) {
    const [choosed, setChoosed] = useState('');

    const [ssid, setSsid] = useState('');
    const [password, setPassword] = useState('');
    const [hostname, setHostname] = useState('');

    const [useOptFlow, setUseOptFlow] = useState(false);
    const [useAruco, setUseAruco] = useState(true);
    const [useRangefinder, setUseRangefinder] = useState(false);
    const [setupController, setSetupController] = useState(false);
    const [cameraOrientation, setCameraOrientation] = useState('backward');

    const [openBackdrop, setOpenBackdrop] = React.useState(false);
    const [textBackdrop, setTextBackdrop] = React.useState('Loading');
    const [snackMessage, setSnackMessage] = React.useState<string>("");

    const [skipped, setSkipped] = React.useState(new Set<number>());
    // const [loading, setLoading] = React.useState<boolean>(false);
    // const [openSnack, setOpenSnack] = React.useState<boolean>(false);

    const [activeStep, setActiveStep] = React.useState(0);
    const [wifi_connecting_step, set_wifi_connecting_step] = React.useState(0);
    const isStepOptional = (step: number) => {
        return step === 1;
    };
    // @ts-ignore
    var interval: NodeJS.Timeout | undefined = undefined;
    const isStepSkipped = (step: number) => {
        return skipped.has(step);
    };
    const handleNext = () => {
        loading = false;
        let newSkipped = skipped;
        if (activeStep == 1) {
            if (ssid == "" || password == "" || hostname == "") {
                setSnackMessage("Please enter valid wifi SSID and password")
                // setOpenSnack(true)
                return
            }
            if (!props.copters.some(val => val.addr == choosed)) {
                setSnackMessage("Copter not connected!")
                // setOpenSnack(true)
                return
            }
            setOpenBackdrop(true)
            loading = true
            send_message_to_copter(choosed, {
                method_name: "connect_wifi",
                args: {
                    ssid: ssid,
                    password: password,
                    hostname: hostname
                }
            })
            //connect to wifi
            set_wifi_connecting_step(1);
            console.warn(wifi_connecting_step)
        }
        if (activeStep == 2) {
            if (!props.copters.some(val => val.addr == choosed)) {
                setSnackMessage("Copter not connected!")
                // setOpenSnack(true)
                return
            }
            setOpenBackdrop(true)
            setTextBackdrop(`Applyng settings...`)
            loading = true
            //connect to wifi
            send_for_response(choosed, {
                method_name: "setup",
                args: {
                    optical_flow: useOptFlow,
                    rangefinder: useRangefinder,
                    enable_aruco: useAruco,
                    cam_direction: cameraOrientation,
                    setup_flight_controller: setupController
                }
            }).then((res) => {
                    let response = res as Response
                    loading = false
                    if (!response.result.result) {
                        setSnackMessage("Error when configurating. Try to setup manually!")
                    }
                }
            )
            // setTimeout(() => setOpenBackdrop(false), 1000)
        }
        interval = setInterval(
            () => {
                if (loading) return;
                setOpenBackdrop(false)
                if (isStepSkipped(activeStep)) {
                    newSkipped = new Set(newSkipped.values());
                    newSkipped.delete(activeStep);
                }
                clearInterval(interval)
                setActiveStep((prevActiveStep) => prevActiveStep + 1);
                setSkipped(newSkipped);
            }, 500
        )
    };
    useEffect(() => {
        console.warn(props.copters)
        console.warn(wifi_connecting_step)
        if (wifi_connecting_step == 1) {
            setTextBackdrop(`Waiting for changing copter settings...`)
            console.log(props.copters);
            if (!props.copters.some(val => val.addr == choosed)) {
                set_wifi_connecting_step(2);
            }
        } else if (wifi_connecting_step == 2) {
            setTextBackdrop(`Waiting for the copter to come online...
You must be connected to the same network (${ssid}) as the copter`)
            let new_copter_data = props.copters.find(v => v.name == hostname)
            if (new_copter_data != undefined && new_copter_data.addr != '') {
                set_wifi_connecting_step(0);
                console.log(new_copter_data)
                setChoosed(new_copter_data.addr)
                loading = false
            }
        }
    }, [wifi_connecting_step, props.copters])
    const handleBack = () => {
        //setLoading(false)
        loading = false
        setActiveStep((prevActiveStep) => prevActiveStep - 1);
    };

    const handleSkip = () => {
        //setLoading(false)
        loading = false
        if (!isStepOptional(activeStep)) {
            // You probably want to guard against something like this,
            // it should never occur unless someone's actively trying to break something.
            throw new Error("You can't skip a step that isn't optional.");
        }

        setActiveStep((prevActiveStep) => prevActiveStep + 1);
        setSkipped((prevSkipped) => {
            const newSkipped = new Set(prevSkipped.values());
            newSkipped.add(activeStep);
            return newSkipped;
        });
    };

    const handleReset = () => {
        setActiveStep(0);
    };

    // const handleConnect = () => {
    //     // Implement connection logic here
    //     console.log('Connecting to copter...');
    // };
    return (
        <Box margin={2}>
            <Stepper activeStep={activeStep} connector={<QontoConnector/>}>
                {steps.map((label, index) => {
                    const stepProps: { completed?: boolean } = {};
                    const labelProps: {
                        optional?: React.ReactNode;
                    } = {};
                    if (isStepSkipped(index)) {
                        stepProps.completed = false;
                    }
                    return (
                        <Step key={label} {...stepProps}>
                            <StepLabel StepIconComponent={QontoStepIcon} {...labelProps}>{label}</StepLabel>
                        </Step>
                    );
                })}
            </Stepper>
            {activeStep === steps.length ? (
                <React.Fragment>
                    <Typography sx={{mt: 2, mb: 1, margin: 5}} align={"center"}>
                        All steps completed - copter can flight in show of drones
                    </Typography>
                    <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>
                        <Box sx={{flex: '1 1 auto'}}/>
                        <Button onClick={handleReset}>Config another copter</Button>
                    </Box>
                </React.Fragment>
            ) : (
                <React.Fragment>
                    {/*<Typography>{props.copters.find(val => val.addr == choosed).battery}</Typography>*/}
                    {activeStep == 0 && <SelectingCopterStep
                        copters={props.copters} handleNext={handleNext} setChoosed={setChoosed}/>}
                    {activeStep == 1 &&
                        <ConnectWifiStep Hostname={hostname} changeHostname={setHostname} changeSSID={setSsid}
                                         changePassword={setPassword} Password={password} SSID={ssid}/>
                    }
                    {activeStep == 2 && <SettingUpOffboardStep cameraOrientation={cameraOrientation}
                                                               setCameraOrientation={setCameraOrientation}
                                                               setUseOptFlow={setUseOptFlow} useOptFlow={useOptFlow}
                                                               setSetupController={setSetupController}
                                                               setupController={setupController}
                                                               setUseAruco={setUseAruco}
                                                               setUseRangefinder={setUseRangefinder} useAruco={useAruco}
                                                               useRangefinder={useRangefinder}/>}

                    {activeStep != 0 &&
                        <Box sx={{display: 'flex', flexDirection: 'row', pt: 2}}>

                            <Button
                                color="inherit"
                                disabled={activeStep === 0}
                                onClick={handleBack}
                                sx={{mr: 1}}
                            >
                                Back
                            </Button>
                            <Box sx={{flex: '1 1 auto'}}/>
                            {isStepOptional(activeStep) && (
                                <Button color="inherit" onClick={handleSkip} sx={{mr: 1}}>
                                    Skip
                                </Button>
                            )}
                            <Button onClick={handleNext}>
                                {activeStep === steps.length - 1 ? 'Finish' : 'Next'}
                            </Button>
                        </Box>
                    }
                </React.Fragment>
            )}
            <Backdrop
                sx={{color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1}}
                open={openBackdrop}
                // onClick={handleCloseBackdrop}
            ><Stack spacing={2}
                    alignItems="center">
                <CircularProgress color="inherit"/>
                <Typography whiteSpace={"pre-wrap"} align={"center"}>{textBackdrop}</Typography>
                {/*<Button onClick={() => {*/}
                {/*    setOpenBackdrop(false)*/}
                {/*    clearInterval(interval)*/}
                {/*    loading = false*/}
                {/*}}*/}
                {/*>Close</Button>*/}
            </Stack>
            </Backdrop>
            <Snackbar
                open={snackMessage != ""}
                autoHideDuration={6000}
                onClose={() => setSnackMessage("")}
                message={snackMessage}
            />
        </Box>
    );
}