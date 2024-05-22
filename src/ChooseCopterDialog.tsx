import * as React from 'react';
import Button from '@mui/material/Button';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Dialog from '@mui/material/Dialog';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import {CopterData} from "./App.tsx";
import {DroneInAnimation} from "./RunScreen.tsx";

export interface ChooseCopterDialogProps {
  id: string;
  value?: DroneInAnimation;
  open: boolean;
  copters: CopterData[]
  onClose: (animationObject?: DroneInAnimation, newTarget?: string) => void;
}

export function ChooseCopterDialog(props: ChooseCopterDialogProps) {
  const { onClose, value: valueProp, open, copters, ...other } = props;
  const [value, setValue] = React.useState("not assigned");
  const radioGroupRef = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    if (!open) {
      if(valueProp !== undefined) {
        setValue(valueProp.label);
      }
    }
    // console.log("Use effect in", valueProp, value);
  }, [valueProp, open]);

  const handleEntering = () => {
    if (radioGroupRef.current != null) {
      radioGroupRef.current.focus();
    }
  };

  const handleCancel = () => {
    onClose();
    setValue("not assigned");
  };

  const handleOk = () => {
    onClose(valueProp, value);
    setValue("not assigned");
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue((event.target as HTMLInputElement).value);
  };

  return (
    <Dialog
      sx={{ '& .MuiDialog-paper': { width: '80%', maxHeight: 435 } }}
      maxWidth="xs"
      TransitionProps={{ onEntering: handleEntering }}
      open={open}
      {...other}
    >
      <DialogTitle>Assign animation object to the copter</DialogTitle>
      <DialogContent dividers>
        <RadioGroup
          ref={radioGroupRef}
          aria-label="ringtone"
          name="ringtone"
          value={value}
          onChange={handleChange}
        >
          {props.copters.map((option) => (
            <FormControlLabel
              value={option.addr}
              key={option.addr}
              control={<Radio />}
              label={option.name}
            />
          ))}
        </RadioGroup>
      </DialogContent>
      <DialogActions>
        <Button autoFocus onClick={handleCancel}>
          Cancel
        </Button>
        <Button onClick={handleOk}>Ok</Button>
      </DialogActions>
    </Dialog>
  );
}
