import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '../../components/Header.js';

import './SimulationListPage.css';

// 환자 id로 백엔드 api를 호출하여 받은 시뮬 리스트라고 가정 
const simulations = [
  {
    "simulationId": 10, 
    "date": "24/07/09",
    "situation": "레스토랑", 
    "totalTime": "3분 34초",
    "wordsPerMin": 120,
    "stutterCount": 6,  //말더듬 횟수
    "motionCount": 10   //동작감지 횟수
  },
  {
    "simulationId": 34, 
    "date": "24/07/16",
    "situation": "미용실", 
    "totalTime": "2분 05초",
    "wordsPerMin": 135,
    "stutterCount": 4,
    "motionCount": 15
  },
  {
    "simulationId": 57, 
    "date": "24/07/27",
    "situation": "레스토랑", 
    "totalTime": "4분 24초",
    "wordsPerMin": 80,
    "stutterCount": 9,
    "motionCount": 3
  },
]

// 환자 id로 백엔드 api를 호출하여 받은 환자 정보라고 가정 
const patientInfo = {
  "name": "정성찬", 
  "birth": "01.04.19"
}

const SimulationListPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const handlePatientListClick = () => {
    navigate('/patients');
  }

  const handleFeedbackClick = (simulationId) => {
    console.log(`/feedback/${simulationId}`);
    // navigate(`/feedback/${simulationId}`);
  }
  
  return (
    <>
      <Header />
      <div className="patient-list-container">
        <div className="patient-list-header">
          <div className="patient-list-title">{patientInfo.name}님</div> 
          <div className="button-container">
            <button
              className="action-button active"
              onClick={handlePatientListClick}
            >
              환자 리스트 보기
            </button>
          </div>
        </div>
        <div className="patient-list-table-container">
          <table className="patient-list-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>날짜</th>
                <th>상황</th>
                <th>전체 시간</th>
                <th>분당 어절수</th>
                <th>말더듬 횟수</th>
                <th>동작감지 횟수</th>
              </tr>
            </thead>
            <tbody>
              {simulations.map((simulation) => (
                <tr
                  key={simulation.simulationId}
                  onClick={() => handleFeedbackClick(simulation.simulationId)}
                >
                  <td>{simulation.simulationId}</td>
                  <td>{simulation.date}</td>
                  <td>{simulation.situation}</td>
                  <td>{simulation.totalTime}</td>
                  <td>{simulation.wordsPerMin}</td>
                  <td>{simulation.stutterCount}</td>
                  <td>{simulation.motionCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default SimulationListPage;