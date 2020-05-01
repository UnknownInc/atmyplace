import React from "react";
import {useStores} from "../hooks";
import {observer} from "mobx-react";
import {Redirect} from 'react-router-dom';

const Logout =observer((props)=>{
  const {text='Logout', redirectTo='/'} = props;
  const {authStore} = useStores();
  
  if (authStore.isAuthenticated) {
    return <a href="#" onClick={e=>{e.preventDefault(); authStore.logout();}}>{text}</a>
  } else {
    return <Redirect to={redirectTo}/>
  }
});

export default Logout;