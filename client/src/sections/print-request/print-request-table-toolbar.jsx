import axios from 'axios';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useState, forwardRef, useCallback } from 'react';

import Toolbar from '@mui/material/Toolbar';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import {
  Slide,
  Stack,
  Badge,
  Dialog,
  Button,
  IconButton,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------
const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function PrintRequestTableToolbar({
  numSelected,
  filterName,
  onFilterName,
  selectedIDS = [],
  setSelectedIDS,
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

  const handleClickDeleteRequest = async (pr_ids = []) => {
    try {
      axios
        .post(`/api/delete_print_request`, { request_ids: pr_ids })
        .then((response) => {
          if (response.data.status) {
            enqueueSnackbar(response.data.message, { variant: 'warning', action });
            setRefresh((prev) => prev + 1);
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
    <>
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
        <Stack direction="row" gap={2}>
          <OutlinedInput
            value={filterName}
            onChange={onFilterName}
            placeholder="Search Request ID..."
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
              color="error"
              onClick={() => {
                handleClickOpenAlert();
              }}
              endIcon={
                <Badge badgeContent={numSelected} color="error">
                  <Iconify icon="eva:trash-2-fill" />
                </Badge>
              }
            >
              Delete&nbsp;All
            </Button>
            <Button
              onClick={() => {
                setSelectedIDS([]);
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
        {/* {numSelected > 0 ? (
        <Typography component="div" variant="subtitle1">
          {numSelected} selected
        </Typography>
      ) : (
        <OutlinedInput
          value={filterName}
          onChange={onFilterName}
          placeholder="Search Request ID..."
          startAdornment={
            <InputAdornment position="start">
              <Iconify
                icon="eva:search-fill"
                sx={{ color: 'text.disabled', width: 20, height: 20 }}
              />
            </InputAdornment>
          }
        />
      )} */}
        {/* {numSelected > 0
        ? 
          <Tooltip title="Delete">
            <IconButton>
              <Iconify icon="eva:trash-2-fill" />
            </IconButton>
          </Tooltip>
          :
          <Tooltip title="Filter list">
            <IconButton>
              <Iconify icon="ic:round-filter-list" />
            </IconButton>
          </Tooltip>
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
          </Stack> */}
      </Toolbar>
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
          <DialogContentText>
            Are you sure want to delete {selectedIDS.length} items?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              handleClickDeleteRequest(selectedIDS);
              setSelectedIDS([]);
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
    </>
  );
}

PrintRequestTableToolbar.propTypes = {
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  selectedIDS: PropTypes.array,
  setSelectedIDS: PropTypes.func,
  setRefresh: PropTypes.func,
};
