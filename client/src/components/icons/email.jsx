import PropTypes from 'prop-types';
import { forwardRef } from 'react';

import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
// import { useTheme } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

// ----------------------------------------------------------------------

const Email = forwardRef(({ disabledLink = false, sx, ...other }, ref) => {
  //   const theme = useTheme();

  //   const PRIMARY_LIGHT = theme.palette.primary.light;

  //   const PRIMARY_MAIN = theme.palette.primary.main;

  //   const PRIMARY_DARK = theme.palette.primary.dark;

  // OR using local (public folder)
  // -------------------------------------------------------
  //   const logo = (
  //     <Box
  //       component="img"
  //       src="/assets/Refex-Logo.png"
  //       sx={{ width: 140, height: 44, cursor: 'pointer', ...sx }}
  //     />
  //   );

  const email = (
    <Box
      ref={ref}
      component="div"
      sx={{
        width: 32,
        height: 32,
        display: 'inline-flex',
        ...sx,
      }}
      {...other}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        // width="32"
        // height="32"
        viewBox="0 0 32 32"
        fill="none"
      >
        <path
          d="M4 27C3.175 27 2.469 26.7187 1.882 26.1562C1.295 25.5936 1.001 24.9166 1 24.125V6.875C1 6.08437 1.294 5.40779 1.882 4.84525C2.47 4.28271 3.176 4.00096 4 4H28C28.825 4 29.5315 4.28175 30.1195 4.84525C30.7075 5.40875 31.001 6.08533 31 6.875V24.125C31 24.9156 30.7065 25.5927 30.1195 26.1562C29.5325 26.7197 28.826 27.001 28 27H4ZM16 16.9375L4 9.75V24.125H28V9.75L16 16.9375ZM16 14.0625L28 6.875H4L16 14.0625ZM4 9.75V6.875V24.125V9.75Z"
          fill="white"
        />
      </svg>
    </Box>
  );

  if (disabledLink) {
    return email;
  }

  return (
    <Link component={RouterLink} href="/" sx={{ display: 'contents' }}>
      {email}
    </Link>
  );
});

Email.propTypes = {
  disabledLink: PropTypes.bool,
  sx: PropTypes.object,
};

export default Email;
