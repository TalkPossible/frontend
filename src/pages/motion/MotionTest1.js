import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from 'https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0';

/**
 * 은채 동작 감지 로직 테스트용
 */
const MotionTest1 = ({ isRecording }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const videoHeight = 450;
  const videoWidth = 600;

  const startTime = useRef(null);
  // const actionStartTime = useRef(null);
  const actionStartTimes =  useRef({
    touchingHead: null,
    touchingNeck: null,
    touchingFace: null
  });

  // 최근 거리값을 저장할 버퍼
  const buffers = useRef({
    touchingHeadBuffer: [],
    touchingNeckBuffer: [],
    touchingFaceBuffer: []
  });

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

  // isRecording 상태가 변경될 때 녹화 시작 시간 설정
  useEffect(() => {
    if (isRecording) {
      startRecording();
    }
  }, [isRecording]);



  // 거리 계산
  const calculateDistance = (landmark1, landmark2) => {
    return Math.sqrt(
      Math.pow(landmark1.x - landmark2.x, 2) +
      Math.pow(landmark1.y - landmark2.y, 2) +
      Math.pow(landmark1.z - landmark2.z, 2)
    );
  };

  // 동작 지속 시간 계산
  const calculateActionTime = (startTime) => {
    return startTime ? (Date.now() - startTime) / 1000 : 0;
  };

  // 동작 timestamp 계산(초 단위)
  const calculateElapsedTime = () => {
    return startTime.current ? (Date.now() - startTime.current) / 1000 : 0;
  };

  // 동작 timestamp '분:초' 형식으로 변환
  const formatElapsedTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = Math.floor(totalSeconds % 60);

    // 시, 분, 초를 2자리 수로 맞추기 위해 padStart 사용
    return String(hours).padStart(2, '0') + ':' + 
           String(minutes).padStart(2, '0') + ':' + 
           String(seconds).padStart(2, '0');
};

  const actionTypeToName = {
    touchingHead: "머리 만지기",
    touchingNeck: "목 만지기",
    touchingFace: "얼굴 만지기"
  };

  // 세션 스토리지에 감지된 동작 내역 저장
  const saveToStorage = async (motionName, timestamp) => {
    try {
      const motions = JSON.parse(sessionStorage.getItem('motions')) || [];
      motions.push({ motionName, timestamp });
      sessionStorage.setItem('motions', JSON.stringify(motions));
    } catch (error) {
      console.error('[동작 인식] 이미지 업로드 중 오류 발생:', error);
    }
  };

  // 동작 버퍼 업데이트
  const updateBuffer = (buffer, value) => {
    if (!buffer) {
      throw new Error("Buffer is undefined");
    }
    buffer.push(value ? 1 : 0);
    if (buffer.length > 5) {
      buffer.shift(); // 최근 5개의 값만 유지
    }
    return buffer.reduce((a, b) => a + b, 0) / buffer.length;
  };

  // 동작 판단 로직 (공통)
  // -> 특정 동작이 3초이상 감지되면 세션 스토리지에 동작 감지 내역 저장
  const detectAction = (buffer, actionType, isActionDetected, threshold = 0.5, duration = 3) => {
    const averageBufferedStatus = updateBuffer(buffer, isActionDetected);
  
    if (averageBufferedStatus > threshold) {
      if (!actionStartTimes.current[actionType]) {
        actionStartTimes.current[actionType] = Date.now();
        //console.log([${actionType}] 동작이 처음 감지됨! actionStartTime:, actionStartTimes.current[actionType]);
      } else {
        const actionTime = calculateActionTime(actionStartTimes.current[actionType]);
        //console.log([${actionType}] 동작이 연속적으로 감지됨! actionTime:, actionTime);
  
        if (actionTime >= duration) {
          console.log(`[${actionType}] 동작이 ${duration}초 이상 지속됨! actionTime:`, actionTime);
          const formattedTime = formatElapsedTime(calculateElapsedTime());
          const motionName = actionTypeToName[actionType];
          saveToStorage(motionName, formattedTime);
          actionStartTimes.current[actionType] = null;
        }
      }
    } else {
      actionStartTimes.current[actionType] = null;
    }
  };

  // 머리 만지기 동작 인식
  const checkTouchingHead = (landmarks) => {

    const getLandmark = (name) => landmarks.find(l => l.name === name);

    // 손가락 랜드마크 배열
    const leftHandFingers = ["Left Pinky", "Left Index", "Left Thumb"].map(getLandmark);
    const rightHandFingers = ["Right Pinky", "Right Index", "Right Thumb"].map(getLandmark);
    
    // 귀 랜드마크 배열
    const ears = ["Left Ear", "Right Ear"].map(getLandmark);

    // 손가락 <-> 귀 거리 기준
    const HEAD_TOUCH_THRESHOLD = 0.3

    // 머리 만지기 동작 감지
    const isHandNearHead = (fingers) => {
      return fingers.some(finger =>
        ears.some(landmark => calculateDistance(finger, landmark) < HEAD_TOUCH_THRESHOLD)
      );
    };

    const isTouchingHead = isHandNearHead(leftHandFingers) || isHandNearHead(rightHandFingers);      
  
    detectAction(buffers.current.touchingHeadBuffer, 'touchingHead', isTouchingHead);
  };  

 // 목 만지기 동작 인식
