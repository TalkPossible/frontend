import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    console.log('로그인 시도:', { username, password });
    navigate('/');
  };

  return (
    <div className="login-container">
      <Header />
      <div className="login-form">
        <h2 className="login-title">로그인</h2>
        <label>
          아이디:
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </label>
        <label>
          비밀번호:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </label>
        <button onClick={handleLogin}>로그인</button>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
