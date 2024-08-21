import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientListPage.css';
import Header from '../../components/Header';

const patients = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  name: `환자 ${i + 1}`,
  dob: `1990-01-${String(i + 1).padStart(2, '0')}`
}));

const PatientListPage = () => {
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  const handleRowClick = (patient) => {
    setSelectedPatient(patient);
  };

  const handleSimulationStartClick = () => {
    if (selectedPatient) {
      setIsPopupOpen(true);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleSimulationListClick = () => {
    if (selectedPatient) {
      navigate(`/patients/${selectedPatient.id}`);
    }
  };

  return (
    <>
      <Header onlyLogo />
      <div className="patient-list-container">
        <div className="patient-list-header">
          <div className="patient-list-title">환자 목록</div>
          <div className="button-container">
            <button
              className={`action-button ${selectedPatient ? 'active' : ''}`}
              onClick={handleSimulationStartClick}
              disabled={!selectedPatient}
            >
              시뮬레이션 시작
            </button>
            <button
              className={`action-button ${selectedPatient ? 'active' : ''}`}
              onClick={handleSimulationListClick}
              disabled={!selectedPatient}
            >
              진단 목록
            </button>
          </div>
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
              <button className="action-button active" onClick={handleClosePopup}>시뮬레이션 시작</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientListPage;
