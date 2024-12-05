import React, { useState } from 'react';
import axiosInstance from '../../components/service/axiosInstance'; // Import the axios utility

import { useNavigate } from 'react-router-dom'; // Import useNavigate for routing

import { Card, Typography, Box, TextField, Button, IconButton, InputAdornment ,Snackbar, Alert} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close'; // Import Close Icon

import Grid from '@mui/material/Grid';
import { clearTextField, handleChange, resetForm } from '../../components/utils/formUtils'; // Import utilities

function WarehouseEdit({ isDrawerOpen }) {
  
  const initialFormData = {
    name: '',
    phone_1: '',
    phone_2: '',
    address: '',
    note: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState(''); // State to manage error messages
  const [loading, setLoading] = useState(false); // State to manage loading indicator
  const [success, setSuccess] = useState(false); // State to manage success message

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Reset error message

    try {
      const response = await axiosInstance.post('/warehouse/store', formData);

      if (response.status === 201) {
        console.log('Warehouse registered successfully:', response.data);
        resetForm(setFormData, initialFormData); // Reset the form after successful registration
        setSuccess(true); // Show success message

        // navigate('/warehouse'); // Navigate to the list page
      } else {
        setError(response.data.message || 'Failed to register warehouse');
      }
    } catch (error) {
      setError('Failed to connect to the server. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => {
    setSuccess(false); // Hide the success message
  };

  const handleClose = () => {
    navigate('/warehouse'); // Route to warehouse list
  };



  return (
    <>
      <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
        <Card sx={{ margin: 1 }}>
          {/* Close Icon at the top right */}
          <Box sx={{ padding: 2, textAlign: 'right' }}>
            {/* Container with icon on the left and text on the right */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              {/* Title on the right */}
              <Typography variant="h6" gutterBottom>
                زانیاری کۆگا
              </Typography>

              {/* Close icon on the left */}
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="ناو"
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      endAdornment: formData.name && (
                        <InputAdornment position="end">
                          <IconButton onClick={() => clearTextField(setFormData, 'name')} edge="end">
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ژمارەی مۆبایل١"
                    name="phone_1"
                    value={formData.phone_1}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      endAdornment: formData.phone_1 && (
                        <InputAdornment position="end">
                          <IconButton onClick={() => clearTextField(setFormData, 'phone_1')} edge="end">
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ژمارەی مۆبایل٢"
                    name="phone_2"
                    value={formData.phone_2}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      endAdornment: formData.phone_2 && (
                        <InputAdornment position="end">
                          <IconButton onClick={() => clearTextField(setFormData, 'phone_2')} edge="end">
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="ناونیشان"
                    name="address"
                    value={formData.address}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      endAdornment: formData.address && (
                        <InputAdornment position="end">
                          <IconButton onClick={() => clearTextField(setFormData, 'address')} edge="end">
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={12}>
                  <TextField
                    fullWidth
                    label="تێبینی"
                    name="note"
                    value={formData.note}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    multiline
                    rows={2}
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      endAdornment: formData.note && (
                        <InputAdornment position="end">
                          <IconButton onClick={() => clearTextField(setFormData, 'note')} edge="end">
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Box marginTop={"10px"}>
                <Grid container spacing={2}>
                  <Grid item xs={9}>
                    <Button fullWidth type="submit" color="success" variant="contained" disabled={loading}>
                      {loading ? 'Loading...' : 'تۆمارکردن'}
                    </Button>
                  </Grid>
                  <Grid item xs={3}>
                    <Button
                      fullWidth
                      variant="contained"
                      color="warning"
                      onClick={() => resetForm(setFormData, initialFormData)}
                    >
                      پاکردنەوە
                    </Button>
                  </Grid>
                </Grid>
              </Box>

              {/* Display Error Message */}
              {error && (
                <Typography color="error" sx={{ marginTop: 2 }}>
                  {error}
                </Typography>
              )}
            </form>
          </Box>
        </Card>
        
        {/* Success Snackbar */}
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }} // Position Snackbar at top-left
        >
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            کۆگای نوێ زیادکرا
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}

export default WarehouseEdit;
