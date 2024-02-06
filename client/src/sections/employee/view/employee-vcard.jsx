import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Button, IconButton, Card, Container, Stack, Typography,Link } from '@mui/material';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Unstable_Grid2';
import Iconify from 'src/components/iconify';
import { alpha } from '@mui/material/styles';
import axios from 'axios';

export default function EmployeeVCard(){

    const { employeeId } = useParams();

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
              setEmployee(response.data.results[0]);
            }
          } catch (error) {
            console.error('Error fetching employee data:', error);
            setEmployee([]);
          }
        };
    
        fetchData();
      }, [employeeId]);

      const handleClickSave = async () => {
        try {
            await axios.get(`/api/download-vcard/${employeeId}`);
          } catch (error) {
            console.error('Error fetching employee data:', error);
          }
      }

      const renderLogo = (
        <Box
        display='flex'
        justifyContent='center'
        alignItems='center'
        sx={{
            
          // zIndex: 9,
          verticalAlign:"middle"
        }}
        >
              <Box
          component="img"
          alt="Company Logo"
          src={employee.company.company_logo}
          sx={{
            
            // top: 30,
            // left: 150,
            mt:3,
            overflow: 'hidden',
            // position: 'absolute',
            verticalAlign: 'bottom',
            display: 'inline-block',
            height: '50px',
          }}
          // sx={{
    
          //   // width: 150,
          //   // height: 150,
          //   position: 'absolute',
          // }}
        />
        </Box>
      );

      const renderAvatar = (
        <Box
        sx={{
          zIndex: 9,
          mt:7,
          // top: 150,
          // left: 150,
          // position: 'absolute',
          display:'flex',
          justifyContent:'center',
          alignItems:'center',
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
        >
        <Avatar
          alt={employee.employee_name}
          src={employee.photo}
          sx={{
            width: 150,
            height: 150,
          }}
        />
        </Box>
      );

      const renderName = (
        <Box>
        <Typography
          variant="h4"
          // component="div"
          sx={{
            mt:2,
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

      const renderDate = (
        <Typography
          variant="caption"
          component="div"
          sx={{
            mb: 2,
            // color: 'text.disabled',
            // ...((latestPostLarge || latestPost) && {
              opacity: 0.48,
              color: 'common.black',
            // }),
          }}
        >
          Hello
        </Typography>
      );

      const renderLinks = (
        <Stack
          spacing={2}
          sx={{
            mt:5,
            color: 'common.black',
          }}
        >
    
          <Stack direction="row">
          <Iconify width={24} icon="ri:whatsapp-fill" sx={{ mr: 1.5 }} />
            <Link
        href={`https://api.whatsapp.com/send?phone=91${employee.mobile_number}`}
          color="inherit"
          variant="subtitle2"
          underline="hover"
          target="_blank"      // Open in a new tab
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
        </Stack>
    
        <Stack direction="row">
        <Iconify width={24} icon="ic:round-email" sx={{ mr: 1.5 }} />
        <Link
        href={`mailto:${employee.email}`}
          color="inherit"
          variant="subtitle2"
          underline="hover"
          target="_blank"      // Open in a new tab
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
        </Stack>
    
        <Stack direction="row">
        <Iconify width={24} icon="fluent:globe-search-24-filled" sx={{ mr: 1.5}} />
        <Link
        href={employee.company.company_website}
          color="inherit"
          variant="subtitle2"
          underline="hover"
          target="_blank"      // Open in a new tab
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
        </Stack>
    
        <Stack direction="row">
        <Iconify width={24} icon="mdi:location" sx={{ mr: 1.5 }} />
        <Link
        href={employee.branch.google_map_link}
          color="inherit"
          variant="subtitle2"
          underline="hover"
          target="_blank"      // Open in a new tab
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
    </Stack>
    
        </Stack>
      );

      const renderButtons=(
        <Box 
            display='flex'
            justifyContent='center'
            alignItems='center'
        >
        <Stack
        direction='row'
        spacing={4}
        sx={{
          mt:3,
        }}
      >
<Button variant="contained" startIcon={<Iconify width={24} icon="ic:round-email" />}>
  Save
</Button>
<Button variant="contained" startIcon={<Iconify width={24} icon="ic:round-email" />}>
  Share
</Button>
      </Stack>
      </Box>
      );

    return(
        <Container maxWidth="xl">
            <Stack direction='column' alignItems='center' justifyContent='space-around' >
            <Card
            sx={{
                mt:6,
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
              {/* {renderLogo}
              {renderAvatar} */}
              {renderCover}
              </Box>

              <Box
                sx={{
                  p: (theme) => theme.spacing(4),
                  // ...((latestPostLarge || latestPost) && {
                  width: 1,
                  bottom: 0,
                  position: 'absolute',
                  // }),
                }}
              >
                {renderLogo}

                {renderAvatar}

                {renderName}

                {renderLinks}

                {renderButtons}
                
            </Box>
          </Card>
          </Stack>
        </Container>
    );
}