const checkTouchingNeck = (landmarks) => {
  const getLandmark = (name) => landmarks.find(l => l.name === name);

  const leftShoulder = getLandmark("Left Shoulder");
  const rightShoulder = getLandmark("Right Shoulder");

  const nose = getLandmark("Nose");
  const mouthLeft = getLandmark("Mouth Left");
  const mouthRight = getLandmark("Mouth Right");
  const mouth = {
    x: (mouthLeft.x + mouthRight.x) / 2,
    y: (mouthLeft.y + mouthRight.y) / 2,
    z: (mouthLeft.z + mouthRight.z) / 2
  };

  const leftPinky = getLandmark("Left Pinky");
  const leftThumb = getLandmark("Left Thumb");
  const rightPinky = getLandmark("Right Pinky");
  const rightThumb = getLandmark("Right Thumb");

  const leftFinger = {
    x: (leftPinky.x + leftThumb.x) / 2,
    y: (leftPinky.y + leftThumb.y) / 2,
    z: (leftPinky.z + leftThumb.z) / 2
  };

  const rightFinger = {
    x: (rightPinky.x + rightThumb.x) / 2,
    y: (rightPinky.y + rightThumb.y) / 2,
    z: (rightPinky.z + rightThumb.z) / 2
  };

  // 목의 상하 경계 설정
  const neckBottomY = ((leftShoulder.y + rightShoulder.y) / 2) + 0.05;  // 목 하단 경계
  const mouthToNoseDistanceY = Math.abs(mouth.y - nose.y);
  const neckTopY = mouth.y + 1.8 * mouthToNoseDistanceY; // 목 상단 경계

  // 목의 좌우 및 측면 경계 설정
  const neckCenterX = (leftShoulder.x + rightShoulder.x) / 2;
  const neckLeftX = leftShoulder.x + 0.1;  // 목 왼쪽 경계를 어깨 바깥쪽으로 확장
  const neckRightX = rightShoulder.x - 0.1; // 목 오른쪽 경계를 어깨 바깥쪽으로 확장

  // 손가락이 목 앞, 옆 범위 내에 있는지 확인
  const isFingerInNeckRange = (finger) => (
    finger.y >= neckTopY && finger.y <= neckBottomY &&
    finger.x <= neckLeftX && finger.x >= neckRightX
  );

  const isTouchingNeck = isFingerInNeckRange(leftFinger) || isFingerInNeckRange(rightFinger);

  detectAction(buffers.current.touchingNeckBuffer, 'touchingNeck', isTouchingNeck, 0.4);
};


  // 얼굴 만지기 동작 인식
  const checkTouchingFace = (landmarks) => {

    const getLandmark = (name) => landmarks.find(l => l.name === name);

    // 손가락 랜드마크
    const leftIndex = getLandmark("Left Index");
    const rightIndex = getLandmark("Right Index");

    // 얼굴 랜드마크 배열
    const faceLandmarks = [ "Nose", "Mouth Left", "Mouth Right" ].map(getLandmark);

    // 얼굴 <-> 손가락 거리 기준
    const FACE_TOUCH_THRESHOLD = 0.3

    // 얼굴 만지기 동작 감지
    const isHandInFaceRange = (finger) => {
      return faceLandmarks.some((faceLandmark) => {
        return calculateDistance(finger, faceLandmark) <= FACE_TOUCH_THRESHOLD;
      });
    };    

    const isFaceTouching = isHandInFaceRange(leftIndex) || isHandInFaceRange(rightIndex);

    detectAction(buffers.current.touchingFaceBuffer, 'touchingFace', isFaceTouching);
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
          if (!poseLandmarker) {
            //console.log(">> PoseLandmarker: false or isRecording: false, skipping detection"); 
            return;
          }

          const startTimeMs = performance.now();
          poseLandmarker.detectForVideo(video, startTimeMs, (result) => {
            canvasCtx.save();
            canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

            if (result.landmarks && result.landmarks.length > 0) {

              //console.log('>> Landmarks Detected');

              // landmarks 배열의 값들을 landmarkNames와 매핑
              const landmarks = result.landmarks[0].map((landmark, index) => ({
                ...landmark,
                name: landmarkNames[index]
              }));

              // 동작 인식
              checkTouchingHead(landmarks);
              checkTouchingNeck(landmarks);
              checkTouchingFace(landmarks);

              // 관절 위치 그리기
              drawingUtils.drawLandmarks(landmarks, {
                radius: (data) => {
                  const radius = lerp(data.from.z, -0.15, 0.1, 3, 0.5);
                  return radius < 0 ? 0.5 : radius;
                },
              });
              drawingUtils.drawConnectors(landmarks, PoseLandmarker.POSE_CONNECTIONS);
            } else {
              //console.log('No landmarks detected');
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
  }, [poseLandmarker, lerp, isRecording]);

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
      //console.log('PoseLandmarker created');
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

export default MotionTest1; 