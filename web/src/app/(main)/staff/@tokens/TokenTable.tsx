'use client';

import {
    Button,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { ApiToken } from './page';

interface TokenTableProps {
    tokens: ApiToken[];
}

export default function TokenTable({ tokens }: TokenTableProps) {
    console.log(tokens);
    return (
        <TableContainer>
            <TableHead>
                <TableRow>
                    <TableCell>Name</TableCell>
                    <TableCell>Token</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell />
                </TableRow>
            </TableHead>
            <TableBody>
                {tokens.map((token) => (
                    <TableRow key={token.id}>
                        <TableCell>{token.name}</TableCell>
                        <TableCell>{token.token}</TableCell>
                        <TableCell>
                            {token.active ? 'Active' : 'Inactive'}
                        </TableCell>
                        <TableCell>
                            <Button color="warning">Deactivate</Button>
                            <Button color="error">Revoke</Button>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </TableContainer>
    );
}
