import axios from 'axios';
import PropTypes from 'prop-types';
import { saveAs } from 'file-saver';
import { useSnackbar } from 'notistack';
import { useState, forwardRef, useCallback } from 'react';

import Table from '@mui/material/Table';
import AppBar from '@mui/material/AppBar';
import Avatar from '@mui/material/Avatar';
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
import {
  Box,
  Slide,
  Stack,
  Badge,
  Dialog,
  Button,
  DialogTitle,
  ListItemText,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

import { useAuth } from 'src/context/AuthContext';

import Label from 'src/components/label';
import Iconify from 'src/components/iconify';

// ----------------------------------------------------------------------

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function PrintRequestTableRow({
  requestId,
  printEmployees,
  createdBy,
  createdAt,
  status,
  supportDocument,
  setRefresh,
  selected,
  handleClick,
}) {
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const { user } = useAuth();

  const [employeeId, setEmployeeId] = useState(null);
  const [peId, setPEID] = useState(null);
  const [statusPE, setStatusPE] = useState(null);
  const [openPRMenu, setOpenPRMenu] = useState(null);
  const [openEPMenu, setOpenEPMenu] = useState(null);
  const [openAlert, setOpenAlert] = useState(false);
  const [openList, setOpenList] = useState(false);
  const [openViewPDF, setOpenViewPDF] = useState(false);
  const [openViewDoc, setOpenViewDoc] = useState(false);
  const [PDF_URL, setPDF_URL] = useState(null);
  const [selectedPE, setSelectedPE] = useState([]);

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

  const handleViewDocOpen = () => {
    setOpenViewDoc(true);
  };

  const handleViewDocClose = () => {
    setOpenViewDoc(false);
  };

  const handleOpenPRMenu = (event) => {
    setOpenPRMenu(event.currentTarget);
  };

  const handleClosePRMenu = () => {
    setOpenPRMenu(null);
  };

  const handleOpenEPMenu = (event, id, pe_id, stat) => {
    setEmployeeId(id);
    setOpenEPMenu(event.currentTarget);
    setPEID(pe_id);
    setStatusPE(stat);
  };

  const handleCloseEPMenu = () => {
    setOpenEPMenu(null);
  };

  const handleClickOpenAlert = () => {
    setOpenAlert(true);
  };

  const handleCloseAlert = () => {
    setOpenAlert(false);
  };

  const handleClickStatusChange = (newStatus) => {
    try {
      axios
        .patch(`/api/print_request/${requestId}?status=${newStatus}`)
        .then((response) => {
          if (response.data.status) {
            enqueueSnackbar(response.data.message, { variant: 'success', action });
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

  const handleClickStatusChangePE = (peIDS = [], newStatus) => {
    try {
      axios
        .patch(`/api/print_employees`, { request_id: requestId, pe_ids: peIDS, status: newStatus })
        .then((response) => {
          if (response.data.status) {
            enqueueSnackbar(response.data.message, { variant: 'success', action });
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

  const handleClickViewPDF = async () => {
    try {
      const response = await axios.get(`/api/generate_vcard_pdf/${employeeId}`, {
        responseType: 'arraybuffer', // Important!
      });
      // Create a blob URL and open it in a new tab
      // const url = window.URL.createObjectURL(response.data);
      const pdfBlob = new Blob([response.data], { type: 'application/pdf' });
      if (statusPE === 'approved' || user.user_type !== 'HR') {
        setPDF_URL(URL.createObjectURL(pdfBlob));
      } else {
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
      saveAs(response.data, `${employeeId}.pdf`);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };

  const handleClickDownloadDoc = async () => {
    try {
      const response = await axios.get(`/uploads/support_documents/${supportDocument}`, {
        responseType: 'blob', // Important!
      });
      saveAs(response.data, supportDocument);
    } catch (error) {
      console.error('Error fetching PDF:', error);
    }
  };

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

  const handleSelectPEAllClick = (event) => {
    if (event.target.checked) {
      const newSelecteds = printEmployees.map((_pe) => _pe.id);
      setSelectedPE(newSelecteds);
      return;
    }
    setSelectedPE([]);
  };

  const handleClickPE = (event, name) => {
    const selectedIndex = selectedPE.indexOf(name);
    let newSelected = [];
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selectedPE, name);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selectedPE.slice(1));
    } else if (selectedIndex === selectedPE.length - 1) {
      newSelected = newSelected.concat(selectedPE.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selectedPE.slice(0, selectedIndex),
        selectedPE.slice(selectedIndex + 1)
      );
    }

    setSelectedPE(newSelected);
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        {user.user_type !== 'HR' && (
          <TableCell padding="checkbox">
            <Checkbox
              disableRipple
              checked={selected}
              onChange={(e) => {
                handleClick(e);
                // handleSelectPEAllClick(e);
              }}
            />
          </TableCell>
        )}

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

        <TableCell>{createdAt}</TableCell>

        {/* <TableCell align="center">{isVerified ? 'Yes' : 'No'}</TableCell> */}

        <TableCell>
          <Label
            color={
              (status === 'pending' && 'warning') || (status === 'rejected' && 'error') || 'success'
            }
          >
            {status}
          </Label>
        </TableCell>

        {user.user_type !== 'HR' ? (
          <TableCell align="right">
            <IconButton onClick={handleOpenPRMenu}>
              <Iconify icon="eva:more-vertical-fill" />
            </IconButton>
          </TableCell>
        ) : (
          <TableCell />
        )}
      </TableRow>

      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={openList} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                sx={{ height: 50 }}
              >
                <Typography variant="h6" gutterBottom component="div">
                  Selected Employees -{' '}
                  <Label
                    color={
                      (status === 'pending' && 'warning') ||
                      (status === 'rejected' && 'error') ||
                      'success'
                    }
                  >
                    {requestId}
                  </Label>
                </Typography>

                {selectedPE.length > 0 && (
                  <Stack direction="row" gap={2}>
                    <Button
                      onClick={() => {
                        handleClickStatusChangePE(selectedPE, 'approved');
                        setSelectedPE([]);
                      }}
                      color="success"
                      endIcon={
                        <Badge badgeContent={selectedPE.length} color="success">
                          <Iconify icon="eva:checkmark-fill" />
                        </Badge>
                      }
                    >
                      Approved
                    </Button>
                    <Button
                      onClick={() => {
                        handleClickStatusChangePE(selectedPE, 'pending');
                        setSelectedPE([]);
                      }}
                      color="warning"
                      endIcon={
                        <Badge badgeContent={selectedPE.length} color="warning">
                          <Iconify icon="eva:clock-outline" />
                        </Badge>
                      }
                    >
                      Pending
                    </Button>
                    <Button
                      onClick={() => {
                        handleClickStatusChangePE(selectedPE, 'rejected');
                        setSelectedPE([]);
                      }}
                      color="error"
                      endIcon={
                        <Badge badgeContent={selectedPE.length} color="error">
                          <Iconify icon="eva:close-fill" />
                        </Badge>
                      }
                    >
                      Rejected
                    </Button>
                  </Stack>
                )}
              </Box>

              <Table size="small" aria-label="purchases">
                <TableHead>
                  <TableRow>
                    {user.user_type !== 'HR' && (
                      <TableCell padding="checkbox">
                        <Checkbox
                          indeterminate={
                            selectedPE.length > 0 && selectedPE.length < printEmployees.length
                          }
                          checked={
                            printEmployees.length > 0 && selectedPE.length === printEmployees.length
                          }
                          onChange={(e) => {
                            // handleClick(e);
                            handleSelectPEAllClick(e);
                          }}
                        />
                      </TableCell>
                    )}
                    <TableCell>Employee ID</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Designation</TableCell>
                    <TableCell>Company</TableCell>
                    <TableCell>Branch</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {printEmployees.map((_pe) => (
                    <TableRow key={_pe.id}>
                      {user.user_type !== 'HR' && (
                        <TableCell padding="checkbox">
                          <Checkbox
                            disableRipple
                            checked={selectedPE.indexOf(_pe.id) !== -1}
                            onChange={(event) => {
                              handleClickPE(event, _pe.id);
                            }}
                          />
                        </TableCell>
                      )}
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
                      <TableCell>
                        <Label
                          color={
                            (_pe.status === 'pending' && 'warning') ||
                            (_pe.status === 'rejected' && 'error') ||
                            'success'
                          }
                        >
                          {_pe.status}
                        </Label>
                      </TableCell>
                      {user.user_type === 'HR' &&
                      (_pe.status === 'approved' || _pe.status === 'pending') ? (
                        <TableCell>
                          <IconButton
                            onClick={(e) => {
                              handleOpenEPMenu(e, _pe.employee_id, _pe.id, _pe.status);
                            }}
                          >
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </TableCell>
                      ) : null}
                      {user.user_type !== 'HR' ? (
                        <TableCell>
                          <IconButton
                            onClick={(e) => {
                              handleOpenEPMenu(e, _pe.employee_id, _pe.id, _pe.status);
                            }}
                          >
                            <Iconify icon="eva:more-vertical-fill" />
                          </IconButton>
                        </TableCell>
                      ) : null}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>

      <Dialog
        fullScreen
        open={openViewDoc}
        onClose={handleViewDocClose}
        TransitionComponent={Transition}
      >
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {supportDocument}
            </Typography>
            <Button
              variant="contained"
              color="error"
              startIcon={<Iconify icon="eva:close-fill" />}
              onClick={handleViewDocClose}
            >
              Close
            </Button>
          </Toolbar>
        </AppBar>
        <iframe
          title="pdf"
          src={`/uploads/support_documents/${supportDocument}`} //     src={`${PDF_URL}#toolbar=0`}
          height="100%"
          width="100%"
        />
      </Dialog>

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
          sx: { width: 'auto' },
        }}
      >
        {status !== 'pending' && (
          <MenuItem
            onClick={() => {
              handleClickStatusChange('pending');
              handleClosePRMenu();
            }}
            sx={{ color: 'warning.main' }}
          >
            <Iconify icon="eva:clock-outline" sx={{ mr: 2 }} />
            Pending
          </MenuItem>
        )}

        {status !== 'approved' && (
          <MenuItem
            onClick={() => {
              handleClickStatusChange('approved');
              handleClosePRMenu();
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="eva:checkmark-fill" sx={{ mr: 2 }} />
            Approved
          </MenuItem>
        )}

        {status !== 'rejected' && (
          <MenuItem
            onClick={() => {
              handleClickStatusChange('rejected');
              handleClosePRMenu();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:close-fill" sx={{ mr: 2 }} />
            Rejected
          </MenuItem>
        )}
        {supportDocument && (
          <>
            <MenuItem
              onClick={() => {
                handleViewDocOpen();
                handleClosePRMenu();
              }}
              // sx={{ color: 'warning.main' }}
            >
              <Iconify icon="solar:file-bold-duotone" sx={{ mr: 2 }} />
              View Support Document
            </MenuItem>
            <MenuItem
              onClick={() => {
                handleClickDownloadDoc();
                handleClosePRMenu();
              }}
              // sx={{ color: 'warning.main' }}
            >
              <Iconify icon="solar:file-download-bold-duotone" sx={{ mr: 2 }} />
              Download Support Document
            </MenuItem>
          </>
        )}
        <MenuItem
          onClick={() => {
            handleClickOpenAlert();
            handleClosePRMenu();
          }}
          sx={{ color: 'error.main' }}
        >
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
        {user.user_type !== 'HR' && statusPE !== 'pending' && (
          <MenuItem
            onClick={() => {
              handleClickStatusChangePE([peId], 'pending');
              handleCloseEPMenu();
            }}
            sx={{ color: 'warning.main' }}
          >
            <Iconify icon="eva:clock-outline" sx={{ mr: 2 }} />
            Pending
          </MenuItem>
        )}

        {user.user_type !== 'HR' && statusPE !== 'approved' && (
          <MenuItem
            onClick={() => {
              handleClickStatusChangePE([peId], 'approved');
              handleCloseEPMenu();
            }}
            sx={{ color: 'success.main' }}
          >
            <Iconify icon="eva:checkmark-fill" sx={{ mr: 2 }} />
            Approved
          </MenuItem>
        )}

        {user.user_type !== 'HR' && statusPE !== 'rejected' && (
          <MenuItem
            onClick={() => {
              handleClickStatusChangePE([peId], 'rejected');
              handleCloseEPMenu();
            }}
            sx={{ color: 'error.main' }}
          >
            <Iconify icon="eva:close-fill" sx={{ mr: 2 }} />
            Rejected
          </MenuItem>
        )}

        <MenuItem
          onClick={() => {
            handleClickViewPDF();
            handleCloseEPMenu();
          }}
        >
          <Iconify icon="solar:eye-bold-duotone" sx={{ mr: 2 }} />
          View Card
        </MenuItem>

        {user.user_type === 'HR' && statusPE !== 'approved' ? null : (
          <MenuItem
            onClick={() => {
              handleClickDownloadPDF();
              handleCloseEPMenu();
            }}
          >
            <Iconify icon="solar:download-bold-duotone" sx={{ mr: 2 }} />
            Download Card
          </MenuItem>
        )}
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
              handleClickDeleteRequest([requestId]);
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

PrintRequestTableRow.propTypes = {
  requestId: PropTypes.string,
  printEmployees: PropTypes.array,
  createdBy: PropTypes.string,
  createdAt: PropTypes.string,
  status: PropTypes.string,
  supportDocument: PropTypes.string,
  setRefresh: PropTypes.any,
  selected: PropTypes.any,
  handleClick: PropTypes.func,
};
