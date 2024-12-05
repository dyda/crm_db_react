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

function BoxMoneyRegister({ isDrawerOpen }) {
  const initialFormData = {
    name: '',
    note: ''
  };

  const [formData, setFormData] = useState(initialFormData);
  const [error,setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();
  const { id } = useParams(); // Get ID from URL if available

  // Fetch existing data if in edit mode
  useEffect(() => {
    if (id) {
      const fetchBoxMoney = async () => {
        try {
          const response = await axiosInstance.get(`/box_money/show/${id}`);
          if (response.status === 200) {
            setFormData(response.data.data); // Populate the form with existing data
          }
        } catch (error) {
          console.error('Error fetching box_money:', error);
        }
      };
      fetchBoxMoney();
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
        response = await axiosInstance.put(`/box_money/update/${id}`, formData);
      } else {
        // Create a new warehouse
        response = await axiosInstance.post('/box_money/store', formData);
      }

      if(response.status===200){
        // update
        resetForm(setFormData, initialFormData);
        navigate('/box_money'); // Navigate back to the warehouse list
      }else if(response.status===201){
        // store
        resetForm(setFormData, initialFormData);
        setSuccess(true);
      } else {
        setError(response.data.message || 'هەڵە ڕویدا لە جێبەجێکردندا');
      }
    } catch (error) {
      setError('هەڵە ڕوویدا لەپەیوەست بوون بەسێرفەرەوە');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSnackbarClose = () => setSuccess(false);
  const handleClose = () => navigate('/box_money');

  return (
    <>
      <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
        <Card sx={{ margin: 1 }}>
          <Box sx={{ padding: 2, textAlign: 'right' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
              <Typography variant="h6" gutterBottom>
                {id ? 'گۆڕینی زانیاری قاصە' : 'زیادکردنی قاصە'}
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
            {id ? 'قاصەی دیاریکراو نوێکرایەوە' : 'قاصەی نوێ زیادکرا'}
          </Alert>
        </Snackbar>
      </Box>
    </>
  );
}

export default BoxMoneyRegister;
