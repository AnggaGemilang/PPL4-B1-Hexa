import api from '../index'

export default {
  getPublic : (query) => api.get(`/mappings?populate[1]=registrant&populate[2]=registrant.employee&populate[3]=position&populate[4]=registrant.employee.position&populate[5]=examiners&populate[6]=examiners.employee&populate[7]=registrant.cv&populate[8]=registrant.ppt&populate[9]=level&populate[10]=examiners_interview.employee&populate[11]=registrant.employee.Photo&populate[12]=level_current&populate[13]=position_current${query}`),
  getPenguji : (query) => api.get(`/line-mappings?populate[1]=examiner.employee&populate[2]=mapping.registrant.employee&populate[3]=mapping.position&populate[4]=mapping.registrant.employee.position&populate[5]=mapping.registrant.cv&populate[6]=mapping.registrant.ppt&populate[7]=mapping.registrant.employee.Photo&populate[8]=mapping.level&populate[9]=mapping.level_current&populate[10]=mapping.position_current&filters[examiner][employee][NIP][$eq]=${JSON.parse(sessionStorage.getItem("auth")).user.employee.NIP}${query}`),

  getKeteragan1Publik : () => api.get(`/employees`),
  getKeteragan2Publik : () => api.get(`/registrants`),
  getKeteragan3Publik : () => api.get(`/mappings?filters[status][$eq]=on_progress`),
  getKeteragan4Publik : () => api.get(`/mappings?filters[status][$ne]=on_progress`),

  getKeteragan1Penguji : () => api.get(`/line-mappings?populate[1]=mapping.examiner.employee&filters[status_fitproper][$eq]=false&filters[examiner][employee][NIP][$eq]=${JSON.parse(sessionStorage.getItem("auth")).user.employee.NIP}`),
  getKeteragan2Penguji : () => api.get(`/line-mappings?populate[1]=mapping.examiner.employee&filters[status_interview][$eq]=false&filters[is_interview][$eq]=true&filters[examiner][employee][NIP][$eq]=${JSON.parse(sessionStorage.getItem("auth")).user.employee.NIP}`),
  getKeteragan3Penguji : () => api.get(`/line-mappings?populate[1]=mapping.examiner.employee&filters[status_fitproper][$eq]=true&filters[examiner][employee][NIP][$eq]=${JSON.parse(sessionStorage.getItem("auth")).user.employee.NIP}`),
  getKeteragan4Penguji : () => api.get(`/line-mappings?populate[1]=mapping.examiner.employee&filters[status_interview][$eq]=true&filters[examiner][employee][NIP][$eq]=${JSON.parse(sessionStorage.getItem("auth")).user.employee.NIP}`)
}