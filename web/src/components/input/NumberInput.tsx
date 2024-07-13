import { Box, Button, TextField } from '@mui/material';
import { ErrorMessage, FieldProps, useField } from 'formik';
import { useCallback, useEffect, useState } from 'react';

interface NumberInputProps {
    id?: string;
    name: string;
    label: string;
    min?: number;
    max?: number;
    disabled?: boolean;
    required?: boolean;
}

/**
 * Custom Formik input field for working with numbers. Allows specifying the
 * minimum and maximum number in the field, and ensures that the value is
 * between them (inclusive) on every change. Provides step buttons for inline
 * mouse control of the field value.
 *
 * The provided inline validation should not be relied upon for form level
 * validation. If the value needs to be validated, it should still be validated
 * like any other form element
 */
export default function NumberInput({
    id,
    name,
    label,
    min,
    max,
    disabled,
    required,
}: NumberInputProps) {
    const [{ value }, meta, helpers] = useField<number>(name);
    const setValue = useCallback(
        (v: number) => {
            if (required && Number.isNaN(v)) return;
            if (!required && v !== undefined && Number.isNaN(v)) return;
            if (min !== undefined && v < min) return;
            if (max !== undefined && v > max) return;
            helpers.setValue(v);
        },
        [min, max, helpers, required],
    );
    const decrement = useCallback(() => {
        setValue(value - 1);
    }, [value, setValue]);
    const increment = useCallback(() => {
        setValue(value + 1);
    }, [value, setValue]);

    return (
        <>
            <Box display="flex" height="max-content">
                <Button
                    type="button"
                    variant="contained"
                    onClick={decrement}
                    disabled={
                        disabled || (min !== undefined ? value <= min : false)
                    }
                    sx={{
                        borderTopRightRadius: 0,
                        borderBottomRightRadius: 0,
                        minWidth: 0,
                    }}
                >
                    -
                </Button>
                <TextField
                    id={id}
                    label={label}
                    inputMode="numeric"
                    inputProps={{
                        pattern: '[0-9]*',
                    }}
                    value={value}
                    disabled={disabled}
                    onChange={(e) => setValue(Number(e.target.value))}
                    size="small"
                    InputProps={{
                        slotProps: {
                            root: { style: { borderRadius: 0 } },
                        },
                    }}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    type="button"
                    variant="contained"
                    onClick={increment}
                    disabled={
                        disabled || (max !== undefined ? value >= max : false)
                    }
                    sx={{
                        borderTopLeftRadius: 0,
                        borderBottomLeftRadius: 0,
                        minWidth: 0,
                    }}
                >
                    +
                </Button>
            </Box>
            <ErrorMessage name={name} />
        </>
    );
}
