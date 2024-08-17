import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { startRecording, stopRecording } from '../utils/FuncAzureSTT.js';
import { onRecAudio, offRecAudio, onSubmitAudioFile } from '../utils/FuncRecordUpload.js';

const TxtRecContext = createContext();

export const TxtRecProvider = ({ children }) => {
  // gpt에게 대화내용 전달 및 사용자 한 텀 텍스트 뽑아낼 때
  const [fullScript, setFullScript] = useState('');
  const [userTermMessage, setUserTermMessage] = useState('');
  const [recording, setRecording] = useState(false);

  // 음성 녹음 및 녹음 파일을 업로드할 때
  const [stream, setStream] = useState();
  const [media, setMedia] = useState();
  const [onRec, setOnRec] = useState(true);
  const [source, setSource] = useState();
  const [analyser, setAnalyser] = useState();
  const [audioUrl, setAudioUrl] = useState();

  // 사용자 마이크 버튼 비활성화 관리
  const [userMicDis, setUserMicDis] = useState(true); // 마이크 비활성화 상태 

  const handleResult = useCallback((text) => {
    setFullScript((prev) => prev + text);
  },[]);

  const handleStartRecording = () => {
    setRecording(true);
    setFullScript('');
    onRecAudio(setStream, setMedia, setOnRec, setSource, setAnalyser, setAudioUrl);
    startRecording(handleResult, console.error);
  };

  const handleStopRecording = () => {
    setRecording(false);
    setUserMicDis(true); // 사용자 마이크 비활성화
    setUserTermMessage(fullScript);
    console.log("한 텀 말하기 종료 후 사용자 전체 텍스트 : ", fullScript); // 백 api 호출해서 텍스트 보낼 부분
    stopRecording();
    offRecAudio(stream, media, analyser, source, setOnRec);
  };

  useEffect(() => {
    if (audioUrl) {
      onSubmitAudioFile(audioUrl).then(fileName => {
        console.log('오디오 업로드 후 파일명 : ', fileName); // 백 api 호출해서 파일명 보낼 부분
      })
    }
  }, [audioUrl]);

  return (
    <TxtRecContext.Provider value={{ setUserMicDis, userMicDis, userTermMessage, recording, handleStartRecording, handleStopRecording }}>
      {children}
    </TxtRecContext.Provider>
  );
};

export const useTxtRec = () => useContext(TxtRecContext);
