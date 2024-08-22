import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './PatientListPage.css';
import Header from '../../components/Header';

const PatientListPage = () => {
  const [patients, setPatients] = useState([]); // 환자 목록을 저장하는 상태
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch('/api/v1/mypage/patients', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }

        const data = await response.json();
        setPatients(data.patients); 
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients(); 
  }, []);

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
      navigate(`/patients/${selectedPatient.patientId}`); // 환자 ID를 기반으로 네비게이션
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
                  key={patient.patientId}
                  className={selectedPatient === patient ? 'selected' : ''}
                  onClick={() => handleRowClick(patient)}
                >
                  <td>{patient.patientId}</td>
                  <td>{patient.name}</td>
                  <td>{patient.birth}</td>
                </tr>
              ))}
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
              <p>생년월일: {selectedPatient.birth}</p>
              <button className="action-button active" onClick={handleClosePopup}>시뮬레이션 시작</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PatientListPage;
