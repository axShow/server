import {BottomNavigation, BottomNavigationAction} from "@mui/material";
import {useNavigate} from "react-router-dom";
import React from "react";

interface BottomNavigationBarProps {

}

export default function AppBottomNavigation(props: BottomNavigationBarProps) {
    const navigate = useNavigate();

    const [currentTab, switchTab] = React.useState<number>(1);
    return (
        <BottomNavigation
            value={currentTab}
            onChange={(_: any, newValue: number) => {
                switch (newValue){
                    case 0:
                        navigate("/setup")
                        break
                    case 1:
                        navigate("/")
                        break
                    case 2:
                        navigate("/show")
                        break
                }

                switchTab(newValue);
            }}
            showLabels
            sx={{width: '100%', position: 'fixed', bottom: 0}}
        >
            <BottomNavigationAction label="Setup"/>
            <BottomNavigationAction label="Control"/>
            <BottomNavigationAction label="Show"/>
        </BottomNavigation>
    );
}
