import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SignUpSuccess.css'; 
import Header from '../../components/Header.js'; 
import Footer from '../../components/Footer.js'; 
import successImage from '../../assets/images/success-image.png'; 

const SignUpSuccess = () => {
  const navigate = useNavigate(); 

  const handleHome = () => {
    navigate('/'); 
  };

  const handleLogin = () => {
    navigate('/login'); 
  };

  return (
    <div className="signup-success-container">
      <Header /> 
      <div className="signup-success-content">
        <img src={successImage} alt="Success" className="success-image" />
        <h2>회원가입되신걸 축하합니다!</h2>
        <div className="button-group">
          <button className="home-button" onClick={handleHome}>홈으로 가기</button>
          <button className="login-button" onClick={handleLogin}>로그인 하기</button>
        </div>
      </div>
      <Footer /> 
    </div>
  );
};

export default SignUpSuccess;
