import { Field, Form, Formik } from 'formik';
import { alertError } from '../../../../lib/Utils';
import type { UploadFormProps } from '../GoalUpload';

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

function parseList(data: string): string[] {
    return JSON.parse(data);
};