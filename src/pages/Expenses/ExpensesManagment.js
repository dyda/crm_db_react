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
  MenuItem,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
} from '@mui/icons-material';
import ConfirmDialog from '../../components/utils/ConfirmDialog';

function ExpensesManagment({ isDrawerOpen }) {
  // Today's date in yyyy-MM-dd format
  const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 10);

  const initialFormData = {
    employee_id: '',
    category_id: '',
    name: '',
    amount: '',
    note: '',
    branch_id: '',
    user_id: '',
    search: '',
  };

  const rowsPerPage = 5;

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [branches, setBranches] = useState([]);
  const [categories, setCategories] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [search, setSearch] = useState('');

  // Fetch all needed data
  useEffect(() => {
    fetchAllData();
    fetchExpenses();
    // eslint-disable-next-line
  }, []);

  const fetchAllData = async () => {
    setFetching(true);
    try {
      const [branchRes, employeeRes, categoryRes] = await Promise.all([
        axiosInstance.get('/branch/index'),
        axiosInstance.get('/user/index'),
        axiosInstance.get('/expenses-category/index'),
      ]);
      setBranches(branchRes.data || []);
      setEmployees(employeeRes.data || []);
      setCategories(categoryRes.data || []);
    } catch (error) {
      setErrorMessage('هەڵە ڕوویدا لە بارکردنی داتا');
    } finally {
      setFetching(false);
    }
  };

  const fetchExpenses = async (searchValue = '') => {
    setFetching(true);
    try {
      let response;
      if (searchValue.trim()) {
        response = await axiosInstance.get('/expenses/filter', {
          params: { name: searchValue, note: searchValue },
        });
        setExpenses(response.data.expenses || []);
      } else {
        response = await axiosInstance.get('/expenses/index');
        setExpenses(response.data || []);
      }
    } catch (error) {
      setErrorMessage('هەڵە ڕوویدا لە بارکردنی زانیاری');
    } finally {
      setFetching(false);
    }
  };

  const handleSearchChange = async (e) => {
    const value = e.target.value;
    setSearch(value);
    if (!value.trim()) {
      fetchExpenses();
      return;
    }
    fetchExpenses(value);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const errors = {};
    if (!formData.employee_id) errors.employee_id = 'کارمەند دیاری بکە';
    if (!formData.category_id) errors.category_id = 'گرووپی مەسرووفات دیاری بکە';
    if (!formData.name) errors.name = 'ناوی مەسرووفات پێویستە';
    if (!formData.amount) errors.amount = 'بڕی مەسرووفات پێویستە';
    if (!formData.branch_id) errors.branch_id = 'لق دیاری بکە';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      let response;
      if (selectedExpenseId) {
        response = await axiosInstance.put(`/expenses/update/${selectedExpenseId}`, payload);
      } else {
        response = await axiosInstance.post('/expenses/store', payload);
      }

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setErrorMessage('');
        setFormData(initialFormData);
        setSelectedExpenseId(null);
        setFormErrors({});
        setCurrentPage(1);
        fetchExpenses(search);
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || 'هەڵە ڕوویدا لە تۆمارکردن'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (expense) => {
    setSelectedExpenseId(expense.id);
    setFormErrors({});
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/expenses/show/${expense.id}`);
      const data = response.data;
      setFormData({
        employee_id: data.employee_id || '',
        category_id: data.category_id || '',
        name: data.name || '',
        amount: data.amount || '',
        note: data.note || '',
        branch_id: data.branch_id || '',
        user_id: data.user_id || '',
        search: '',
      });
    } catch (error) {
      setErrorMessage('هەڵە ڕوویدا لە دۆزینەوەی زانیاری');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedExpenseId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axiosInstance.delete(`/expenses/delete/${selectedExpenseId}`);
      if ([200, 201, 204].includes(response.status)) {
        setExpenses((prev) => prev.filter((expense) => expense.id !== selectedExpenseId));
        setOpenDialog(false);
        setSuccess(true);
        setErrorMessage('');
        setFormData(initialFormData);
        setSelectedExpenseId(null);
        setFormErrors({});
        fetchExpenses(search);
      }
    } catch (error) {
      setErrorMessage('هەڵە ڕوویدا لە سڕینەوە');
    }
  };

  const currentExpenses = expenses.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const handlePageChange = (_, value) => setCurrentPage(value);
  const handleSnackbarClose = () => setSuccess(false);
  const handleErrorSnackbarClose = () => setErrorMessage('');
  const handleDialogClose = () => setOpenDialog(false);

  const handleChangeWithErrorReset = (e) => {
    setErrorMessage('');
    setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
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
              {selectedExpenseId ? 'گۆڕینی مەسرووفات' : 'زیادکردنی مەسرووفات'}
            </Typography>
            <form onSubmit={handleSubmit}>
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
                {employees.map((emp) => (
                  <MenuItem key={emp.id} value={emp.id}>
                    {emp.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                select
                fullWidth
                label="گرووپی مەسرووفات"
                name="category_id"
                value={formData.category_id}
                onChange={handleChangeWithErrorReset}
                error={!!formErrors.category_id}
                helperText={formErrors.category_id}
                sx={{ mb: 2 }}
              >
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="ناوی مەسرووفات"
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

              <TextField
                fullWidth
                label="بڕ"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChangeWithErrorReset}
                error={!!formErrors.amount}
                helperText={formErrors.amount}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.amount && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('amount')}>
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
                value={formData.note}
                onChange={handleChangeWithErrorReset}
                sx={{ mb: 2 }}
              />

              <TextField
                select
                fullWidth
                label="لق"
                name="branch_id"
                value={formData.branch_id}
                onChange={handleChangeWithErrorReset}
                error={!!formErrors.branch_id}
                helperText={formErrors.branch_id}
                sx={{ mb: 2 }}
              >
                {branches.map((branch) => (
                  <MenuItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </MenuItem>
                ))}
              </TextField>

              <Button type="submit" fullWidth variant="contained" color="success" disabled={loading}>
                {loading ? 'Loading...' : selectedExpenseId ? 'نوێکردنەوە' : 'تۆمارکردن'}
              </Button>
            </form>
          </Card>
        </Grid>

        {/* Table Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ margin: 1, padding: 2 }}>
            {/* Search Field */}
            <TextField
              fullWidth
              label="گەڕان"
              name="search"
              value={search}
              onChange={handleSearchChange}
              placeholder="ناو یان تێبینی..."
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="هەموو داتاکان">
                      <IconButton onClick={() => { setSearch(''); fetchExpenses(); }}>
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
                    <TableCell>کارمەند</TableCell>
                    <TableCell>گرووپ</TableCell>
                    <TableCell>ناو</TableCell>
                    <TableCell>بڕ</TableCell>
                    <TableCell>تێبینی</TableCell>
                    <TableCell>لق</TableCell>
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
                  ) : currentExpenses.length > 0 ? (
                    currentExpenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{expense.id}</TableCell>
                        <TableCell>
                          {employees.find((e) => e.id === expense.employee_id)?.name || expense.employee_id}
                        </TableCell>
                        <TableCell>
                          {categories.find((c) => c.id === expense.category_id)?.name || expense.category_id}
                        </TableCell>
                        <TableCell>{expense.name}</TableCell>
                        <TableCell>{expense.amount}</TableCell>
                        <TableCell>{expense.note}</TableCell>
                        <TableCell>
                          {branches.find((b) => b.id === expense.branch_id)?.name || expense.branch_id}
                        </TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEditClick(expense)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="secondary" onClick={() => handleDeleteClick(expense.id)}>
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
              {expenses.length > 0 && (
                <Pagination
                  count={Math.ceil(expenses.length / rowsPerPage)}
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
      <ConfirmDialog
        open={openDialog}
        onClose={handleDialogClose}
        onConfirm={handleDeleteConfirm}
        title="سڕینەوەی مەسرووفات"
        description="ئایە دڵنیایت لە سڕینەوەی ئەم مەسرووفاتە؟ ئەم کردارە گەرێنەوە نییە."
        confirmText="سڕینەوە"
        cancelText="پاشگەزبوونەوە"
      />

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

export default ExpensesManagment;