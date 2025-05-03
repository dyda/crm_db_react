// React and Hooks import
import React, { useState, useEffect } from 'react';

// Axios instance for API calls
import axiosInstance from '../../components/service/axiosInstance';

// MUI components for layout, form, table, feedback, and icons
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
  MenuItem,
  CircularProgress,
} from '@mui/material';

import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

// Utility functions for form handling
import {
  clearTextField,
  handleChange,
  resetForm,
} from '../../components/utils/formUtils';

// Main RegionManagement component
function RegionManagement({ isDrawerOpen }) {
  // Initial state for the form fields
  const initialFormData = {
    name: '',
    zone_id: '',
    city_id: '',
    user_id: '',
    description: '',
    sales_target:'',
    type:''
  };

  const rowsPerPage = 5;

  // State hooks
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [zones, setZones] = useState([]);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [fetching, setFetching] = useState(false);

  // Fetch all dropdown and table data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setFetching(true);
    try {
      const [zoneRes, cityRes, regionRes, userRes] = await Promise.all([
        axiosInstance.get('/zone/index'),
        axiosInstance.get('/city/index'),
        axiosInstance.get('/region/index'),
        axiosInstance.get('/user/index'),
      ]);

      if (zoneRes.status === 200) setZones(zoneRes.data || []);
      if (cityRes.status === 200) setCities(cityRes.data || []);
      if (regionRes.status === 200) setRegions(regionRes.data || []);
      if (userRes.status === 200) setUsers(userRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('هەڵە ڕوویدا لە بارکردنی داتا');
    } finally {
      setFetching(false);
    }
  };

  // Form submit handler (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Validate required fields
    const errors = {};
    if (!formData.name.trim()) errors.name = 'ناوی ناوچە پێویستە';
    if (!formData.zone_id) errors.zone_id = 'زۆن دیاری بکە';
    if (!formData.city_id) errors.city_id = 'شار دیاری بکە';
    if (!formData.user_id) errors.user_id = 'بەڕێوبەر دیاری بکە';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      let response;
      if (selectedRegionId) {
        response = await axiosInstance.put(`/region/update/${selectedRegionId}`, formData);
      } else {
        response = await axiosInstance.post('/region/store', formData);
      }

      console.log('Response:',response);

      if (response.status === 200 || response.status === 201) {
        fetchAllData();
        setSuccess(true);
        resetForm(setFormData, initialFormData);
        setSelectedRegionId(null);
        setFormErrors({});
      } else {
        setErrorMessage(response.data.message || 'هەڵە ڕوویدا');
      }
    } catch (error) {
      console.error('Error saving region:', error);
      setErrorMessage('هەڵە ڕوویدا لە تۆمارکردن');
    } finally {
      setLoading(false);
    }
  };

  // Load data for edit
  const handleEditClick = (region) => {
    setSelectedRegionId(region.id);
    setFormData({
      name: region.name || '',
      zone_id: region.zone_id || '',
      city_id: region.city_id || '',
      user_id: region.employee_id || '',
      description: region.description || '',
      sales_target: region.sales_target || '',
      type: region.type || '',
    });
    setFormErrors({});
  };

  // Open confirmation dialog before delete
  const handleDeleteClick = (id) => {
    setSelectedRegionId(id);
    setOpenDialog(true);
  };

  // Confirm deletion
  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/region/delete/${selectedRegionId}`);
      setRegions((prev) => prev.filter((region) => region.id !== selectedRegionId));
      setOpenDialog(false);
      setSelectedRegionId(null);
      setSuccess(true);
    } catch (error) {
      console.error('Error deleting region:', error);
      setErrorMessage('هەڵە ڕوویدا لە سڕینەوە');
    }
  };

  // Pagination logic
  const currentRegions = regions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const handlePageChange = (_, value) => setCurrentPage(value);

  // Snackbars and dialogs
  const handleSnackbarClose = () => setSuccess(false);
  const handleErrorSnackbarClose = () => setErrorMessage('');
  const handleDialogClose = () => setOpenDialog(false);

  // Input change handler with error reset
  const handleChangeWithErrorReset = (e, setFormData) => {
    setErrorMessage('');
    setFormErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: '' }));
    handleChange(e, setFormData);
  };

  // Clear select input field
  const clearSelectField = (field) => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
  };

  return (
    <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s' }}>
      <Grid container spacing={2}>
        {/* Form Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ margin: 1, padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedRegionId ? 'گۆڕینی ناوچە' : 'زیادکردنی ناوچە'}
            </Typography>
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <TextField
                fullWidth
                label="ناوی ناوچە"
                name="name"
                value={formData.name}
                onChange={(e) => handleChangeWithErrorReset(e, setFormData)}
                error={!!formErrors.name}
                helperText={formErrors.name}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.name && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearTextField(setFormData, 'name')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Zone Select */}
              <TextField
                select
                fullWidth
                label="زۆن"
                name="zone_id"
                value={formData.zone_id}
                onChange={(e) => handleChangeWithErrorReset(e, setFormData)}
                error={!!formErrors.zone_id}
                helperText={formErrors.zone_id}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.zone_id && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('zone_id')}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              >
                {zones.map((zone) => (
                  <MenuItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* City Select */}
              <TextField
                select
                fullWidth
                label="شار"
                name="city_id"
                value={formData.city_id}
                onChange={(e) => handleChangeWithErrorReset(e, setFormData)}
                error={!!formErrors.city_id}
                helperText={formErrors.city_id}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.city_id && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('city_id')}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              >
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* User Select */}
              <TextField
                select
                fullWidth
                label="بەڕێوبەر"
                name="user_id"
                value={formData.user_id}
                onChange={(e) => handleChangeWithErrorReset(e, setFormData)}
                error={!!formErrors.user_id}
                helperText={formErrors.user_id}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.user_id && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('user_id')}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              >
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>

              {/* Type Field */}
              <TextField
                fullWidth
                label="جۆری ناوچە"
                name="type"
                value={formData.type}
                onChange={(e) => handleChange(e, setFormData)}

                rows={3}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.type && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('type')}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
                  {/* Target Field */}
                   <TextField
                fullWidth
                label="ئامانجی فرۆشتن"
                name="sales_target"
                type="number" // ✅ Accept numbers only
                value={formData.sales_target}
                onChange={(e) => handleChange(e, setFormData)}
                
                rows={3}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.sales_target && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('sales_target')}>
                        <CloseIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {/* Description Field */}
              <TextField
                fullWidth
                label="وەسف"
                name="description"
                value={formData.description}
                onChange={(e) => handleChange(e, setFormData)}
                multiline
                rows={3}
                sx={{ mb: 2 }}
              />

              {/* Submit Button */}
              <Button type="submit" fullWidth variant="contained" color="success" disabled={loading}>
                {loading ? 'Loading...' : selectedRegionId ? 'نوێکردنەوە' : 'تۆمارکردن'}
              </Button>
            </form>
          </Card>
        </Grid>

        {/* Table Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ margin: 1 }}>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>ناوی ناوچە</TableCell>
                    <TableCell>زۆن</TableCell>
                    <TableCell>شار</TableCell>
                    <TableCell>بەڕێوبەر</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fetching ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : currentRegions.length > 0 ? (
                    currentRegions.map((region) => (
                      <TableRow key={region.id}>
                        <TableCell>{region.id}</TableCell>
                        <TableCell>{region.name}</TableCell>
                        <TableCell>{region.zone_name}</TableCell>
                        <TableCell>{region.city_name}</TableCell>
                        <TableCell>{region.user_name}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEditClick(region)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="secondary" onClick={() => handleDeleteClick(region.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} align="center">
                        هیچ داتایەک نەدۆزرایەوە
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box mt={2} display="flex" justifyContent="center">
              {regions.length > 0 && (
                <Pagination
                  count={Math.ceil(regions.length / rowsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>سڕینەوەی ناوچە</DialogTitle>
        <DialogContent>
          <DialogContentText>ئایە دڵنیایت لە سڕینەوەی ئەم ناوچەیە؟</DialogContentText>
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

export default RegionManagement;
