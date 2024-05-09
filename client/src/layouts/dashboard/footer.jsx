import { Stack } from "@mui/material";
import { styled } from '@mui/material/styles';
// @mui
import Typography from "@mui/material/Typography";

const FooterBox=styled('footer')(({ theme }) => ({
  flexGrow: 1,
  overflow: 'auto',
  height: theme.spacing(10),
  paddingTop:30,
  backgroundColor:'inherit'
}));

export default function Footer (){

  return (
    <FooterBox>
        <Stack
             direction="row"
             justifyContent="center"
        >
        <Typography color='text.disabled'>
            Designed&nbsp;&&nbsp;Developed&nbsp;by&nbsp;<a href="https://www.refex.co.in/" target="_blank" rel="noopener noreferrer" style={{color:'inherit' }}>
             Refex IT
             </a>
             &nbsp;© {new Date().getFullYear()}
        </Typography>
        </Stack>
    </FooterBox>
  );
};
