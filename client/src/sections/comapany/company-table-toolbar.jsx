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

export default function CompanyTableToolbar({
  selectedCompanies,
  numSelected,
  filterName,
  onFilterName,
  setSelected,
  setRefresh,
}) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [openAlert, setOpenAlert] = useState(false);

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  const handleClickOpenAlert = () => {
    setOpenAlert(true);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleClickDelete = (ids = []) => {
    try {
      axios
        .post('/api/delete_companies', { company_ids: ids })
        .then((response) => {
          if (response.data.status) {
            enqueueSnackbar(response.data.message, { variant: 'warning', action });
            setSelected([]);
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
          placeholder="Search Company..."
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

      )} */}
      <Stack direction="row" gap={2}>
        <OutlinedInput
          value={filterName}
          onChange={onFilterName}
          placeholder="Search Company..."
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
              setSelected([]);
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
              handleClickDelete(selectedCompanies);
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

CompanyTableToolbar.propTypes = {
  selectedCompanies: PropTypes.array,
  numSelected: PropTypes.number,
  filterName: PropTypes.string,
  onFilterName: PropTypes.func,
  setSelected: PropTypes.func,
  setRefresh: PropTypes.func,
};
