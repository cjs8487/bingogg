'use client';
import { useContext, useEffect, useRef, useState } from 'react';
import { RoomContext } from '@/context/RoomContext';
import { Box, Button, Paper, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

export default function RoomChat() {
    const { messages, sendChatMessage } = useContext(RoomContext);

    const [message, setMessage] = useState('');

    const chatDivRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        chatDivRef.current?.scrollIntoView(false);
    }, [messages]);

    return (
        <Paper
            sx={{
                display: 'flex',
                maxHeight: '100%',
                flexDirection: 'column',
                rowGap: 1,
                p: 1,
            }}
        >
            <Box
                sx={{
                    height: '100%',
                    flexGrow: 1,
                    overflowY: 'auto',
                    px: 1,
                }}
            >
                {messages.map((message, index) => (
                    <div key={index}>
                        {message.map((messageContents, contentIndex) => {
                            if (typeof messageContents === 'string') {
                                return (
                                    <span key={`${contentIndex}`} style={{}}>
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
                        })}
                    </div>
                ))}
                <div ref={chatDivRef} />
            </Box>
            <Box display="flex" columnGap={1}>
                <TextField
                    size="small"
                    variant="outlined"
                    value={message}
                    placeholder="Send a chat message..."
                    onChange={(event) => setMessage(event.target.value)}
                    onKeyUp={(event) => {
                        if (event.key === 'Enter') {
                            sendChatMessage(message);
                            setMessage('');
                        }
                    }}
                    sx={{ flexGrow: 1 }}
                />
                <Button
                    variant="contained"
                    endIcon={<SendIcon />}
                    onClick={() => {
                        sendChatMessage(message);
                        setMessage('');
                    }}
                >
                    Send
                </Button>
            </Box>
        </Paper>
    );
}
