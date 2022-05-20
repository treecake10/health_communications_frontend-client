import React from 'react';
import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import axios from "axios";
import SignIn from './Pages/SignOn/signin';
import SignUp from './Pages/SignOn/signup';
import Homepage from './Pages/Homepage/homepage';
import DoctorSearch from './Pages/Doctor/doctorSearch';
import { AuthContext } from './helpers/authContext';
import './App.css';


function App() {

  const [authState, setAuthState] = useState({

    firstName: "",
    id: 0, 
    status: false,

  });

  // Authenticate the user with the access token set in local storage
  useEffect(() => {

    /* 
      Verify the token. This is done by haveing a fetch
      request call a verification function in the back end.
    */ 
    axios.get("https://health-communications.herokuapp.com/api/protected", {
      headers: {
        accessToken: localStorage.getItem("accessToken"),
      },
    })
    .then((response) => {

      if (localStorage.getItem("accessToken")) {

        setAuthState({
          fistName: response.data.firstName,
          id: response.data.id,
          status: true,
        });

      }
       
    })
    
  }, []);


  return (

    <AuthContext.Provider value={{ authState, setAuthState}}>

      <Router>

        <div className="App">

            <Routes>   
              <Route exact path='/' element={< SignIn />}></Route>
              <Route exact path='/signup' element={< SignUp />}></Route>
              <Route exact path='/homepage' element={<Homepage />}></Route>
              <Route exact path='/doctorsearch' element={<DoctorSearch />}></Route>
            </Routes>
            
          </div>
            
        </Router>

    </AuthContext.Provider>

  );
}

export default App;
