import React, { useState } from 'react';
import './simulationpage.css';
import conversationImage from '../../assets/images/simultest.jpg';
import micImage from '../../assets/images/blackmic.png';
import AWS from 'aws-sdk';

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
    ACL: 'public-read',
  };

  console.log("Uploading to S3 with params:", params); 

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

// 테스트 업로드 함수
const testUpload = async () => {
  const s3 = configureS3();
  const params = {
    Bucket: process.env.REACT_APP_MOTION_S3_BUCKET_NAME, 
    Key: `test-${Date.now()}.txt`,
    Body: 'This is a test file.',
    ContentType: 'text/plain',
    ACL: 'public-read',
  };

  try {
    const data = await s3.upload(params).promise();
    console.log("Test upload successful: ", data.Location);
  } catch (err) {
    console.error("Test upload failed: ", err);
  }
};

const SimulationPage = () => {
  const [started, setStarted] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [stream, setStream] = useState(null);

  const startSimulation = async () => {
    setVideoUrl(null); 
    try {
      const userMediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
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
        }
      };

      recorder.start();
      setStarted(true);
    } catch (error) {
      console.error("Error accessing webcam: ", error);
    }
  };

  const stopSimulation = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setStarted(false);

      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }
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
    </div>
  );
};

testUpload();

export default SimulationPage;
