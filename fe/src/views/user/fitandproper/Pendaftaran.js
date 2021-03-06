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
  CInputGroup,
  CFormSelect,
  CCallout,  
  CAlert,
  CImage,
  CSpinner  
} from '@coreui/react'
import {useNavigate, useLocation} from 'react-router-dom'
import MappingAPI from '../../../config/user/MappingAPI'
import FitAndProperAPI from '../../../config/user/FitAndProperAPI'
import DataPengujiAPI from '../../../config/user/DataPengujiAPI'
import DataPesertaAPI from '../../../config/user/DataPesertaAPI'
import LevelAPI from '../../../config/admin/LevelAPI'
import PositionAPI from 'src/config/admin/PositionAPI'
import CriteriaAPI from '../../../config/admin/CriteriaAPI'
import ScoreAPI from '../../../config/user/ScoreAPI'
import url from "../../../config/setting"
import logoPDF from 'src/assets/images/pdf-icon.png'
import axios from "axios"

const Pendaftaran = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const [nipValue, setNipValue] = useState("")
  const [examiners1, setExaminers1] = useState([])
  const [examiners2, setExaminers2] = useState([])
  const [examiners3, setExaminers3] = useState([])
  const [criterias, setCriterias] = useState([])
  const [positions, setPositions] = useState([])
  const [levels, setLevels] = useState([])
  const [state, setState] = useState({
    errorMessage: "",
    ppt: null,
    cv: null,
    registrant: {},
    data: location?.state?.data,
    status: location?.state?.status,
    visibleSubmit: false
  })

  useEffect(() => {
    if(state.status == "edit"){
      setNipValue(state?.data?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes?.NIP)      
    }
    if (nipValue.length > 1) {
      DataPesertaAPI.findRegistrants(`&filters[employee][NIP][$eq]=${nipValue}`).then(
      (res) => {
        if(res.data.data.length == 1){
          setState({
            ...state,
            registrant: res.data.data[0],
          })
          CriteriaAPI.find(res.data.data[0]?.attributes?.employee?.data?.attributes?.level?.data?.attributes?.functional_name.includes("Manajemen Dasar") ? "&filters[defaultUsed][$eq]=fitproper&filters[useFor][$contains]=md" : "&filters[defaultUsed][$eq]=fitproper&filters[useFor][$contains]=am").then(
            (res) => {
              if(res.data.data.length != 0){
                setCriterias(res.data.data)
              } else {
                setCriterias([])
              }
            }
          )
          DataPengujiAPI.findExaminers(`&filters[employee][NIP][$ne]=${res.data.data[0].attributes.employee.data.attributes.NIP}`).then((res) => {
            setExaminers1(res.data.data)
            if(state.status == "edit"){
              setExaminers2(res.data.data)
              setExaminers3(res.data.data)
            }
          })
        } else {
          setState({ 
            ...state, 
            registrant: {}
          })
        }
      })
    } else {
      setState({ 
        ...state, 
        registrant: {}
      })
    }
    axios.all([PositionAPI.get(), LevelAPI.get()]).then(
      axios.spread((...res) => {
        setPositions(res[0]?.data.data),
        setLevels(res[1]?.data.data)
      })
    )
  }, [nipValue])

  const deleteNode = (value, arr) => {
    const temp = [...arr]
    for (let i = 0; i < temp.length; i++) {
      if (temp[i].id == value) {
        temp.splice(i, 1)
      }
    }
    return temp
  }

  const postData = (event) => {
    event.preventDefault()
    setState({ ...state, visibleSubmit: true })

    let examinersVal = []
    for(let i = 1; i < 4; i++){
      if(document.querySelector("#penguji"+i).value != 0){
        examinersVal.push(parseInt(document.querySelector("#penguji"+i).value))
      }
    }

    if(state.status == "tambah"){
      const body = {
        data: {
          examiners: examinersVal,
          registrant: state?.registrant?.id,
          level_current: state?.registrant?.attributes?.employee?.data?.attributes?.level?.data?.id,
          position_current: state?.registrant?.attributes?.employee?.data?.attributes?.position?.data?.id,
          jobdesc: document.getElementById("jobdesc").value,
          schedule: document.getElementById("schedule").value,
          fitproper_type: document.getElementById("fitproper_type").value,
          level: document.getElementById("level").value,
          position: document.getElementById("projection").value,
          is_interview: false,
          status: "on_progress"
        }
      }
      MappingAPI.add(body).then(
        (res) => {
          for(let i = 0; i < examinersVal.length; i++){
            const body = {
              data: {
                mapping: res.data.data.id,
                examiner: examinersVal[i],
                status_fitproper: false,
                status_interview: false,
                is_interview: 'not_decided',
                fitproper_finalized: false,
                interview_finalized: false
              }
            }
            FitAndProperAPI.addLineMapping(body).then(
              (res) => {
                for(let i = 0; i < criterias.length; i++){
                  const body = {
                    data : {
                      line_mapping_fitproper: res.data.data.id,
                      registrant: state?.registrant?.id,
                      examiner: examinersVal[i],
                      criterion: criterias[i].id,
                      score: 0,
                      type: 1
                    }
                  }
                  ScoreAPI.add(body)
                }
              }, 
              (err) => {
                setMessage(err.message)
                setState({ ...state, visibleSubmit: false })
              }
            )
          }          
          if(state?.registrant?.attributes?.cv?.data != null){
            DataPesertaAPI.deletePhoto(state?.registrant?.attributes?.cv?.data?.id)
          }
          if(state?.registrant?.attributes?.ppt?.data != null){
            DataPesertaAPI.deletePhoto(state?.registrant?.attributes?.ppt?.data?.id)
          }
          let formData = new FormData()
          formData.append('files', state.ppt)
          formData.append('ref', 'api::registrant.registrant')
          formData.append('refId', state?.registrant?.id)
          formData.append('field', 'ppt')
          DataPesertaAPI.addFile(formData).then(
            (res) => {
              let formData = new FormData()
              formData.append('files', state.cv)
              formData.append('ref', 'api::registrant.registrant')
              formData.append('refId', state?.registrant?.id)
              formData.append('field', 'cv')
              DataPesertaAPI.addFile(formData).then(
                (res) => {
                  navigate('/fitandproper', {state: { successMessage: 'Pendaftaran Berhasil' } })
                },
                (err) => {
                  setMessage(err.message)
                  setState({ ...state, visibleSubmit: false })
                }
              )
            },
            (err) => {
              setMessage(err.message)
              setState({ ...state, visibleSubmit: false })
            }
          )
        },
        (err) => {
          setMessage(err.message)
          setState({ ...state, visibleSubmit: false })
        }
      )
    } else {
      const body = {
        data: {
          schedule: document.getElementById("schedule").value,
          jobdesc: document.getElementById("jobdesc").value,
          fitproper_type: document.getElementById("fitproper_type").value,
          level: document.getElementById("level").value,
          position: document.getElementById("projection").value,
        }
      }
      MappingAPI.edit(state?.data?.id, body).then(
        (res) => {
          if(state.ppt != null){
            if(state?.registrant?.attributes?.cv?.data != null){
              DataPesertaAPI.deletePhoto(state?.registrant?.attributes?.ppt?.data?.id)
            }
            let formData = new FormData()
            formData.append('files', state.ppt)
            formData.append('ref', 'api::registrant.registrant')
            formData.append('refId', state?.registrant?.id)
            formData.append('field', 'ppt')
            DataPesertaAPI.addFile(formData).then(
              (res) => {
                console.log("success", res)
              },
              (err) => {
                setMessage(err.message)
                setState({ ...state, visibleSubmit: false })
              }
            )     
          }
          if(state.cv != null){
            if(state?.registrant?.attributes?.cv?.data != null){
              DataPesertaAPI.deletePhoto(state?.registrant?.attributes?.cv?.data?.id)
            }
            let formData = new FormData()
            formData.append('files', state.cv)
            formData.append('ref', 'api::registrant.registrant')
            formData.append('refId', state?.registrant?.id)
            formData.append('field', 'cv')
            DataPesertaAPI.addFile(formData).then(
              (res) => {
                console.log("success", res)
              },
              (err) => {
                setMessage(err.message)
                setState({ ...state, visibleSubmit: false })
              }
            )
          }
          navigate('/fitandproper', {state: { successMessage: 'Pendaftaran Berhasil Diperbaharui' } })
        },
        (err) => {
          setMessage(err.message)
          setState({ ...state, visibleSubmit: false })
        }
      )
    } 
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCol xs={12}>
          <CCallout color="info" className="bg-white">
            <p style={{ fontSize: "18px", marginBottom: "4px" }}><b>Catatan Pengisian</b></p>
            <ul className='catatan'>
              <li>Sistem memungkinkan administrator untuk mengisikan nilai peserta</li>
              <li>Sebelum submit, pastikan seluruh data yang dimasukkan valid</li>
              <li>(1) Data yang dimasukkan meliputi NIP, Jadwal Pelaksanaan, Jabatan Proyeksi, Jenjang Jabatan, Jenis Fit & Proper</li>
              <li>(2) Data yang dimasukkan meliputi Uraian Jabatan, PPT, CV, Penguji 1, Penguji 2, dan Penguji 3</li>
              <li>Pilih Proyeksi, Jenjang, Jenis Fit & Proper, Penguji 1, Penguji 2, dan Penguji 3 sesuai opsi yang telah diberikan</li>
            </ul>
          </CCallout>
        </CCol>
        <CCol xs={12}>
          { state.errorMessage && <CAlert color="danger" dismissible onClose={() => { setState({errorMessage:""}) }}> { state.errorMessage } </CAlert> }
        </CCol>
        <CCol xs={12}>                
          <CCard className="mb-4">
            <CCardHeader>
              <strong>{ state.status == "tambah" ? "Pendaftaran" : "Edit"} Peserta Fit Proper</strong>
            </CCardHeader>
            <CCardBody>
              <CForm onSubmit={postData}>
                <CRow className="mb-3 ">
                  <CInputGroup>
                    <CFormLabel htmlFor="nip" className="col-sm-2 col-form-label">NIP</CFormLabel>
                    <div className="col-sm-10">
                      <CFormInput 
                        type="text" 
                        id="nip" 
                        name="nip" 
                        disabled={ state.status == "edit" }
                        defaultValue={ state.status == "edit" ? state?.data?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes.NIP : ""}
                        onChange={(e) => setNipValue(e.target.value)} placeholder="Masukkan NIP . . ." />
                    </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="name" className="col-sm-2 col-form-label">Nama</CFormLabel>
                      <div className="col-sm-10">
                        <CFormInput 
                          type="input" 
                          id="name" 
                          name="name" 
                          placeholder='Masukkan Nama Peserta' 
                          disabled
                          value={(state.status == "tambah") 
                            ? state?.registrant?.attributes?.employee?.data?.attributes?.Name || ''
                            : state?.data?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes?.Name || ''
                          } />
                      </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="position" className="col-sm-2 col-form-label">Jabatan</CFormLabel>
                      <div className="col-sm-10">
                        <CFormInput
                          type="input" 
                          id="position" 
                          name="position" 
                          placeholder='Masukkan Jabatan Peserta' 
                          disabled 
                          value={(state.status == "tambah") 
                            ? state?.registrant?.attributes?.employee?.data?.attributes?.position?.data?.attributes?.position_name || ''
                            : state?.data?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes?.position?.data?.attributes?.position_name || ''
                          }/>
                      </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="grade" className="col-sm-2 col-form-label">Grade</CFormLabel>
                      <div className="col-sm-10">
                        <CFormInput 
                          type="input" 
                          id="grade" 
                          name="grade" 
                          placeholder='Masukkan Grade Peserta' 
                          disabled 
                          value={(state.status == "tambah") 
                            ? state?.registrant?.attributes?.employee?.data?.attributes?.position?.data?.attributes?.grade?.data?.attributes?.grade_name || ''
                            : state?.data?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes?.position?.data?.attributes?.grade?.data?.attributes?.grade_name || ''
                          }/>
                      </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="schedule" className="col-sm-2 col-form-label">Jadwal Pelaksanaan</CFormLabel>
                      <div className="col-sm-10">
                        <CFormInput 
                          type="date" 
                          id="schedule" 
                          name="schedule"
                          defaultValue={ state.status == "edit" ? state?.data?.attributes?.schedule : ""}
                          placeholder='Masukkan Tanggal'/>
                      </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="projection" className="col-sm-2 col-form-label">Jabatan Proyeksi</CFormLabel>
                    <div className="col-sm-10">
                      <CFormSelect name="projection" id="projection" aria-label="Large select example">
                        <option>Pilih Proyeksi</option>
                        { positions?.map(position =>
                          <option selected={state.status == "edit" && state?.data?.attributes?.position?.data?.id == position.id } value={ position.id } key={ position.id } >{ position.attributes.position_name }</option>
                        )}
                      </CFormSelect>
                    </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="level" className="col-sm-2 col-form-label">Jenjang Jabatan</CFormLabel>
                    <div className="col-sm-10">
                      <CFormSelect name="level" id="level" aria-label="Large select example">
                        <option>Pilih Jenjang</option>
                        { levels?.map(level =>
                          <option selected={state.status == "edit" && state?.data?.attributes?.level?.data?.id == level.id } value={ level.id } key={ level.id } >{ level.attributes.functional_name } - { level.attributes.structural_name }</option>
                        )}
                      </CFormSelect>
                    </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="fitproper_type" className="col-sm-2 col-form-label">Jenis Fit and Propper</CFormLabel>
                    <div className="col-sm-10">
                      <CFormSelect id="fitproper_type" aria-label="Default select example">
                        <option>Pilih Jenis Fit & Proper</option>
                        <option selected={state.status == "edit" && state?.data?.attributes?.fitproper_type == "Offline" } value="Offline">Offline</option>
                        <option selected={state.status == "edit" && state?.data?.attributes?.fitproper_type == "Vcon" } value="Vcon">Vcon</option>
                      </CFormSelect>
                    </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="jobdesc" className="col-sm-2 col-form-label">Uraian Jabatan</CFormLabel>
                    <div className="col-sm-10">
                      <CFormInput 
                        type="text" 
                        id="jobdesc" 
                        name="jobdesc" 
                        defaultValue={ state.status == "edit" ? state?.data?.attributes?.jobdesc : "" }
                        placeholder='Masukkan Uraian Jabatan'/>
                    </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="ppt" className="col-sm-2 col-form-label">Upload PPT *.pdf</CFormLabel>
                      <div className="col-sm-10">
                        { state.status == "edit" ? <a target="_blank" href={url + state?.data?.attributes?.registrant?.data?.attributes?.ppt?.data?.attributes?.url }><CImage style={{ marginTop: "-10px", marginLeft: "-5px", marginBottom: "10px", width: "70px", height: "70px" }} src={logoPDF} height={35} /></a> : null }                         
                        <CFormInput type="file" id="ppt" name="ppt" onChange={ (e) => setState({ ...state, ppt: e.target.files[0] }) } />
                      </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="cv" className="col-sm-2 col-form-label">Upload CV *.pdf</CFormLabel>
                      <div className="col-sm-10">
                        { state.status == "edit" ? <a target="_blank" href={url + state?.data?.attributes?.registrant?.data?.attributes?.cv?.data?.attributes?.url }><CImage style={{ marginTop: "-10px", marginLeft: "-5px", marginBottom: "10px", width: "70px", height: "70px" }} src={logoPDF} height={35} /></a> : null }
                        <CFormInput type="file" id="cv" name="cv" onChange={ (e) => setState({ ...state, cv: e.target.files[0] }) } />
                      </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="penguji1" className="col-sm-2 col-form-label">Penguji 1</CFormLabel>
                    <div className="col-sm-10">
                      <CFormSelect 
                        name="penguji1" 
                        id="penguji1" 
                        disabled={ state.status == "edit" }
                        aria-label="Large select example"
                        onChange={ (e) => 
                          setExaminers2(deleteNode(e.target.value, examiners1))
                        }>
                        <option value="0">Pilih Penguji 1</option>
                        { examiners1?.map(examiner =>
                          <option selected={state.status == "edit" && state?.data?.attributes?.examiners?.data[0]?.id == examiner?.id } value={examiner?.id} key={examiner?.id}>{examiner?.attributes?.employee?.data?.attributes?.Name}</option>
                        )}
                      </CFormSelect>
                    </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="penguji2" className="col-sm-2 col-form-label">Penguji 2</CFormLabel>
                    <div className="col-sm-10">
                      <CFormSelect 
                        name="penguji2" 
                        id="penguji2" 
                        disabled={ state.status == "edit" }
                        aria-label="Large select example"
                        onChange={ (e) => 
                          setExaminers3(deleteNode(e.target.value, examiners2))
                        }>
                        <option value="0">Pilih Penguji 2</option>
                        { examiners2?.map(examiner =>
                          <option selected={state.status == "edit" && state?.data?.attributes?.examiners?.data[1]?.id == examiner?.id } value={examiner?.id} key={examiner?.id}>{examiner?.attributes?.employee?.data?.attributes?.Name}</option>                      
                        )}
                      </CFormSelect>
                    </div>
                  </CInputGroup>
                </CRow>
                <CRow className="mb-3">
                  <CInputGroup>
                    <CFormLabel htmlFor="penguji3" className="col-sm-2 col-form-label">Penguji 3</CFormLabel>
                    <div className="col-sm-10">
                      <CFormSelect name="penguji3" id="penguji3" aria-label="Large select example" disabled={ state.status == "edit" }>
                        <option value="0">Pilih Penguji 3</option>
                        { examiners3?.map(examiner =>
                          <option selected={state.status == "edit" && state?.data?.attributes?.examiners?.data[2]?.id == examiner?.id } value={examiner?.id} key={examiner?.id}>{examiner?.attributes?.employee?.data?.attributes?.Name}</option>                      
                        )}
                      </CFormSelect>
                    </div>
                  </CInputGroup>
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

export default Pendaftaran