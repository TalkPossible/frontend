import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import Header from '../../components/Header.js';
import { call } from '../../service/ApiService.js';

import './SimulationListPage.css';

const SimulationListPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ptName, setPtName] = useState(null);
  const [ptSimulList, setPtSimulList] = useState(null);

  useEffect(() => {
    const ptSimulData = async () => {
      try {
        const response = await call(`/api/v1/simulations/${id}`, 'GET');
        setPtName(response["name"]); 
        setPtSimulList(response["simulations"]); 
      } catch (error) {
        console.error('Error fetching patients:', error);
      }
    };

    ptSimulData(); 
  }, [id]);

  const handlePatientListClick = () => {
    navigate('/patients');
  }

  const handleFeedbackClick = (simulationId) => {
    navigate(`/feedback/${simulationId}`);
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
                {/* <th>추임새 사용 횟수</th> */}
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
                    {/* <td>{simulation.type ? simulation.type : 0}</td> */}
                    <td>{simulation.motionCount}</td>
                  </tr>
                )) : 
                <tr>
                  <td colSpan="7">No simulation data found</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default SimulationListPage;