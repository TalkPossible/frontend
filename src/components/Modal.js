import React from 'react';
import { useNavigate } from 'react-router-dom';

import '../assets/css/Modal.css';

import {API_BASE_URL} from '../api/apiConfig.js';

const Modal = (props) => {
  const navigate = useNavigate();
  const { open, close } = props;

  const handleStartBtn = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/simulations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'patientId': localStorage.getItem('patientId'), 
          'situationId': localStorage.getItem('situationId'), 
        }
      });

      if (!response.ok) {
        throw new Error('Failed to create simulation');
      }

      const data = await response.json();
      localStorage.setItem('simulationId', data.simulationId);
      console.log('Simulation created with ID:', data.simulationId);
    } catch (error) {
      console.error("Error creating simulation:", error);
      return; // 시뮬레이션 생성 실패 시 이후 로직 실행하지 않음
    } finally {
      navigate('/simulation');
    }
  }

  return (
    <div className={open? 'openModal modal' : 'modal'}>
      {open ? (
        <section>
          <button className='close' onClick={close}>
            &times;
          </button>
          <main className='content-box'>{props.children}</main>
          <button className='startBtn' onClick={handleStartBtn}>
            시작하기
          </button>
        </section>
      ) : null}
    </div>
  );
};

export default Modal;