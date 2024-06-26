import axios from 'axios';
import PropTypes from 'prop-types';
import { useSnackbar } from 'notistack';
import { useState, forwardRef, useCallback } from 'react';

import Popover from '@mui/material/Popover';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import {
  Box,
  Slide,
  Dialog,
  Button,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

// ----------------------------------------------------------------------

export default function CompanyTableRow({
  companyId,
  companyLogo,
  companyName,
  companyWebsite,
  selected,
  handleClick,
  setRefresh,
}) {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [openMenu, setOpenMenu] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);

  const handleOpenMenu = (event) => {
    setOpenMenu(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpenMenu(null);
  };

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

  const handleClickEdit = () => {
    router.push(`/companies/edit/${companyId}`);
  };

  const handleClickDelete = (ids = []) => {
    try {
      axios
        .post('/api/delete_companies', { company_ids: ids })
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
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell align="center" component="th" scope="row" padding="none">
          <Box component="img" alt={`${companyName} Logo`} src={companyLogo} height={50} />
        </TableCell>

        <TableCell align="center">{companyName}</TableCell>

        <TableCell align="center">{companyWebsite}</TableCell>

        <TableCell align="right">
          <IconButton
            onClick={(event) => {
              handleOpenMenu(event);
            }}
          >
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openMenu}
        anchorEl={openMenu}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClickEdit();
            handleCloseMenu();
          }}
        >
          <Iconify icon="solar:pen-bold-duotone" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClickOpenAlert();
            handleCloseMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="solar:trash-bin-trash-bold-duotone" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

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
          <DialogContentText>Are you sure want to delete?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            color="error"
            variant="contained"
            onClick={() => {
              handleClickDelete([companyId]);
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

CompanyTableRow.propTypes = {
  companyId: PropTypes.any,
  companyName: PropTypes.any,
  companyLogo: PropTypes.any,
  companyWebsite: PropTypes.any,
  handleClick: PropTypes.func,
  selected: PropTypes.any,
  setRefresh: PropTypes.any,
};
