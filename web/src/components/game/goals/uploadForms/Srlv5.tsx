import { Field, Form, Formik } from 'formik';
import { parseSRLv5BingoList } from '../../../../lib/goals/SRLv5Parser';
import { alertError } from '../../../../lib/Utils';
import type { UploadFormProps } from '../GoalUpload';
import { Box, Button } from '@mui/material';
import FormikTextField from '../../../input/FormikTextField';

export function SRLv5UploadForm({ slug, close }: UploadFormProps) {
    return (
        <Formik
            initialValues={{ data: '' }}
            onSubmit={async ({ data }) => {
                const parsedList = parseSRLv5BingoList(data);
                if (!parsedList) {
                    alertError('Unable to parse file contents');
                    return;
                }

                let invalid = false;
                const goals = parsedList
                    .map((goalList, difficulty) => {
                        if (invalid) {
                            return [];
                        }
                        if (difficulty < 1 || difficulty > 25) {
                            invalid = true;
                            return [];
                        }
                        return goalList.map((goal) => {
                            if (!goal.name) {
                                invalid = true;
                            }
                            return {
                                goal: goal.name,
                                difficulty,
                                categories: goal.types,
                            };
                        });
                    })
                    .flat();
                if (invalid) {
                    alertError('The data entered is invalid.');
                    return;
                }
                const res = await fetch('/api/goals/upload/srlv5', {
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
                    id="srlv5-upload-data"
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
