import {Box, Button, Typography} from "@mui/material";
import {CopterData} from "./App.tsx";
import {useEffect, useState} from "react";
import {listen} from "@tauri-apps/api/event";
import {invoke} from "@tauri-apps/api/tauri";
import {FlexibleXYPlot, LabelSeries, MarkSeries, MarkSeriesPoint, RVValueEventHandler} from 'react-vis';
import {ChooseCopterDialog} from "./ChooseCopterDialog.tsx";

interface ShowScreenProps {
    copters: CopterData[]
}

interface Animation {
    animation_name: string,
    object_name: string,
    start_position: [number, number]
}
export interface DroneInAnimation {
    label: string,
    object_name: string,
    addr?: string
    x: number
    y: number
    color: string,
    xOffset: number
    yOffset: number
    size: number
}

var StringToColor = (function () {
    var instance: { stringToColorHash?: any; nextVeryDifferntColorIdx?: any; veryDifferentColors?: any; } | null = null;

    return {
        next: function stringToColor(str: string | number) {
            if (instance === null) {
                instance = {};
                instance.stringToColorHash = {};
                instance.nextVeryDifferntColorIdx = 0;
                instance.veryDifferentColors = ["#00FF00", "#0000FF", "#FF0000", "#01FFFE", "#FFA6FE", "#FFDB66", "#006401", "#010067", "#95003A", "#007DB5", "#FF00F6", "#FFEEE8", "#774D00", "#90FB92", "#0076FF", "#D5FF00", "#FF937E", "#6A826C", "#FF029D", "#FE8900", "#7A4782", "#7E2DD2", "#85A900", "#FF0056", "#A42400", "#00AE7E", "#683D3B", "#BDC6FF", "#263400", "#BDD393", "#00B917", "#9E008E", "#001544", "#C28C9F", "#FF74A3", "#01D0FF", "#004754", "#E56FFE", "#788231", "#0E4CA1", "#91D0CB", "#BE9970", "#968AE8", "#BB8800", "#43002C", "#DEFF74", "#00FFC6", "#FFE502", "#620E00", "#008F9C", "#98FF52", "#7544B1", "#B500FF", "#00FF78", "#FF6E41", "#005F39", "#6B6882", "#5FAD4E", "#A75740", "#A5FFD2", "#FFB167", "#009BFF", "#E85EBE"];
            }

            if (!instance.stringToColorHash[str])
                instance.stringToColorHash[str] = instance.veryDifferentColors[instance.nextVeryDifferntColorIdx++];

            return instance.stringToColorHash[str];
        }
    }
})();
// @ts-ignore
// const unlisten = await listen('tauri://file-drop', event => {
//     if (window.location.pathname == "/run") {
//         console.log(event.payload)
//     }
// })
export default function RunScreen(props: ShowScreenProps) {
    //const navigate = useNavigate();
    const [isHover, setIsHover] = useState(false);
    const [animations, setAnimations] = useState<Animation[]>([]);
    const [assignedDrones, setAsignedDrones] = useState<DroneInAnimation[]>([]);
    const [dialogAnObject, setDialogAnObject] = useState<DroneInAnimation|undefined>(undefined);
    const openDialog = (animationObject: DroneInAnimation) => {
        console.log("opendialog", animationObject)
        setDialogAnObject(animationObject);
    }
    const reasignAnimation = (animationObject?: DroneInAnimation, newTarget?: string) => {
        console.log("reasign", animationObject, newTarget)
        setDialogAnObject(undefined)
        if (animationObject == undefined || newTarget == undefined)  return
        let changed = assignedDrones
        let animation_index = changed.findIndex(val => val.object_name == animationObject.object_name)
        let copter_index = props.copters.findIndex(val =>  val.addr == newTarget)
        if (animation_index === -1 || copter_index === -1) return
        // if (changed.some(val => val.addr == newTarget)){
            let double = changed.find(val =>  val.addr == newTarget)
            if (double !== undefined) {
                double.addr = undefined
                double.label = double.object_name
                double.color = "rgba(255,255,255,0.11)"
            }
        // }
        console.log(changed[animation_index])
        changed[animation_index].addr = newTarget
        changed[animation_index].label = props.copters[copter_index].name
        changed[animation_index].color = StringToColor.next(animationObject.object_name)
        setAsignedDrones(changed)
        // console.log(assignedDrones)
    }
    useEffect(() => {
        const unlistenDrop = listen('tauri://file-drop', (event) => {
            console.log('Received event:', event.payload);
            invoke("get_all_files", {paths: event.payload}).then((data) => {
                let animations_files: string[] = [] as string[]
                (data as string[]).forEach((file: string) => {
                    if (file.endsWith(".axsanim")) {
                        animations_files.push(file)
                    }
                })
                invoke("parse_animations", {animationFiles: animations_files})
                    .then((r) => {
                        let animations = r as Animation[]
                        setAnimations(animations)
                        setAsignedDrones(animations.map(animation => {
                            const copter = props.copters.find(val => val.name == animation.object_name)
                            const color = copter !== undefined ? StringToColor.next(animation.object_name) : "rgba(255,255,255,0.11)";
                            // console.log(color)
                            return {
                                x: animation.start_position[0],
                                y: animation.start_position[1],
                                label: animation.object_name,
                                xOffset: 0,
                                yOffset: -15,
                                color,
                                object_name: animation.object_name,
                                addr: copter?.addr,
                                size: 5
                            }
                        }))
                    })
                    .catch((err) => console.error(err));
            });
            setIsHover(false)
        });
        const unlistenDropCancel = listen('tauri://file-drop-cancelled', (event) => {
            console.log('Received event:', event);
            setIsHover(false)
        });
        const unlistenHover = listen('tauri://file-drop-hover', (event) => {
            console.log('Received event:', event);
            setIsHover(true)
        });

        return () => {
            unlistenDrop.then(f => f());
            unlistenDropCancel.then(f => f());
            unlistenHover.then(f => f());
        };

    }, []);
    // @ts-ignore
    return (
        <Box margin={2}>
            {(animations.length == 0 || isHover) && <Box
                sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%-2',
                    height: "80vh",
                    border: `2px dashed ${isHover ? "#ccf" : "#ccc"}`,
                    borderRadius: 5,
                }}
            >
                <Typography variant="body1" sx={{color: isHover ? "#aaf" : "#aaa"}}>
                    Drag-and-drop files or folder here
                </Typography>
            </Box>}
            {(!isHover && animations.length > 0) &&
                <Box>
                    <FlexibleXYPlot height={400} margin={60}>
                        <MarkSeries data={assignedDrones} colorType="literal" onValueClick={//@ts-ignore
                            openDialog as RVValueEventHandler<MarkSeriesPoint> }/>
                        <LabelSeries allowOffsetToBeReversed data={assignedDrones} labelAnchorX={"middle"}/>
                    </FlexibleXYPlot>
                    <Button sx={{marginRight: 2}}>UPLOAD ANIMATIONS TO COPTERS</Button>
                    <Button sx={{marginRight: 2}}>RUN UPLOADED SHOW</Button>
                </Box>
            }
            <ChooseCopterDialog copters={props.copters} open={dialogAnObject !== undefined} id={"choose_copter_dialog"} onClose={reasignAnimation} value={dialogAnObject} />
        </Box>
    )

}
