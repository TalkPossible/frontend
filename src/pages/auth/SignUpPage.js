import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header.js'; 
import Footer from '../../components/Footer.js'; 
import './SignUpPage.css'; 
import { API_BASE_URL } from '../../api/apiConfig';

const SignUpPage = () => {
  const [name, setName] = useState('');
  const [phoneNum, setPhoneNum] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);
  const navigate = useNavigate(); 
  

  const handleSignup = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    try {
      const response = await fetch(API_BASE_URL +'/api/v1/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: name, // 사용자 입력값 사용
          phoneNum: phoneNum, // 사용자 입력값 사용
          email: email,
          password: password,
        }),
      });

      if (response.ok) {
        navigate('/signup-success'); 
      } else {
        const errorData = await response.json();
        setError(errorData.message || '서버에 문제가 발생했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      setError('서버에 문제가 발생했습니다. 다시 시도해주세요.');
    }
  };

  return (
    <div className="signup-container">
      <Header /> 
      <div className="signup-form">
        <h2 className="signup-title">회원가입</h2>
        {error && <div className="signup-error">{error}</div>}
        <label>
          이름
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </label>
        <label>
          전화번호
          <input
            type="tel"
            value={phoneNum}
            onChange={(e) => setPhoneNum(e.target.value)}
          />
        </label>
        <label>
          이메일
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </label>
        <label>
          비밀번호
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <label>
          비밀번호 확인
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        <button onClick={handleSignup}>회원가입</button>
      </div>
      <Footer /> 
    </div>
  );
};

export default SignUpPage;
