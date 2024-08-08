import React from "react";

import Header from "../../components/Header";

import './FeedbackPage.css';

const FeedbackPage = () => {

  return (
    <>
      <Header/>

      <div className="feedback">
        <div className="fd-main">
          <div className="fd-title">
            <p className="ttl-name">정재현</p>
            <div className="ttl-info">
              <p><span>레스토랑</span></p>
              <p><span>2024년 6월 24일</span></p>
            </div>
          </div>

          <div className="fd-video">
            video
          </div>
        </div>

        <div className="fd-menu">
          <div className="sub-menu">
            <p className="header-title">menu</p>
            <div className="menu-box">
              <div><p>대화 내용</p></div>
              <div><p>음성 피드백</p></div>
              <div><p>행동 피드백</p></div>
              <div><p></p></div>
            </div>
          </div>

          <div className="sub-info">
            <p className="header-title">info</p>
            <div className="sub-container">
              <p className="sub-title">전체 시간</p>
              <p className="sub-value">3분 42초</p>
            </div>
            <div className="sub-container">
              <p className="sub-title">분당 어절수</p>
              <p className="sub-value">210어절/1분</p>
            </div>
          </div>

          <div className="menu-footer">
            <button className="fd-confirmBtn">확인완료</button>
          </div>
        </div>
      </div>
    </>
  )
}

export default FeedbackPage;