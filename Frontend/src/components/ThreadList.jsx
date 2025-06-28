import React, { useEffect, useState } from 'react';
import { getThreads, createThread } from '../api/chat';
import { List, ListItemButton, ListItemText, TextField, Box, Button, Typography } from '@mui/material';

export default function ThreadList({ selected, setSelected }) {
    const [threads, setThreads] = useState([]);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        const fetch = async () => {
            const { data } = await getThreads();
            setThreads(data);
        };
        fetch();
    }, []);



    const addThread = async () => {
        if (!newTitle.trim()) return;
        await createThread(newTitle);
        setNewTitle('');
        const { data } = await getThreads();
        setThreads(data)
    };
     

    return (
        <Box width="250px" mr={2}>
            <Typography variant="h6">Chats</Typography>
            <List>
                {threads.map(t => (
                    <ListItemButton key={t.id} selected={t.id === selected} onClick={() => setSelected(t.id)}>
                        <ListItemText primary={t.title || `Chat #${t.id}`} />
                    </ListItemButton>
                ))}
            </List>
            <Box mt={2} display="flex">
                <TextField label="New Chat" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} fullWidth size="small" />
                <Button onClick={addThread}>ADD</Button>
            </Box>
        </Box>
    );
}
