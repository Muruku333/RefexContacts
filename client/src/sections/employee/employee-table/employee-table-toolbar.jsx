import { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

import Tooltip from '@mui/material/Tooltip';
import Toolbar from '@mui/material/Toolbar';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';

import Iconify from 'src/components/iconify';
import { Stack } from '@mui/material';

import axios from 'axios';
import { useSnackbar } from 'notistack';
// ----------------------------------------------------------------------

export default function EmployeeTableToolbar({ selectedEmployees, setSelectedEmployees, numSelected, filterName, onFilterName }) {
  console.log(selectedEmployees);

  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  const handleSendPrintRequest = async()=>{
    try {
      await axios
        .post(`/api/print_request`,{printEmployees:selectedEmployees})
        .then((response) => {
          if (response.data.status) {
            enqueueSnackbar(response.data.message, { variant: 'success', action });
            setSelectedEmployees([]);
          }
        })
        .catch((error) => {
          console.log(error);
          enqueueSnackbar(error.response.data.message, { variant: 'error', action });
        });
    } catch (error) {
      console.log(error);
      enqueueSnackbar(error.message, { variant: 'error', action });
    }
  }

  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        ...(numSelected > 0 && {
          color: 'primary.main',
          bgcolor: 'primary.lighter',
        }),
      }}
    >
      {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <OutlinedInput
          value={filterName}
          onChange={onFilterName}
          placeholder="Search Employee Name..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
        />
      )}

      {numSelected > 0 ? (
        <Stack direction='row' gap={1}>
                  <Tooltip title="Send Print Request">
          <IconButton onClick={handleSendPrintRequest}>
            <Iconify icon="iconamoon:send-fill" />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton>
            <Iconify icon="eva:trash-2-fill" />
          </IconButton>
        </Tooltip>
        </Stack>
      ) : (
        <Stack direction='row' gap={1}>
                  <Button  startIcon={<Iconify icon="solar:eye-bold" />}>
  Columns
</Button>
<Button  startIcon={<Iconify icon="solar:filter-bold" />}>
  Filters
</Button>
<Button  startIcon={<Iconify icon="solar:import-bold" />}>
  Import
</Button>
<Button  startIcon={<Iconify icon="solar:export-bold" />}>
  Export
</Button>
        </Stack>
      )}
    </Toolbar>
  );
}

EmployeeTableToolbar.propTypes = {
  selectedEmployees: PropTypes.array,
  setSelectedEmployees: PropTypes.any,
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
};
