import axios from 'axios'

const env = (key, fallback) => import.meta.env[key] || fallback

export const API = {
  auth: env('VITE_AUTH_API', 'https://hireconnect-authentication-service.onrender.com'),
  user: env('VITE_USER_API', 'https://hireconnect-jobseeker-services.onrender.com'),
  job: env('VITE_JOB_API', 'https://hireconnect-recruiter-services.onrender.com'),
  interview: env('VITE_INTERVIEW_API', 'https://hireconnect-interviewreport-service.onrender.com'),
  utils: env('VITE_UTILS_API', 'https://hireconnect-geminiresponse-services.onrender.com')
}

const TOKEN_KEY = 'hireheaven.token'
const USER_KEY = 'hireheaven.user'
const THEME_KEY = 'hireheaven.theme'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const getUser = () => {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY) || 'null')
  } catch {
    return null
  }
}
export const saveSession = (token, user) => {
  if (token) localStorage.setItem(TOKEN_KEY, token)
  if (user) localStorage.setItem(USER_KEY, JSON.stringify(user))
}
export const clearSession = () => {
  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(USER_KEY)
}
export const getTheme = () => localStorage.getItem(THEME_KEY) || 'dark'
export const setTheme = (theme) => localStorage.setItem(THEME_KEY, theme)

export const authHeaders = () => {
  const token = getToken()
  return token ? { Authorization: `Bearer ${token}` } : {}
}

const attachAuth = (config) => {
  const token = getToken()
  if (token) {
    config.headers = config.headers || {}
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
}

export const authApi = axios.create({ baseURL: API.auth, withCredentials: true })
export const userApi = axios.create({ baseURL: API.user, withCredentials: true })
export const jobApi = axios.create({ baseURL: API.job, withCredentials: true })
export const interviewApi = axios.create({ baseURL: API.interview, withCredentials: true })
export const utilsApi = axios.create({ baseURL: API.utils, withCredentials: true })

;[authApi, userApi, jobApi, interviewApi, utilsApi].forEach((instance) => {
  instance.interceptors.request.use(attachAuth)
})

export const apiError = (error) => error?.response?.data?.message || error?.message || 'Something went wrong'

export const toFormData = (obj) => {
  const formData = new FormData()
  Object.entries(obj || {}).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') return
    if (Array.isArray(value)) {
      value.forEach((item) => formData.append(key, item))
      return
    }
    formData.append(key, value)
  })
  return formData
}

export const fileToBase64 = (file) =>
  new Promise((resolve, reject) => {
    if (!file) return reject(new Error('File is required'))
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsDataURL(file)
  })

export const buildAssetUrl = (baseUrl, value) => {
  if (!value) return ''
  if (/^(https?:)?\/\//i.test(value) || value.startsWith('data:')) return value
  const cleanBase = String(baseUrl || '').replace(/\/$/, '')
  const cleanPath = String(value).replace(/^\//, '')
  return `${cleanBase}/${cleanPath}`
}
