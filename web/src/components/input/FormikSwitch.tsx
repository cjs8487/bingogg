import { FormControlLabel, Switch } from '@mui/material';
import { useField } from 'formik';

interface FormikSwitchProps {
    id: string;
    name: string;
    label: string;
}
export default function FormikSwitch({ id, name, label }: FormikSwitchProps) {
    const [field, meta, helpers] = useField<boolean>(name);

    return (
        <FormControlLabel
            control={
                <Switch
                    value={field.value}
                    onChange={(e) => helpers.setValue(e.target.checked)}
                    onBlur={field.onBlur}
                />
            }
            label={label}
        />
    );
}
