import React, { useRef } from 'react';

import '../assets/css/StutterCard.css';

const StutterCard = ({currentResult}) => {
  const audioRef = useRef(null);

  return (
    currentResult ? (
    <div className="card-body">
      <div className="item-center">
        <img className='card-img' src={currentResult && currentResult.imageUrl ? currentResult.imageUrl : "https://source.unsplash.com/random"} alt="스펙트로그램 이미지" />
        {/* <p className='card-img-desc' >(사진에 대한 설명)</p> */}
      </div>

      <div>
        <div className='card-sub-title'>다시 듣기</div>
        <audio ref={audioRef} src={currentResult && currentResult.audioUrl ? currentResult.audioUrl : ""} controls >
          브라우저가 해당 오디오 형식을 지원하지 않습니다. 
        </audio>
      </div>

      <div>
        <div className='card-sub-title'>말더듬 유형</div>
        <div className='card-script'>{currentResult && currentResult.type ? currentResult.type : "정보를 불러올 수 없습니다."}</div>
      </div>

      <div>
        <div className='card-sub-title'>발화 문장</div>
        <div className='card-script'>{currentResult && currentResult.word ? currentResult.word : "정보를 불러올 수 없습니다."}</div>
      </div>
    </div>) : (<NullCard/>)
  )
}

function NullCard () {
  return (
    <h4>분석된 말더듬 데이터가 없습니다.</h4>
  )
}

export default StutterCard;