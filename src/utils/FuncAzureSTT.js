import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const sttKeyAzure = process.env.REACT_APP_AZURE_STT_API_KEY;
const regionAzure = process.env.REACT_APP_AZURE_REGION;

let recognizerRef = null;  // useRef 대체

const speechConfig = SpeechSDK.SpeechConfig.fromSubscription(sttKeyAzure, regionAzure);
speechConfig.speechRecognitionLanguage = 'ko-KR';

const audioConfig = SpeechSDK.AudioConfig.fromDefaultMicrophoneInput();

export const startRecording = (onResult, onError) => {
  if (recognizerRef) {
    return; // 이미 녹음 중이면 무시
  }

  const recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);
  recognizerRef = recognizer;

  recognizer.recognized = (s, e) => {
    if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
      console.log(`RECOGNIZED Text => ${e.result.text}`);
      onResult(e.result.text);
    } else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
      // console.log('NOMATCH: Speech could not be recognized.');
    }
  };

  recognizer.canceled = (s, e) => {
    stopRecording(); // 인식이 취소된 경우에도 stopRecording을 호출.
  };

  recognizer.sessionStopped = (s, e) => {
    stopRecording(); // 세션이 중지된 경우에도 stopRecording을 호출.
  };

  recognizer.startContinuousRecognitionAsync();
};

export const stopRecording = () => {
  if (recognizerRef) {
    recognizerRef.stopContinuousRecognitionAsync(
      () => {
        recognizerRef = null; // 인식이 중지되면 참조를 지움.
      },
      (err) => {
        console.error('Error stopping recognition:', err);
        recognizerRef = null; // 인식 중지 시 오류가 발생한 경우에도 참조를 지움.
      }
    );
  }
};
