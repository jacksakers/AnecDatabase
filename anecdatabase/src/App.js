import './App.css';
import Home from "./pages/home";
import LogIn from "./pages/login";
import NewNavbar from "./components/newnavbar";
import "bootstrap/dist/css/bootstrap.min.css";
import React from "react";
import Profile from './pages/profile';
import Find from './pages/find';
import Create from './pages/create';
import MyData from './pages/my-data';
import ViewDatum from './pages/view-datum';

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentPage: "find",
      isLoggedIn: false,
      username: "GUEST",
      vdType: "",
      vdDocId: ""
    };
  }

  componentDidMount() {
    // Read query parameters from the URL
    const params = new URLSearchParams(window.location.search);
    const pageTitle = params.get("page");
    var uidParam = params.get("uid");

    // If there is a 'page' query parameter, navigate to the corresponding page
    if (pageTitle) {
      this.setState({
        currentPage: pageTitle,
        uid: uidParam,
      });
      this.renderContent();
    }
  }

  handleLogIn(uName) {
    this.setState({ isLoggedIn: true, username: uName});
    this.switchPageTo("profile")
  }

  handleLogOut() {
    this.switchPageTo("find")
  }

  handleOpenDatum(type, docId) {
    this.updateParams(`page=view-datum&datumID=${docId}&type=${type}`);
    this.setState({ vdType: type, vdDocId: docId, currentPage: 'view-datum' });
  }

  renderContent() {
    switch (this.state.currentPage) {
      case "home":
        return <Home />;
      case "login":
        return <LogIn didLogIn={(uName) => this.handleLogIn(uName)}/>;
      case "profile":
        return <Profile handleLogOut={() => this.handleLogOut()}/>;
      case "create":
        return <Create />;
      case "my-data":
        return <MyData openDatum={(type, docId) => this.handleOpenDatum(type, docId)}/>;
      case "view-datum":
        return <ViewDatum type={this.state.vdType} docId={this.state.vdDocId}/>
      default:
        return <Find />;
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
    this.setState({ currentPage: newPage });
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