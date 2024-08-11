import { useFloating, useHover, useInteractions } from '@floating-ui/react';
import { Paper } from '@mui/material';
import { ReactNode, useState } from 'react';

interface HoverIconProps {
    icon: JSX.Element;
    children: ReactNode;
}

export default function HoverIcon({ icon, children }: HoverIconProps) {
    const [open, setOpen] = useState(false);
    const { refs, floatingStyles, context } = useFloating({
        open: open,
        onOpenChange: setOpen,
    });
    const hover = useHover(context);
    const { getReferenceProps, getFloatingProps } = useInteractions([hover]);
    return (
        <>
            <div ref={refs.setReference} {...getReferenceProps()}>
                {icon}
            </div>
            {open && (
                <Paper
                    ref={refs.setFloating}
                    style={floatingStyles}
                    {...getFloatingProps()}
                    sx={{ p: 2, maxWidth: 'sm', zIndex: 10 }}
                >
                    {children}
                </Paper>
            )}
        </>
    );
}
