import React, { Component } from "react";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import { Button, Spinner } from "react-bootstrap";
import {
  collection,
  query,
  getDocs,
  where,
  setDoc,
  doc
} from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Dropdown from 'react-bootstrap/Dropdown';
import CreatableSelect from 'react-select/creatable';
import { onAuthStateChanged } from "firebase/auth";
import makeid from "../components/makeid.js";
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(
  "AI KEY"
);

// Util function; takes user image file, uploads to firebase storage, and returns
// promise for a image url
async function uploadImageAndGetURL(file) {
  return new Promise((resolve, reject) => {
    if (file.size > 25000000) {
      reject("Upload file less than 25 mb!!");
    }

    let storage = getStorage();
    let imageRef = ref(storage, "event_pics/" + file.name);

    uploadBytes(imageRef, file)
      .then((snapshot) => {
        console.log("Successfully uploaded image: " + file.name);
        imageRef = ref(storage, "event/" + file.name);
        getDownloadURL(ref(storage, "event_pics/" + file.name))
          .then((url) => {
            resolve(url);
          })
          .catch((e) => {
            reject(e);
          });
      })
      .catch((e) => {
        reject(e);
      });
  });
}

//Create
//Handles the creation of an event
//Pushes the event to firebase
class Create extends Component {
  constructor(eventdata) {
    super(eventdata);
    this.state = {
      date: "",
      description: "",
      header_img_addr: "",
      logo_img_addr: "",
      location: "",
      era: "",
      //photos: [],
      private: false,
      tags: [],
      title: "",
      //users: [],
      uploadSpinner: <></>,
      formElements: <></>,
      anecdatumType: "Anecdatum Type",
      locationList: [],
      eraList: [],
      memoryDescription: ""
    };
  }

  handlePublic = () => {
    if ((this.state.private === true)) this.setState({private: false});
  };

  onTitleChange(e) {
    this.setState({ title: e.target.value });
  }

  onDateChange = (date_data) => {
    const dateSelected = date_data.target.value;
    this.setState({in_date: dateSelected})
    var date_ = ""
    if (this.state.in_time) {
      date_ = new Date(`${this.state.in_date}T${this.state.in_time}`);
    } else {
      date_ = new Date(`${this.state.in_date}T12:00:00`);
    }
    console.log(date_);
    this.setState({ date: date_ });
  };

  onTimeChange = (time_data) => {
    const timeSelected = time_data.target.value;
    this.setState({in_time: timeSelected})
    var time_ = ""
    if (this.state.in_date) {
      time_ = new Date(`${this.state.in_date}T${this.state.in_time}`)
      console.log(time_)
      this.setState({ date: time_})
    } else {
      prompt("Please Enter A Date First")
    }
  }

  async onLocationChange(opt) {
    if (opt.__isNew__) {
      const datum = {
        anecdatumType: "Place",
        title: opt.label,
        creator: auth.currentUser.uid
      }
      const docId = await this.uploadDatum(datum);
      this.setState({ location: `${docId}+-+${opt.label}` });
    } else {
      this.setState({ location: `${opt.docId}+-+${opt.label}` });
    }
  }

  async onEraChange(opt) {
    if (opt.__isNew__) {
      const datum = {
        anecdatumType: "Era",
        title: opt.label,
        creator: auth.currentUser.uid
      }
      const docId = await this.uploadDatum(datum);
      this.setState({ era: `${docId}+-+${opt.label}` });
    } else {
      this.setState({ era: `${opt.docId}+-+${opt.label}` });
    }
  }

  onDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  async onHeaderImageChange(e) {
    // makes the upload button display a spinner
    this.setState({uploadSpinner: <Spinner animation="border" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </Spinner> });

    await uploadImageAndGetURL(e.target.files[0])
      .then((url) => {
        console.log("uploaded header and got download url: " + url);
        this.setState({ header_img_addr: url });
      })
      .catch((e) => {
        console.log(e);
      });

    // reset upload button
    this.setState({uploadSpinner: <></>})
  }

  async onLogoImageChange(e) {
    // makes the upload button display a spinner
    this.setState({uploadSpinner: <Spinner animation="border" role="status">
                                  <span className="visually-hidden">Loading...</span>
                                </Spinner> });
    await uploadImageAndGetURL(e.target.files[0])
      .then((url) => {
        console.log("uploaded logo and got download url: " + url);
        this.setState({ logo_img_addr: url });
      })
      .catch((e) => {
        console.log(e);
      });
    
    // reset upload button
    this.setState({uploadSpinner: <></>});
  }

