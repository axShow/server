import { useState, MouseEvent, useEffect } from 'react';
import { BatteryFull, Battery90, Battery60, Battery30, BatteryAlert, FlightTakeoff, FlightLand, Home, Highlight, LockOpen, Lock, Dangerous, RestartAlt } from '@mui/icons-material';
import { Tooltip, IconButton } from '@mui/material';
import { useStore } from "../../../utils/store.ts";
import {call_function, mass_call_function} from "../../../utils/drone_api.ts";
import { toast } from "react-toastify";

export interface Drone {
    id: string;
    name: string;
    status: string;
    battery: number;
    state: 'operating' | 'busy' | 'critical' | 'warn';
}

const getBatteryIcon = (level: number) => {
    if (level >= 90) return <BatteryFull fontSize="small" />;
    if (level >= 60) return <Battery90 fontSize="small" />;
    if (level >= 30) return <Battery60 fontSize="small" />;
    if (level > 0) return <Battery30 fontSize="small" />;
    return <BatteryAlert fontSize="small" />;
};

const getStatusColor = (state: "OPRN" | "BUSY" | "CRIT" | "WARN") => {
    switch (state) {
        case 'OPRN': return 'bg-green-100 text-green-800';
        case 'BUSY': return 'bg-blue-100 text-blue-800';
        // case 'offline': return 'bg-gray-100 text-gray-800';
        case 'EMRG': return 'bg-red-100 text-red-800';
        case 'WARN': return 'bg-yellow-100 text-yellow-800';
    }
};

export default function UAVView() {
    const { copters } = useStore();

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);

    const handleTakeoff = async () => {
        await mass_call_function(Array.from(selectedIds), 'takeoff', {})
    }
    const handleRth = async () => {
        await mass_call_function(Array.from(selectedIds), 'rth', {})
    }
    const handleLand = async () => {
        await mass_call_function(Array.from(selectedIds), 'land', {})
    }
    const handleBlink = async () => {
      await mass_call_function(Array.from(selectedIds), 'led', {r: 255, g: 255, b: 255, effect: "flash"})
    }
    const handleArming = async (state: boolean) => {
        await mass_call_function(Array.from(selectedIds), 'set_arming', { state })
    }
    const handleKillSwitch = async () => {
        await mass_call_function(Array.from(selectedIds), 'kill_switch', {})
    }
    const handleRebootFCU = async () => {
        await mass_call_function(Array.from(selectedIds), 'reboot_fcu', {})
    }


    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'a') {
                e.preventDefault();
                setSelectedIds(new Set(copters.map(d => d.addr)));
                setLastSelectedId(copters[copters.length - 1]?.addr);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [copters]);

    const handleDroneClick = (id: string, e: MouseEvent) => {
        if (e.shiftKey && lastSelectedId) {
            const start = copters.findIndex(d => d.addr === lastSelectedId);
            const end = copters.findIndex(d => d.addr === id);
            const [lower, upper] = start < end ? [start, end] : [end, start];
            const rangeIds = copters.slice(lower, upper + 1).map(d => d.addr);

            setSelectedIds(prev => {
                const next = new Set(prev);
                rangeIds.forEach(rid => next.add(rid));
                return next;
            });
        } else if (e.ctrlKey || e.metaKey) {
            setSelectedIds(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id);
                else next.add(id);
                return next;
            });
            setLastSelectedId(id);
        } else {
            setSelectedIds(new Set([id]));
            setLastSelectedId(id);
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Toolbar */}
            <div className="h-12 border-b border-gray-200 flex items-center px-4 bg-gray-50 shrink-0 gap-1">
                {/*<span className="font-semibold text-gray-600 mr-2">Tools:</span>*/}

                <Tooltip title="Takeoff">
                    <IconButton size="small" onClick={handleTakeoff}><FlightTakeoff /></IconButton>
                </Tooltip>
                <Tooltip title="Return to Home">
                    <IconButton size="small" onClick={handleRth}><Home /></IconButton>
                </Tooltip>
                <Tooltip title="Land">
                    <IconButton size="small" onClick={handleLand}><FlightLand /></IconButton>
                </Tooltip>
                <Tooltip title="Blink">
                    <IconButton size="small" onClick={handleBlink}><Highlight /></IconButton>
                </Tooltip>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                <Tooltip title="Arm">
                    <IconButton size="small" color="primary" onClick={() => handleArming(true)}><LockOpen /></IconButton>
                </Tooltip>
                <Tooltip title="Disarm">
                    <IconButton size="small" color="warning" onClick={() => handleArming(false)}><Lock /></IconButton>
                </Tooltip>
                <Tooltip title="Kill Switch">
                    <IconButton size="small" color="error" onClick={handleKillSwitch}><Dangerous /></IconButton>
                </Tooltip>

                <div className="w-px h-6 bg-gray-300 mx-2"></div>

                <Tooltip title="Reboot FCU">
                    <IconButton size="small" onClick={handleRebootFCU}><RestartAlt /></IconButton>
                </Tooltip>

                <div className="flex-1"></div>
                <span className="text-sm text-gray-500">
                    {selectedIds.size > 0 ? `Selected: ${selectedIds.size} / ` : ''}
                    Total: {copters.length}
                </span>
            </div>

            {/* Grid */}
            <div className="flex-1 p-4 overflow-y-auto bg-gray-100" onClick={() => setSelectedIds(new Set())}>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 xxl:grid-cols-6 gap-4" onClick={e => e.stopPropagation()}>
                    {copters.map(drone => {
                        const isSelected = selectedIds.has(drone.addr);
                        return (
                            <div
                                key={drone.addr}
                                className={`bg-white p-3 rounded-lg shadow-sm border flex flex-col items-center justify-between h-32 hover:shadow-md transition-shadow cursor-pointer select-none ${isSelected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'}`}
                                onClick={(e) => handleDroneClick(drone.addr, e)}
                            >
                                <div className="font-bold text-gray-800">{drone.name}</div>

                                <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${getStatusColor(drone.state)}`}>
                                    {drone.status}
                                </div>

                                <div className="flex items-center text-green-600 mt-2">
                                    {getBatteryIcon(drone.battery || 0)}
                                    <span className="font-medium text-sm ml-1">{drone.battery?.toFixed(2)}V</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

