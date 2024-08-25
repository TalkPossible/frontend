import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '../../components/Header.js';
import { API_BASE_URL } from '../../api/apiConfig.js';

import './SimulationListPage.css';

const SimulationListPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ptName, setPtName] = useState(null);
  const [ptSimulList, setPtSimulList] = useState(null);

  useEffect(() => {
    const ptSimulData = async () => {
      try {
        const response = await fetch(API_BASE_URL + `/api/v1/simulations/${id}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch patients');
        }

        const data = await response.json();
        setPtName(data["name"]); 
        setPtSimulList(data["simulations"]); 
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    ptSimulData(); 
  }, []);

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
          <div className="patient-list-title">{ptName}님</div> 
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
              {ptSimulList ? 
                ptSimulList.map((simulation) => (
                  <tr key={simulation.simulationId}
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
                )) : <tr><td>정보가 없습니다.</td></tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default SimulationListPage;