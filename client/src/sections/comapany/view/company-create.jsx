import { useEffect, useRef, useState, forwardRef, Fragment } from 'react';

import {
  Stack,
  Button,
  Container,
  Typography,
  Box,
  Card,
  styled,
  Autocomplete,
  TextField,
  emphasize,
  IconButton,
  Tooltip,
} from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import Slide from '@mui/material/Slide';
import axios from 'axios';

import Iconify from 'src/components/iconify';
import { useAuth } from 'src/context/AuthContext';
import { useSnackbar } from 'notistack';
import { RouterLink } from 'src/routes/components';
import { useRouter } from 'src/routes/hooks';

const PhotoBox = styled(Box)(({ theme }) => ({
  width: 250,
  height: 200,
  cursor: 'pointer',
  overflow: 'hidden',
  //   borderRadius: '50%',
  border: '1px dashed rgba(145, 158, 171, 0.2)',
  '&:hover': {
    '.upload-placeholder': {
      opacity: 1,
      // backgroundColor:theme.palette.action.hover,
    },
  },
}));

const PhotoStack = styled(Stack)(({ theme, isError, selectedPhoto }) => ({
  alignItems: 'center',
  justifyContent: 'center',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  zIndex: 9,
  //   borderRadius: '50%',
  position: 'absolute',
  transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
  opacity: selectedPhoto ? 0 : 0.8,
  backgroundColor: isError ? theme.palette.error.light : theme.palette.action.hover,
}));

const Transition = forwardRef((props, ref) => <Slide direction="up" ref={ref} {...props} />);

