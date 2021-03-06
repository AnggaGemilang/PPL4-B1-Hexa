import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CRow,
  CCallout,
  CAlert,
  CSpinner  
} from '@coreui/react'
import AdministrasiUserAPI from '../../config/admin/AdministrasiUserAPI'

const ChangePassword = () => {
  const [state, setState] = useState({
    message: "",
    color: "",
    visibleSubmit: false,    
  })

  const postData = (event) => {
    event.preventDefault()
    setState({ ...state, visibleSubmit: true })

    if(document.getElementById("password_baru").value == document.getElementById("ulangi_password").value){
      if(document.getElementById("password_baru").value.length >= 8){
        if(document.getElementById("password_baru").value.match(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%* #+=\(\)\^?&])[A-Za-z\d$@$!%* #+=\(\)\^?&]{3,}$/)){
          const body = {
            password: document.getElementById("password_baru").value,
          }
          AdministrasiUserAPI.edit(JSON.parse(sessionStorage.getItem("auth")).user.id, body).then(
            (res) => {
              document.getElementById("password_baru").value = ""
              document.getElementById("ulangi_password").value = ""
              setState({ message: "Password Berhasil Diperbaharui!", color: "success", visibleSubmit: false })
            }, (err) => {
              setState({ message: "Password Gagal Diperbaharui!", color: "danger", visibleSubmit: false })
            }
          )
        } else {
          setState({ message: "Gunakan kombinasi huruf, angka, dan karakter!", color: "danger", visibleSubmit: false })
        }
      } else {
        setState({ message: "Password minimal terdiri dari 8 karakter!", color: "danger", visibleSubmit: false })
      }
    } else {
      setState({ message: "Kedua Password Tidak Sama!", color: "danger", visibleSubmit: false })
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCol xs={12}>
          <CCallout color="info" className="bg-white">
            <p style={{ fontSize: "18px", marginBottom: "4px" }}><b>Catatan Pengisian</b></p>
            <ul className='catatan'>
              <li>Sistem memungkinkan pengguna untuk mengubah passwordnya</li>
              <li>Sebelum submit, pastikan password baru dan ulangi password telah sama</li>
              <li>Password minimal terdiri dari dari 8 karakter</li>
              <li>Gunakan kombinasi huruf, angka, dan karakter pada password</li>
            </ul>
          </CCallout>
        </CCol>
        <CCol xs={12}>
          { state.message && <CAlert color={state.color} dismissible onClose={() => { setState({ ...state, message: "", color: "" }) }}> { state.message } </CAlert> }
        </CCol>
        <CCol xs={12}>
          <CCard>
            <CCardHeader>
              <strong>Ubah Password</strong>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={postData} method="post">
                <CRow className="mt-2">
                  <CFormLabel htmlFor="password_baru" className="col-sm-2 col-form-label">
                    Password Baru
                  </CFormLabel>
                  <CCol sm={10}>
                    <CFormInput 
                      type="password" 
                      name="password_baru"
                      id="password_baru"
                      placeholder='Masukkan Password Baru . . .' />
                  </CCol>
                </CRow>
                <CRow className="mt-3">
                  <CFormLabel htmlFor="ulangi_password" className="col-sm-2 col-form-label">
                    Ulangi Password
                  </CFormLabel>
                  <CCol sm={10}>
                    <CFormInput 
                      type="password" 
                      name="ulangi_password"
                      id="ulangi_password"
                      placeholder='Ulangi Password . . .' />
                  </CCol>
                </CRow>
                <CRow className='mt-4'>
                  <CCol xs={12} className="position-relative">
                    <CButton disabled={state.visibleSubmit} type="submit" style={{width:'100%'}} className="p-2 w-100">
                      Submit
                    </CButton>
                    { state.visibleSubmit && <CSpinner color="primary" className='position-absolute' style={{right: "20px", top: "5px"}} /> }
                  </CCol>
                </CRow>
              </CForm>
            </CCardBody>
          </CCard>
        </CCol>
      </CCol>
    </CRow>         
  )     
}

export default ChangePassword
