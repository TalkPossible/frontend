import React, { useState } from "react";

function PhoneInput({handlePhoneChange}) {
  const [phoneNum, setPhoneNum] = useState("");

  const handlePhoneFormat = (e) => {
    let value = e.target.value.replace(/[^0-9]/g, ""); // 숫자 외 제거

    // 전화번호 형식에 맞게 하이픈 추가
    if (value.length >= 4 && value.length <= 7) {
      value = `${value.slice(0, 3)}-${value.slice(3)}`;
    } else if (value.length > 7) {
      value = `${value.slice(0, 3)}-${value.slice(3, 7)}-${value.slice(7, 11)}`;
    }

    setPhoneNum(value);
    handlePhoneChange(value);
  };

  return (
    <div>
      <label>전화번호: </label>
      <input
        type="text"
        name="phoneNum"
        value={phoneNum}
        onChange={handlePhoneFormat}
        maxLength={13} // 최대 길이 제한
      />
    </div>
  );
}

export default PhoneInput;
