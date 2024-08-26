import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AWS from 'aws-sdk';

import video1 from '../../assets/images/1.mp4';
import video2 from '../../assets/images/2.mp4';

import './simulationpage.css';

import { gptAPI } from "../../service/ApiService.js";
import { useTxtRec } from '../../context/TxtRecContext.js';

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

const SimulationPage = () => {
  const [started, setStarted] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [stream, setStream] = useState(null);
  const [currentVideo, setCurrentVideo] = useState(video1);

  const navigate = useNavigate();

  const { ttsStop, fileNames, userMicDis, setCacheId, setContent, 
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
      setCurrentVideo(video2);  
    }
  }, [recording]);

  const startSimulation = async () => {
    if (started) return;

    setVideoUrl(null);

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
        const blob = new Blob(chunks, { type: 'video/webm' });

        try {
          const s3Url = await uploadToS3(blob);
          setVideoUrl(s3Url);
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
            <video src={currentVideo} autoPlay loop muted className="video" />
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
