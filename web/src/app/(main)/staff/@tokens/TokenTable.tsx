'use client';

import {
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
} from '@mui/material';
import { ApiToken } from './page';
import {
    activateToken,
    deactivateToken,
    revokeToken,
} from '../../../../actions/ApiTokens';

interface TokenTableProps {
    tokens: ApiToken[];
}

export default function TokenTable({ tokens }: TokenTableProps) {
    return (
        <TableContainer>
            <Table>
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
                                {token.revokedOn
                                    ? 'Revoked'
                                    : token.active
                                      ? 'Active'
                                      : 'Inactive'}
                            </TableCell>
                            <TableCell>
                                {!token.revokedOn &&
                                    (token.active ? (
                                        <Button
                                            color="warning"
                                            onClick={() =>
                                                deactivateToken(token.id)
                                            }
                                        >
                                            Deactivate
                                        </Button>
                                    ) : (
                                        <Button
                                            color="success"
                                            onClick={() =>
                                                activateToken(token.id)
                                            }
                                        >
                                            Activate
                                        </Button>
                                    ))}
                                {!token.revokedOn && (
                                    <Button
                                        color="error"
                                        onClick={() => revokeToken(token.id)}
                                    >
                                        Revoke
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
}
