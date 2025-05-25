// React and Hooks import
import React, { useState, useEffect } from 'react';

// Axios instance
import axiosInstance from '../../components/service/axiosInstance';

// MUI components
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
  Tooltip
} from '@mui/material';

import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Close as CloseIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import { debounce } from 'lodash'; // Import lodash for debouncing

// Utilities
import {
  clearTextField,
  handleChange,
  resetForm,
} from '../../components/utils/formUtils';

// Main component
function RegionManagement({ isDrawerOpen }) {
  const initialFormData = {
    name: '',
    zone_id: '',
    city_id: '',
    user_id: '',
    description: '',
    sales_target: '',
    type: '',
    search: '',
  };

  const rowsPerPage = 5;

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

      setZones(zoneRes.data || []);
      setCities(cityRes.data || []);
      setRegions(regionRes.data || []);
      setUsers(userRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      setErrorMessage('هەڵە ڕوویدا لە بارکردنی داتا');
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

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
      const response = selectedRegionId
        ? await axiosInstance.put(`/region/update/${selectedRegionId}`, formData)
        : await axiosInstance.post('/region/store', formData);

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

  const handleEditClick = (region) => {
    setSelectedRegionId(region.id);
    setFormData({
      name: region.name || '',
      zone_id: region.zone_id || '',
      city_id: region.city_id || '',
      user_id: region.user_id || '',
      description: region.description || '',
      sales_target: region.sales_target || '',
      type: region.type || '',
    });
    setFormErrors({});
  };

  const handleDeleteClick = (id) => {
    setSelectedRegionId(id);
    setOpenDialog(true);
  };

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

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, search: value }));
    debouncedSearch(value);
  };

  const debouncedSearch = debounce(async (searchValue) => {
    if (!searchValue.trim()) {
      fetchAllData();
      return;
    }

    setFetching(true);
    try {
      const response = await axiosInstance.get('/region/filter', {
        params: {
          region_id: searchValue,
          region_name: searchValue,
          city_name: searchValue,
          zone_name: searchValue,
          user_name: searchValue,
        },
      });

      if (response.status === 200) {
        setRegions(response.data || []);
      } else {
        setErrorMessage('هەڵە ڕوویدا لە گەڕان');
      }
    } catch (error) {
      console.error('Error searching regions:', error);
      setErrorMessage('هەڵە ڕوویدا لە گەڕان');
    } finally {
      setFetching(false);
    }
  }, 500);

  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, []);

  const currentRegions = regions.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const handlePageChange = (_, value) => setCurrentPage(value);

  const handleSnackbarClose = () => setSuccess(false);
  const handleErrorSnackbarClose = () => setErrorMessage('');
  const handleDialogClose = () => setOpenDialog(false);

  const handleChangeWithErrorReset = (e, setFormData) => {
    setErrorMessage('');
    setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    handleChange(e, setFormData);
  };

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

              {['zone_id', 'city_id', 'user_id'].map((field) => (
                <TextField
                  key={field}
                  select
                  fullWidth
                  label={field === 'zone_id' ? 'زۆن' : field === 'city_id' ? 'شار' : 'بەڕێوبەر'}
                  name={field}
                  value={formData[field]}
                  sx={{ mb: 2 }}
                  onChange={(e) => handleChangeWithErrorReset(e, setFormData)}
                  error={!!formErrors[field]}
                  helperText={formErrors[field]}
                  InputProps={{
                    endAdornment: formData[field] && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => clearSelectField(field)}>
                          <CloseIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                >
                  {(field === 'zone_id' ? zones : field === 'city_id' ? cities : users).map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.name || '—'}
                    </MenuItem>
                  ))}
                </TextField>
              ))}

              <TextField
                fullWidth
                label="جۆری ناوچە"
                name="type"
                value={formData.type}
                onChange={(e) => handleChange(e, setFormData)}
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

              <TextField
                fullWidth
                label="ئامانجی فرۆشتن"
                name="sales_target"
                type="number"
                value={formData.sales_target}
                onChange={(e) => handleChange(e, setFormData)}
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

              <Button type="submit" fullWidth variant="contained" color="success" disabled={loading}>
                {loading ? 'Loading...' : selectedRegionId ? 'نوێکردنەوە' : 'تۆمارکردن'}
              </Button>
            </form>
          </Card>
        </Grid>

        {/* Table Section */}
          <Grid item xs={12} md={8}>
         
           <Card sx={{ m: 1, p: 2 }}>

          <TextField
            fullWidth
            label="گەڕان"
            name="search"
            value={formData.search || ''}
            onChange={handleSearchChange}
            placeholder="ناوی ناوچە، شار، زۆن، بەڕێوبەر..."
            sx={{ mb: 2 }}

            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Tooltip title="هەموو داتاکان">
                  <IconButton onClick={fetchAllData}>
                    <SearchIcon />
                  </IconButton>
                </Tooltip>
                </InputAdornment>
              ),
            }}
          />     

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>ناوی ناوچە</TableCell>
                    <TableCell>زۆن</TableCell>
                    <TableCell>شار</TableCell>
                    <TableCell>جۆری ناوچە</TableCell>
                    <TableCell>ئامانجی فرۆشتن</TableCell>
                    <TableCell>بەڕێوبەر</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fetching ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
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
                        <TableCell>{region.type}</TableCell>
                        <TableCell>
                          {Number(region.sales_target || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </TableCell>
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
                      <TableCell colSpan={8} align="center">
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

      {/* Delete Dialog */}
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

      {/* Snackbars */}
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