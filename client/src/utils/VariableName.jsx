export const hostURL = import.meta.env.DEV ? '' : import.meta.env.VITE_BACKEND_URL

export const apiURL = hostURL + '/api'

export const LOCAL_STORAGE_TOKEN_NAME = 'themis'

export const SET_AUTH = 'SET_AUTH'