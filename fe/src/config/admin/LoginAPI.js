import api from '../index'

export default {
  login: (data) => api.post(`/auth/local`, data),
}