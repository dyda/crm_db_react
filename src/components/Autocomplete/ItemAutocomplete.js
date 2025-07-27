import React, { useState, useEffect } from 'react';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import CircularProgress from '@mui/material/CircularProgress';
import axiosInstance from '../service/axiosInstance';

function ItemAutocomplete({
  value,
  onChange,
  label = "کاڵا",
  error,
  helperText,
  ...props
}) {
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setLoading(true);

    axiosInstance
      .get('/item/search', { params: { q: inputValue, page: 1, pageSize: 20 } })
      .then(res => {
        if (active) setOptions(res.data.items || []);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [inputValue]);

  return (
    <Autocomplete
      options={options}
      getOptionLabel={option => option?.name || ''}
      value={options.find(i => i.id === value) || null}
      onChange={(_, newValue) => onChange(newValue ? newValue.id : '')}
      onInputChange={(_, newInputValue) => setInputValue(newInputValue)}
      loading={loading}
      isOptionEqualToValue={(option, val) => option.id === val.id}
      renderInput={params => (
        <TextField
          {...params}
          label={label}
          error={!!error}
          helperText={helperText}
          InputProps={{
            ...params.InputProps,
            endAdornment: (
              <>
                {loading ? <CircularProgress color="inherit" size={20} /> : null}
                {params.InputProps.endAdornment}
              </>
            ),
          }}
          {...props}
        />
      )}
    />
  );
}

export default ItemAutocomplete;