export default function CompanyCreate() {
  const { user } = useAuth();
  const { enqueueSnackbar, closeSnackbar } = useSnackbar();
  const fileInputRef = useRef(null);
  const router = useRouter();

  const [companyData, setCompanyData] = useState({
    companyName: null,
    companyWebSite: null,
    companyLogo: null,
    createdBy: user.user_id,
  });
  const [companyBranches, setCompanyBranches] = useState([
    {
      companyBranchName: '',
      companyBranchAddress: '',
      googleMapLink: '',
    },
  ]);

  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [validationErrors, setValidationErrors] = useState({});
  const [changeMade, setChangeMade] = useState(false);
  const [openAlert, setOpenAlert] = useState(false);

  const handleInputChange = (field, value) => {
    const updatedcompanyData = { ...companyData };
    updatedcompanyData[field] = value;
    setCompanyData(updatedcompanyData);
    setValidationErrors({});
    setChangeMade(true);
  };

  const addBranch = () => {
    setCompanyBranches((prev) => [
      ...prev,
      {
        companyBranchName: '',
        companyBranchAddress: '',
        googleMapLink: '',
      },
    ]);
  };

  const deleteBranch = (index) => {
    setCompanyBranches((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllBranches = () =>{
    setCompanyBranches([
        {
            companyBranchName: '',
            companyBranchAddress: '',
            googleMapLink: '',
        }
    ])
  }

  const handleInputChangeBranch = (index, field, value) => {
    const updatedCompanyBranches = [...companyBranches];
    updatedCompanyBranches[index][field] = value;
    setChangeMade(true);
    setCompanyBranches(updatedCompanyBranches);
  };

  const handleClick = () => {
    fileInputRef.current.click();
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    setSelectedPhoto(file);
    console.log(file);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      handleInputChange('companyLogo', e.target.result);
      // setCompanyData((prev) => {
      //   return { ...prev, photo: e.target.result };
      // });
      // setPhotoB64(e.target.result);
      // console.log(e.target.result)
    };
  };

  const handleClickAlert = () => {
    setOpenAlert(!openAlert);
  };

  const validate = () => {
    const errors = {};

    if (!companyData.companyName) errors.companyName = 'Company Name is required.';
    if (!companyData.companyWebSite) errors.companyWebSite = 'Website is required.';
    if (!companyData.companyLogo) errors.companyLogo = 'Logo is required.';

    return errors;
  };

  const action = (snackbarId) => (
    <IconButton color="inherit" onClick={() => closeSnackbar(snackbarId)}>
      <Iconify icon="eva:close-outline" />
    </IconButton>
  );

  const handleSubmit = async (event) => {
    // console.log('It worked');
    const errors = validate();
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    try {
      await axios
        .post(`/api/companies`, {...companyData,companyBranches})
        .then((response) => {
          console.log(response);
          if (response.data.status) {
            router.push('/companies/list');
            enqueueSnackbar(response.data.message, {
              variant: response.data.status ? 'success' : 'error',
              action,
            });
          }
        })
        .catch((error) => {
          console.log(error);
          // if(error.response.data.message==="Validation Failed"){
          //   const {errors=[]} = error.response.data.results;
          //   errors.map((_er)=>{

          //   })
          // }
          enqueueSnackbar(error.response.data.message, { variant: 'error', action });
        });
    } catch (error) {
      enqueueSnackbar(error.message, { variant: 'error', action });
    }
  };

  return (
    <Container maxWidth="xl">
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Create a new Company</Typography>

        <Stack direction="row" alignItems="center" gap={3}>
          <Button
            onClick={() => {
              if (changeMade) {
                handleClickAlert();
              } else {
                router.back();
              }
            }}
            // href="/employees/list"
            variant="contained"
            color="error"
            // component={RouterLink}
            startIcon={<Iconify icon="eva:arrow-back-fill" />}
          >
            Back to list
          </Button>
        </Stack>
      </Stack>

      <Box flexGrow={1}>
        <Card>
          <Box p={5} sx={{ flexGrow: 1 }}>
            <Grid container spacing={5} columns={{ xs: 4, sm: 12, md: 12 }}>
              <Grid xs={4} sm={6} md={6}>
                <Stack direction="row" alignItems="center" justifyContent="space-evenly">
                  <PhotoBox onClick={handleClick} role="presentation" tabIndex={0} component="div">
                    <input
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="image/png"
                      type="file"
                      tabIndex={-1}
                      style={{ display: 'none' }}
                    />
                    <Box
                      sx={{
                        top: 10,
                        left: 12,
                        width: '90%',
                        height: '90%',
                        overflow: 'hidden',
                        // borderRadius: '50%',
                        position: 'relative',
                      }}
                    >
                      {selectedPhoto && (
                        <Box
                          component="img"
                          // alt="Crew Photo"
                          src={companyData.companyLogo}
                          sx={{
                            overflow: 'hidden',
                            position: 'relative',
                            verticalAlign: 'bottom',
                            display: 'inline-block',
                            // borderRadius: '50%',
                            height: '100%',
                            width: '100%',
                          }}
                        />
                      )}
                      <PhotoStack
                        gap={1}
                        className="upload-placeholder"
                        selectedPhoto={selectedPhoto}
                        isError={Boolean(validationErrors.companyLogo)}
                      >
                        <Iconify icon="solar:gallery-add-bold-duotone" width={42} />
                        <Typography display="block" textAlign="center" variant="caption">
                          Update Logo *
                        </Typography>
                      </PhotoStack>
                    </Box>
                  </PhotoBox>
                  <Box>
                    <Stack>
                      {selectedPhoto && (
                        <Box display="flex" alignItems="center" justifyContent="space-evenly">
                          <Typography display="block" textAlign="center" variant="body1">
                            {selectedPhoto.name}
                          </Typography>
                          <Tooltip title="Remove Logo" placement="right">
                            <IconButton
                              aria-label="delete"
                              size="small"
                              color="error"
                              onClick={() => {
                                setSelectedPhoto(null);
                                handleInputChange('companyLogo', null);
                              }}
                            >
                              <Iconify icon="solar:gallery-remove-bold" />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      )}
                      <Typography display="block" textAlign="center" variant="caption">
                        Allowed *.png
                        <br />
                        max size of 3.1 MB
                      </Typography>
                    </Stack>
                  </Box>
                </Stack>
              </Grid>
              <Grid xs={4} sm={6} md={6}>
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Stack gap={5} width="100%">
                    <TextField
                      id="company_name"
                      fullWidth
                      required
                      label="Company Name"
                      //   value={companyData.companyName}
                      onChange={(event) => {
                        handleInputChange('companyName', event.target.value);
                      }}
                      error={Boolean(validationErrors.companyName)}
                      helperText={validationErrors.companyName}
                    />
                    <TextField
                      id="company_website"
                      fullWidth
                      required
                      label="Company Website"
                      placeholder="Ex: https://google.com"
                      //   value={companyData.companyWebSite}
                      onChange={(event) => {
                        handleInputChange('companyWebSite', event.target.value);
                      }}
                      error={Boolean(validationErrors.companyWebSite)}
                      helperText={validationErrors.companyWebSite}
                    />
                  </Stack>
                </Box>
              </Grid>
            </Grid>
          </Box>

          <Box px={5} pb={5} sx={{ flexGrow: 1 }}>
            <Grid container spacing={2} columns={{ xs: 4, sm: 19, md: 19 }}>
              {companyBranches.map((branch, index) => (
                <>
                  <Grid xs={4} sm={4} md={4}>
                    <TextField
                      id="branch_name"
                      fullWidth
                      required
                      label="Branch Name"
                      value={branch.companyBranchName}
                      onChange={(event) => {
                        handleInputChangeBranch(index, 'companyBranchName', event.target.value);
                      }}
                      error={Boolean(validationErrors.companyBranchName)}
                      helperText={validationErrors.companyBranchName}
                    />
                  </Grid>
                  <Grid xs={4} sm={7} md={7}>
                    <TextField
                      id="branch_address"
                      fullWidth
                      required
                      label="Branch Address"
                      value={branch.companyBranchAddress}
                      onChange={(event) => {
                        handleInputChangeBranch(index, 'companyBranchAddress', event.target.value);
                      }}
                      error={Boolean(validationErrors.companyBranchAddress)}
                      helperText={validationErrors.companyBranchAddress}
                    />
                  </Grid>
                  <Grid xs={4} sm={7} md={7}>
                    <TextField
                      id="google_mab_link"
                      fullWidth
                      required
                      label="Google Map Link"
                      value={branch.googleMapLink}
                      onChange={(event) => {
                        handleInputChangeBranch(index, 'googleMapLink', event.target.value);
                      }}
                      error={Boolean(validationErrors.googleMapLink)}
                      helperText={validationErrors.googleMapLink}
                    />
                  </Grid>
                  {index > 0 ? (
                    <Grid
                      xs={4}
                      sm={1}
                      md={1}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <IconButton
                        color="error"
                        onClick={() => {
                          deleteBranch(index);
                        }}
                        aria-label="add"
                        size="large"
                      >
                        <Iconify icon="solar:minus-circle-line-duotone" height={30} width={30} />
                      </IconButton>
                    </Grid>
                  ) : (
                    <Grid
                      xs={4}
                      sm={1}
                      md={1}
                      display="flex"
                      justifyContent="center"
                      alignItems="center"
                    >
                      <IconButton
                        color="error"
                        onClick={clearAllBranches}
                        aria-label="add"
                        size="large"
                      >
                        <Iconify icon="solar:close-circle-line-duotone" height={30} width={30} />
                      </IconButton>
                    </Grid>
                  )}
                </>
              ))}
              <Grid xs={4} sm={10} md={10} />
              <Grid xs={4} sm={9} md={9}>
                <Grid container spacing={5} mt={3} columns={{ xs: 4, sm: 9, md: 9 }}>
                  <Grid xs={2} sm={3} md={3}>
                    <Button fullWidth variant="contained" color="info" onClick={addBranch}>
                      Add Branch
                    </Button>
                  </Grid>
                  <Grid xs={2} sm={3} md={3}>
                    <Button fullWidth variant="contained" color="success" onClick={handleSubmit}>
                      Create Employee
                    </Button>
                  </Grid>
                  <Grid xs={2} sm={3} md={3}>
                    <>
                      <Button
                        fullWidth
                        variant="contained"
                        color="error"
                        onClick={() => {
                          if (changeMade) {
                            handleClickAlert();
                          } else {
                            router.back();
                          }
                        }}
                      >
                        Close
                      </Button>
                      <Dialog
                        open={openAlert}
                        TransitionComponent={Transition}
                        keepMounted
                        onClose={handleClickAlert}
                        aria-describedby="alert-dialog-slide-description"
                      >
                        <DialogTitle>Are you sure ?</DialogTitle>
                        <DialogContent>
                          <DialogContentText id="alert-dialog-slide-description">
                            Created data and Changes you where made can&apos;t be save..!
                          </DialogContentText>
                        </DialogContent>
                        <DialogActions>
                          <Button
                            color="error"
                            onClick={() => {
                              router.back();
                              handleClickAlert();
                            }}
                          >
                            Yes, Close!
                          </Button>
                          <Button onClick={handleClickAlert}>Cancel</Button>
                        </DialogActions>
                      </Dialog>
                    </>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Card>
      </Box>
    </Container>
  );
}
