import { DialogContent, DialogTitle, FormControlLabel, Switch } from '@mui/material';

interface SettingsDialogContentProps {
    showDetails: boolean;
    setShowDetails: (showDetails: boolean) => void;
}

export const SettingsDialogContent: React.FC<SettingsDialogContentProps> = ({ showDetails, setShowDetails }) => (
    <>
        <DialogTitle>Goal Manager Settings</DialogTitle>
        <DialogContent>
            <FormControlLabel
                control={
                    <Switch
                        checked={showDetails}
                        onChange={(e) => setShowDetails(e.target.checked)}
                    />
                }
                label="Display additional information in goal list"
            />
        </DialogContent>
    </>
);
