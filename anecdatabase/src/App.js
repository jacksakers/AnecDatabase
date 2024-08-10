import './App.css';
import Home from "./pages/home";
import LogIn from "./pages/login";
import NewNavbar from "./components/newnavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: "find",
      isLoggedIn: false,
      username: "GUEST",
    };
  }

  componentDidMount() {
    // Read query parameters from the URL
    const params = new URLSearchParams(window.location.search);
    const pageTitle = params.get("page");
    var uidParam = params.get("uid");
    var oidParam = params.get("oid");
    var eventParam = params.get("eventid");

    // If there is a 'page' query parameter, navigate to the corresponding page
    if (pageTitle) {
      this.setState({
        currentPage: pageTitle,
        uid: uidParam,
        oid: oidParam,
        currentEvent: eventParam,
      });
      this.renderContent();
    }
  }

  handleLogIn(uName) {
    this.setState({ isLoggedIn: true, username: uName });
  }

  handleLogOut() {
    console.log("logging out");
    this.setState({ currentPage: "find" });
  }

  renderContent() {
    switch (this.state.currentPage) {
      case "home":
        return <Home />;
      case "login":
        return <LogIn />;
      default:
        return <></>;
    }
  }

  updateParams(newParams) {
    // Get the current pathname
    const pathname = window.location.pathname;

    // Combine the current pathname and the new parameters
    const search = newParams ? `?${newParams}` : "";
    const newPath = `${pathname}${search}`;

    // Use the replaceState method to update the URL without adding a new entry to the browser's history
    window.history.replaceState(null, null, newPath);
  }

  switchPageTo(newPage) {
    if (newPage !== "create") this.setState({orgCreation: false});
    this.setState({ currentPage: newPage });
    if (newPage === "profile") {
      this.updateParams(`page=account&uid=${this.state.uid}`);
      return;
    }
    this.updateParams(`page=${newPage}`);
  }

  render() {
    return (
      
      <div className="App">
        <NewNavbar switchPageTo={this.switchPageTo.bind(this)} />
        {this.renderContent()}
      </div>
    );
  }
}

export default App;