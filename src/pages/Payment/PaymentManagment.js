import React, { useState, useEffect } from 'react';
import axiosInstance from '../../components/service/axiosInstance';
import {
  Card,
  Typography,
  Box,
  TextField,
  IconButton,
  InputAdornment,
  Snackbar,
  Alert,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableFooter,
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
import TableSortLabel from '@mui/material/TableSortLabel';
import RegisterButton from '../../components/common/RegisterButton';
import ClearButton from '../../components/common/ClearButton';
import ReportButton from '../../components/common/ReportButton';
import ConfirmDialog from '../../components/utils/ConfirmDialog';
import DateRangeSelector from '../../components/utils/DateRangeSelector';
import { getCurrentUserId } from '../Authentication/auth';
import CustomerAutocomplete from '../../components/Autocomplete/CustomerAutocomplete';
import { formatDate, formatNumberWithCommas } from '../../components/utils/format';
import { getToday } from '../../components/utils/date';
import { useCompanyInfo } from '../../hooks/useCompanyInfo';

function PaymentManagment({ isDrawerOpen }) {
  // --- State ---
 
const today = getToday();

  const initialFormData = {
    customer_id: '',
    employee_id: '',
    amount: '',
    discount_result: '',
    discount_type: '',
    discount_value: '',
    type: '',
    note: '',
    user_id: '',
    branch_id: '',
    currency_id: '',
    payment_method: '',
    reference_number: '',
    payment_date: today,
  };

  const rowsPerPage = 20;

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [payments, setPayments] = useState([]);
  const [branches, setBranches] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [currencies, setCurrencies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomerLoan, setSelectedCustomerLoan] = useState(null);
  const [selectedPaymentId, setSelectedPaymentId] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [filterCustomer, setFilterCustomer] = useState('');
  const [filterEmployee, setFilterEmployee] = useState('');
  const [filterBranch, setFilterBranch] = useState('');
  const [filterDateRange, setFilterDateRange] = useState({ mode: 'today', start: today, end: today });
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('desc');
  const [totalCount, setTotalCount] = useState(0);
  const { company, fetchCompanyInfo } = useCompanyInfo();
  const [totalSumByCurrency, setTotalSumByCurrency] = useState({});

  // --- Effects ---

 const calculateDiscountResult = (loan, discountType, discountValue) => {
  if (loan === null || loan === undefined || !discountType || !discountValue || isNaN(Number(loan)) || isNaN(Number(discountValue))) {
    return '';
  }
  let result = 0;
  if (discountType === 'ڕێژە') {
    result = (Number(loan) * Number(discountValue)) / 100;
  } else if (discountType === 'پارە') {
    result = Number(discountValue);
  }
  return result;
};
// Add this effect to auto-calculate and set discount_result when dependencies change
useEffect(() => {
  if (formData.discount_type && formData.discount_value && selectedCustomerLoan !== null) {
    const discountResult = calculateDiscountResult(selectedCustomerLoan, formData.discount_type, formData.discount_value);
    setFormData(prev => ({
      ...prev,
      discount_result: discountResult ? discountResult.toString() : ''
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      discount_result: ''
    }));
  }
  // eslint-disable-next-line
}, [formData.discount_type, formData.discount_value, selectedCustomerLoan]);

  useEffect(() => {
    const userId = getCurrentUserId();
    if (userId) {
      setFormData((prev) => ({ ...prev, user_id: userId }));
    }
    fetchAllData();
    fetchCompanyInfo();
    handleFilter(1, rowsPerPage, sortBy, sortOrder);
    fetchTotalSumByCurrency();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (!filterCustomer && !filterEmployee && !filterBranch && !filterDateRange.start && !filterDateRange.end) {
      setCurrentPage(1);
      setPayments([]);
      setTotalCount(0);
      setTotalSumByCurrency({});
      return;
    }
    const timeout = setTimeout(() => {
      handleFilter(currentPage, rowsPerPage, sortBy, sortOrder);
      fetchTotalSumByCurrency();
    }, 400);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line
  }, [filterCustomer, filterEmployee, filterBranch, filterDateRange, sortBy, sortOrder, currentPage]);

  // --- Data Fetchers ---

  const fetchAllData = async () => {
    setFetching(true);
    try {
      const [branchRes, employeeRes, customerRes, currencyRes] = await Promise.all([
        axiosInstance.get('/branch/index'),
        axiosInstance.get('/user/index'),
        axiosInstance.get('/customer/index'),
        axiosInstance.get('/currency/index'),
      ]);
      setBranches(branchRes.data || []);
      setEmployees(employeeRes.data || []);
      setCustomers(customerRes.data || []);
      setCurrencies(currencyRes.data || []);
    } catch (error) {
      setErrorMessage('هەڵە ڕوویدا لە بارکردنی داتا');
    } finally {
      setFetching(false);
    }
  };

  const handleFilter = async (
    page = currentPage,
    pageSize = rowsPerPage,
    sortField = sortBy,
    sortDirection = sortOrder
  ) => {
    setFetching(true);
    setErrorMessage('');
    try {
      if (!filterDateRange.start && !filterDateRange.end) {
        setErrorMessage('بەرواری دەستپێکردن یان کۆتایی پێویستە');
        setFetching(false);
        return;
      }
      const params = {
        page,
        pageSize,
        sortBy: sortField,
        sortOrder: sortDirection,
      };
      if (filterCustomer) params.customer_id = filterCustomer;
      if (filterEmployee) params.employee_id = filterEmployee;
      if (filterBranch) params.branch_id = filterBranch;
      if (filterDateRange.start) params.startDate = filterDateRange.start;
      if (filterDateRange.end) params.endDate = filterDateRange.end;

      const response = await axiosInstance.get('/customer/payments/filter', { params });
      setPayments(response.data || []);
      setTotalCount(response.data.length || 0); // Adjust if backend returns total
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

  const fetchTotalSumByCurrency = async () => {
    try {
      const params = {
        sortBy,
        sortOrder,
      };
      if (filterCustomer) params.customer_id = filterCustomer;
      if (filterEmployee) params.employee_id = filterEmployee;
      if (filterBranch) params.branch_id = filterBranch;
      if (filterDateRange.start) params.startDate = filterDateRange.start;
      if (filterDateRange.end) params.endDate = filterDateRange.end;

      const response = await axiosInstance.get('/customer/payments/filter', { params });
      const allPayments = response.data || [];
      const sums = {};
      allPayments.forEach((pay) => {
        const currency = currencies.find((cur) => cur.id === pay.currency_id);
        const symbol = currency?.symbol || '';
        const key = symbol || pay.currency_id || '';
        const amount = Number(pay.amount || 0);
        if (!sums[key]) sums[key] = 0;
        sums[key] += amount;
      });
      setTotalSumByCurrency(sums);
    } catch (error) {
      setTotalSumByCurrency({});
    }
  };



  // --- Form Handlers ---

 const handleChangeWithErrorReset = (e) => {
  setErrorMessage('');
  setFormErrors((prev) => ({ ...prev, [e.target.name]: '' }));

  // Prevent % discount > 100
  if (
    e.target.name === 'discount_value' &&
    formData.discount_type === 'ڕێژە' &&
    Number(e.target.value) > 100
  ) {
    setFormErrors((prev) => ({
      ...prev,
      discount_value: 'ڕێژە نابێت لە ١٠٠٪ زیاد بێت',
    }));
    setFormData((prev) => ({
      ...prev,
      discount_value: '100',
    }));
    return;
  }

  // Prevent fixed discount > loan
  if (
    e.target.name === 'discount_value' &&
    formData.discount_type === 'پارە' &&
    selectedCustomerLoan !== null &&
    Number(e.target.value) > Number(selectedCustomerLoan)
  ) {
    setFormErrors((prev) => ({
      ...prev,
      discount_value: 'داشکاندن نابێت لە قەرز زیاد بێت',
    }));
    setFormData((prev) => ({
      ...prev,
      discount_value: selectedCustomerLoan.toString(),
    }));
    return;
  }

  setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
};

  const clearSelectField = (field) => {
    setFormData((prev) => ({ ...prev, [field]: '' }));
    setFormErrors((prevErrors) => ({ ...prevErrors, [field]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');
    const errors = {};
    if (!formData.customer_id) errors.customer_id = 'کڕیار دیاری بکە';
    if (!formData.amount || isNaN(Number(formData.amount.toString().replace(/,/g, '')))) errors.amount = 'بڕ پێویستە';
    if (!formData.branch_id) errors.branch_id = 'لق دیاری بکە';
    if (!formData.currency_id) errors.currency_id = 'دراو دیاری بکە';
    if (!formData.type) errors.type = 'جۆری پارەدان دیاری بکە';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {
      const payload = { ...formData, amount: Number(formData.amount.toString().replace(/,/g, '')) };

      console.log(payload);
      
      let response;
      if (selectedPaymentId) {
        response = await axiosInstance.put(`/customer/payments/update/${selectedPaymentId}`, payload);
      } else {
        response = await axiosInstance.post('/customer/payments/store', payload);
      }

      if (response.status === 200 || response.status === 201) {
        setSuccess(true);
        setErrorMessage('');
        setFormData({
          ...initialFormData,
          user_id: getCurrentUserId(),
        });
        setSelectedPaymentId(null);
        setFormErrors({});
        setCurrentPage(1);
        handleFilter(1, rowsPerPage, sortBy, sortOrder);
        fetchTotalSumByCurrency();
      }
    } catch (error) {
      setErrorMessage(
        error.response?.data?.error || 'هەڵە ڕوویدا لە تۆمارکردن'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = async (payment) => {
    setSelectedPaymentId(payment.id);
    setFormErrors({});
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/customer/payments/show/${payment.id}`);
      const data = response.data;
      setFormData({
        customer_id: data.customer_id || '',
        employee_id: data.employee_id || '',
        amount: data.amount ? data.amount.toString().replace(/,/g, '') : '',
        discount_result: data.discount_result || '',
        discount_type: data.discount_type || '',
        discount_value: data.discount_value || '',
        type: data.type || '',
        note: data.note || '',
        user_id: data.user_id || '',
        branch_id: data.branch_id || '',
        currency_id: data.currency_id || '',
        payment_method: data.payment_method || '',
        reference_number: data.reference_number || '',
        payment_date: formatDate(data.payment_date),
      });
    } catch (error) {
      setErrorMessage('هەڵە ڕوویدا لە دۆزینەوەی زانیاری');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClick = (id) => {
    setSelectedPaymentId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await axiosInstance.delete(`/customer/payments/delete/${selectedPaymentId}`);
      if ([200, 201, 204].includes(response.status)) {
        setPayments((prev) => prev.filter((payment) => payment.id !== selectedPaymentId));
        setOpenDialog(false);
        setSuccess(true);
        setErrorMessage('');
        setFormData({
          ...initialFormData,
          user_id: getCurrentUserId(),
        });
        setSelectedPaymentId(null);
        setFormErrors({});
        handleFilter(currentPage, rowsPerPage, sortBy, sortOrder);
        fetchTotalSumByCurrency();
      }
    } catch (error) {
      setErrorMessage('هەڵە ڕوویدا لە سڕینەوە');
    }
  };

  // --- Pagination & Sorting ---

  const currentPayments = payments;
  const handlePageChange = (_, value) => {
    setCurrentPage(value);
  };

  const handleSort = (field) => {
    const isAsc = sortBy === field && sortOrder === 'asc';
    setSortBy(field);
    setSortOrder(isAsc ? 'desc' : 'asc');
    setCurrentPage(1);
  };

  // --- Snackbar and Dialog Handlers ---

  const handleSnackbarClose = () => setSuccess(false);
  const handleErrorSnackbarClose = () => setErrorMessage('');
  const handleDialogClose = () => setOpenDialog(false);

  // --- Render ---
  return (
    <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s' }}>
      <Grid container spacing={2}>
        {/* Form Section */}
        <Grid item xs={12} md={4}>
          <Card sx={{ margin: 1, padding: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedPaymentId ? 'گۆڕینی پارەدان' : 'زیادکردنی پارەدان'}
            </Typography>
            <form onSubmit={handleSubmit}>

<Grid container spacing={2} sx={{ mb: 2 }}>

 <Grid item xs={12}>

  <CustomerAutocomplete
  value={customers.find(c => c.id === formData.customer_id) || null}
  onChange={async customer => {
    setFormData(prev => ({
      ...prev,
      customer_id: customer ? customer.id : ''
    }));
    if (customer && customer.id) {
      try {
        const res = await axiosInstance.get(`/customer/show/${customer.id}`);
        setSelectedCustomerLoan(res.data.loan ?? null);
      } catch {
        setSelectedCustomerLoan(null);
      }
    } else {
      setSelectedCustomerLoan(null);
    }
  }}
  error={!!formErrors.customer_id}
  helperText={formErrors.customer_id}
/>
{selectedCustomerLoan !== null && (
  <Box sx={{ mt: 1 }}>
    <Typography
      variant="subtitle2"
      color={Number(selectedCustomerLoan) < 0 ? "error" : "primary"}
    >
      قەرزی کڕیار: {formatNumberWithCommas(selectedCustomerLoan)}
    </Typography>
  </Box>
)}

 </Grid>


  </Grid>


              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={8}>
                  <TextField
                    fullWidth
                    label="بڕ"
                    name="amount"
                    type="text"
                    value={formatNumberWithCommas(formData.amount)}
                    onChange={e => {
                      const rawValue = e.target.value.replace(/,/g, '');
                      if (!/^\d*\.?\d*$/.test(rawValue)) return;
                      handleChangeWithErrorReset({
                        target: { name: 'amount', value: rawValue }
                      });
                    }}
                    error={!!formErrors.amount}
                    helperText={formErrors.amount}
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
                </Grid>
                <Grid item xs={4}>
                  <TextField
                    select
                    fullWidth
                    label="دراو"
                    name="currency_id"
                    value={formData.currency_id}
                    onChange={handleChangeWithErrorReset}
                    error={!!formErrors.currency_id}
                    helperText={formErrors.currency_id}
                  >
                    {currencies.map((cur) => (
                      <MenuItem key={cur.id} value={cur.id}>
                        {cur.name}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="جۆری مامەڵە"
                    name="type"
                    value={formData.type}
                    onChange={handleChangeWithErrorReset}
                    error={!!formErrors.type}
                    helperText={formErrors.type}
                  >
                    <MenuItem value="payment">پارەدان</MenuItem>
                    <MenuItem value="receipt">وەرگرتن</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    select
                    fullWidth
                    label="شێوازی پارەدان"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChangeWithErrorReset}
                  >
                    <MenuItem value=""></MenuItem>
                    <MenuItem value="کاش">کاش</MenuItem>
                    <MenuItem value="بانک">بانک</MenuItem>
                    <MenuItem value="گواستنەوە">گواستنەوە</MenuItem>
                  </TextField>
                </Grid>
              </Grid>

         <Grid container spacing={2} >
            <Grid item xs={6}>
              <TextField
                select
                fullWidth
                label="جۆری داشکاندن"
                name="discount_type"
                value={formData.discount_type}
                onChange={handleChangeWithErrorReset}
                sx={{ mb: 2 }}
              >
                <MenuItem value=""></MenuItem>
                <MenuItem value="ڕێژە">ڕێژە</MenuItem>
                <MenuItem value="پارە">پارە</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={6}>
               <TextField
    fullWidth
    label="بەهای داشکاندن"
    name="discount_value"
    value={formatNumberWithCommas(formData.discount_value)}
    onChange={e => {
      // Only allow valid decimal numbers
      const rawValue = e.target.value.replace(/,/g, '');
      if (!/^\d*\.?\d*$/.test(rawValue)) return;
      handleChangeWithErrorReset({
        target: { name: 'discount_value', value: rawValue }
      });
    }}
    sx={{ mb: 2 }}
    type="text"
    inputProps={{ min: 0 }}
    error={!!formErrors.discount_value}
    helperText={formErrors.discount_value}
  />
            </Grid>
          </Grid>

              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={6}>
                    <TextField
                        disabled
                        fullWidth
                        label="پارە(داشکاندن)"
                        name="discount_result"
                        value={formatNumberWithCommas(formData.discount_result)}
                        onChange={handleChangeWithErrorReset}
                      />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="ژ.پسوڵە"
                    name="reference_number"
                    value={formData.reference_number}
                    onChange={handleChangeWithErrorReset}
                  />
                </Grid>
            
              </Grid>

              <TextField
                fullWidth
                label="تێبینی"
                name="note"
                value={formData.note}
                onChange={handleChangeWithErrorReset}
                sx={{ mb: 2 }}
              />

              <Grid container spacing={2} >
                <Grid item xs={6}>
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
                </Grid>
                <Grid item xs={6}>
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
                </Grid>
              </Grid>

              <TextField
                fullWidth
                label="بەرواری پارەدان"
                name="payment_date"
                type="date"
                value={formData.payment_date}
                onChange={handleChangeWithErrorReset}
               
                InputLabelProps={{ shrink: true }}
              />

              <Grid container spacing={2} sx={{ mt: 1 }}>
                <Grid item xs={8}>
                  <RegisterButton
                    loading={loading}
                    fullWidth
                    children={selectedPaymentId ? 'نوێکردنەوە' : 'تۆمارکردن'}
                  />
                </Grid>
                <Grid item xs={4}>
                  <ClearButton
                    onClick={() => {
                      setFormData({ ...initialFormData, user_id: getCurrentUserId() });
                      setFormErrors({});
                      setSelectedPaymentId(null);
                      setErrorMessage('');
                      setCurrentPage(1);
                      handleFilter(1, rowsPerPage, sortBy, sortOrder);
                      fetchTotalSumByCurrency();
                    }}
                    fullWidth
                  />
                </Grid>
              </Grid>
            </form>
          </Card>
        </Grid>

        {/* Table Section */}
        <Grid item xs={12} md={8}>
          <Card sx={{ margin: 1, padding: 2 }}>
            <Box sx={{ mb: 2 }}>
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} sm={4}>
                  <TextField
                    select
                    fullWidth
                    label="کڕیار"
                    value={filterCustomer}
                    onChange={e => setFilterCustomer(e.target.value)}
                  >
                    <MenuItem value="">هەموو</MenuItem>
                    {customers.map(cus => (
                      <MenuItem key={cus.id} value={cus.id}>{cus.name}</MenuItem>
                    ))}
                  </TextField>
                </Grid>
                <Grid item xs={12} sm={4}>
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
                <Grid item xs={12} sm={4}>
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
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} md={9}>
                    <DateRangeSelector value={filterDateRange} onChange={setFilterDateRange} />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <ReportButton
                      onClick={() => {}} // Implement PDF/report if needed
                      fullWidth
                      children="چاپکردن"
                    />
                  </Grid>
                </Grid>
              </Box>
            </Box>

            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'id'}
                        direction={sortBy === 'id' ? sortOrder : 'asc'}
                        onClick={() => handleSort('id')}
                      >
                        #
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'customer_id'}
                        direction={sortBy === 'customer_id' ? sortOrder : 'asc'}
                        onClick={() => handleSort('customer_id')}
                      >
                        کڕیار
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'amount'}
                        direction={sortBy === 'amount' ? sortOrder : 'asc'}
                        onClick={() => handleSort('amount')}
                      >
                        بڕ
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'type'}
                        direction={sortBy === 'type' ? sortOrder : 'asc'}
                        onClick={() => handleSort('type')}
                      >
                        جۆر
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'employee_id'}
                        direction={sortBy === 'employee_id' ? sortOrder : 'asc'}
                        onClick={() => handleSort('employee_id')}
                      >
                        کارمەند
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'branch_id'}
                        direction={sortBy === 'branch_id' ? sortOrder : 'asc'}
                        onClick={() => handleSort('branch_id')}
                      >
                        لق
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>تێبینی</TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={sortBy === 'payment_date'}
                        direction={sortBy === 'payment_date' ? sortOrder : 'asc'}
                        onClick={() => handleSort('payment_date')}
                      >
                        بەرواری پارەدان
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>ئیش</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fetching ? (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : currentPayments.length > 0 ? (
                    currentPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.id}</TableCell>
                        <TableCell>
                          {customers.find((c) => c.id === payment.customer_id)?.name || payment.customer_id}
                        </TableCell>
                        <TableCell>
                          {formatNumberWithCommas(payment.amount)} {currencies.find((c) => c.id === payment.currency_id)?.symbol || ''}
                        </TableCell>
                        <TableCell>{payment.type === 'payment' ? 'پارەدان' : 'وەرگرتن'}</TableCell>
                        <TableCell>
                          {employees.find((e) => e.id === payment.employee_id)?.name || payment.employee_id}
                        </TableCell>
                        <TableCell>
                          {branches.find((b) => b.id === payment.branch_id)?.name || payment.branch_id}
                        </TableCell>
                        <TableCell>{payment.note}</TableCell>
                        <TableCell>{formatDate(payment.payment_date)}</TableCell>
                        <TableCell>
                          <IconButton color="primary" onClick={() => handleEditClick(payment)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="secondary" onClick={() => handleDeleteClick(payment.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} align="center">
                        {formData.search
                          ? "هیچ پارەدانێک بە گەڕانەکەت نەدۆزرایەوە"
                          : "هیچ پارەدانێک نەدۆزرایەوە"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                      کۆی گشتی بڕ:
                    </TableCell>
                    <TableCell colSpan={7} align="left" sx={{ fontWeight: 'bold' }}>
                      {Object.entries(totalSumByCurrency).map(([symbol, total]) => (
                        <span key={symbol} style={{ marginRight: 16 }}>
                          {symbol}{formatNumberWithCommas(total)}
                        </span>
                      ))}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </TableContainer>
            <Box mt={2} display="flex" justifyContent="center">
              {totalCount > 0 && (
                <Pagination
                  count={Math.ceil(totalCount / rowsPerPage)}
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
        title="سڕینەوەی پارەدان"
        description="ئایە دڵنیایت لە سڕینەوەی ئەم پارەدانە؟ ئەم کردارە گەرێنەوە نییە."
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

export default PaymentManagment;