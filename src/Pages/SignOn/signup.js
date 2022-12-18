import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import Logo from './medical-logo.png';
import './signin.css';


function SignUp() {


    /**************************************************
                    Declarations
    ***************************************************/

    var firstNameError = false;
    var middleNameError = false;
    var lastNameError = false;
    var emailError = false;
    var passwordError = false;

    let navigate = useNavigate();

    const initialValues = { firstName: "", middleName: "", lastName: "", email: "", password: ""};
    const [userData, setUserData] = useState(initialValues);
    const [formErrors, setFormErrors] = useState({});

    
    /**************************************************
                    Functions
    ***************************************************/

    // Gather user input to create login credentials and for form validation
    const handleChange = e => {
      setUserData({...userData, [e.target.name]: e.target.value});
    }

    // Form validation
    const validate = (values) => {

      const errors = {};

      if (!values.firstName) {
        errors.firstName = "First name is required";
        firstNameError = true;
      }
      if (!values.middleName) {
        errors.middleName = "Middle name or initial is required";
        middleNameError = true;
      }
      if (!values.lastName) {
        errors.lastName = "Last name is required";
        lastNameError = true;
      }

      if (!values.email) {
        errors.email = "Email is required";
        emailError = true;
      } 

      if (!values.password) {
        errors.password = "Password is required";
        passwordError = true;
      } else if (values.password.length < 4) {
        errors.password = "Password must be more than 4 characters";
        passwordError = true;
      } else if (values.password.length > 10) {
        errors.password = "Password cannot exceed more than 10 characters";
        passwordError = true;
      }

      return errors;

    };

    const handleClick = async e => {

      e.preventDefault();

      // Form must be successfully validated before credentials can be created
      setFormErrors(validate(userData));

      /**********************************************************************************/
      

      /*
         Post newly created user login credentials to the back end.
         If the user doesn't already exists, create a new user or patient
         model with the created login credentials. 
         
         Default assign an empty Primary Care Physician for the new patient 
         along with an empty list of approved doctor families. Only the admin 
         or doctor user can actually edit the patient information to assign an
         actual PCP and list of approved doc. families to the patient. 
      */

      if(!firstNameError && !middleNameError && !lastNameError && !emailError && !passwordError) {
        
        const response = await axios.post('https://health-communications-backend.onrender.com/api/signup', { 

          data: userData, 
          pcpDoc: "", 
          approvedDocFamilies: []

        });

        const result = response.data;

        if(result.message == "Invalid email") {
            alert("Invalid email");
        } 
        
        else if(result.message == "User already exists") {
            alert("This user already exists");
        }
        
        else {

          alert("New user successfully created!");
          navigate('/');

        }

      }

    }


    return (
        
      <div className="main">
        <div className="main-inner2">
          <div>
            
            <img src ={Logo} alt='logo' className='company-logo'/>
            <div className='company-name'>HEALTH COMM.</div>
            <div><h1>Register</h1></div>

            <div className="firstName-container">
              <input onChange={handleChange} name="firstName" value={userData.firstName} type="text" placeholder="First Name" className="firstName"/>
           
            </div>
            <p>{formErrors.firstName}</p>

            <div className="middleName-container">
              <input onChange={handleChange} name="middleName" value={userData.middleName} type="text" placeholder="Middle Name" className="middleName"/>
           
            </div>
            <p>{formErrors.middleName}</p>

            <div className="lastName-container">
              <input onChange={handleChange} name="lastName" value={userData.lastName} type="text" placeholder="Last Name" className="lastName"/>
           
            </div>
            <p>{formErrors.lastName}</p>
            
            <div className="email-container">
              <input onChange={handleChange} name="email" value={userData.email} type="text" placeholder="Email" className="email"/>
           
            </div>
            <p>{formErrors.email}</p>

           
            <div className="password-container">
              <input onChange={handleChange} name="password" value={userData.password} type="password" placeholder="Password" className="password"/>
              
            </div>
            <p>{formErrors.password}</p>

            <div className="btn-container">
              <button onClick={handleClick} className='button-login'>Register</button>
            </div>


            <p className="link">
              <a href="/" className='link-signUp'>Sign In</a>
            </p>
            
          </div>
        </div>
      </div>
    );
}

export default SignUp;