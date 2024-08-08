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
          <div className="menu-header">
            <p className="header-title">menu</p>
            <button className="fd-confirmBtn">확인완료</button>
          </div>
          <div className="sub-menu">
            <div>대화 내용</div>
            <div>음성 피드백</div>
            <div>행동 피드백</div>
          </div>
          <div className="sub-info">
            <div>
              <p>전체 시간</p>
              <p>3분 42초</p>
            </div>
            <div>
              <p>분당 어절수</p>
              <p>210어절/1분</p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default FeedbackPage;