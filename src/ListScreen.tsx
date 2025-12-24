import React, {useEffect} from "react";
import BottomToolbar from "./ToolBar.tsx";
import {CopterData, Query} from "./utils/types.ts";
import {useNavigate} from "react-router-dom";
import DroneListItem from "./components/DroneListItem";

interface ListScreenProps {
    setSelected: React.Dispatch<React.SetStateAction<string[]>>
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
    const handleToggled = (value: string) => {
        props.setSelected((prev: string[]) => {
            const currentIndex = prev.indexOf(value);
            const newChecked = [...prev];
            if (currentIndex === -1) newChecked.push(value); else newChecked.splice(currentIndex, 1);
            return newChecked;
        })
    };
    React.useEffect(() => {

        props.update_copters(); // Fetch data immediately

        // const intervalId = setInterval(props.update_copters, 500); // Fetch data every 0.5 seconds

        // return () => clearInterval(intervalId); // Clean up interval on unmount
    }, []);


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
                        <DroneListItem
                            key={item.addr}
                            copter={item}
                            isSelected={props.selected.indexOf(item.addr) !== -1}
                            onToggle={() => {
                                handleToggled(item.addr);
                            }}
                            onTune={(addr, name) => navigate("/tune", {state: {addr: addr, name: name}})}
                        />
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