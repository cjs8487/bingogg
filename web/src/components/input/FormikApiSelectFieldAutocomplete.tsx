import React, { useEffect, useState } from 'react';
import { Autocomplete, TextField, FormControl, InputLabel, Select, MenuItem, Chip, OutlinedInput, Box } from '@mui/material';
import { useField, useFormikContext } from 'formik';
import { alertError } from '@/lib/Utils';

interface SelectOption {
    label: string;
    value: string;
}

interface FormikApiSelectAutocompleteProps {
    id: string;
    name: string;
    label: string;
    api: string; // API URL to fetch options
    autocomplete?: boolean; // If true, enable autocomplete behavior, otherwise use regular select
    multiple?: boolean; // If true, allow multiple selections
}

export default function FormikApiSelectAutocomplete({
    id,
    name,
    label,
    api,
    autocomplete = false,
    multiple = false,
}: FormikApiSelectAutocompleteProps) {
    const [options, setOptions] = useState<SelectOption[]>([]);
    const [field, meta, helpers] = useField<string | string[] | null>(name);
    const { setFieldValue } = useFormikContext();

    useEffect(() => {
        // Fetch options from the provided API
        const fetchOptions = async () => {
            const res = await fetch(api);
            if (res.ok) {
                const data = await res.json();
                setOptions(data.map((item: { name: string }) => ({
                    label: item.name,
                    value: item.name,
                })));
            } else {
                alertError('Unable to fetch options');
            }
        };

        fetchOptions();
    }, [api]);

    return (
        <>
            {autocomplete ? (
                <Autocomplete
                    id={id}
                    multiple={multiple}
                    value={
                        multiple
                            ? (field.value as string[])?.map(
                                  (val) => options.find((opt) => opt.value === val)?.label ?? ''
                              )
                            : options.find((opt) => opt.value === field.value)?.label ?? null
                    }
                    options={options.map((option) => option.label)}
                    onChange={(_, newValue) => {
                        if (multiple) {
                            helpers.setValue(
                                (newValue as string[]).map(
                                    (label) => options.find((option) => option.label === label)?.value ?? ''
                                )
                            );
                        } else {
                            helpers.setValue(
                                options.find((option) => option.label === newValue)?.value ?? null
                            );
                        }
                    }}
                    onBlur={field.onBlur}
                    renderInput={(params) => (
                        <TextField
                            {...params}
                            name={name}
                            label={label}
                            error={meta.touched && !!meta.error}
                            helperText={meta.touched && meta.error}
                        />
                    )}
                />
            ) : (
                <FormControl fullWidth>
                    <InputLabel id={`${label}-label`}>{label}</InputLabel>
                    <Select
                        labelId={`${label}-label`}
                        id={id}
                        multiple={multiple}
                        value={field.value || (multiple ? [] : '')}
                        onChange={(event) => {
                            const value = event.target.value;
                            setFieldValue(
                                name,
                                multiple
                                    ? typeof value === 'string'
                                        ? value.split(',')
                                        : value
                                    : value
                            );
                        }}
                        input={<OutlinedInput id="select-multiple-chip" label={label} />}
                        renderValue={(selected) =>
                            multiple ? (
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                    {(selected as string[]).map((value) => (
                                        <Chip key={value} label={value} />
                                    ))}
                                </Box>
                            ) : (
                                selected
                            )
                        }
                    >
                        {options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>
                                {option.label}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            )}
        </>
    );
}
