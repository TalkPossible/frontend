import React, { useState } from 'react';

import Header from '../../components/Header.js';
import Footer from '../../components/Footer.js';

import './SignUpPage.css';

const SignupPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSignup = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }
  };

  return (
    <div className="signup-container">
      <Header />
      <div className="signup-form">
        <h2 className="signup-title">회원가입</h2>
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
        <label>
          비밀번호 확인:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </label>
        {error && <div className="signup-error">{error}</div>} {/* 에러 메시지 표시 */}
        <button onClick={handleSignup}>회원가입</button>
      </div>
      <Footer />
    </div>
  );
};

export default SignupPage;
