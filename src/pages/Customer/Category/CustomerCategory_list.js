import React, { useState, useEffect } from 'react';
import axiosInstance from '../../../components/service/axiosInstance';
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
import { clearTextField, handleChange, resetForm } from '../../../components/utils/formUtils';

function CustomerCategoryManagement({ isDrawerOpen }) {
  const initialFormData = { name: '', note: '' };
  const rowsPerPage = 5;

  // States
  const [formData, setFormData] = useState(initialFormData);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/customer_category/list');
        if (response.status === 200) {
          setCategories(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching customer categories:', error);
        setErrorMessage('هەڵە ڕوویدا لە بارکردنی زانیاری');
      }
    };
    fetchCategories();
  }, []);

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    try {
      let response;
      if (selectedCategoryId) {
        // Update category
        response = await axiosInstance.put(`/customer_category/update/${selectedCategoryId}`, formData);
      } else {
        // Add new category
        response = await axiosInstance.post('/customer_category/store', formData);
      }

      if (response.status === 200 || response.status === 201) {
        const updatedCategories = await axiosInstance.get('/customer_category/list');
        setCategories(updatedCategories.data.data);
        setSuccess(true);
        resetForm(setFormData, initialFormData);
        setSelectedCategoryId(null);
      } else {
        setErrorMessage(response.data.message || 'هەڵە ڕوویدا لە جێبەجێکردندا');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('هەڵە ڕوویدا لەپەیوەست بوون بەسێرفەرەوە');
    } finally {
      setLoading(false);
    }
  };

  // Handle Edit
  const handleEditClick = (category) => {
    setSelectedCategoryId(category.id);
    setFormData(category);
  };

  // Handle Delete
  const handleDeleteClick = (id) => {
    setSelectedCategoryId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/customer_category/delete/${selectedCategoryId}`);
      setCategories((prev) => prev.filter((category) => category.id !== selectedCategoryId));
      setOpenDialog(false);
      setSelectedCategoryId(null);
      setSuccess(true);
    } catch (error) {
      console.error('Error deleting category:', error);
      setErrorMessage('هەڵە ڕوویدا لەسڕینەوە');
    }
  };

  // Pagination
  const indexOfLastCategory = currentPage * rowsPerPage;
  const indexOfFirstCategory = indexOfLastCategory - rowsPerPage;
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const handleSnackbarClose = () => setSuccess(false);
  const handleErrorSnackbarClose = () => setErrorMessage('');
  const handleDialogClose = () => setOpenDialog(false);

  return (
    <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
      <Grid container spacing={2}>
        {/* Form Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ margin: 1 }}>
            <Box sx={{ padding: 2 }}>
              <Typography variant="h6" gutterBottom>
                {selectedCategoryId ? 'گۆڕینی گرووپ' : 'زیادکردنی گرووپ'}
              </Typography>
              <form onSubmit={handleSubmit}>
                <TextField
                  fullWidth
                  label="ناو"
                  name="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange(e, setFormData)}
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
                  label="تێبینی"
                  name="note"
                  multiline
                  rows={3}
                  value={formData.note}
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
                  {loading ? 'Loading...' : selectedCategoryId ? 'نوێکردنەوە' : 'تۆمارکردن'}
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
                    <TableCell>ناو</TableCell>
                    <TableCell>تێبینی</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {currentCategories.length > 0 ? (
                    currentCategories.map((category) => (
                      <TableRow key={category.id}>
                        <TableCell>{category.id}</TableCell>
                        <TableCell>{category.name}</TableCell>
                        <TableCell>{category.note}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEditClick(category)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="secondary" onClick={() => handleDeleteClick(category.id)}>
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
              </Table>
            </TableContainer>
            <Box mt={2} display="flex" justifyContent="center">
              <Pagination
                count={Math.ceil(categories.length / rowsPerPage)}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      {/* Dialog for Deletion */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>سڕینەوەی گرووپ</DialogTitle>
        <DialogContent>
          <DialogContentText>ئایە دڵنیایت لەسڕینەوەی ئەم گرووپە؟</DialogContentText>
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

export default CustomerCategoryManagement;
