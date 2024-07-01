import React, {useEffect} from 'react';
import { useNavigate } from 'react-router-dom';

import Header from "../../components/Header.js";
import Footer from "../../components/Footer.js";
import "./LandingPage.css";

const LandingPage = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const introDivs = document.querySelectorAll('.intro-description > div');
    const eyeImg = document.querySelector('#problem-img-eye');
    
    const handleScroll = () => {
      introDivs.forEach(div => {
        const divTop = div.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (divTop < windowHeight * 0.75) {
          div.classList.add('visible');
        } else {
          div.classList.remove('visible');
        };
      });

      if (eyeImg) {
        const divTop = eyeImg.getBoundingClientRect().top;
        const windowHeight = window.innerHeight;
        
        if (divTop < windowHeight * 0) {
          eyeImg.classList.add('visible');
        } else {
          eyeImg.classList.remove('visible');
        };
      };
    };

    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const startClick = () => {navigate("/theme");};

  const icons = [
    "/images/theme/icon_restaurant.png",
    "/images/theme/icon_cafe.png",
    "/images/theme/icon_shop.png",
    "/images/theme/icon_hotel.png",
    "/images/theme/icon_salon.png",
    "/images/theme/icon_library.png",
    "/images/theme/icon_traffic.png",
    "/images/theme/icon_reservation.png",
  ]

  const desc = [
    "음식점",
    "카페",
    "쇼핑",
    "호텔",
    "미용실",
    "도서관",
    "교통",
    "예약",
  ]

  return (
    <>
      <Header/>
      <div className="talkpossile-content">
        <div className="first-part-content">
          <div className="text-title-container">
            <div className="text-title-main">
              대화 장벽을 넘어<br/>
              당신의 가능성을 넓히는 한 마디,<br/>
              Talk Possible
            </div>
          </div>
          <div className="talkpossible-container">
            <div className="start-group" onClick={startClick}>
              <div className="btn-start">시작하기</div>
            </div>
            <div className="talkpossible-group-pic">
              <img src="/images/visual/talk_warm.jpg" alt="background1" />
            </div>
          </div>
        </div>
        <div className="talkpossible-background">
          <div className="background-intro">
            <div className="intro-description">
              <div>혹시</div>
              <div>이런 경험 한 번쯤 있지 않으신가요?</div>
            </div>
          </div>
          <div className="cases-group">
            <div className="case">
              <img className="case-pic"src="/images/visual/case_telephone.jpg" alt="case_telephone" />
              <div className="case-description-right">
                <div>"전화보다</div>
                <div id="case1-2">텍스트가 편해"</div>
              </div>
            </div>
            <div className="case">
              <div className="case-description-left">
                <div>"사람 만나는 건 무서워"</div>
              </div>
              <img className="case-pic"src="/images/visual/case_scared.jpg" alt="case_scared" />
            </div>
            <div className="case">
              <img className="case-pic"src="/images/visual/case_scared2.jpg" alt="case_scared2" />
              <div className="case-description-right">
                <div>"말하다가</div>
                <div id="case1-2">실수하면 어떡하지"</div>
              </div>
            </div>
          </div>
          <div className="background-outro">
            <div className="outro-group-problem">
              <div className="problem-description">
                <div className="text-title-main">
                  스마트폰의 보편화로 마주한 <br/>
                  소통에 대한 불안
                </div>
              </div>
              <div className="problem-imgs">
                <img className="fit-size-100vw" src="/images/visual/phones.png" alt="phones"/>
                <img className="fit-size-100vw" id="problem-img-eye" src="/images/visual/eyes.png" alt="eyes"/>
              </div>
            </div>
            <div className="outro-group-solution">
              <div className="solution-description">
                <div className="text-now">
                  지금부터
                </div>
              </div>
              <div className="solution-group-img">
                <div className="img-box-center">
                  <div className="img-box img-box-portrait" id="portrait-left">
                    <img src="/images/visual/solution_1.jpg" alt="solution_1"/>
                  </div>
                  <div className="img-box img-box-portrait" id="portrait-right">
                    <img src="/images/visual/solution_4.jpg" alt="solution_4"/>
                  </div>
                  <div className="img-box img-box-landscape img-overflow" id="landscape-top">
                    <img src="/images/visual/solution_2.jpg" alt="solution_2"/>
                  </div>
                  <div className="img-box img-box-landscape img-overflow" id="landscape-bottom">
                    <img src="/images/visual/solution_3.jpg" alt="solution_3"/>
                  </div>
                </div>
                <div className="img-shadow"/>
                <div className="img-text">
                  AI와의 연습으로 극복하세요
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="talkpossible-function">
          <div className="theme-list">
            <div className="text-default-title">
              8가지의 상황<br/>
              각기 다른 미션
            </div>
            <div className="theme-group-img">
              {icons.map((icon, index) => (
                <div className="theme-item" key={index}>
                  <img className="theme-icon" src={icon} alt="icon-0"/>
                  <div>{desc[index]}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="feedback-service">
            <div className="text-default-title">
              상황 종료후
            </div>
            <div className="text-default-sub">
              1. 대화 내용보기<br/>
              2. 특정 행동 검출<br/>
              3. 말 속도 & 말 더듬 분석
            </div>
          </div>
          <div className="service-effect">
            <div className="text-default-title">
              기대효과
            </div>
            <div className="text-default-sub">
              <div>
                커뮤니케이션 능력 강화<br/>
                실생활 속 다양한 대화 상황에서 보다 자연스럽고 유연하게 의사소통할 수 있는 능력을 강화
              </div>
              <div>
              대화 불안감 완화 및 자신감 증진<br/>
              다양한 대화 상황을 반복적으로 경험하고 연습함으로써, 사용자는 대화 시 겪는 불안과 두려움이 줄어들고 동시에 자신감을 강화
              </div>
              <div>
              무의식적인 습관 인식 및 개선<br/>
              시뮬레이션 종료 후 사용자의 음성과 동작을 분석한 피드백을 제공
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </>
  );
}

export default LandingPage;