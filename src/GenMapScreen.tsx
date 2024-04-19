import {
    Container, Slider
} from "@mui/material";
import {FC, useEffect, useState} from "react";
import * as jsaruco2 from 'js-aruco'; // Assuming js-aruco2 is installed
import 'js-aruco/src/dictionaries/aruco_default.js'; // Assuming js-aruco2 is installed

interface GenMapScreenProp {
    startId: number;
    xNum: number;
    yNum: number;
    cellSize?: number; // Optional cell size for customization
    margin?: number; // Optional margin for spacing
    onArucoCodeGenerated?: (arucoCode: string) => void; // Optional callback for Aruco code generation
}

export default function GenMapScreen(props: GenMapScreenProp) {
    const [arucoCodes, setArucoCodes] = useState<number[][]>([]);
    const [xNum, setXNum] = useState<number>(2);
    const [yNum, setYNum] = useState<number>(2);

    useEffect(() => {
        const generateArucoCodes = () => {
            const codes: number[][] = [];
            for (let y = 0; y < yNum; y++) {
                codes.push([]);
                for (let x = 0; x < xNum; x++) {
                    const id = props.startId + (y * xNum) + x;
                    codes[y].push(id);
                    if (props.onArucoCodeGenerated) {
                        props.onArucoCodeGenerated(id.toString()); // Call the callback for each generated code
                    }
                }
            }
            setArucoCodes(codes);
        };

        generateArucoCodes();
    }, [props.startId, xNum, yNum, props.onArucoCodeGenerated]); // Re-generate on prop changes


    return (
        <>
            <table>
            <tbody>
            {arucoCodes.map((row, rowIndex) => (
                <tr key={rowIndex}>
                    {row.map((code, colIndex) => (
                        <td
                            key={`${rowIndex}-${colIndex}`}
                            style={{
                                width: 250,
                                height: 250,
                                margin: 10,
                                border: '1px solid black',
                            }}
                        >
                            <ArucoMarkerElement markerId={code}/>
                        </td>
                    ))}
                </tr>
            ))}
            </tbody>
        </table>
        <Slider name={"X"} onChange={(_e,newValue) => {setXNum(newValue)}}/>
        <Slider name={"Y"} onChange={(_e,newValue) => {setYNum(newValue)}}/>
    </>
    );
};

interface ArucoMarkerProps {
    dictionary?: string;
    markerId: number;
}

const ArucoMarkerElement: FC<ArucoMarkerProps> = ({dictionary = "ARUCO_4X4_1000", markerId}) => {
    var dict = new jsaruco2.AR.Dictionary(dictionary);
    var svg = dict.generateSVG(markerId);
    return (
        <div dangerouslySetInnerHTML={{__html: svg}}/>
    );
};
