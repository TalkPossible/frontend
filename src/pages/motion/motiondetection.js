import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FaceLandmarker, FilesetResolver, DrawingUtils } from 'https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0';


const MotionDetection = ({ isRecording }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [poseLandmarker, setPoseLandmarker] = useState(null);
  const [faceLandmarker, setFaceLandmarker] = useState(null);
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

  const faveOvalIndexList = [
    10, 21, 54, 58, 67, 93, 103, 109, 127, 132,
    136, 148, 149, 150, 152, 162, 172, 176, 234, 251,
    284, 288, 297, 323, 332, 338, 356, 361, 365, 377, 
    378, 379, 389, 397, 400, 454
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

  const calculateDistanceBrief = (landmark1, landmark2) => {
    return Math.sqrt(
      Math.pow(landmark1.x - landmark2.x, 2) +
      Math.pow(landmark1.y - landmark2.y, 2)
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
    if (buffer.length > 15) {
      buffer.shift(); // 최근 15개의 값 유지
    }
    return buffer.reduce((a, b) => a + b, 0) / buffer.length;
  };

  // 동작 판단 로직 (공통)
  // -> 특정 동작이 3초이상 감지되면 세션 스토리지에 동작 감지 내역 저장 => 2초로 수정
  const detectAction = (buffer, actionType, isActionDetected, threshold = 0.4, duration = 2) => {
    const averageBufferedStatus = updateBuffer(buffer, isActionDetected);

    if (averageBufferedStatus > threshold) {
      if (!actionStartTimes.current[actionType]) {
        actionStartTimes.current[actionType] = Date.now();
        //console.log(`[${actionType}] 동작이 처음 감지됨! actionStartTime:`, actionStartTimes.current[actionType]);
      } else {
        const actionTime = calculateActionTime(actionStartTimes.current[actionType]);
        //console.log(`[${actionType}] 동작이 연속적으로 감지됨! actionTime:`, actionTime);
  
        if (actionTime >= duration) {
          console.log(`[${actionType}] 동작이 ${duration}초 이상 지속됨! actionTime:`, actionTime);
          const formattedTime = formatElapsedTime(calculateElapsedTime());
          const motionName = actionTypeToName[actionType];
          saveToStorage(motionName, formattedTime);
          actionStartTimes.current[actionType] = null;
        }
      }
    } else {
      //actionStartTimes.current[actionType] = null;
        if (actionStartTimes.current[actionType]) {
          const actionTime = calculateActionTime(actionStartTimes.current[actionType]);

          if (actionTime < duration && averageBufferedStatus < threshold / 2) {
            const timeSinceLastDetection = Date.now() - actionStartTimes.current[actionType];

            // 감지 실패가 일정 시간 이상 지속되면 초기화
            if (timeSinceLastDetection > 1000) { // 1초
              actionStartTimes.current[actionType] = null;
              //console.log(`[${actionType}] 동작이 중단됨: 초기화됨`);
            }
          }
        }
    }
  };

  // 머리 만지기 동작 인식
  const checkTouchingHead = (landmarks, faceOval) => {

    const getLandmark = (name) => landmarks.find(l => l.name === name);

    // 손가락 랜드마크 배열
    const leftHandFingers = ["Left Pinky", "Left Index", "Left Thumb"].map(getLandmark);
    const rightHandFingers = ["Right Pinky", "Right Index", "Right Thumb"].map(getLandmark);
    
    // 귀 랜드마크
    const leftEar = getLandmark("Left Ear");
    const rightEar = getLandmark("Right Ear");
    const earHeight = Math.min(leftEar.y, rightEar.y);

    // 귀 랜드마크
    const nose = getLandmark("Nose");

    // 손 <-> 얼굴 윤곽선 거리
    const HEAD_TOUCH_THRESHOLD = 0.5;

    // 1-1. 손이 얼굴 윤곽선 외부에 있는지 확인
    const isFingerOutFaceOval = (finger) => {
      if (!finger || !faceOval) {
        return false;
      }
      return !isPointInsideOrOnPolygon({ x: finger.x, y: finger.y }, faceOval);
    };

    // 2. 손이 얼굴 윤곽선과 일정 거리 이내에 있는지 확인
    const isWithinThreshold = (finger) => {
      return faceOval.some(boundaryPoint => calculateDistanceBrief(finger, boundaryPoint) < HEAD_TOUCH_THRESHOLD);
    };

    // 3. 손이 귀보다 위에 있는지 확인
    const isAboveEars = (finger) => {
      return finger.y < earHeight;
    };

    // 4. 머리 뒤쪽을 만지는지 확인
    const isTouchingBackOfHead = (finger) => {
      if (!finger || !faceOval) {
        return false;
      }
      const inFingerInsideFaceOval = isPointInsideOrOnPolygon({ x: finger.x, y: finger.y }, faceOval);
      const isHandBackOfHead = finger.z > nose.z + 0.05;
      if(inFingerInsideFaceOval && isHandBackOfHead){
        return true;
      }
      return false;
    };

    // 머리 만지기 동작 감지
    const isHandNearHead = (fingers) => {
      return fingers.some(finger => {
        return (isFingerOutFaceOval(finger) && isWithinThreshold(finger) && isAboveEars(finger))
          || (isTouchingBackOfHead(finger)  && isWithinThreshold(finger) && isAboveEars(finger));
      });
    };

    const isTouchingHead = isHandNearHead(leftHandFingers) || isHandNearHead(rightHandFingers);      
  
    detectAction(buffers.current.touchingHeadBuffer, 'touchingHead', isTouchingHead, 0.4);
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
  const checkTouchingFace = (landmarks, faceOval) => {

    // 손가락 랜드마크
    const getLandmark = (name) => landmarks.find(l => l.name === name);
    const leftIndex = getLandmark("Left Index");
    const rightIndex = getLandmark("Right Index");

    // 코 랜드마크
    const nose = getLandmark("Nose");

    // 얼굴 윤곽선 내부에 손가락 좌표가 있는지 확인
    const isFingerInFaceOval = (finger) => {
      if (!finger || !faceOval) {
        return false;
      }

      // 얼굴 윤곽선 내부에 있는지 확인
      const isInsideFaceOval = isPointInsideOrOnPolygon({ x: finger.x, y: finger.y }, faceOval);
      
      // z값 확인
      const isInFrontOfFace = finger.z < nose.z + 0.1;

      return isInsideFaceOval && isInFrontOfFace;
    };

    // 얼굴 만지기 동작 감지
    const isFaceTouching = isFingerInFaceOval(leftIndex) || isFingerInFaceOval(rightIndex);

    detectAction(buffers.current.touchingFaceBuffer, 'touchingFace', isFaceTouching);
  };

  // 다각형 내부 또는 경계에 점이 있는지 확인
  const isPointInsideOrOnPolygon = (point, polygon) => {
    // 1. 점이 다각형 내부에 있는지 확인
    if (isPointInsidePolygon(point, polygon)) {
      return true;
    }

    // 2. 점이 다각형의 변에 위치하는지 확인
    // const distanceThreshold = 0.01; //경계에서의 허용 거리
    // for (let i = 0; i < polygon.length; i++) {
    //   const j = (i + 1) % polygon.length;
    //   if (distanceToSegment(point, polygon[i], polygon[j]) < distanceThreshold) {
    //     return true; //경계에 위치
    //   }
    // }

    return false;
  };

  // 다각형 내부에 점이 있는지 확인
  const isPointInsidePolygon = (point, polygon) => {
    let isInside = false;
    let i = 0, j = polygon.length - 1;

    // Ray-casting 알고리즘: 점에서 다각형의 모서리를 향해 레이를 쏴서 교차점의 수 세기
    for (i, j; i < polygon.length; j = i++) {
      if (
        (polygon[i].y > point.y) !== (polygon[j].y > point.y) &&
        point.x < ((polygon[j].x - polygon[i].x) * (point.y - polygon[i].y)) / (polygon[j].y - polygon[i].y) + polygon[i].x
      ) {
        isInside = !isInside;
      }
    }

    return isInside;
  };

  // 점이 경계에 있는지 확인 (점과 선분 사이의 거리 계산)
  const distanceToSegment = (point, vertex1, vertex2) => {
    const x = point.x;
    const y = point.y;
    const x1 = vertex1.x;
    const y1 = vertex1.y;
    const x2 = vertex2.x;
    const y2 = vertex2.y;

    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const len_sq = C * C + D * D;
    let param = -1;

    if (len_sq !== 0) {
      param = dot / len_sq;
    }

    let xx, yy;

    if (param < 0) {
      xx = x1;  
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  useEffect(() => {
    const predictWebcam = async () => {
      if (poseLandmarker && faceLandmarker && videoRef.current && canvasRef.current) {
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

        let landmarks = null;

        const detect = async () => {
          // if (!poseLandmarker || !faceLandmarker) {
          //   return;
          // }

          const startTimeMs = performance.now();

          // PoseLandmarker 감지 및 그리기
          const poseResult = await poseLandmarker.detectForVideo(video, startTimeMs);
          //console.log('### Pose Result:', poseResult);

          canvasCtx.save();
          canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);

          if (poseResult.landmarks && poseResult.landmarks.length > 0) {
            const poseLandmarks = poseResult.landmarks[0];

            // PoseLandmarker에서 감지된 landmarks 배열을 landmarkNames와 매핑
            landmarks = poseLandmarks.map((landmark, index) => ({
              ...landmark,
              name: landmarkNames[index]
            }));

            // 동작 인식
            checkTouchingNeck(landmarks);

            //drawingUtils.drawConnectors(poseLandmarks, PoseLandmarker.POSE_CONNECTIONS);
          }

          canvasCtx.restore();

          // FaceLandmarker 감지 및 그리기
          const faceResult = await faceLandmarker.detectForVideo(video, startTimeMs);
          //console.log('### Face Result:', faceResult);

          let faceOval = null;

          if (faceResult.faceLandmarks && faceResult.faceLandmarks.length > 0) {
            const faceLandmarks = faceResult.faceLandmarks[0];

            // 얼굴 윤곽선 좌표들 추출
            const faceOvalLandmarks = faveOvalIndexList.map(index => faceLandmarks[index]);

            // 얼굴 윤곽선 좌표들을 사용하여 다각형 경계 생성
            faceOval = faceOvalLandmarks.map(landmark => ({
              x: landmark.x,
              y: landmark.y,
            }));
            //console.log('### faceOval 좌표:', faceOval);

            // 얼굴만지기 동작인식
            if (landmarks && landmarks.length > 0) {
              checkTouchingFace(landmarks, faceOval);
              checkTouchingHead(landmarks, faceOval);
            } else {
              console.error('Landmarks are not available for face detection');
            }
            
            // 윤곽선 그리기
            // drawingUtils.drawLandmarks(faceLandmarks, { radius: 2 });
            // drawingUtils.drawConnectors(
            //   faceLandmarks,
            //   FaceLandmarker.FACE_LANDMARKS_FACE_OVAL,
            // );
          }

          window.requestAnimationFrame(detect);
        };

        detect();
      } else {
        console.log('PoseLandmarker or FaceLandmarker or videoRef or canvasRef is not ready');
      }
    };

    if (poseLandmarker && faceLandmarker && videoRef.current) { 
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
  }, [poseLandmarker, faceLandmarker, lerp]);

  useEffect(() => {

    const createPoseLandmarker = async () => {

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm'
      );

      // PoseLandmarker 초기화
      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1,
      });
      //console.log('PoseLandmarker created');

      // FaceLandmarker 초기화
      const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
          delegate: 'GPU',
        },
        runningMode: 'VIDEO',
        numPoses: 1
      });

      setPoseLandmarker(poseLandmarker);
      setFaceLandmarker(faceLandmarker);
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