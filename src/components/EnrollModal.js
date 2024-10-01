import React, { useState } from "react";

function EnrollModal({ onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    birthday: "",
    gender: true, // true는 여성, false는 남성
    phoneNum: "",
  });

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === "radio" ? value === "true" : value, // 성별 처리
    });
  };

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div style={modalStyle}>
      <div style={modalContentStyle}>
        <h2>정보 입력</h2>
        <div>
          <label>이름: </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>생년월일: </label>
          <input
            type="date"
            name="birthday"
            value={formData.birthday}
            onChange={handleChange}
          />
        </div>
        <div>
          <label>성별: </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="true"
              checked={formData.gender === true}
              onChange={handleChange}
            />
            여성
          </label>
          <label>
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
          <label>전화번호: </label>
          <input
            type="tel"
            name="phoneNum"
            value={formData.phoneNum}
            onChange={handleChange}
          />
        </div>
        <button onClick={handleSubmit}>등록</button>
        <button onClick={onClose}>취소</button>
      </div>
    </div>
  );
}

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
};

const modalContentStyle = {
  backgroundColor: "white",
  padding: "20px",
  borderRadius: "8px",
  width: "300px",
  textAlign: "center",
};

export default EnrollModal;
