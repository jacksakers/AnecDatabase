import React, {Component } from "react";
import "../App.css";
import {
  doc,
  getDoc
} from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";

class ViewDatum extends Component {
    constructor(props) {
      super(props);
      this.state = {
        anecdatumType: this.props.type,
        docId: this.props.docId,
        creator: "",
        date: "",
        description: "",
        header_img_addr: "",
        logo_img_addr: "",
        location: "",
        era: "",
        photos: [],
        title: "",
      };
    }

    componentDidMount() {
      onAuthStateChanged(auth, async (user) => {
        var docType = this.props.type;
        var datumID = this.props.docId;
        if (!docType) {
          const params = new URLSearchParams(window.location.search);
          docType = params.get("type");
          var formattingID = params.get("datumID").replaceAll(' ', '+').split('+-+');
          var formattedID = formattingID[0] + "+-+" + formattingID[1].replaceAll('+', ' ');
          datumID = formattedID;

          if (datumID) {
            this.setState({
                docId: datumID,
                type: docType,
            });
          }
        }
        const docRef = doc(db, docType, datumID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          this.setState({
            title: docSnap.data().title,
            description: docSnap.data().description,
          })
        }
      })
    }

    render() {
      return (
        <div className="view-datum">
          <h1>{this.state.title}</h1>
          <h2>{(this.state.era !== "") ? `Era: ${this.state.era}` : ""}</h2>
          <p>{this.state.description}</p>
        </div>
      );
    }
}
  
export default ViewDatum;