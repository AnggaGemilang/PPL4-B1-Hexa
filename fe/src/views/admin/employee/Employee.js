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
  CFormCheck,
  CFormSelect,  
} from '@coreui/react'
import { useLocation, useNavigate } from "react-router-dom"
import { cilSearch, cilPlus } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import url from "../../../config/setting"
import EmployeeAPI from '../../../config/admin/EmployeeAPI'
import PositionAPI from '../../../config/admin/PositionAPI'
import LevelAPI from '../../../config/admin/LevelAPI'
import SubFieldAPI from '../../../config/admin/SubFieldAPI'
import axios from "axios"

const Employee = () => {
  const location = useLocation()
  const navigate = useNavigate() 

  const [employees, setEmployees] = useState([])
  const [levels, setLevels] = useState([])
  const [positions, setPositions] = useState([])
  const [subfields, setSubfields] = useState([])
  const [message, setMessage] = useState("")
  const [chosenEmployee, setChosenEmployee] = useState({
    visible: false,
    name: "",
    id: 0,
  })

  useEffect(() => {
    setMessage(location?.state?.successMessage)
    axios.all([LevelAPI.get(), PositionAPI.get(), SubFieldAPI.get()]).then(
      axios.spread((...res) => {
        setLevels(res[0]?.data.data),
        setPositions(res[1]?.data.data)
        setSubfields(res[2]?.data.data)
      })
    )
    getData()
  }, [])    

  const filterSearch = (e) => {
    e.preventDefault()

    let query = ""
    if(document.getElementById("filter_nip").value.length != 0){
      query += `&filters[NIP][$contains]=${document.getElementById("filter_nip").value}`
    }
    if(document.getElementById("filter_nama").value.length != 0){
      query += `&filters[Name][$contains]=${document.getElementById("filter_nama").value}`
    }
    if(document.querySelector('input[name="filter_gender"]:checked') != undefined){
      query += `&filters[Gender][$contains]=${document.querySelector('input[name="filter_gender"]:checked').value}`
    }
    if(document.getElementById("filter_birthplace").value.length != 0){
      query += `&filters[BirthPlace][$contains]=${document.getElementById("filter_birthplace").value}`
    }        
    if(document.querySelector('input[type="date"]').value.length != 0){
      query += `&filters[BirthDate][$eq]=${document.querySelector('input[type="date"]').value}`
    }
    if(document.getElementById("filter_email").value.length != 0){
      query += `&filters[Email][$contains]=${document.getElementById("filter_email").value}`
    }
    if(document.getElementById("filter_phonenumber").value.length != 0){
      query += `&filters[PhoneNumber][$contains]=${document.getElementById("filter_phonenumber").value}`
    }
    if(document.getElementById("filter_religion").value.length != 0){
      query += `&filters[Religion][$contains]=${document.getElementById("filter_religion").value}`
    }
    if(document.getElementById("filter_position").value.length != 0){
      query += `&filters[position][id][$eq]=${document.getElementById("filter_position").value}`
    }
    if(document.getElementById("filter_level").value.length != 0){
      query += `&filters[level][id][$eq]=${document.getElementById("filter_level").value}`
    }
    if(document.getElementById("filter_subfield").value.length != 0){
      query += `&filters[sub_field][id][$eq]=${document.getElementById("filter_subfield").value}`
    }    

    EmployeeAPI.find(query).then(
      (res) => {
        if(res.data.data.length != 0){
          setEmployees(res.data.data)
        } else {
          setEmployees([])
        }
      }
    )
  }

  const getData = () => {
    EmployeeAPI.get().then((res) => {
      setEmployees(res.data.data)
    })
  }

  const deleteData = () => {
    EmployeeAPI.delete(chosenEmployee.id).then((res) => {
      setChosenEmployee({ ...chosenEmployee, visible:false })
      setMessage("Pegawai Telah Berhasil Dihapus!")
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
                      <CFormLabel htmlFor="filter_nip">NIP</CFormLabel>
                      <CFormInput
                        type="text"
                        name='filter_nip'
                        id="filter_nip"
                        placeholder="Masukkan NIP . . ."
                      />
                    </CCol>
                    <CCol xs={6}>
                      <CFormLabel htmlFor="filter_nama">Nama Lengkap</CFormLabel>
                      <CFormInput
                        type="text"
                        name='filter_nama'
                        id="filter_nama"
                        placeholder="Masukkan Nama Lengkap . . ."
                      />
                    </CCol>
                  </CRow>
                  <CRow className='mt-3'>
                    <CCol xs={6}>
                      <CFormLabel>Jenis Kelamin</CFormLabel>                      
                      <CCol xs={12}>
                        <CFormCheck
                          inline
                          type="radio"
                          name="filter_gender"
                          id="filter_gender1"
                          value=""
                          label="None"
                        />
                        <CFormCheck
                          inline
                          type="radio"
                          name="filter_gender"
                          id="filter_gender2"
                          value="Male"
                          label="Laki-laki"
                        />
                        <CFormCheck
                          inline
                          type="radio"
                          name="filter_gender"
                          id="filter_gender3"
                          value="Female"
                          label="Perempuan"
                        />
                      </CCol>
                    </CCol>
                    <CCol xs={6}>
                      <CFormLabel htmlFor="filter_birthplace">Tempat Lahir</CFormLabel>
                      <CFormInput type="text" name="filter_birthplace" id="filter_birthplace" placeholder='Masukkan Tempat Lahir . . .' />
                    </CCol>
                  </CRow>
                  <CRow className='mt-3'>
                    <CCol xs={6}>
                      <CFormLabel htmlFor="filter_birthDate">Tanggal Lahir</CFormLabel>
                      <CFormInput type="date" name="filter_birthDate" id="filter_birthDate"/>
                    </CCol>
                    <CCol xs={6}>
                      <CFormLabel htmlFor="filter_email">Email</CFormLabel>
                      <CFormInput type="email" name="filter_email" id="filter_email" placeholder='Masukkan Email . . .'/>
                    </CCol>
                  </CRow> 
                  <CRow className='mt-3'>
                    <CCol xs={6}>
                      <CFormLabel htmlFor="filter_phonenumber">Nomor Telepon</CFormLabel>
                      <CFormInput type="number" name="filter_phonenumber" id="filter_phonenumber" placeholder='Masukkan Nomor Telepon . . .'/>
                    </CCol>
                    <CCol xs={6}>
                      <CFormLabel htmlFor="filter_religion">Agama</CFormLabel>
                      <CFormSelect name="filter_religion" id="filter_religion" aria-label="Large select example">
                        <option value="">Pilih Agama</option>
                        <option value="Islam">Islam</option>
                        <option value="Kristen">Kristen</option>
                        <option value="Katolik">Katolik</option>
                        <option value="Buddha">Buddha</option>
                        <option value="Hindu">Hindu</option>
                      </CFormSelect>
                    </CCol>
                  </CRow> 
                  <CRow className='mt-3'>
                    <CCol xs={6}>
                      <CFormLabel htmlFor="filter_position">Jabatan</CFormLabel>
                      <CFormSelect name="filter_position" id="filter_position" aria-label="Large select example">
                        <option value="">Pilih Jabatan</option>
                        { positions.map(position =>
                          <option key={ position.id } value={ position.id } >{ position.attributes.position_name }</option>
                        )}
                      </CFormSelect>
                    </CCol>
                    <CCol xs={6}>
                      <CFormLabel htmlFor="filter_level">Jenjang</CFormLabel>
                      <CFormSelect name="filter_level" id="filter_level" aria-label="Large select example">
                        <option value="">Pilih Jenjang</option>
                        { levels.map(level =>
                          <option key={ level.id } value={ level.id } >{ level.attributes.functional_name } - { level.attributes.structural_name }</option>
                        )}
                      </CFormSelect>
                    </CCol>
                  </CRow>
                  <CRow className='mt-3'>
                    <CCol xs={12}>
                      <CFormLabel htmlFor="filter_subfield">Sub Bidang</CFormLabel>
                      <CFormSelect name="filter_subfield" id="filter_subfield" aria-label="Large select example">
                        <option value="">Pilih Sub Bidang</option>
                        { subfields.map(subfield =>
                          <option key={ subfield.id } value={ subfield.id } >{ subfield.attributes.subfield_name }</option>
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
            <strong>Data Pegawai</strong>
          </CCardHeader>
          <CCardBody style={{ overflowX: "auto"}}>
            <CRow>
              <CCol>
                <CButton
                  color='primary'
                  style={{width:'18%', borderRadius: "50px", fontSize: "14px"}}
                  onClick={() => 
                    navigate('/employee/tambah', {state: { status: 'tambah' } })
                  } >
                  <CIcon icon={cilPlus} style={{ marginRight: "10px", color: "#FFFFFF" }} />
                  Tambah Pegawai
                </CButton>
              </CCol>
            </CRow>
            <CRow className='pl-2 mr-5'>
              <CTable striped className='mt-3 text-center'>
                <CTableHead>
                  <CTableRow>
                    <CTableHeaderCell scope="col">No</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Foto</CTableHeaderCell>
                    <CTableHeaderCell scope="col">NIP</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nama</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Jenis Kelamin</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Agama</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Tempat Tanggal Lahir</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Email</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Nomor HP</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Jabatan</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Jenjang</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Sub Bidang</CTableHeaderCell>
                    <CTableHeaderCell scope="col">Aksi</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  { employees.map((employee, index) =>
                    <CTableRow key={employee.id}>
                      <CTableHeaderCell scope="row">{ index+1 }</CTableHeaderCell>
                      <CTableDataCell>
                        {
                          <img className='foto_karyawan' src={url + employee?.attributes?.Photo?.data?.attributes?.formats?.thumbnail?.url} alt="Photo" />
                        }
                      </CTableDataCell>
                      <CTableDataCell>{employee?.attributes?.NIP}</CTableDataCell>
                      <CTableDataCell>{employee?.attributes?.Name}</CTableDataCell>
                      <CTableDataCell>{employee?.attributes?.Gender}</CTableDataCell>
                      <CTableDataCell>{employee?.attributes?.Religion}</CTableDataCell>
                      <CTableDataCell>{employee?.attributes?.BirthPlace}, {employee?.attributes?.BirthDate}</CTableDataCell>
                      <CTableDataCell>{employee?.attributes?.Email}</CTableDataCell>
                      <CTableDataCell>{employee?.attributes?.PhoneNumber}</CTableDataCell>
                      <CTableDataCell>{employee?.attributes?.position?.data?.attributes?.position_name}</CTableDataCell>
                      <CTableDataCell>{employee?.attributes?.level?.data?.attributes?.functional_name} - {employee?.attributes?.level?.data?.attributes?.structural_name} </CTableDataCell>
                      <CTableDataCell>{employee?.attributes?.sub_field?.data?.attributes?.subfield_name}</CTableDataCell>
                      <CTableDataCell>
                        <CButton 
                          color={'warning'} 
                          variant="outline" 
                          style={{width: '75px', margin: '5px 5px'}}
                          onClick={() => 
                            navigate('/employee/edit', {state: { data: employee, status: 'edit' } })
                          }>
                          Edit</CButton>
                        <CButton 
                          color={'danger'} 
                          variant="outline"
                          style={{margin: '5px 5px'}}                          
                          onClick={() => setChosenEmployee({ 
                            visible: true, 
                            id: employee.id, 
                            name: employee.attributes.Name
                          })}>Delete</CButton>
                      </CTableDataCell>
                    </CTableRow>
                  )}
                </CTableBody>
              </CTable>
            </CRow>
            <CModal backdrop="static" visible={chosenEmployee.visible} onClose={() => setChosenEmployee({ visible: false })}>
              <CModalHeader>
                <CModalTitle>Apakah Anda Yakin?</CModalTitle>
              </CModalHeader>
              <CModalBody>
                Ini akan menghapus {chosenEmployee.name} secara permanen
              </CModalBody>
              <CModalFooter>
                <CButton color="secondary" onClick={() => setChosenEmployee({ visible: false })}>
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

export default Employee