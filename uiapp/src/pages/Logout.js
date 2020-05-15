import React from "react";
import {useStores} from "../hooks";
import {observer} from "mobx-react";
import {Redirect} from 'react-router-dom';

const Logout =observer((props)=>{
  const {text='Sign Out', redirectTo='/'} = props;
  const appcontext = useStores();
  
  if (appcontext.isAuthenticated) {
    return <a href="/" onClick={e=>{e.preventDefault(); appcontext.logout();}}>{text}</a>
  } else {
    return <Redirect to={redirectTo}/>
  }
});

export default Logout;