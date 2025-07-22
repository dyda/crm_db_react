import React, { useState, useEffect } from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableFooter,
  Paper,
  Button,
  IconButton,
  Pagination,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  Typography,
  MenuItem,
  Grid,
  Stack,
  Select,
  FormControl,
  InputLabel,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowUpward,
  ArrowDownward,
  Clear as ClearIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import axiosInstance from '../../components/service/axiosInstance';
import ConfirmDialog from '../../components/utils/ConfirmDialog';
import ReportButton from '../../components/common/ReportButton';
import { useNavigate } from 'react-router-dom';

function CustomerList({ isDrawerOpen }) {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [sortBy, setSortBy] = useState('id');
  const [sortOrder, setSortOrder] = useState('asc');
  const [filterState, setFilterState] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterZone, setFilterZone] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [zones, setZones] = useState([]);
  const [categories, setCategories] = useState([]);
  const rowsPerPage = 10;

  // Fetch customers
  useEffect(() => {
    fetchCustomers(currentPage, rowsPerPage, sortBy, sortOrder, searchQuery, filterState, filterType, filterZone, filterCategory);
    // eslint-disable-next-line
  }, [currentPage, sortBy, sortOrder, searchQuery, filterState, filterType, filterZone, filterCategory]);

  useEffect(() => {
    axiosInstance.get('/zone/index')
      .then((response) => {
        setZones(Array.isArray(response.data) ? response.data : response.data.results || []);
      })
      .catch(() => setZones([]));
    axiosInstance.get('/customer-category/index')
      .then((response) => {
        setCategories(Array.isArray(response.data) ? response.data : response.data.results || []);
      })
      .catch(() => setCategories([]));
  }, []);

  const fetchCustomers = async (
    page = 1,
    pageSize = rowsPerPage,
    sortField = sortBy,
    sortDirection = sortOrder,
    search = '',
    state = '',
    type = '',
    zone = '',
    category = ''
  ) => {
    try {
      const params = {
        page,
        pageSize,
        sortBy: sortField,
        sortOrder: sortDirection,
        name: search,
        state,
        type,
        zone_id: zone,
        category_id: category,
      };
      const response = await axiosInstance.get('/customer/index', { params });
      setCustomers(response.data || []);
    } catch (error) {
      setSnackbarMessage('هەڵە ڕوویدا لە بارکردنی زانیاری');
      setSnackbarOpen(true);
    }
  };

  const handleSort = (key) => {
    setSortBy(key);
    setSortOrder((prev) => (sortBy === key && sortOrder === 'asc' ? 'desc' : 'asc'));
    setCurrentPage(1);
  };

  const getSortIcon = (key) =>
    sortBy === key ? (
      sortOrder === 'asc' ? (
        <ArrowUpward fontSize="small" />
      ) : (
        <ArrowDownward fontSize="small" />
      )
    ) : null;

  const handlePageChange = (_, value) => setCurrentPage(value);
  const handleAddCustomer = () => navigate('/customer/register');
  const handleEditCustomer = (id) => navigate(`/customer/edit/${id}`);
  const handleClearSearch = () => setSearchQuery('');
  const handleDeleteClick = (id) => {
    setSelectedCustomerId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/customer/delete/${selectedCustomerId}`);
      setCustomers((prev) => prev.filter((customer) => customer.id !== selectedCustomerId));
      setSnackbarMessage('کڕیار سڕایەوە بە سەرکەوتوویی');
    } catch (error) {
      setSnackbarMessage('هەڵە ڕوویدا لە سڕینەوەی کڕیار');
    } finally {
      setOpenDialog(false);
      setSnackbarOpen(true);
    }
  };

  // Calculate sums
  const totalCount = customers.length;
  const totalPositiveLoan = customers.reduce(
    (sum, c) => sum + (Number(c.loan) > 0 ? Number(c.loan) : 0),
    0
  );
  const totalNegativeLoan = customers.reduce(
    (sum, c) => sum + (Number(c.loan) < 0 ? Number(c.loan) : 0),
    0
  );

  // Pagination
  const paginatedCustomers = customers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  // Responsive filter section
  const filterSection = (
    <Box sx={{ mb: 2 }}>
      <Paper sx={{ p: { xs: 2, md: 3 }, mb: 2 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              label="گەڕان"
              value={searchQuery}
              onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              placeholder="ناوی کڕیار..."
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleClearSearch} size="small">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>حاڵەت</InputLabel>
              <Select
                label="حاڵەت"
                value={filterState}
                onChange={e => { setFilterState(e.target.value); setCurrentPage(1); }}
                startAdornment={<FilterListIcon fontSize="small" />}
              >
                <MenuItem value="">هەموو</MenuItem>
                <MenuItem value="چالاک">چالاک</MenuItem>
                <MenuItem value="ناچالاک">ناچالاک</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>جۆر</InputLabel>
              <Select
                label="جۆر"
                value={filterType}
                onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}
                startAdornment={<FilterListIcon fontSize="small" />}
              >
                <MenuItem value="">هەموو</MenuItem>
                <MenuItem value="هەردووکی">هەردووکی</MenuItem>
                <MenuItem value="کڕین">کڕین</MenuItem>
                <MenuItem value="فرۆشتن">فرۆشتن</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={2}>
            <FormControl fullWidth>
              <InputLabel>زون</InputLabel>
              <Select
                label="زون"
                value={filterZone}
                onChange={e => { setFilterZone(e.target.value); setCurrentPage(1); }}
                startAdornment={<FilterListIcon fontSize="small" />}
              >
                <MenuItem value="">هەموو</MenuItem>
                {zones.map((zone) => (
                  <MenuItem key={zone.id} value={zone.id}>{zone.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} md={3}>
            <FormControl fullWidth>
              <InputLabel>گرووپ</InputLabel>
              <Select
                label="گرووپ"
                value={filterCategory}
                onChange={e => { setFilterCategory(e.target.value); setCurrentPage(1); }}
                startAdornment={<FilterListIcon fontSize="small" />}
              >
                <MenuItem value="">هەموو</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );

  return (
    <Box
      sx={{
        marginRight: isDrawerOpen ? '250px' : '0',
        transition: 'margin-right 0.3s ease-in-out',
        px: { xs: 1, md: 2 },
        py: { xs: 2, md: 3 },
      }}
    >
      {/* Header */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        justifyContent="space-between"
        alignItems={{ xs: 'flex-start', md: 'center' }}
        spacing={2}
        mb={3}
      >
        <Typography variant="h5" fontWeight="bold" color="primary.main">
          لیستی کڕیارەکان
        </Typography>
        <Stack direction="row" spacing={2}>
          <ReportButton
            onClick={() => {}}
            sx={{ borderRadius: 2, fontWeight: 'bold', px: 3, py: 1 }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddCustomer}
            sx={{ borderRadius: 2, fontWeight: 'bold', px: 3, py: 1 }}
          >
            زیادکردن
          </Button>
        </Stack>
      </Stack>

      {/* Professional Filter Section */}
      {filterSection}

      {/* Table */}
      <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell onClick={() => handleSort('id')} sx={{ cursor: 'pointer' }}>
                ID {getSortIcon('id')}
              </TableCell>
              <TableCell onClick={() => handleSort('name')} sx={{ cursor: 'pointer' }}>
                ناو {getSortIcon('name')}
              </TableCell>
              <TableCell>مۆبایل١</TableCell>
              <TableCell>مۆبایل٢</TableCell>
              <TableCell>جۆر</TableCell>
              <TableCell>حاڵەت</TableCell>
              <TableCell>شار</TableCell>
              <TableCell>زون</TableCell>
              <TableCell>گرووپ</TableCell>
              <TableCell>کۆد</TableCell>
              <TableCell>ناوی کەفیل</TableCell>
              <TableCell>مۆبایلی کەفیل</TableCell>
              <TableCell>ناونیشان</TableCell>
              <TableCell>قەرز</TableCell>
              <TableCell>تێبینی</TableCell>
              <TableCell align="center">کردار</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedCustomers.map((customer) => (
              <TableRow key={customer.id} hover>
                <TableCell>{customer.id}</TableCell>
                <TableCell>{customer.name}</TableCell>
                <TableCell>{customer.phone_1}</TableCell>
                <TableCell>{customer.phone_2}</TableCell>
                <TableCell>{customer.type}</TableCell>
                <TableCell>{customer.state}</TableCell>
                <TableCell>{customer.city_id}</TableCell>
                <TableCell>{customer.zone_id}</TableCell>
                <TableCell>{customer.category_id}</TableCell>
                <TableCell>{customer.code}</TableCell>
                <TableCell>{customer.kafyl_name}</TableCell>
                <TableCell>{customer.kafyl_phone}</TableCell>
                <TableCell>{customer.address}</TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      color: Number(customer.loan) > 0 ? 'green' : Number(customer.loan) < 0 ? 'red' : 'inherit',
                    }}
                  >
                    {Number(customer.loan || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </Typography>
                </TableCell>
                <TableCell>{customer.note}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => handleEditCustomer(customer.id)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton color="error" onClick={() => handleDeleteClick(customer.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {!paginatedCustomers.length && (
              <TableRow>
                <TableCell colSpan={16} align="center">
                  هیچ زانیارییەک نەدۆزرایەوە.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            <TableRow>
              <TableCell colSpan={8} align="right" sx={{ background: '#f5f5f5', fontWeight: 'bold', fontSize: 16 }}>
                کۆی گشتی کڕیارەکان: <span style={{ fontWeight: 'bold', color: '#1976d2' }}>{totalCount}</span>
              </TableCell>
              <TableCell colSpan={4} align="center" sx={{ background: '#f5f5f5', fontWeight: 'bold', fontSize: 16 }}>
                قەرزی پۆزیتڤ: <span style={{ fontWeight: 'bold', color: '#388e3c' }}>{totalPositiveLoan.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </TableCell>
              <TableCell colSpan={4} align="center" sx={{ background: '#f5f5f5', fontWeight: 'bold', fontSize: 16 }}>
                قەرزی نێگەتڤ: <span style={{ fontWeight: 'bold', color: '#d32f2f' }}>{totalNegativeLoan.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(customers.length / rowsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        open={openDialog}
        onClose={setOpenDialog}
        onConfirm={handleDeleteConfirm}
        title="سڕینەوەی کڕیار"
        description="ئایە دڵنیایت لە سڕینەوەی ئەم کڕیارە؟ ئەم کردارە گەرێنەوە نییە."
        confirmText="سڕینەوە"
        cancelText="پاشگەزبوونەوە"
      />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={4000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity="info" onClose={() => setSnackbarOpen(false)} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
}
export default CustomerList;