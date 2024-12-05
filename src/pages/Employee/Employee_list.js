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
  Alert
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ClearIcon from '@mui/icons-material/Clear';
import axiosInstance from '../../components/service/axiosInstance';

function EmployeeList({ isDrawerOpen }) {
  const navigate = useNavigate();

  // State Initialization
  const [users, setUsers] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedUserId, setSelectedUserId] = useState(null);
  const rowsPerPage = 5;

  // Fetch Users from API on Component Load
  useEffect(() => {
    axiosInstance.get('/user/list')
      .then(response => {
        if (response.data.success) {
          
          setUsers(response.data.data);
        }
      })
      .catch(error => {
        console.error("Failed to fetch users", error);
      });
  }, []);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleClear = () => {
    setSearchQuery('');
  };

  const getSortIcon = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />;
    }
    return null;
  };

  const handleEditClick = (id) => {
    navigate(`/employee/edit/${id}`);
  };

  const handleDeleteClick = (id) => {
    setSelectedUserId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = () => {
    axiosInstance.delete(`/user/delete/${selectedUserId}`)
      .then(() => {
        setUsers(users.filter((user) => user.id !== selectedUserId));
        setOpenDialog(false);
        setSelectedUserId(null);
        
        // Show success snackbar
        setSnackbarMessage('کارمەندی دیاریکراو سڕایەوە');
        setSnackbarOpen(true);
      })
      .catch(error => {
        console.error("Failed to delete user", error);
      });
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  const handleDialogClose = () => {
    setOpenDialog(false);
    setSelectedUserId(null);
  };

  const sortedUsers = [...users].sort((a, b) => {
    if (sortConfig.direction === 'asc') {
      return a[sortConfig.key] < b[sortConfig.key] ? -1 : a[sortConfig.key] > b[sortConfig.key] ? 1 : 0;
    } else {
      return a[sortConfig.key] > b[sortConfig.key] ? -1 : a[sortConfig.key] < b[sortConfig.key] ? 1 : 0;
    }
  });

  const filteredUsers = sortedUsers.filter(
    (user) =>
      (user.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone || '').includes(searchQuery)
  );

  const indexOfLastUser = currentPage * rowsPerPage;
  const indexOfFirstUser = indexOfLastUser - rowsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

  const handleChangePage = (event, value) => {
    setCurrentPage(value);
  };

  const handleRegisterClick = () => {
    navigate('/employee/register');
  };

  return (
    <>
      <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
        <Card sx={{ margin: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Paper>
                <Box p={1}>
                  {/* Search and Add Button */}
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
                            <IconButton onClick={handleClear}>
                              <ClearIcon />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                    <Button
                      variant="contained"
                      color="success"
                      startIcon={<AddIcon />}
                      onClick={handleRegisterClick}
                      sx={{ mb: 1 }}
                    >
                      زیادکردن
                    </Button>
                  </Box>

                  {/* Table Container */}
                  <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                            #
                            {getSortIcon('id')}
                          </TableCell>
                          <TableCell onClick={() => handleSort('username')} style={{ cursor: 'pointer' }}>
                            بەکارهێنەر
                            {getSortIcon('username')}
                          </TableCell>
                          <TableCell onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                            ناو
                            {getSortIcon('name')}
                          </TableCell>
                          <TableCell onClick={() => handleSort('phone')} style={{ cursor: 'pointer' }}>
                            ژ.مۆبایل
                            {getSortIcon('phone')}
                          </TableCell>
                     
                          <TableCell onClick={() => handleSort('warehouse')} style={{ cursor: 'pointer' }}>
                            کۆگا
                            {getSortIcon('warehouse')}
                          </TableCell>
                          <TableCell>Action</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {currentUsers.length > 0 ? (
                          currentUsers.map((user) => (
                            <TableRow key={user.id}>
                              <TableCell>{user.id}</TableCell>
                              <TableCell>{user.username}</TableCell>
                              <TableCell>{user.name}</TableCell>
                              <TableCell>{user.phone}</TableCell>
                              <TableCell>{user.warehouse ? user.warehouse.name : 'N/A'}</TableCell>
                              <TableCell>
                                <IconButton color="primary" onClick={() => handleEditClick(user.id)}>
                                  <EditIcon />
                                </IconButton>
                                <IconButton color="secondary" onClick={() => handleDeleteClick(user.id)}>
                                  <DeleteIcon />
                                </IconButton>
                              </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow>
                            <TableCell colSpan={8} align="center">هیچ کارمەندێک نەدۆزراوەتەوە</TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination Component */}
                  <Box mt={2} display="flex" justifyContent="center">
                    <Pagination
                      count={Math.ceil(filteredUsers.length / rowsPerPage)}
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

      {/* Confirmation Dialog */}
      <Dialog open={openDialog} onClose={handleDialogClose}>
        <DialogTitle>سڕینەوەی زانیاری کارمەند</DialogTitle>
        <DialogContent>
          <DialogContentText>دڵنیایت لەسڕینەوەی کارمەند؟</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">پاشگەزبوونەوە</Button>
          <Button onClick={handleDeleteConfirm} color="secondary" autoFocus>سڕینەوە</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
      >
        <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
}

export default EmployeeList;
