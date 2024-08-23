import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientDetailPage.css';
import Header from '../../components/Header';

const PatientDetailPage = () => {
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate(); 

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('https://talkpossible.site/api/v1/mypage/patients', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        if (!response.ok) {
          const text = await response.text();
          console.log('Received non-JSON response:', text);
          throw new Error(`Failed to fetch patients: ${response.status} ${response.statusText}`);
        }

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new TypeError("Received content is not JSON");
        }

        const data = await response.json();
        console.log('Fetched data:', data); //data 출력 확인용
        setPatients(data.patients); 
      } catch (error) {
        console.error('Error fetching patients:', error.message);
      }
    };

    fetchPatients(); 
  }, []); 

  const handleRowClick = (patient) => {
    setSelectedPatient(patient);
    setIsPopupOpen(true); 
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedPatient(null); 
  };

  const handleSelectSituation = () => {
    localStorage.setItem('patientId', selectedPatient.patientId);
    navigate('/theme'); 
  };

  return (
    <>
      <Header onlyLogo />
      <div className="patient-list-container">
        <div className="patient-list-header">
          <div className="patient-list-title">환자 목록</div>
        </div>
        <div className="patient-list-table-container">
          <table className="patient-list-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>이름</th>
                <th>생년월일</th>
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? (
                patients.map((patient) => (
                  <tr
                    key={patient.patientId}
                    className={selectedPatient === patient ? 'selected' : ''}
                    onClick={() => handleRowClick(patient)}
                  >
                    <td>{patient.patientId}</td>
                    <td>{patient.name}</td>
                    <td>{patient.birth === "null" ? '' : patient.birth}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3">No patients found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isPopupOpen && selectedPatient && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="close-button" onClick={handleClosePopup}>X</button>
            <div className="popup-content">
              <h2>환자 정보</h2>
              <p>ID: {selectedPatient.patientId}</p>
              <p>이름: {selectedPatient.name}</p>
              <p>생년월일: {selectedPatient.birth === "null" ? '' : selectedPatient.birth}</p>
              <button className="action-button active" onClick={handleSelectSituation}>상황 선택하기</button> 
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientDetailPage;
