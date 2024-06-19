import { Field, Form, Formik } from 'formik';
import { parseSRLv5BingoList } from '../../../../lib/goals/SRLv5Parser';
import { alertError } from '../../../../lib/Utils';
import type { UploadFormProps } from '../GoalUpload';

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
                <label>
                    Data
                    <Field
                        name="data"
                        as="textarea"
                        className="h-full w-full p-2 text-black"
                        rows={10}
                    />
                </label>
                <div className="mt-5">
                    <button
                        type="button"
                        className="rounded-md border border-transparent bg-error px-4 py-2 text-sm font-medium text-white hover:bg-red-600"
                        onClick={close}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="float-right rounded-md border border-transparent bg-success px-4 py-2 text-sm font-medium text-white hover:bg-green-500"
                    >
                        Submit
                    </button>
                </div>
            </Form>
        </Formik>
    );
}