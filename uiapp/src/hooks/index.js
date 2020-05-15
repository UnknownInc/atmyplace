import React from 'react'
import AppContext from '../models/appcontext'

const storesContext = React.createContext(AppContext.create())

export const useStores = () => React.useContext(storesContext)