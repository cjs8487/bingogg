import { Box, SxProps } from '@mui/material';
import { PropsWithChildren } from 'react';

interface CardHiddenActionsProps extends PropsWithChildren {
    align?: 'left' | 'center' | 'right';
}

export default function CardHiddenActions({
    children,
    align,
}: CardHiddenActionsProps) {
    return (
        <Box
            className="hidden-controls"
            sx={{
                width: 'inherit',
                paddingRight: '8px',
                justifyContent: align ?? 'left',
            }}
        >
            <Box zIndex={1}>{children}</Box>
        </Box>
    );
}
