import Link from 'next/link';
import { ReactNode } from 'react';

interface HeaderLinkProps {
    children: ReactNode;
    href: string;
}

export default function HeaderLink({
    children,
    href,
}: HeaderLinkProps) {
    return <Link href={href}>{children}</Link>;
}
