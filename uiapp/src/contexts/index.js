
import React from 'react'
import { ThemeStore } from '../stores/themeStore.js'
import createAuthStore from '../stores/authStore.js'

export const storesContext = React.createContext({
  authStore: createAuthStore(),
  themeStore: new ThemeStore(),
})