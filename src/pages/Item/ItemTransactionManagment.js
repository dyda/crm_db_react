import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, Typography, TextField, Button, IconButton, InputAdornment,
  Snackbar, Alert, CircularProgress, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, Pagination, MenuItem
} from '@mui/material';
import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import ConfirmDialog from '../../components/utils/ConfirmDialog';
import axiosInstance from '../../components/service/axiosInstance';

function ItemTransactionManagment({ isDrawerOpen }) {
   const initialFormData = {
    type: '',
    warehouse_id: '',
    item_id: '',
    unit_id: '', // Add unit_id
    quantity: '',
    employee_id: '',
    note: '',
    search: '',
  };

  const rowsPerPage = 5;

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [transactions, setTransactions] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [items, setItems] = useState([]);
    const [units, setUnits] = useState([]); // Add units state

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    fetchAllData();
    fetchWarehouses();
    fetchItems();
    fetchEmployees();
    fetchUnits(); // Fetch units
  }, []);

  const fetchUnits = async () => {
    try {
      const res = await axiosInstance.get('/item-unit/index');
      setUnits(res.data || []);
    } catch {}
  };

  const fetchAllData = async () => {
    setFetching(true);
    try {
      const res = await axiosInstance.get('/item-transaction/index');
      setTransactions(res.data || []);
    } catch (err) {
      setErrorMessage('هەڵە ڕوویدا لە بارکردنی داتا');
    } finally {
      setFetching(false);
    }
  };

  const fetchWarehouses = async () => {
    try {
      const res = await axiosInstance.get('/warehouse/index');
      setWarehouses(res.data || []);
    } catch {}
  };

  const fetchItems = async () => {
    try {
      const res = await axiosInstance.get('/item/index');
      setItems(res.data || []);
    } catch {}
  };

  const fetchEmployees = async () => {
    try {
      const res = await axiosInstance.get('/user/index');
      setEmployees(res.data || []);
    } catch {}
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const errors = {};
    if (!formData.type) errors.type = 'جۆری مامەڵە پێویستە';
    if (!formData.warehouse_id) errors.warehouse_id = 'کۆگا پێویستە';
    if (!formData.item_id) errors.item_id = 'کاڵا پێویستە';
        if (!formData.unit_id) errors.unit_id = 'یەکە پێویستە'; // Validate unit

    if (formData.quantity === '' || isNaN(Number(formData.quantity))) errors.quantity = 'بڕ پێویستە';
    if (!formData.employee_id) errors.employee_id = 'کارمەند پێویستە';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const payload = {
        type: formData.type,
        warehouse_id: formData.warehouse_id,
        item_id: formData.item_id,
        unit_id: formData.unit_id, // Send unit_id
        quantity: formData.quantity,
        employee_id: formData.employee_id,
        note: formData.note,
      };
      let response;
      if (selectedId) {
        response = await axiosInstance.put(`/item-transaction/update/${selectedId}`, payload);
      } else {
        response = await axiosInstance.post('/item-transaction/store', payload);
      }

      if ([200, 201].includes(response.status)) {
        fetchAllData();
        setSuccess(true);
        setFormData(initialFormData);
        setSelectedId(null);
        setFormErrors({});
      } else {
        setErrorMessage(response.data.message || 'هەڵە ڕوویدا');
      }
    } catch (err) {
      setErrorMessage(
        err.response?.data?.error || 'هەڵە ڕوویدا لە تۆمارکردن'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (row) => {
    setSelectedId(row.id);
    setFormData({
      type: row.type || '',
      warehouse_id: row.warehouse_id || '',
      item_id: row.item_id || '',
      unit_id: row.unit_id || '', // Set unit_id
      quantity: row.quantity || '',
      employee_id: row.employee_id || '',
      note: row.note || '',
      search: '',
    });
    setFormErrors({});
  };

  const handleDeleteClick = (id) => {
    setSelectedId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/item-transaction/delete/${selectedId}`);
      setTransactions(prev => prev.filter(t => t.id !== selectedId));
      setSuccess(true);
    } catch (err) {
      setErrorMessage('هەڵە ڕوویدا لە سڕینەوە');
    } finally {
      setOpenDialog(false);
      setSelectedId(null);
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, search: value }));

    if (!value.trim()) {
      fetchAllData();
      return;
    }

    setFetching(true);
    try {
      setTransactions(prev =>
        prev.filter(
          t =>
            (warehouses.find(w => w.id === t.warehouse_id)?.name || '').includes(value) ||
            (items.find(i => i.id === t.item_id)?.name || '').includes(value) ||
            (employees.find(emp => emp.id === t.employee_id)?.name || '').includes(value) ||
            String(t.quantity).includes(value) ||
            (t.note && t.note.includes(value))
        )
      );
    } catch {
      setErrorMessage('هەڵە ڕوویدا لە گەڕان');
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

  const currentTransactions = transactions.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ m: 1, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedId ? 'گۆڕینی مامەڵە' : 'زیادکردنی مامەڵە'}
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                select
                fullWidth
                label="جۆری مامەڵە"
                name="type"
                value={formData.type}
                onChange={handleChangeWithErrorReset}
                error={!!formErrors.type}
                helperText={formErrors.type}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">هیچ</MenuItem>
                <MenuItem value="+">زیادکردن</MenuItem>
                <MenuItem value="-">کەمکردن</MenuItem>
              </TextField>
              <TextField
                select
                fullWidth
                label="کۆگا"
                name="warehouse_id"
                value={formData.warehouse_id}
                onChange={handleChangeWithErrorReset}
                error={!!formErrors.warehouse_id}
                helperText={formErrors.warehouse_id}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">هیچ</MenuItem>
                {warehouses.map((w) => (
                  <MenuItem key={w.id} value={w.id}>{w.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="کاڵا"
                name="item_id"
                value={formData.item_id}
                onChange={handleChangeWithErrorReset}
                error={!!formErrors.item_id}
                helperText={formErrors.item_id}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">هیچ</MenuItem>
                {items.map((i) => (
                  <MenuItem key={i.id} value={i.id}>{i.name}</MenuItem>
                ))}
              </TextField>
                 <TextField
                select
                fullWidth
                label="یەکە"
                name="unit_id"
                value={formData.unit_id}
                onChange={handleChangeWithErrorReset}
                error={!!formErrors.unit_id}
                helperText={formErrors.unit_id}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">هیچ</MenuItem>
                {units.map((u) => (
                  <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="بڕ"
                name="quantity"
                type="number"
                value={formData.quantity}
                onChange={handleChangeWithErrorReset}
                error={!!formErrors.quantity}
                helperText={formErrors.quantity}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.quantity && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('quantity')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                select
                fullWidth
                label="کارمەند"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleChangeWithErrorReset}
                error={!!formErrors.employee_id}
                helperText={formErrors.employee_id}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">هیچ</MenuItem>
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="تێبینی"
                name="note"
                value={formData.note}
                onChange={handleChangeWithErrorReset}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.note && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('note')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
              <Button type="submit" fullWidth variant="contained" color="success" disabled={loading}>
                {loading ? 'Loading...' : selectedId ? 'نوێکردنەوە' : 'تۆمارکردن'}
              </Button>
            </form>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          <Card sx={{ m: 1, p: 2 }}>
           <TextField
                fullWidth
                label="گەڕان"
                name="search"
                value={formData.search}
                onChange={handleSearchChange}
                placeholder="کۆگا، کاڵا، کارمەند، بڕ یان تێبینی..."
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {formData.search && (
                        <IconButton onClick={() => {
                          setFormData(prev => ({ ...prev, search: '' }));
                          fetchAllData();
                        }}>
                          <ClearIcon />
                        </IconButton>
                      )}
                      <IconButton onClick={fetchAllData}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>جۆر</TableCell>
                    <TableCell>کۆگا</TableCell>
                    <TableCell>کاڵا</TableCell>
                    <TableCell>یەکە</TableCell>
                    <TableCell>بڕ</TableCell>
                    <TableCell>کارمەند</TableCell>
                    <TableCell>تێبینی</TableCell>
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
                  ) : currentTransactions.length > 0 ? (
                    currentTransactions.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell>{row.id}</TableCell>
                        <TableCell>{row.type === '+' ? 'زیادکردن' : 'کەمکردن'}</TableCell>
                        <TableCell>{warehouses.find(w => w.id === row.warehouse_id)?.name || row.warehouse_id}</TableCell>
                        <TableCell>{items.find(i => i.id === row.item_id)?.name || row.item_id}</TableCell>
                        <TableCell>{units.find(u => u.id === row.unit_id)?.name || row.unit_id}</TableCell>

                        <TableCell>{row.quantity}</TableCell>
                        <TableCell>{employees.find(emp => emp.id === row.employee_id)?.name || row.employee_id}</TableCell>
                        <TableCell>{row.note}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEditClick(row)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="secondary" onClick={() => handleDeleteClick(row.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        {formData.search
                          ? 'هیچ مامەڵەیەک بە گەڕانەکەت نەدۆزرایەوە'
                          : 'هیچ مامەڵەیەک نەدۆزرایەوە'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {transactions.length > rowsPerPage && (
              <Box mt={2} display="flex" justifyContent="center">
                <Pagination
                  count={Math.ceil(transactions.length / rowsPerPage)}
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
        title="سڕینەوەی مامەڵە"
        description="ئایە دڵنیایت لە سڕینەوەی ئەم مامەڵە؟ ئەم کردارە گەرێنەوە نییە."
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

export default ItemTransactionManagment;