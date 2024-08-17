import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AWS from 'aws-sdk';

import conversationImage from '../../assets/images/simultest.jpg';

import './simulationpage.css';

import {gptAPI} from "../../service/ApiService.js";
import {ttsAPI} from "../../utils/FuncGoogleTTS.js";
import { useTxtRec } from '../../context/TxtRecContext.js';


// // 환경 변수 로그
// console.log("AWS S3 Region:", process.env.REACT_APP_MOTION_S3_REGION);
// console.log("AWS S3 Access Key:", process.env.REACT_APP_MOTION_S3_ACCESS_KEY);
// console.log("AWS S3 Secret Key:", process.env.REACT_APP_MOTION_S3_SECRET_KEY);
// console.log("AWS S3 Bucket for Videos:", process.env.REACT_APP_MOTION_S3_BUCKET_NAME);

// AWS S3 설정 함수
const configureS3 = () => {
  const REGION = process.env.REACT_APP_MOTION_S3_REGION;
  const ACCESS_KEY = process.env.REACT_APP_MOTION_S3_ACCESS_KEY;
  const SECRET_KEY = process.env.REACT_APP_MOTION_S3_SECRET_KEY;

  AWS.config.update({
    region: REGION,
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
  });

  return new AWS.S3();
};

// 비디오를 S3에 업로드하는 함수
const uploadToS3 = async (blob) => {
  const s3 = configureS3(); // AWS S3 설정
  const params = {
    Bucket: process.env.REACT_APP_MOTION_S3_BUCKET_NAME, // 비디오를 업로드할 버킷
    Key: `video/${Date.now()}.webm`, // 비디오 파일을 video 폴더에 업로드
    Body: blob,
    ContentType: 'video/webm',
  };

  console.log("Uploading to S3 with params:", params); // 디버깅을 위해 콘솔 출력

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        console.error("Error uploading video to S3: ", err);
        reject(err);
      } else {
        resolve(data.Location); // 업로드된 비디오의 URL 반환
      }
    });
  });
};

const SimulationPage = () => {
  const [started, setStarted] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [stream, setStream] = useState(null);

  const navigate = useNavigate();

  const [cacheId, setCacheId] = useState(null); // gpt의 cacheId
  const [content, setContent] = useState(""); // gpt의 답변

  const { setUserMicDis, userMicDis, userTermMessage, recording, handleStartRecording, handleStopRecording } = useTxtRec();

  const recordButton = useRef(null);

  useEffect(() => {
    if (recordButton.current) {
      if (userMicDis) {
        recordButton.current.classList.add('disable-hover');
      } else {
        recordButton.current.classList.remove('disable-hover');
      }
    }
  }, [userMicDis]);

  useEffect(() => {
    if (started) {
      // started가 true이고, userTermMessae가 변경되면 gptAPI 호출
      gptAPI(userTermMessage, cacheId).then(newResponse => {
      setCacheId(newResponse.newCacheId);
        setContent(newResponse.newContent);
      }).catch(error => {
        console.log('Error calling GPT API or TTS API: ', error);
      });
    } else {
      window.speechSynthesis.cancel();  
    }
  },[userTermMessage, started]); 

  useEffect(() => {
    if (content !== "") {
      // content가 변경되면 ttsAPI 호출
      if (started === true && content !== "" && cacheId !== null) {
        ttsAPI(content, setUserMicDis);
      };
    };
  }, [started, cacheId, content]);

  const startSimulation = async () => {
    if (started) return; // 이미 시작된 경우 중복 호출 방지

    setVideoUrl(null); // 이전 비디오 URL 초기화
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true, // 오디오 포함
      });

      const recorder = new MediaRecorder(userMediaStream);
      setMediaRecorder(recorder);
      setStream(userMediaStream);

      const chunks = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunks.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });

        // 업로드 및 URL 업데이트
        try {
          const s3Url = await uploadToS3(blob);
          setVideoUrl(s3Url); // S3 URL로 업데이트
        } catch (error) {
          console.error("Error uploading video to S3: ", error);
        } finally {
          setStarted(false);
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          setMediaRecorder(null);
          setStream(null);
        }
      };

      recorder.start();
      setStarted(true);
    } catch (error) {
      if (error.name === "NotReadableError") {
        console.error("웹캠 접근 오류: 다른 애플리케이션이 웹캠을 사용 중이거나 리소스 문제로 인해 접근할 수 없습니다.");
      } else {
        console.error("웹캠 접근 오류: ", error.name, error.message);
      }
    }
  };

  const stopSimulation = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      navigate('/');
    } else {
      console.error("MediaRecorder is already inactive or not initialized.");
    }
  };

  return (
    <div className="container">
      {!started ? (
        <>
          <div className="description">
            <span>말하는 도중</span> 또는 <span>발화 직후</span> 녹음중지 버튼을 누르면 <br/>
            마지막 발화를 인지하지 못 할 수 있느니 <br/>
            <span>텀</span>을 두고 버튼을 클릭해주세요.
          </div>
          <button className="startButton" onClick={startSimulation}>
            시뮬레이션 시작
          </button>
        </>
      ) : (
        <div className="simulationContainer">
          <div className="topSection">
            <img src={conversationImage} alt="Conversation Partner" className="image" />
            <button className="stopButton" onClick={stopSimulation}>종료</button>
          </div>
          <div className="bottomSection">
            <button className="recordButton disable-hover" disabled={userMicDis} ref={recordButton}
              onClick={recording ? handleStopRecording : handleStartRecording}
            >
              <img className="micImage"
                src={recording ? "/images/simul/mic_ing.png" : "/images/simul/mic.png"} alt="mic"  
              />
            </button>
          </div>
          {videoUrl && (
            <div className="videoContainer">
              <a href={videoUrl} download="recorded-video.webm">
                Download Video
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default SimulationPage;
