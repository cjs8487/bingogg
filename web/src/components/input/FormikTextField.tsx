import {
    SxProps,
    TextField,
    TextFieldPropsSizeOverrides,
    TextFieldVariants,
} from '@mui/material';
import { OverridableStringUnion } from '@mui/types';
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
    variant?: TextFieldVariants;
    size?: OverridableStringUnion<
        'small' | 'medium',
        TextFieldPropsSizeOverrides
    >;
    fullWidth?: boolean;
    autoComplete?: string;
    sx?: SxProps;
    disabled?: boolean;
    multiline?: boolean;
    rows?: number;
}

export default function FormikTextField({
    id,
    name,
    label,
    type,
    pattern,
    inputMode,
    variant,
    size,
    fullWidth,
    autoComplete,
    sx,
    disabled,
    multiline,
    rows,
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
            variant={variant}
            size={size}
            fullWidth={fullWidth}
            autoComplete={autoComplete}
            sx={sx}
            disabled={disabled}
            multiline={multiline}
            rows={rows}
        />
    );
}
