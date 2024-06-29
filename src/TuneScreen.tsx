import {
    Box, Button,
    Checkbox,
    CircularProgress,
    FormControlLabel,
    FormGroup, Grid,
    IconButton,
    Paper,
    Stack, TextField,
    Typography
} from "@mui/material";
import {Query, Response} from "./App.tsx";
import {useLocation, useNavigate} from "react-router-dom";
import {ArrowBack} from "@mui/icons-material";
import React, {Fragment, useEffect, useState} from "react";

interface TuneScreenProps {
    send: (addr: string, query: Query) => Promise<Response>
    show_snack: (msg: string) => void
}

/*
* Если коптер нестабильно удерживает позицию по VPE, попробуйте увеличить коэффициенты P PID-регулятора по скорости – параметры MPC_XY_VEL_P и MPC_Z_VEL_P.
* Если коптер нестабильно удерживает высоту, попробуйте увеличить коэффициент MPC_Z_VEL_P или лучше подобрать газ висения – MPC_THR_HOVER.
* ----Настройка коэффициента P----
* Коэффициент P (пропорциональный) используется для минимизации ошибки отслеживания и отвечает за скорость отклика, по этому должен быть установлен как можно выше, но без осцилляций.
* При настройке коэффициента P пользуйтесь двумя основными наблюдениями:
* - Если P слишком большой: вы увидите высокочастотные осцилляции.
* - Если P слишком маленький: Аппарат медленно реагирует на входящее управление
* В режиме ACRO аппарат будет постоянно дрейфовать и вам нужно будет его корректировать, чтобы сохранить его уровень.
* -----Настройка коэффициента D----
* Коэффициент D (дифференциальный) используется для демпфирования. Этот коэффициент должен быть как можно выше, но таким образом, что бы не было "перестрелов" по управлению.
* При настройке коэффициента D пользуйтесь двумя основными наблюдениями:
* - Если D слишком большой: моторы могут подергиваться и сильно нагреваться во время полета, поскольку коэффициент D увеличивает шумы управления.
* - Если D слишком маленький: возникнут "перестрелы" по входящему управляющему сигналу.
* ----Настройка коэффициента I----
* Коэффициент I сохраняет "воспоминания" об ошибке. Это значит, что элемент I увеличивается в случае, если желаемая скорость не устанавливается в течении некоторого времени. Этот параметр важен для режима ACRO, а также оказывает достаточно сильное влияние на режимы POSITION и OFFBOARD.
* - Если I слишком большой: вы можете увидеть медленные осцилляции
* - Если I слишком маленький: можно заметить ошибку по выполнению управляющего воздействия. Также заниженный коэффициент I заметен на логах, это характеризуется тем, что на графиках желаемая скорость длительное время отличается от фактической.
* */
interface LpeFuses {
    GPS: boolean,
    OpticalFlow: boolean,
    VisionPosition: boolean,
    LandingTarget: boolean,
    LandDetector: boolean,
    PubAglAsLposDown: boolean,
    FlowGyroCompensation: boolean,
    Baro: boolean
}

interface Coefficients {
    MC_ROLLRATE_P: number
    MC_ROLLRATE_I: number
    MC_ROLLRATE_D: number
    MC_PITCHRATE_P: number
    MC_PITCHRATE_I: number
    MC_PITCHRATE_D: number
    MPC_XY_VEL_P: number
    MPC_Z_VEL_P: number
    MPC_THR_HOVER: number
}

interface TuningData {
    lpe_fusion: LpeFuses,
    coefficients: Coefficients
}

