import React, { useState } from 'react';
import axios from 'axios';
import { TextField, Button, Box, Typography, Container, CircularProgress } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginForm = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setError('تکایە هەموو خانەکان پڕ بکەوە');
      return;
    }
    
    setLoading(true);
    setError('');
    const apiUrl = 'http://127.0.0.1:8000/api/login';

    try {
      const response = await axios.post(apiUrl, { username, password });

      if (response.status === 200 && response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        navigate('/dashboard');
      } else {
        setError(response.data.message || 'یوزەرنەیم یان پاسۆردت هەڵەیە');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError('هەڵە ڕوویدا لەپەیوەست بوون بەسێرفەررەوە');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Typography component="h1" variant="h5">
          Sign in
        </Typography>
        <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="username"
            label="ناو"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="ووشەی نهێنی"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && (
            <Typography color="error" sx={{ mt: 2 }} role="alert">
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'چوونەژوورەوە'}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default LoginForm;
