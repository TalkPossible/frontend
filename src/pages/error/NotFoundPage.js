import React from 'react';
import { Link } from 'react-router-dom';

import Header from '../../components/Header';

import './NotFoundPage.css'; // CSS 스타일을 위한 파일

const NotFoundPage = () => {
  return (
    <>
      <Header/>
      <div className="not-found-container">
        <h1 className="error-code">404</h1>
        <p className="error-message">삭제되거나 존재하지 않는 페이지입니다.</p>
        <Link to="/" className="home-link">메인페이지로 돌아가기</Link>
      </div>
    </>
  );
};

export default NotFoundPage;