export default function TuneScreen(props: TuneScreenProps) {
    const location = useLocation()
    const navigate = useNavigate()
    const [startData, setStartData] = useState<TuningData | null>(null)
    const [modifiedData, setModifiedData] = useState<TuningData | null>(null)
    useEffect(() => {
        props.send(location.state.addr, {method_name: "get_tune_params"}).then(data => {
                if (!data.result.result) {
                    props.show_snack("Error retreiving params: " + data.result.details)
                    return
                }
                setStartData(data.result.payload as TuningData)
                setModifiedData(data.result.payload as TuningData)
                console.log(data.result.payload)
            }
        )
    }, []);
    const applyParams = async () => {
        const result = await props.send(location.state.addr, {method_name: "set_tune_params", args: modifiedData})
        if (result.result.result) {
            props.show_snack("Succesfully applied!")
        }
        else {
            props.show_snack("Error when applying: " + result.result.details)
        }
    }
    const handleChangeLPE = (event: React.ChangeEvent<HTMLInputElement>) => {
        let data = modifiedData
        if (data === null) return
        data.lpe_fusion[event.target.name as keyof LpeFuses] = event.target.checked
        setModifiedData(data)
    }
    const setCoeffValue = (event: React.ChangeEvent<HTMLInputElement>) => {
        let data = modifiedData
        if (data === null) return
        data.coefficients[event.target.name as keyof Coefficients] = Number(event.target.value)
        setModifiedData(data)
    }
    return (<Fragment>
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column'
            }}
        >
            <Stack direction={"row"} margin={1} alignItems={"center"}>
                <IconButton onClick={() => navigate(-1)}>
                    <ArrowBack/>
                </IconButton>
                <Typography marginLeft={1} variant={"h5"}>Tune copter "{location.state.name}"</Typography>
            </Stack>
            {modifiedData ? <Box>
                <Paper sx={{margin: 2, padding: 2}}>
                    <Typography variant={"h6"} gutterBottom>P coefficient</Typography>
                    <Typography marginLeft={2} gutterBottom>Коэффициент P (пропорциональный) используется для
                        минимизации ошибки
                        отслеживания и отвечает за скорость отклика, по этому должен быть установлен как можно выше,
                        но
                        без
                        осцилляций.</Typography>
                    <Typography variant={"caption"} marginLeft={3}>
                        - Если P слишком большой: вы увидите высокочастотные осцилляции.
                    </Typography>
                    <br/>
                    <Typography variant={"caption"} marginLeft={3}>
                        - Если P слишком маленький: Аппарат медленно реагирует на входящее управление, а в режиме
                        ACRO
                        аппарат будет постоянно дрейфовать и вам нужно будет его корректировать, чтобы
                        сохранить его уровень.
                    </Typography>
                    <Grid sx={{marginTop: 2}} container spacing={2}>
                        <Grid item xs={2}>
                    <TextField label="ROLLRATE" type={"number"} value={modifiedData.coefficients.MC_ROLLRATE_P}
                               InputProps={{ inputProps: { min: 0.001, max: 1, step: 0.001 } }}
                               variant="outlined" onChange={setCoeffValue} name={"MC_ROLLRATE_P"}/>
                        </Grid>
                        <Grid item xs={2}>
                    <TextField label="PITCHRATE" type={"number"} value={modifiedData.coefficients.MC_PITCHRATE_P}
                               InputProps={{ inputProps: { min: 0.001, max: 1, step: 0.001 } }}
                               variant="outlined" onChange={setCoeffValue} name={"MC_PITCHRATE_P"}/>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper sx={{margin: 2, padding: 2}}>
                    <Typography variant={"h6"} gutterBottom>D coefficient</Typography>
                    <Typography marginLeft={2} gutterBottom>Коэффициент D (дифференциальный) используется для
                        демпфирования. Этот
                        коэффициент должен быть как можно выше, но таким образом, что бы не было "перестрелов" по
                        управлению.</Typography>
                    <Typography variant={"caption"} marginLeft={3}>
                        - Если D слишком большой: моторы могут подергиваться и сильно нагреваться во время полета,
                        поскольку
                        коэффициент D увеличивает шумы управления.
                    </Typography>
                    <br/>
                    <Typography variant={"caption"} marginLeft={3}>
                        - Если D слишком маленький: возникнут "перестрелы" по входящему управляющему сигналу.
                    </Typography>
                    <Grid sx={{marginTop: 2}} container spacing={2}>
                        <Grid item xs={2}>
                            <TextField label="ROLLRATE" type={"number"} value={modifiedData.coefficients.MC_ROLLRATE_D}
                                       InputProps={{ inputProps: { min: 0.001, max: 1, step: 0.001 } }}
                                       variant="outlined" onChange={setCoeffValue} name={"MC_ROLLRATE_D"}/>
                        </Grid>
                        <Grid item xs={2}>
                            <TextField label="PITCHRATE" type={"number"}
                                       value={modifiedData.coefficients.MC_PITCHRATE_D}
                                       InputProps={{ inputProps: { min: 0.001, max: 1, step: 0.001 } }}
                                       variant="outlined" onChange={setCoeffValue} name={"MC_PITCHRATE_D"}/>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper sx={{margin: 2, padding: 2}}>
                    <Typography variant={"h6"} gutterBottom>I coefficient</Typography>
                    <Typography marginLeft={2} gutterBottom>Коэффициент I сохраняет "воспоминания" об ошибке. Это
                        значит, что элемент I
                        увеличивается в случае, если желаемая скорость не устанавливается в течении некоторого
                        времени.
                        Этот
                        параметр важен для режима ACRO, а также оказывает достаточно сильное влияние на режимы
                        POSITION
                        и
                        OFFBOARD.</Typography>
                    <Typography variant={"caption"} marginLeft={3}>
                        - Если I слишком большой: вы можете увидеть медленные осцилляции
                    </Typography>
                    <br/>
                    <Typography variant={"caption"} marginLeft={3}>
                        - Если I слишком маленький: можно заметить ошибку по
                        выполнению управляющего воздействия. Также заниженный коэффициент I заметен на логах, это
                        характеризуется тем, что на графиках желаемая скорость длительное время отличается от
                        фактической.
                    </Typography>
                    <Grid sx={{marginTop: 2}} container spacing={2}>
                        <Grid item xs={2}>
                            <TextField label="ROLLRATE" type={"number"}
                                       value={modifiedData.coefficients.MC_ROLLRATE_I}
                                       InputProps={{ inputProps: { min: 0.001, max: 1, step: 0.001 } }}
                                       variant="outlined" onChange={setCoeffValue} name={"MC_ROLLRATE_I"}/>
                        </Grid>
                        <Grid item xs={2}>
                            <TextField label="PITCHRATE" type={"number"}
                                       value={modifiedData.coefficients.MC_PITCHRATE_I}
                                       InputProps={{ inputProps: { min: 0.001, max: 1, step: 0.001 } }}
                                       variant="outlined" onChange={setCoeffValue} name={"MC_PITCHRATE_I"}/>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper sx={{margin: 2, padding: 2}}>
                    <Typography variant={"h6"} gutterBottom>Holding position</Typography>
                    <Typography marginLeft={2} gutterBottom>
                        Если коптер нестабильно удерживает позицию в POSCTL и OFFBOARD, попробуйте изменить эти
                        коэффициенты
                    </Typography>
                    <Grid sx={{marginTop: 2}} container spacing={2}>
                        <Grid item xs={2}>
                            <TextField label={"XY_VEL_P"} type={"number"}
                                       value={modifiedData.coefficients.MPC_XY_VEL_P} variant="outlined"
                                       InputProps={{ inputProps: { min: 0.001, max: 1, step: 0.001 } }}
                                       onChange={setCoeffValue} name={"MPC_XY_VEL_P"}/>
                        </Grid>
                        <Grid item xs={2}>
                            <TextField label={"Z_VEL_P"} type={"number"}
                                       value={modifiedData.coefficients.MPC_Z_VEL_P} variant="outlined"
                                       InputProps={{ inputProps: { min: 0.001, max: 1, step: 0.001 } }}
                                       onChange={setCoeffValue} name={"MPC_Z_VEL_P"}/>
                        </Grid>
                        <Grid item xs={2}>
                            <TextField label={"THR_HOVER"} type={"number"}
                                       value={modifiedData.coefficients.MPC_THR_HOVER} variant="outlined"
                                       InputProps={{ inputProps: { min: 0.001, max: 1, step: 0.001 } }}
                                       onChange={setCoeffValue} name={"MPC_THR_HOVER"}/>
                        </Grid>
                    </Grid>
                </Paper>
                <Paper sx={{margin: 2, padding: 2}}>
                    <Typography variant={"h6"} gutterBottom>LPE Fusion</Typography>
                    <Typography marginLeft={2} gutterBottom>
                        Параметры по которым полетный контроллер рассчитывает локальную позицию
                    </Typography>
                    <FormGroup row>
                        {Object.entries(modifiedData.lpe_fusion).map(([obj]) => {
                                return <FormControlLabel key={obj}
                                                         control={<Checkbox
                                                             checked={modifiedData.lpe_fusion[obj as keyof LpeFuses]}
                                                             name={obj}
                                                             onChange={handleChangeLPE}/>}
                                                         label={obj}/>
                            }
                        )}
                    </FormGroup>
                </Paper>
                <Button onClick={applyParams}>Apply</Button>
            </Box> :
                <Box
                sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: "center",
                justifyContent: "center",
                alignContent: "center",
                height: "80vh"
            }}
        >

            <CircularProgress/>
            <Typography marginTop={2}>Retrieving parameters...</Typography>
        </Box>}
    </Box>
    <Box height={60}/>
</Fragment>
)
}