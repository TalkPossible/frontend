import React, { useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { API_BASE_URL } from "../../api/apiConfig.js";

import './FeedbackPage.css';

import Header from "../../components/Header.js";
import { LeftBubble, RightBubble } from "../../components/ChatBubble.js";
import StutterCard from "../../components/StutterCard.js";
import { FdMainSkeleton, FdMenuListSkeleton, FdMenuConversationSkeleton,
  FdMenuVoiceSkeleton, FdMenuMotionSkeleton } from './FeedbackSkeleton.js';

const FeedbackPage = () => {
  const { simId } = useParams();
  const pntId = localStorage.getItem("patientId");
  const [infoUrl, setInfoUrl] = useState(null);
  const [conversationList, setConversationList] = useState(null);
  const [stutterList, setStutterList] = useState(null);
  const [motionList, setMotionList] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  let isComponentMounted = true;

  const handleNext = () => {
    if (stutterList && stutterList.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === stutterList.length - 1 ? 0 : prevIndex + 1
      );
    }
  };

  useEffect(() => {
    return () => {
      isComponentMounted = false;
    };
  }, []);
  
  const handlePrev = () => {
    if (stutterList && stutterList.length > 0) {
      setCurrentIndex((prevIndex) =>
        prevIndex === 0 ? stutterList.length - 1 : prevIndex - 1
      );
    }
  };

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
    fetch(API_BASE_URL + `/api/v1/simulations/${simId}/info`, options)
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
    fetch(API_BASE_URL + `/api/v1/simulations/${simId}/conversation`, options)
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
    // 말더듬 api 호출
    fetch(API_BASE_URL + `/api/v1/simulations/${simId}/stutter`, options)
    .then((res) => {
      if(!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((data) => {
      setStutterList(data.stutterList);
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });
    // 동작인식 api 호출
    fetch(API_BASE_URL + `/api/v1/simulations/${simId}/motion`, options)
    .then((res) => {
      if(!res.ok) {
        throw new Error('Network response was not ok');
      }
      return res.json();
    })
    .then((data) => {
      setMotionList(data.motionList);
    })
    .catch((error) => {
      console.error('There was a problem with the fetch operation:', error);
    });
  }, [simId]);
  
  const navigate = useNavigate();
  const checkBtn = () => {
    navigate(`/patients/${pntId}`);
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
        if (!isComponentMounted) return; // 컴포넌트가 언마운트된 경우 콜백 실행을 중단
      
        // 이후의 코드가 실행되기 전에 요소들이 여전히 존재하는지 확인
        if (parentEl && menuList.current) {
          parentEl.style.display = 'none'; 
          menuList.current.style.display = 'flex';
          menuList.current.classList.add('fade-in');
      
          setIsAnimating(false);
          
          setTimeout(() => {
            if (!isComponentMounted) return; // 이 콜백도 컴포넌트가 언마운트되었는지 확인
      
            if (parentEl && menuList.current) {
              parentEl.classList.remove('fade-out');
              menuList.current.classList.remove('fade-in');
            }
          }, 500);
        }
      }, 500); // 애니메이션 지속 시간과 일치하도록 500ms 설정
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
                    <p className="sub-value">{infoUrl.motionCount}번</p>
                  </div>
                </div>
              </div>

              <div className="menu-footer">
                <button className="fd-confirmBtn" onClick={checkBtn}>확인완료</button>
              </div>
            </div> : <FdMenuListSkeleton />
          }

          {conversationList ? 
            <div className="fd-menu menu-conversation" ref={menuConversation}>
              <div className="menu-detail-header">
                <div className="header-title">대화 내용</div> <button onClick={toMenuListClicked}>&times;</button>
              </div>

              <div className="part-rest part-scroll">
                {conversationList.map((cnv, index) => (
                  <div key={index} style={{display: 'flex', justifyContent: cnv.speaker === 'chatgpt' ? 'flex-start' : 'flex-end', 
                  width: '100%', marginBottom: '10px'}}>
                    {cnv.speaker === 'chatgpt' ? 
                      <LeftBubble key={index}>{cnv.content}</LeftBubble> :  
                      <RightBubble key={index}>{cnv.content}</RightBubble>}
                  </div>
                ))}
              </div>
            </div> : <FdMenuConversationSkeleton/>
          }
          
          {stutterList ?
            <div className="fd-menu menu-voice" ref={menuVoice}>
              <div className="menu-detail-header">
                <div className="header-title">말더듬 분석</div> <button onClick={toMenuListClicked}>&times;</button>
              </div>

              <div className="part-rest">
                <StutterCard currentResult={stutterList[currentIndex]}></StutterCard>
              </div>

              <div className="btn-pn" >
                <button onClick={handlePrev} style={{ fontSize: '16px' }}>Prev</button>
                <button onClick={handleNext} style={{ fontSize: '16px' }}>Next</button>
              </div>
            </div> : <FdMenuVoiceSkeleton/>
          }

          {motionList ? 
            <div className="fd-menu menu-motion" ref={menuMotion}>
              <div className="menu-detail-header">
                <div className="header-title">동작 분석</div> <button onClick={toMenuListClicked}>&times;</button>
              </div>
              
              <div className="part-rest part-scroll ">
                {motionList.map((motion, index) => (
                  <p key={index} className="motion"><span>{motion.timestamp}</span> <span>{motion.motionName}</span></p>
                ))}
              </div>
            </div> : <FdMenuMotionSkeleton/>
          }
        </div>

      </div>
    </>
  )
}

export default FeedbackPage;