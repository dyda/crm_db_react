import React, { useState, useEffect } from 'react';
import axiosInstance from '../../components/service/axiosInstance';
import { Card, Typography, Box, TextField, Button, MenuItem, IconButton, InputAdornment, Avatar,Snackbar, Alert  } from '@mui/material';
import ClearIcon from '@mui/icons-material/Clear';
import Grid from '@mui/material/Grid';
import { clearTextField, handleChange, resetForm } from '../../components/utils/formUtils';

function CompanyRegister({ isDrawerOpen }) {
  
  const initialFormData = {
    name: '',
    phone_1: '',
    phone_2: '',
    address: '',
    tagline: '',
    logo: '',
    email: '',
    currency_type: '',
    currency_symbol: '',
    note: '',
  };

  const [formData, setFormData] = useState(initialFormData);
  const [logoFile, setLogoFile] = useState(null);
  const [companyId, setCompanyId] = useState(null);
  const [openSnackbar, setOpenSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');


  const currencyMapping = {
    دینار: "IQD",
    دۆلار: "$",
    پاوەند: "£",
    یۆرۆ: "€",
  };



 // Fetch the latest company data when the component mounts
  useEffect(() => {

    fetchLatestCompany();
  }, []);

  const fetchLatestCompany = async () => {
    try {
        const response = await axiosInstance.get('company/show'); // Assume it returns the last inserted company
   
        if (response.data.data && response.data.data.id) {
          
          
            const companyResponse = await axiosInstance.get(`company/edit/${response.data.data.id}`);

         
            // Construct the full URL for the logo
            const logoUrl = companyResponse.data.data.logo_1 
                ? `http://127.0.0.1:8000/storage/${companyResponse.data.data.logo_1}` 
                : '';

            setFormData({
                ...companyResponse.data.data,
                logo: logoUrl, // Set the logo field to the full URL
            });
            setCompanyId(response.data.data.id);
        }
    } catch (error) {
        console.error('Error fetching company data:', error.response?.data || error.message);
    }
};

  const handleCurrencyChange = (e) => {
    const selectedCurrency = e.target.value;
    setFormData((prevData) => ({
      ...prevData,
      currency_type: selectedCurrency,
      currency_symbol: currencyMapping[selectedCurrency],
    }));
  };

  // Handle image selection and preview
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setLogoFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prevData) => ({
          ...prevData,
          logo: e.target.result, // Set the preview image
        }));
      };
      reader.readAsDataURL(file); // This will allow preview
    }
  };

