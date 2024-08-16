import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/Header";

import './FeedbackPage.css';

import {conversationList, motionDataList, stuttered} from "./feedbackData.js";
import { LeftBubble, RightBubble } from "../../components/ChatBubble.js";
import StutterCard from "../../components/StutterCard.js";

const FeedbackPage = () => {
  const navigate = useNavigate();
  const checkBtn = () => {
    navigate('/');
  };
  
  const menuList = useRef(null);
  const menuConversation = useRef(null);
  const menuVoice = useRef(null);
  const menuMotion = useRef(null);
  const toMenuListClicked = (e) => {
    const parentEl = e.currentTarget.closest('.fd-menu');
    if (parentEl) {
      parentEl.style.display = 'none'; 
    };
    menuList.current.style.display = 'block';
  };
  const conversationClicked = () => {
    menuList.current.style.display = 'none';
    menuConversation.current.style.display = 'flex';
    menuConversation.current.style.flexDirection = 'column';
  };
  const voiceClicked = () => {
    menuList.current.style.display = 'none';
    menuVoice.current.style.display = 'flex';
    menuVoice.current.style.flexDirection = 'column';
  };
  const motionClicked = () => {
    menuList.current.style.display = 'none';
    menuMotion.current.style.display = 'flex';
    menuMotion.current.style.flexDirection = 'column';
  };


  const [currentIndex, setCurrentIndex] = useState(0);
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === stuttered.length - 1 ? 0 : prevIndex + 1
    );
  };
  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex === 0 ? stuttered.length - 1 : prevIndex - 1
    );
  };
  const currentResult = stuttered[currentIndex];

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

        <div className="fd-menu menu-list" ref={menuList}>
          <div className="sub-menu">
            <p className="header-title">menu</p>
            <div className="menu-box">
              <div onClick={conversationClicked}><p>대화 내용</p></div>
              <div onClick={voiceClicked}><p>음성 피드백</p></div>
              <div onClick={motionClicked}><p>행동 피드백</p></div>
              <div><p></p></div>
            </div>
          </div>

          <div className="sub-info">
            <p className="header-title">info</p>
            <div className="info-box">
              <div className="sub-container">
                <p className="sub-title">전체 시간</p>
                <p className="sub-value">3분 42초</p>
              </div>
              <div className="sub-container">
                <p className="sub-title">분당 어절수</p>
                <p className="sub-value">210어절/1분</p>
              </div>
              <div className="sub-container">
                <p className="sub-title">모션 감지 횟수</p>
                <p className="sub-value">{motionDataList[1]["motionCount"]}번</p>
              </div>
            </div>
          </div>

          <div className="menu-footer">
            <button className="fd-confirmBtn" onClick={checkBtn}>확인완료</button>
          </div>
        </div>

        <div className="fd-menu menu-conversation" ref={menuConversation}>
          <div className="menu-detail-header">
            <div>대화 내용</div> <button onClick={toMenuListClicked}>&times;</button>
          </div>

          <div className="part-rest part-scroll">
          {conversationList.map((txt, index) => (
            <div key={index} style={{display: 'flex', justifyContent: txt.speaker === 'chatgpt' ? 'flex-start' : 'flex-end', 
            width: '100%', marginBottom: '10px'}}>
              {txt.speaker === 'chatgpt' ? 
                <LeftBubble key={index}>{txt.content}</LeftBubble> :  
                <RightBubble key={index}>{txt.content}</RightBubble>}
            </div>
          ))}
          </div>
        </div>

        <div className="fd-menu menu-voice" ref={menuVoice}>
          <div className="menu-detail-header">
            <div>말더듬 분석</div> <button onClick={toMenuListClicked}>&times;</button>
          </div>

          <div className="part-rest">
            <StutterCard stuttered={currentResult}></StutterCard>
          </div>

          <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'space-between' }}>
            <button onClick={handlePrev} style={{ fontSize: '16px' }}>Prev</button>
            <button onClick={handleNext} style={{ fontSize: '16px' }}>Next</button>
          </div>
        </div>

        <div className="fd-menu menu-motion" ref={menuMotion}>
          <div className="menu-detail-header">
            <div>동작 분석</div> <button onClick={toMenuListClicked}>&times;</button>
          </div>
          
          <div className="part-rest part-scroll ">
            {motionDataList[0]["motionList"].map((motion, index) => (
              <p key={index} className="motion"><span>{motion.timestamp}</span> <span>{motion.motionName}</span></p>
            ))}
          </div>
        </div>

      </div>
    </>
  )
}

export default FeedbackPage;