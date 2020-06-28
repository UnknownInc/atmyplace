import React from 'react'
import AppContext from '../models/appcontext'

export const StoresContext = React.createContext(AppContext.create())

export const useStores = () => React.useContext(StoresContext);