// Inside the handleSubmit function
const handleSubmit = async (e) => {
  e.preventDefault();

  const cleanFormData = { ...formData };
  Object.keys(cleanFormData).forEach((key) => {
      if (cleanFormData[key] === null || cleanFormData[key] === undefined) {
          cleanFormData[key] = ''; // Replace null or undefined values with empty strings
      }
  });

  const formDataToSend = new FormData();
  Object.entries(cleanFormData).forEach(([key, value]) => {
      formDataToSend.append(key, value);
  });

  if (logoFile) {
      formDataToSend.append('logo_1', logoFile);
  }

  try {
      if (companyId) {
          formDataToSend.append('_method', 'PUT');
          const response = await axiosInstance.post(`company/update/${companyId}`, formDataToSend, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });
          console.log('Company Updated:', response.data);

          setSnackbarMessage('گۆڕانکارییەکان جێبەجێکرا');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);

          fetchLatestCompany();
      } else {
          const response = await axiosInstance.post('company/store', formDataToSend, {
              headers: {
                  'Content-Type': 'multipart/form-data',
              },
          });

          setCompanyId(response.data.data.id);
          setSnackbarMessage('زانیاری کۆمپانیا تۆمارکرا');
          setSnackbarSeverity('success');
          setOpenSnackbar(true);

          fetchLatestCompany();
      }

      resetForm(setFormData, initialFormData);
      setLogoFile(null);
  } catch (error) {
      console.error('Error submitting company data:', error.response?.data || error.message);

      if (error.response && error.response.status === 422) {
          console.log('Validation errors:', error.response.data.errors);
          setSnackbarMessage('Validation errors occurred. Please check your inputs.');
      } else {
          setSnackbarMessage('Error submitting company data.');
      }

      setSnackbarSeverity('error');
      setOpenSnackbar(true);
  }
};

  return (
    <>
    <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
      <Card sx={{ margin: 1 }}>
        <Box sx={{ padding: 2, textAlign: 'right' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <Typography variant="h6" gutterBottom>
              زانیاری کۆمپانیا
            </Typography>
          </Box>
          <form onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {/* Text Fields for Input */}
              <Grid item xs={12} md={4}>
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

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="ژمارەی مۆبایل١"
                    name="phone_1"
                    value={formData.phone_1}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
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

                <Grid item xs={12} md={4}>
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
                <Grid item xs={12} md={6}>
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

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="تێبینی سەر وەصڵ"
                    name="tagline"
                    value={formData.tagline}
                    onChange={(e) => handleChange(e, setFormData)} // Use utility
                    sx={{ marginBottom: 2 }} 
                    InputProps={{
                      endAdornment: formData.tagline && (
                        <InputAdornment position="end">
                           <IconButton onClick={() => clearTextField(setFormData, 'tagline')} edge="end"> {/* Use utility */}
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
                  label="جۆری دراو"
                  name="currency_type"
                  select
                  value={formData.currency_type}
                  onChange={(e) => handleCurrencyChange(e, setFormData)} // Updated function
                  sx={{ marginBottom: 2 }}
                >
                  <MenuItem value="دینار">دینار</MenuItem>
                  <MenuItem value="دۆلار">دۆلار</MenuItem>
                  <MenuItem value="پاوەند">پاوەند</MenuItem>
                  <MenuItem value="یۆرۆ">یۆرۆ</MenuItem>
                </TextField>
              </Grid>

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="هێمای دراو"
                    name="currency_symbol"
                    value={formData.currency_symbol} // This will automatically be set by handleCurrencyChange
                    sx={{ marginBottom: 2 }}
                    InputProps={{
                      readOnly: true, // Optional: make the field read-only if users shouldn't modify it manually
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={4}>
              <TextField
                  fullWidth
                  type="email" // Set the type to "email"
                  label="ئیمەیڵ"
                  name="email"
                  value={formData.email}
                  onChange={(e) => handleChange(e, setFormData)} // Use utility
                  sx={{ marginBottom: 2 }}
                  InputProps={{
                    endAdornment: formData.email && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => clearTextField(setFormData, 'email')} edge="end">
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                </Grid>  
                          
              </Grid>

              <Grid container spacing={2}>
              
              <Grid item xs={12} md={8}>
                
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

              <Grid item xs={12} md={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                  <Button variant="contained" component="label">
                    هەڵبژاردنی لۆگۆ
                    <input
                      type="file"
                      hidden
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </Button>
                  <Avatar
                    alt="Logo"
                    src={formData.logo || ''}
                    sx={{ width: 80, height: 80 }}
                  />
                  {formData.logo && (
                    <IconButton onClick={() => clearTextField(setFormData, 'logo')} edge="end">
                      <ClearIcon />
                    </IconButton>
                  )}
                </Box>
              </Grid>
            </Grid>

                


            <Box marginTop={"10px"}>
              <Grid container spacing={2}>
                <Grid item xs={9}>
                  <Button fullWidth type="submit" color="success" variant="contained">
                    {companyId ? 'دەستکاری' : 'تۆمارکردن'}
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
    <Snackbar
                open={openSnackbar}
                autoHideDuration={3000}
                onClose={() => setOpenSnackbar(false)}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <Alert onClose={() => setOpenSnackbar(false)} severity={snackbarSeverity} sx={{ width: '100%' }}>
                    {snackbarMessage}
                </Alert>
            </Snackbar>
    </>
  );
}

export default CompanyRegister;