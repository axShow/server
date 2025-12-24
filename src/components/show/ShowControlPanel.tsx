import { useState, useEffect } from "react";
import {toast} from "react-toastify";

const COLOR_VARIANTS: Record<string, { text: string, bg: string, border: string }> = {
    "blue-500": { text: "text-blue-500", bg: "bg-blue-500", border: "border-blue-500" },
    "red-500": { text: "text-red-500", bg: "bg-red-500", border: "border-red-500" },
    "green-500": { text: "text-green-500", bg: "bg-green-500", border: "border-green-500" },
    "yellow-500": { text: "text-yellow-500", bg: "bg-yellow-500", border: "border-yellow-500" },
    "purple-500": { text: "text-purple-500", bg: "bg-purple-500", border: "border-purple-500" },
    "cyan-500": { text: "text-cyan-500", bg: "bg-cyan-500", border: "border-cyan-500" },
    "white": { text: "text-white", bg: "bg-white", border: "border-white" },
};

const COLORS = [
    "blue-500",
    "red-500",
    "green-500",
    "yellow-500",
    "purple-500",
];

const DigitalDisplay = ({ name, value, initialColor }: { name: string,  value: string, initialColor: string }) => {
    const [color, setColor] = useState(initialColor);
    const background = value.replace(/[0-9]/g, '~');
    const classes = COLOR_VARIANTS[color] || { text: `text-${color}`, bg: `bg-${color}`, border: `border-${color}` };

    const cycleColor = () => {
        const currentIndex = COLORS.indexOf(color);
        const nextIndex = (currentIndex + 1) % COLORS.length;
        setColor(COLORS[nextIndex]);
    };

    return (
        <div className={`bg-black ${classes.text} p-2 rounded text-5xl grid place-items-center relative`} style={{ fontFamily: 'DSEG14-Classic' }}>
            <div
                className={`absolute top-1 right-1 w-3 h-3 rounded-full ${classes.bg} border-2 ${classes.border} cursor-pointer`}
                onClick={cycleColor}
            />
            <h3 className="font-medium mb-2 text-center text-xl" style={{ fontFamily: "serif", textShadow: "0 0 5px currentColor, 0 0 10px currentColor" }}>
                {name}
            </h3>

            <div className="col-start-1 row-start-2 opacity-35 select-none pointer-events-none">
                {background}
            </div>
            <div className="col-start-1 row-start-2 z-10" style={{ textShadow: "0 0 5px currentColor, 0 0 10px currentColor" }}>
                {value}
            </div>
        </div>
    );
};

const ChecklistItem = ({ name, caption, color, disabled, onClick }: { name: string, caption?: string, color: string, disabled?: boolean, onClick?: () => void }) => {
    const classes = COLOR_VARIANTS[color] || { bg: `bg-${color}`, text: `text-${color}`, border: `border-${color}` };
    return (
        <div
            className={`flex items-center p-3 border-b border-gray-100 last:border-0 transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
            onClick={!disabled ? onClick : undefined}
        >
            <div className="relative flex items-center justify-center w-4 h-4 mr-4 shrink-0">
                {!disabled && (
                    <span className={`absolute inline-flex h-full w-full rounded-full ${classes.bg} opacity-75 animate-ping`}></span>
                )}
                <span className={`relative inline-flex rounded-full h-3 w-3 ${classes.bg}`}></span>
            </div>
            <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-900 leading-tight">{name}</h4>
                {caption && <p className="text-xs text-gray-500 mt-0.5">{caption}</p>}
            </div>
        </div>
    );
};

export default function ShowControlPanel() {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        return date.toLocaleTimeString('ru-RU', { hour12: false });
    };

    return (
        <div className="h-full p-4 bg-gray-100 overflow-y-auto">
            {/*<h2 className="text-lg font-semibold mb-4">Timers & Checklist</h2>*/}
            <div className="space-y-4">
                <div className="p-4 bg-black rounded shadow space-y-2">
                    <div>
                        <DigitalDisplay name={"SRV"} value={formatTime(currentTime)} initialColor="blue-500" />
                    </div>
                    <div>
                        <DigitalDisplay name={"SHOW"} value="-00:00:00.0" initialColor="red-500" />
                    </div>
                </div>
                <div className="p-4 bg-white rounded shadow">
                    <h3 className="font-medium mb-2">Checklist</h3>
                    <div className="flex flex-col bg-white rounded border border-gray-100">
                        <ChecklistItem name="System Check" caption="All systems nominal" color="green-500" onClick={() => {}} />
                        <ChecklistItem name="Safety" caption="Area clear" color="yellow-500" onClick={() => toast("sdsd")} />
                        <ChecklistItem name="Arming" caption="Waiting for confirmation" color="red-500" disabled={true} />
                    </div>
                </div>
            </div>
        </div>
    );
}
