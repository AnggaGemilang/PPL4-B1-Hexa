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
  CFormSelect  
} from '@coreui/react'
import { useLocation, useNavigate } from "react-router-dom"
import { cilSearch, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import DivisionAPI from '../../../config/admin/DivisionAPI'
import DirectorateAPI from '../../../config/admin/DirectorateAPI'

const Division = () => {
  const location = useLocation() 
  const navigate = useNavigate() 
   
  const [divisions, setDivisions] = useState([])
  const [directorates, setDirectorates] = useState([])
  const [message, setMessage] = useState("")
  const [chosenDivision, setChosenDivision] = useState({
    visible: false,
    name: "",
    id: 0,
  })
  
  useEffect(() => {
    setMessage(location?.state?.successMessage)
    DirectorateAPI.get().then((res) => {
      setDirectorates(res.data.data)
    })
    getData()
  }, [])    

  const filterSearch = (e) => {
    e.preventDefault()

    let query = ""
    if(document.getElementById("filter_nama").value.length != 0){
      query += `&filters[division_name][$contains]=${document.getElementById("filter_nama").value}`
    }
    if(document.getElementById("filter_directorate").value.length != 0){
      query += `&filters[directorate][id][$eq]=${document.getElementById("filter_directorate").value}`
    }

    DivisionAPI.find(query).then(
      (res) => {
        if(res.data.data.length != 0){
          setDivisions(res.data.data)
        } else {
          setDivisions([])
        }
      }
    )
  }

  const getData = () => {
    DivisionAPI.get().then((res) => {
      setDivisions(res.data.data)
    })
  }

  const deleteData = () => {
    DivisionAPI.delete(chosenDivision.id).then((res) => {
      setChosenDivision({ ...chosenDivision, visible: false })
      setMessage("Divisi Telah Berhasil Dihapus!")        
      getData()
    })
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCol xs={12}>
          <CAccordion>
            <CAccordionItem itemKey={1}>
              <CAccordionHeader><CIcon icon={cilSearch} style={{ marginRight: "10px" }}/>Pencarian Data</CAccordionHeader>
              <CAccordionBody>
                <CForm onSubmit={filterSearch}>
                  <CRow className='mt-2'>
                    <CCol xs={6}>
                      <CFormLabel htmlFor="filter_nama">Nama Divisi</CFormLabel>
                      <CFormInput
                        type="text"
                        name='filter_nama'
                        id="filter_nama"
                        placeholder="Masukkan Nama Divisi . . ."
                      />
                    </CCol>
                    <CCol xs={6}>
                      <CFormLabel htmlFor="filter_directorate">Direktorat</CFormLabel>
                      <CFormSelect name="filter_directorate" id="filter_directorate" aria-label="Large select example">
                        <option value="">Pilih Direktorat</option>
                        { directorates.map(directorate =>
                          <option key={ directorate.id } value={ directorate.id } >{ directorate.attributes.directorate_name }</option>
                        )}
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
        </CCol>      
        <CCol xs={12} className="mt-3">
          { message && <CAlert color="success" dismissible onClose={() => { setMessage("") }}> { message } </CAlert> }
        </CCol> 
        <CCard className="mb-4 mt-3">
          <CCardHeader>
            <strong>Data Divisi</strong>
          </CCardHeader>
          <CCardBody>
            <CRow>
              <CCol>
                <CButton
                  color='primary'
                  style={{width:'18%', borderRadius: "50px", fontSize: "14px"}}
                  onClick={() => navigate('/division/tambah', {state: { status: 'tambah' } }) } >
                  <CIcon icon={cilPlus} style={{ marginRight: "10px", color: "#FFFFFF" }} />
                  Tambah Divisi
                </CButton>
              </CCol>
            </CRow>
            <CRow className='pl-2 mr-5'>
              <CTable striped className='mt-3 text-center'>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">No</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama Divisi</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama Direktorat</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  { divisions.map( (division, index) =>
                    <CTableRow key={division.id}>
                      <CTableHeaderCell scope="row">{ index+1 }</CTableHeaderCell>
                      <CTableDataCell>{division?.attributes?.division_name}</CTableDataCell>
                      <CTableDataCell>{division?.attributes?.directorate?.data?.attributes?.directorate_name}</CTableDataCell>
                      <CTableDataCell>
                        <CButton 
                          color={'warning'} 
                          variant="outline" 
                          style={{width: '75px', margin: '5px 5px'}}
                          onClick={() => navigate(
                            '/division/edit', 
                            {state: { data: division, status: 'edit' }})}>
                          Edit</CButton>
                        <CButton 
                          color={'danger'} 
                          variant="outline" 
                          style={{margin: '5px 5px'}}
                          onClick={() => setChosenDivision({ 
                            visible: true, 
                            id: division.id, 
                            name: division.attributes.division_name, 
                          })}>Delete</CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CRow>
            <CModal backdrop="static" visible={chosenDivision.visible} onClose={() => setChosenDivision({ visible: false })}>
              <CModalHeader>
                <CModalTitle>Apakah Anda Yakin?</CModalTitle>
              </CModalHeader>
              <CModalBody>
                Ini akan menghapus {chosenDivision.name} secara permanen
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setChosenDivision({ visible: false })}>
                  Tutup
                </CButton>
                <CButton color="danger" onClick={() => deleteData()}>Hapus</CButton>
              </CModalFooter>
            </CModal>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Division