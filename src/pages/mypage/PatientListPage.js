import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import './PatientListPage.css';

import { call, enrollPatient } from '../../service/ApiService.js';
import Header from '../../components/Header.js';
import EnrollModal from '../../components/EnrollModal.js';

const PatientListPage = () => {
  const [patients, setPatients] = useState([]); // 환자 목록을 저장하는 상태
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await call('/api/v1/mypage/patients', 'GET');
        setPatients(response["patients"]); // API에서 받은 환자 데이터를 상태로 설정
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    fetchPatients(); // 컴포넌트 마운트 시 API 호출
  }, [isModalOpen]);

  const handleRowClick = (patient) => {
    setSelectedPatient(patient);
    localStorage.setItem("patientId", patient.patientId);
  };

  const handleSimulationStartClick = () => {
    if (selectedPatient) {
      setIsPopupOpen(true);
    }
  };

  const handleClosePopup = () => {
    setIsPopupOpen(false);
  };

  const handleStartSimul = () => {
    setIsPopupOpen(false);
    navigate("/theme");
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (formData) => {
    // alert(JSON.stringify(formData, null, 2)); 
    let name = formData.name;
    let birthday = formData.birthday;
    let gender = formData.gender;
    let phoneNum = formData.phoneNum;
    enrollPatient(name, birthday, gender, phoneNum);
    setIsModalOpen(false);
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
              disabled={!selectedPatient} // 환자 선택 전에는 비활성화
            >
              시뮬레이션 시작
            </button>
            <button
              className={`action-button ${selectedPatient ? 'active' : ''}`}
              onClick={handleSimulationListClick}
              disabled={!selectedPatient} // 환자 선택 전에는 비활성화
            >
              진단 목록
            </button>
            <button
              className={"action-button active"}
              onClick={openModal}
            >
              환자 등록
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
              <button className="action-button active" onClick={handleStartSimul}>시뮬레이션 시작</button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && <EnrollModal onClose={closeModal} onSubmit={handleSubmit}/>}
    </>
  );
};

export default PatientListPage;
