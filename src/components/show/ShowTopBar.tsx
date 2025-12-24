import {Functions, BatteryStd, History, Terminal} from "@mui/icons-material";
import {useStore} from "../../utils/store.ts";
import { IconButton } from "@mui/material";
import { useState } from "react";
import LogWindow from "../LogWindow.tsx";

export default function ShowTopBar() {
    const { copters } = useStore();
    const [showLog, setShowLog] = useState(false);
    const stats = {
        operating: copters.filter(d => d.state === 'OPRN').length,
        busy: copters.filter(d => d.state === 'BUSY').length,
        warn: copters.filter(d => d.state === 'WARN').length,
        critical: copters.filter(d => d.state === 'EMRG').length,
    };

    const batteryStats = {
        avg: copters.length > 0 ? (copters.reduce((acc, d) => acc + (d.battery || 0), 0) / copters.length).toFixed(2) : 0,
        min: copters.length > 0 ? Math.min(...copters.map(d => d.battery || 0)).toFixed(2) : 0
    };

    return (
        <div className="w-full h-16 bg-gray-800 text-white flex items-center px-4 shadow-md shrink-0 gap-4">
            <h1 className="text-xl font-bold mr-4">Show Status</h1>

            <div className="h-8 w-px bg-gray-600 mx-2"></div>

            <div className="flex items-center gap-6">
                <div className="flex items-center gap-2" title="Operating">
                    <div className={`w-3 h-3 rounded-full ${stats.operating > 0 ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]' : 'bg-gray-600'}`}></div>
                    <span className={`font-mono text-lg ${stats.operating === 0 ? 'text-gray-500' : ''}`}>{stats.operating}</span>
                </div>
                <div className="flex items-center gap-2" title="Busy">
                    <div className={`w-3 h-3 rounded-full ${stats.busy > 0 ? 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]' : 'bg-gray-600'}`}></div>
                    <span className={`font-mono text-lg ${stats.busy === 0 ? 'text-gray-500' : ''}`}>{stats.busy}</span>
                </div>
                <div className="flex items-center gap-2" title="Warning">
                    <div className={`w-3 h-3 rounded-full ${stats.warn > 0 ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.6)]' : 'bg-gray-600'}`}></div>
                    <span className={`font-mono text-lg ${stats.warn === 0 ? 'text-gray-500' : ''}`}>{stats.warn}</span>
                </div>
                <div className="flex items-center gap-2" title="Critical">
                    <div className={`w-3 h-3 rounded-full ${stats.critical > 0 ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]' : 'bg-gray-600'}`}></div>
                    <span className={`font-mono text-lg ${stats.critical === 0 ? 'text-gray-500' : ''}`}>{stats.critical}</span>
                </div>
            </div>



            <div className="flex items-center gap-2" title="Total Drones">
                <Functions className="text-gray-400" />
                <span className="font-mono text-lg">{copters.length}</span>
            </div>

            <div className="h-8 w-px bg-gray-600 mx-2"></div>

            <div className="flex items-center gap-2" title="Battery Status">
                <BatteryStd className="text-gray-400" />
                <div className="flex flex-col text-xs font-mono leading-tight">
                    <span className="text-gray-300">AVG: {batteryStats.avg}</span>
                    <span className="text-red-400">MIN: {batteryStats.min}</span>
                </div>
            </div>

            <div className="h-8 w-px bg-gray-600 mx-2"></div>
            <div className="h-full m-auto" />
            <div className="relative">
                <div className="flex items-center gap-2 cursor-pointer" title="System Log" onClick={() => setShowLog(!showLog)}>
                    <IconButton size="small">
                        <Terminal className={showLog ? "text-blue-400" : "text-gray-400"} />
                    </IconButton>
                </div>
                {showLog && <LogWindow onClose={() => setShowLog(false)} />}
            </div>
        </div>
    );
}
