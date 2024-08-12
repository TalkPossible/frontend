import React from 'react';
import { useNavigate } from 'react-router-dom';

import "../assets/css/Header.css";

const Header = () => {
  const navigate = useNavigate();
  
  const logoClick = () => {navigate('/');};

  return (
    <div className="header">
      <div className="background"/>
      <div className="foreground header-group">
        <div className="header-logo" onClick={logoClick}>
          <img src="TalkPossible_logo.png" alt="img" />
        </div>
        <div className="group-menu">
          <div className="text-color-change-sign">회원가입</div>
          <div className="text-color-change-sign">로그인</div>
        </div>
      </div>
    </div>
  );
}

export default Header;