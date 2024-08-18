import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './LoginPage.css';

const LoginPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async () => {
    setError(null); // Reset error state
    try {
      const response = await fetch('https://talkpossible.site/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email, // Request body: email
          password, // Request body: password
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('로그인 성공:', data);

        // 로그인 성공 시, accessToken과 refreshToken을 로컬 스토리지에 저장
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);

        // 홈으로 이동
        navigate('/');
      } else {
        const errorData = await response.json();
        setError(errorData.message || '로그인 실패');
      }
    } catch (err) {
      console.error('로그인 요청 중 오류 발생:', err);
      setError('로그인 중 문제가 발생했습니다.');
    }
  };

  return (
    <div className="login-container">
      <Header />
      <div className="login-form">
        <h2 className="login-title">로그인</h2>
        <label>
          이메일:
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
        {error && <div className="login-error">{error}</div>} {/* 에러 메시지 표시 */}
        <button onClick={handleLogin}>로그인</button>
      </div>
      <Footer />
    </div>
  );
};

export default LoginPage;
