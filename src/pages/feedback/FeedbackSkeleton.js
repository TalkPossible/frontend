import { Button } from '@chakra-ui/react';
import React from 'react';

export const FdMainSkeleton = () => {
  return (
    <div className="fd-main">
      <div className="fd-title">
        <p className="ttl-name">Loading...</p>
        <div className="ttl-info">
          <p><span>Loading...</span></p>
          <p><span>Loading...</span></p>
        </div>
      </div>
      <div className="fd-video"></div>
    </div>
  );
};

export const FdMenuListSkeleton = () => {
  return (
    <div className="fd-menu menu-list">
      <div className="sub-menu">
        <p className="header-title">menu</p>
        <div className="menu-box">
          <div>대화 내용</div>
          <div>음성 피드백</div>
          <div>행동 피드백</div>
        </div>
      </div>
      <div className="sub-info">
        <p className="header-title">info</p>
        <div className="info-box">
          <div className="sub-container">
            <p className="sub-title">전체 시간</p>
            <p className="sub-value">Loading...</p>
          </div>
          <div className="sub-container">
            <p className="sub-title">분당 어절수</p>
            <p className="sub-value">Loading...</p>
          </div>
          <div className="sub-container">
            <p className="sub-title">모션 감지 횟수</p>
            <p className="sub-value">Loading...</p>
          </div>
        </div>
      </div>
      <div className="menu-footer">
        <button className="fd-confirmBtn">확인완료</button>
      </div>
    </div>
  );
};

export const FdMenuConversationSkeleton = () => {
  return (
    <div className="fd-menu menu-conversation">
      <div className="menu-detail-header">
        <div className="header-title">대화 내용</div>
        <button>&times;</button>
      </div>
      <div className="part-rest part-scroll skeleton">
        {[...Array(3)].map((_, index) => (
          <div key={index}>
            <div>Loading...</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const FdMenuVoiceSkeleton = () => {
  return (
    <div className="fd-menu menu-voice">
      <div className="menu-detail-header">
        <div className="header-title">말더듬 분석</div>
        <button>&times;</button>
      </div>
      <div className="part-rest">
        <div></div>
      </div>
      <div className="btn-pn">
        <button>Prev</button>
        <Button>Next</Button>
      </div>
    </div>
  );
};

export const FdMenuMotionSkeleton = () => {
  return (
    <div className="fd-menu menu-motion">
      <div className="menu-detail-header">
        <div className="header-title">동작 분석</div>
        <button>&times;</button>
      </div>
      <div className="part-rest part-scroll">
        {[...Array(3)].map((_, index) => (
          <p key={index} className="motion">
            <span>Loading...</span> <span>Loading...</span>
          </p>
        ))}
      </div>
    </div>
  );
};
