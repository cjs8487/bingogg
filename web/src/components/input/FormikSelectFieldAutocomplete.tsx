import { Autocomplete, TextField } from '@mui/material';
import { useField } from 'formik';

interface SelectOption {
    label: string;
    value: string;
}
interface FormikSelectProps {
    id: string;
    name: string;
    label: string;
    options: SelectOption[];
    placeholder?: string;
}

export default function FormikSelectFieldAutocomplete({
    id,
    name,
    label,
    options,
}: FormikSelectProps) {
    const [field, meta, helpers] = useField<string | null>(name);

    return (
        <Autocomplete
            id={id}
            value={
                options.find((opt) => opt.value === field.value)?.label ?? null
            }
            onChange={(_, newValue) => {
                helpers.setValue(
                    options.find((option) => option.label === newValue)
                        ?.value ?? null,
                );
            }}
            onBlur={field.onBlur}
            blurOnSelect
            clearOnBlur
            options={options.map((option) => option.label)}
            renderInput={(params) => (
                <TextField
                    {...params}
                    name={name}
                    label={label}
                    onBlur={field.onBlur}
                    error={meta.touched && !!meta.error}
                    helperText={meta.touched && meta.error}
                />
            )}
        />
    );
}
