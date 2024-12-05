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

function BoxMoney_list({ isDrawerOpen }) {
  const navigate = useNavigate();

  const [boxMoney, setBoxMoney] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectBoxMoneyId, setSelectBoxMoneyId] = useState(null);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const rowsPerPage = 5;

  // Fetch Warehouses
  useEffect(() => {
    const fetchBoxMoney = async () => {
      try {
        const response = await axiosInstance.get('/box_money/list');
        if (response.status === 200) {
          setBoxMoney(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchBoxMoney();
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
    setSelectBoxMoneyId(id);
    setOpenDialog(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      const response = await axiosInstance.delete(`/box_money/delete/${selectBoxMoneyId}`);
      if (response.status === 200) {
        setBoxMoney((prev) => prev.filter((box_money) => box_money.id !== selectBoxMoneyId));
        setShowSnackbar(true);
        setOpenDialog(false);
        setSelectBoxMoneyId(null);
      }
    } catch (error) {
      console.error('Error deleting box money:', error);
    }
  }, [selectBoxMoneyId]);

  // Computed Values
  const sorttBoxMoney = useMemo(() => {
    const sorted = [...boxMoney];
    sorted.sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [boxMoney, sortConfig]);

  const filteredBoxMoney = useMemo(() => {
    return sorttBoxMoney.filter((boxmoney) =>
      (boxmoney.name?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
    );
  }, [sorttBoxMoney, searchQuery]);

  const currentBoxMoney = useMemo(() => {
    const indexOfLastBoxMoney = currentPage * rowsPerPage;
    const indexOfFirstBoxMoney = indexOfLastBoxMoney - rowsPerPage;
    return filteredBoxMoney.slice(indexOfFirstBoxMoney, indexOfLastBoxMoney);
  }, [filteredBoxMoney, currentPage, rowsPerPage]);

  // Page Actions
  const handleChangePage = useCallback((_, value) => setCurrentPage(value), []);
  const handleRegisterClick = useCallback(() => navigate('/box_money/register'), [navigate]);
  const handlePrint = useCallback(() => window.print(), []);
  const handleSnackbarClose = useCallback(() => setShowSnackbar(false), []);
  const handleDialogClose = useCallback(() => {
    setOpenDialog(false);
    setSelectBoxMoneyId(null);
  }, []);

  // Inside the WarehouseList component, update the Edit button click handler
const handleEditClick = useCallback((id) => {
  navigate(`/box_money/edit/${id}`); // Navigate to the register form with the ID in the route
}, [navigate]);

  return (
    <>
      <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
        <Card sx={{ margin: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper>
                <Box p={2}>
                  <Box mb={3} display="flex" justifyContent="space-between">
                    <TextField
                      label="گەڕانی قاصە"
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
                          {['id', 'name'].map((key) => (
                            <TableCell key={key} onClick={() => handleSort(key)}>
                              {key === 'id' ? '#' : key}
                              {sortConfig.key === key && (
                                sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
                              )}
                            </TableCell>
                          ))}
                          <TableCell>پارە</TableCell>
                          <TableCell>تێبینی</TableCell>
                          <TableCell>بەروار</TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentBoxMoney.length > 0 ? (
                          currentBoxMoney.map((boxMoney) => (
                            <TableRow key={boxMoney.id}>
                              <TableCell>{boxMoney.id}</TableCell>
                              <TableCell>{boxMoney.name}</TableCell>
                              <TableCell>{boxMoney.price}</TableCell>
                              <TableCell>{boxMoney.note}</TableCell>
                              <TableCell>{new Date(boxMoney.created_at).toLocaleDateString()}</TableCell>
                              <TableCell>
                              <IconButton color="primary" onClick={() => handleEditClick(boxMoney.id)}>
                                    <EditIcon />
                                  </IconButton>
                                <IconButton color="secondary" onClick={() => handleDeleteClick(boxMoney.id)}>
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
                      count={Math.ceil(filteredBoxMoney.length / rowsPerPage)}
                      page={currentPage}
                      onChange={handleChangePage}
                      color="primary"
                      variant="outlined"
                      shape="rounded"
                    />
                  </Box>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </Card>
      </Box>

      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>سڕینەوەی زانیاری قاصە</DialogTitle>
        <DialogContent>
          <DialogContentText>ئایە دڵنیایت لەسڕینەوی زانیاری قاصە ؟</DialogContentText>
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
          قاصەی دیاریکراو سڕایەوە
        </Alert>
      </Snackbar>
    </>
  );
}

export default BoxMoney_list;