  async uploadDatum(datum) {
    const docId = makeid(8);
    const datumRef = doc(db, `${datum.type}`, `${docId}+-+${datum.title.replace(/\//g, '')}`);
    // attempt to upload to firebase
    if (datum.era) {
      if (datum.era.split("+-+").length > 2) {
        datum.era = datum.era.split("+-+")[0] + "+-+" + datum.era.split("+-+")[1];
      }
    }
    if (datum.location) {
      if (datum.location.split("+-+").length > 2) {
        datum.location = datum.location.split("+-+")[0] + "+-+" + datum.location.split("+-+")[1];
      }
    }
    await setDoc(datumRef, {
      creator: datum.creator ? datum.creator : "",
      date: datum.date ? datum.date : "",
      description: datum.description ? datum.description : "",
      location: datum.location ? datum.location : "",
      era: datum.era ? datum.era : "",
      photos: [],
      title: datum.title ? datum.title : "",
      docId: docId
    });
    return `${docId}+-+${datum.title}`;
  }

  // attempts to upload new event to firebase after data validation
  handleSubmit = async (e) => {
    if (e) e.preventDefault();

    // user must submit a valid title, date, and location
    if (!this.state.title.trim()) {
      toast.error('Please ensure your datum has a title or name', {
        position: "top-center",
        autoClose: 2500,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "dark",
      });
      return;
    }
    
    let datum = {
      anecdatumType: this.state.anecdatumType,
      creator: auth.currentUser.uid,
      date: this.state.date,
      description: this.state.description,
      header_img_addr: this.state.header_img_addr,
      logo_img_addr: this.state.logo_img_addr,
      location: this.state.location,
      era: this.state.era,
      photos: [],
      title: this.state.title,
    }
    // attempt to upload to firebase
    try {
      const docId = this.uploadDatum(datum);
      this.handleDatumCreated(docId);
    } catch (error) {
      console.error(error.message);
    }
  };

