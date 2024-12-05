import React, { useState, useEffect } from 'react';
import axiosInstance from '../../components/service/axiosInstance';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card, Typography, Box, TextField, Button, IconButton,
  InputAdornment, Snackbar, Alert, Grid
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import { clearTextField, handleChange, resetForm } from '../../components/utils/formUtils';

function WarehouseRegister({ isDrawerOpen }) {
  const initialFormData = {
    name: '',
    phone_1: '',
    phone_2: '',
    address: '',
    note: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL if available

  // Fetch existing data if in edit mode
  useEffect(() => {
    if (id) {
      const fetchWarehouse = async () => {
        try {
          const response = await axiosInstance.get(`/warehouse/show/${id}`);
          if (response.status === 200) {
            setFormData(response.data.data); // Populate the form with existing data
          }
        } catch (error) {
          console.error('Error fetching warehouse:', error);
        }
      };
      fetchWarehouse();
    }
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (id) {
        // Update the existing warehouse
        response = await axiosInstance.put(`/warehouse/update/${id}`, formData);
      } else {
        // Create a new warehouse
        response = await axiosInstance.post('/warehouse/store', formData);
      }

      if (response.status === 200 || response.status === 201) {
        resetForm(setFormData, initialFormData);
        setSuccess(true);
        navigate('/warehouse'); // Navigate back to the warehouse list
      } else {
        setError(response.data.message || 'Failed to submit form');
      }
    } catch (error) {
      setError('Failed to connect to the server. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => setSuccess(false);
  const handleClose = () => navigate('/warehouse');

  return (
    <>
      <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
        <Card sx={{ margin: 1 }}>
          <Box sx={{ padding: 2, textAlign: 'right' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Typography variant="h6" gutterBottom>
                {id ? 'گۆڕینی زانیاری کۆگا' : 'زیادکردنی کۆگا'}
              </Typography>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>
            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ناو"
                    name="name"
                    required
                    value={formData.name}
                    onChange={(e) => handleChange(e, setFormData)}
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
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="ژمارەی مۆبایل١"
                    name="phone_1"
                    value={formData.phone_1}
                    onChange={(e) => handleChange(e, setFormData)}
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
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="ژمارەی مۆبایل٢"
                    name="phone_2"
                    value={formData.phone_2}
                    onChange={(e) => handleChange(e, setFormData)}
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="ناونیشان"
                    name="address"
                    value={formData.address}
                    onChange={(e) => handleChange(e, setFormData)}
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
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="تێبینی"
                    name="note"
                    value={formData.note}
                    onChange={(e) => handleChange(e, setFormData)}
                    multiline
                    rows={2}
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
                <Grid item xs={9}>
                  <Button fullWidth type="submit" color="success" variant="contained" disabled={loading}>
                    {loading ? 'Loading...' : id ? 'نوێکردنەوە' : 'تۆمارکردن'}
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
            </form>
          </Box>
        </Card>
        <Snackbar
          open={success}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            {id ? 'کۆگای دیاریکراو نوێکرایەوە' : 'کۆگای نوێ زیادکرا'}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}

export default WarehouseRegister;
