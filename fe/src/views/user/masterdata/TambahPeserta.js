import React, { useState, useEffect } from 'react'
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
import {useNavigate} from 'react-router-dom'
import DataPesertaAPI from '../../../config/user/DataPesertaAPI'

const TambahPeserta = () => {
  const navigate = useNavigate()
  const [nipValue, setNipValue] = useState("")
  const [state, setState] = useState({
    namaKaryawan: "",
    idKaryawan: 0,
    errorMessage: "",
    visibleSubmit: false,
  })

  useEffect(() => {
    if (nipValue.length > 1) {
      DataPesertaAPI.findEmployee(nipValue).then(
      (res) => {
        if(res.data.data.length == 1){
          setState({
            namaKaryawan: res.data.data[0].attributes.Name,
            idKaryawan: res.data.data[0].id
          })
        } 
        else {
          setState({
            namaKaryawan: '',
            idKaryawan: 0,
          })
        }
      })
    } else {
      setState({
        namaKaryawan: '',
        idKaryawan: 0,
      })      
    }
  }, [nipValue])

  const postData = (event) => {
    event.preventDefault()
    setState({ ...state, visibleSubmit: true })

    if(state.namaKaryawan.length > 0){
      const body = {
        data: {
          employee: state.idKaryawan,
          status: 'active'
        }
      }
      DataPesertaAPI.findRegistrants(`&filters[employee][NIP][$eq]=${nipValue}`).then(
        (res) => {
          if(res.data.data.length == 0){
            DataPesertaAPI.add(body).then(
              (res) => {
                navigate('/datapeserta', {state: { successMessage: 'Peserta Telah Berhasil Ditambahkan!' } })
              },
              (err) => {
                setState({ ...state, visibleSubmit: false, errorMessage: "" })
              }
            )   
          } else {
            if(res?.data?.data[0]?.attributes?.status == "non_active"){
              DataPesertaAPI.edit(res?.data?.data[0]?.id, body).then(
                (res) => {
                  navigate('/datapeserta', {state: { successMessage: 'Peserta Telah Diaktifkan Kembali!' } })
                },
                (err) => {
                  setState({ ...state, visibleSubmit: false, errorMessage: "" })
                }
              )   
            } else {
              setState({ ...state, visibleSubmit: false, errorMessage: "Pegawai sudah menjadi peserta" })
            }
          }
        }
      ) 
    } else {
      setState({ ...state, visibleSubmit: false, errorMessage: "Masukkan NIP Dengan Benar!" })
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCol xs={12}>
          <CCallout color="info" className="bg-white">
            <p style={{ fontSize: "18px", marginBottom: "4px" }}><b>Catatan Pengisian</b></p>
            <ul className='catatan'>
              <li>Sebelum submit, pastikan seluruh data yang dimasukkan valid</li>
              <li>Data yang dimasukkan hanya berupa NIP yang mengintegrasikan dengan data pegawai</li>
              <li>Jika kolom nama terisi, berarti pegawai ditemukan dan bisa dilakukan penambahan peserta</li>
            </ul>
          </CCallout>
        </CCol>
        <CCol xs={12}>
          { state.errorMessage && <CAlert color="danger" dismissible onClose={() => { setState({ errorMessage: "" }) }}> { state.errorMessage } </CAlert> }
        </CCol>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Tambah Peserta</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={postData}>
              <CRow className="mb-3">
                <CFormLabel htmlFor="nipValue" className="col-sm-2 col-form-label" >
                  NIP
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput type="text" id="nipValue" name="nipValue" onChange={(e) => setNipValue(e.target.value )} placeholder='Masukkan NIP . . .' />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CFormLabel htmlFor="namaKaryawan" className="col-sm-2 col-form-label" >
                  Nama
                </CFormLabel>
                <CCol sm={10}>
                  <CFormInput type="text" id="namaKaryawan" name="namaKaryawan" value={state.namaKaryawan} placeholder='Nama Pegawai Akan Muncul Disini' disabled />
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
    </CRow>
  )
}

export default TambahPeserta
