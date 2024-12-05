import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  IconButton,
  Card,
  Grid,
  Pagination,
  TextField,
  InputAdornment,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Snackbar,
  Alert,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import PrintIcon from '@mui/icons-material/Print';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ClearIcon from '@mui/icons-material/Clear';
import axiosInstance from '../../components/service/axiosInstance';

function CustomerList({ isDrawerOpen }) {
  const navigate = useNavigate();

  // State Initialization
  const [customers, setCustomers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const rowsPerPage = 5;

  // Fetch Customers from API
  useEffect(() => {
    axiosInstance
      .get('/customer/list')
      .then((response) => {
        if (response.data.success) {
          setCustomers(response.data.data);
        }
      })
      .catch((error) => {
        console.error('Failed to fetch customers:', error);
      });
  }, []);

  // Sorting Logic
  const handleSort = (key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
    }
    return null;
  };

  // Clear Search
  const handleClearSearch = () => setSearchQuery('');

  // Delete Handlers
  const handleDeleteClick = (id) => {
    setSelectedCustomerId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = () => {
    axiosInstance
      .delete(`/customer/delete/${selectedCustomerId}`)
      .then(() => {
        setCustomers((prev) => prev.filter((customer) => customer.id !== selectedCustomerId));
        setOpenDialog(false);
        setSnackbarMessage('کڕیاری دیاریکراو سڕایەوە');
        setSnackbarOpen(true);
      })
      .catch((error) => console.error('Failed to delete customer:', error));
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedCustomerId(null);
  };

  // Snackbar Handler
  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Sorting and Filtering Logic
  const sortedCustomers = [...customers].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] < b[sortConfig.key] ? -1 : 1;
    }
    return a[sortConfig.key] > b[sortConfig.key] ? -1 : 1;
  });

  const filteredCustomers = sortedCustomers.filter(
    (customer) =>
      (customer.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (customer.phone_1 || '').includes(searchQuery) ||
      (customer.city || '').toLowerCase().includes(searchQuery) ||
      (customer.category?.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination Logic
  const indexOfLastCustomer = currentPage * rowsPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - rowsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const handleAddCustomer = () => navigate('/customer/register');
  const handleEditCustomer = (id) => navigate(`/customer/edit/${id}`);

  return (
    <>
      <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
        <Card sx={{ margin: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Box p={2}>
                {/* Search and Add Customer */}
                <Box mb={3} display="flex" justifyContent="space-between">
                  <TextField
                    label="گەڕان"
                    variant="outlined"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    sx={{ width: '50%' }}
                    InputProps={{
                      endAdornment: searchQuery && (
                        <InputAdornment position="end">
                          <IconButton onClick={handleClearSearch}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                   <Box display="flex" gap={2}>
                      <Button
                        variant="contained"
                        color="success"
                        startIcon={<AddIcon />}
                        onClick={handleAddCustomer}
                        sx={{ mb: 2 }}
                      >
                        زیادکردن
                      </Button>

                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PrintIcon />}
                        
                        sx={{ mb: 2 }}
                      >
                        پرینت
                      </Button>
                    </Box>
                </Box>

                {/* Customer Table */}
                <TableContainer component={Paper}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                          #
                          {getSortIcon('id')}
                        </TableCell>
                        <TableCell>گرووپ</TableCell>
                        <TableCell onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                          ناو
                          {getSortIcon('name')}
                        </TableCell>
                        <TableCell>مۆبایل</TableCell>
                        <TableCell onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                          جۆر
                          {getSortIcon('type')}
                        </TableCell>
                        <TableCell>شار</TableCell>
                        <TableCell>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {currentCustomers.length > 0 ? (
                        currentCustomers.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>{customer.id}</TableCell>
                            <TableCell>{customer.category?.name}</TableCell>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell>{customer.phone_1}</TableCell>
                            <TableCell style={{
                                  color: customer.type === 'فرۆشتن' ? 'green' : customer.type === 'کڕین' ? 'red' : 'blue',
                           
                                }}>{customer.type}</TableCell>
                            <TableCell>{customer.city}</TableCell>
                            <TableCell>
                              <IconButton color="primary" onClick={() => handleEditCustomer(customer.id)}>
                                <EditIcon />
                              </IconButton>
                              <IconButton color="secondary" onClick={() => handleDeleteClick(customer.id)}>
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} align="center">
                            هیچ داتایەک نەدۆزرایەوە
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </TableContainer>

                {/* Pagination */}
                <Box mt={2} display="flex" justifyContent="center">
                  <Pagination
                    count={Math.ceil(filteredCustomers.length / rowsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Card>
      </Box>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>سڕینەوەی کڕیار</DialogTitle>
        <DialogContent>
          <DialogContentText>ئایە دڵنیایت لە سڕینەوەی ئەم کڕیارە؟</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            پاشگەزبوونەوە
          </Button>
          <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>
            سڕینەوە
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default CustomerList;
