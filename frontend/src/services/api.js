import axios from 'axios'

const baseURL = import.meta.env.PROD
  ? '/api'
  : `http://${window.location.hostname}:3002/api`

const api = axios.create({
  baseURL,
  timeout: 10000,
})

export const jobsApi = {
  list: (params) => api.get('/jobs', { params }).then(r => r.data),
  stats: (params) => api.get('/jobs/stats', { params }).then(r => r.data),
  get: (id) => api.get(`/jobs/${id}`).then(r => r.data),
  create: (formData) => api.post('/jobs', formData, { headers: { 'Content-Type': 'multipart/form-data' } }).then(r => r.data),
  updateStatus: (id, data) => api.patch(`/jobs/${id}/status`, data).then(r => r.data),
  addNote: (id, data) => api.post(`/jobs/${id}/notes`, data).then(r => r.data),
}

export const machinesApi = {
  list: (params) => api.get('/machines', { params }).then(r => r.data),
  create: (data) => api.post('/machines', data).then(r => r.data),
}

export const venuesApi = {
  list: () => api.get('/venues').then(r => r.data),
  create: (data) => api.post('/venues', data).then(r => r.data),
}

export const techsApi = {
  list: () => api.get('/technicians').then(r => r.data),
  create: (data) => api.post('/technicians', data).then(r => r.data),
}
