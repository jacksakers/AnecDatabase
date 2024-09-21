import React, {Component } from "react";
import "../App.css";
import {
  query,
  where,
  getDocs
} from "firebase/firestore";
import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "firebase/auth";
import { collection } from "firebase/firestore";

class MyData extends Component {
    constructor(props) {
      super(props);
      this.state = {
        eraElems: [],
        openedEraDocs: {
          events: [],
          people: [],
          places: [],
          updates: []
        }
      };
    }

    async getDataWhere(_collection, field, target) {
      const q = query(collection(db, _collection), where(field, "==", target));
      const querySnapshot = await getDocs(q);
      let dataList = [];
      querySnapshot.forEach((doc) => {
        let title = doc.data().title;
        dataList.push({label: title, docId: doc.id});
      });
      return dataList;
    }

    async openEra(docId) {
      const insideEraEvents = await this.getDataWhere("Event", "era", docId);
      const insideEraPeople = await this.getDataWhere("Person", "era", docId);
      const insideEraPlaces = await this.getDataWhere("Place", "era", docId);
      const insideEraUpdates = await this.getDataWhere("Update", "era", docId);
      let openedEraData = {
        events: [],
        people: [],
        places: [],
        updates: []
      };
      insideEraEvents.forEach((datum) => {
        openedEraData.events.push(<li key={datum.docId} onClick={() => this.props.openDatum("Event", datum.docId)}>
                        {datum.label}
                      </li>);
      })
      insideEraPeople.forEach((datum) => {
        openedEraData.people.push(<li key={datum.docId} onClick={() => this.props.openDatum("Person", datum.docId)}>
                        {datum.label}
                      </li>);
      })
      insideEraPlaces.forEach((datum) => {
        openedEraData.places.push(<li key={datum.docId} onClick={() => this.props.openDatum("Place", datum.docId)}>
                        {datum.label}
                      </li>);
      })
      insideEraUpdates.forEach((datum) => {
        openedEraData.updates.push(<li key={datum.docId} onClick={() => this.props.openDatum("Update", datum.docId)}>
                        {datum.label}
                      </li>);
      })
      this.setState({openedEraDocs: openedEraData});
    }

    componentDidMount() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          const eraData = await this.getDataWhere("Era", "creator", user.uid);
          let _eraElems = [];
          eraData.forEach((datum) => {
            _eraElems.push(<li >
                            <div onClick={async () => await this.openEra(datum.docId)}>
                              {datum.label}</div>
                          </li>);
          })
          this.setState({eraElems: _eraElems});
        }
      })
    }

    render() {
      return (
        <div className="my-data">
              {this.state.eraElems.length > 0 ?  
                <div className="my-data-eras">
                  <h2>Eras</h2>
                  <ul className="era-ul">
                  {this.state.eraElems} 
                      <li>
                        <div onClick={async () => await this.openEra("")}>
                        Unknown Era</div>
                      </li>
                  </ul>
                </div> :
                <h2>No Data</h2>
              }
          <div className="my-data-subfolders">
            <div className="my-data-events">
              {(this.state.openedEraDocs.events.length !== 0) ? <h2>Events</h2> : <></>}
              {this.state.openedEraDocs.events}
            </div>
            <div className="my-data-events">
              {(this.state.openedEraDocs.people.length !== 0) ? <h2>People</h2> : <></>}
              {this.state.openedEraDocs.people}
            </div>
            <div className="my-data-events">
              {(this.state.openedEraDocs.places.length !== 0) ? <h2>Places</h2> : <></>}
              {this.state.openedEraDocs.places}
            </div>
            <div className="my-data-events">
              {(this.state.openedEraDocs.updates.length !== 0) ? <h2>Updates</h2> : <></>}
              {this.state.openedEraDocs.updates}
            </div>
          </div>
        </div>
      );
    }
}
  
export default MyData;