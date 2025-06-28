import React, { useState, useEffect } from 'react';
import ThreadList from '../components/ThreadList';
import ChatWindow from '../components/ChatWindow';
import { useNavigate } from 'react-router-dom';
import { isLoggedIn, clearTokens } from '../utils/auth';
import { Button, Box, Divider } from '@mui/material';

export default function Chat() {
    const nav = useNavigate();
    const [threadId, setThreadId] = useState(null);

    useEffect(() => {
        if (!isLoggedIn()) nav('/login');
    }, []);

    const handleLogout = () => {
        clearTokens();
        nav('/login');
    };

    return (
        <Box display="flex" height="95vh">
            <Box
                width="280px"
                bgcolor="#f5f5f5"
                borderRight="1px solid #ddd"
                display="flex"
                flexDirection="column"
            >
                <Box p={2}>
                    <Button
                        variant="outlined"
                        color="error"
                        fullWidth
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </Box>
                <Divider />
                <Box flex={1} overflow="auto">
                    <ThreadList selected={threadId} setSelected={setThreadId} />
                </Box>
            </Box>

            <Box flex={1} display="flex" flexDirection="column">
                <Box flex={1} overflow="auto">
                    {threadId ? (
                        <ChatWindow threadId={threadId} />
                    ) : (
                        <Box
                            flex={1}
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            fontSize="1.2rem"
                            color="gray"
                        >
                            Select or create a chat
                        </Box>
                    )}
                </Box>
            </Box>
        </Box>
    );
}
