import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import Copyright from '../components/Copyright';
import { FormEvent, useEffect, useState } from 'react';
import { changePageAction, signupAction } from '../redux/actions/userActions';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../redux';
import { UserState } from '../redux/reducers/userReducers';
import { Alert, Collapse, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

const theme = createTheme();

const SignUp = () => {
  const [firstname, setFirstname] = useState('')
  const [lastname, setLastname] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({ firstname: '', lastname: '', username: "", password: "" });
  const [open, setOpen] = useState(true);
  const [check, setCheck] = useState(false);
  const [errorFromBack, setErrorFromBack]: any = useState();

  const navigate = useNavigate();
  const dispatch = useDispatch()
  const userLogin = useSelector<RootState, UserState>(
    (state: RootState) => state.userLogin
  )
  const { userInfo } = userLogin

  useEffect(() => {
    if (userInfo !== undefined && userInfo.firstname) {
      navigate('/home');
    }
  }, [userInfo, navigate])

  const validate = () => {
    let temp = { ...errors }
    temp.firstname = firstname ? "" : "This field is required."
    temp.lastname = lastname ? "" : "This field is required."
    temp.username = username ? "" : "This field is required."
    temp.password = password ? "" : "This field is required."
    setErrors({
      ...temp
    })
  }

  const twoCalls = (function1: any, value: React.SetStateAction<string>, function2: any, value2: any) => {
    if (value.length > 0 && value.length < 21) {
      function1(value);
    }
    function2(value2);
  }

  const handleChangePage = async () => {
    dispatch(changePageAction())
    navigate("/login")
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    validate();
    setOpen(true);
    if (!errors.firstname && !errors.lastname && !errors.password && !errors.username) {
      dispatch(signupAction(firstname, lastname, username, password, navigate))
      setCheck(true)
      setErrorFromBack(userLogin.errorMessage)
    }
  };

  useEffect(() => {
    setErrorFromBack(userLogin.errorMessage)
    setCheck(false)
  }, [userLogin, check])

  return (
    <ThemeProvider theme={theme}>
      <Container component="main" maxWidth="xs">
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <LockOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Sign up
          </Typography>
          {errorFromBack ?
            <Collapse in={open}>
              <Alert
                variant="outlined"
                severity="error"
                action={
                  <IconButton
                    aria-label="close"
                    color="inherit"
                    size="small"
                    onClick={() => {
                      setOpen(false);
                    }}
                  >
                    <CloseIcon fontSize="inherit" />
                  </IconButton>
                }
                sx={{ mb: 2 }}
              >
                {errorFromBack}
              </Alert>
            </Collapse>
            :
            null
          }
          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoComplete="given-name"
                  name="firstname"
                  required
                  fullWidth
                  id="firstname"
                  label="First Name"
                  autoFocus
                  value={firstname}
                  onChange={(e) => twoCalls(setFirstname, (e.target.value), setErrors, ({ ...errors, firstname: '' }))}
                  error={errors.firstname ? true : false}
                  helperText={errors.firstname}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  id="lastname"
                  label="Last Name"
                  name="lastname"
                  autoComplete="family-name"
                  value={lastname}
                  onChange={(e) => twoCalls(setLastname, (e.target.value), setErrors, ({ ...errors, lastname: '' }))}
                  error={errors.lastname ? true : false}
                  helperText={errors.lastname}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="username"
                  label="Pseudo"
                  name="username"
                  autoComplete="username"
                  value={username}
                  onChange={(e) => twoCalls(setUsername, (e.target.value), setErrors, ({ ...errors, username: '' }))}
                  error={errors.username ? true : false}
                  helperText={errors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  name="password"
                  label="Password"
                  type="password"
                  id="password"
                  autoComplete="new-password"
                  value={password}
                  onChange={(e) => twoCalls(setPassword, (e.target.value), setErrors, ({ ...errors, password: '' }))}
                  error={errors.password ? true : false}
                  helperText={errors.password}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Button onClick={handleChangePage}>
                  Already have an account? Sign in
                </Button>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Copyright sx={{ mt: 5 }} />
      </Container>
    </ThemeProvider>
  );
}

export default SignUp