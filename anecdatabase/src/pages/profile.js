import React, { Component } from "react";
import "../App.css";
import Card from "react-bootstrap/Card";
import Container from "react-bootstrap/Container";
import {
  auth,
  db,
  logout,
  storage,
} from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "@firebase/storage";
import { Button, Spinner } from "react-bootstrap";
import { getDoc, doc, updateDoc } from "firebase/firestore";

class Profile extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  async getUserData(userID) {
    const docRef = doc(db, "users", userID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      this.setState({
        username: docSnap.data().name,
        profile_pic_address: docSnap.data().profile_pic_address,
      });
      return docSnap.data().name;
    } else {
      alert("That User Got Deleted Or Does Not Exist.");
      return "GUEST";
    }
  }

  componentDidMount() {
    // this.getUserData(this.props.userID);
  }

  logOut() {
    logout();
    this.props.handleLogOut();
  }

  handleProfilePicChange = (e) => {
    if (e.target.files[0]) {
      this.setState({
        profilePicFile: e.target.files[0],
      });
    }
  };

  handleProfilePicUpload = async () => {
    const { profilePicFile } = this.state;

    if (profilePicFile) {
      // Create a storage reference
      const fileRef = ref(storage, `profile_pics/${auth.currentUser.uid}`);

      this.setState({uploadSpinner: <Spinner animation="border" role="status">
                                                      <span className="visually-hidden">Loading...</span>
                                                    </Spinner> });

      // Upload the file
      await uploadBytes(fileRef, profilePicFile).then(async (snapshot) => {
        getDownloadURL(snapshot.ref).then(async (downloadURL) => {
          console.log("File available at", downloadURL);

          // Get the download URL and update the state
          this.setState({ profilePicURL: downloadURL});

          // Update the user profile in Firestore with the new profile picture URL
          const usersRef = doc(db, "users", this.props.userID);
          await updateDoc(usersRef, {
            profile_pic_address: downloadURL,
          });

          // this.toggleEdit();
          this.setState({uploadSpinner: <>Upload Complete</>})
          alert("Profile Picture Uploaded!");
        });
      });
    }
  };

  render() {
    return (
      <>
        <div>
          <Container className="profile-container">
            <Card className="profile-pic-card">
              <Card.Img
                variant="top"
                src={
                this.state.profilePicURL || this.state.profile_pic_address
                }
                className="profile-pic"
              />
            </Card>
            <div className="profile-name">
              {this.state.username}
            </div>
              <Button className="logout-btn" onClick={() => this.logOut()}>
                Log Out
              </Button>
          </Container>
        </div>
        <hr
          style={{ width: "100vw", color: "black", marginBottom: "0px" }}
        ></hr>
      </>
    );
  }
}

export default Profile;