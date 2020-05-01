import React from 'react';
import { observer } from 'mobx-react'
import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect
} from "react-router-dom";

import { Spin } from 'antd';

import {useStores} from './hooks';

import MainPage from './pages/MainPage';
import SignUpPage from './pages/SignUpPage';
import LoginPage from './pages/LoginPage';
import Logout from './pages/Logout';

//import RTCMesh from 'react-rtc-real';

//import RTCMesh from './RTCMesh';<RTCMesh URL="ws://d56f52f5.ngrok.io"/>

//require('react-rtc-real/assets/index.css');

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
            <Redirect to="/" />
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
          <Route exact path="/" component={(props)=><MainPage {...props}/>} />
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
