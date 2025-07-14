import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, Typography, TextField, IconButton, InputAdornment,
  Snackbar, Alert, MenuItem, Tooltip, CircularProgress, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, Pagination, TableFooter
} from '@mui/material';
import ConfirmDialog from '../../components/utils/ConfirmDialog';
import RegisterButton from '../../components/reports/common/RegisterButton';
import ClearButton from '../../components/reports/common/ClearButton';
import ReportButton from '../../components/reports/common/ReportButton';

import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';

import axiosInstance from '../../components/service/axiosInstance';

function RegionManagement({ isDrawerOpen }) {
  const initialFormData = {
    name: '',
    zone_id: '',
    city_id: '',
    description: '',
  };

  const rowsPerPage = 5;

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [zones, setZones] = useState([]);
  const [cities, setCities] = useState([]);
  const [regions, setRegions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedRegionId, setSelectedRegionId] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [filter, setFilter] = useState({
    zone_id: '',
    city_id: '',
    search: '',
  });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setFetching(true);
    try {
      const [zoneRes, cityRes, regionRes] = await Promise.all([
        axiosInstance.get('/zone/index'),
        axiosInstance.get('/city/index'),
        axiosInstance.get('/region/index'),
      ]);
      setZones(zoneRes.data || []);
      setCities(cityRes.data || []);
      setRegions(regionRes.data || []);
    } catch (err) {
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
    if (!formData.name.trim()) errors.name = 'ناوی گەڕەک پێویستە';
    if (!formData.zone_id) errors.zone_id = 'زۆن دیاری بکە';
    if (!formData.city_id) errors.city_id = 'شار دیاری بکە';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const response = selectedRegionId
        ? await axiosInstance.put(`/region/update/${selectedRegionId}`, formData)
        : await axiosInstance.post('/region/store', formData);

      if ([200, 201].includes(response.status)) {
        fetchAllData();
        setSuccess(true);
        setFormData(initialFormData);
        setSelectedRegionId(null);
        setFormErrors({});
      } else {
        setErrorMessage(response.data.message || 'هەڵە ڕوویدا');
      }
    } catch (err) {
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
      description: region.description || '',
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
      setRegions(prev => prev.filter(r => r.id !== selectedRegionId));
      setSuccess(true);
    } catch (err) {
      setErrorMessage('هەڵە ڕوویدا لە سڕینەوە');
    } finally {
      setOpenDialog(false);
      setSelectedRegionId(null);
    }
  };

  // Filter by zone, name, city
const handleSearchChange = async (e) => {
  const value = e.target.value;
  const newFilter = { ...filter, search: value };
  setFilter(newFilter);

  if (!value.trim()) {
    fetchAllData();
    return;
  }

  setFetching(true);
  try {
    const response = await axiosInstance.get('/region/filter', {
      params: {
        region_name: newFilter.search,
        zone_id: newFilter.zone_id,
        city_id: newFilter.city_id,
      },
    
    });
console.log(response);


    setRegions(response.status === 200 ? response.data : []);
  } catch {
    setErrorMessage('هەڵە ڕوویدا لە گەڕان');
  } finally {
    setFetching(false);
  }
};

  // Filter by zone or city select
