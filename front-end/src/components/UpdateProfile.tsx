import "../styles/profileContainerStyles.css";
import { Button, Grid, TextField } from "@mui/material";
import { FormEvent, useEffect, useState } from "react";
import { Box } from "@mui/system";
import { deleteAccountAction, updateAction, uploadImageAction } from "../redux/actions/userActions";
import { useDispatch, useSelector } from "react-redux";
import { CustomizedSnackbars } from "./CustomizedSnackbars";
import { useNavigate, useParams } from "react-router-dom";
import { UserState } from "../redux/reducers/userReducers";
import { RootState } from "../redux";

export const UpdateProfile = ({ userInfo }: UserState) => {
    const [firstname, setFirstname] = useState(userInfo?.firstname)
    const [lastname, setLastname] = useState(userInfo?.lastname)
    const [username, setUsername] = useState(userInfo?.username)
    const [oldUsername, setOldUsername] = useState(userInfo?.username)
    const [open, setOpen] = useState(false);
    const [snackbars, setSnackbars] = useState(false);
    const [message, setMessage] = useState("Your profile has been successfully updated!");
    const { id } = useParams();
    const [displayImg, setDisplayImg] = useState(true)
    const [profileImg, setProfileImg] = useState('')
    // const [profileImgType, setProfileImgType] = useState('')
    const dispatch = useDispatch()
    const [isValidFileFormat, setIsValidFileFormat] = useState(true);
    const userLogin = useSelector<RootState, UserState>(
        (state: RootState) => state.userLogin
    )
    const navigate = useNavigate();

    useEffect(() => {
        if (userLogin.errorMessage) {
            setMessage("There has been an error while updating your profile.");
            setUsername(oldUsername)
        } else {
            setOldUsername(username);
        }
    }, [userLogin.errorMessage, oldUsername, username])

    if (!userInfo)
        return <h1>Loading...</h1>;

    const onFileChange = (e: any) => {
        if (e.target.files[0].type !== 'image/png') {
            alert('[Warning] Only PNG files are supported.');
            setIsValidFileFormat(false);
        }
        else {
            setIsValidFileFormat(true);
            setProfileImg(e.target.files[0])
        }
    }

    const uploadImage = () => {
        dispatch(uploadImageAction(profileImg, userInfo.access_token));
        setDisplayImg(true)
        setOpen(false);
    }

    const handleClickOpen = () => {
        setOpen(true);
        setSnackbars(false);
    };

    const handleClickDelete = () => {
        setOpen(true);
        setSnackbars(true);
        setMessage("Your account has been successfully delete.");
        dispatch(deleteAccountAction(userInfo.access_token, userInfo.id, navigate));
    };

    const changeImage = () => {
        setOpen(true);
        setDisplayImg(false);
        setSnackbars(false);
    };


    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (isValidFileFormat === false) {
            alert('[ERROR] Invalid file format. Only PNG is supported.');
            return;
        }
        setOpen(false);
        if (userInfo && firstname !== '' && lastname !== '' && username !== '') {
            dispatch(updateAction(firstname, lastname, username, userInfo.id, userInfo.avatar, userInfo.status, userInfo.access_token, userInfo.friends))
            setSnackbars(true);
            setMessage("Your profile has been successfully updated!");
        }
        setDisplayImg(true);
    }

    const twoCalls = (function1: any, target: any) => {
        if (target.length > 0 && target.length < 21)
            function1(target)
    }

    return (
        <div>
            {!open ?
                <div>
                    {snackbars ?
                        //  message={userLogin.errorMessage} 
                        <CustomizedSnackbars status={message} />
                        :
                        null
                    }
                    <div>
                        <Button onClick={changeImage} >
                            <img src={userInfo.avatar} alt="Profile avatar" className="userImage" />
                        </Button>
                        <h1 className="userName">{userInfo.username}</h1>
                        <h3 className="userNickName">{userInfo.login42}</h3>
                        <h5 className="userNickName">{userInfo.firstname}</h5>
                        <h5 className="userNickName">{userInfo.lastname}</h5>
                        {!id ?
                            <div>
                                <Button onClick={handleClickOpen} >
                                    Edit Profile
                                </Button>
                                <br />
                                {userInfo.status === "online" ?
                                    <Button onClick={handleClickDelete} >
                                        Delete Account
                                    </Button>
                                    :
                                    null
                                }
                            </div>
                            :
                            null
                        }
                    </div>
                </div>
                :
                !displayImg ?
                    <div>
                        <div className="form-group">
                            <input type="file" onChange={onFileChange} accept=".png" />
                        </div>
                        <div className="form-group">
                            <button className="btn btn-primary"
                                onClick={() => {
                                    if (isValidFileFormat === false) {
                                        alert('[ERROR] Invalid file format. Only PNG is supported.');
                                    }
                                    else {
                                        uploadImage()
                                    }
                                }}
                            >
                                Upload
                            </button>
                        </div>
                    </div>
                    :
                    <div>
                        <Box
                            component="form"
                            onSubmit={handleSubmit}
                            noValidate
                            sx={{ mt: 3 }}
                        >
                            <Grid container spacing={2}>
                                {/* <input type="file" name="image" placeholder='Image' onChange={e => handleSetImage(e)} /> */}
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
                                        onChange={(e) => twoCalls(setFirstname, e.target.value)}
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
                                        onChange={(e) => twoCalls(setLastname, e.target.value)}
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
                                        onChange={(e) => twoCalls(setUsername, e.target.value)}
                                    />
                                </Grid>
                            </Grid>
                            <Button
                                type="submit"
                                fullWidth
                                variant="contained"
                                sx={{ mt: 3, mb: 2 }}
                            >
                                Validate change
                            </Button>
                        </Box>
                    </div>
            }
        </div>
    );
};