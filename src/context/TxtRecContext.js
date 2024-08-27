import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { startRecording, stopRecording } from '../utils/FuncAzureSTT.js';
import { onRecAudio, offRecAudio, onSubmitAudioFile } from '../utils/FuncRecordUpload.js';
import { gptAPI, saveUserMessageAPI } from '../service/ApiService.js';
import { ttsAPI, ttsStop } from '../utils/FuncGoogleTTS.js';

const TxtRecContext = createContext();

export const TxtRecProvider = ({ children }) => {
  // gpt와 대화하기 관련 상태변수
  const [cacheId, setCacheId] = useState(null); // gpt의 cacheId
  const [content, setContent] = useState(""); // gpt의 답변

  // gpt에게 대화내용 전달 및 사용자 한 텀 텍스트 뽑아낼 때
  const [userText, setUserText] = useState('');
  const [recording, setRecording] = useState(false);

  // 음성 녹음 및 녹음 파일을 업로드할 때
  const [fileNames, setFileNames] = useState([]);
  const [audioBlob, setAudioBlob] = useState(null);
  const mediaRecorderRef = useRef(null);
  const audioChunks = useRef([]);

  // 사용자 마이크 버튼 비활성화 관리
  const [userMicDis, setUserMicDis] = useState(true); // 마이크 비활성화 상태 

  const handleResult = useCallback((text) => {
    setUserText((prev) => prev + text);
  },[]);

  const handleStartRecording = () => {
    setRecording(true);
    setUserText('');

    onRecAudio(setAudioBlob, mediaRecorderRef, audioChunks); // 음성 녹음 시작
    startRecording(handleResult, console.error); // azure stt
  };

  const handleStopRecording = async () => {
    setRecording(false);
    setUserMicDis(true); // 사용자 마이크 비활성화

    stopRecording();  // 음성 녹음 중지
    offRecAudio(mediaRecorderRef); // 녹음 파일 azure storage에 업로드 및 파일 이름 list화 작업 

    try {
      if (userText !== "") { 
        await saveUserMessageAPI(userText); // 백엔드 api 호출 : 1. 사용자 텍스트 전송 호출
      } 
      const newRes = await gptAPI(userText, cacheId) // 백엔드 api 호출 : 2. gpt와 대화하기 호출
      setCacheId(newRes.newCacheId);
      setContent(newRes.newContent);
    } catch (error) {
      console.log('Error calling GPT API or TTS API: ', error);
    }
  };

  useEffect(() => {
    if (audioBlob) {
      onSubmitAudioFile(audioBlob).then(fileName => {
        setFileNames((prevFileNames) => [...prevFileNames, fileName]);
      })
    }
  }, [audioBlob]);
  
  useEffect(() => { // GPT의 content가 변경되면 ttsAPI 호출
    if (content !== "") {
      if (content !== "" && cacheId !== null) {
        console.log("content : ", content); 
        ttsAPI(content, setUserMicDis);
      };
    };
  }, [cacheId, content]);

  return (
    <TxtRecContext.Provider value={{ ttsStop, fileNames, setUserMicDis, userMicDis, 
      setCacheId, setContent, recording, handleStartRecording, handleStopRecording }}>
      {children}
    </TxtRecContext.Provider>
  );
};

export const useTxtRec = () => useContext(TxtRecContext);
