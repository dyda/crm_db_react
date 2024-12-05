import React, { useState, useEffect, useMemo } from 'react';
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
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import PrintIcon from '@mui/icons-material/Print';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ClearIcon from '@mui/icons-material/Clear';
import axiosInstance from '../../components/service/axiosInstance';

function CustomerLoan({ isDrawerOpen }) {
  const navigate = useNavigate();

  // State Initialization
  const [customers, setCustomers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [selectedLoanRange, setSelectedLoanRange] = useState('');

  const rowsPerPage = 5;

  // Fetch Customers from API
  useEffect(() => {
    axiosInstance
      .get('/customer/list')
      .then((response) => {
        if (response.data?.success) {
          setCustomers(response.data?.data || []);
        }
      })
      .catch((error) => console.error('Failed to fetch customers:', error))
      .finally(() => setIsLoading(false));
  }, []);

  // Fetch Categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await axiosInstance.get('/customer_category/list');
        if (response.status === 200) {
          setCategories(response.data?.data || []);
        }
      } catch (error) {
        console.error('Error fetching customer categories:', error);
      }
    };
    fetchCategories();
  }, []);


      // Calculate Loans Less Than 0
      const totalLoanLessThanZero = customers.reduce(
        (sum, customer) => (customer.loan < 0 ? sum + (Number(customer.loan) || 0) : sum),
        0
    );

    // Calculate Loans Greater Than 0
    const totalLoanGreaterThanZero = customers.reduce(
        (sum, customer) => (customer.loan > 0 ? sum + (Number(customer.loan) || 0) : sum),
        0
    ); 




  // Reset Pagination on Filter/Search Change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedCategory, selectedType, selectedLoanRange]);

  // Sorting Logic
  const handleSort = (key) => {
    if (!customers.some((customer) => key in customer)) return;

    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) =>
    sortConfig.key === key ? (
      sortConfig.direction === 'asc' ? <ArrowUpwardIcon fontSize="small" /> : <ArrowDownwardIcon fontSize="small" />
    ) : null;

  const sortedCustomers = useMemo(() => {
    return [...customers].sort((a, b) => {
      const aValue = a[sortConfig.key] || '';
      const bValue = b[sortConfig.key] || '';

      const aString = typeof aValue === 'string' ? aValue : String(aValue);
      const bString = typeof bValue === 'string' ? bValue : String(bValue);

      return sortConfig.direction === 'asc'
        ? aString.localeCompare(bString, undefined, { numeric: true })
        : bString.localeCompare(aString, undefined, { numeric: true });
    });
  }, [customers, sortConfig]);

  const filteredCustomers = useMemo(() => {
    return sortedCustomers.filter((customer) => {
      const matchesCategory = selectedCategory ? customer.category?.name === selectedCategory : true;
      const matchesType = selectedType ? customer.type === selectedType : true;
      const matchesLoanRange =
        selectedLoanRange === 'negative'
          ? customer.loan < 0
          : selectedLoanRange === 'zero'
          ? customer.loan === 0
          : selectedLoanRange === 'positive'
          ? customer.loan > 0
          : true;

      const normalizedQuery = searchQuery.toLowerCase();
      const matchesSearch = [
        customer.name?.toLowerCase(),
        customer.type?.toLowerCase(),
        customer.phone_1,
        String(customer.loan),
        String(customer.limit_loan_price),
      ].some((field) => field?.includes(normalizedQuery));

      return matchesCategory && matchesType && matchesLoanRange && matchesSearch;
    });
  }, [sortedCustomers, searchQuery, selectedCategory, selectedType, selectedLoanRange]);

  // Pagination Logic
  const indexOfLastCustomer = currentPage * rowsPerPage;
  const indexOfFirstCustomer = indexOfLastCustomer - rowsPerPage;
  const currentCustomers = filteredCustomers.slice(indexOfFirstCustomer, indexOfLastCustomer);

  const handlePageChange = (_, value) => setCurrentPage(value);

  const handleClearSearch = () => setSearchQuery('');
  const handleClearAllFilters = () => {
    setSearchQuery('');
    setSelectedCategory('');
    setSelectedType('');
    setSelectedLoanRange('');
  };

  const loanRanges = [
    { label: 'Less than 0', value: 'negative' },
    { label: 'Equal to 0', value: 'zero' },
    { label: 'Greater than 0', value: 'positive' },
  ];

  const handlePrintCustomer = (id) => navigate(`/customer/edit/${id}`);

  return (
    <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s ease-in-out' }}>
      <Card sx={{ margin: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box p={2}>
              <Box mb={3}>
                <Grid container spacing={2} alignItems="center">
                  {/* Search Bar */}
                  <Grid item xs={12} sm={6} md={4}>
                    <TextField
                      label="گەڕان"
                      variant="outlined"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      fullWidth
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
                  </Grid>

                  {/* Dropdown: Category */}
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>گرووپ</InputLabel>
                      <Select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        label="گرووپ"
                      >
                        <MenuItem value="">هەمووی</MenuItem>
                        {categories.map((category) => (
                          <MenuItem key={category.id} value={category.name}>
                            {category.name}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Dropdown: Type */}
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>جۆر</InputLabel>
                      <Select
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                        label="جۆر"
                      >
                        <MenuItem value="">هەردووکی</MenuItem>
                        <MenuItem value="فرۆشتن">فرۆشتن</MenuItem>
                        <MenuItem value="کڕین">کڕین</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>

                  {/* Dropdown: Loan */}
                  <Grid item xs={12} sm={6} md={2}>
                    <FormControl fullWidth>
                      <InputLabel>قەرز</InputLabel>
                      <Select
                        value={selectedLoanRange}
                        onChange={(e) => setSelectedLoanRange(e.target.value)}
                        label="قەرز"
                      >
                        <MenuItem value="">هەمووی</MenuItem>
                        {loanRanges.map((range) => (
                          <MenuItem key={range.value} value={range.value}>
                            {range.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12} sm={6} md={2}>
                    <Box display="flex" gap={1}>
                        <Button
                        variant="contained"
                        color="primary"
                        startIcon={<PrintIcon />}
                        fullWidth
                        >
                        پرینت
                        </Button>

                        <Button
                        variant="outlined"
                        color="secondary"
                        startIcon={<ClearIcon />}
                        onClick={handleClearAllFilters}
                        fullWidth
                        >
                        پاکردنەوە
                        </Button>
                    </Box>
                    </Grid>


                 
                </Grid>
              </Box>

              {isLoading ? (
                <Box display="flex" justifyContent="center" mt={5}>
                  چاوەڕوانبە..
                </Box>
              ) : (
                <>
                  <TableContainer component={Paper}>
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell onClick={() => handleSort('id')} style={{ cursor: 'pointer' }}>
                            # {getSortIcon('id')}
                          </TableCell>
                          <TableCell>گرووپ</TableCell>
                          <TableCell onClick={() => handleSort('name')} style={{ cursor: 'pointer' }}>
                            ناو {getSortIcon('name')}
                          </TableCell>
                          <TableCell>مۆبایل</TableCell>
                          <TableCell onClick={() => handleSort('type')} style={{ cursor: 'pointer' }}>
                            جۆر {getSortIcon('type')}
                          </TableCell>
                          <TableCell onClick={() => handleSort('loan')} style={{ cursor: 'pointer' }}>
                            قەرز {getSortIcon('loan')}
                          </TableCell>
                          <TableCell onClick={() => handleSort('limit_loan_price')} style={{ cursor: 'pointer' }}>
                            سنوری قەرز {getSortIcon('limit_loan_price')}
                          </TableCell>
                          <TableCell>چاپکردن</TableCell>
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
                              <TableCell
                                style={{
                                  color:
                                    customer.type === 'فرۆشتن'
                                      ? 'green'
                                      : customer.type === 'کڕین'
                                      ? 'red'
                                      : 'blue',
                                }}
                              >
                                {customer.type}
                              </TableCell>
                              <TableCell
                                style={{
                                  color:
                                    customer.loan < 0
                                      ? 'red'
                                      : customer.loan > 0
                                      ? 'green'
                                      : 'black',
                                }}
                              >
                                {new Intl.NumberFormat('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(customer.loan)}
                              </TableCell>
                              <TableCell>
                                {new Intl.NumberFormat('en-US', {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                }).format(customer.limit_loan_price)}
                              </TableCell>
                              <TableCell>
                                <IconButton
                                  color="primary"
                                  onClick={() => handlePrintCustomer(customer.id)}
                                  aria-label="Print customer details"
                                >
                                  <PrintIcon />
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

                      <tfoot>
                        {filteredCustomers.length > 0 && (
                            <TableRow>
                            <TableCell
                                colSpan={3}
                                align="right"
                                style={{
                                color: totalLoanLessThanZero < 0 ? 'red' : 'black',
                                }}
                            >
                                <strong>قەرزەکانم لای کڕیار:</strong>
                                {` ${new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                }).format(totalLoanLessThanZero)}`}
                            </TableCell>
                            <TableCell
                                colSpan={3}
                                align="right"
                                style={{
                                color: totalLoanGreaterThanZero > 0 ? 'green' : 'black',
                                }}
                            >
                                <strong>قەرزەکانی خەڵک:</strong>
                                {` ${new Intl.NumberFormat('en-US', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                                }).format(totalLoanGreaterThanZero)}`}
                            </TableCell>
                            </TableRow>
                        )}
                        </tfoot>

                    </Table>
                  </TableContainer>

                  <Box mt={2} display="flex" justifyContent="center">
                    <Pagination
                      count={Math.max(1, Math.ceil(filteredCustomers.length / rowsPerPage))}
                      page={currentPage}
                      onChange={handlePageChange}
                      color="primary"
                    />
                  </Box>
                </>
              )}
            </Box>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}

export default CustomerLoan;
