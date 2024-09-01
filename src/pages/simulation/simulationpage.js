import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AWS from 'aws-sdk';

import video1 from '../../assets/images/1.mp4';
import video2 from '../../assets/images/2.mp4';
import capturepic from '../../assets/images/3.jpg'; 

import './simulationpage.css';

import MotionDetection from '../motion/motiondetection.js';
import { gptAPI, sendAudioFileNameListAPI } from "../../service/ApiService.js";
import { useTxtRec } from '../../context/TxtRecContext.js';
import { API_BASE_URL } from "../../api/apiConfig.js";

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

const uploadToS3 = async (blob) => {
  const s3 = configureS3();
  const params = {
    Bucket: process.env.REACT_APP_MOTION_S3_BUCKET_NAME,
    Key: `video/${Date.now()}.webm`,
    Body: blob,
    ContentType: 'video/webm',
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, (err, data) => {
      if (err) {
        console.error("Error uploading video to S3: ", err);
        reject(err);
      } else {
        resolve(data.Location);
      }
    });
  });
};

// 동작 감지 내역 백엔드로 전송
const postMotionData = async (motions, videoUrl, simulationTime) => {

    // motionList 생성
    const motionList = motions.length > 0 ? motions.map(motion => ({
      motionName: motion.motionName,
      timestamp: motion.timestamp,
    })) : [];

    const simulationId = parseInt(localStorage.getItem('simulationId'), 10);
    const patientId = parseInt(localStorage.getItem('patientId'), 10);
    const runDate = new Date().toISOString().split('T')[0];
    const totalTime = simulationTime;

    try {
      const endpoint = API_BASE_URL + '/api/v1/motion';
  
      const body = JSON.stringify({ 
        simulationId,
        patientId,
        runDate,
        motionList, 
        videoUrl,
        totalTime 
      });
      // console.log("body: ", body);
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: body,
      });
  
      if (!response.ok) {
        const errorText = await response.text();
        console.log('*** send error: ' + errorText);
        throw new Error(`Failed to send motion data: ${errorText}`);
      }
  
      // console.log('Motion data sent successfully!');
  
      // 성공적으로 전송 후 세션 스토리지 비우기
      sessionStorage.removeItem('motions');
      sessionStorage.removeItem('videoUrl');
    } catch (error) {
      console.error('Error sending motion data:', error);
    }  
};

const SimulationPage = () => {
  const [started, setStarted] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [stream, setStream] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(video1);
  const [nextVideo, setNextVideo] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  const [isRecording, setIsRecording] = useState(false);

  const startTime = useRef(null); // 시뮬레이션 시작 시각
  const endTime = useRef(null); // 시뮬레이션 종료 시각 

  const navigate = useNavigate();

  const { ttsStop, fileNameList, userMicDis, setCacheId, setContent, 
    recording, handleStartRecording, handleStopRecording } = useTxtRec();

  const recordButton = useRef(null);

  useEffect(() => {
    if (recordButton.current) {
      if (userMicDis) {
        recordButton.current.classList.add('disable-hover');
        setCurrentVideo(video1);
      } else {
        recordButton.current.classList.remove('disable-hover');
        setCurrentVideo(video2);  
      }
    }
  }, [userMicDis]);


  useEffect(() => {
    if (!userMicDis) {
      handleVideoTransition(video2);
    }
  }, [recording]);

  const handleVideoTransition = (newVideo) => {
    if (currentVideo === newVideo) return;

    setTransitioning(true);
    setNextVideo(newVideo);

    // 숨겨질 비디오를 z-index로 가리기
    document.querySelectorAll('.video').forEach((video) => {
      if (video.src !== newVideo) {
        video.classList.add('hidden');
        video.classList.add('hidden-video');
      }
    });

    // 새 비디오를 z-index로 보이게 하기
    setTimeout(() => {
      setCurrentVideo(newVideo);
      setNextVideo(null);
      setTransitioning(false);
      
      // 숨겨진 비디오의 z-index를 기본으로 설정
      document.querySelectorAll('.hidden-video').forEach((video) => {
        video.classList.remove('hidden-video');
      });
    }, 0); // 즉시 전환되도록 설정
  }

  const calculateTotalTime = (start, end) => {
    const diff = new Date(end.current - start.current);
    return diff.toISOString().slice(11, 19); // HH:mm:ss 형식으로 반환

  };

  const startSimulation = async () => {
    if (started) return;


    setVideoUrl(null); // 이전 비디오 URL 초기화
    startTime.current = new Date();
    // console.log('*** startTime: ' + startTime);


    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
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

        endTime.current = new Date(); // 시뮬레이션 종료 시각 기록
        // console.log('*** endTime: ' + endTime);
        const simulationTime = calculateTotalTime(startTime, endTime); // 시뮬레이션 진행 시간 계산

        const blob = new Blob(chunks, { type: 'video/webm' });
        
        // 세션 스토리지에서 동작 감지 내역 가져오기
        const motions = JSON.parse(sessionStorage.getItem('motions')) || [];

        try {
          const s3Url = await uploadToS3(blob);

          setVideoUrl(s3Url); // S3 URL로 업데이트

          // 백엔드로 데이터 전송
          await postMotionData(motions, s3Url, simulationTime);


        } catch (error) {
          console.error("Error uploading video to S3: ", error);
        } finally {
          setStarted(false);
          setIsRecording(false); // Motion Detection 중지
          if (stream) {
            stream.getTracks().forEach(track => track.stop());
          }
          setMediaRecorder(null);
          setStream(null);
        }
      };

      recorder.start();
      setStarted(true);

      setIsRecording(true); // MotionDetection 시작

      // 백엔드 api 호출 : gpt와 대화하기 : gpt의 답변을 먼저 받기 위해 started==true일 때 빈 문자열을 보냄 (처음 한번만 실행)

      gptAPI("", null).then(newResponse => {
        setCacheId(newResponse.newCacheId);
        setContent(newResponse.newContent);
      }).catch(error => {
        console.log('Error calling GPT API or TTS API: ', error);
      });

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
      ttsStop();
      // console.log("[상황종료] 파일명 리스트 : ", fileNameList);
      setTimeout(() => {
        sendAudioFileNameListAPI(fileNameList);
      }, 10000);
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
            마지막 발화를 인지하지 못 할 수 있으니 <br/>
            <span>텀</span>을 두고 버튼을 클릭해주세요.
          </div>
          <button className="startButton" onClick={startSimulation}>
            시뮬레이션 시작
          </button>
        </>
      ) : (
        <div className="simulationContainer">
          <div className="topSection">
            <div className="video-container">
              <img
                src={capturepic}
                alt="background"
                className="capturepic"
              />
              <video 
                key={currentVideo} 
                src={currentVideo} 
                className={`video ${transitioning ? 'hidden' : ''}`} 
                autoPlay 
                loop 
                muted 
              />
              {nextVideo && (
                <video 
                  key={nextVideo} 
                  src={nextVideo} 
                  className={`video ${transitioning ? '' : 'hidden'}`} 
                  autoPlay 
                  loop 
                  muted 
                />
              )}
            </div>
            <button className="stopButton" onClick={stopSimulation}>종료</button>
          </div>
          <div className="bottomSection">
            <button 
              className="recordButton disable-hover" 
              disabled={userMicDis} 
              ref={recordButton}
              onClick={recording ? handleStopRecording : handleStartRecording}
            >
              <img 
                className="micImage"
                src={recording ? "/images/simul/mic_ing.png" : "/images/simul/mic.png"} 
                alt="mic"  
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
      <MotionDetection isRecording={isRecording}/>
    </div>
  );
}


export default SimulationPage;


