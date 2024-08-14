import React, { useState } from 'react';
import './simulationpage.css';
import conversationImage from '../../assets/images/simultest.jpg';
import micImage from '../../assets/images/blackmic.png';
import AWS from 'aws-sdk';
import MotionDetection from '../motion/motiondetection';

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

// 동작 감지 내역 백엔드로 전송
const postMotionData = async (motions, videoUrl) => {

    // motionList 생성
    const motionList = motions.length > 0 ? motions.map(motion => ({
      actionName: motion.motionName,
      timestamp: motion.timestamp,
    })) : null;
  
    try {
      const endpoint = '/api/v1/motion';
  
      const body = JSON.stringify({ motionList, videoUrl });
      console.log("body: ", body);
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: body,
      });
  
      if (!response.ok) {
        throw new Error('Failed to send motion data');
      }
  
      console.log('Motion data sent successfully!');
  
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
  const [isRecording, setIsRecording] = useState(false);

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
        
        // 세션 스토리지에서 동작 감지 내역 가져오기
        const motions = JSON.parse(sessionStorage.getItem('motions')) || [];

        // 업로드 및 URL 업데이트
        try {
          const s3Url = await uploadToS3(blob);
          setVideoUrl(s3Url); // S3 URL로 업데이트

          // 백엔드로 데이터 전송
          await postMotionData(motions, s3Url);

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
    } else {
      console.error("MediaRecorder is already inactive or not initialized.");
    }
  };

  return (
    <div className="container">
      {!started ? (
        <button className="startButton" onClick={startSimulation}>
          시뮬레이션 시작
        </button>
      ) : (
        <div className="simulationContainer">
          <div className="topSection">
            <img src={conversationImage} alt="Conversation Partner" className="image" />
            <button className="stopButton" onClick={stopSimulation}>종료</button>
          </div>
          <div className="bottomSection">
            <button className="recordButton">
              <img src={micImage} alt="Mic Icon" className="micImage" />
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
