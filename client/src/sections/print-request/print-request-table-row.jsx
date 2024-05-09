import axios from 'axios';
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import { useState, forwardRef, useCallback } from 'react';

import Box from '@mui/material/Box';
import Slide from '@mui/material/Slide';
import Table from '@mui/material/Table';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Popover from '@mui/material/Popover';
import Toolbar from '@mui/material/Toolbar';
import Checkbox from '@mui/material/Checkbox';
import Collapse from '@mui/material/Collapse';
import MenuItem from '@mui/material/MenuItem';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';

import { useAuth } from 'src/context/AuthContext';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function PrintRequestTableRow({
  requestId,
  printEmployees,
  createdBy,
  modifiedBy,
  status,
  setRefresh,
  selected,
  handleClick,
}) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const {user} = useAuth();

  const [employeeId,setEmployeeId]=useState(null);
  const [openPRMenu, setOpenPRMenu] = useState(null);
  const [openEPMenu, setOpenEPMenu]=useState(null);
  const [openList, setOpenList] = useState(false);
  const [openViewPDF, setOpenViewPDF] = useState(false);
  const [PDF_URL, setPDF_URL] = useState(null);

  const action = useCallback(
    (snackbarId) => (
      <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
        <Iconify icon="eva:close-outline" />
      </IconButton>
    ),
    [closeSnackbar]
  );

  const handleViewPDFOpen = () => {
    setOpenViewPDF(true);
  };

  const handleViewPDFClose = () => {
    setOpenViewPDF(false);
  };

  const handleOpenPRMenu = (event) => {
    setOpenPRMenu(event.currentTarget);
  };

  const handleClosePRMenu = () => {
    setOpenPRMenu(null);
  };

  const handleOpenEPMenu = (event,id) => {
    setEmployeeId(id);
    setOpenEPMenu(event.currentTarget);
  };

  const handleCloseEPMenu = () => {
    setOpenEPMenu(null);
  };

  const handleClickStatusChange = (newStatus)=>{
    try {
      axios.patch(`/api/print_request/${requestId}?status=${newStatus}`).then((response)=>{
        if(response.data.status){
          enqueueSnackbar(response.data.message, { variant: 'success', action });
          setRefresh((prev)=>prev+1);
        }
      }).catch((error)=>{
        enqueueSnackbar(error.response.data.message, { variant: 'error', action })
      })
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error', action });
    }
  }

  const handleClickViewPDF = async () => {
    try {
      const response = await axios.get(`/api/generate_vcard_pdf/${employeeId}`, {
        responseType: 'arraybuffer', // Important!
      });
      // Create a blob URL and open it in a new tab
      // const url = window.URL.createObjectURL(response.data);
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      if(status==='approved'||user.user_type!=='HR'){
        setPDF_URL(URL.createObjectURL(pdfBlob));
      }else{
        setPDF_URL(`${URL.createObjectURL(pdfBlob)}#toolbar=0`);
      }
      handleViewPDFOpen();
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };
  const handleClickDownloadPDF = async () => {
    try {
      const response = await axios.get(`/api/generate_vcard_pdf/${employeeId}`, {
        responseType: 'blob', // Important!
      });
      saveAs(response.data,`${employeeId}.pdf`);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={handleClick} />
        </TableCell>

        <TableCell>
          <IconButton aria-label="expand row" onClick={() => setOpenList(!openList)}>
            {openList ? (
              <Iconify icon="solar:alt-arrow-down-line-duotone" />
            ) : (
              <Iconify icon="solar:alt-arrow-up-line-duotone" />
            )}
          </IconButton>
        </TableCell>

        {/* <TableCell component="th" scope="row" padding="none">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Avatar alt={name} src={avatarUrl} />
            <Typography variant="subtitle2" noWrap>
              {name}
            </Typography>
          </Stack>
        </TableCell> */}

        <TableCell component="th" scope="row">
          <Typography variant="subtitle2" noWrap>
            {requestId}
          </Typography>
        </TableCell>

        <TableCell>{printEmployees.length}</TableCell>

        <TableCell>{createdBy}</TableCell>

        <TableCell>{modifiedBy}</TableCell>

        {/* <TableCell align="center">{isVerified ? 'Yes' : 'No'}</TableCell> */}

        <TableCell>
          <Label color={(status === 'pending' && 'warning') || (status === 'rejected' && 'error') || 'success'}>{status}</Label>
        </TableCell>

        {user.user_type!=="HR" ?         <TableCell align="right">
          <IconButton onClick={handleOpenPRMenu}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>:<TableCell/> }

      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={openList} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div">
                Selected Employees - <Label color={(status === 'pending' && 'warning') || (status === 'rejected' && 'error') || 'success'}>{requestId}</Label>
              </Typography>
              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {printEmployees.map((_pe) => (
                    <TableRow key={_pe.id}>
                      <TableCell component="th" scope="row">
                        <Typography variant="subtitle2" noWrap>
                          {_pe.employee_id}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                          }}
                        >
                          <Avatar alt={_pe.employee_name} src={_pe.photo} sx={{ mr: 2 }} />
                          <ListItemText
                            sx={{ m: 0 }}
                            primary={_pe.employee_name}
                            secondary={_pe.email}
                          />
                        </Box>
                      </TableCell>
                      <TableCell>{_pe.designation}</TableCell>
                      <TableCell>{_pe.company.company_name}</TableCell>
                      <TableCell>{_pe.branch.branch_name}</TableCell>
                      {user.user_type ==='HR'&& (status==='approved'||status==='pending') ?(<TableCell>
                        <IconButton onClick={(e)=>{handleOpenEPMenu(e,_pe.employee_id)}}>
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      </TableCell>):(<TableCell/>)}
                      {user.user_type!=='HR'? (<TableCell>
                        <IconButton onClick={(e)=>{handleOpenEPMenu(e,_pe.employee_id)}}>
                          <Iconify icon="eva:more-vertical-fill" />
                        </IconButton>
                      </TableCell>):(<TableCell/>)}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      {openViewPDF && (
        <Dialog
          fullScreen
          open={openViewPDF}
          onClose={handleViewPDFClose}
          TransitionComponent={Transition}
        >
          <AppBar sx={{ position: 'relative' }}>
            <Toolbar>
              <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
                {employeeId}
              </Typography>
              <Button
                variant="contained"
                color="error"
                startIcon={<Iconify icon="eva:close-fill" />}
                onClick={handleViewPDFClose}
              >
                Close
              </Button>
            </Toolbar>
          </AppBar>
          <iframe
            title="pdf"
            src={PDF_URL} //     src={`${PDF_URL}#toolbar=0`}
            height="100%"
            width="100%"
          />
        </Dialog>
      )}

      <Popover
        open={!!openPRMenu}
        anchorEl={openPRMenu}
        onClose={handleClosePRMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 160 },
        }}
      >
                <MenuItem
          onClick={() => {
            handleClickStatusChange("pending");
            handleClosePRMenu();
          }}
          sx={{ color: 'warning.main' }}
        >
          <Iconify icon="eva:clock-outline" sx={{ mr: 2 }} />
          Pending
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClickStatusChange("approved");
            handleClosePRMenu();
          }}
          sx={{ color: 'success.main' }}
        >
          <Iconify icon="eva:checkmark-fill" sx={{ mr: 2 }} />
          Approved
        </MenuItem>

        <MenuItem
          onClick={() => {
            handleClickStatusChange("rejected");
            handleClosePRMenu();
          }}
          sx={{ color: 'error.main' }}
        >
          <Iconify icon="eva:close-fill" sx={{ mr: 2 }} />
          Rejected
        </MenuItem>

        <MenuItem onClick={handleClosePRMenu} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold-duotone" sx={{ mr: 2 }} />
          Delete
        </MenuItem>
      </Popover>

      <Popover
        open={!!openEPMenu}
        anchorEl={openEPMenu}
        onClose={handleCloseEPMenu}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 160 },
        }}
      >
        <MenuItem
          onClick={() => {
            handleClickViewPDF();
            handleCloseEPMenu();
          }}
        >
          <Iconify icon="solar:eye-bold-duotone" sx={{ mr: 2 }} />
          View PDF
        </MenuItem>

          {user.user_type==='HR'&& status==='pending'?(null):( <MenuItem
          onClick={() => {
            handleClickDownloadPDF();
            handleCloseEPMenu();
          }}
        >
          <Iconify icon="solar:download-bold-duotone" sx={{ mr: 2 }} />
          Download PDF
        </MenuItem>)}
        {/* {user.user_type!=='HR'&&(        <MenuItem
          onClick={() => {
            handleClickDownloadPDF();
            handleCloseEPMenu();
          }}
        >
          <Iconify icon="solar:download-bold-duotone" sx={{ mr: 2 }} />
          Download PDF
        </MenuItem>)} */}

        {/* <MenuItem onClick={handleCloseEPMenu} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold-duotone" sx={{ mr: 2 }} />
          Delete
        </MenuItem> */}
      </Popover>
    </>
  );
}

PrintRequestTableRow.propTypes = {
  requestId: PropTypes.string,
  printEmployees: PropTypes.array,
  createdBy: PropTypes.string,
  modifiedBy: PropTypes.string,
  status: PropTypes.string,
  setRefresh: PropTypes.any,
  selected: PropTypes.any,
  handleClick: PropTypes.func,
};
