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
} from '@mui/material';
import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import { clearTextField, handleChange, resetForm } from '../../components/utils/formUtils';
import ConfirmDialog from '../../components/utils/ConfirmDialog';

function ZoneManagement({ isDrawerOpen }) {
  const initialFormData = { name: '', description: '' };
  const rowsPerPage = 5;

  // States
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedZoneId, setSelectedZoneId] = useState(null);
  const [fetching, setFetching] = useState(false);

  // Fetch zones
  useEffect(() => {
    const fetchZones = async () => {
      setFetching(true);
      try {
        const response = await axiosInstance.get('/zone/index');
        if (response.status === 200) {
          setZones(response.data || []);
        }
      } catch (error) {
        console.error('Error fetching zones:', error);
        setErrorMessage('هەڵە ڕوویدا لە بارکردنی زانیاری');
      } finally {
        setFetching(false);
      }
    };
    fetchZones();
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    // Validate form fields
    const errors = {};
    if (!formData.name.trim()) {
      errors.name = 'ناوی زۆن پێویستە بنووسرێت';
    }
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      let response;
      if (selectedZoneId) {
        response = await axiosInstance.put(`/zone/update/${selectedZoneId}`, formData);
      } else {
        response = await axiosInstance.post('/zone/store', formData);
      }

      if (response.status === 200 || response.status === 201) {
        const updatedZones = await axiosInstance.get('/zone/index');
        setZones(updatedZones.data);
        setSuccess(true);
        resetForm(setFormData, initialFormData);
        setSelectedZoneId(null);
        setFormErrors({});
      } else {
        setErrorMessage(response.data.message || 'هەڵە ڕوویدا لە جێبەجێکردندا');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.data?.error) {
        if (error.response.data.error === 'ناوی زۆن پێشتر تۆمارکراوە') {
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
  const handleEditClick = (zone) => {
    setSelectedZoneId(zone.id);
    setFormData({ name: zone.name, description: zone.description });
    setFormErrors({});
  };

  // Handle Delete
  const handleDeleteClick = (id) => {
    setSelectedZoneId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/zone/delete/${selectedZoneId}`);
      setZones((prev) => prev.filter((zone) => zone.id !== selectedZoneId));
      setOpenDialog(false);
      setSelectedZoneId(null);
      setSuccess(true);
    } catch (error) {
      console.error('Error deleting zone:', error.response || error.message || error);
      setErrorMessage('هەڵە ڕوویدا لەسڕینەوە');
    }
  };

  // Pagination
  const indexOfLastZone = currentPage * rowsPerPage;
  const indexOfFirstZone = indexOfLastZone - rowsPerPage;
  const currentZones = zones.slice(indexOfFirstZone, indexOfLastZone);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const handleSnackbarClose = () => setSuccess(false);
  const handleErrorSnackbarClose = () => setErrorMessage('');
  const handleDialogClose = () => setOpenDialog(false);
  const handleChangeWithErrorReset = (e, setFormData) => {
    setErrorMessage('');
    setFormErrors((prevErrors) => ({ ...prevErrors, [e.target.name]: '' }));
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
                {selectedZoneId ? 'گۆڕینی زۆن' : 'زیادکردنی زۆن'}
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="ناوی زۆن"
                  name="name"
                  value={formData.name}
                  onChange={(e) => handleChangeWithErrorReset(e, setFormData)}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
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
                  {loading ? 'Loading...' : selectedZoneId ? 'نوێکردنەوە' : 'تۆمارکردن'}
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
                    <TableCell>ناوی زۆن</TableCell>
                    <TableCell>وەسف</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                {fetching ? (
                  <Typography align="center">بارکردن...</Typography>
                ) : (
                  <TableBody>
                    {currentZones.length > 0 ? (
                      currentZones.map((zone) => (
                        <TableRow key={zone.id}>
                          <TableCell>{zone.id}</TableCell>
                          <TableCell>{zone.name}</TableCell>
                          <TableCell>{zone.description}</TableCell>
                          <TableCell>
                            <IconButton color="primary" onClick={() => handleEditClick(zone)}>
                              <EditIcon />
                            </IconButton>
                            <IconButton color="secondary" onClick={() => handleDeleteClick(zone.id)}>
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
              {zones.length > 0 && (
                <Pagination
                  count={Math.ceil(zones.length / rowsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              )}
            </Box>
          </Card>
        </Grid>
      </Grid>


      <ConfirmDialog
        open={openDialog}
        onClose={handleDialogClose}
        onConfirm={handleDeleteConfirm}
        title="سڕینەوەی زۆن"
        description="ئایە دڵنیایت لە سڕینەوەی ئەم زۆنە ئەم کردارە گەرێنەوە نییە."
        confirmText="سڕینەوە"
        cancelText="پاشگەزبوونەوە"
      />

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

export default ZoneManagement;
