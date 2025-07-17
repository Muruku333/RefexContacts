/* eslint-disable import/no-unresolved */
import axios from 'axios';
import { QRCode } from 'react-qrcode-logo';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { Box, Stack } from '@mui/material';

import { Web, Email, Whatsapp } from 'src/components/icons';

const authToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiUkctMDAwMSIsImlhdCI6MTc0NjE2NzUzNX0.foDHmYHn54PZsdkIwI2HwsnvKZLpT1mNPkNK8Drbc1A';

export default function RefexMobility() {
  const { empId } = useParams();
  //   const theme = useTheme();
  const [employee, setEmployee] = useState({
    employee_id: '0',
    employee_name: '',
    email: '',
    mobile_number: '',
    designation: '',
    company: {
      website: '',
    },
    branch: {
      branch_id: '0',
      branch_name: '',
      branch_address: '',
    },
  });
  console.log(employee);

  useEffect(() => {
    const fetchData = async () => {
      await axios
        .get(`/api/pdf_data/employees/${empId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        })
        .then((res) => {
          setEmployee(res.data.results[0]);
        });
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Stack justifyContent="center" alignItems="center">
      {employee ? (
        <>
          {/* First Page  */}
          <Box
            sx={{
              width: '210mm',
              height: '297mm',
              px: '10mm',
              pt: '10mm',
              boxSizing: 'border-box',
              pageBreakAfter: 'always',
              backgroundColor: '#ffffff',
              position: 'relative',
              fontFamily: 'Poppins',
            }}
          >
            {/* Centered rectangle with background image */}
            <Box
              sx={{
                position: 'absolute',
                width: '253.75px', // or '89.54mm'
                height: '146px', // or '51.51mm'
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                border: '1px solid black',
                boxSizing: 'border-box',
                backgroundImage: 'url(/assets/pdf/RMBack.png)',
                backgroundSize: 'cover', // or 'contain' depending on your needs
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end', // Aligns children to bottom
                alignItems: 'center', // Centers horizontally
              }}
            >
              {/* Branch address - positioned at bottom inside the rectangle */}
              {/* <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '5px',
                  marginBottom: '7px',
                }}
              >
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  <Iconify width={7} icon="mdi:location" sx={{ color: '#F4553B' }} />
                </Box>
                <Box
                  sx={{
                    fontWeight: 'bold',
                    color: '#F4553B',
                    textAlign: 'center',
                    // flexGrow: 1,
                  }}
                >
                  {employee.branch.branch_address}
                </Box>
              </Box> */}
              <Box
                sx={{
                  fontWeight: 600,
                  color: '#F4553B',
                  textAlign: 'center',
                  fontSize: '5px',
                  marginBottom: '6px',
                  // flexGrow: 1,
                }}
              >
                Chennai | Bengaluru | Hyderabad | Mumbai | Delhi
              </Box>
              {/* <Box
                sx={{
                  color: '#F4553B',
                  //   backgroundColor: 'rgba(255, 255, 255, 0.7)', // Semi-transparent white background
                  //   padding: '4px 8px',
                  marginBottom: '6px',
                  //   borderRadius: '2px',
                  textAlign: 'center',
                  fontSize: '5px',
                  fontWeight: 'bold',
                }}
              >
                <Iconify width={12} icon="mdi:location" /> {employee.branch.branch_address}
              </Box> */}
            </Box>
          </Box>
          {/* Second Page */}
          <Box
            sx={{
              width: '210mm',
              height: '297mm',
              px: '10mm',
              pt: '10mm',
              boxSizing: 'border-box',
              pageBreakAfter: 'always',
              backgroundColor: '#ffffff',
              position: 'relative',
              fontFamily: 'Poppins',
            }}
          >
            {/* Centered rectangle without background image */}
            <Box
              sx={{
                position: 'absolute',
                width: '253.75px', // or '89.54mm'
                height: '146px', // or '51.51mm'
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                border: '1px solid black',
                boxSizing: 'border-box',
                backgroundColor: '#ffffff', // White background
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              {/* Top 30% section */}
              <Box
                sx={{
                  height: '30%',
                  display: 'flex',
                  //   borderBottom: '1px solid #F4553B',
                  //   padding: '4px',
                }}
              >
                {/* Left 70% */}
                <Box sx={{ width: '80%', p: 1 }}>
                  <Box
                    sx={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: '#F4553B',
                      // lineHeight: '1pt',
                    }}
                  >
                    {employee.employee_name}
                  </Box>
                  <Box
                    sx={{
                      fontSize: '6px',
                      color: '#F4553B',
                      fontWeight: 'normal',
                      // marginTop: '2px',
                    }}
                  >
                    {employee.designation}
                  </Box>
                </Box>

                {/* Right 25% - Placeholder for company logo */}
                <Box
                  sx={{
                    width: '20%',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Box
                    sx={{
                      width: '60%',
                      height: '70%',
                      backgroundImage: 'url(/assets/pdf/RMLogo.png)',
                      backgroundColor: '#F4553B',
                      backgroundSize: 'contain',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'center',
                      border: '1px solid #F4553B',
                      borderRadius: '8px', // Added border radius
                    }}
                  />
                </Box>
              </Box>

              {/* Bottom 70% section */}
              <Box
                sx={{
                  height: '70%',
                  display: 'flex',
                }}
              >
                {/* Left 60% */}
                <Box
                  sx={{
                    width: '60%',
                    // padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    fontSize: '8px',
                    fontWeight: 500,
                    color: '#F4553B',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: '#F4553B',
                        borderRadius: '0 12px 12px 0',
                        padding: '4px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        mr: '4px',
                      }}
                    >
                      <Email sx={{ width: 10, height: 10 }} />
                    </Box>
                    <Box
                      sx={{
                        // fontSize: '7px',
                        // fontWeight: 'bold',
                        // color: '#F4553B',
                        // textAlign: 'center',
                        flexGrow: 1,
                      }}
                    >
                      {employee.email}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      marginBottom: '10px',
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: '#F4553B',
                        borderRadius: '0 12px 12px 0',
                        padding: '4px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        mr: '4px',
                      }}
                    >
                      <Whatsapp sx={{ width: 10, height: 10 }} />
                      {/* <Iconify width={10} icon="ph:whatsapp-logo-thin" sx={{ color: 'white' }} /> */}
                    </Box>
                    <Box
                      sx={{
                        // fontSize: '7px',
                        // fontWeight: 'bold',
                        // color: '#F4553B',
                        // textAlign: 'center',
                        flexGrow: 1,
                      }}
                    >
                      {employee.mobile_number}
                    </Box>
                  </Box>

                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    <Box
                      sx={{
                        backgroundColor: '#F4553B',
                        borderRadius: '0 12px 12px 0',
                        padding: '4px 4px',
                        display: 'flex',
                        alignItems: 'center',
                        mr: '4px',
                      }}
                    >
                      {/* <Iconify
                        width={10}
                        icon="fluent:globe-search-24-filled"
                        sx={{ color: 'white' }}
                      /> */}
                      <Web sx={{ width: 10, height: 10 }} />
                    </Box>
                    <Box
                      sx={{
                        // fontSize: '7px',
                        // fontWeight: 'bold',
                        // color: '#F4553B',
                        // textAlign: 'center',
                        flexGrow: 1,
                      }}
                    >
                      {employee.company.company_website}
                    </Box>
                  </Box>
                </Box>

                {/* Vertical divider */}
                <Box
                  sx={{
                    width: 0.0025,
                    backgroundColor: '#F4553B',
                    margin: '8px 0',
                  }}
                />

                {/* Right 40% - QR Code */}
                <Box
                  sx={{
                    width: 'calc(40% - 1px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    // padding: '4px',
                  }}
                >
                  <QRCode
                    value={`https://contacts.dev.refex.group/vcard/${empId}`}
                    ecLevel="Q"
                    size={70}
                    qrStyle="dots"
                    eyeRadius={10}
                    fgColor="#F4553B"
                    quietZone={3}
                  />
                  <Box
                    sx={{
                      fontSize: '6px',
                      color: '#F4553B',
                      marginTop: '1px',
                      textAlign: 'center',
                    }}
                  >
                    Scan to save contact
                  </Box>
                </Box>
              </Box>
              {/* <Box
                sx={{
                  height: '70%',
                  display: 'flex',
                }}
              >
                <Box
                  sx={{
                    width: '60%',
                    padding: '8px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      fontSize: '8px',
                      fontWeight: 'bold',
                      color: '#F4553B',
                      marginBottom: '10px',
                    }}
                  >
                    <Iconify width={12} icon="ic:round-email" /> {employee.email}
                  </Box>
                  <Box
                    sx={{
                      fontSize: '8px',
                      fontWeight: 'bold',
                      color: '#F4553B',
                      marginBottom: '10px',
                    }}
                  >
                    <Iconify width={12} icon="ri:whatsapp-fill" /> {employee.mobile_number}
                  </Box>
                  <Box
                    sx={{
                      fontSize: '8px',
                      fontWeight: 'bold',
                      color: '#F4553B',
                    }}
                  >
                    <Iconify width={} icon="fluent:globe-search-24-filled" />{' '}
                    {employee.company.company_website}
                  </Box>
                </Box>
                <Box
                  sx={{
                    width: '1px',
                    backgroundColor: '#F4553B',
                    margin: '8px 0',
                  }}
                />
                <Box
                  sx={{
                    width: 'calc(40% - 1px)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '8px',
                  }}
                >
                  <QRCode
                    value={`https://contacts.dev.refex.group/vcard/${empId}`}
                    ecLevel="Q"
                    size={70} // Adjusted size to fit better
                    qrStyle="dots"
                    eyeRadius={10}
                    fgColor="#F4553B" // Set QR code color
                    quietZone={3}
                  />
                  <Box
                    sx={{
                      fontSize: '6px',
                      color: '#F4553B',
                      marginTop: '1px',
                      textAlign: 'center',
                    }}
                  >
                    Scan to save contact
                  </Box>
                </Box>
              </Box> */}
            </Box>
          </Box>
        </>
      ) : (
        <Box component="p">Failed to load pdf..!</Box>
      )}
    </Stack>
  );
}
