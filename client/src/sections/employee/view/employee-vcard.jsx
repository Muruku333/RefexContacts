import axios from 'axios';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import Avatar from '@mui/material/Avatar';
import { alpha } from '@mui/material/styles';
import { Box, Card, Link, Stack, Button, Container, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import Iconify from 'src/components/iconify';

export default function EmployeeVCard() {
  const { employeeId } = useParams();
  const router = useRouter();

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
        const response = await axios.get(`/api/vcard/${employeeId}`);
        if (response.data.status) {
          if (!response.data.results[0].is_active) {
            router.push('/404');
          } else {
            setEmployee(response.data.results[0]);
          }
        }
      } catch (error) {
        // console.error('Error fetching employee data:', error);
        router.push('/404');
        setEmployee([]);
      }
    };

    fetchData();
  }, [employeeId, router]);

  const handleClickSave = async () => {
    try {
      // Make a GET request to the Express endpoint to fetch the vCard
      const response = await axios.get(`/api/download-vcard/${employeeId}`, {
        responseType: 'blob', // Set the responseType to 'blob' to handle binary data
      });

      // Check if the response is successful (status code 200)
      if (response.status === 200) {
        // Create a Blob from the response data
        const blob = new Blob([response.data], { type: 'text/vcard' });

        // Create a temporary anchor element
        const link = document.createElement('a');

        // Set the download attribute with the desired file name
        link.download = `${employee.employee_name}.vcf`;

        // Create a Blob URL from the blob and set it as the href
        link.href = window.URL.createObjectURL(blob);

        // Append the link to the body
        document.body.appendChild(link);

        // Trigger a click on the link to start the download
        link.click();

        // Remove the link from the DOM
        document.body.removeChild(link);
      } else {
        console.error('Failed to download vCard:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching vCard:', error);
    }
  };

  const handleClickShare = async () => {
    try {
      // Check if the share API is supported in the browser
      if (navigator.share !== undefined) {
        await navigator.share({
          title: 'Refex Contacts',
          text: 'Check out this link!',
          url: `/vcard/${employeeId}`, // Replace with your desired URL
        });
      } else {
        console.error('Share API not supported in this browser');
        // Optionally, you can provide a fallback behavior for browsers that don't support the Share API
      }
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const renderLogo = (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{
        // zIndex: 9,
        verticalAlign: 'middle',
      }}
    >
      <Box
        component="img"
        alt="Company Logo"
        src={employee.company.company_logo}
        sx={{
          // top: 30,
          // left: 150,
          // mt: 2,
          overflow: 'hidden',
          // position: 'absolute',
          verticalAlign: 'bottom',
          display: 'inline-block',
          height: '80px',
        }}
        // sx={{

        //   // width: 150,
        //   // height: 150,
        //   position: 'absolute',
        // }}
      />
    </Box>
  );

  // const renderAvatar = (
  //   <Box
  //     sx={{
  //       zIndex: 9,
  //       mt: 5,
  //       // top: 150,
  //       // left: 150,
  //       // position: 'absolute',
  //       display: 'flex',
  //       justifyContent: 'center',
  //       alignItems: 'center',
  //       // left: (theme) => theme.spacing(3),
  //       // bottom: (theme) => theme.spacing(-2),
  //       // ...((latestPostLarge || latestPost) && {
  //       //   zIndex: 9,
  //       //   top: 24,
  //       //   left: 24,
  //       //   width: 40,
  //       //   height: 40,
  //       // }),
  //     }}
  //   >
  //     <Avatar
  //       alt={employee.employee_name}
  //       src={employee.photo}
  //       sx={{
  //         width: 150,
  //         height: 150,
  //       }}
  //     />
  //   </Box>
  // );

  const renderAvatar = (
    <Stack
      direction="row"
      display="flex"
      justifyContent="center"
      alignItems="center"
      sx={{ mt: 5 }}
    >
      <Box
        sx={{
          width: 160,
          height: 160,
          borderRadius: '50%',
          background: 'linear-gradient(90deg, #2879b6 25%, #7dc244 50%, #ee6a31 100%)',
          padding: '3px', // Adjust padding to control border width
          display: 'inline-block',
        }}
      >
        <Avatar
          alt={employee.employee_name}
          src={employee.photo}
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
          }}
        />
      </Box>
    </Stack>
  );

  const renderName = (
    <Box>
      <Typography
        variant="h4"
        // component="div"
        sx={{
          mt: 2,
          textAlign: 'center',
          color: 'comman.black',
          // ...((latestPostLarge || latestPost) && {
          //   // opacity: 0.48,
          //   color: 'common.black',
          // }),
        }}
      >
        {employee.employee_name}
      </Typography>

      <Typography
        variant="h5"
        // component="div"
        sx={{
          textAlign: 'center',
          color: 'comman.black',
          // ...((latestPostLarge || latestPost) && {
          //   // opacity: 0.48,
          //   color: 'common.black',
          // }),
        }}
      >
        {employee.designation}
      </Typography>
      <Typography
        variant="h5"
        // component="div"
        sx={{
          textAlign: 'center',
          color: 'comman.black',
          // ...((latestPostLarge || latestPost) && {
          //   // opacity: 0.48,
          //   color: 'common.black',
          // }),
        }}
      >
        {employee.company.company_name}
      </Typography>
    </Box>
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

  const renderLinks = (
    <Stack
      gap={2}
      sx={{
        mt: 5,
        color: 'common.black',
      }}
    >
      <Stack direction="row" gap={1.5} alignItems="center">
        <Box display="flex" justifyContent="center" alignItems="center">
          <Iconify width={24} icon="ri:whatsapp-fill" />
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Link
            href={`https://api.whatsapp.com/send?phone=91${employee.mobile_number}`}
            color="inherit"
            variant="subtitle2"
            underline="hover"
            target="_blank" // Open in a new tab
            rel="noopener noreferrer"
            sx={{
              // height: 44,
              overflow: 'hidden',
              WebkitLineClamp: 2,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              typography: 'subtitle2',
              // height: 60,
              // ...(latestPostLarge && { typography: 'h5', height: 60 }),
              // ...((latestPostLarge || latestPost) && {
              // }),
            }}
          >
            WhatsApp me
          </Link>
        </Box>
      </Stack>

      <Stack direction="row" gap={1.5} alignItems="center">
        <Box display="flex" justifyContent="center" alignItems="center">
          <Iconify width={24} icon="ic:round-email" />
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Link
            href={`mailto:${employee.email}`}
            color="inherit"
            variant="subtitle2"
            underline="hover"
            target="_blank" // Open in a new tab
            rel="noopener noreferrer"
            sx={{
              // height: 44,
              overflow: 'hidden',
              WebkitLineClamp: 2,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              typography: 'subtitle2',
              // height: 60,
              // ...(latestPostLarge && { typography: 'h5', height: 60 }),
              // ...((latestPostLarge || latestPost) && {
              color: 'common.black',
              // }),
            }}
          >
            Email me
          </Link>
        </Box>
      </Stack>

      <Stack direction="row" gap={1.5} alignItems="center">
        <Box display="flex" justifyContent="center" alignItems="center">
          <Iconify width={24} icon="fluent:globe-search-24-filled" />
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Link
            href={employee.company.company_website}
            color="inherit"
            variant="subtitle2"
            underline="hover"
            target="_blank" // Open in a new tab
            rel="noopener noreferrer"
            sx={{
              // height: 44,
              overflow: 'hidden',
              WebkitLineClamp: 2,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              typography: 'subtitle2',
              // height: 60,
              // ...(latestPostLarge && { typography: 'h5', height: 60 }),
              // ...((latestPostLarge || latestPost) && {
              color: 'common.black',
              // }),
            }}
          >
            {employee.company.company_website.replace(/^https?:\/\//, '')}
          </Link>
        </Box>
      </Stack>

      <Stack direction="row" gap={1.5} alignItems="center">
        <Box display="flex" justifyContent="center" alignItems="center">
          <Iconify width={24} icon="mdi:location" />
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center">
          <Link
            href={employee.branch.google_map_link}
            color="inherit"
            variant="subtitle2"
            underline="hover"
            target="_blank" // Open in a new tab
            rel="noopener noreferrer"
            sx={{
              // height: 44,
              overflow: 'hidden',
              WebkitLineClamp: 2,
              display: '-webkit-box',
              WebkitBoxOrient: 'vertical',
              typography: 'subtitle2',
              // height: 60,
              // ...(latestPostLarge && { typography: 'h5', height: 60 }),
              // ...((latestPostLarge || latestPost) && {
              color: 'common.black',
              // }),
            }}
          >
            {employee.branch.branch_address}
          </Link>
        </Box>
      </Stack>
    </Stack>
  );

  // const renderButtons = (
  //   <Box display="flex" justifyContent="center" alignItems="center">
  //     <Stack
  //       direction="row"
  //       spacing={4}
  //       sx={{
  //         mt: 3,
  //       }}
  //     >
  //       <Button
  //         variant="contained"
  //         onClick={handleClickSave}
  //         startIcon={<Iconify width={24} icon="solar:user-plus-rounded-bold-duotone" />}
  //         sx={{ width: 150 }}
  //       >
  //         Save
  //       </Button>
  //       <Button
  //         variant="contained"
  //         onClick={handleClickShare}
  //         startIcon={<Iconify width={24} icon="solar:share-bold-duotone" />}
  //         sx={{ width: 150 }}
  //       >
  //         Share
  //       </Button>
  //     </Stack>
  //   </Box>
  // );
  const renderButtons = (
    <Box display="flex" justifyContent="center" alignItems="center" width="100%">
      <Stack
        direction={{ xs: 'column', sm: 'row' }} // Vertical on mobile, horizontal on larger screens
        justifyContent="center"
        alignItems="center"
        spacing={{ xs: 2, sm: 4 }}
        sx={{ mt: 3, width: '100%', alignItems: 'center' }}
      >
        <Button
          variant="contained"
          onClick={handleClickSave}
          startIcon={<Iconify width={24} icon="solar:user-plus-rounded-bold-duotone" />}
          sx={{
            width: { xs: '100%', sm: 150 }, // Full width on mobile, fixed width on larger screens
          }}
        >
          Save
        </Button>
        <Button
          variant="contained"
          onClick={handleClickShare}
          startIcon={<Iconify width={24} icon="solar:share-bold-duotone" />}
          sx={{
            width: { xs: '100%', sm: 150 },
          }}
        >
          Share
        </Button>
      </Stack>
    </Box>
  );

  return (
    // <Container maxWidth="xl" sx={{ backgroundColor: '#282829' }}>
    //   <Stack direction="row" alignItems="center" justifyContent="center" height="750px" p={2}>
    //     <Box
    //       sx={{
    //         width: 460,
    //         height: '100%',
    //         borderRadius: 2,
    //         background: 'linear-gradient(90deg, #2879b6 25%, #7dc244 50%, #ee6a31 100%)',
    //         padding: '5px', // Adjust padding to control border width
    //         display: 'inline-block',
    //       }}
    //     >
    //       <Card
    //         sx={{
    //           width: '100%',
    //           height: '100%',
    //         }}
    //       >
    //         <Box
    //           sx={{
    //             //   position: 'relative',
    //             // pt: 'calc(100% * 3 / 4)',
    //             // ...((latestPostLarge || latestPost) && {
    //             // pt: 'calc(100% * 4 / 3)',
    //             '&:after': {
    //               top: 0,
    //               content: "''",
    //               width: '100%',
    //               height: '100%',
    //               position: 'absolute',
    //               bgcolor: (theme) => alpha(theme.palette.grey[300], 0.1),
    //             },
    //             // }),
    //             // ...(latestPostLarge && {
    //             //   pt: {
    //             //     xs: 'calc(100% * 4 / 3)',
    //             //     sm: 'calc(100% * 3 / 4.66)',
    //             //   },
    //             // }),
    //           }}
    //         >
    //           {/* {renderLogo}
    //           {renderAvatar} */}
    //           {renderCover}
    //         </Box>

    //         <Box
    //           sx={{
    //             p: { xs: 2, sm: 5 },
    //             // ...((latestPostLarge || latestPost) && {
    //             width: 1,
    //             // bottom: 0,
    //             top: 0,
    //             position: 'absolute',
    //             // }),
    //           }}
    //         >
    //           {renderLogo}

    //           {renderAvatar}

    //           {renderName}

    //           {renderLinks}

    //           {renderButtons}
    //         </Box>
    //       </Card>
    //     </Box>
    //   </Stack>
    // </Container>
    <Container maxWidth="xl" sx={{ backgroundColor: '#282829', minHeight: '100vh', py: 2 }}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="center"
        sx={{
          minHeight: '80vh', // Adaptive vertical height
          // px: 2,
        }}
      >
        <Box
          sx={{
            width: { xs: '100%', sm: '80%', md: '60%', lg: '460px' }, // Responsive width
            borderRadius: 2,
            background: 'linear-gradient(90deg, #2879b6 25%, #7dc244 50%, #ee6a31 100%)',
            p: '5px',
            display: 'flex',
            justifyContent: 'center',
          }}
        >
          <Card
            sx={{
              width: '100%',
              position: 'relative', // Needed for inner absolute box
              minHeight: { xs: 750, sm: 750, md: 750 }, // Responsive height
            }}
          >
            <Box
              sx={{
                height: '100%',
                '&:after': {
                  content: "''",
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  bgcolor: (theme) => alpha(theme.palette.grey[300], 0.1),
                  zIndex: 1,
                },
              }}
            >
              {renderCover}
            </Box>

            <Box
              sx={{
                position: 'absolute',
                top: 0,
                width: '100%',
                zIndex: 2, // Above the overlay
                p: { xs: 2, sm: 4 },
              }}
            >
              {renderLogo}
              {renderAvatar}
              {renderName}
              {renderLinks}
              {renderButtons}
            </Box>
          </Card>
        </Box>
      </Stack>
    </Container>
  );
}
