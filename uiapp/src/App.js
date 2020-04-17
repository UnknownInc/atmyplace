import React, { PureComponent } from 'react';
import { observer } from 'mobx-react'
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect
} from "react-router-dom";

import { Spin } from 'antd';

import {useStores} from './hooks';

import WelcomePage from './pages/WelcomePage';
import ManagePage from './pages/ManagePage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';

import { logout} from "./helpers/auth";
import { auth } from 'firebase';
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

const App = observer(() => {
  const { authStore } = useStores();

  return authStore.busy ? (
    <div className="center" style={{height:'100vh'}} role="status">
      <Spin size="large" tip="Loading..."/>
    </div>
    ) : (
      <Router>
        <Switch>
          <Route exact path="/" component={(props)=><WelcomePage {...props}/>} />
          <PrivateRoute
            path="/manage"
            authenticated={authStore.isAuthenticated}
            component={ManagePage}
          />
          <PublicRoute
            path="/signup"
            authenticated={authStore.isAuthenticated}
            component={SignUpPage}
          />
          <PublicRoute
            path="/login"
            authenticated={authStore.isAuthenticated}
            component={LoginPage}
          />
          <Route exact path="/logout" component={Logout}/>
        </Switch>
      </Router>
    );
})

export default App;
