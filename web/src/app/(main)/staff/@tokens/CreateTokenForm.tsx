'use client';
import { createToken } from '../../../../actions/ApiTokens';
import { Form, Formik } from 'formik';
import { Button } from '@mui/material';
import { object, string } from 'yup';
import FormikTextField from '../../../../components/input/FormikTextField';

const tokenValidationSchema = object().shape({
    name: string().required('Application name is required'),
});

export default function CreateTokenForm() {
    return (
        <Formik
            initialValues={{
                name: '',
            }}
            validationSchema={tokenValidationSchema}
            onSubmit={async ({ name }) => {
                const res = await createToken(name);
            }}
        >
            <Form>
                <FormikTextField
                    id="token-name"
                    type="text"
                    name="name"
                    label="Name"
                />
                <Button>Create Token</Button>
            </Form>
        </Formik>
    );
}
