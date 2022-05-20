import React, {useState, useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import Select from 'react-select';
import { Button, Modal } from 'react-bootstrap';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import moment from 'moment';
import axios from 'axios';

import authUserObject from '../../middleware/authUserObject';
import Navbar from '../../components/navbar';
import img1 from './avatar_placeholder.png';
import './doctorSearch.css';


function DoctorSearch() {


    /**************************************************
                     Declarations
    ***************************************************/

    var userId = authUserObject.userID;

    var emptyDateError = false;
    var noTimeSelected = false;
    var noTypeSelected = false;

    var docTimeOffList = [];
    var availableTimeList = [];
    var displayTimeArray = [];

    var listOfTimes = [
        
        '9:00 a.m.', 
        '9:30 a.m.', 
        '10:00 a.m.', 
        '10:30 a.m.', 
        '11:00 a.m.', 
        '11:30 a.m.', 
        '12:00 p.m.', 
        '12:30 p.m.', 
        '1:00 p.m.', 
        '1:30 p.m.', 
        '2:00 p.m.', 
        '2:30 p.m.', 
        '3:00 p.m.', 
        '3:30 p.m.', 
        '4:00 p.m.', 
        '4:30 p.m.'
        
    ];

    let navigate = useNavigate();

    const [listOfDoctors, setListOfDoctors] = useState([]);
    const [foundApprovedDoc, setFoundApprovedDoc] = useState({});
    const [docPrimaryId,setDocPrimaryId] = useState("");
    const [selectedDoc, setSelectedDoc] = useState("");
    const [formatSelectedDate, setFormatSelectedDate] = React.useState("");
  
    const [fName,setFname] = React.useState("");
    const [lName,setLname] = React.useState("");

    const [date,setDate] = React.useState(new Date());
    const [currentTimeValue, setCurrentTimeValue] = useState(0);
    const [apptType, setApptType] = useState();
    
    const initialValues = { date: date, time: "", type: "" };
    const [formValues, setFormValues] = useState(initialValues);
    const [formErrors, setFormErrors] = useState({});
    
    const [modalOpen, setModalOpen] = React.useState(false);


    /**************************************************
                     Handlers
    ***************************************************/
    
    /*
        Every time a new doctor is added to the approved doctor list,
        find that the doctor does not exists in the doctors card list
        already. If so, don't add the doctor to the card list to be 
        displayed to the user. If the doctor is unique, add them to 
        the doctor card list. 

        This avoid duplication of doctor data or an additional card of 
        the same doctor. Especially if the doctor already exists as 
        the Primary Care Physician. 
    */
    useEffect(() => {
		
	    if (Object.keys(foundApprovedDoc).length > 0){

			let addDoctor = true;  
			
			listOfDoctors.forEach(e => {

                // The doctor must be unique to be included in the doctor card list
				if (e._id != undefined && e._id == foundApprovedDoc._id) {
					addDoctor = false; 
				}

			});
            
			if (addDoctor){
				setListOfDoctors([...listOfDoctors, foundApprovedDoc]);
			}

		}
		
	}, [foundApprovedDoc]);

    useEffect(() => {
        
        getPatientFullName();
        getPCP();
        getDocsByFamilyName();
        
    }, []);

    useEffect(() => {
        
        getDocTimeOff();
        
    }, [displayTimeArray]);


    /**************************************************
                    Non-Axios Functions
    ***************************************************/
    
    const handleChange = e => {
        
        setCurrentTimeValue(e.value);
        setField('time', e);

    }

    const setField = (field, value) => {
        setFormValues({
            ...formValues,
            [field]: value,
        })
    }

    const apptClick = (docName, primaryDocId) => {

        setSelectedDoc(docName);
        setDocPrimaryId(primaryDocId);
        showModal();

    }

    const dayClicked = ( event ) => {
        setDate(event);
    }
   
    const checkType = (e) => {

        const target = e.target;

        if (target.checked) {
            setApptType(target.value);
        } 

    };

    const validate = (values) => {

        const errors = {};
  
        if (!values.date || values.date === '') {
            errors.date = "Date selection is required";
            emptyDateError = true;
        }

        if (!currentTimeValue || currentTimeValue === '') {
            errors.time = "Time selection is required";
            noTimeSelected = true;
        }

        if (!apptType || apptType === '') {
            errors.type = "Selection of appointment type is required"
            noTypeSelected = true;
        }

        return errors;

    };

    const showModal = () => {
        setModalOpen(true);
    };

    const hideModal = () => {
        setModalOpen(false);
    };


    /**************************************************************************************************
        Axios Functions to retrieve approved doctors, their info, and to post a pending appointment 
    **************************************************************************************************/

    // Find the patients' full name by grabbing both their first and last names in the user info document
    const getPatientFullName = async () => {

        const resp = axios.get(`https://health-communications.herokuapp.com/users/getUserInfo/${userId}`);

        resp.then((response) => {
            setFname(response.data[0].firstName);
            setLname(response.data[0].lastName);
        })
        .catch((err) => {
            console.log("Cannot get patient's first and last name");
        });
    }

    /*
       Find the Primary Care Physician assigned to the patient. 

       Get the information of the patient's PCP and set the PCP to 
       be added to to the doctors card list for the patient to be 
       able to select.
    */
    const getPCP = async () => {

        const resp = axios.get(`https://health-communications.herokuapp.com/users/getUserInfo/${userId}`);

        resp.then((response) => {

            // Get PCP assigned to the patient
            let pcpId = response.data[0].pcpDoc;

            // Get PCP information and set new fields of the data for the doc. to be accessed and displayed
            return axios.get(`https://health-communications.herokuapp.com/doctors/getDoctorInfo/${pcpId}`)
            .then((response) => {

                let data = response.data[0];

                data["docId"] = data._id;
                data["fos"] = "My PCP Doctor";

                //Set the PCP with their info to be added to the doctors card list
                setFoundApprovedDoc(data);
    
            })
            .catch((err) => {
                console.log(err);
            });

        })
        .catch((err) => {
            console.log("Cannot get patient's user information");
        });

    }

    /*
       For each approved doctor family (or field of study) approved for the patient, get all
       doctors and their info for that family or study. 
       
       These doctors are therefore approved to be added to the doctors card list for the 
       patient to be able to select.

       These are all doctors that ARE NOT the Primary Care Physician.
    */
    const getDocsByFamilyName = async () => {

        // Get patient info
        const resp = axios.get(`https://health-communications.herokuapp.com/users/getUserInfo/${userId}`);

        resp.then((response) => {

            // Find the patient's list of approved doctor families (field of studies)
            let doctorStudyList = response.data[0].approvedDocFamilies;

            // Loop through this list to get all doctors specialized in each of these fields
            doctorStudyList.forEach(study => {
               
                return axios.get(`https://health-communications.herokuapp.com/doctors/getDocByFieldOfStudy/${study}`)
                .then((response) => {

                    let data = response.data;

                    // Get information of each approved doctor and set new fields of data for each doc. to be accessed and displayed
                    for(var i = 0; i < data.length; i++) {

                        data[i]["docId"] = data[i]._id;
                        data[i]["fos"] = data[i].fieldOfStudy;
    
                        //Set the approved doctor with their info to be added to the doctors card list 
                        setFoundApprovedDoc(data[i]);
                    }

                })
                .catch((err) => {
                    console.log(err);
                });
            })

        })
        .catch((err) => {
            console.log(err, userId);
        });

    }

    /*
       The date or day the patient selects is used in conjuction with the doctor id of the doctor selected to find
       all times scheduled off for the selected doctor (for that day) in the dates off document, so that a list 
       of times can be filtered to available times for the patient to choose. 
    */
    const getDocTimeOff = async () => {

        var tempFormatDaySelected = moment(date).format("MM-DD-YYYY");
        setFormatSelectedDate(tempFormatDaySelected);

        var timeOff = "";

        const resp = axios.get(`https://health-communications.herokuapp.com/schedule/getScheduled/${docPrimaryId}/${formatSelectedDate}`);

        resp.then((response) => {
            
            timeOff = response.data[0].time;

            if(timeOff === undefined) {

                for(var i = 0; i < listOfTimes.length; i++) {
                    displayTimeArray.push({'label': listOfTimes[i], 'value': listOfTimes[i]});
                }

            } else {

                for(var i = 0; i < timeOff.length; i++) {
                    docTimeOffList.push(timeOff[i]);
                }

                /* 
                   Times in the original time list are filtered out based on the times the doctor has off 
                   for the particular day chosen by the user.
                */
                availableTimeList = listOfTimes.filter(el=>!docTimeOffList.includes(el));

                for(var i = 0; i < availableTimeList.length; i++) {
                    displayTimeArray.push({'label': availableTimeList[i], 'value': availableTimeList[i]});
                }
                
            }   

        })
        .catch((err) => {
            console.log(err, userId);
        });

        
    }

    const handleClick = async e => {

        e.preventDefault();
        setFormErrors(validate(formValues));
        
        // If no validation errors exist, add a new appointment
        if(!emptyDateError && !noTimeSelected && !noTypeSelected) {

            axios.post('https://health-communications.herokuapp.com/appointments/addAppointment', {
                userID: userId,
                doctorID: docPrimaryId,
                firstname: fName,
                lastname: lName,
                date: formatSelectedDate,
                time: currentTimeValue,
                type: apptType,
                status: "Pending"
            });

            alert("Appointment successfully created!");
            setModalOpen(false);
            navigate('/homepage');

        }
  
    }


    return (
        
        <div className='dashboard-page-outer'>

            <div className='dashboard-page-inner'> 

                <Navbar/>

                <div className='Doctors-card' data-toggle="modal" data-target="#myModal">

                   
                    <div className="search-label"><h1>Find a Specialist</h1></div>
                    <div>
                        <Button className="back-button" href='/homepage'>Go Back</Button>
                    </div>

                    <div class="container">

                        <div class="row g-3">

                            { /* Display the doctors card list to the patient as doctor cards*/ }
                            {listOfDoctors.map((doctor, index) => {

                                return(
                
                                    <div className="col-4 col-md-4 col-lg-3 mx-0 mb-4" style={{padding: '15px'}}>
                                    
                                        <div className="card p-0 overflow-hidden h-100 shadow" style={{marginTop: '2vh'}}>

                                            { /* Doctor card */ }
                                            <img src={img1} className="card-img-top img-fluid" />
                                            <div className="card-body">
										
                                                <h5 className="card-title">{doctor.fullname}</h5>
                                                <ul className="card-text">{doctor.fos}</ul>

                                        
                                                <button className="nextButton" onClick={() => apptClick(doctor.fullname, doctor.docId)} >
                                                    Select
                                                </button>

                                                { /* Form for the patient to schedule an appointment with the selected doctor card */ }
                                                <Modal show={modalOpen} onHide={hideModal} size="lg" backdrop="static" centered>

                                                    <Modal.Header>
                                                        <Modal.Title>Schedule Your Appointment with {selectedDoc}</Modal.Title>
                                                    </Modal.Header>

                                                    <Modal.Body>

                                                        <h6>Click to select Date:</h6>
                                                        <div>
                                                            <DatePicker                            
                                                                selected={date}
                                                                value={formValues.date}
                                                                onChange={(e) => {
                                                                    dayClicked(e)
                                                                    setField('date', e)
                                                                }}  
                                                            />
                                                        </div>
                                                        <p>{formErrors.date}</p>

                                                        <h6>Select Available Time:</h6>
                                                        <Select 
                                                            options={displayTimeArray}
                                                            value={displayTimeArray.find(obj => obj.value === currentTimeValue)} 
                                                            onChange={handleChange}
                                                        />
                                                        <p>{formErrors.time}</p>

                                                        <h6>Select Appointment Type:</h6>
                                                        <input type="radio" value="person" checked={apptType == 'person'} onChange={e=>checkType(e)}  />
                                                        {" "}
                                                        <span>In Person</span>
                                                        <br/>
                                                        <input type="radio" value="online" checked={apptType == 'online'} onChange={e=>checkType(e)}/>
                                                        {" "}
                                                        <span>Online</span> 
                                                        <p>{formErrors.type}</p>                            
                                                    
                                                    </Modal.Body>
                                                    
                                                    <Modal.Footer>

                                                        <Button onClick={handleClick}>
                                                            Create
                                                        </Button>
                                                        
                                                        <button className="cancel-AppntModal" onClick={hideModal}>Cancel</button>
                                                    
                                                    </Modal.Footer>

                                                </Modal>
                                    
                                            </div>

                                        </div>
                
                                    </div>
                
                                )

                            })}

                        </div>

                    </div>

                </div>
                    
            </div>

        </div>
    );

}

export default DoctorSearch;