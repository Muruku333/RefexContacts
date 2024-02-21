import { useState,forwardRef } from 'react';
import PropTypes from 'prop-types';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Dialog from '@mui/material/Dialog';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

import axios from 'axios';

// ----------------------------------------------------------------------

const Transition = forwardRef((props, ref) => (
  <Slide direction="up" ref={ref} {...props} />
));

export default function PrintRequestTableRow({
  selected,
  name,
  avatarUrl,
  company,
  role,
  isVerified,
  status,
  handleClick,
}) {
  const [open, setOpen] = useState(null);
  const [openView, setOpenView] = useState(false);
  const [PDF_URL, setPDF_URL]=useState(null);

  
  const handleViewOpen =()=>{
    setOpenView(true);
  }

  const handleViewClose = ()=>{
    setOpenView(false);
  }

  const handleOpenMenu = (event) => {
    setOpen(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setOpen(null);
  };

  const handleClickViewPDF = async () => {
    try {
      const response = await axios.get(`/api/generate_vcard_pdf/1279`, {
        responseType: 'blob', // Important!
      });

      // Create a blob URL and open it in a new tab
      // const url = window.URL.createObjectURL(response.data);
      setPDF_URL(URL.createObjectURL(response.data));
      handleViewOpen();
      // window.open(url, '_blank');
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  }
  const handleClickDownloadPDF = async()=>{
    try {
      const response = await axios.get(`/api/generate_vcard_pdf/1279`, {
        responseType: 'blob', // Important!
      });

      // Create a blob URL and trigger download
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'test.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  }

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell>

        <TableCell>{company}</TableCell>

        <TableCell>{role}</TableCell>

        <TableCell align="center">{isVerified ? 'Yes' : 'No'}</TableCell>

        <TableCell>
          <Label color={(status === 'banned' && 'error') || 'success'}>{status}</Label>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      {openView && (<Dialog
        fullScreen
        open={openView}
        onClose={handleViewClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {1279}
            </Typography>
            <Button
            variant="contained"
            color="error"
            startIcon={ <Iconify icon="eva:close-fill"/>}
            onClick={handleViewClose}
          >
            Close
          </Button>
          </Toolbar>
        </AppBar>
        <iframe
        title="pdf"
    src={PDF_URL}   //     src={`${PDF_URL}#toolbar=0`}
    height="100%"
    width="100%"
/>
            </Dialog>
         )}

      <Popover
        open={!!open}
        anchorEl={open}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 160 },
        }}
      >
        <MenuItem onClick={()=>{handleClickViewPDF();handleCloseMenu()}}>
          <Iconify icon="solar:eye-bold-duotone" sx={{ mr: 2 }} />
          View PDF
        </MenuItem>

        <MenuItem onClick={()=>{handleClickDownloadPDF();handleCloseMenu()}}>
          <Iconify icon="eva:edit-fill" sx={{ mr: 2 }} />
          Download PDF
        </MenuItem>

        <MenuItem onClick={handleCloseMenu} sx={{ color: 'error.main' }}>
          <Iconify icon="eva:trash-2-outline" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>
    </>
  );
}

PrintRequestTableRow.propTypes = {
  avatarUrl: PropTypes.any,
  company: PropTypes.any,
  handleClick: PropTypes.func,
  isVerified: PropTypes.any,
  name: PropTypes.any,
  role: PropTypes.any,
  selected: PropTypes.any,
  status: PropTypes.string,
};
