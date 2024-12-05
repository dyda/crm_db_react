import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Button, IconButton,
  Card, Grid, Pagination, TextField, InputAdornment, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, Snackbar, Alert
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Print as PrintIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import axiosInstance from '../../components/service/axiosInstance';

function WarehouseList({ isDrawerOpen }) {
  const navigate = useNavigate();

  const [warehouses, setWarehouses] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const rowsPerPage = 5;

  // Fetch Warehouses
  useEffect(() => {
    const fetchWarehouses = async () => {
      try {
        const response = await axiosInstance.get('/warehouse/list');
        if (response.status === 200) {
          setWarehouses(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchWarehouses();
  }, []);

  // Handle Sorting
  const handleSort = useCallback((key) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  // Handle Clear Search
  const handleClear = useCallback(() => setSearchQuery(''), []);

  // Handle Deletion
  const handleDeleteClick = useCallback((id) => {
    setSelectedWarehouseId(id);
    setOpenDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      const response = await axiosInstance.delete(`/warehouse/delete/${selectedWarehouseId}`);
      if (response.status === 200) {
        setWarehouses((prev) => prev.filter((warehouse) => warehouse.id !== selectedWarehouseId));
        setShowSnackbar(true);
        setOpenDialog(false);
        setSelectedWarehouseId(null);
      }
    } catch (error) {
      console.error('Error deleting warehouse:', error);
    }
  }, [selectedWarehouseId]);

  // Computed Values
  const sortedWarehouses = useMemo(() => {
    const sorted = [...warehouses];
    sorted.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [warehouses, sortConfig]);

  const filteredWarehouses = useMemo(() => {
    return sortedWarehouses.filter((warehouse) =>
      (warehouse.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (warehouse.phone_1?.includes(searchQuery) || '') ||
      (warehouse.phone_2?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
      (warehouse.address?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );
  }, [sortedWarehouses, searchQuery]);

  const currentWarehouses = useMemo(() => {
    const indexOfLastWarehouse = currentPage * rowsPerPage;
    const indexOfFirstWarehouse = indexOfLastWarehouse - rowsPerPage;
    return filteredWarehouses.slice(indexOfFirstWarehouse, indexOfLastWarehouse);
  }, [filteredWarehouses, currentPage, rowsPerPage]);

  // Page Actions
  const handleChangePage = useCallback((_, value) => setCurrentPage(value), []);
  const handleRegisterClick = useCallback(() => navigate('/warehouse/register'), [navigate]);
  const handlePrint = useCallback(() => window.print(), []);
  const handleSnackbarClose = useCallback(() => setShowSnackbar(false), []);
  const handleDialogClose = useCallback(() => {
    setOpenDialog(false);
    setSelectedWarehouseId(null);
  }, []);

  // Inside the WarehouseList component, update the Edit button click handler
const handleEditClick = useCallback((id) => {
  navigate(`/warehouse/edit/${id}`); // Navigate to the register form with the ID in the route
}, [navigate]);

  return (
    <>
      <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
        <Card sx={{ margin: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
                <Box p={2}>
                  <Box mb={3} display="flex" justifyContent="space-between">
                    <TextField
                      label="گەڕانی کۆگا"
                      variant="outlined"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      sx={{ width: '50%' }}
                      InputProps={{
                        endAdornment: searchQuery && (
                          <InputAdornment position="end">
                            <IconButton onClick={handleClear}>
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
                        onClick={handleRegisterClick}
                        sx={{ mb: 2 }}
                      >
                        زیادکردن
                      </Button>

                      <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PrintIcon />}
                        onClick={handlePrint}
                        sx={{ mb: 2 }}
                      >
                        پرینت
                      </Button>
                    </Box>
                  </Box>

                  <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          {['id', 'ناو', 'ژ.مۆبایل', 'ژ.مۆبایل۲','بڕی پارە'].map((key) => (
                            <TableCell key={key} onClick={() => handleSort(key)}>
                              {key === 'id' ? '#' : key}
                              {sortConfig.key === key && (
                                sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                              )}
                            </TableCell>
                          ))}
                          <TableCell>ناونیشان</TableCell>
                          <TableCell>تێبینی</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentWarehouses.length > 0 ? (
                          currentWarehouses.map((warehouse) => (
                            <TableRow key={warehouse.id}>
                              <TableCell>{warehouse.id}</TableCell>
                              <TableCell>{warehouse.name}</TableCell>
                              <TableCell>{warehouse.phone_1}</TableCell>
                              <TableCell>{warehouse.phone_2}</TableCell>
                              <TableCell
                                style={{
                                  color: warehouse.wallet > 0 ? 'green' : warehouse.wallet < 0 ? 'red' : 'black',
                                  fontWeight: 'bold',
                                }}
                              >
                                {typeof warehouse.wallet === 'number' && !isNaN(warehouse.wallet)
                                  ? warehouse.wallet.toFixed(2)
                                  : parseFloat(warehouse.wallet || 0).toFixed(2)}
                              </TableCell>

                              <TableCell>{warehouse.address}</TableCell>
                              <TableCell>{warehouse.note}</TableCell>
                              <TableCell>
                              <IconButton color="primary" onClick={() => handleEditClick(warehouse.id)}>
                                    <EditIcon />
                                  </IconButton>
                                <IconButton color="secondary" onClick={() => handleDeleteClick(warehouse.id)}>
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
                    <Pagination
                      count={Math.ceil(filteredWarehouses.length / rowsPerPage)}
                      page={currentPage}
                      onChange={handleChangePage}
                      color="primary"
                      variant="outlined"
                      shape="rounded"
                    />
                  </Box>
                </Box>
            
            </Grid>
          </Grid>
        </Card>
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>سڕینەوەی زانیاری کۆگا</DialogTitle>
        <DialogContent>
          <DialogContentText>ئایە دڵنیایت لەسڕینەوی زانیاری کۆگا ؟</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">پاشگەزبوونەوە</Button>
          <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>سڕینەوە</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={showSnackbar}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          کۆگای دیاریکراو سڕایەوە
        </Alert>
      </Snackbar>
    </>
  );
}

export default WarehouseList;
