import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import { useState } from 'react';

export const ResponsiveDialog = () => {
  const [open, setOpen] = useState(false);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Pong Rules
      </Button>
      <Dialog
        fullScreen={fullScreen}
        open={open}
        onClose={handleClose}
        aria-labelledby="responsive-dialog-title"
      >
        <DialogTitle id="responsive-dialog-title">
          {"Pong Rules"}
        </DialogTitle>
        <DialogContent>
          This game is an online Pong where two players are going to
          do a match. <br />
          You have to send the ball to the opponent until he can send
          it back. If the ball touch your side, your opponent win the
          point. <br />
          The winner is the first player arrive at the number of points you define. <br />
          The number of but must be between 0 and 20.
          The keys to move the paddle are Z and S (azerty) or W and S (qwerty). <br />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} autoFocus>
            I get it !
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
