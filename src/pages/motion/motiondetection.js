import React, { useEffect, useRef, useState, useCallback } from 'react';
import { PoseLandmarker, FilesetResolver, DrawingUtils } from 'https://cdn.skypack.dev/@mediapipe/tasks-vision@0.10.0';
import { m } from 'framer-motion';

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
        }
      }
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
