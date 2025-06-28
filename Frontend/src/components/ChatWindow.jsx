import React, { useEffect, useState, useRef } from 'react';
import { getMessages, sendMessage, uploadDocument } from '../api/chat';
import {
    Box,
    Button,
    TextField,
    Typography,
    Paper,
    IconButton,
    Tooltip,
    CircularProgress,
} from '@mui/material';
import AttachFileIcon from '@mui/icons-material/AttachFile';

export default function ChatWindow({ threadId }) {
    const [msgs, setMsgs] = useState([]);
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const boxRef = useRef();

    useEffect(() => {
        if (threadId) {
            loadMessages();
        }
    }, [threadId]);

    const loadMessages = async () => {
        try {
            const { data } = await getMessages(threadId);
            setMsgs(data);
            scrollToBottom();
        } catch (err) {
            console.error('Failed to load messages:', err);
        }
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            boxRef.current?.scrollTo(0, boxRef.current.scrollHeight);
        }, 50);
    };

    const handleSend = async () => {
        if (!text.trim() || loading) return;

        const userMessage = {
            id: Date.now(),
            sender: 'user',
            content: text.trim(),
        };

        const typingMessage = {
            id: Date.now() + 1,
            sender: 'bot',
            content: '...',
            isTyping: true,
        };

        setMsgs((prev) => [...prev, userMessage, typingMessage]);
        setText('');
        scrollToBottom();
        setLoading(true);

        try {
            const { data } = await sendMessage(threadId, text);

            setMsgs((prev) => {
                const filtered = prev.filter((m) => m.id !== typingMessage.id);
                return [...filtered, data.bot_reply];
            });
        } catch (err) {
            console.error('Send failed:', err);

            setMsgs((prev) => {
                const filtered = prev.filter((m) => m.id !== typingMessage.id);
                return [
                    ...filtered,
                    {
                        id: Date.now() + 2,
                        sender: 'bot',
                        content: 'Failed to get response from bot.',
                    },
                ];
            });
        }

        setLoading(false);
        scrollToBottom();
    };


    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file || uploading) return;

        setUploading(true);

        try {
            await uploadDocument(threadId, file);

            setMsgs((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    sender: 'user',
                    content: `Uploaded document: ${file.name}`,
                },
                {
                    id: Date.now() + 1,
                    sender: 'bot',
                    content: `Document "${file.name}" embedded and ready for questions.`,
                },
            ]);

            scrollToBottom();
        } catch (err) {
            console.error('Upload failed:', err);
            setMsgs((prev) => [
                ...prev,
                {
                    id: Date.now(),
                    sender: 'bot',
                    content: `Failed to upload document: ${file.name}`,
                },
            ]);
        }

        setUploading(false);
        e.target.value = null;
    };

    return (
        <Box flex={1} display="flex" flexDirection="column" height="100%">
            <Paper ref={boxRef} sx={{ flex: 1, p: 2, overflowY: 'auto' }}>
                {msgs.map((m) => (
                    <Box key={m.id} mb={1} textAlign={m.sender === 'bot' ? 'left' : 'right'}>
                        <Typography
                            variant="body2"
                            component="p"
                            sx={{
                                background: m.sender === 'bot' ? '#f0f0f0' : '#d0f0ff',
                                p: 1,
                                borderRadius: 1,
                                display: 'inline-block',
                                fontStyle: m.isTyping ? 'italic' : 'normal',
                                opacity: m.isTyping ? 0.6 : 1,
                            }}
                        >
                            {m.isTyping ? 'Assistant is typing...' : m.content}
                        </Typography>
                    </Box>
                ))}
            </Paper>

            <Box display="flex" mt={1} alignItems="center" p={1}>
                <Tooltip title="Upload PDF">
                    <IconButton component="label" disabled={uploading}>
                        <AttachFileIcon />
                        <input
                            type="file"
                            hidden
                            accept=".pdf"
                            onChange={handleFileUpload}
                            disabled={uploading}
                        />
                    </IconButton>
                </Tooltip>

                <TextField
                    fullWidth
                    placeholder={uploading ? 'Uploading document...' : 'Type your message...'}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    disabled={loading || uploading}
                />

                <Button
                    variant="contained"
                    onClick={handleSend}
                    sx={{ ml: 1 }}
                    disabled={loading || uploading}
                >
                    {loading ? <CircularProgress size={20} /> : 'Send'}
                </Button>
            </Box>
        </Box>
    );
}
