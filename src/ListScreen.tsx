import React, {useEffect, useState} from "react";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GamepadIcon from "@mui/icons-material/Gamepad";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import BottomToolbar from "./ToolBar.tsx";
import {CopterData, Query} from "./App.tsx";
import {useNavigate} from "react-router-dom";
import {ArrowDropDown, ArrowRight, ColorLens, LocationOn, Tune} from "@mui/icons-material";

interface ListScreenProps {
    setSelected: (selected: string[]) => void
    selected: string[]
    update_copters: () => void
    send: (addr: string, query: Query) => void
    copters: CopterData[]
}

export default function ListScreen(props: ListScreenProps) {
    const handleUnselect = () => {
        props.setSelected([]);
    };
    
    const handleSelectAll = () => {
        props.setSelected(props.copters.map(copter => copter.addr));
    };
    
    const navigate = useNavigate()
    const handleToggle = (value: string) => () => {
        const currentIndex = props.selected.indexOf(value);
        const newChecked = [...props.selected];

        if (currentIndex === -1) {
            newChecked.push(value);
        } else {
            newChecked.splice(currentIndex, 1);
        }

        props.setSelected(newChecked);
    };
    const [advancedView, setAdvancedView] = useState<string | undefined>(undefined)
    React.useEffect(() => {

        props.update_copters(); // Fetch data immediately

        // const intervalId = setInterval(props.update_copters, 500); // Fetch data every 0.5 seconds

        // return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);


    function getControllerState(controller_state: string) {
        switch (controller_state) {
            case "True":
                return "OK"
            case "False":
                return "NO FCU"
            default:
                return controller_state
        }
    }

    const showAdvanced = (addr: string) => {
        if (addr == advancedView) {
            setAdvancedView(undefined)
            return
        }
        setAdvancedView(addr)
    }

    useEffect(() => {
        // console.log("changed")
        props.selected.forEach((copter) => {
            // console.log(copter)
            if (!props.copters.some((v) => v.addr == copter)) {
                // console.log("deleting")
                props.setSelected(props.selected.filter(e => e !== copter))
            }
        })
        // console.log(props.selected)
    }, [props.copters.length]);
    
    return (
        <div className="flex flex-col h-screen bg-gray-50">
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {props.copters.map((item) => (
                        <div key={item.addr} className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
                            <div className="p-4">
                                <div className="flex items-center space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={props.selected.indexOf(item.addr) !== -1}
                                        onChange={handleToggle(item.addr)}
                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                                    />
                                    
                                    <button 
                                        onClick={() => showAdvanced(item.addr)}
                                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                        {advancedView == item.addr ? 
                                            <ArrowDropDown className="w-5 h-5" /> : 
                                            <ArrowRight className="w-5 h-5" />
                                        }
                                    </button>
                                    
                                    <div className="flex-1">
                                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                            {item.name}
                                        </h3>
                                        
                                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                                            {item.battery !== null && (
                                                <div className="flex items-center space-x-1">
                                                    <BatteryFullIcon className="w-4 h-4 text-green-500" />
                                                    <span className="font-medium">{item.battery?.toFixed(2)}V</span>
                                                </div>
                                            )}
                                            
                                            <div className="flex items-center space-x-1">
                                                <CheckCircleOutlineIcon className="w-4 h-4 text-blue-500" />
                                                <span>{getControllerState(item.controller_state)}</span>
                                            </div>
                                            
                                            {item.flight_mode !== null && (
                                                <div className="flex items-center space-x-1">
                                                    <GamepadIcon className="w-4 h-4 text-purple-500" />
                                                    <span>{item.flight_mode}</span>
                                                </div>
                                            )}
                                            
                                            <button 
                                                onClick={() => navigate("/tune", {
                                                    state: {
                                                        addr: item.addr,
                                                        name: item.name
                                                    }
                                                })}
                                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 transition-colors"
                                            >
                                                <Tune className="w-4 h-4" />
                                                <span className="underline">TUNE</span>
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => props.send(item.addr, {
                                                method_name: "takeoff",
                                                args: {}
                                            })}
                                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm"
                                            title="Takeoff"
                                        >
                                            <FlightTakeoffIcon className="w-5 h-5" />
                                        </button>
                                        
                                        <button
                                            onClick={() => {
                                                props.send(
                                                    item.addr,
                                                    {
                                                        method_name: "led",
                                                        args: {
                                                            r: 255,
                                                            g: 255,
                                                            b: 255,
                                                            effect: "flash"
                                                        }
                                                    }
                                                )
                                            }}
                                            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 shadow-sm"
                                            title="Flash LED"
                                        >
                                            <FlashOnIcon className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>
                                
                                {advancedView == item.addr && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <LocationOn className="w-4 h-4 text-blue-500" />
                                                <span>
                                                    X: {item.x.toFixed(3)} Y: {item.y.toFixed(3)} Z: {item.z.toFixed(3)}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <ColorLens className="w-4 h-4 text-purple-500" />
                                                <span>RGB: {item.color.toString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                
                {props.copters.length == 0 && (
                    <div className="flex flex-col items-center justify-center py-16">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Нет подключенных коптеров</h3>
                        <p className="text-gray-500 text-center">Проверьте подключение к сети и попробуйте обновить страницу</p>
                    </div>
                )}
                
                <div className={`${props.selected.length >= 1 ? 'h-32' : 'h-10'}`} />
            </div>
            
            {props.selected.length >= 1 && (
                <BottomToolbar 
                    handleUnselect={handleUnselect} 
                    handleSelectAll={handleSelectAll}
                    selected={props.selected}
                />
            )}
        </div>
    );
}