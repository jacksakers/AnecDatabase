import Container from "react-bootstrap/Container";
import Navbar from "react-bootstrap/Navbar";
import logo from "../images/logo.png";
import profileIcon from "../images/profile icon.png";
import { Nav } from "react-bootstrap";
import React from "react";

class NewNavbar extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      profile_pic_address: ""
    };
  }

  getProfilePic() {
    if (this.state.profile_pic_address !== "" && this.state.profile_pic_address) {
      return <img src={this.state.profile_pic_address} className="nav-profile-pic" alt="profile" />;
    } else {
      return <img src={profileIcon} width="50vw" alt="profile" />
    }
  }

  render() {
    return (
        <Navbar expand="lg" style={{ marginBottom: "0%" }}>
          <Container>
            <Navbar.Brand>
              <div
                onClick={() => {
                  this.props.switchPageTo("find");
                }}
              >
                <img src={logo} width="45%" height="45%" alt="logo" />
              </div>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav className="me-auto">
                <Nav.Link
                  onClick={() => {
                    this.props.switchPageTo("find");
                  }}
                >
                  Find
                </Nav.Link>
                <Nav.Link
                  onClick={() => {
                    this.props.switchPageTo("my-events");
                  }}
                >
                  My Events
                </Nav.Link>
                <Nav.Link
                  onClick={() => {
                    this.props.switchPageTo("create");
                  }}
                >
                  Create
                </Nav.Link>
              </Nav>
            </Navbar.Collapse>
            
            <Navbar.Collapse className="justify-content-end">
              <div
                onClick={() => {
                  this.props.switchPageTo("login");
                }}
              >
                {this.getProfilePic()}
              </div>
            </Navbar.Collapse>
          </Container>
        </Navbar>
    );
  }
}

export default NewNavbar;