import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from 'https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0';
import { m } from 'framer-motion';
import AWS from 'aws-sdk';

const MotionDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const videoHeight = 450;
  const videoWidth = 600;

  const lerp = useCallback((value, start, end, startValue, endValue) => {
    return startValue + (endValue - startValue) * ((value - start) / (end - start));
  }, []);

  // const landmarkNames = [
  //   "Nose", "Left Eye Inner", "Left Eye", "Left Eye Outer",
  //   "Right Eye Inner", "Right Eye", "Right Eye Outer", "Left Ear",
  //   "Right Ear", "Left Shoulder", "Right Shoulder", "Left Elbow",
  //   "Right Elbow", "Left Wrist", "Right Wrist"
  // ];
  const landmarkNames = [
    "Nose", 
    "Left Eye Inner", "Left Eye", "Left Eye Outer",
    "Right Eye Inner", "Right Eye", "Right Eye Outer", 
    "Left Ear", "Right Ear",
    "Mouth Left", "Mouth Right", 
    "Left Shoulder", "Right Shoulder", "Left Elbow", "Right Elbow", 
    "Left Wrist", "Right Wrist",
    "Left Pinky", "Right Pinky", "Left Index", "Right Index", "Left Thumb", "Right Thumb",
    // "Left Hip", "Right Hip",
    // "Left Knee", "Right Knee",
    // "Left Ankle", "Right Ankle",
    // "Left Heel", "Right Heel",
    // "Left Foot Index", "Right Foot Index"
  ];

  // S3에 이미지 파일 업로드
  const uploadToS3 = (imgFile) => {
    const REGION = process.env.REACT_APP_MOTION_S3_REGION;
    const ACCESS_KEY = process.env.REACT_APP_MOTION_S3_ACCESS_KEY;
    const SECRET_KEY = process.env.REACT_APP_MOTION_S3_SECRET_KEY;

    // AWS S3 설정
    AWS.config.update({
      region: REGION,
      accessKeyId: ACCESS_KEY,
      secretAccessKey: SECRET_KEY,
    });

    const s3 = new AWS.S3();

    // 업로드할 파일 정보 설정
    const uploadParams = {
      Bucket: process.env.REACT_APP_MOTION_S3_BUCKET_NAME,
      Key: `motion/${imgFile.name}`,
      Body: imgFile,
      ContentType: imgFile.type
    };

    return new Promise((resolve, reject) => {
      s3.upload(uploadParams, (error, data) => {
        if (error) {
          console.error('[동작 인식] 이미지 업로드 실패:', error);
          reject(error);
        } else {
          console.log('[동작 인식] 이미지 업로드 완료!');
          resolve(data.Location); // 이미지 URL 반환
        }
      });
    });
  };  

  // 세션 스토리지에 동작 내역 저장
  const saveToStorage = async (motionName, imgFile) => {
    try {
      // 이미지 업로드
      const imgUrl = await uploadToS3(imgFile);

      // 동작 내역 저장
      const motions = JSON.parse(sessionStorage.getItem('motions')) || [];
      motions.push({ motionName, imgUrl, timestamp: new Date().toISOString() });
      sessionStorage.setItem('motions', JSON.stringify(motions));
    } catch (error) {
      console.error('[동작 인식] 이미지 업로드 중 오류 발생:', error);
    }
  };

  // 머리 만지기 동작 인식: 손목이 어깨 위에 있는지 판단
  const checkWristAboveShoulder = (landmarks) => {
    const leftShoulder = landmarks.find(l => l.name === "Left Shoulder");
    const rightShoulder = landmarks.find(l => l.name === "Right Shoulder");
    const leftWrist = landmarks.find(l => l.name === "Left Wrist");
    const rightWrist = landmarks.find(l => l.name === "Right Wrist");

    const isLeftWristAboveLeftShoulder = leftShoulder && leftWrist && leftWrist.y < leftShoulder.y;
    const isRightWristAboveLeftShoulder = leftShoulder && rightWrist && rightWrist.y < leftShoulder.y;
    const isLeftWristAboveRightShoulder = rightShoulder && leftWrist && leftWrist.y < rightShoulder.y;
    const isRightWristAboveRightShoulder = rightShoulder && rightWrist && rightWrist.y < rightShoulder.y;

    if (isLeftWristAboveLeftShoulder || isRightWristAboveLeftShoulder || isLeftWristAboveRightShoulder || isRightWristAboveRightShoulder) {
      console.log('손이 어깨 위로 올라갔습니다');
    }
  }

  // 거리 계산
  const calculateDistance = (landmark1, landmark2) => {
    return Math.sqrt(
      Math.pow(landmark1.x - landmark2.x, 2) +
      Math.pow(landmark1.y - landmark2.y, 2) +
      Math.pow(landmark1.z - landmark2.z, 2)
    );
  };

  // 머리 만지기 동작 인식: 얼굴과 손목 간 거리로 판단
  const headLandmarks = [ "Nose", 
    "Left Eye Inner", "Left Eye", "Left Eye Outer",
    "Right Eye Inner", "Right Eye", "Right Eye Outer", 
    "Left Ear", "Right Ear"];
  const handLandmarks = [ "Left Wrist", "Right Wrist" ];

  const checkTouchingHead = (landmarks) => {
    const headPoints = headLandmarks.map(name => landmarks.find(l => l.name === name)).filter(Boolean);
    const handPoints = handLandmarks.map(name => landmarks.find(l => l.name === name)).filter(Boolean);

    for (const handPoint of handPoints) {
      for (const headPoint of headPoints) {
        const distance = calculateDistance(handPoint, headPoint);
        if (distance < 1) {
          console.log('머리 만지는 동작이 감지되었습니다.');
          const nowTime = Date.now();
          const actionName = '머리 만지기';
          
          // 동작이 감지되면 이미지 캡처, 세션 스토리지에 저장
          const canvas = document.createElement('canvas');
          const video = videoRef.current;
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(async(blob) => {
            const file = new File([blob], `${actionName}-${nowTime}.png`, { type: 'image/png' });
            await saveToStorage(actionName, file);
          }, 'image/png');
        }
      }
    }
  };

  // 동작 감지 내역 백엔드로 전송
  const postMotionData = async () => {

    // 세션 스토리지에서 동작 감지 내역 가져오기
    const motions = JSON.parse(sessionStorage.getItem('motions')) || [];

    // motionList 생성
    const motionList = motions.length > 0 ? motions.map(motion => ({
      actionName: motion.actionName,
      imgUrl: motion.imgUrl,
      timestamp: motion.timestamp,
    })) : null;
  
    try {
      // 백엔드 API 엔드포인트
      const endpoint = '...';
  
      const body = JSON.stringify({ motionList });
      console.log("body: ", body);
  
      // POST 요청 전송
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
    } catch (error) {
      console.error('Error sending motion data:', error);
    }
    
  };

  useEffect(() => {
    const predictWebcam = async () => {
      if (poseLandmarker && videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvasElement = canvasRef.current;
        const canvasCtx = canvasElement.getContext('2d');

        if (!canvasCtx) {
          console.error('2D context of canvas is null');
          return;
        }

        const drawingUtils = new DrawingUtils(canvasCtx);

        canvasElement.width = videoWidth;
        canvasElement.height = videoHeight;
        video.width = videoWidth;
        video.height = videoHeight;

        const detect = () => {
          if (!poseLandmarker) return;

          const startTimeMs = performance.now();
          poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            if (result.landmarks && result.landmarks.length > 0) {
              //console.log('Landmarks detected:', result.landmarks.length);

              // landmarks 배열의 값들을 landmarkNames와 매핑
              const landmarks = result.landmarks[0].map((landmark, index) => ({
                ...landmark,
                name: landmarkNames[index]
              }));

              // 매핑된 landmarks를 사용하여 어깨, 손목의 좌표값을 콘솔에 출력
              // const keyLandmarks = ['Left Shoulder', 'Right Shoulder', 'Left Wrist', 'Right Wrist'];
              // keyLandmarks.forEach((key) => {
              //   const landmark = landmarks.find(l => l.name === key);
              //   if (landmark && landmark.x !== undefined && landmark.y !== undefined) {
              //     console.log(`Landmark coordinates for ${key}:`, landmark.x, landmark.y);
              //   }
              // });

              // 동작 인식
              //checkWristAboveShoulder(landmarks);
              checkTouchingHead(landmarks);

              drawingUtils.drawLandmarks(landmarks, {
                radius: (data) => {
                  const radius = lerp(data.from.z, -0.15, 0.1, 3, 0.5);
                  return radius < 0 ? 0.5 : radius;
                },
              });
              drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);

              // for (const landmarks of result.landmarks) {

              //  좌표값이 유효한 경우에만 콘솔에 출력
              //  landmarks.forEach((landmark, index) => {
              //    if (landmark.x !== undefined && landmark.y !== undefined && index < 15) {
              //      console.log(`Landmark coordinates for ${landmarkNames[index]}:`, landmark.x, landmark.y);
              //    }
              //  });

              //   drawingUtils.drawLandmarks(landmarks, {
              //     radius: (data) => {
              //       const radius = lerp(data.from.z, -0.15, 0.1, 3, 0.5);
              //       return radius < 0 ? 0.5 : radius;
              //     },
              //   });
              //   drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
              // }
            } else {
              console.log('No landmarks detected');
            }

            canvasCtx.restore();
          });

          window.requestAnimationFrame(detect);
        };

        detect();
      } else {
        console.log('PoseLandmarker or videoRef or canvasRef is not ready');
      }
    };

    if (poseLandmarker && videoRef.current) {
      const enableCam = async () => {
        const constraints = { video: true };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        videoRef.current.srcObject = stream;
        videoRef.current.onloadeddata = () => {
          videoRef.current.play();
          predictWebcam();
        };
      };

      enableCam();
    }
  }, [poseLandmarker, lerp]);

  useEffect(() => {
    const createPoseLandmarker = async () => {
      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
      setPoseLandmarker(poseLandmarker);
      console.log('PoseLandmarker created');
    };

    createPoseLandmarker();
  }, []);

  return (
    <div>
      <video ref={videoRef} style={{ display: 'block', position: 'absolute' }} autoPlay></video>
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute' }}></canvas>
    </div>
  );
};

export default MotionDetection;