import { useState,useCallback } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useSnackbar } from 'notistack';
import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import { useRouter } from 'src/routes/hooks';
import axios from 'axios';
import { Box } from '@mui/material';

// ----------------------------------------------------------------------

export default function CompanyTableRow({
  companyId,
  companyLogo,
  companyName,
  companyWebsite,
  selected,
  handleClick,
  setRefresh
}) {
  const router = useRouter();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();

  const [open, setOpen] = useState(null);

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  const handleClickEdit = ()=>{
    router.push(`/companies/edit/${companyId}`);
  }

  const handleClickDelete = ()=>{
    try {
      axios.delete(`/api/companies/${companyId}`).then((response)=>{
        if(response.data.status){
          enqueueSnackbar(response.data.message, { variant: 'warning', action });
          setRefresh((prev)=>prev+1);
        }
      }).catch((error)=>{
        enqueueSnackbar(error.response.data.message, { variant: 'error', action })
      })
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error', action });
    }
  }



  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Box component='img' alt={`${companyName} Logo`} src={companyLogo}/>
        </TableCell>

        <TableCell>{companyName}</TableCell>

        <TableCell>{companyWebsite}</TableCell>

        <TableCell align="right">
          <IconButton onClick={(event)=>{handleOpenMenu(event)}}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 140 },
        }}
      >

        <MenuItem onClick={()=>{handleClickEdit();handleCloseMenu()}}>
          <Iconify icon="solar:pen-bold-duotone" sx={{ mr: 2 }} />
          Edit
        </MenuItem>

        <MenuItem onClick={()=>{handleClickDelete();handleCloseMenu()}} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold-duotone" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

CompanyTableRow.propTypes = {
  companyId:PropTypes.any,
  companyName:PropTypes.any,
  companyLogo: PropTypes.any,
  companyWebsite: PropTypes.any,
  handleClick: PropTypes.func,
  selected: PropTypes.any,
  setRefresh: PropTypes.any
};
