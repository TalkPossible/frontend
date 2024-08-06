import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from 'https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0';
import { m } from 'framer-motion';
import AWS from 'aws-sdk';
import { log } from '@tensorflow/tfjs';

const MotionDetection = () => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const videoHeight = 450;
  const videoWidth = 600;

  const startTime = useRef(null);
  const actionStartTime = useRef(null);

  // 최근 거리값을 저장할 버퍼
  const wristAboveShoulderBuffer = useRef([]);
  const distanceBuffer = useRef([]);

  const lerp = useCallback((value, start, end, startValue, endValue) => {
    return startValue + (endValue - startValue) * ((value - start) / (end - start));
  }, []);

  const landmarkNames = [
    "Nose", 
    "Left Eye Inner", "Left Eye", "Left Eye Outer",
    "Right Eye Inner", "Right Eye", "Right Eye Outer", 
    "Left Ear", "Right Ear",
    "Mouth Left", "Mouth Right", 
    "Left Shoulder", "Right Shoulder", "Left Elbow", "Right Elbow", 
    "Left Wrist", "Right Wrist",
    "Left Pinky", "Right Pinky", "Left Index", "Right Index", "Left Thumb", "Right Thumb",
  ];

  // 녹화 시작 시간 설정
  const startRecording = () => {
    const currentTime = Date.now();
    startTime.current = currentTime;
    console.log('녹화 시작 시간 설정됨:', new Date(currentTime).toISOString());
  };

  // 거리 계산
  const calculateDistance = (landmark1, landmark2) => {
    return Math.sqrt(
      Math.pow(landmark1.x - landmark2.x, 2) +
      Math.pow(landmark1.y - landmark2.y, 2) +
      Math.pow(landmark1.z - landmark2.z, 2)
    );
  };

  // 동작 지속 시간 계산
  const calculateActionTime = () => {
    if (actionStartTime.current) {
      return (Date.now() - actionStartTime.current) / 1000;
    }
    return 0;
  };

  // 동작 timestamp 계산(초 단위)
  const calculateElapsedTime = () => {
    if (startTime.current) {
      return (Date.now() - startTime.current) / 1000;
    }
    return 0;
  };

  const formatElapsedTime = (totalSeconds) => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = Math.floor(totalSeconds % 60);
    return minutes + ':' + seconds;
  };

  // // AWS S3에 이미지 파일 업로드
  // const uploadToS3 = (imgFile) => {
  //   const REGION = process.env.REACT_APP_MOTION_S3_REGION;
  //   const ACCESS_KEY = process.env.REACT_APP_MOTION_S3_ACCESS_KEY;
  //   const SECRET_KEY = process.env.REACT_APP_MOTION_S3_SECRET_KEY;

  //   // AWS S3 설정
  //   AWS.config.update({
  //     region: REGION,
  //     accessKeyId: ACCESS_KEY,
  //     secretAccessKey: SECRET_KEY,
  //   });

  //   const s3 = new AWS.S3();

  //   // 업로드할 파일 정보 설정
  //   const uploadParams = {
  //     Bucket: process.env.REACT_APP_MOTION_S3_BUCKET_NAME,
  //     Key: `motion/${imgFile.name}`,
  //     Body: imgFile,
  //     ContentType: imgFile.type
  //   };

  //   return new Promise((resolve, reject) => {
  //     s3.upload(uploadParams, (error, data) => {
  //       if (error) {
  //         console.error('[동작 인식] 이미지 업로드 실패:', error);
  //         reject(error);
  //       } else {
  //         console.log('[동작 인식] 이미지 업로드 완료!');
  //         resolve(data.Location); // 이미지 URL 반환
  //       }
  //     });
  //   });
  // };  

  // 세션 스토리지에 감지된 동작 내역 저장
  const saveToStorage = async (motionName, timestamp) => {
    try {
      // 이미지 업로드
      // const imgUrl = await uploadToS3(imgFile);

      // 동작 내역 저장
      const motions = JSON.parse(sessionStorage.getItem('motions')) || [];
      motions.push({ motionName, timestamp });
      sessionStorage.setItem('motions', JSON.stringify(motions));
    } catch (error) {
      console.error('[동작 인식] 이미지 업로드 중 오류 발생:', error);
    }
  };

  // // 머리 만지기 동작 인식: 손목이 어깨 위에 있는지 판단
  // const checkWristAboveShoulder = (landmarks) => {
  //   const leftShoulder = landmarks.find(l => l.name === "Left Shoulder");
  //   const rightShoulder = landmarks.find(l => l.name === "Right Shoulder");
  //   const leftWrist = landmarks.find(l => l.name === "Left Wrist");
  //   const rightWrist = landmarks.find(l => l.name === "Right Wrist");

  //   const leftWristAboveLeftShoulder = leftShoulder && leftWrist && leftWrist.y < leftShoulder.y;
  //   const rightWristAboveRightShoulder = leftShoulder && rightWrist && rightWrist.y < leftShoulder.y;
  //   const leftWristAboveRightShoulder = rightShoulder && leftWrist && leftWrist.y < rightShoulder.y;
  //   const rightWristAboveLeftShoulder = rightShoulder && rightWrist && rightWrist.y < rightShoulder.y;

  //   const isWristAboveShoulder = leftWristAboveLeftShoulder || rightWristAboveRightShoulder || leftWristAboveRightShoulder || rightWristAboveLeftShoulder;
  
  //   wristAboveShoulderBuffer.current.push(isWristAboveShoulder ? 1 : 0);

  //   if (wristAboveShoulderBuffer.current.length > 5) {
  //     wristAboveShoulderBuffer.current.shift(); // 최근 5개의 값만 유지
  //   }

  //   const averageBufferedStatus = wristAboveShoulderBuffer.current.reduce((a, b) => a + b, 0) / wristAboveShoulderBuffer.current.length;
  //   //console.log('averageBufferedStatus:', averageBufferedStatus);

  //   if (averageBufferedStatus > 0.5) {
  //     if (!actionStartTime.current) {
  //       actionStartTime.current = Date.now();
  //       console.log('손목이 어깨 위에 있는 동작이 처음 감지됨! actionStartTime:', actionStartTime.current);
  //     } else {
  //       const actionTime = calculateActionTime();
  //       console.log('손목이 어깨 위에 있는 동작이 연속적으로 감지됨! actionTime:', actionTime);
  
  //       if (actionTime >= 3) { // 동작이 3초 이상 지속되는지 확인
  //         console.log('손목이 어깨 위에 있는 동작이 3초 이상 지속됨! actionTime: ', actionTime);
  //         const formattedTime = formatElapsedTime(calculateElapsedTime());
  //         const actionName = '머리 만지기';
  
  //         // 동작 감지 내역 세션 스토리지에 저장
  //         saveToStorage(actionName, formattedTime);
  //         actionStartTime.current = null;
  //       }
  //     }
  //   } else {
  //     console.log('손목이 어깨 위에 있는 동작이 감지되지 않음');
  //     actionStartTime.current = null;
  //   }
  // };

  // // 머리 만지기 동작 인식: 얼굴과 손목 간 거리로 판단
  // const headLandmarks = [ "Nose", 
  //   "Left Eye Inner", "Left Eye", "Left Eye Outer",
  //   "Right Eye Inner", "Right Eye", "Right Eye Outer", 
  //   "Left Ear", "Right Ear"];
  // const wristLandmarks = [ "Left Wrist", "Right Wrist" ];

  // const checkTouchingHead = (landmarks) => {
  //   const headPoints = headLandmarks.map(name => landmarks.find(l => l.name === name)).filter(Boolean);
  //   const wristPoints = wristLandmarks.map(name => landmarks.find(l => l.name === name)).filter(Boolean);

  //   let totalDistance = 0;
  //   let count = 0;

  //   for (const wristPoint of wristPoints) {
  //     for (const headPoint of headPoints) {
  //       const distance = calculateDistance(wristPoint, headPoint);
  //       totalDistance += distance;
  //       count += 1;
  //     }
  //   }

  //   const averageDistance = totalDistance / count;
  //   distanceBuffer.current.push(averageDistance);

  //   if (distanceBuffer.current.length > 5) {
  //     distanceBuffer.current.shift(); // 최근 5개의 거리값만 유지
  //   }

  //   const averageBufferedDistance = distanceBuffer.current.reduce((a, b) => a + b, 0) / distanceBuffer.current.length;
  //   //console.log('averageBufferedDistance:', averageBufferedDistance);

  //   if (averageBufferedDistance < 1.2) {
  //     if (!actionStartTime.current) {
  //       actionStartTime.current = Date.now();
  //       //console.log('동작이 처음 감지됨! actionStartTime:', actionStartTime.current);
  //     } else {
  //       const actionTime = calculateActionTime();
  //       //console.log('동작이 연속적으로 감지됨! actionTime:', actionTime);
          
  //       if (actionTime >= 3) { // 동작이 3초 이상 지속되는지 확인
  //         console.log('머리 만지는 동작이 3초 이상 지속됨! actionTime: ' + actionTime + '초 ing');
  //         const formattedTime = formatElapsedTime(calculateElapsedTime());
  //         const actionName = '머리 만지기';

  //         // 동작이 감지되면 이미지 캡처
  //         // const canvas = document.createElement('canvas');
  //         // const video = videoRef.current;
  //         // canvas.width = video.videoWidth;
  //         // canvas.height = video.videoHeight;
  //         // const ctx = canvas.getContext('2d');
  //         // ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  //         // canvas.toBlob(async (blob) => {
  //         //   const file = new File([blob], `${actionName}-${formattedTime}.png`, { type: 'image/png' });
  //         //   await saveToStorage(actionName, file, formattedTime);
  //         // }, 'image/png');
          
  //         // 동작 감지 내역 세션 스토리지에 저장
  //         saveToStorage(actionName, formattedTime);
  //         actionStartTime.current = null;
  //       }
  //     }
  //   } 
  //   else {
  //     //console.log('머리 만지는 동작이 감지되지 않음');
  //     actionStartTime.current = null;
  //   }
  // };

  // 좌표 평균값 계산
  const getAverageCoordinate = (coordinates) => {
    const sum = coordinates.reduce((acc, coord) => {
      acc.x += coord.x;
      acc.y += coord.y;
      return acc;
    }, { x: 0, y: 0 });

    return {
      x: sum.x / coordinates.length,
      y: sum.y / coordinates.length
    };
  };

  // 목 만지기 동작 인식: 손가락 좌표들(pinky, index, thumb)의 평균 좌표가 목 범위에 있는지
  const checkTouchingNeck = (landmarks) => {

    const leftShoulder = landmarks.find(l => l.name === "Left Shoulder");
    const rightShoulder = landmarks.find(l => l.name === "Right Shoulder");

    const nose = landmarks.find(l => l.name === "Nose");
    const mouthLeft = landmarks.find(l => l.name === "Mouth Left");
    const mouthRight = landmarks.find(l => l.name === "Mouth Right");
    const mouth = {
      x: (mouthLeft.x + mouthRight.x) / 2,
      y: (mouthLeft.y + mouthRight.y) / 2,
      z: (mouthLeft.z + mouthRight.z) / 2
    };
  
    const leftWrist = landmarks.find(l => l.name === "Left Wrist");
    const rightWrist = landmarks.find(l => l.name === "Right Wrist");

    // const leftPinky = landmarks.find(l => l.name === "Left Pinky");
    // const leftIndex = landmarks.find(l => l.name === "Left Index");
    // const leftThumb = landmarks.find(l => l.name === "Left Thumb");

    // const rightPinky = landmarks.find(l => l.name === "Right Pinky");
    // const rightIndex = landmarks.find(l => l.name === "Right Index");
    // const rightThumb = landmarks.find(l => l.name === "Right Thumb");

    // 목의 상하 경계 설정
    const neckBottomY = (leftShoulder.y + rightShoulder.y) / 2;
    const mouthToNoseDistanceY = Math.abs(mouth.y - nose.y);
    const neckTopY = mouth.y + 2 * mouthToNoseDistanceY;

    // 목의 좌우 경계 설정
    const neckBottomX = (leftShoulder.x + rightShoulder.x) / 2;
    const neckLeftX = neckBottomX + (leftShoulder - rightShoulder) / 4;
    const neckRightX = neckBottomX - (leftShoulder - rightShoulder) / 4;

    // 손목이 목 범위 내에 있는지 확인
    const isWristInNeckRange = (wrist) => (
      wrist.y >= neckTopY && wrist.y <= neckBottomY && wrist.x < leftShoulder.x && wrist.x > rightShoulder.x
    );

    if (isWristInNeckRange(leftWrist) || isWristInNeckRange(rightWrist)) {
      // if (isWristInNeckRange(leftWrist)) {
      //   console.log('왼쪽 손목으로 목 만짐');
      // }
      // if (isWristInNeckRange(rightWrist)) {
      //   console.log('오른쪽 손목으로 목 만짐');
      // }
      console.log('[목 만지기] 행동이 감지됨');
    } else {
      console.log('[목 만지기] 행동이 감지되지 않음');
    }

    // // 손가락 랜드마크 배열
    // const leftFingers = [ leftPinky, leftIndex, leftThumb ];
    // const rightFingers = [ rightPinky, rightIndex, rightThumb ];

    // // 손가락 좌표들의 평균 좌표가 목 범위 내에 있는지 확인
    // const isHandInNeckRange = (fingers) => {
    //   const averageCoord = getAverageCoordinate(fingers);
    //   return averageCoord.y >= neckTopY && averageCoord.y <= neckBottomY &&
    //     averageCoord.x < leftShoulder.x && averageCoord.x > rightShoulder.x;
    //     //averageCoord.x < neckLeftX && averageCoord.x > neckRightX;
    // };

    // const isLeftHandInNeckRange = isHandInNeckRange(leftFingers);
    // const isRightHandInNeckRange = isHandInNeckRange(rightFingers);

    // if (isLeftHandInNeckRange || isRightHandInNeckRange) {
    //   // if (isLeftHandInNeckRange) {
    //   //   console.log('왼손으로 목 만짐');
    //   // }
    //   // if (isRightHandInNeckRange) {
    //   //   console.log('오른손으로 목 만짐');
    //   // }
    //   console.log('[목 만지기] 행동이 감지됨');
    // } else {
    //   //console.log('[목 만지기] 행동이 감지되지 않음');
    // }

  };

  // 얼굴 만지기 동작 인식
  const checkTouchingFace = (landmarks) => {
    const leftPinky = landmarks.find(l => l.name === "Left Pinky");
    const leftIndex = landmarks.find(l => l.name === "Left Index");
    const leftThumb = landmarks.find(l => l.name === "Left Thumb");

    const rightPinky = landmarks.find(l => l.name === "Right Pinky");
    const rightIndex = landmarks.find(l => l.name === "Right Index");
    const rightThumb = landmarks.find(l => l.name === "Right Thumb");

    const nose = landmarks.find(l => l.name === "Nose");
    const mouthLeft = landmarks.find(l => l.name === "Mouth Left");
    const mouthRight = landmarks.find(l => l.name === "Mouth Right");

    const leftEyeInner = landmarks.find(l => l.name === "Left Eye Inner");
    const leftEye = landmarks.find(l => l.name === "Left Eye");
    const leftEyeOuter = landmarks.find(l => l.name === "Left Eye Outer");
    const rightEyeInner = landmarks.find(l => l.name === "Right Eye Inner");
    const rightEye = landmarks.find(l => l.name === "Right Eye");
    const rightEyeOuter = landmarks.find(l => l.name === "Right Eye Outer");

    const leftEar = landmarks.find(l => l.name === "Left Ear");
    const rightEar = landmarks.find(l => l.name === "Right Ear");

    // 손가락 랜드마크 배열
    const leftHandFingers = [ leftPinky, leftIndex, leftThumb ];
    const rightHandFingers = [ rightPinky, rightIndex, rightThumb ];

    // 얼굴 랜드마크 배열
    const faceLandmarks = [
      nose, 
      leftEyeInner, leftEye, leftEyeOuter,
      rightEyeInner, rightEye, rightEyeOuter, 
      leftEar, rightEar,
      mouthLeft, mouthRight
    ];

    // 얼굴 <-> 손가락 거리 기준
    const FACE_TOUCH_THRESHOLD = 0.6

    // 얼굴 만지기 동작 감지
    const isTouchingFace = (fingers, faceLandmarks) => {
      for (const finger of fingers) {
        for (const landmark of faceLandmarks) {
          const distance = calculateDistance(finger, landmark);
          if (distance < FACE_TOUCH_THRESHOLD) {
            return true;
          }
        }
      }
      return false;
    };

    // 왼손, 오른손 각각에 대해 얼굴을 만지는지 확인
    const isLeftHandTouchingFace = isTouchingFace(leftHandFingers, faceLandmarks);
    const isRightHandTouchingFace = isTouchingFace(rightHandFingers, faceLandmarks);

    if (isLeftHandTouchingFace || isRightHandTouchingFace) {
      // if (isLeftHandTouchingFace) {
      //   console.log('왼손으로 얼굴 만짐');
      // }
      // if (isRightHandTouchingFace) {
      //   console.log('오른손으로 얼굴 만짐');
      // }
      console.log('[얼굴 만지기] 행동이 감지됨');
    } else {
      //console.log('[얼굴 만지기] 행동이 감지되지 않음');
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
      const endpoint = '...'; // endpoint 추가 필요
  
      const body = JSON.stringify({ motionList });
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

              // landmarks 배열의 값들을 landmarkNames와 매핑
              const landmarks = result.landmarks[0].map((landmark, index) => ({
                ...landmark,
                name: landmarkNames[index]
              }));

              // 머리 만지는 동작 인식
              //checkTouchingHead(landmarks);
              //checkWristAboveShoulder(landmarks);
              checkTouchingNeck(landmarks);
              checkTouchingFace(landmarks);

              drawingUtils.drawLandmarks(landmarks, {
                radius: (data) => {
                  const radius = lerp(data.from.z, -0.15, 0.1, 3, 0.5);
                  return radius < 0 ? 0.5 : radius;
                },
              });
              drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
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
          startRecording(); // 녹화 시작 시간 설정
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
    <div style={{ position: 'relative' }}>
      <video ref={videoRef} style={{ display: 'block', position: 'absolute', zIndex: 0 }} autoPlay></video>
      <canvas ref={canvasRef} style={{ display: 'block', position: 'absolute', zIndex: 1 }}></canvas>
    </div>
  );
};

export default MotionDetection;