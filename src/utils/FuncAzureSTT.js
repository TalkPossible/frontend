import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const sttKeyAzure = process.env.REACT_APP_AZURE_STT_API_KEY;
const regionAzure = process.env.REACT_APP_AZURE_REGION;

let recognizerRef = null;  // useRef 대체

const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(sttKeyAzure, regionAzure);
speechConfig.speechRecognitionLanguage = 'ko-KR';
const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

// ==============================================================================

const startRecording = (onResult, onError) => {
  if (recognizerRef) return; // 이미 녹음 중이면 무시

  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  recognizerRef = recognizer;

  recognizer.recognized = (s, e) => {
    if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
      console.log(`RECOGNIZED Text => ${e.result.text}`);
      onResult(e.result.text);
    }
  };

  // recognizer.canceled = (s, e) => {
  //   stopRecording(); // 음성 인식을 취소, 오류 발생 경우 stopRecording을 호출.
  // };

  recognizer.sessionStopped = (s, e) => {
    stopRecording(); // 음성 인식 세션이 정상적으로 종료되었을 때 stopRecording을 호출.
  };

  recognizer.startContinuousRecognitionAsync();
};

const stopRecording = () => {
  return new Promise((resolve, reject) => {
      if (recognizerRef) {
        recognizerRef.stopContinuousRecognitionAsync(
          () => {
            recognizerRef = null; // 인식이 중지되면 참조를 지움.
            resolve();  // 작업 완료 시 resolve 호출
          },
          (err) => {
            console.error('Error stopping recognition:', err);
            recognizerRef = null; // 오류 발생 시에도 참조를 지움.
            // reject(err);  // 오류 발생 시 reject 호출
          }
        );
      } else {
        resolve();  // recognizerRef가 없는 경우에도 성공 처리
      }
  });
};

export {startRecording, stopRecording};