import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';

import { AppBar, Toolbar, Typography } from "@mui/material";
import { makeStyles } from "@material-ui/core/styles";
import { ExitToApp } from "@material-ui/icons";

import { AuthContext } from '../helpers/authContext';


const useStyles = makeStyles((theme) => ({

    root: {
        backgroundColor: "#343434"
    }

}));


const Navbar = () => {


    let navigate = useNavigate();

    const {setAuthState} = useContext(AuthContext);

    const classes = useStyles();


    const logout = () => {

        var lougoutIsTrue = window.confirm("Are you sure you want to logout?");

        if(lougoutIsTrue == true) {

            localStorage.removeItem("accessToken");
            localStorage.removeItem("firstName");
            localStorage.removeItem("userID");
        
            setAuthState({ ...setAuthState, status: false });
            navigate('/');

        }

    }

    return (

        <AppBar position="static">

            <Toolbar classes={{root: classes.root }} style={{display: 'flex', justifyContent:"space-between"}}>

                <Typography variant="h6">
                    Health Communications
                </Typography>

                <div style={{display: 'flex'}}>
                    
                    <div style={{ fontWeight: 'bold', fontSize: '20px', marginRight: '30px' }}>
                        {"Welcome, "}{localStorage.getItem("firstName")}
                    </div>

                    <div style={{  marginRight: '10px' }}>
                        <ExitToApp/>
                    </div>

                    <div style={{ fontSize: '20px' }} onClick={logout}>
                        <button style={{backgroundColor: 'transparent', color: 'white'}}>{"Logout"}</button>
                    </div>

                </div>

            </Toolbar>

        </AppBar>

    );

};


export default Navbar;