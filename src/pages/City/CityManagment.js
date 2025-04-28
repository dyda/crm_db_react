import React, { useState, useEffect } from 'react';
import axiosInstance from '../../components/service/axiosInstance';
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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Pagination,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { clearTextField, handleChange, resetForm } from '../../components/utils/formUtils';

function CityManagement({ isDrawerOpen }) {
  const initialFormData = { name: '', description: '' };
  const rowsPerPage = 5;

  // States
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({}); // Track field errors
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState(null);
  const [fetching, setFetching] = useState(false);

  // Fetch cities
  useEffect(() => {
    const fetchCities = async () => {
      setFetching(true);
      try {
        const response = await axiosInstance.get('/city/index');
        if (response.status === 200) {
          setCities(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
        setErrorMessage('هەڵە ڕوویدا لە بارکردنی زانیاری');
      } finally {
        setFetching(false);
      }
    };
    fetchCities();
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Validate form fields
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'ناوی شار پێویستە بنووسرێت';
    }
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      let response;
      if (selectedCityId) {
        // Update city
        response = await axiosInstance.put(`/city/update/${selectedCityId}`, formData);
      } else {
        // Add new city
        response = await axiosInstance.post('/city/store', formData);
      }

      if (response.status === 200 || response.status === 201) {
        const updatedCities = await axiosInstance.get('/city/index');
        setCities(updatedCities.data);
        setSuccess(true);
        resetForm(setFormData, initialFormData);
        setSelectedCityId(null);
        setFormErrors({});
      } else {
        setErrorMessage(response.data.message || 'هەڵە ڕوویدا لە جێبەجێکردندا');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response && error.response.data && error.response.data.error) {
        // Handle duplicate validation error
        if (error.response.data.error === 'ناوی شار پێشتر تۆمارکراوە') {
          setFormErrors({ name: error.response.data.error });
        } else {
          setErrorMessage(error.response.data.error);
        }
      } else {
        setErrorMessage('هەڵە ڕوویدا لەپەیوەست بوون بەسێرفەرەوە');
      }
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit
  const handleEditClick = (city) => {
    setSelectedCityId(city.id);
    setFormData({ name: city.name, description: city.description });
    setFormErrors({});
  };

  // Handle Delete
  const handleDeleteClick = (id) => {
    setSelectedCityId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/city/delete/${selectedCityId}`);
      setCities((prev) => prev.filter((city) => city.id !== selectedCityId));
      setOpenDialog(false);
      setSelectedCityId(null);
      setSuccess(true);
    } catch (error) {
      console.error('Error deleting city:', error.response || error.message || error);
      setErrorMessage('هەڵە ڕوویدا لەسڕینەوە');
    }
  };

  // Pagination
  const indexOfLastCity = currentPage * rowsPerPage;
  const indexOfFirstCity = indexOfLastCity - rowsPerPage;
  const currentCities = cities.slice(indexOfFirstCity, indexOfLastCity);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const handleSnackbarClose = () => setSuccess(false);
  const handleErrorSnackbarClose = () => setErrorMessage('');
  const handleDialogClose = () => setOpenDialog(false);
  const handleChangeWithErrorReset = (e, setFormData) => {
    setErrorMessage('');
    setFormErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: '' })); // Clear error for the field
    handleChange(e, setFormData);
  };
  return (
    <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
      <Grid container spacing={2}>
        {/* Form Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ margin: 1 }}>
            <Box sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedCityId ? 'گۆڕینی شار' : 'زیادکردنی شار'}
              </Typography>
              <form onSubmit={handleSubmit}>
              <TextField
                    fullWidth
                    label="ناوی شار"
                    name="name"
                    value={formData.name}
                    onChange={(e) => handleChangeWithErrorReset(e, setFormData)}
                    error={!!formErrors.name} // Set red border if there's an error
                    helperText={formErrors.name} // Show error message
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
                <TextField
                  fullWidth
                  label="وەسف"
                  name="description"
                  multiline
                  rows={3}
                  value={formData.description}
                  onChange={(e) => handleChange(e, setFormData)}
                  sx={{ marginBottom: 2 }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  color="success"
                  fullWidth
                  disabled={loading}
                >
                  {loading ? 'Loading...' : selectedCityId ? 'نوێکردنەوە' : 'تۆمارکردن'}
                </Button>
              </form>
            </Box>
          </Card>
        </Grid>

        {/* List Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ margin: 1 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>ناوی شار</TableCell>
                    <TableCell>وەسف</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                {fetching ? (
  <Typography align="center">بارکردن...</Typography>
) : (
  <TableBody>
    {currentCities.length > 0 ? (
      currentCities.map((city) => (
        <TableRow key={city.id}>
          <TableCell>{city.id}</TableCell>
          <TableCell>{city.name}</TableCell>
          <TableCell>{city.description}</TableCell>
          <TableCell>
            <IconButton color="primary" onClick={() => handleEditClick(city)}>
              <EditIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => handleDeleteClick(city.id)}>
              <DeleteIcon />
            </IconButton>
          </TableCell>
        </TableRow>
      ))
    ) : (
      <TableRow>
        <TableCell colSpan={4} align="center">
          هیچ داتایەک نەدۆزرایەوە
        </TableCell>
      </TableRow>
    )}
  </TableBody>
)}
              </Table>
            </TableContainer>
            <Box mt={2} display="flex" justifyContent="center">
            {cities.length > 0 && (
                <Pagination
                    count={Math.ceil(cities.length / rowsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                />
                )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog for Deletion */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>سڕینەوەی شار</DialogTitle>
        <DialogContent>
          <DialogContentText>ئایە دڵنیایت لەسڕینەوەی ئەم شارە؟</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            پاشگەزبوونەوە
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary">
            سڕینەوە
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={success}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          جێبەجێکرا
        </Alert>
      </Snackbar>

      {/* Error Snackbar */}
      <Snackbar
        open={!!errorMessage}
        autoHideDuration={4000}
        onClose={handleErrorSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleErrorSnackbarClose} severity="error">
          {errorMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CityManagement;