  handleDatumCreated() {
    toast.success('Datum Created!', {
      position: "top-center",
      autoClose: 2500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
    this.setState({
      date: "",
      description: "",
      header_img_addr: "",
      logo_img_addr: "",
      location: "",
      private: false,
      tags: [],
      title: "",
      uploadSpinner: <></>,
      formElements: <></>,
      anecdatumType: "Anecdatum Type"
    })
    this.getData();
  }

  async getData() {
    const locationQ = query(collection(db, "Place"), where("creator", "==", auth.currentUser.uid));
    const querySnapshot = await getDocs(locationQ);
    let _locationList = [];
    querySnapshot.forEach((doc) => {
      let locationName = doc.data().title;
      _locationList.push({label: locationName, docId: doc.id.split('+-+')[0]});
    });
    const eraQ = query(collection(db, "Era"), where("creator", "==", auth.currentUser.uid));
    const querySnapshot2 = await getDocs(eraQ);
    let _eraList = [];
    querySnapshot2.forEach((doc) => {
      let eraName = doc.data().title;
      _eraList.push({label: eraName, docId: doc.id.split('+-+')[0]});
    });
    this.setState({locationList: _locationList, eraList: _eraList});
  }

  async populateForm(arrayOfInputs) {
    let returnElem = [];
    arrayOfInputs.forEach(async (inputType) =>  {
        switch (inputType) {
          case "title":
              returnElem.push(
                <div className="form-control-create">
                <Form.Group controlId="formCreate">
                    <Form.Control
                    className="create-title"
                    aria-label="Title"
                    maxLength={100}
                    placeholder="Enter a Title"
                    onChange={(e) => this.onTitleChange(e)}
                    />
                </Form.Group>
                </div>
              );
              break;
          case "name":
              returnElem.push(
                <div className="form-control-create">
                <Form.Group controlId="formCreate">
                    <Form.Control
                    className="create-title"
                    aria-label="Name"
                    maxLength={100}
                    placeholder="Enter a Name"
                    onChange={(e) => this.onTitleChange(e)}
                    />
                </Form.Group>
                </div>
              );
              break;
          case "location":
            returnElem.push(
              <div className="form-control-create">
              <CreatableSelect
                  options={this.state.locationList}
                  onChange={opt => this.onLocationChange(opt)}
                  placeholder="Select or Enter Location"
                  />
              </div>
            );
            break;
          case "date":
            returnElem.push(
              <div className="form-control-create">
                <Form.Group>
                  <Form.Control
                    className="create-date"
                    type="date"
                    onChange={(date_data) => this.onDateChange(date_data)}
                  />
                  <Form.Control
                    className="create-time"
                    type="time"
                    onChange={(time_data) => this.onTimeChange(time_data)}
                  />
                </Form.Group>
              </div>
            )
            break;
          case "description":
            returnElem.push(
              <div className="form-control-create">
                <Form.Control
                  className="create-description"
                  as="textarea"
                  maxLength={1500}
                  style={{height: '150px'}}
                  placeholder="Enter a Description"
                  onChange={(e) => this.onDescriptionChange(e)}
                />
              </div>
            )
            break;
          case "era":
            returnElem.push(
              <div className="form-control-create">
                <CreatableSelect
                  options={this.state.eraList}
                  onChange={opt => this.onEraChange(opt)}
                  placeholder="Select or Enter Era"
                  />
              </div>
            )
            break;
          default:
            break;
        }
    });
    return <Form
                className="create-event-form home-background"
                onSubmit={this.handleSubmit}
            >
            <div className="create-text-input">
                {returnElem}    
            </div>
            <div className="create-settings-div">
              <div className="create-btn">
                <Button
                  type="submit"
                  className="create-submit-btn"
                  onClick={() => console.log("Submit Btn")}
                >
                  Create Datum
                </Button>
              </div>
            </div>
          </Form>;
  }

  componentDidMount() {
    onAuthStateChanged(auth, (user) => {
      if (user) {
        this.getData();
      }
    });
  }

  async renderForm(type) {
    switch (type) {
        case "Era":
            this.setState({anecdatumType: type,
              formElements: await this.populateForm(["title", "date", "description", "location"])});
              break;
        case "Event":
            this.setState({anecdatumType: type,
              formElements: await this.populateForm(["title", "date", "description", "location", "era"])});
              break;
        case "Person":
            this.setState({anecdatumType: type,
              formElements: await this.populateForm(["name", "description", "era"])});
              break;
        case "Place":
            this.setState({anecdatumType: type,
              formElements: await this.populateForm(["title", "description", "location", "era"])});
              break;
        case "Update":
            this.setState({anecdatumType: type,
              formElements: await this.populateForm(["title", "date", "description", "location", "era"])});
              break;
        default:
            break;
    }
  }

  onMemoryDescriptionChange(e) {
    this.setState({ memoryDescription: e.target.value });
  }

  processResponse(response) {
    let processedResponse = "";
    const text = response.text();
    // remove anything from the response that is not JSON
    if (text.includes("```JSON")) {
      processedResponse = text.split("```JSON")[1];
    } else if (text.includes("``` JSON")) {
      processedResponse = text.split("```json")[1];
    } else if (text.includes("```json")) {
      processedResponse = text.split("```json")[1];
    } else if (text.includes("```")) {
      processedResponse = text.split("```")[1];
    }

    if (processedResponse.includes("```")) {
      processedResponse = processedResponse.split("```")[0];
      console.log(processedResponse);
    }
    return processedResponse;
  }

  async getResponseForGivenPrompt(prompt) {
    try{
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prePrompt = "Return just a JSON object that has the following fields filled out based on the given prompt: " +
      "date: the date of the prompt, description: a description of the prompt (required), era: the era of life that the prompt may have happened (required), " +
      "location: the location of where the prompt happened (required), title: a short title or name of the prompt (required), " + 
      "type: the type of prompt (options are Event, Place, Person, or Update)(required). " +
      "Here is the prompt: ";
      const result = await model.generateContent(prePrompt + prompt);
      const response = await result.response;
      const text = await response.text();
      this.setState({
        response, 
        text
      });
      const processedResponse = this.processResponse(response);
      const datum = JSON.parse(processedResponse);
      datum.creator = auth.currentUser.uid;
      datum.era = "ai+-+AI Created";
      console.log(datum);
      // attempt to upload to firebase
      try {
        const docId = this.uploadDatum(datum);
        this.handleDatumCreated(docId);
      } catch (error) {
        console.error(error.message);
      }
    }
    catch(error){
      console.log(error);
    }
  }

  render() {
    return (
      <>
        <ToastContainer
          position="top-center"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="dark"
        />
        <Card>
            <Dropdown>
                <Dropdown.Toggle id="type-dropdown">
                    {this.state.anecdatumType}
                </Dropdown.Toggle>
                <Dropdown.Menu>
                    <Dropdown.Item onClick={async () => await this.renderForm("Era")}>Era</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.renderForm("Event")}>Event</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.renderForm("Person")}>Person</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.renderForm("Place")}>Place</Dropdown.Item>
                    <Dropdown.Item onClick={() => this.renderForm("Update")}>Update</Dropdown.Item>
                </Dropdown.Menu>
            </Dropdown>
            {this.state.formElements}
            <Form.Group controlId="formMemoryDescription">
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Enter a description of a memory"
                onChange={(e) => this.onMemoryDescriptionChange(e)}
              />
              <Button
                variant="primary"
                onClick={() => this.getResponseForGivenPrompt(this.state.memoryDescription)}
              >
                Submit Memory Description
              </Button>
            </Form.Group>
        </Card>
      </>
    );
  }
}

export default Create;
