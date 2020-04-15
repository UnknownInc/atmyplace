import React, { PureComponent } from 'react';

import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect
} from "react-router-dom";

import { Spin } from 'antd';

import { auth } from "./services/firebase";
import WelcomePage from './pages/WelcomePage';
import ManagePage from './pages/ManagePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';

import { logout} from "./helpers/auth";
//import RTCMesh from 'react-rtc-real';

//import RTCMesh from './RTCMesh';<RTCMesh URL="ws://d56f52f5.ngrok.io"/>

//require('react-rtc-real/assets/index.css');

class Logout extends PureComponent {
  componentDidMount() {
    logout();
  }

  render() {
    return <Redirect to={'/'}/>
  }
}

function PrivateRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        authenticated === true ? (
          <Component {...props} />
        ) : (
            <Redirect
              to={{ pathname: "/login", state: { from: props.location } }}
            />
          )
      }
    />
  );
}

function PublicRoute({ component: Component, authenticated, ...rest }) {
  return (
    <Route
      {...rest}
      render={props =>
        authenticated === false ? (
          <Component {...props} />
        ) : (
            <Redirect to="/manage" />
          )
      }
    />
  );
}
class App extends React.Component {
  constructor() {
    super();
    this.state = {
      authenticated: false,
      loading: true
    };
  }

  componentDidMount() {
    auth().onAuthStateChanged(user => {
      if (user) {
        this.setState({
          authenticated: true,
          loading: false
        });
      } else {
        this.setState({
          authenticated: false,
          loading: false
        });
      }
    });
  }

  render() {
    return this.state.loading === true ? (
      <div className="spinner-border text-success" role="status">
        <Spin size="large" tip="Loading..."/>
      </div>
    ) : (
        <Router>
          <Switch>
            <Route exact path="/" component={(props)=><WelcomePage authenticated={this.state.authenticated} {...props}/>} />
            <PrivateRoute
              path="/manage"
              authenticated={this.state.authenticated}
              component={ManagePage}
            />
            <PublicRoute
              path="/signup"
              authenticated={this.state.authenticated}
              component={SignUpPage}
            />
            <PublicRoute
              path="/login"
              authenticated={this.state.authenticated}
              component={LoginPage}
            />
            <Route exact path="/logout" component={Logout}/>
          </Switch>
        </Router>
      );
  }
}

export default App;
