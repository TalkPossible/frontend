import React, { useState } from "react";

import PhoneInput from "./PhoneInput.js";

import '../assets/css/EnrollModal.css';

function EnrollModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    gender: true, // true는 여성, false는 남성
    phoneNum: "",
  });
  const [error, setError] = useState(""); // 에러 메시지 상태

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "radio" ? value === "true" : value, // 성별 처리
    });
  };

  const handlePhoneChange = (value) => {
    setFormData({
      ...formData,
      phoneNum: value,
    });
  };

  const handleSubmit = () => {
    // 유효성 검사: 이름 필드가 비어있으면 에러 메시지 설정
    if (!formData.name) {
      setError("이름을 입력해주세요.");
      return;
    }

    setError(""); // 에러 메시지 초기화
    onSubmit(formData); // 유효성 검사를 통과한 경우에만 부모 컴포넌트로 데이터 전달
  };

  return (
    <div className="enroll-modal">
      <div className="enroll-modal-content">
        <h2>정보 입력</h2>
        <div>
          <label className="st-block">이름</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="enroll-modal-input bg-border"
          />
          {error && <p style={{ color: "red" }}>{error}</p>} {/* 에러 메시지 표시 */}
        </div>
        <div>
          <label className="st-block">생년월일</label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
            className="enroll-modal-input bg-border"
          />
        </div>
        <div>
          <label className="st-block">성별</label>
          <label className="st-rlm">
            <input
              type="radio"
              name="gender"
              value="true"
              checked={formData.gender === true}
              onChange={handleChange}
            />
            여성
          </label>
          <label className="st-rlm">
            <input
              type="radio"
              name="gender"
              value="false"
              checked={formData.gender === false}
              onChange={handleChange}
            />
            남성
          </label>
        </div>
        <div>
          <PhoneInput handlePhoneChange={handlePhoneChange} />
        </div>
        <button className="confirm-btn" onClick={handleSubmit}>등록</button>
        <button className="confirm-btn" onClick={onClose}>취소</button>
      </div>
    </div>
  );
}

export default EnrollModal;
