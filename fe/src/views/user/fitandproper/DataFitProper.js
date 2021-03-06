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
  CModal,
  CModalBody,
  CModalFooter,
  CModalHeader,
  CModalTitle,
  CAccordion,
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem, 
  CFormLabel,
  CAlert,
  CForm,
  CImage,
  CFormSelect
} from '@coreui/react'
import { useLocation, useNavigate } from "react-router-dom"
import { cilSearch, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import MappingAPI from '../../../config/user/MappingAPI'
import PositionAPI from '../../../config/admin/PositionAPI'
import url from "../../../config/setting"
import logoPDF from 'src/assets/images/pdf-icon.png'
import ScoreAPI from 'src/config/user/ScoreAPI'
import FitAndProperAPI from 'src/config/user/FitAndProperAPI'
import LevelAPI from 'src/config/admin/LevelAPI'
import axios from "axios"

const DataFitProper = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [mappings, setMappings] = useState([])
  const [levels, setLevels] = useState([])
  const [positions, setPositions] = useState([])
  const [message, setMessage] = useState("")
  const [chosenMapping, setChosenMapping] = useState({
    visible: false,
    name: "",
    id: 0    
  })

  useEffect(() => {
    setMessage(location?.state?.successMessage)
    getData()
    axios.all([PositionAPI.get(), LevelAPI.get()]).then(
      axios.spread((...res) => {
        setPositions(res[0].data.data),
        setLevels(res[1].data.data)
      })
    )    
  }, [])  

  const filterSearch = (e) => {
    e.preventDefault()

    let query = ""
    if(document.getElementById("filter_nama").value.length != 0){
      query += `&filters[registrant][employee][Name][$contains]=${document.getElementById("filter_nama").value}`
    }
    if(document.getElementById("filter_nip").value.length != 0){
      query += `&filters[registrant][employee][NIP][$contains]=${document.getElementById("filter_nip").value}`
    }
    if(document.getElementById("filter_position_before").value.length != 0){
      query += `&filters[position_current][id][$eq]=${document.getElementById("filter_position_before").value}`
    }
    if(document.getElementById("filter_projection").value.length != 0){
      query += `&filters[position][id][$eq]=${document.getElementById("filter_projection").value}`
    }
    if(document.getElementById("filter_level_before").value.length != 0){
      query += `&filters[level_current][id][$eq]=${document.getElementById("filter_level_before").value}`
    }
    if(document.getElementById("filter_level").value.length != 0){
      query += `&filters[level][id][$eq]=${document.getElementById("filter_level").value}`
    }
    if(document.getElementById("filter_jobdesc").value.length != 0){
      query += `&filters[jobdesc][$contains]=${document.getElementById("filter_jobdesc").value}`
    }
    if(document.getElementById("filter_schedule").value.length != 0){
      query += `&filters[schedule][$eq]=${document.getElementById("filter_schedule").value}`
    }
    MappingAPI.findFitProper(query).then((res) => {
      setMappings(res.data.data)
    })  
  }
  
  const getData = () => {
    MappingAPI.get().then((res) => {
      setMappings(res.data.data)
    })
  }

  const deleteData = () => {
    MappingAPI.getOne(chosenMapping.id).then((res) => {
      res.data.data.attributes.line_mappings.data.forEach(line_mapping => {
        line_mapping.attributes.scores_fitproper.data.forEach(score_fitproper => {
          ScoreAPI.delete(score_fitproper.id)
        })
        line_mapping.attributes.scores_interview.data.forEach(score_interview => {
          ScoreAPI.delete(score_interview.id)
        })
        FitAndProperAPI.deleteLineMapping(line_mapping.id)
      })
      MappingAPI.delete(res.data.data.id).then(res => {
        setMessage("Pendaftaran Telah Dihapus")
        setChosenMapping({ visible: false })
        getData()
      })
    })
  }

  return (
    <CRow>
      <CCol>
        <CAccordion>
          <CAccordionItem itemKey={1}>
            <CAccordionHeader><CIcon icon={cilSearch} style={{ marginRight: "10px" }}/>Pencarian Data</CAccordionHeader>
            <CAccordionBody>
              <CForm onSubmit={filterSearch}>
                <CRow className='mt-2'>
                  <CCol xs={6}>
                    <CFormLabel htmlFor="filter_nama">Nama lengkap</CFormLabel>
                    <CFormInput
                      type="text"
                      name='filter_nama'
                      id="filter_nama"
                      placeholder="Masukkan Kata Kunci Pencarian . . ."
                    />
                  </CCol>
                  <CCol xs={6}>
                    <CFormLabel htmlFor="filter_nip">NIP</CFormLabel>
                    <CFormInput
                      type="text"
                      name='filter_nip'
                      id="filter_nip"
                      placeholder="Masukkan Kata Kunci Pencarian . . ."
                    />
                  </CCol>
                </CRow>
                <CRow className='mt-3'>
                  <CCol xs={6}>
                    <CFormLabel htmlFor="filter_position_before">Jabatan Sebelumnya</CFormLabel>
                    <CFormSelect name="filter_position_before" id="filter_position_before" aria-label="Large select example">
                      <option value="">Pilih Jabatan Sebelumnya</option>
                      { positions.map(position =>
                        <option key={ position.id } value={ position.id } >{ position.attributes.position_name }</option>
                      )}
                    </CFormSelect>
                  </CCol>
                  <CCol xs={6}>
                    <CFormLabel htmlFor="filter_projection">Proyeksi Jabatan</CFormLabel>
                    <CFormSelect name="filter_projection" id="filter_projection" aria-label="Large select example">
                      <option value="">Pilih Proyeksi</option>
                      { positions.map(position =>
                        <option key={ position.id } value={ position.id } >{ position.attributes.position_name }</option>
                      )}
                    </CFormSelect>
                  </CCol>                
                </CRow>
                <CRow className='mt-3'>
                  <CCol xs={6}>
                    <CFormLabel htmlFor="filter_level_before">Jenjang Sebelumnya</CFormLabel>
                    <CFormSelect name="filter_level_before" id="filter_level_before" aria-label="Large select example">
                      <option value="">Pilih Jenjang Sebelumnya</option>
                      { levels.map(level =>
                        <option key={ level.id } value={ level.id }>{ level.attributes.functional_name } - { level.attributes.structural_name }</option>
                      )}
                    </CFormSelect>
                  </CCol>
                  <CCol xs={6}>
                    <CFormLabel htmlFor="filter_level">Jenjang Jabatan</CFormLabel>
                    <CFormSelect name="filter_level" id="filter_level" aria-label="Large select example">
                      <option value="">Pilih Jenjang Jabatan</option>
                      { levels.map(level =>
                        <option key={ level.id } value={ level.id }>{ level.attributes.functional_name } - { level.attributes.structural_name }</option>
                      )}
                    </CFormSelect>
                  </CCol>                
                </CRow>
                <CRow className='mt-3'>
                  <CCol xs={6}>
                    <CFormLabel htmlFor="filter_jobdesc">Uraian Jabatan</CFormLabel>
                    <CFormInput type="text" name="filter_jobdesc" id="filter_jobdesc" placeholder='Masukkan Uraian Jabatan . . .' />
                  </CCol>
                  <CCol xs={6}>
                    <CFormLabel htmlFor="filter_schedule">Tanggal Pelaksanaan</CFormLabel>
                    <CFormInput type="date" name="filter_schedule" id="filter_schedule"/>
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
                      style={{ width:'10%', borderRadius: "50px", fontSize: "14px" }} >
                        <CIcon icon={cilSearch} style={{ marginRight: "10px", color: "#FFFFFF" }}/>
                        Cari
                    </CButton>                                          
                  </CCol>
                </CRow>
              </CForm>
            </CAccordionBody>
          </CAccordionItem>
        </CAccordion>   
        <CCol xs={12} className="mt-3">
          { message && <CAlert color="success" dismissible onClose={() => { setMessage("") }}> { message } </CAlert> }
        </CCol>                 
        <CCard className="mb-4 mt-3">
          <CCardHeader>
            <strong>Data Pendaftaran Fit & Proper</strong>
          </CCardHeader>
          <CCardBody style={{ overflowX: "auto"}}>
            <CRow>
              <CCol xs={12}>
                <CButton
                  color='primary'
                  style={{width:'19%', borderRadius: "50px", fontSize: "14px"}}
                  onClick={() => 
                    navigate('/fitandproper/daftar', {state: { status: 'tambah' } })
                  } >
                    <CIcon icon={cilPlus} style={{ marginRight: "10px", color: "#FFFFFF" }}/>
                    Tambah Pendaftaran
                </CButton>
              </CCol>
            </CRow>
              <CTable striped className='mt-1 text-center'>
                <CTableHead>
                   <CTableRow>
                    <CTableHeaderCell scope="col">No</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Foto</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                    <CTableHeaderCell scope="col">NIP</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Jabatan Sebelumnya</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Proyeksi</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Jenjang Sebelumnya</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Jenjang</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Uraian Jabatan</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tanggal</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Penguji</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Lampiran File</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  { mappings.map( (mapping, index) =>
                    <CTableRow key={mapping.id}>
                      <CTableHeaderCell scope="row">{ index+1 }</CTableHeaderCell>
                      <CTableDataCell>
                        <img className='foto_karyawan' src={url + mapping?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes?.Photo?.data?.attributes?.formats?.thumbnail?.url} alt="Photo" />                      
                      </CTableDataCell>
                      <CTableDataCell>{mapping?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes.Name}</CTableDataCell>
                      <CTableDataCell>{mapping?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes.NIP}</CTableDataCell>
                      <CTableDataCell>{mapping?.attributes?.position_current?.data?.attributes?.position_name}</CTableDataCell>
                      <CTableDataCell>{mapping?.attributes?.position?.data?.attributes?.position_name}</CTableDataCell>
                      <CTableDataCell>{mapping?.attributes?.level_current?.data?.attributes?.functional_name} - {mapping?.attributes?.level_current?.data?.attributes?.structural_name}</CTableDataCell>
                      <CTableDataCell>{mapping?.attributes?.level?.data?.attributes?.functional_name} - {mapping?.attributes?.level?.data?.attributes?.structural_name}</CTableDataCell>
                      <CTableDataCell>{mapping?.attributes?.jobdesc}</CTableDataCell>
                      <CTableDataCell>{mapping?.attributes?.schedule}</CTableDataCell>
                      <CTableDataCell>
                        <ul>
                          { mapping.attributes.examiners.data.map(examiner  => (
                              <li style={{ textAlign: "left", marginBottom: "4px" }} key={examiner.id}>{examiner.attributes.employee.data.attributes.Name}</li>
                          ))}
                        </ul>
                      </CTableDataCell>
                      <CTableDataCell>
                        <ul>
                            <li style={{ textAlign: "left", marginBottom: "4px" }}>
                              <p>CV</p>
                              <a target="_blank" href={url + mapping?.attributes?.registrant?.data?.attributes?.cv?.data?.attributes?.url }><CImage style={{ marginTop: "-10px", marginLeft: "-5px" }} src={logoPDF} height={35} /></a>
                            </li>
                            <li style={{ textAlign: "left" }}>
                              <p>PPT</p>
                              <a target="_blank" href={ url + mapping?.attributes?.registrant?.data?.attributes?.ppt?.data?.attributes?.url }><CImage style={{ marginTop: "-10px", marginLeft: "-5px" }} src={logoPDF} height={35} /></a>
                            </li>                            
                        </ul>
                      </CTableDataCell>
                      <CTableDataCell>
                        {mapping?.attributes?.status == "on_progress" 
                          ? "Belum Finalisasi" 
                          : mapping?.attributes?.status == "passed" 
                            ? "Sudah Finalisasi" + '\n' + "(Lulus)"
                            : "Sudah Finalisasi" + '\n' + "(Tidak Lulus)" 
                        }
                      </CTableDataCell>
                      <CTableDataCell>
                        <CButton
                          color='success'
                          variant="outline"
                          style={{width: '75px', margin: '5px 5px'}}
                          onClick={() => navigate(
                            '/fitandproper/datapenilaian/datanilai', 
                            { state: { position: mapping?.attributes?.position?.data?.id, registrant: mapping?.attributes?.registrant?.data?.id } }
                          )}>
                            Lihat Nilai
                        </CButton>
                        {
                          ( mapping.attributes.status == 'on_progress' ) 
                          ? <CButton 
                              color={'warning'} 
                              variant="outline" 
                              style={{width: '75px', margin: '5px 5px'}}
                              onClick={() => 
                                navigate('/fitandproper/edit', {state: { data: mapping, status: 'edit' } })
                              }>
                                Edit
                            </CButton>  
                          : null                                              
                        }
                        <CButton
                          color='danger'
                          variant="outline"                
                          style={{width: '75px', margin: '5px 5px'}}
                          onClick={() => setChosenMapping({ 
                            visible: true, 
                            id: mapping.id
                          })}>
                            Hapus
                        </CButton>                        
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            <CModal backdrop="static" visible={chosenMapping.visible} onClose={() => setChosenMapping({ visible: false })}>
              <CModalHeader>
                <CModalTitle>Are You Sure?</CModalTitle>
              </CModalHeader>
              <CModalBody>
                This will remove permanently
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setChosenMapping({ visible: false })}>
                  Close
                </CButton>
                <CButton color="danger" onClick={() => deleteData()}>Delete</CButton>
              </CModalFooter>
            </CModal>           
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DataFitProper
