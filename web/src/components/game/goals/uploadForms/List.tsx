import { Field, Form, Formik } from 'formik';
import { alertError } from '../../../../lib/Utils';
import type { UploadFormProps } from '../GoalUpload';
import FormikTextField from '../../../input/FormikTextField';
import { Box, Button } from '@mui/material';

export function ListUploadForm({ slug, close }: UploadFormProps) {
    return (
        <Formik
            initialValues={{ data: '' }}
            onSubmit={async ({ data }) => {
                let parsedList;
                try {
                    parsedList = parseList(data);
                } catch (error) {
                    alertError('Unable to parse file contents');
                    return;
                }
                const goals = parsedList.flat();
                const res = await fetch('/api/goals/upload/list', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        slug,
                        goals,
                    }),
                });
                if (!res.ok) {
                    const error = await res.text();
                    alertError(`Could not upload results - ${error}`);
                    return;
                }
                close();
            }}
        >
            <Form>
                <FormikTextField
                    id="list-upload-data"
                    name="data"
                    label="Data"
                    multiline
                    rows={10}
                    fullWidth
                />
                <Box mt={2} display="flex">
                    <Button type="button" color="error" onClick={close}>
                        Cancel
                    </Button>
                    <Box flexGrow={1} />
                    <Button type="submit" variant="contained" color="success">
                        Submit
                    </Button>
                </Box>
            </Form>
        </Formik>
    );
}

function parseList(data: string): string[] {
    return JSON.parse(data);
}
