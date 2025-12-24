import React from "react";
import BatteryFullIcon from "@mui/icons-material/BatteryFull";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import GamepadIcon from "@mui/icons-material/Gamepad";
import FlightTakeoffIcon from "@mui/icons-material/FlightTakeoff";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import {ArrowDropDown, ArrowRight, ColorLens, LocationOn, Tune} from "@mui/icons-material";
import {CopterData} from "../App.tsx";
import {call_function} from "../utils/drone_api.ts";

export interface DroneListItemProps {
    copter: CopterData;
    isSelected: boolean;
    onToggle: () => void;
    onTune: (addr: string, name: string) => void;
}

export default function DroneListItem(props: DroneListItemProps) {
    const [isAdvanced, setIsAdvanced] = React.useState<boolean>(false);
    const [takeoffLoading, setTakeoffLoading] = React.useState<boolean>(false);

    function getControllerState(controller_state: string) {
        switch (controller_state) {
            case "True":
                return "OK";
            case "False":
                return "NO FCU";
            default:
                return controller_state;
        }
    }

    const {copter, isSelected, onToggle, onTune} = props;
    const onTakeoff = async () => {
        setTakeoffLoading(true);
        await call_function(copter.addr, "takeoff", {})
        setTakeoffLoading(false);
    }
    const onFlashLed = async () => {
        await call_function(copter.addr, "led", {r: 255, g: 255, b: 255, effect: "flash"})
    }
    return (
        <div key={copter.addr}
             className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200">
            <div className="p-4">
                <div className="flex items-center space-x-3">
                    <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={onToggle}
                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded"
                    />

                    <button
                        onClick={() => setIsAdvanced((prev) => !prev)}
                        className="p-1 text-gray-500 hover:text-gray-700 transition-colors"
                    >
                        {isAdvanced ?
                            <ArrowDropDown className="w-5 h-5"/> :
                            <ArrowRight className="w-5 h-5"/>
                        }
                    </button>

                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {copter.name}
                        </h3>

                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            {copter.battery !== null && (
                                <div className="flex items-center space-x-1">
                                    <BatteryFullIcon className="w-4 h-4 text-green-500"/>
                                    <span className="font-medium">{copter.battery?.toFixed(2)}V</span>
                                </div>
                            )}

                            <div className="flex items-center space-x-1">
                                <CheckCircleOutlineIcon className="w-4 h-4 text-blue-400"/>
                                <span>{getControllerState(copter.status)}</span>
                            </div>

                            {copter.flight_mode !== null && (
                                <div className="flex items-center space-x-1">
                                    <GamepadIcon className="w-4 h-4 text-purple-400"/>
                                    <span>{copter.flight_mode}</span>
                                </div>
                            )}

                            <button
                                onClick={() => onTune(copter.addr, copter.name)}
                                className="flex items-center space-x-1 text-blue-600 hover:text-blue-400 transition-colors"
                            >
                                <Tune className="w-4 h-4"/>
                                <span className="underline">TUNE</span>
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center space-x-2">
                        <button
                            onClick={onTakeoff}
                            className="p-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200 shadow-sm"
                            title="Takeoff"
                        >
                            {!takeoffLoading ? <FlightTakeoffIcon className="w-5 h-5"/> : <div className="h-6 w-6 animate-spin rounded-full border-3 border-solid border-white border-t-transparent" />}
                        </button>

                        <button
                            onClick={onFlashLed}
                            className="p-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors duration-200 shadow-sm"
                            title="Flash LED"
                        >
                            <FlashOnIcon className="w-5 h-5"/>
                        </button>
                    </div>
                </div>

                {isAdvanced && (
                    <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <LocationOn className="w-4 h-4 text-blue-500"/>
                                <span>
                                    X: {copter.x.toFixed(3)} Y: {copter.y.toFixed(3)} Z: {copter.z.toFixed(3)}
                                </span>
                            </div>
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <ColorLens className="w-4 h-4 text-purple-500"/>
                                <span>RGB: {copter.color.toString()}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

