import axios from 'axios';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useState, forwardRef, useCallback } from 'react';

import {
  Stack,
  Slide,
  Badge,
  Button,
  Dialog,
  Toolbar,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  OutlinedInput,
  InputAdornment,
  DialogContentText,
} from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function InactiveTableToolbar({
  selectedEmployees,
  setSelectedEmployees,
  numSelected,
  filterName,
  onFilterName,
  setRefresh,
}) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const [openAlert, setOpenAlert] = useState(false);

  const handleClickOpenAlert = () => {
    setOpenAlert(true);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  const handleClickDelete = () => {
    try {
      axios
        .post('/api/delete_employees', { employee_ids: selectedEmployees })
        .then((response) => {
          if (response.data.status) {
            enqueueSnackbar(response.data.message, { variant: 'warning', action });
            setRefresh((prev) => prev + 1);
            setSelectedEmployees([]);
          }
        })
        .catch((error) => {
          enqueueSnackbar(error.response.data.message, { variant: 'error', action });
        });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error', action });
    }
  };

  return (
    <Toolbar
      sx={{
        height: 96,
        display: 'flex',
        justifyContent: 'space-between',
        p: (theme) => theme.spacing(0, 1, 0, 3),
        // ...(numSelected > 0 && {
        //   color: 'primary.main',
        //   bgcolor: 'primary.lighter',
        // }),
      }}
    >
      {/* {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <OutlinedInput
          value={filterName}
          onChange={onFilterName}
          placeholder="Search Employee..."
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

      {numSelected > 0 ? (null
        // <Tooltip title="Delete">
        //   <IconButton>
        //     <Iconify icon="eva:trash-2-fill" />
        //   </IconButton>
        // </Tooltip>
      ) : (null
        // <Tooltip title="Filter list">
        //   <IconButton>
        //     <Iconify icon="ic:round-filter-list" />
        //   </IconButton>
        // </Tooltip>
      )} */}
      <Stack direction="row" gap={2}>
        <OutlinedInput
          value={filterName}
          onChange={onFilterName}
          placeholder="Search Employee..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
        />
      </Stack>

      {numSelected > 0 ? (
        <Stack direction="row" gap={2}>
          <Button
            onClick={handleClickOpenAlert}
            color="error"
            endIcon={
              <Badge badgeContent={numSelected} color="error">
                <Iconify icon="solar:trash-bin-trash-bold-duotone" />
              </Badge>
            }
          >
            Delete&nbsp;All
          </Button>
          <Button
            onClick={() => {
              setSelectedEmployees([]);
            }}
            endIcon={
              <Badge badgeContent={numSelected} color="primary">
                <Iconify icon="eva:close-fill" />
              </Badge>
            }
          >
            Unselect&nbsp;All
          </Button>
        </Stack>
      ) : null}

      <Dialog
        fullWidth
        maxWidth="xs"
        open={openAlert}
        TransitionComponent={Transition}
        keepMounted
        onClose={handleCloseAlert}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure want to delete {numSelected} items?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              handleClickDelete();
              handleCloseAlert();
            }}
          >
            Delete
          </Button>
          <Button variant="outlined" onClick={handleCloseAlert}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Toolbar>
  );
}

InactiveTableToolbar.propTypes = {
  selectedEmployees: PropTypes.array,
  setSelectedEmployees: PropTypes.any,
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  setRefresh: PropTypes.func,
};
