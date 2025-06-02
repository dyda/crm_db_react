import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, Typography, TextField, Button, IconButton, InputAdornment,
  Snackbar, Alert, CircularProgress, Table, TableHead, TableRow,
  TableCell, TableBody, TableContainer, Paper, Pagination, MenuItem, Avatar
} from '@mui/material';
import {
  Clear as ClearIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Search as SearchIcon,
  PriceCheck as PriceIcon,
  Warehouse as WarehouseIcon
} from '@mui/icons-material';
import ConfirmDialog from '../../components/utils/ConfirmDialog';
import axiosInstance from '../../components/service/axiosInstance';
import { BASE_URL } from '../../config/constants';
import ItemPriceModal from './ItemPriceModal';
import ItemQuantityModal from './ItemQuantityModal';

function ItemManagment({ isDrawerOpen }) {
   const initialFormData = {
    name: '',
    description: '',
    category_id: '',
    brand_id: '',
    cost: '',
    barcode: '',
    isService: 0,
    image: '',
    allow_zero_sell: 1,
    search: '',
  };

  const rowsPerPage = 5;

   const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [fetching, setFetching] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [priceModalOpen, setPriceModalOpen] = useState(false);
  const [priceModalItem, setPriceModalItem] = useState(null);
  const [priceTypes, setPriceTypes] = useState([]);
  const [units, setUnits] = useState([]);
  const [quantityModalOpen, setQuantityModalOpen] = useState(false);
  const [quantityModalItem, setQuantityModalItem] = useState(null);
  const [warehouses, setWarehouses] = useState([]);


    // Image upload and preview
  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData((prev) => ({
          ...prev,
          image: e.target.result, // base64 for preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

   const handleClearImage = () => {
    setImageFile(null);
    setFormData((prev) => ({ ...prev, image: '' }));
  };



useEffect(() => {
  fetchAllData();
  fetchCategories();
  fetchBrands();
  fetchPriceTypes();
  fetchUnits();
  fetchWarehouses();
}, []);

const fetchWarehouses = async () => {
  const res = await axiosInstance.get('/warehouse/index');
  setWarehouses(res.data || []);
};

    const fetchPriceTypes = async () => {
      const res = await axiosInstance.get('/item-price-type/index');
      setPriceTypes(res.data || []);
    };
    const fetchUnits = async () => {
      const res = await axiosInstance.get('/item-unit/index');
      setUnits(res.data || []);
    };

  const fetchAllData = async () => {
    setFetching(true);
    try {
      const res = await axiosInstance.get('/item/index');
      setItems(res.data || []);
    } catch (err) {
      setErrorMessage('هەڵە ڕوویدا لە بارکردنی داتا');
    } finally {
      setFetching(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axiosInstance.get('/item-category/index');
      setCategories(res.data || []);
    } catch {}
  };

  const fetchBrands = async () => {
    try {
      const res = await axiosInstance.get('/item-brand/index');
      setBrands(res.data || []);
    } catch {}
  };

   const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage('');

    const errors = {};
    if (!formData.name.trim()) errors.name = 'ناوی کاڵا پێویستە';
    if (!formData.cost) errors.cost = 'نرخی کاڵا پێویستە';

    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      setLoading(false);
      return;
    }

    try {

         // Clean barcode before building payload
  const cleanFormData = { ...formData };
  if (!cleanFormData.barcode || cleanFormData.barcode.trim() === '') {
    cleanFormData.barcode = null;
  }


 let payload;
  let config = {};
  if (imageFile) {
    payload = new FormData();
    Object.entries(cleanFormData).forEach(([key, value]) => {
      if (key !== 'image') payload.append(key, value);
    });
    payload.append('image', imageFile);
    config.headers = { 'Content-Type': 'multipart/form-data' };
  } else {
    payload = { ...cleanFormData };
    if (selectedItemId && cleanFormData.image) {
      payload.image_url = cleanFormData.image;
    }
  }

      const sendPayload = { ...payload };
      if (selectedItemId) {
        if (!imageFile && payload instanceof FormData) {
          payload.delete('image');
        }
      }

      let response;
      if (selectedItemId) {
        response = await axiosInstance.put(`/item/update/${selectedItemId}`, payload, config);
      } else {
        response = await axiosInstance.post('/item/store', payload, config);
      }

      console.log('sendPayload:', sendPayload);
      console.log('response:', response.data);
      

      if ([200, 201].includes(response.status)) {
        fetchAllData();
        setSuccess(true);
        setFormData(initialFormData);
        setImageFile(null);
        setSelectedItemId(null);
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

   const handleEditClick = (item) => {
    setSelectedItemId(item.id);
    setFormData({
      name: item.name || '',
      description: item.description || '',
      category_id: item.category_id || '',
      brand_id: item.brand_id || '',
      cost: item.cost || '',
      barcode: item.barcode || '',
      isService: item.isService || 0,
      image: item.image_url || '',
    allow_zero_sell: item.allow_zero_sell !== undefined ? Number(item.allow_zero_sell) : 1, // <-- FIXED
      search: '',
    });
    setImageFile(null);
    setFormErrors({});
  };

  // price model
  const handlePriceClick = (itemId) => {
    setPriceModalItem(items.find(i => i.id === itemId));
    setPriceModalOpen(true);
  };
  const handlePriceModalClose = () => {
    setPriceModalOpen(false);
    setPriceModalItem(null);
  };

  const handleDeleteClick = (id) => {
    setSelectedItemId(id);
    setOpenDialog(true);
  };

  // handle warehouse click
  const handleItemWarehouseClick = (itemId) => {
  setQuantityModalItem(items.find(i => i.id === itemId));
  setQuantityModalOpen(true);
};
const handleQuantityModalClose = () => {
  setQuantityModalOpen(false);
  setQuantityModalItem(null);
};

  // handleDeleteConfirm function
  const handleDeleteConfirm = async () => {
    try {
      await axiosInstance.delete(`/item/delete/${selectedItemId}`);
      setItems(prev => prev.filter(i => i.id !== selectedItemId));
      setSuccess(true);
    } catch (err) {
      setErrorMessage('هەڵە ڕوویدا لە سڕینەوە');
    } finally {
      setOpenDialog(false);
      setSelectedItemId(null);
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
      setItems(prev =>
        prev.filter(
          i =>
            i.name.includes(value) ||
            (i.description && i.description.includes(value)) ||
            (i.barcode && i.barcode.includes(value))
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

  // Convert to number for specific fields
  if (name === 'allow_zero_sell' || name === 'isService') {
    setFormData(prev => ({ ...prev, [name]: Number(value) }));
  } else {
    setFormData(prev => ({ ...prev, [name]: value }));
  }
};

  const clearSelectField = (field) => {
    setFormData(prev => ({ ...prev, [field]: '' }));
    setFormErrors(prev => ({ ...prev, [field]: '' }));
  };

  const currentItems = items.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  return (
    <Box sx={{ marginRight: isDrawerOpen ? '250px' : '0', transition: 'margin-right 0.3s' }}>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}>
          <Card sx={{ m: 1, p: 2 }}>
            <Typography variant="h6" gutterBottom>
              {selectedItemId ? 'گۆڕینی کاڵا' : 'زیادکردنی کاڵا'}
            </Typography>
            <form onSubmit={handleSubmit}>

                 <TextField
                select
                fullWidth
                label="گرووپ"
                name="category_id"
                value={formData.category_id}
                onChange={handleChangeWithErrorReset}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">هیچ</MenuItem>
                {categories.map((cat) => (
                  <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="براند"
                name="brand_id"
                value={formData.brand_id}
                onChange={handleChangeWithErrorReset}
                sx={{ mb: 2 }}
              >
                <MenuItem value="">هیچ</MenuItem>
                {brands.map((brand) => (
                  <MenuItem key={brand.id} value={brand.id}>{brand.name}</MenuItem>
                ))}
              </TextField>   

                  <TextField
                fullWidth
                label="بارکۆد"
                name="barcode"
                value={formData.barcode}
                onChange={handleChangeWithErrorReset}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.barcode && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('barcode')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />


              <TextField
                fullWidth
                label="ناوی کاڵا"
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
                label="نرخ(بچوکترین یەکە)"
                name="cost"
                type="number"
                value={formData.cost}
                onChange={handleChangeWithErrorReset}
                error={!!formErrors.cost}
                helperText={formErrors.cost}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.cost && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('cost')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
          

              <Grid container spacing={2}>
                        <Grid item xs={6}>
                            <TextField
                            select
                            fullWidth
                            label="جۆری کاڵا"
                            name="isService"
                            value={formData.isService}
                            onChange={handleChangeWithErrorReset}
                            sx={{ mb: 2 }}
                            >
                            <MenuItem value={0}>کاڵا</MenuItem>
                            <MenuItem value={1}>خزمەتگوزاری</MenuItem>
                            </TextField>
                        </Grid>

                    <Grid item xs={6}>
                        <TextField
                        select
                        fullWidth
                        label="ڕێگە بە فرۆشتنی سفرە"
                        name="allow_zero_sell"
                        value={formData.allow_zero_sell}
                        onChange={handleChangeWithErrorReset}
                        sx={{ mb: 2 }}
                        >
                        <MenuItem value={1}>بەڵێ</MenuItem>
                        <MenuItem value={0}>نەخێر</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                 <TextField
                fullWidth
                label="وەسف"
                name="description"
                value={formData.description}
                onChange={handleChangeWithErrorReset}
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: formData.description && (
                    <InputAdornment position="end">
                      <IconButton onClick={() => clearSelectField('description')}>
                        <ClearIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

             

             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                <Button variant="contained" component="label">
                  هەڵبژاردنی وێنە
                  <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                </Button>
                <Avatar
                  src={
                    formData.image
                      ? formData.image.startsWith('http') || formData.image.startsWith('data:')
                        ? formData.image
                      : `${BASE_URL}${formData.image}`
                      : ''
                  }
                  alt="Item"
                  sx={{ width: 56, height: 56 }}
                />
                {formData.image && (
                  <IconButton onClick={handleClearImage}>
                    <ClearIcon />
                  </IconButton>
                )}
              </Box>
             
              <Button type="submit" fullWidth variant="contained" color="success" disabled={loading}>
                {loading ? 'Loading...' : selectedItemId ? 'نوێکردنەوە' : 'تۆمارکردن'}
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
              placeholder="ناو، وەسف یان بارکۆد..."
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
                    <TableCell>وێنە</TableCell>
                    <TableCell>ناوی کاڵا</TableCell>
                     <TableCell>گرووپ</TableCell>
                    <TableCell>براند</TableCell>
                     <TableCell>بارکۆد</TableCell>
                      <TableCell>نرخ</TableCell>
                    <TableCell>جۆر</TableCell>
                    <TableCell>سفر ڕێگەبدات </TableCell>
                     <TableCell>نرخی فرۆشتن</TableCell>
                     <TableCell>کۆگا</TableCell>
                    <TableCell>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {fetching ? (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : currentItems.length > 0 ? (
                    currentItems.map((item) => (
                      <TableRow key={item.id}>
                        
                        <TableCell>{item.id}</TableCell>
                         <TableCell>
                          {item.image_url ? (
                            <Avatar
                              src={
                                item.image_url.startsWith('http')
                                  ? item.image_url
                                  : `${BASE_URL}${item.image_url}`
                              }
                              alt={item.name}
                            />
                          ) : (
                            <Avatar>{item.name?.charAt(0) || '?'}</Avatar>
                          )}
                        </TableCell>
                        <TableCell>{item.name}</TableCell>
                        
                        <TableCell>
                          {categories.find((c) => c.id === item.category_id)?.name || item.category_id}
                        </TableCell>
                        <TableCell>
                          {brands.find((b) => b.id === item.brand_id)?.name || item.brand_id}
                        </TableCell>
                        <TableCell>{item.barcode}</TableCell>
                        <TableCell>{item.cost}</TableCell>
                       
                        <TableCell>{item.isService ? "خزمەتگوزاری" : "کاڵا"}</TableCell>
                        <TableCell
                            sx={{ color: Number(item.allow_zero_sell) ? 'red' : 'green' }}
                            >
                            {Number(item.allow_zero_sell) ? "بەڵێ" : "نەخێر"}
                            </TableCell>

                             <TableCell>

                          <IconButton color="primary" onClick={() => handlePriceClick(item.id)}>
                            <PriceIcon />
                          </IconButton>

                        </TableCell> 
                        
                        <TableCell>

                    <IconButton color="primary" onClick={() => handleItemWarehouseClick(item.id)}>
                                              <WarehouseIcon />
                                              </IconButton>
                        </TableCell>

                        <TableCell>

                          <IconButton color="primary" onClick={() => handleEditClick(item)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton color="secondary" onClick={() => handleDeleteClick(item.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={11} align="center">
                        {formData.search
                          ? 'هیچ کاڵایەک بە گەڕانەکەت نەدۆزرایەوە'
                          : 'هیچ کاڵایەک نەدۆزرایەوە'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            {items.length > rowsPerPage && (
              <Box mt={2} display="flex" justifyContent="center">
                <Pagination
                  count={Math.ceil(items.length / rowsPerPage)}
                  page={currentPage}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </Card>
        </Grid>
      </Grid>

      <ItemPriceModal
      open={priceModalOpen}
      onClose={handlePriceModalClose}
      item={priceModalItem}
      priceTypes={priceTypes}
      units={units}
    />
    <ItemQuantityModal
      open={quantityModalOpen}
      onClose={handleQuantityModalClose}
      item={quantityModalItem}
      warehouses={warehouses}
    />

      {/* Delete Dialog */}
      <ConfirmDialog
        open={openDialog}
        onClose={handleDialogClose}
        onConfirm={handleDeleteConfirm}
        title="سڕینەوەی کاڵا"
        description="ئایە دڵنیایت لە سڕینەوەی ئەم کاڵایە؟ ئەم کردارە گەرێنەوە نییە."
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

export default ItemManagment;