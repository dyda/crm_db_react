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
} from '@mui/material';
import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import ConfirmDialog from '../../components/utils/ConfirmDialog';
import DateRangeSelector from '../../components/utils/DateRangeSelector';
import { getCurrentUserId } from '../Authentication/auth';

function SalaryManagment({ isDrawerOpen }) {

  // Initialize today's date in yyyy-MM-dd format
const today = new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
  .toISOString()
  .slice(0, 10);

  const initialFormData = {
    employee_id: '',
    amount: '',
    salary_period_start: today,
    salary_period_end: today ,
    note: '', 
    user_id: '',
    branch_id: '',
    search: '',
  };


  const rowsPerPage = 5;

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [salaries, setSalaries] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedSalaryId, setSelectedSalaryId] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterBranch, setFilterBranch] = useState('');

  const [filterDateRange, setFilterDateRange] = useState({ mode: 'today', start: today, end: today });





  useEffect(() => {
  const userId = getCurrentUserId();
  if (userId) {
    setFormData((prev) => ({ ...prev, user_id: userId }));
  }
  fetchAllData(); // Only loads branches and employees
  handleFilter(); // Loads salaries by filter (default: today)
  // eslint-disable-next-line
}, []);


useEffect(() => {
  // Only filter salaries, do not reload branches/employees
  if (!filterEmployee && !filterBranch && !filterDateRange.start && !filterDateRange.end) {
    setCurrentPage(1);
    setSalaries([]); // Optionally clear table if no filter
    return;
  }
  const timeout = setTimeout(() => {
    setCurrentPage(1);
    handleFilter();
  }, 400); // 400ms debounce

  return () => clearTimeout(timeout);
  // eslint-disable-next-line
}, [filterEmployee, filterBranch, filterDateRange]);

  const fetchAllData = async () => {
    setFetching(true);
    try {
      const [branchRes, employeeRes] = await Promise.all([
        axiosInstance.get('/branch/index'),
        axiosInstance.get('/user/index'),
      ]);
      setBranches(branchRes.data || []);
      setEmployees(employeeRes.data || []);
    } catch (error) {
      setErrorMessage('هەڵە ڕوویدا لە بارکردنی داتا');
    } finally {
      setFetching(false);
    }
  };

const handleFilter = async () => {
  setFetching(true);
  setErrorMessage('');
  try {
    // Require at least one date
    if (!filterDateRange.start && !filterDateRange.end) {
      setErrorMessage('بەرواری دەستپێکردن یان کۆتایی پێویستە');
      setFetching(false);
      return;
    }

    const params = {};
    if (filterEmployee) params.employee_id = filterEmployee;
    if (filterBranch) params.branch_id = filterBranch;
    if (filterDateRange.start) params.startDate = filterDateRange.start;
    if (filterDateRange.end) params.endDate = filterDateRange.end;

    const response = await axiosInstance.get('/salary/filter', { params });

     console.log('Filter Response:', response.data);
    

    setSalaries(response.data.salaries || []);
  } catch (error) {
    setErrorMessage(
      error.response?.data?.error ||
      error.message ||
      'هەڵە لە گەڕان'
    );
} finally {
    setFetching(false);
  }
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return dateString;
  if (dateString.includes('T')) return dateString.split('T')[0];
  return '';
};



