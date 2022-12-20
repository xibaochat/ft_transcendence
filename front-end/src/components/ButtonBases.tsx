import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { useNavigate } from 'react-router-dom';
import { Image, ImageBackdrop, ImageButton, ImageMarked, ImageSrc } from './Button';

const images = [
  {
    url: "./42_logo.jpg",
    title: 'Connect to 42',
    width: '40%',
    to: 'login'
  },
  {
    url: './cat_fond.jpg',
    title: 'Login',
    width: '30%',
  },
  {
    url: './dog_fond.jpg',
    title: 'Sign up',
    width: '30%',
  },
];

const ButtonBases = () => {
  const navigate = useNavigate();

  const login = async (image: String) => {
    if (image === 'Sign up')
      navigate('/signup');

    else if (image === 'Login')
      navigate('/login');

    else {

      const response = await fetch("https://api.intra.42.fr/oauth/authorize?client_id=3acff41a7763a408b9eb512a1da3831ffd002f9a9698fb1f285afcb08667b9ae&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fauth%2Fredirect&response_type=code"
      , { redirect: "manual"}
      // , {
      //   mode: 'no-cors',
      //   headers: {
      //     'Access-Control-Allow-Origin':'*'
      //   }
      // }
        );
      window.location.replace(response.url);
    }

  };

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', minWidth: 300, width: '100%' }}>
      {images.map((image) => (
        <ImageButton
          focusRipple
          key={image.title}
          style={{
            width: image.width,
          }}
          onClick={() => login(image.title)}
        >
          <ImageSrc style={{ backgroundImage: `url(${image.url})` }} />
          <ImageBackdrop className="MuiImageBackdrop-root" />
          <Image>
            <Typography
              component="span"
              variant="subtitle1"
              color="inherit"
              sx={{
                position: 'relative',
                p: 4,
                pt: 2,
                pb: (theme) => `calc(${theme.spacing(1)} + 6px)`,
              }}
            >
              {image.title}
              <ImageMarked className="MuiImageMarked-root" />
            </Typography>
          </Image>
        </ImageButton>
      ))}
    </Box>
  );
}

export default ButtonBases