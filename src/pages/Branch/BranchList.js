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
  Pagination,
  TextField,
  InputAdornment,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  ArrowUpward,
  ArrowDownward,
  Clear as ClearIcon,
} from '@mui/icons-material';
import axiosInstance from '../../components/service/axiosInstance';
import ConfirmDialog from '../../components/utils/ConfirmDialog';

function BranchList({ isDrawerOpen }) {
  const navigate = useNavigate();
  const [branches, setBranches] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState(null);

  const rowsPerPage = 5;

  useEffect(() => {
    if (localStorage.getItem('showSessionExpiredMessage') === '1') {
      alert('کاتی چوونە ژوورەوە تەواو بوو، تکایە دووبارە بچۆ ژوورەوە.');
      localStorage.removeItem('showSessionExpiredMessage');
    }

    const fetchBranches = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/branch/index');
        if (response.status === 200) {
          setBranches(response.data || []);
        }
      } catch (error) {
        setSnackbarMessage('هەڵە ڕوویدا لە بارکردنی زانیاری');
        setSnackbarOpen(true);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBranches();
  }, []);

  const handleSort = (key) => {
    if (!branches.some((branch) => key in branch)) return;
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc',
    }));
  };

  const getSortIcon = (key) =>
    sortConfig.key === key ? (
      sortConfig.direction === 'asc' ? (
        <ArrowUpward fontSize="small" />
      ) : (
        <ArrowDownward fontSize="small" />
      )
    ) : null;

  const sortedBranches = useMemo(() => {
    return [...branches].sort((a, b) => {
      const aValue = a[sortConfig.key] ?? '';
      const bValue = b[sortConfig.key] ?? '';
      return sortConfig.direction === 'asc'
        ? String(aValue).localeCompare(String(bValue), undefined, { numeric: true })
        : String(bValue).localeCompare(String(aValue), undefined, { numeric: true });
    });
  }, [branches, sortConfig]);

  const filteredBranches = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return sortedBranches.filter((branch) =>
      [
        'name',
        'company_name',
        'city_name',
        'region_name',
        'user_name',
        'wallet',
        'type',
        'phone_1',
        'state',
        'address',
      ].some((key) => branch[key]?.toLowerCase().includes(query))
    );
  }, [sortedBranches, searchQuery]);

  const currentBranches = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return filteredBranches.slice(start, start + rowsPerPage);
  }, [filteredBranches, currentPage]);

  // Calculate sum of wallet for filtered branches
const totalWallet = filteredBranches.reduce(
  (sum, branch) => sum + Number(branch.wallet || 0),
  0
);

  const handlePageChange = (_, value) => setCurrentPage(value);
  const handleAddBranch = () => navigate('/branch/register');
  const handleEditBranch = (id) => navigate(`/branch/edit/${id}`);
  const handleClearSearch = () => setSearchQuery('');
  const handleDeleteClick = (id) => {
    setSelectedBranchId(id);
    setOpenDialog(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/branch/delete/${selectedBranchId}`);
      setBranches((prev) => prev.filter((branch) => branch.id !== selectedBranchId));
      setSnackbarMessage('لق سڕایەوە بە سەرکەوتوویی');
    } catch (error) {
      setSnackbarMessage('هەڵە ڕوویدا لە سڕینەوەی شعبە');
    } finally {
      setOpenDialog(false);
      setSnackbarOpen(true);
    }
  };

  return (
    <Box
      sx={{
        marginRight: isDrawerOpen ? '250px' : '0',
        transition: 'margin-right 0.3s ease-in-out',
        px: 2,
        py: 3,
      }}
    >
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        flexDirection={{ xs: 'column', md: 'row' }}
        rowGap={2}
        mb={3}
      >
        <Typography variant="h5" sx={{ width: '100%' }}>
          لیستی لقەکان
        </Typography>

        <Box
          display="flex"
          flexDirection={{ xs: 'column', sm: 'row' }}
          gap={2}
          alignItems="stretch"
          sx={{ width: '100%' }}
        >
          <TextField
            label="گەڕان..."
            variant="outlined"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
         
            fullWidth
            InputProps={{
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch} size="small">
                    <ClearIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddBranch}
            sx={{ whiteSpace: 'nowrap' }}
          >
            زیادکردن
          </Button>
        </Box>
      </Box>

      {/* Table */}
      {isLoading ? (
        <Box display="flex" justifyContent="center" mt={5}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell onClick={() => handleSort('id')}>ID {getSortIcon('id')}</TableCell>
                <TableCell onClick={() => handleSort('name')}>ناوی لق {getSortIcon('name')}</TableCell>
                <TableCell onClick={() => handleSort('company_name')}>کۆمپانیا {getSortIcon('company_name')}</TableCell>
                <TableCell onClick={() => handleSort('city_name')}>شار {getSortIcon('city_name')}</TableCell>
                <TableCell>ناوچە</TableCell>
                <TableCell>بەڕێوەبەر</TableCell>
                <TableCell onClick={() => handleSort('wallet')}>قاصە {getSortIcon('wallet')}</TableCell>
                <TableCell>جۆر</TableCell>
                <TableCell>ژمارەی مۆبایل</TableCell>
                <TableCell>دۆخ</TableCell>
                <TableCell>ناونیشان</TableCell>
                <TableCell align="center">کردار</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentBranches.map((branch) => (
                <TableRow key={branch.id} hover>
                  <TableCell>{branch.id}</TableCell>
                  <TableCell>{branch.name}</TableCell>
                  <TableCell>{branch.company_name || '-'}</TableCell>
                  <TableCell>{branch.city_name || '-'}</TableCell>
                  <TableCell>{branch.region_name || '-'}</TableCell>
                  <TableCell>{branch.user_name || '-'}</TableCell>
                  <TableCell>
                    <Typography
                      sx={{
                        color: branch.wallet > 0 ? 'green' : branch.wallet < 0 ? 'red' : 'inherit',
                      }}
                    >
                      {Number(branch.wallet || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </Typography>
                  </TableCell>
                  <TableCell>{branch.type || '-'}</TableCell>
                  <TableCell>{branch.phone_1 || '-'}</TableCell>
                  <TableCell>{branch.state || '-'}</TableCell>
                  <TableCell
                    sx={{
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      maxWidth: 150,
                    }}
                  >
                    {branch.address || '-'}
                  </TableCell>
                  <TableCell align="center">
                    <IconButton color="primary" onClick={() => handleEditBranch(branch.id)}>
                      <EditIcon />
                    </IconButton>
                    <IconButton color="error" onClick={() => handleDeleteClick(branch.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {!currentBranches.length && (
                <TableRow>
                  <TableCell colSpan={13} align="center">
                    هیچ زانیارییەک نەدۆزرایەوە.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      <Box display="flex" justifyContent="center" mt={3}>
        <Pagination
          count={Math.ceil(filteredBranches.length / rowsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </Box>

      {/* Total Count and Total Wallet on one row */}
      <Box display="flex" justifyContent="left" alignItems="center" gap={4} mt={2}>
        <Typography variant="subtitle1">
          کۆی گشتی لقەکان: {filteredBranches.length}
        </Typography>
        <Typography variant="subtitle1">
          کۆی گشتی قاصەکان: {totalWallet.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </Typography>
      </Box>

      {/* Delete Confirmation Dialog */}
        <ConfirmDialog
      open={openDialog}
      onClose={setOpenDialog}
      onConfirm={handleDeleteConfirm}
      title="سڕینەوەی لق"
      description="ئایە دڵنیایت لە سڕینەوەی ئەم لقە ئەم کردارە گەرێنەوە نییە."
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

export default BranchList;
