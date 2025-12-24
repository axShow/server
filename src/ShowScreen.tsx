import {CopterData} from "./utils/types.ts";
import ShowTopBar from "./components/show/ShowTopBar.tsx";
import ShowControlPanel from "./components/show/ShowControlPanel.tsx";
import ShowViewPanel from "./components/show/ShowViewPanel.tsx";
import { Drone } from "./components/show/views/UAVView.tsx";

interface ShowScreenProps {
    copters: CopterData[]
}

export default function ShowScreen({ copters }: ShowScreenProps) {

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden">
            <ShowTopBar />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-2/3 border-r border-gray-300">
                    <ShowViewPanel />
                </div>
                <div className="w-1/3">
                    <ShowControlPanel />
                </div>
            </div>
        </div>
    )
}