import React, { useRef } from 'react';

import '../assets/css/StutterCard.css';

const StutterCard = ({stuttered}) => {
  const audioRef = useRef(null);

  return (
    <div className="card-body">
      <div>
        <img className='card-img' src={stuttered.imageUrl} alt="스펙트로그램 이미지" />
        <p className='card-img-desc' >(사진에 대한 설명)</p>
      </div>

      <div>
        <div className='card-sub-title'>다시 듣기</div>
        <audio ref={audioRef} src="your_audio_file_url_here" controls >
          브라우저가 해당 오디오 형식을 지원하지 않습니다. 
        </audio>
      </div>

      <div>
        <div className='card-sub-title'>발화 문장</div>
        <div className='card-script'>{stuttered.text}</div>
      </div>

    </div>
  )
}

export default StutterCard;