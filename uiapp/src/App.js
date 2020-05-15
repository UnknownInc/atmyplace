import React from 'react';
import { observer } from 'mobx-react'
import {
  Route,
  BrowserRouter as Router,
  Switch,
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

const App = observer(() => {
  const appcontext = useStores();

  return appcontext.busy ? (
    <div className="center" style={{height:'100vh'}} role="status">
      <Spin size="large" tip="Loading..."/>
    </div>
    ) : (
      <Router>
        <Switch>
          <Route exact path="/" component={MainPage} />
          <Route exact path="/signup" component={SignUpPage}/>
          <Route exact path="/login" component={LoginPage}/>
          <Route exact path="/logout" component={Logout}/>
        </Switch>
      </Router>
    );
})

export default App;
