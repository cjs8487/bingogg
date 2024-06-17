import { Button, ButtonProps } from '@mui/material';
import Link from 'next/link';
import { PropsWithChildren } from 'react';

export default function LinkButton(
    props: PropsWithChildren<ButtonProps<typeof Link>>,
) {
    return <Button component={Link} color="inherit" {...props} />;
}