const handleZoneCityFilter = async (field, value) => {
  const newFilter = { ...filter, [field]: value };
  setFilter(newFilter);
  setFetching(true);
  try {
    const response = await axiosInstance.get('/region/filter', {
      params: {
        region_name: newFilter.search,
        zone_id: newFilter.zone_id,
        city_id: newFilter.city_id,
      },
    });
    setRegions(response.status === 200 ? response.data : []);
  } catch {
    setErrorMessage('هەڵە ڕوویدا لە فلتەرکردن');
  } finally {
    setFetching(false);
  }
};

  const handlePageChange = (_, value) => setCurrentPage(value);
  const handleSnackbarClose = () => setSuccess(false);
  const handleErrorSnackbarClose = () => setErrorMessage('');
  const handleDialogClose = () => setOpenDialog(false);

  const handleChangeWithErrorReset = (e) => {
    const { name, value } = e.target;
    setErrorMessage('');
    setFormErrors(prev => ({ ...prev, [name]: '' }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearSelectField = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const handleClearForm = () => {
    setFormData(initialFormData);
    setFormErrors({});
    setSelectedRegionId(null);
    setErrorMessage('');
    fetchAllData();
  };

  const currentRegions = regions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s' }}>
      <Grid container spacing={2}>
        {/* Form Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ m: 1 }}>
            <Box sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedRegionId ? 'گۆڕینی گەڕەک' : 'زیادکردنی گەڕەک'}
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="ناوی گەڕەک"
                  name="name"
                  value={formData.name}
                  onChange={handleChangeWithErrorReset}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: formData.name && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => clearSelectField('name')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="زۆن"
                      name="zone_id"
                      value={formData.zone_id}
                      onChange={handleChangeWithErrorReset}
                      error={!!formErrors.zone_id}
                      helperText={formErrors.zone_id}
                      InputProps={{
                        endAdornment: formData.zone_id && (
                          <InputAdornment position="end">
                            <IconButton onClick={() => clearSelectField('zone_id')}>
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    >
                      {zones.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField
                      select
                      fullWidth
                      label="شار"
                      name="city_id"
                      value={formData.city_id}
                      onChange={handleChangeWithErrorReset}
                      error={!!formErrors.city_id}
                      helperText={formErrors.city_id}
                      InputProps={{
                        endAdornment: formData.city_id && (
                          <InputAdornment position="end">
                            <IconButton onClick={() => clearSelectField('city_id')}>
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    >
                      {cities.map((option) => (
                        <MenuItem key={option.id} value={option.id}>
                          {option.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  </Grid>
                </Grid>

                <TextField
                  fullWidth
                  label="وەسف"
                  name="description"
                  value={formData.description}
                  onChange={handleChangeWithErrorReset}
                  sx={{ mb: 2 }}
                  InputProps={{
                    endAdornment: formData.description && (
                      <InputAdornment position="end">
                        <IconButton onClick={() => clearSelectField('description')}>
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Grid container spacing={1}>
                  <Grid item xs={12} sm={6}>
                    <RegisterButton
                      loading={loading}
                      fullWidth
                      children={selectedRegionId ? 'نوێکردنەوە' : 'تۆمارکردن'}
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <ClearButton
                      onClick={handleClearForm}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <ReportButton
                      onClick={() => window.print()}
                      fullWidth
                    />
                  </Grid>
                </Grid>
              </form>
            </Box>
          </Card>
        </Grid>

        {/* Filter & Table Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ m: 1, p: 2 }}>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="زۆن"
                  name="zone_id"
                  value={filter.zone_id}
                  onChange={e => handleZoneCityFilter('zone_id', e.target.value)}
                >
                  <MenuItem value="">هەموو</MenuItem>
                  {zones.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  select
                  fullWidth
                  label="شار"
                  name="city_id"
                  value={filter.city_id}
                  onChange={e => handleZoneCityFilter('city_id', e.target.value)}
                >
                  <MenuItem value="">هەموو</MenuItem>
                  {cities.map((option) => (
                    <MenuItem key={option.id} value={option.id}>
                      {option.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="ناوی گەڕەک"
                  name="search"
                  value={filter.search}
                  onChange={handleSearchChange}
                  placeholder="گەڕەک..."
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
              </Grid>
            </Grid>
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>ناوی گەڕەک</TableCell>
                    <TableCell>زۆن</TableCell>
                    <TableCell>شار</TableCell>
                    <TableCell>وەسف</TableCell>
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
                        <TableCell>
                          {zones.find(z => z.id === region.zone_id)?.name || region.zone_id}
                        </TableCell>
                        <TableCell>
                          {cities.find(c => c.id === region.city_id)?.name || region.city_id}
                        </TableCell>
                        <TableCell>{region.description}</TableCell>
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
                        {filter.search ? 'هیچ داتایەک بە گەڕانەکەت نەدۆزرایەوە' : 'هیچ داتایەک نەدۆزرایەوە'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={4} align="right" sx={{ fontWeight: 'bold' }}>
                      ژمارەی گشتی :
                    </TableCell>
                    <TableCell colSpan={2} align="left" sx={{ fontWeight: 'bold' }}>
                      {regions.length}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
            {regions.length > rowsPerPage && (
              <Box mt={2} display="flex" justifyContent="center">
                <Pagination
                  count={Math.ceil(regions.length / rowsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      {/* Delete Dialog */}
      <ConfirmDialog
        open={openDialog}
        onClose={handleDialogClose}
        onConfirm={handleDeleteConfirm}
        title="سڕینەوەی گەڕەک"
        description="ئایە دڵنیایت لە سڕینەوەی ئەم گەڕەک؟ ئەم کردارە گەرێنەوە نییە."
        confirmText="سڕینەوە"
        cancelText="پاشگەزبوونەوە"
      />

      {/* Snackbars */}
      <Snackbar open={success} autoHideDuration={3000} onClose={handleSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleSnackbarClose} severity="success">جێبەجێکرا</Alert>
      </Snackbar>
      <Snackbar open={!!errorMessage} autoHideDuration={4000} onClose={handleErrorSnackbarClose} anchorOrigin={{ vertical: 'top', horizontal: 'right' }}>
        <Alert onClose={handleErrorSnackbarClose} severity="error">{errorMessage}</Alert>
      </Snackbar>
    </Box>
  );
}

export default RegionManagement;