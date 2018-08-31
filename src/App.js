import React, { Component } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "firebase/app";
import {
  userCollection,
  akcijeCollection,
  db,
  uiConfig
} from "./config/fire.js";
import { currentTF, todayTF } from "./config/datetime.js";

class App extends Component {
  state = {
    user: null,
    users: [],
    todaysPrijave: []
  };

  didPrijava = user_uid => {
    if (this.state.todaysPrijave.indexOf(user_uid) >= 0) {
      return true;
    }
    return false;
  };

  async getUsers() {
    let snapshot = await userCollection.get();
    let users = snapshot.docs.map(x => x.data());

    this.setState({ users });
    return users;
  }

  async getPrijave() {
    let snapshot = await akcijeCollection.doc(currentTF).get();
    let data = snapshot.data();
    if (data === undefined) {
      data = { prijave: [] };
    }
    this.setState({ todaysPrijave: data.prijave });
    return data.prijave;
  }

  async confirmOptIn(user) {
    let prijave = await this.getPrijave();
    let newPrijave = [];

    if (prijave.indexOf(user.uid) >= 0) {
      newPrijave = [...prijave];
    } else {
      newPrijave = [...prijave, this.state.user.uid];
    }

    akcijeCollection.doc(currentTF).set({
      prijave: newPrijave
    });

    this.setState({ todaysPrijave: newPrijave });
  }

  async startUp() {
    await this.getUsers();
    await this.getPrijave();

    firebase.auth().onAuthStateChanged(user => {
      this.setState({ user });
      if (user && this.state.users) {
        userCollection.doc(user.uid).set({
          uid: user.uid,
          displayName: user.displayName,
          photoUrl: user.photoURL
        });
      }
    });
  }

  async rainCheck(user) {
    const prijave = await this.getPrijave();
    let newPrijave = [...prijave];

    if (newPrijave.indexOf(user.uid) >= 0) {
      newPrijave.splice(newPrijave.indexOf(user.uid), 1);
    }

    db.collection("akcije")
      .doc(currentTF)
      .set({ prijave: newPrijave });

    this.setState({ todaysPrijave: newPrijave });
  }

  componentDidMount = () => {
    this.startUp();
  };

  logout = () => {
    firebase.auth().signOut();
  };

  optIn = () => {
    this.confirmOptIn(this.state.user);
  };

  optOut = () => {
    this.rainCheck(this.state.user);
  };

  render() {
    return (
      <div className="App">
        <div className="container">
          <div className="row">
            <div className="col">
              <div className="text-center">
                <h1>Akcija</h1>
                <br />

                {this.state.user ? (
                  <div>
                    <div>
                      <img
                        style={{ borderRadius: "4rem" }}
                        width="100px"
                        alt="No pic"
                        src={this.state.user.photoURL}
                      />
                    </div>
                    <div style={{ fontSize: 18, fontWeight: "bold" }}>
                      {this.state.user.displayName}
                    </div>
                    <br />
                    <div>
                      <button
                        onClick={this.logout}
                        className="btn btn-primary btn-sm"
                      >
                        Logout
                      </button>
                    </div>

                    <hr />

                    <div>
                      <button
                        onClick={this.optIn}
                        className="btn btn-success btn-sm"
                        style={{ margin: 2 }}
                      >
                        Yes
                      </button>

                      <button
                        onClick={this.optOut}
                        className="btn btn-danger btn-sm"
                        style={{ margin: 2 }}
                      >
                        No
                      </button>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div>Not signed in</div>
                    <StyledFirebaseAuth
                      uiConfig={uiConfig}
                      firebaseAuth={firebase.auth()}
                    />
                  </div>
                )}

                <hr />

                <div>
                  <div>Today is {todayTF}</div>
                </div>

                <div>
                  <ul>
                    {this.state.users.map(user => (
                      <li key={user.uid}>
                        <img
                          alt="profile pic"
                          src={user.photoUrl}
                          width="50px"
                          height="50px"
                          style={{ borderRadius: "4rem" }}
                        />
                        {user.displayName}
                        <span className="badge">
                          {this.didPrijava(user.uid) ? <b>YES</b> : <b>NO</b>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
