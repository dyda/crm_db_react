import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Card,
  Typography,
  Box,
  TextField,
  Button,
  MenuItem,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Grid,
} from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import CloseIcon from '@mui/icons-material/Close';
import axiosInstance from '../../components/service/axiosInstance';
import { handleChangeNumber } from '../../components/utils/setOnlyNumberComma';
import { clearTextField, resetForm } from '../../components/utils/formUtils';

function CustomerRegister({ isDrawerOpen }) {
  // Initial form state
  const initialFormData = {
    category_id: 0,
    code: '',
    name: '',
    phone_1: '',
    phone_2: '',
    type: 'هەردووکی',
    note: '',
    city: 'سلێمانی',
    kafyl_name: '',
    kafyl_phone: '',
    state: 'چالاک',
    address: '',
    cobon: '',
    limit_loan_price: '',
    limit_loan_day: '',
  };

  // States
  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const navigate = useNavigate();
  const { id } = useParams(); // Check if in edit mode (id present in URL)

  // Snackbar close handler
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return;
    setSnackbarOpen(false);
  };

  // Fetch categories and customer data (if editing)
  useEffect(() => {
    // Fetch categories
    axiosInstance
      .get('/customer_category/list')
      .then((response) => {
        if (response.data.success) {
          setCategories(response.data.data);
        }
      })
      .catch((error) => console.error('Failed to fetch customer categories:', error));

    // Fetch customer details if editing
    if (id) {
      axiosInstance
        .get(`/customer/edit/${id}`)
        .then((response) => {
          if (response.data.success) {
            setFormData(response.data.data);
          }
        })
        .catch((error) => console.error('Failed to fetch customer details:', error));
    }
  }, [id]);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: name === 'category_id' ? Number(value) : value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const dataToSubmit = {
      ...formData,
      category_id: formData.category_id || 0,
      limit_loan_price: parseFloat(formData.limit_loan_price) || 0,
      limit_loan_day: parseInt(formData.limit_loan_day, 10) || 0,
    };

    const request = id
      ? axiosInstance.put(`/customer/update/${id}`, dataToSubmit)
      : axiosInstance.post('/customer/store', dataToSubmit);

    request
      .then((response) => {
        if (response.data.success) {
          const message = id ? 'زانیاری کڕیار نوێکرایەوە' : 'کڕیاری نوێ زیادکرا';
          setSnackbarMessage(message);
          setSnackbarOpen(true);

          if (!id) {
            resetForm(setFormData, initialFormData);
          } else {
            navigate('/customer');
          }
        } else {
          setError(response.data.message || 'Failed to save customer.');
        }
      })
      .catch((error) => {
        const errorMessage = error.response?.data?.message || 'An error occurred while saving the customer.';
        setError(errorMessage);
        console.error('Error:', error.response?.data || error);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Handle form cancel/close
  const handleClose = () => {
    navigate('/customer');
  };

  return (
    <>
      <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
        <Card sx={{ margin: 1 }}>
          <Box sx={{ padding: 2, textAlign: 'right' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom>
                {id ? 'گۆڕینی زانیاری کڕیار' : 'زانیاری کڕیار'}
              </Typography>
              <IconButton onClick={handleClose}>
                <CloseIcon />
              </IconButton>
              
            </Box>

            <form onSubmit={handleSubmit}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="گرووپ"
                    name="category_id"
                    select
                    value={formData.category_id}
                    onChange={handleChange}
                    sx={{ marginBottom: 2 }}
                  >
                    {categories.map((category) => (
                      <MenuItem key={category.id} value={category.id}>
                        {category.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="کۆد"
                    name="code"
                    value={formData.code}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    InputProps={{
                      endAdornment: formData.code && (
                        <InputAdornment position="end">
                           <IconButton onClick={() => clearTextField(setFormData, 'code')} edge="end"> {/* Use utility */}
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ناو"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    required
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      endAdornment: formData.name && (
                        <InputAdornment position="end">
                           <IconButton onClick={() => clearTextField(setFormData, 'name')} edge="end"> {/* Use utility */}
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
                    label="مۆبایلی١"
                    name="phone_1"
                    value={formData.phone_1}
                    required
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }} 
                    InputProps={{
                      endAdornment: formData.phone_1 && (
                        <InputAdornment position="end">
                           <IconButton onClick={() => clearTextField(setFormData, 'phone_1')} edge="end"> {/* Use utility */}
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
                    label="مۆبایلی٢"
                    name="phone_2"
                    value={formData.phone_2}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }} 
                    InputProps={{
                      endAdornment: formData.phone_2 && (
                        <InputAdornment position="end">
                           <IconButton onClick={() => clearTextField(setFormData, 'phone_2')} edge="end"> {/* Use utility */}
                           <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="شار"
                    name="city"
                    select
                    value={formData.city}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }}
                  
                  >
                    <MenuItem value="سلێمانی">سلێمانی</MenuItem>
                    <MenuItem value="هەولێر">هەولێر</MenuItem>
                    <MenuItem value="دهۆک">دهۆک</MenuItem>
                    <MenuItem value="هەڵەبجە">هەڵەبجە</MenuItem>
                    <MenuItem value="ڕانیە">ڕانیە</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
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
                           <IconButton onClick={() => clearTextField(setFormData, 'address')} edge="end"> {/* Use utility */}
                           <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="جۆری مامەڵە"
                    name="type"
                    select
                    value={formData.type}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    required
                    sx={{ marginBottom: 2 }}
                   
                  >
                    <MenuItem value="هەردووکی">هەردووکی</MenuItem>
                    <MenuItem value="کڕین">کڕین</MenuItem>
                    <MenuItem value="فرۆشتن">فرۆشتن</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="حاڵەت"
                    name="state"
                    select
                    value={formData.state}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }}
                    
                  >
                    <MenuItem value="چالاک">چالاک</MenuItem>
                    <MenuItem value="ناچالاک">ناچالاک</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="text"
                    label="مۆڵەتی قەرز"

                    name="limit_loan_day"
                    value={formData.limit_loan_day} // Display formatted number
                    onChange={(e) => handleChangeNumber(e, setFormData)} // Updated call
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      endAdornment: formData.limit_loan_day && (
                        <InputAdornment position="end">
                           <IconButton onClick={() => clearTextField(setFormData, 'limit_loan_day')} edge="end"> {/* Use utility */}
                           <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="text"
                    label="سنوری قەرز"
                    name="limit_loan_price"
                    value={formData.limit_loan_price}
                    onChange={(e) => handleChangeNumber(e, setFormData)} // Updated call
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      endAdornment: formData.limit_loan_price && (
                        <InputAdornment position="end">
                           <IconButton onClick={() => clearTextField(setFormData, 'limit_loan_price')} edge="end"> {/* Use utility */}
                           <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

               <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ناوی کەفیل"
                    name="kafyl_name"
                    value={formData.kafyl_name}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }} 
                    InputProps={{
                      endAdornment: formData.kafyl_name && (
                        <InputAdornment position="end">
                           <IconButton onClick={() => clearTextField(setFormData, 'kafyl_name')} edge="end"> {/* Use utility */}
                           <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="مۆبایلی کەفیل"
                    name="kafyl_phone"
                    value={formData.kafyl_phone}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }} 
                    InputProps={{
                      endAdornment: formData.kafyl_phone && (
                        <InputAdornment position="end">
                           <IconButton onClick={() => clearTextField(setFormData, 'kafyl_phone')} edge="end"> {/* Use utility */}
                           <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    type="text"
                    label="کۆبۆن"
                    name="cobon"
                    value={formData.cobon}
                    onChange={(e) => handleChangeNumber(e, setFormData)} // Updated call
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      endAdornment: formData.cobon && (
                        <InputAdornment position="end">
                           <IconButton onClick={() => clearTextField(setFormData, 'cobon')} edge="end"> {/* Use utility */}
                           <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>    


              </Grid>        


            <Grid container spacing={2}>
              
              <Grid item xs={12}>
                
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
                           <IconButton onClick={() => clearTextField(setFormData, 'note')} edge="end"> {/* Use utility */}
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
                      <Button
                        fullWidth
                        type="submit"
                        color="success"
                        variant="contained"
                        disabled={loading}
                      >
                        {loading ? 'Processing...' : id ? 'نوێکردنەوە' : 'تۆمارکردن'}
                      </Button>
                    </Grid>
                    <Grid item xs={3}>
                      <Button fullWidth variant="contained" color="warning" onClick={() => resetForm(setFormData, initialFormData)}>
                        پاکردنەوە
                      </Button>
                    </Grid>
                  </Grid>
                </Box>
            </form>
          </Box>
        </Card>
      </Box>

      {/* Snackbar for Success Message */}
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

export default CustomerRegister;