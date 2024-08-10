import React, { Component } from "react";
import "../App.css";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import Container from "react-bootstrap/Container";
import {
  auth,
  registerWithEmailAndPassword,
  logInWithEmailAndPassword,
  db,
  signInWithGoogle,
} from "../firebase";
import { Button } from "react-bootstrap";
import { getDoc, doc } from "firebase/firestore";

class LogIn extends Component {
  constructor(props) {
    super(props);
    this.state = {
      newUser: false,
      email: "",
      password: "",
      cPassword: "",
      first: "",
      last: "",
    };
  }

  async componentDidMount() {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      // This function will be called whenever the authentication state changes
      // this.props.didLogIn(user);
    });

    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }

  onEChange(e) {
    this.setState({ email: e.target.value });
  }

  onPChange(e) {
    this.setState({ password: e.target.value });
  }

  onCPChange(e) {
    this.setState({ cPassword: e.target.value });
  }

  onFChange(e) {
    this.setState({ first: e.target.value });
  }

  onLChange(e) {
    this.setState({ last: e.target.value });
  }

  async onLogInSubmit(e) {
    e.preventDefault();
    let _password = this.state.password;
    await logInWithEmailAndPassword(this.state.email, _password);
    if (auth.currentUser) this.props.didLogIn(await this.getUserName());
  }

  async getUserName() {
    const docRef = doc(db, "users", auth.currentUser.uid);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data().name;
    } else {
      return "GUEST";
    }
  }

  async onSignUpSubmit(e) {
    e.preventDefault();
    let email = this.state.email;
    let password = this.state.password;
    let name = this.state.first + " " + this.state.last;
    if (this.state.password !== this.state.cPassword) {
      alert("Whoops, the passwords do not match!");
      return;
    }
    await registerWithEmailAndPassword(name, email, password);
    // if (auth.currentUser) this.props.didLogIn(name);
  }

  LogInForm() {
    return (
      <Form onSubmit={(e) => this.onLogInSubmit(e)}>
        <div
          style={{
            margin: "10px",
            fontSize: "25px",
            color: "black",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <p>Log In</p>
        </div>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control
            aria-label="Email"
            aria-describedby="basic-addon1"
            placeholder="Email"
            onChange={(e) => this.onEChange(e)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Control
            type="password"
            placeholder="Password"
            onChange={(e) => this.onPChange(e)}
          />
        </Form.Group>
        {/* <a className="forgot-password" href="#" onClick={() => this.setState({ forgotPasswordClicked: true })}>
          Forgot Password?
        </a> */}
        <br />
        <div className="login-btns">
          <Button
            type="submit"
            className="login-btn"
            onClick={() => {
              console.log("POST THAT!");
            }}
          >
            Log In
          </Button>
          <span style={{ color: "black", marginTop: "30px" }}>
            Don't Have An Account?
          </span>
          <Button
            className="login-btn"
            onClick={() => this.setState({ newUser: true })}
            onTouchStart={() => this.setState({ newUser: true })}
            style={{ marginBottom: "15px" }}
          >
            Sign Up
          </Button>
          <Button
            className="SSO-btn"
            onClick={() => signInWithGoogle()}
            style={{ marginBottom: "15px" }}
          >
            <img alt="" style={{marginRight:"10px", height:"25px"}} src="https://lh3.googleusercontent.com/COxitqgJr1sJnIDe8-jiKhxDx1FrYbtRHKJ9z_hELisAlapwE9LUPh6fcXIfb5vwpbMl4xl9H9TRFPc5NOO8Sb3VSgIBrfRYvW6cUA"/>
            Continue with Google
          </Button>
        </div>
      </Form>
    );
  }

  SignInForm() {
    return (
      <Form onSubmit={(e) => this.onSignUpSubmit(e)}>
        <div
          style={{
            margin: "10px",
            fontSize: "25px",
            color: "black",
            display: "flex",
            justifyContent: "center",
          }}
        >
          <p>Sign Up</p>
        </div>
        <p
          style={{
            fontSize: "1.3rem",
            marginTop: "-20px",
            marginBottom: "2px",
          }}
        >
          Name:{" "}
        </p>
        <div className="name-inputs">
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              aria-label="First"
              aria-describedby="basic-addon1"
              placeholder="First"
              onChange={(e) => this.onFChange(e)}
            />
          </Form.Group>
          <div style={{ width: "5px" }}></div>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Control
              aria-label="Last"
              aria-describedby="basic-addon1"
              placeholder="Last"
              onChange={(e) => this.onLChange(e)}
            />
          </Form.Group>
        </div>
        <Form.Group className="mb-3" controlId="formBasicEmail">
          <Form.Control
            aria-label="Email"
            aria-describedby="basic-addon1"
            placeholder="Email"
            onChange={(e) => this.onEChange(e)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Control
            type="password"
            placeholder="Password"
            onChange={(e) => this.onPChange(e)}
          />
        </Form.Group>
        <Form.Group className="mb-3" controlId="formBasicPassword">
          <Form.Control
            type="password"
            placeholder="Confirm Password"
            onChange={(e) => this.onCPChange(e)}
          />
        </Form.Group>
        <div className="login-btns">
          <Button
            type="submit"
            className="login-btn"
            onClick={() => {
              console.log("POST THAT!");
            }}
          >
            Sign Up
          </Button>
          <span style={{ color: "black", marginTop: "30px" }}>
            Already Have An Account?
          </span>
          <Button
            className="login-btn"
            onClick={() => this.setState({ newUser: false })}
            onTouchStart={() => this.setState({ newUser: false })}
            style={{ marginBottom: "15px" }}
          >
            Log In
          </Button>
        </div>
      </Form>
    );
  }

  renderForm() {
    if (!this.state.newUser && !this.state.forgotPasswordClicked) {
      return this.LogInForm();
    } else {
      // Render sign up form if newUser is true
      return this.SignInForm();
    }
  }

  render() {
    return (
      <Container style={{ maxWidth: "500px" }}>
        <Card className="login-card">
          {this.renderForm()}
        </Card>
      </Container>
    );
  }
}

export default LogIn;