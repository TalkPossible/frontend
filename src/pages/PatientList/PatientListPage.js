import React from 'react';
import './PatientListPage.css';

const PatientListPage = () => {
  return (
    <div className="patient-list-container">
      <h2 className="patient-list-title">환자 목록</h2>
      <table className="patient-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>이름</th>
            <th>생년월일</th>
          </tr>
        </thead>
        <tbody>
          {/* 여기에 환자 데이터를 렌더링합니다. */}
          <tr>
            <td>1</td>
            <td>홍길동</td>
            <td>1990-01-01</td>
          </tr>
          <tr>
            <td>2</td>
            <td>김철수</td>
            <td>1985-05-05</td>
          </tr>
          {/* 더 많은 행들을 추가합니다. */}
        </tbody>
      </table>
    </div>
  );
};

export default PatientListPage;
