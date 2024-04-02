import {BottomNavigation, BottomNavigationAction} from "@mui/material";

interface BottomNavigationBarProps {
    switchTab: (tab: number) => void,
    currentTab: number
}
export default function AppBottomNavigation(props: BottomNavigationBarProps) {

  return (
    <BottomNavigation
      value={props.currentTab}
      onChange={(_: any, newValue: number) => {
        props.switchTab(newValue);
      }}
      showLabels
      sx={{ width: '100%', position: 'fixed', bottom: 0 }}
    >
      <BottomNavigationAction label="Setup" />
      <BottomNavigationAction label="Control" />
      <BottomNavigationAction label="Show" />
    </BottomNavigation>
  );
}
