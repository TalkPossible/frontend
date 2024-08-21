import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // useNavigate 훅을 추가
import './PatientDetailPage.css';
import Header from '../../components/Header';

const patients = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `환자 ${i + 1}`,
  dob: `1990-01-${String(i + 1).padStart(2, '0')}`
}));

const PatientDetailPage = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate(); 

  const handleRowClick = (patient) => {
    setSelectedPatient(patient);
    setIsPopupOpen(true); 
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
    setSelectedPatient(null); 
  };

  const handleSelectSituation = () => {
    localStorage.setItem('patientId', selectedPatient.id);
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
              {patients.map((patient) => (
                <tr
                  key={patient.id}
                  className={selectedPatient === patient ? 'selected' : ''}
                  onClick={() => handleRowClick(patient)}
                >
                  <td>{patient.id}</td>
                  <td>{patient.name}</td>
                  <td>{patient.dob}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {isPopupOpen && (
        <div className="popup-overlay">
          <div className="popup">
            <button className="close-button" onClick={handleClosePopup}>X</button>
            <div className="popup-content">
              <h2>환자 정보</h2>
              <p>ID: {selectedPatient.id}</p>
              <p>이름: {selectedPatient.name}</p>
              <button className="action-button active" onClick={handleSelectSituation}>상황 선택하기</button> 
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientDetailPage;
