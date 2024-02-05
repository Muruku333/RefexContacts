import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Button, Card, Container, Stack, Typography } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Unstable_Grid2';
import { alpha } from '@mui/material/styles';
import { useRouter } from 'src/routes/hooks';
import Iconify from 'src/components/iconify';
import html2canvas from 'html2canvas';
import { QRCode } from 'react-qrcode-logo';
import axios from 'axios';

export default function EmployeeView() {
  const { employeeId } = useParams();
  const router = useRouter();
  const qrRef = useRef(null);

  const [employee, setEmployee] = useState({
    employee_id: 0,
    employee_name: '',
    designation: '',
    mobile_number: '',
    landline: '',
    email: '',
    photo: null,
    is_active: 0,
    company: {
      company_id: '',
      company_name: '',
      company_website: '',
      company_logo: null,
    },
    branch: {
      branch_id: '',
      branch_name: '',
      branch_address: '',
      google_map_link: '',
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get(`/api/employees/${employeeId}`);
        console.log(response);
        if (response.data.status) {
          setEmployee(response.data.results[0]);
          console.log(response.data.results);
        }
      } catch (error) {
        console.error('Error fetching employee data:', error);
        setEmployee([]);
      }
    };

    fetchData();
  }, [employeeId]);

  const downloadQRCode = () => {
    if (!qrRef.current) return;

    html2canvas(qrRef.current,{scale:2})
      .then((canvas) => {
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = `QRCode_${employeeId}.png`;
        link.click();
      })
      .catch((error) => {
        console.error('Error generating QR code image:', error);
      });
  };

  const renderLogo = (
    <Box
      component="img"
      alt="Company Logo"
      src={employee.company.company_logo}
      sx={{
        zIndex: 9,
        top: 50,
        left: 150,
        // width: 150,
        // height: 150,
        position: 'absolute',
      }}
    />
  );

  const renderAvatar = (
    <Avatar
      alt={employee.employee_name}
      src={employee.photo}
      sx={{
        zIndex: 9,
        top: 120,
        left: 150,
        width: 150,
        height: 150,
        position: 'absolute',
        // left: (theme) => theme.spacing(3),
        // bottom: (theme) => theme.spacing(-2),
        // ...((latestPostLarge || latestPost) && {
        //   zIndex: 9,
        //   top: 24,
        //   left: 24,
        //   width: 40,
        //   height: 40,
        // }),
      }}
    />
  );

  const renderName = (
    <Typography
      variant="h3"
      component="div"
      sx={{
        textAlign: 'center',
        mb: 2,
        color: 'comman.black',
        // ...((latestPostLarge || latestPost) && {
        //   // opacity: 0.48,
        //   color: 'common.black',
        // }),
      }}
    >
      {employee.employee_name}
    </Typography>
  );

  const renderCover = (
    <Box
      component="img"
      alt="vcard-preview"
      src="/assets/images/covers/Abstract-BG.jpg" // cover_2/jpg
      sx={{
        top: 0,
        width: 1,
        height: 1,
        objectFit: 'cover',
        position: 'absolute',
      }}
    />
  );

  return (
    <Container>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={5}>
        <Typography variant="h4">Employee Preview</Typography>

        <Stack direction="row" alignItems="center" gap={3}>
          <Button
            onClick={() => {
              router.push('/employees/list');
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

      <Grid container spacing={2} columns={{ xs: 4, sm: 12, md: 12 }} width="100%">
        <Grid xs={4} sm={6} md={6} display="flex" justifyContent="center" alignItems="center">
          <Card
            sx={{
              width: 1,
              maxWidth: 450,
              height: '100%',
            }}
          >
            <Box
              sx={{
                //   position: 'relative',
                // pt: 'calc(100% * 3 / 4)',
                // ...((latestPostLarge || latestPost) && {
                pt: 'calc(100% * 4 / 3)',
                '&:after': {
                  top: 0,
                  content: "''",
                  width: '100%',
                  height: '100%',
                  position: 'absolute',
                  bgcolor: (theme) => alpha(theme.palette.grey[300], 0.1),
                },
                // }),
                // ...(latestPostLarge && {
                //   pt: {
                //     xs: 'calc(100% * 4 / 3)',
                //     sm: 'calc(100% * 3 / 4.66)',
                //   },
                // }),
              }}
            >
              {renderLogo}
              {renderAvatar}
              {renderCover}
              <Box
                sx={{
                  p: (theme) => theme.spacing(4, 3, 3, 3),
                  // ...((latestPostLarge || latestPost) && {
                  width: 1,
                  bottom: 0,
                  position: 'absolute',
                  // }),
                }}
              >
                {renderName}
              </Box>
            </Box>
          </Card>
        </Grid>
        <Grid xs={4} sm={6} md={6} display="flex" justifyContent="center" alignItems="center">
          <Card
            sx={{
              p: 6,
              width: 1,
              maxWidth: 450,
              height: '100%',
            }}
          >
            <Stack justifyContent="center" alignItems="center" gap={4}>
            <Box ref={qrRef} sx={{p:2}}>
            <Box
            sx={{border:'3px solid black',borderRadius:3,p:1}}>
              <QRCode
                value={`http:localhost:3030/vcard/${employeeId}`}
                logoImage="/assets/Refex-Logo.png"
                logoWidth={72}
                logoHeight={22}
                size={200}
                qrStyle="dots"
                eyeRadius={10}
                removeQrCodeBehindLogo
                logoPadding={1}
              />
</Box>
</Box>
              <Button
                fullWidth
                onClick={downloadQRCode}
                // href="/employees/list"
                variant="contained"
                color="info"
                // component={RouterLink}
                startIcon={<Iconify icon="solar:download-minimalistic-line-duotone" />}
              >
                Download
              </Button>

              <Button
                onClick={() => {
                  router.push(`/employees/edit/${employeeId}`);
                }}
                // href="/employees/list"
                variant="contained"
                color="info"
                fullWidth
                // component={RouterLink}
                startIcon={<Iconify icon="solar:pen-bold-duotone" />}
              >
                Edit
              </Button>



              <Button
                onClick={() => {
                  router.push(`/vcard/${employeeId}`);
                }}
                // href="/employees/list"
                variant="contained"
                color="info"
                fullWidth
                // component={RouterLink}
                startIcon={<Iconify icon="solar:link-bold-duotone" />}
              >
                Live Link
              </Button>

              <Button
                onClick={() => {
                  router.push('/employees/list');
                }}
                // href="/employees/list"
                variant="contained"
                color="error"
                fullWidth
                // component={RouterLink}
                startIcon={<Iconify icon="solar:power-bold-duotone" />}
              >
                Deactivate
              </Button>
            </Stack>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
