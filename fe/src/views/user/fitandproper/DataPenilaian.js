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
import { cilSearch } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import FitAndProperAPI from '../../../config/user/FitAndProperAPI'
import WawancaraAPI from '../../../config/user/WawancaraAPI'
import MappingAPI from '../../../config/user/MappingAPI'
import EmployeeAPI from 'src/config/admin/EmployeeAPI'
import DataPesertaAPI from 'src/config/user/DataPesertaAPI'
import PositionAPI from 'src/config/admin/PositionAPI'
import url from "../../../config/setting"
import logoPDF from 'src/assets/images/pdf-icon.png'
import axios from "axios"
import LevelAPI from 'src/config/admin/LevelAPI'

const DataPenilaian = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [lineMappings, setLineMappings] = useState([])
  const [positions, setPositions] = useState([])
  const [levels, setLevels] = useState([])
  const [message, setMessage] = useState("")
  const [chosenLineMapping, setChosenLineMapping] = useState({
    visible: false,
    visible_finalized: false,
    name: "",
    lineMapping: 0    
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
      query += `&filters[mapping][registrant][employee][Name][$contains]=${document.getElementById("filter_nama").value}`
    }
    if(document.getElementById("filter_nip").value.length != 0){
      query += `&filters[mapping][registrant][employee][NIP][$contains]=${document.getElementById("filter_nip").value}`
    }
    if(document.getElementById("filter_position_before").value.length != 0){
      query += `&filters[mapping][position_current][id][$eq]=${document.getElementById("filter_position_before").value}`
    }
    if(document.getElementById("filter_projection").value.length != 0){
      query += `&filters[mapping][position][id][$eq]=${document.getElementById("filter_projection").value}`
    }
    if(document.getElementById("filter_level_before").value.length != 0){
      query += `&filters[mapping][level_current][id][$eq]=${document.getElementById("filter_level_before").value}`
    }
    if(document.getElementById("filter_level").value.length != 0){
      query += `&filters[mapping][level][id][$eq]=${document.getElementById("filter_level").value}`
    }
    if(document.getElementById("filter_jobdesc").value.length != 0){
      query += `&filters[mapping][jobdesc][$contains]=${document.getElementById("filter_jobdesc").value}`
    }
    if(document.getElementById("filter_schedule").value.length != 0){
      query += `&filters[mapping][schedule][$eq]=${document.getElementById("filter_schedule").value}`
    }
    if(document.getElementById("filter_status").value.length != 0){
      query += `&filters[status_fitproper][$eq]=${document.getElementById("filter_status").value}`
    }    

    FitAndProperAPI.findLineMapping(query).then((res) => {
      setLineMappings(res.data.data)
    })
  }
  
  const getData = () => {
    FitAndProperAPI.getLineMapping().then((res) => {
      setLineMappings(res.data.data)
    })
  }

  const daftarWawancara = () => {
    const body = {
      data: {
        schedule_interview: document.getElementById("schedule").value,
        is_interview: 'true'
      }
    }
    WawancaraAPI.edit(chosenLineMapping?.lineMapping?.id, body).then(res => {
      const body = {
        data: {
          is_interview: 'true',
          examiners_interview: [...chosenLineMapping?.lineMapping?.attributes?.mapping?.data?.attributes?.examiners_interview?.data, chosenLineMapping?.lineMapping?.attributes?.examiner?.data?.id]
        }
      }
      MappingAPI.edit(chosenLineMapping?.lineMapping?.attributes?.mapping?.data?.id, body).then(res => {
        setChosenLineMapping({ ...chosenLineMapping, visible: false })
        getData()
      })      
    })
  }

  const fitproperFinalized = () => {
    let lolos = 0
    let tidak_lolos = 0
    let sudah_finalisasi = true

    let body = {
      data: {
        fitproper_finalized: true
      }
    }
    FitAndProperAPI.editLineMapping(chosenLineMapping?.lineMapping.id, body).then(res => {
      FitAndProperAPI.findLineMappingAll(`&filters[mapping][id][$eq]=${chosenLineMapping?.lineMapping?.attributes?.mapping?.data?.id}`)
        .then(res => {
          res.data.data.map(line_mapping => {
            if(line_mapping?.attributes?.is_interview == "true"){
              if(line_mapping?.attributes?.status_interview == false){
                sudah_finalisasi = false
              }
            } else if (line_mapping?.attributes?.is_interview == "false") {
              if(line_mapping?.attributes?.status_fitproper == false){
                sudah_finalisasi = false
              }          
            } else if (line_mapping?.attributes?.is_interview == "not_decided"){
              sudah_finalisasi = false
            }
          })
          if(sudah_finalisasi){
            res.data.data.map(line_mapping => {
              if(line_mapping?.attributes?.is_interview == "true"){
                if(line_mapping?.attributes?.passed_interview == "passed"){
                  lolos++
                } else if (line_mapping?.attributes?.passed_interview == "not_passed"){
                  tidak_lolos++
                }
              } else if (line_mapping?.attributes?.is_interview == "false") {
                if(line_mapping?.attributes?.passed_fitproper == "passed"){
                  lolos++
                } else if(line_mapping?.attributes?.passed_fitproper == "not_passed"){
                  tidak_lolos++
                }
              }
            })      
            body = {
              data: {
                status: (lolos > tidak_lolos) ? "passed" : "not_passed"
              }
            }    
            MappingAPI.edit(chosenLineMapping?.lineMapping?.attributes?.mapping?.data?.id, body).then(
              (res) => {
                body = {
                  data: {
                    status: 'non_active'
                  }
                }
                DataPesertaAPI.edit(chosenLineMapping?.lineMapping?.attributes?.mapping?.data?.attributes?.registrant?.data?.id, body).then(
                  (res) => {
                    if(lolos > tidak_lolos){
                      body = {
                        data: {
                          position: chosenLineMapping?.lineMapping?.attributes?.mapping?.data?.attributes?.position?.data?.id,
                          level: chosenLineMapping?.lineMapping?.attributes?.mapping?.data?.attributes?.level?.data?.id
                        }
                      }
                      EmployeeAPI.edit(chosenLineMapping?.lineMapping?.attributes?.mapping?.data?.attributes?.registrant?.data?.attributes?.employee?.data?.id, body).then(
                        (res) => {
                          setChosenLineMapping({ ...chosenLineMapping, visible_finalized: false })   
                          getData()                        
                        },
                        (err) => {
                          console.log(err.message)
                        }
                      )
                    }
                  },
                  (err) => {
                    console.log(err.message)
                  }
                )
              },
              (err) => {
                console.log(err.message)
              }              
            )
          }
        }
      )
      setChosenLineMapping({ ...chosenLineMapping, visible_finalized: false })    
      getData()        
    })
  }

  const tidakPerluWawancara = () => {
    const body = {
      data: {
        is_interview: 'false'
      }
    }
    FitAndProperAPI.editLineMapping(chosenLineMapping?.lineMapping.id, body).then(res => {
      setChosenLineMapping({ ...chosenLineMapping, visible: false })
      getData()      
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
                    <CFormLabel htmlFor="exampleFormControlInput1">Nama lengkap</CFormLabel>
                    <CFormInput
                      type="text"
                      name='filter_nama'
                      id="filter_nama"
                      placeholder="Masukkan Kata Kunci Pencarian . . ."
                    />
                  </CCol>
                  <CCol xs={6}>
                    <CFormLabel htmlFor="exampleFormControlInput1">NIP</CFormLabel>
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
                <CRow className='mt-3'>
                  <CCol xs={12}>
                    <CFormLabel htmlFor="filter_status">Status</CFormLabel>
                    <CFormSelect name="filter_status" id="filter_status" aria-label="Large select example">
                      <option value="">Pilih Status</option>
                      <option value="true">Sudah Dinilai</option>
                      <option value="false">Belum Dinilai</option>
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
            <strong>Data Penilaian Fit & Proper</strong>
          </CCardHeader>
          <CCardBody style={{ overflowX: "auto"}}>
            <CTable striped className='text-center'>
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
                  <CTableHeaderCell scope="col">Status</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Lampiran File</CTableHeaderCell>
                  <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody>
                { lineMappings.map( (linemapping, index) =>
                  <CTableRow key={linemapping.id}>
                    <CTableHeaderCell scope="row">{ index+1 }</CTableHeaderCell>
                    <CTableDataCell>
                      <img className='foto_karyawan' src={url + linemapping?.attributes?.mapping?.data?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes?.Photo?.data?.attributes?.formats?.thumbnail?.url} alt="Photo" />                      
                    </CTableDataCell>
                    <CTableDataCell>{linemapping?.attributes?.mapping?.data?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes.Name}</CTableDataCell>
                    <CTableDataCell>{linemapping?.attributes?.mapping?.data?.attributes?.registrant?.data?.attributes?.employee?.data?.attributes.NIP}</CTableDataCell>
                    <CTableDataCell>{linemapping?.attributes?.mapping?.data?.attributes?.position_current?.data?.attributes?.position_name}</CTableDataCell>
                    <CTableDataCell>{linemapping?.attributes?.mapping?.data?.attributes?.position?.data?.attributes?.position_name}</CTableDataCell>
                    <CTableDataCell>{linemapping?.attributes?.mapping?.data?.attributes?.level_current?.data?.attributes?.functional_name} - {linemapping?.attributes?.mapping?.data?.attributes?.level_current?.data?.attributes?.structural_name}</CTableDataCell>
                    <CTableDataCell>{linemapping?.attributes?.mapping?.data?.attributes?.level?.data?.attributes?.functional_name} - {linemapping?.attributes?.mapping?.data?.attributes?.level?.data?.attributes?.structural_name}</CTableDataCell>
                    <CTableDataCell>{linemapping?.attributes?.mapping?.data?.attributes?.jobdesc}</CTableDataCell>
                    <CTableDataCell>{linemapping?.attributes?.mapping?.data?.attributes?.schedule}</CTableDataCell>
                    <CTableDataCell>
                      { linemapping?.attributes?.status_fitproper
                          ? linemapping?.attributes?.passed_fitproper == "passed" 
                            ? "Sudah Dinilai" + '\n' + "(Lulus)"
                            : "Sudah Dinilai" + '\n' + "(Tidak Lulus)"
                          : "Belum Dinilai"
                      }                      
                    </CTableDataCell>
                    <CTableDataCell>
                      <ul>
                          <li style={{ textAlign: "left", marginBottom: "4px" }}>
                            <p>CV</p>
                            <a target="_blank" href={url + linemapping?.attributes?.mapping?.data?.attributes?.registrant?.data?.attributes?.cv?.data?.attributes?.url }><CImage style={{ marginTop: "-10px", marginLeft: "-5px" }} src={logoPDF} height={35} /></a>
                          </li>
                          <li style={{ textAlign: "left" }}>
                            <p>PPT</p>
                            <a target="_blank" href={ url + linemapping?.attributes?.mapping?.data?.attributes?.registrant?.data?.attributes?.ppt?.data?.attributes?.url }><CImage style={{ marginTop: "-10px", marginLeft: "-5px" }} src={logoPDF} height={35} /></a>
                          </li>                            
                      </ul>
                    </CTableDataCell>
                    <CTableDataCell>
                      { (linemapping?.attributes?.status_fitproper && linemapping?.attributes?.is_interview == 'not_decided') ? 
                        <CButton
                          color='dark'
                          variant="outline" 
                          style={{width: '120px', margin: '5px 5px'}}                    
                          onClick={() => setChosenLineMapping({ 
                            visible: true, 
                            lineMapping: linemapping
                          })} >
                            Wawancara
                        </CButton>
                        : null
                      }
                      { (linemapping?.attributes?.status_fitproper) ? 
                        <CButton
                          color='success'
                          variant="outline"
                          style={{width: '120px', margin: '5px 5px'}}                          
                          onClick={() => navigate(
                            '/fitandproper/datapenilaian/datanilai', 
                            { state: { 
                                position: linemapping?.attributes?.mapping?.data?.attributes?.position?.data?.id, 
                                registrant: linemapping?.attributes?.mapping?.data?.attributes?.registrant?.data?.id,
                                examiner: linemapping?.attributes?.examiner?.data?.id
                            }}
                          )} >
                            Lihat Nilai
                        </CButton>
                        : null
                      }
                      { (linemapping?.attributes?.status_fitproper && !linemapping?.attributes?.fitproper_finalized) ? 
                        <CButton
                          color='warning'
                          variant="outline"
                          style={{width: '120px', margin: '5px 5px'}}                          
                          onClick={() => navigate(
                            '/fitandproper/datapenilaian/nilai/edit', 
                            { state: { data: linemapping, status: 'edit' }}
                          )} >
                            Edit
                        </CButton>
                        : null
                      }
                      { (linemapping?.attributes?.status_fitproper && !linemapping?.attributes?.fitproper_finalized && linemapping?.attributes?.is_interview != 'not_decided') ? 
                        <CButton
                          color='primary'
                          variant="outline"
                          style={{width: '120px', margin: '5px 5px'}}                          
                          onClick={() => setChosenLineMapping({ 
                            visible_finalized: true, 
                            lineMapping: linemapping
                          })} >
                            Finalisasi
                        </CButton>
                        : null
                      }
                      { (!linemapping?.attributes?.status_fitproper) ?
                        <CButton
                          color='primary'
                          variant="outline" 
                          style={{width: '120px', margin: '5px 5px'}}
                          onClick={() => navigate(
                            '/fitandproper/datapenilaian/nilai', 
                            { state: { data: linemapping, status: 'tambah' } }
                          )} >
                            Nilai
                        </CButton>
                        : null
                      }
                    </CTableDataCell>
                  </CTableRow>
                )}
              </CTableBody>
            </CTable>
            <CModal backdrop="static" visible={chosenLineMapping.visible} onClose={() => setChosenLineMapping({ visible: false })}>
              <CModalHeader>
                <CModalTitle>Apakah Diperlukan Wawancara?</CModalTitle>
              </CModalHeader>
              <CModalBody>
                Tentukan tanggal dan klik tombol ajukan untuk melanjutkan penilaian ke tahap wawancara:
                <CRow className='mt-2'>
                  <CCol>
                    <CFormInput 
                      type="date" 
                      id="schedule" 
                      name="schedule"
                      placeholder='Masukkan Tanggal'/>                    
                  </CCol>
                </CRow>
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setChosenLineMapping({ visible: false })}>
                  Close
                </CButton>
                <CButton color="danger" onClick={() => tidakPerluWawancara()}>
                  Tidak Perlu
                </CButton>
                <CButton color="primary" onClick={() => daftarWawancara()}>Ajukan</CButton>
              </CModalFooter>
            </CModal>             
            <CModal backdrop="static" visible={chosenLineMapping.visible_finalized} onClose={() => setChosenLineMapping({ visible: false })}>
              <CModalHeader>
                <CModalTitle>Apakah Anda Yakin?</CModalTitle>
              </CModalHeader>
              <CModalBody>
                Dengan ini nilai akan difinalisasi dan data tidak dapat diubah kembali!
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setChosenLineMapping({ visible: false })}>
                  Close
                </CButton>
                <CButton color="primary" onClick={() => fitproperFinalized()}>Finalisasi</CButton>
              </CModalFooter>
            </CModal>                         
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default DataPenilaian