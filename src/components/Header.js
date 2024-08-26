import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { API_BASE_URL } from '../api/apiConfig';
import "../assets/css/Header.css";

const Header = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  
  const logoClick = () => {navigate('/');};
  const handleLoginClick = () => {
    navigate('/login');
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };
  const myPatientClick = () => {
    navigate("/patients");
  };
  const logout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  useEffect(() => {
    const auth = localStorage.getItem("accessToken");
    setIsLoggedIn(auth);

    if (isLoggedIn) {
      let headers = new Headers({
        "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': 'application/json',
      });
      let options = {
        method: 'GET',
        headers
      }
      fetch(API_BASE_URL + '/api/v1/profile', options)
      .then((res) => {
        if(!res.ok) {
          throw new Error('Network response was not ok');
        }
        return res.json();
      })
      .then((data) => {
        setUserInfo(data);
      })
      .catch((error) => {
        console.error('There was a problem with the fetch operation:', error);
      });
    }
  }, [isLoggedIn])


  return (
    <div className="header">
      <div className="background"/>
      <div className="foreground header-group">
        <div className="header-logo" onClick={logoClick}>
          <img src="/TalkPossible_logo.png" alt="img" />
        </div>


        {isLoggedIn ? (
        // 로그인된 경우
        <div className="group-menu">
          <div className="profile-info" onClick={toggleDropdown}>
            <img src={userInfo ? userInfo.profileImgUrl : ""} alt="Profile Icon" className="profile-icon" />
            <span>{userInfo ? userInfo.name : ""}님</span>
            <span className="dropdown-icon">▼</span>
            {isDropdownOpen && (
            <div className="dropdown">
              <ul>
                <li onClick={myPatientClick}>환자 리스트</li>
                <li onClick={logout}>로그아웃</li>
              </ul>
            </div>
            )}
          </div>
        </div>
        ) : (
        // 로그아웃된 경우
        <div className="group-menu">
          <div className="text-color-change-sign">회원가입</div>
          <div className="text-color-change-sign" onClick={handleLoginClick}>로그인</div>
        </div>
        )}

      </div>
    </div>
  );
}

export default Header;