// Get the salary of a user by user ID
const getUserSalary = async (userId) => {
  try {
    const response = await axiosInstance.get(`/user/show/${userId}`);
    // Assuming the backend returns { ..., salary: 1234, ... }
    return response.data.salary;
  } catch (error) {
    // Handle error as needed
    return null;
  }
};


  // Function to handle salary changes for users
  const handleEmployeeChange = async (e) => {
  const employee_id = e.target.value;
  setFormData((prev) => ({ ...prev, employee_id }));

  if (employee_id) {
    const salary = await getUserSalary(employee_id);
    setFormData((prev) => ({
      ...prev,
      amount: salary !== undefined && salary !== null ? salary : '',
    }));
  } else {
    setFormData((prev) => ({ ...prev, amount: '' }));
  }
};





  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const errors = {};
    if (!formData.employee_id) errors.employee_id = 'کارمەند دیاری بکە';
    if (!formData.amount) errors.amount = 'بڕی مووچە پێویستە';
    if (!formData.branch_id) errors.branch_id = 'لق دیاری بکە';

    console.log('Form Data:', formData);
    

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData };
      let response;
      if (selectedSalaryId) {
        response = await axiosInstance.put(`/salary/update/${selectedSalaryId}`, payload);
      } else {
        response = await axiosInstance.post('/salary/store', payload);
      }

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setErrorMessage('');
        setFormData({
          ...initialFormData,
          user_id: getCurrentUserId(), // <-- Always set user_id after reset
        });
        setSelectedSalaryId(null);
        setFormErrors({});
        setCurrentPage(1);
         handleFilter();
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || 'هەڵە ڕوویدا لە تۆمارکردن'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (salary) => {
    setSelectedSalaryId(salary.id);
    setFormErrors({});
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/salary/show/${salary.id}`);
      const data = response.data;
      setFormData({
        employee_id: data.employee_id || '',
        amount: data.amount || '',
          salary_period_start: formatDate(data.salary_period_start),
          salary_period_end: formatDate(data.salary_period_end), 
          note: data.note || '',
        user_id: data.user_id || '',
        branch_id: data.branch_id || '',
        search: '',
      });
    } catch (error) {
      setErrorMessage('هەڵە ڕوویدا لە دۆزینەوەی زانیاری');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedSalaryId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axiosInstance.delete(`/salary/delete/${selectedSalaryId}`);
      if ([200, 201, 204].includes(response.status)) {
        setSalaries((prev) => prev.filter((salary) => salary.id !== selectedSalaryId));
        setOpenDialog(false);
        setSuccess(true);
        setErrorMessage('');
        setFormData({
          ...initialFormData,
          user_id: getCurrentUserId(), // Always set user_id after reset
        });
        setSelectedSalaryId(null);
        setFormErrors({});
         handleFilter();
      }
    } catch (error) {
      setErrorMessage('هەڵە ڕوویدا لە سڕینەوە');
    }
  };

  const currentSalaries = salaries.slice((currentPage - 1) * rowsPerPage, currentPage * rowsPerPage);
  const handlePageChange = (_, value) => setCurrentPage(value);
  const handleSnackbarClose = () => setSuccess(false);
  const handleErrorSnackbarClose = () => setErrorMessage('');
  const handleDialogClose = () => setOpenDialog(false);

const handleChangeWithErrorReset = (e) => {
  setErrorMessage('');
  setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));

  // Remove automatic 30-day calculation for salary_period_end
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
              {selectedSalaryId ? 'گۆڕینی مووچە' : 'زیادکردنی مووچە'}
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                select
                fullWidth
                label="کارمەند"
                name="employee_id"
                value={formData.employee_id}
                onChange={handleEmployeeChange}
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
                fullWidth
                label="بڕی مووچە"
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
                label="دەستپێکردنی مانگ"
                name="salary_period_start"
                type="date"
                value={formData.salary_period_start}
                onChange={handleChangeWithErrorReset}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                fullWidth
                label="کۆتایی مانگ"
                name="salary_period_end"
                type="date"
                value={formData.salary_period_end}
                onChange={handleChangeWithErrorReset}
                sx={{ mb: 2 }}
                InputLabelProps={{ shrink: true }}
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
                {loading ? 'Loading...' : selectedSalaryId ? 'نوێکردنەوە' : 'تۆمارکردن'}
              </Button>
            </form>
          </Card>
        </Grid>

        {/* Table Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ margin: 1, padding: 2 }}>

            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="کارمەند"
                    value={filterEmployee}
                    onChange={e => setFilterEmployee(e.target.value)}
                  >
                    <MenuItem value="">هەموو</MenuItem>
                    {employees.map(emp => (
                      <MenuItem key={emp.id} value={emp.id}>{emp.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    label="لق"
                    value={filterBranch}
                    onChange={e => setFilterBranch(e.target.value)}
                  >
                    <MenuItem value="">هەموو</MenuItem>
                    {branches.map(branch => (
                      <MenuItem key={branch.id} value={branch.id}>{branch.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={12}>
                  <DateRangeSelector value={filterDateRange} onChange={setFilterDateRange} />
                </Grid>
                    


              </Grid>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    <TableCell>کارمەند</TableCell>
                    <TableCell>بڕ</TableCell>
                    <TableCell>دەستپێکردن</TableCell>
                    <TableCell>کۆتایی</TableCell>
                    <TableCell>تێبینی</TableCell>
                    <TableCell>لق</TableCell>
                    <TableCell>بەروار</TableCell>
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
                  ) : currentSalaries.length > 0 ? (
                    currentSalaries.map((salary) => (
                      <TableRow key={salary.id}>
                        <TableCell>{salary.id}</TableCell>
                        <TableCell>
                          {employees.find((e) => e.id === salary.employee_id)?.name || salary.employee_id}
                        </TableCell>
                        <TableCell>{salary.amount}</TableCell>
                   <TableCell>{formatDate(salary.salary_period_start)}</TableCell>
                  <TableCell>{formatDate(salary.salary_period_end)}</TableCell>
                        <TableCell>{salary.note}</TableCell>
                        <TableCell>
                          {branches.find((b) => b.id === salary.branch_id)?.name || salary.branch_id}
                        </TableCell>
                          <TableCell>{formatDate(salary.created_at)}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEditClick(salary)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="secondary" onClick={() => handleDeleteClick(salary.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center">
                        {formData.search
                          ? "هیچ مووچەیەک بە گەڕانەکەت نەدۆزرایەوە"
                          : "هیچ مووچەیەک نەدۆزرایەوە"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <Box mt={2} display="flex" justifyContent="center">
              {salaries.length > 0 && (
                <Pagination
                  count={Math.ceil(salaries.length / rowsPerPage)}
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
        title="سڕینەوەی مووچە"
        description="ئایە دڵنیایت لە سڕینەوەی ئەم مووچەیە؟ ئەم کردارە گەرێنەوە نییە."
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




export default SalaryManagment;



