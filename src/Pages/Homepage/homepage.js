import React, {useEffect, useState} from 'react';
import { Link } from 'react-router-dom';
import { Button } from 'react-bootstrap';

import axios from 'axios';
import moment from 'moment';

import { Add } from "@material-ui/icons";

import authUserObject from '../../middleware/authUserObject';
import Chevron from '../../components/chevron.js';
import Navbar from '../../components/navbar';

import './homepage.css';
import './Tabs.css';


function Homepage() {


    /**************************************************
                     Declarations
    ***************************************************/
    
    var userID = authUserObject.userID;

    const [upcomingAppointments, setUpcomingAppointments] = useState([]);
    const [pastAppointments, setPastAppointments] = useState([]);
    const [allOrNoUpcomingAppnts, setAllOrNoUpcomingAppnts] = useState([""]);
    const [allOrNoPastAppnts, setAllOrNoPastAppnts] = useState([""]);
    const [toggled, setToggled] = useState(false);
    const [toggleState, setToggleState] = useState(1);
    const [date, setDate] = React.useState(new Date());


    /**************************************************
                     Handler
    ***************************************************/

    useEffect(() => {

        getAppointments();

    }, []);

    useEffect(() => {

        if(upcomingAppointments.length === 0) {

            setAllOrNoUpcomingAppnts("No");
    
        } else if(upcomingAppointments.length >= 0) {
    
            setAllOrNoUpcomingAppnts("All");
    
        }

    }, [upcomingAppointments]);

    useEffect(() => {

        if(pastAppointments.length === 0) {

            setAllOrNoPastAppnts("No");
    
        } else if(pastAppointments.length >= 0) {
    
            setAllOrNoPastAppnts("All");
    
        }

    }, [pastAppointments]);


    /**************************************************
                    Non-Axios Functions
    ***************************************************/

    const toggleTab = (index) => {
        setToggleState(index);
    };

    const toggleAccordion = (index) => {

        if(toggled === index){
          return setToggled(null);
        }

        setToggled(index); 

    }


    /********************************************************************************************
            Axios Functions to get all appointments and their info created by the patient
    ********************************************************************************************/

    /*
        Retrieve all of the appointments scheduled by the patient. 
        Sort them by upcoming or past appointments.
    */
    const getAppointments = async () => {

        // Grab all appointment documents scheduled by the patient
        await axios.get(`https://health-communications.herokuapp.com/appointments/getAppointment/${userID}`)
        .then((response) => {

            // Array declarations for sorting dates 
            const past = [];
            const upcoming = [];
            

            // Find the current date as a point of comparison
            var currentDate = moment(date).format("MMDDYYYY");   
            
            
            if(response.data != "No appointments for the user") {
           
                // Loop through all appointments for the patient and sort them into upcoming or past appnt arrays
                for(let key in response.data) {        
                
                    /* 
                    Have the appointment date be formatted (for a temporary purpose) the same as the current date 
                    to compare and sort appnts.
                    */
                    var tempDate = response.data[key].date;
                    var appointmentDate = tempDate.substring(0, 2) + tempDate.substring(3, 5) + tempDate.substring(6, 10);

                    // Format time to end in 'AM or PM' to make date-time sorting possible
                    var tempTime = response.data[key].time;
                    const am_pm = tempTime.substr(tempTime.length - 4);
                    const formatted_AM_PM = am_pm.toUpperCase().replaceAll('.', '');

                    const hrMinLength = tempTime.length - 4;
                    const hr_min = tempTime.slice(0, hrMinLength - 1);
                    const timeResult = hr_min + " " + formatted_AM_PM;

                    // The time field for each appointment document for the patient temporarily contains the newly formatted time value
                    response.data[key].time = timeResult;

                    // Separate upcoming and past appnts
                    if(currentDate > appointmentDate) {

                        past.push(response.data[key]); 
                                
                    } 

                    if(currentDate <= appointmentDate) {

                        upcoming.push(response.data[key]);
                    
                    }
    
                }

            }

            // Ascending order date-time sort for upcoming appnts. Newest appnt is at the head of the list.
            const sortedUpcomingDateTime = upcoming.sort((a, b) => {

                const aDate = new Date(a.date + ' ' + a.time)
                const bDate = new Date(b.date + ' ' + b.time)
                
                return aDate - bDate;
            
            })

            // Descending order date-time sort for past appnts. Oldest appnt is at the tail of the list.
            const sortedPastDateTime = past.sort((a, b) => {

                const aDate = new Date(a.date + ' ' + a.time)
                const bDate = new Date(b.date + ' ' + b.time)
                
                return bDate - aDate;
            
            })

            // Set sorted upcoming and past appnts to be mapped and displayed
            setUpcomingAppointments(sortedUpcomingDateTime);
            setPastAppointments(sortedPastDateTime);

            // Allows the patient to view the doctor name for each appnt created
            setDoctorsNames(sortedUpcomingDateTime);
            setDoctorsNames(sortedPastDateTime);

            console.log(upcomingAppointments.length);
          
        })

        .catch((err) => {
            console.log(err, "Unable to get appointments");
        }, []);

    }

    /* 
       Get the full name of the doctor that the patient made an appointment with 
       by grabbing the doctor id found in each appointment document created by
       the patient
    */
    const setDoctorsNames = ( arrayData ) => {

        arrayData.forEach(e => {

            let docId = e.doctorID;

            axios.get(`https://health-communications.herokuapp.com/doctors/getDoctorInfo/${docId}`)
            .then((response) => {

                let data = response.data;

                let name = "";

                if (data[0]){
                    name = data[0].fullname;
                } else {
                    name = "Unknown";
                }

                // Add a new doctor name field temporarily for more appointment info to view
                e.doctorName = name;
                
            }).catch((err) => {
                console.log(err, "Unable to get doctor information");
            });

        })
        
    }
    

    return (

        <div className='dashboard-page-outer'>
            <div className='dashboard-page-inner'> 

                {/* Welcome message and logout btn */}
                <div className="top-homepage">
                    <Navbar/>
                </div>
                        
                {/* Create New button */}
                <Link to='/doctorsearch'>
                    <Button className="create-button">
                        <Add/>
                        {" "}
                        Create New 
                    </Button>
                </Link>

                {/* Tabs (Upcoming and Past) */}
                <div className="bloc-tabs">

                    <button className={toggleState === 1 ? "tabs active-tabs" : "tabs"} onClick={() => toggleTab(1)}>
                        Upcoming 
                    </button>

                    <button className={toggleState === 2 ? "tabs active-tabs" : "tabs"} onClick={() => toggleTab(2)}>
                        Past
                    </button>

                </div>


                <div className="content-tabs">


                    {/**********************************************
                            Upcoming Appointments Page
                    **********************************************/}
                    <div className={toggleState === 1 ? "content  active-content" : "content"}>

                        <h4>{`${allOrNoUpcomingAppnts}`} Upcoming Appointments</h4>
                        <hr/>

                        {upcomingAppointments.map((appointment, index) => {

                            var dateView = appointment.date;

                            return ( 

                                <div className="accordion1">
                                    
                                    {/* Accordion appnt header */}
                                    <div className="accordion1-header" onClick={() => toggleAccordion(index)} key={appointment.index}>
                                        <h5 className="date">{dateView}</h5>
                                        <h5 className="time">{appointment.time}</h5>
                                        <h5 className="status">Status: {appointment.status}</h5>
                                    
                                            {/* Expand appnt body arrow */}
                                            <div>
                                                {toggled === index ? 
                                                    <Chevron className="accordion__icon" width={15} fill="#FF5700"/> 
                                                    : <Chevron className="accordion__icon rotate" width={15} fill="#FF5700"/>
                                                }
                                            </div>
                                        
                                    </div>
                                    
                                    {/* Accordion appnt body */}
                                    {toggled === index && (
                                        <div className="flex accordion1-body">
                                        
                                            {/* More appnt information */}
                                            <div className="flex-items">
                                                <h5><b>Patient: </b> <i>{appointment.firstName} {" "} {appointment.lastName}</i></h5>
                                            </div>
                                            <div className="flex-items">
                                                <h5><b>Doctor: </b> <i>{appointment.doctorName}</i></h5>
                                            </div>
                                            <div className="flex-items">
                                                <h5><b>Type: </b> <i>{appointment.type}</i></h5>
                                            </div>
                                            
                                            
                                        </div>
                                    )}
                                </div> 
                            );
                        })}
                    </div>


                    {/**********************************************
                            Past Appointments Page
                    **********************************************/}
                    <div className={toggleState === 2 ? "content  active-content" : "content"}>

                        <h4>{`${allOrNoPastAppnts}`} Past Appointments</h4>
                        <hr />

                        {pastAppointments.map((appointment, index) => {

                            var dateView = appointment.date;

                            return (                                
                                <div className="accordion1">
                                
                                    {/* Accordion appnt header */}
                                    <div className="accordion1-header" onClick={() => toggleAccordion(index)} key={appointment.index}>
                                        <h5 className="date">{dateView}</h5>
                                        <h5 className="time">{appointment.time}</h5>
                                        <h5 className="status">Status: {appointment.status}</h5>
                                    
                                        {/* Expand appnt body arrow */}
                                        <div>
                                            {toggled === index ? 
                                                <Chevron className="accordion__icon" width={15} fill="#FF5700"/> 
                                                : <Chevron className="accordion__icon rotate" width={15} fill="#FF5700"/>
                                            }
                                        </div>
                                    
                                    </div>
                                
                                    {/* Accordion appnt body */}
                                    {toggled === index && (

                                        <div className="flex accordion1-body">

                                           {/* More appointment information */}
                                           <div className="flex-items">
                                                <h5><b>Patient: </b> <i>{appointment.firstName} {" "} {appointment.lastName}</i></h5>
                                            </div>
                                            <div className="flex-items">
                                                <h5><b>Doctor: </b> <i>{appointment.doctorName}</i></h5>
                                            </div>
                                            <div className="flex-items">
                                                <h5><b>Type: </b> <i>{appointment.type}</i></h5>
                                            </div>  
                                        
                                        </div>
                                    )}
                            
                                </div> 
                            );
                        })} 
                    
                        
                    </div>
                </div>
            </div>
        </div>
        
    )
}

export default Homepage;