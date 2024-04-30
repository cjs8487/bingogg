'use client';

import { useSearchParams } from 'next/navigation';
import { useLayoutEffect } from 'react';
import { Bounce, toast } from 'react-toastify';
import { alertError } from '../../lib/Utils';

export default function ToasterOven() {
    const params = useSearchParams();

    const type = params.get('type');
    const message = params.get('message');

    useLayoutEffect(() => {
        if (!type || !message) {
            return;
        }

        switch (type) {
            case 'success':
                toast.success(message, {
                    position: 'top-right',
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'colored',
                    transition: Bounce,
                });
                break;
            case 'error':
                alertError(message);
                break;
            default:
                toast.info(message, {
                    position: 'top-right',
                    autoClose: 5000,
                    hideProgressBar: true,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                    progress: undefined,
                    theme: 'colored',
                    transition: Bounce,
                });
        }
    }, [type, message]);

    return null;
}
