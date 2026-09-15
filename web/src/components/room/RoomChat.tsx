'use client';
import { RoomContext } from '@/context/RoomContext';
import SendIcon from '@mui/icons-material/Send';
import {
    alpha,
    Box,
    Button,
    Paper,
    TextField,
    Typography,
} from '@mui/material';
import { useContext, useEffect, useRef, useState } from 'react';

export default function RoomChat() {
    const { messages, sendChatMessage, roomData } = useContext(RoomContext);

    const [message, setMessage] = useState('');

    const chatDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatDivRef.current?.scrollTo(0, chatDivRef.current.scrollHeight);
    }, [messages]);

    return (
        <Paper
            sx={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                display: 'grid',
                gridTemplateRows: '1fr auto',
                gridTemplateColumns: '1fr',
                gap: 1,
                p: 1,
                borderTopLeftRadius: 0,
            }}
        >
            {roomData?.chatEnabled ? (
                <>
                    <Box
                        sx={{
                            maxHeight: '100%',
                            overflowY: 'auto',
                            px: 1,
                            opacity: 1,
                        }}
                        ref={chatDivRef}
                    >
                        {messages.map((message, index) => (
                            <div key={index}>
                                {message.map(
                                    (messageContents, contentIndex) => {
                                        if (
                                            typeof messageContents === 'string'
                                        ) {
                                            return (
                                                <span
                                                    key={`${contentIndex}`}
                                                    style={{}}
                                                >
                                                    {messageContents}
                                                </span>
                                            );
                                        }
                                        return (
                                            <span
                                                key={`${contentIndex}`}
                                                style={{
                                                    color: messageContents.color,
                                                }}
                                            >
                                                {messageContents.contents}
                                            </span>
                                        );
                                    },
                                )}
                            </div>
                        ))}
                    </Box>
                    <Box
                        sx={{ display: 'flex', gap: 0.5 }}
                        className="flex gap-1"
                    >
                        <TextField
                            value={message}
                            size="small"
                            fullWidth
                            onChange={(e) => setMessage(e.target.value)}
                            onKeyUp={(event) => {
                                if (event.key === 'Enter') {
                                    sendChatMessage(message);
                                    setMessage('');
                                }
                            }}
                            placeholder="Send a chat message..."
                        />
                        <Button
                            onClick={() => {
                                sendChatMessage(message);
                                setMessage('');
                            }}
                            endIcon={<SendIcon />}
                        >
                            Send
                        </Button>
                    </Box>
                </>
            ) : (
                <Typography variant="h6" align="center">
                    Chat is disabled for this room
                </Typography>
            )}
        </Paper>
    );
}
