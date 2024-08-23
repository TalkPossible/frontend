import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import Header from "../../components/Header";
import { API_BASE_URL } from "../../api/apiConfig.js";

import './FeedbackPage.css';

import {conversationList, motionDataList, stuttered} from "./feedbackData.js";
import { LeftBubble, RightBubble } from "../../components/ChatBubble.js";
import StutterCard from "../../components/StutterCard.js";
import {
  FdMainSkeleton,
  FdMenuListSkeleton,
  FdMenuConversationSkeleton,
  FdMenuVoiceSkeleton,
  FdMenuMotionSkeleton,
} from './FeedbackSkeleton.js';

const FeedbackPage = () => {
  const [infoUrl, setInfoUrl] = useState(null);
  const [conversationList, setConversationList] = useState(null);
  const simulationIdParams = 16; // 선수 백엔드 api 적용 안 되어서, 정보 출력확인을 위해 임시로 하드코딩
  
  useEffect(() => {
    let headers = new Headers({
      "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
      'Content-Type': 'application/json',
    });
    let options = {
      method: 'GET',
      headers
    }
    
    // 시뮬 정보 & 영상 api 호출
    fetch(API_BASE_URL + `/api/v1/simulations/${simulationIdParams}/info`, options)
    .then((res) => {
      if(!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((data) => {
      setInfoUrl(data);
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });
    // 대화 내용 api 호출
    fetch(API_BASE_URL + `/api/v1/simulations/${simulationIdParams}/conversation`, options)
    .then((res) => {
      if(!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((data) => {
      setConversationList(data.conversationList);
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });
  }, [simulationIdParams]);
  
  const navigate = useNavigate();
  const checkBtn = () => {
    navigate('/');
  };
  
  const menuList = useRef(null);
  const menuConversation = useRef(null);
  const menuVoice = useRef(null);
  const menuMotion = useRef(null);

  const [isAnimating, setIsAnimating] = useState(false);

  const toMenuListClicked = (e) => {
    if (isAnimating) return;  // 애니메이션 중에는 클릭 불가

    const parentEl = e.currentTarget.closest('.fd-menu');
    if (parentEl) {
      parentEl.classList.add('fade-out');

      setTimeout(() => {
        parentEl.style.display = 'none'; 
        menuList.current.style.display = 'flex';
        menuList.current.classList.add('fade-in');

        setIsAnimating(false);
        setTimeout(() => {
          parentEl.classList.remove('fade-out');
          menuList.current.classList.remove('fade-in');
        }, 500);  
      }, 500);  // 애니메이션 지속 시간과 일치하도록 500ms 설정
    }
  };
  const conversationClicked = () => {
    setIsAnimating(true);
    menuList.current.classList.add('fade-out');
    
    setTimeout(() => { // 애니메이션이 끝난 후 실행
      menuList.current.style.display = 'none';
      menuConversation.current.style.display = 'flex';
      menuConversation.current.style.flexDirection = 'column';
  
      menuConversation.current.classList.add('fade-in-up'); 

      setIsAnimating(false);
      setTimeout(() => {
        menuList.current.classList.remove('fade-out');
        menuConversation.current.classList.remove('fade-in-up');
      }, 500);
    }, 500); 
  };
  const voiceClicked = () => {
    setIsAnimating(true);
    menuList.current.classList.add('fade-out');

    setTimeout(() => {
      menuList.current.style.display = 'none';
      menuVoice.current.style.display = 'flex';
      menuVoice.current.style.flexDirection = 'column';

      menuVoice.current.classList.add('fade-in-up');

      setIsAnimating(false);
      setTimeout(() => {
        menuList.current.classList.remove('fade-out');
        menuVoice.current.classList.remove('fade-in-up');
      }, 500);
    }, 500);
  };
  const motionClicked = () => {
    setIsAnimating(true);
    menuList.current.classList.add('fade-out');

    setTimeout(() => {
      menuList.current.style.display = 'none';
      menuMotion.current.style.display = 'flex';
      menuMotion.current.style.flexDirection = 'column';

      menuMotion.current.classList.add('fade-in-up');

      setIsAnimating(false);
      setTimeout(() => {
        menuList.current.classList.remove('fade-out');
        menuMotion.current.classList.remove('fade-in-up');
      }, 500);
    }, 500);
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
        
        {infoUrl ? 
          <div className="fd-main">
            <div className="fd-title">
              <p className="ttl-name">{infoUrl.patientName}</p>
              <div className="ttl-info">
                <p><span>{infoUrl.situation}</span></p>
                <p><span>{infoUrl.runDate}</span></p>
              </div>
            </div>

            <div className="fd-video">
              <iframe title="cam video player"
                width="100%" 
                height="100%" 
                src={infoUrl.videoUrl}
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen>
              </iframe>
            </div>
          </div> : <FdMainSkeleton />
        }

        <div>
          {infoUrl ? 
            <div className="fd-menu menu-list" ref={menuList}>
              <div className="sub-menu">
                <p className="header-title">menu</p>
                <div className="menu-box">
                  <div onClick={conversationClicked}><p>대화 내용</p></div>
                  <div onClick={voiceClicked}><p>음성 피드백</p></div>
                  <div onClick={motionClicked}><p>행동 피드백</p></div>
                </div>
              </div>

              <div className="sub-info">
                <p className="header-title">info</p>
                <div className="info-box">
                  <div className="sub-container">
                    <p className="sub-title">전체 시간</p>
                    <p className="sub-value">{infoUrl.totalTime}</p>
                  </div>
                  <div className="sub-container">
                    <p className="sub-title">분당 어절수</p>
                    <p className="sub-value">{infoUrl.wordsPerMin}어절/1분</p>
                  </div>
                  <div className="sub-container">
                    <p className="sub-title">모션 감지 횟수</p>
                    <p className="sub-value">@여기 수정 필요@번</p>
                  </div>
                </div>
              </div>

              <div className="menu-footer">
                <button className="fd-confirmBtn" onClick={checkBtn}>확인완료</button>
              </div>
            </div> : <FdMenuListSkeleton />
          }

          <div className="fd-menu menu-conversation" ref={menuConversation}>
            <div className="menu-detail-header">
              <div className="header-title">대화 내용</div> <button onClick={toMenuListClicked}>&times;</button>
            </div>

            <div className="part-rest part-scroll">
            {/* {conversationList.map((txt, index) => (
              <div key={index} style={{display: 'flex', justifyContent: txt.speaker === 'chatgpt' ? 'flex-start' : 'flex-end', 
              width: '100%', marginBottom: '10px'}}>
                {txt.speaker === 'chatgpt' ? 
                  <LeftBubble key={index}>{txt.content}</LeftBubble> :  
                  <RightBubble key={index}>{txt.content}</RightBubble>}
              </div>
            ))} */}
            </div>
          </div>

          <div className="fd-menu menu-voice" ref={menuVoice}>
            <div className="menu-detail-header">
              <div className="header-title">말더듬 분석</div> <button onClick={toMenuListClicked}>&times;</button>
            </div>

            <div className="part-rest">
              <StutterCard stuttered={currentResult}></StutterCard>
            </div>

            <div className="btn-pn" >
              <button onClick={handlePrev} style={{ fontSize: '16px' }}>Prev</button>
              <button onClick={handleNext} style={{ fontSize: '16px' }}>Next</button>
            </div>
          </div>

          <div className="fd-menu menu-motion" ref={menuMotion}>
            <div className="menu-detail-header">
              <div className="header-title">동작 분석</div> <button onClick={toMenuListClicked}>&times;</button>
            </div>
            
            <div className="part-rest part-scroll ">
              {motionDataList[0]["motionList"].map((motion, index) => (
                <p key={index} className="motion"><span>{motion.timestamp}</span> <span>{motion.motionName}</span></p>
              ))}
            </div>
          </div>
        </div>

      </div>
    </>
  )
}

export default FeedbackPage;