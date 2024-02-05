import axios from "axios";
import { useState } from 'react';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import { useAuth } from 'src/context/AuthContext';
import { bgGradient } from 'src/theme/css';
import Footer from "src/layouts/dashboard/footer";

import Logo from 'src/components/logo';
import Iconify from 'src/components/iconify';


// ----------------------------------------------------------------------

export default function LoginView() {
  const theme = useTheme();

  const router = useRouter();
  const {login} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]=useState(false);
  const [loginStatus, setLoginStatus] =useState(false);
  const [loginStatusMessage, setLoginStatusMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoginStatusMessage(null);
    setLoading(true);
    if((email===""||email===null) || (password===""||password===null)){
      setTimeout(() => {
        setLoginStatusMessage("Email and Password is required.");
        setLoading(false);
      }, 1000);
    }
    else{
      axios.post(`/api/login`,{email,password}).then((response)=>{
        // console.log(response);
        setLoginStatus(response.data.status);
        if(response.data.status){
            // const sessionData ={
            //     token:response.data.token,
            //     userData:response.data.user_data,
            // }
            login(response.data.token, response.data.user_data);
            setLoginStatusMessage(response.data.message);
            setLoading(false);
            router.push('/employees');
        }
    }).catch((error)=>{
        console.error("Login error:", error);
        setTimeout(() => {
          if(error.response.data.status_code === 400){
            setLoginStatusMessage(error.response.data.results.errors[0].msg);
        }else{
            setLoginStatusMessage(error.response.data.message);
        }
            setLoading(false);
        }, 1000);
    });
    }
  };

  const renderForm = (
      <Box component="form" noValidate onSubmit={handleSubmit}>
        <Stack spacing={3}>
          <TextField
            required
            fullWidth
            autoFocus
            id="email"
            name="email"
            label="Email address"
            margin="normal"
            autoComplete="email"
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
          id="password"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            autoComplete="current-password"
            type={showPassword ? 'text' : 'password'}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'eva:eye-fill' : 'eva:eye-off-fill'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Stack>
     

      <Stack direction="row" alignItems="center" justifyContent="flex-end" sx={{ my: 3 }}>
        {/* <Link variant="subtitle2" underline="hover">
          Forgot password?
        </Link> */}
      </Stack>

      <LoadingButton
        fullWidth
        loading={loading}
        size="large"
        type="submit"
        variant="contained"
        sx={{ mb: 1 }}
      >
        Login
      </LoadingButton>

      <Typography variant="body2" sx={{ fontWeight: 600 }} color={loginStatus?"text.success":"error"} align="center">
        {loginStatusMessage}
      </Typography>
      </Box>
  );

  return (
    <Box
      sx={{
        ...bgGradient({
          color: alpha(theme.palette.background.default, 0.9),
          imgUrl: '/assets/background/overlay_4.jpg',
        }),
        height: 1,
      }}
    >
      <Logo
        sx={{
          position: 'fixed',
          top: { xs: 16, md: 24 },
          left: { xs: 16, md: 24 },
        }}
      />

      <Stack alignItems="center" justifyContent="center" sx={{ height: 1 }}>
        <Card
          sx={{
            p: 5,
            width: 1,
            maxWidth: 420,
          }}
        >
          <Typography variant="h4" component="div" my={3}>
            Login to Refex Contacts
          </Typography>

          {/* <Typography variant="body2" sx={{ mt: 2, mb: 5 }}>
            Don’t have an account?
            <Link variant="subtitle2" sx={{ ml: 0.5 }}>
              Get started
            </Link>
          </Typography>

          <Stack direction="row" spacing={2}>
            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{ borderColor: alpha(theme.palette.grey[500], 0.16) }}
            >
              <Iconify icon="eva:google-fill" color="#DF3E30" />
            </Button>

            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{ borderColor: alpha(theme.palette.grey[500], 0.16) }}
            >
              <Iconify icon="eva:facebook-fill" color="#1877F2" />
            </Button>

            <Button
              fullWidth
              size="large"
              color="inherit"
              variant="outlined"
              sx={{ borderColor: alpha(theme.palette.grey[500], 0.16) }}
            >
              <Iconify icon="eva:twitter-fill" color="#1C9CEA" />
            </Button>
          </Stack>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              OR
            </Typography>
          </Divider> */}

          {renderForm}
        </Card>
      </Stack>
      <Footer/>
    </Box>
  );
}
