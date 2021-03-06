import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CButton,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CFormLabel,
  CAlert,
  CCallout,  
  CForm,
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CFormSelect,
  CSpinner  
} from '@coreui/react'
import { useLocation, useNavigate } from "react-router-dom"
import { cilX, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import CriteriaAPI from '../../../config/admin/CriteriaAPI'
import FitAndProperAPI from '../../../config/user/FitAndProperAPI'
import ScoreAPI from 'src/config/user/ScoreAPI'

const Penilaian = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [selectedCriteria, setSelectedCriteria] = useState([])
  const [criterias, setCriterias] = useState([])
  const [message, setMessage] = useState("")
  const [state, setState] = useState({
    lineMapping: location?.state?.data,
    status: location?.state?.status,
    visibleSubmit: false,
    visiblePenggunaan: false,
    nilaiMax: 0,
    totalNilai: 0,
    interviewValue: ""
  })

  useEffect(() => {
    if(state.status == "edit"){
      getEditScore()
    }
    getData()
  }, [])  
  
  const tambahKriteria = (event) => {
    event.preventDefault()

    const body = {
      data: {
        criteria: document.getElementById("criteria").value,
        value: document.getElementById("value").value,
        defaultUsed: document.getElementById("defaultused").value,
        useFor: document.getElementById("usefor").value,
      }
    }

    CriteriaAPI.add(body).then(
      (res) => {
        CriteriaAPI.findById(res.data.data.id).then((res) => {
          setSelectedCriteria([...selectedCriteria, res.data.data[0]])
          let temp = [...criterias]
          const index = criterias.map( e => {
            return e.id
          }).indexOf(res.data.data[0].id)
          temp.splice(index, 1)
          setCriterias([...temp])
          document.getElementById("criteria").value = "",
          document.getElementById("value").value = "",
          document.getElementById("usefor").value = "999"
          document.getElementById("defaultused").value = "999"
          setState({ ...state, interviewValue: "" })
          setMessage('Kriteria Telah Berhasil Ditambahkan!')
        })
      },
      (err) => {
        setMessage(err.message)
      }
    ) 
  }

  const postData = (e) => {
    e.preventDefault()

    const data = document.querySelector('#body').children
    for (let i = 0; i < data.length-1; i++) {
      setState({ 
        ...state, 
        visibleSubmit: true,
        nilaiMax: state.nilaiMax += parseInt(100 / 100 * data[i].querySelector('#criteria').getAttribute('bobot_val')),
        totalNilai: state.totalNilai += parseInt(data[i].querySelector('#nilai').value / 100 * data[i].querySelector('#criteria').getAttribute('bobot_val'))
      })
      if(state.status == "tambah"){
        const body = {
          data : {
            line_mapping_interview: state?.lineMapping?.id,
            registrant: state?.lineMapping?.attributes?.mapping?.data?.attributes?.registrant?.data?.id,
            examiner: state?.lineMapping?.attributes?.examiner?.data?.id,
            criterion: data[i].querySelector('#criteria').getAttribute('id_val'),
            score: data[i].querySelector('#nilai').value,
            type: 2
          }
        }
        ScoreAPI.add(body).then(
          (res) => {
            const body = {
              data : {
                status_interview: true,
                passed_interview: (state.totalNilai >= ((75*state.nilaiMax)/100)) ? 'passed' : 'not_passed'
              }
            }
            FitAndProperAPI.editLineMapping(state?.lineMapping?.id, body).then(
              (res) => {
                navigate('/wawancara/datapenilaian', {state: { successMessage: 'Penilaian Berhasil' } })        
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
          data : {
            score: data[i].querySelector('#nilai').value,
          }
        }
        ScoreAPI.edit(data[i].querySelector('#nilai').getAttribute('id_score'), body).then(
          (res) => {
            navigate('/wawancara/datapenilaian', {state: { successMessage: 'Penilaian Berhasil Diperbaharui' } })        
          }, 
          (err) => {
            setMessage(err.message)
            setState({ ...state, visibleSubmit: false })
          }
        )        
      }
    }
  }

  const getEditScore = () => {
    ScoreAPI.getWawancaraPenilaian(state?.lineMapping?.id).then((res) => {
      setSelectedCriteria(res.data.data)
    })    
  }

  const removeRow = (index) => {
    let temp = [...selectedCriteria]
    setCriterias([...criterias, temp[index]])
    temp.splice(index, 1)
    setSelectedCriteria([...temp])
  }

  const addRow = (id) => {
    CriteriaAPI.findById(id).then((res) => {
      setSelectedCriteria([...selectedCriteria, res.data.data[0]])
      let temp = [...criterias]
      const index = criterias.map( e => {
        return e.id
      }).indexOf(res.data.data[0].id)
      temp.splice(index, 1)
      setCriterias([...temp])
    })
  }

  const getData = () => {
    CriteriaAPI.find(state.lineMapping?.attributes?.mapping?.data?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes?.level?.data?.attributes?.functional_name.includes("Manajemen Dasar") ? "&filters[useFor][$contains]=md" : "&filters[useFor][$contains]=am").then(
      (res) => {
        setCriterias(res.data.data)
      }
    )
  }

  return (
    <CRow>
      <CCol>
        <CCol xs={12}>
          <CCallout color="info" className="bg-white">
            <p style={{ fontSize: "18px", marginBottom: "4px" }}><b>Catatan Pengisian</b></p>
            <ul className='catatan'>
              <li>Sebelum submit, pastikan seluruh data yang dimasukkan valid</li>
              <li>Data yang dimasukkan berupa pemilihan dan penilaian pada setiap kriteria</li>
              <li>Untuk memaksimalkan penilaian, perhatikan bobot pada setiap kriteria</li>
              <li>Nilai yang dapat dimasukkan memiliki jangkauan 0 - 100</li>
              <li>Sistem memungkinkan penguji untuk dapat menambahkan kriteria baru</li>
            </ul>
          </CCallout>
        </CCol>
        {
          state.status == "tambah" ?
            <CAccordion>
              <CAccordionItem itemKey={1}>
                <CAccordionHeader><CIcon icon={cilPlus} style={{ marginRight: "10px" }}/>Tambah Kriteria</CAccordionHeader>
                <CAccordionBody>
                  <CForm onSubmit={tambahKriteria}>
                    <CRow className='mt-2'>
                      <CCol xs={6}>
                        <CFormLabel htmlFor="criteria">Nama Kriteria</CFormLabel>
                        <CFormInput 
                          type="text" 
                          name="criteria" 
                          id="criteria" 
                          placeholder='Masukkan Kriteria Penilaian . . .' />
                      </CCol>
                      <CCol xs={6}>
                        <CFormLabel htmlFor="value">Bobot</CFormLabel>
                        <CFormInput 
                          type="number"
                          name="value"
                          id="value"
                          placeholder='Masukkan Bobot . . .' />
                      </CCol>
                    </CRow>               
                    <CRow className='mt-3'>                  
                      <CCol xs={6}>
                        <CFormLabel htmlFor="defaultused">Kategori</CFormLabel>
                        <CFormSelect 
                          name="defaultused" 
                          id="defaultused" 
                          className="mb-3" 
                          aria-label="Large select example"
                          onChange={(e) => (e.target.value == "fitproper" || e.target.value == "999") ? setState({ ...state, visiblePenggunaan: true, interviewValue: "" }) : setState({ ...state, visiblePenggunaan: false, interviewValue: "am/md" }) } >
                          <option value="999">Pilih Kategori</option>
                          <option value="fitproper">Fit & Proper</option>
                          <option value="interview">Wawancara</option>
                        </CFormSelect>
                      </CCol>
                      <CCol xs={6}>
                        <CFormLabel htmlFor="usefor">Penggunaan</CFormLabel>
                        <CFormSelect name="usefor" id="usefor" className="mb-3" aria-label="Large select example" disabled={ state.visiblePenggunaan == false }>
                          <option value="999">Pilih Penggunaan</option>
                          <option value="am">Manajemen Atas</option>
                          <option value="md">Manajemen Dasar</option>
                          <option selected={ state.interviewValue == "am/md" } value="am/md">Manajemen Atas/Manajemen Dasar</option>
                        </CFormSelect>
                      </CCol>
                    </CRow>
                    <CRow>
                      <hr className='mt-4' style={{ marginLeft: "12px", width: "97.6%" }} />
                    </CRow>
                    <CRow>
                      <CCol style={{ display: "flex", justifyContent: "right" }}>
                        <CButton
                          type='submit'
                          color='primary'
                          style={{ width:'18%', borderRadius: "50px", fontSize: "14px" }} >
                            <CIcon icon={cilPlus} style={{ marginRight: "10px", color: "#FFFFFF" }}/>
                            Tambah Kriteria
                        </CButton>                                          
                      </CCol>
                    </CRow>
                  </CForm>
                </CAccordionBody>
              </CAccordionItem>
            </CAccordion>
          : null
        }         
        <CCol xs={12} className="mt-3">
          { message && <CAlert color="success" dismissible onClose={() => { setMessage("") }}> { message } </CAlert> }
        </CCol>                 
        <CCard className="mb-4 mt-3">
          <CCardHeader>
            <strong>Formulir Penilaian</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={postData}>
              <CTable striped className='mt-3 text-center'>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">No</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Kriteria Penilaian</CTableHeaderCell>
                    <CTableHeaderCell scope="col" width="100">Bobot</CTableHeaderCell>
                    <CTableHeaderCell scope="col" width="100">Nilai</CTableHeaderCell>
                    <CTableHeaderCell scope="col" width="100">Aksi</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody id="body">
                  { selectedCriteria?.map( (criteria, index) => (
                    <CTableRow key={criteria?.id}>
                      <CTableHeaderCell scope="row">{ index+1 }</CTableHeaderCell>
                      <CTableDataCell id='criteria' id_val={ criteria?.id } bobot_val={criteria?.attributes?.value}>{ (state.status == "tambah") ? criteria?.attributes?.criteria : criteria?.attributes?.criterion?.data?.attributes?.criteria }</CTableDataCell>
                      <CTableDataCell>{  (state.status == "tambah") ? criteria?.attributes?.value + "%" : criteria?.attributes?.criterion?.data?.attributes?.value }</CTableDataCell>
                      <CTableDataCell>
                        <CFormInput type="number" min={0} max={100} id="nilai" id_score={ (state.status == "edit") ? criteria?.id : '' } name='nilai' defaultValue={state.status == "edit" ? criteria?.attributes?.score : '' } />
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color='transparent'
                          onClick={ () => removeRow(index) }>
                          <CIcon
                            icon={cilX} 
                            style={{ width: "30px", height: "30px" }}/>
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                  {
                    state.status == "tambah" ?                              
                    <CTableRow id='set-criteria'>
                      <CTableDataCell colSpan={2} className='criteria'>
                        <CFormSelect style={{ marginTop: "15px" }} className="mb-3" aria-label="Large select example" name="used_criteria" id="used_criteria">
                          <option>Pilih Kriteria</option>
                          {criterias.map(criteria => (
                            <option key={criteria.id} value={criteria.id}>{ criteria.attributes.criteria }</option>
                          ))}  
                        </CFormSelect>
                      </CTableDataCell>
                      <CTableDataCell colSpan={3}>
                        <CButton
                          color='primary'
                          style={{ width: "100%", borderRadius: "50px", fontSize: "14px" }}
                          onClick={() => addRow(document.getElementById("used_criteria").value)} >
                            Tambah Penilaian
                        </CButton>
                      </CTableDataCell>
                    </CTableRow>
                    : null 
                  }
                </CTableBody>
              </CTable>
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

export default Penilaian