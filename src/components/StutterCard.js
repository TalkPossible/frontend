import React, { useRef } from 'react';

const StutterCard = ({stuttered}) => {
  const audioRef = useRef(null);

  return (
    <div style={{height: '100%', display: 'flex', flexDirection: 'column', justifyContent:'space-between'}}>
      <div>
        <img src={stuttered.imageUrl} alt="스펙트로그램 이미지" style={{ width: '100%', borderRadius: '8px' }} />
        <p style={{textAlign: 'center'}}>(사진에 대한 설명)</p>
      </div>

      <div>
        <div>다시 듣기</div>
        <div>
          <audio ref={audioRef} src="your_audio_file_url_here" controls style={{ width: '100%' }}>
            브라우저가 해당 오디오 형식을 지원하지 않습니다. 
          </audio>
        </div>
      </div>

      <div>
        <div>발화 문장</div>
        <div>{stuttered.text}</div>
      </div>

    </div>
  )
}

export default StutterCard;