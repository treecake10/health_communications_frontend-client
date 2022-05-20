import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Logo from './medical-logo.png';
import './signin.css';


function SignIn() {


    /**************************************************
                    Declarations
    ***************************************************/

    var emailError = false;
    var passwordError = false;

    let navigate = useNavigate();

    const initialValues = { email: "", password: "" };
    const [formValues, setFormValues] = useState(initialValues);
    const [formErrors, setFormErrors] = useState({});

    const [userData, setUserData] = useState({
      firstName: "",
      id: 0,
      status: false,
    });


    /**************************************************
                    Functions
    ***************************************************/
    
    // Gather user input for both login credentials and form validation
    const handleChange = e => {

      setUserData({...userData, [e.target.name]: e.target.value});
      setFormValues({...formValues, [e.target.name]: e.target.value});

    }

    // Form validation
    const validate = (values) => {

      const errors = {};

      if (!values.email) {
        errors.email = "Email is required";
        emailError = true;
      } 

      if (!values.password) {
        errors.password = "Password is required";
        passwordError = true;
      } 
      
      return errors;

    };

    const handleClick = async e => {

      e.preventDefault();

      // Form must be successfully validated before successfully logging in
      setFormErrors(validate(formValues));
      
      /**********************************************************************************/


      /*
         Post user input login credentials to find an existing user and password match.

         If there is a password match, create a payload, token secret, and expiry time. 
         Then include all of this in a jwt token and sign it.
      */

      if(!emailError && !passwordError) {

        const response = await axios.post('https://health-communications.herokuapp.com/api/signin', { data: userData });
        
        const result = response.data;

        if(result.message == "Invalid email") {
          alert("Invalid email");
        }

        else if(result.message == "Incorrect credentials") {
          alert("Incorrect credentials");
        } 

        else if(result.message == "Incorrect password") {
          alert("Incorrect password");
        }
        
        else {

          /* 
            If the login credentials are correct, store the JWT in local storage as an access token 
            along with other user information for access
          */

          localStorage.setItem("accessToken", response.data.token);
          localStorage.setItem("firstName", result.firstName);
          localStorage.setItem("userID", result.id);

      
          navigate('/homepage');

          window.location.reload();

        }

        setFormValues({ email: "", password: "" });

      }

    }
  

    return (
        
      <div className="main">
        <div className="main-inner1">
          <div>
            
            <img src ={Logo} alt='logo' className='company-logo'/>
            <div className='company-name'>HEALTH COMM.</div>
            <div><h1>Login</h1></div>
            
            <div className="email-container">
              <input onChange={handleChange} name="email" value={formValues.email} type="text" placeholder="Email" className="email"/>
            </div>
            <p>{formErrors.email}</p>

           
            <div className="password-container">
              <input onChange={handleChange} name="password" value={formValues.password} type="password" placeholder="Password" className="password"/>
            </div>
            <p>{formErrors.password}</p>


            <div className="btn-container">
              <button className="button-login" onClick={handleClick}>Login</button>
            </div>

            <p className="link">
              <a href="/signup" className='link-signUp'>Sign Up</a>
            </p>
            
          </div>
        </div>
      </div>

    );

}

export default SignIn;