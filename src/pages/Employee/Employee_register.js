import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Box,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  MenuItem,
  Grid,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from '../../components/service/axiosInstance';
import { resetForm } from '../../components/utils/formUtils';

function EmployeeRegister({ isDrawerOpen }) {
  // Initial form data
  const initialFormData = {
    name: '',
    username: '',
    phone: '',
    email: '',
    password: '',
    warehouse_id: 0, // Default warehouse ID
  };

  // States
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [warehouses, setWarehouses] = useState([]);

  const navigate = useNavigate();
  const { id } = useParams();

  // Fetch employee details and warehouses
  useEffect(() => {
    if (id) {
      axiosInstance
        .get(`/user/show/${id}`)
        .then((response) => {
          if (response.data.success) {
            setFormData(response.data.data);
          }
        })
        .catch((error) => console.error('Failed to fetch employee details:', error));
    }

    axiosInstance
      .get('/warehouse/list')
      .then((response) => {
        if (response.data.success) {
          setWarehouses(response.data.data);
        }
      })
      .catch((error) => console.error('Failed to fetch warehouses:', error));
  }, [id]);

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Update form data on input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Clear a specific field
  const handleClearField = (field) => {
    setFormData((prevData) => ({
      ...prevData,
      [field]: '',
    }));
  };



  // Form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formDataToSubmit = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSubmit.append(key, value);
    });

    try {
      const response = id
        ? await axiosInstance.put(`/user/update/${id}`, formDataToSubmit)
        : await axiosInstance.post('/user/store', formDataToSubmit);

      if (response.data.success) {
        setSnackbarMessage(id ? 'گۆڕانکاری جێبەجێکرا' : 'کارمەندی نوێ زیادکرا');
        setSnackbarOpen(true);

        if (!id) setFormData(initialFormData);
        else navigate('/employee');
      } else {
        setError(response.data.message || 'Failed to save employee.');
      }
    } catch (error) {
      setError(error.response?.data?.message || 'An error occurred while saving.');
      console.error('Error:', error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  // Close form
  const handleClose = () => navigate('/employee');

  return (
    <>
      <Box
        sx={{
          marginRight: isDrawerOpen ? '250px' : '0',
          transition: 'margin-right 0.3s ease-in-out',
        }}
      >
        <Card sx={{ margin: 1 }}>
          <Box sx={{ padding: 2, textAlign: 'right' }}>
            {/* Header */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 2,
              }}
            >
              <Typography variant="h6" gutterBottom>
                {id ? 'گۆڕینی زانیاری کارمەند' : 'زیادکردنی کارمەند'}
              </Typography>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Form */}
            <form onSubmit={handleSubmit} encType="multipart/form-data">
              <Grid container spacing={2}>
                {/* Fields */}
                {[
                  { label: 'ناو', name: 'name', required: true },
                  { label: 'بەکارهێنەر', name: 'username', required: true },
                  { label: 'ژمارەی مۆبایل', name: 'phone' }
                ].map(({ label, name, required }) => (
                  <Grid item xs={12} md={6} key={name}>
                    <TextField
                      fullWidth
                      label={label}
                      name={name}
                      value={formData[name]}
                      onChange={handleChange}
                      required={required}
                      InputProps={{
                        endAdornment: formData[name] && (
                          <InputAdornment position="end">
                            <IconButton onClick={() => handleClearField(name)} edge="end">
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                ))}

                {/* Warehouse Dropdown */}
                <Grid item xs={12} md={6}>
                  <TextField
                    select
                    fullWidth
                    label="کۆگا"
                    name="warehouse_id"
                    value={formData.warehouse_id}
                    onChange={handleChange}
                  >
                    {warehouses.map((warehouse) => (
                      <MenuItem key={warehouse.id} value={warehouse.id}>
                        {warehouse.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                {/* Password */}
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="ووشەی نهێنی"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!id}
                    InputProps={{
                      endAdornment: formData.password && (
                        <InputAdornment position="end">
                          <IconButton onClick={() => handleClearField('password')} edge="end">
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

               
              </Grid>

              {/* Action Buttons */}
              <Box marginTop="10px">
                <Grid container spacing={2}>
                  <Grid item xs={9}>
                    <Button
                      fullWidth
                      type="submit"
                      color="success"
                      variant="contained"
                      disabled={loading}
                    >
                      {loading ? 'Processing...' : id ? 'جێبەجێکردن' : 'تۆمارکردن'}
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
            </form>
          </Box>
        </Card>
      </Box>

      {/* Snackbar */}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default EmployeeRegister;
