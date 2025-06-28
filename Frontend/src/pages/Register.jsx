import React, { useState } from 'react';
import { register } from '../api/auth';
import { useNavigate, Link } from 'react-router-dom';
import { Container, TextField, Button, Typography, Box, Paper } from '@mui/material';

export default function Register() {
  const [data, setData] = useState({ username: '', email: '', password: '' });
  const [msg, setMsg] = useState(null);
  const nav = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(data);
      setMsg('Registered. You can now login.');
      setTimeout(() => nav('/login'), 1000);
    } catch (err) {
      setMsg(err.response?.data.error || 'Registration failed');
    }
  };

  return (
    <Box
      sx={{
        height: '95vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ece9e6, #ffffff)',
      }}
    >
      <Container maxWidth="xs">
        <Paper elevation={6} sx={{ padding: 4, borderRadius: 3 }}>
          <Typography variant="h5" align="center" gutterBottom>Register</Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              label="Username"
              fullWidth
              margin="normal"
              required
              value={data.username}
              onChange={(e) => setData({ ...data, username: e.target.value })}
            />
            <TextField
              label="Email"
              fullWidth
              margin="normal"
              required
              value={data.email}
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
            <TextField
              label="Password"
              type="password"
              fullWidth
              margin="normal"
              required
              value={data.password}
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
            {msg && <Typography color={msg.includes('Registered') ? 'success.main' : 'error'} align="center">{msg}</Typography>}
            <Button type="submit" variant="contained" fullWidth sx={{ mt: 2 }}>Register</Button>
          </form>
          <Typography align="center" mt={2}>
            Already have an account? <Link to="/login">Login</Link>
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
}
