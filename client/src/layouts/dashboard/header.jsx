import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import { Link, ListItemButton, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import IconButton from '@mui/material/IconButton';

import { useResponsive } from 'src/hooks/use-responsive';
import { usePathname } from 'src/routes/hooks';
import { bgBlur } from 'src/theme/css';
import { RouterLink } from 'src/routes/components';
import Iconify from 'src/components/iconify';

// import Searchbar from './common/searchbar';

import Logo from 'src/components/logo';

import { NAV, HEADER } from './config-layout';
import AccountPopover from './common/account-popover';
// import LanguagePopover from './common/language-popover';
import NotificationsPopover from './common/notifications-popover';

const Pages = [
  { title: 'Employees', path: '/employees' },
  { title: 'Companies', path: '/companies' },
  { title: 'Print Requests', path: '/print_requests'},
];

// ----------------------------------------------------------------------

export default function Header({ onOpenNav }) {
  const theme = useTheme();
  const pathname = usePathname();
  const lgUp = useResponsive('up', 'lg');

  const renderContent = (
    <>
      {/* {!lgUp && (
        <IconButton onClick={onOpenNav} sx={{ mr: 1 }}>
          <Iconify icon="eva:menu-2-fill" />
        </IconButton>
      )} */}

      {/* <Searchbar /> */}
      <Logo sx={{ mt: -1.25 }} />

      {/* <Link component={RouterLink} href="/user" underline='none' sx={{ display: 'block',cursor: 'pointer' }}>
      <Typography variant='h6' component='div' color={theme.palette.common.black}>Employees</Typography>
      </Link>
        
        <Link component={RouterLink} href="/blog" sx={{ display: 'contents' }}>
        <Typography variant='h6' color={theme.palette.common.black}>Companies</Typography>
        </Link> */}

      <Stack direction="row" alignItems="center" mx={3}>
        {Pages.map((page) => {
          const active = pathname.startsWith(page.path);

          return (
            <ListItemButton
              component={RouterLink}
              href={page.path}
              sx={{
                minHeight: 44,
                borderRadius: 0.75,
                typography: 'h6',
                color: 'text.secondary',
                textTransform: 'capitalize',
                fontWeight: 'fontWeightMedium',
                ...(active && {
                  color: 'primary.dark',
                  fontWeight: 'fontWeightSemiBold',
                  // bgcolor: alpha(theme.palette.primary.main, 0.08),
                  '&:hover': {
                    bgcolor: alpha(theme.palette.primary.main, 0.16),
                  },
                }),
              }}
            >
              {/* <Box component="span" sx={{ width: 24, height: 24, mr: 2 }}>
        {item.icon}
      </Box> */}

              <Box component="span">
                <Typography variant="h6">{page.title}</Typography>
              </Box>
            </ListItemButton>
          );
        })}
      </Stack>

      <Box sx={{ flexGrow: 1 }} />

      <Stack direction="row" alignItems="center" spacing={1}>
        {/* <LanguagePopover /> */}
        {/* <NotificationsPopover /> */}
        <AccountPopover />
      </Stack>
    </>
  );

  return (
    <AppBar
      sx={{
        boxShadow: 'none',
        height: HEADER.H_MOBILE,
        zIndex: theme.zIndex.appBar + 1,
        ...bgBlur({
          color: theme.palette.background.default,
        }),
        transition: theme.transitions.create(['height'], {
          duration: theme.transitions.duration.shorter,
        }),
        ...(lgUp && {
          height: HEADER.H_DESKTOP,
        }),
      }}
    >
      <Toolbar
        sx={{
          height: 1,
          px: { lg: 5 },
        }}
      >
        {renderContent}
      </Toolbar>
    </AppBar>
  );
}

Header.propTypes = {
  onOpenNav: PropTypes.func,
};
