import { TextField } from '@mui/material';
import { useField } from 'formik';
import { HTMLInputTypeAttribute } from 'react';

interface FormikTextFieldProps {
    id?: string;
    name: string;
    label: string;
    type?: HTMLInputTypeAttribute;
    pattern?: string;
    inputMode?:
        | 'none'
        | 'text'
        | 'tel'
        | 'url'
        | 'email'
        | 'numeric'
        | 'decimal'
        | 'search';
}

export default function FormikTextField({
    id,
    name,
    label,
    type,
    pattern,
    inputMode,
}: FormikTextFieldProps) {
    const [field, meta] = useField<string>(name);
    return (
        <TextField
            id={id ?? name}
            name={name}
            label={label}
            type={type}
            inputProps={{ pattern, inputMode }}
            value={field.value}
            onChange={field.onChange}
            onBlur={field.onBlur}
            error={meta.touched && !!meta.error}
            helperText={meta.touched && meta.error}
        />
    );
}
