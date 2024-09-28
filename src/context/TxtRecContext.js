import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import { startRecording, stopRecording } from '../utils/FuncAzureSTT.js';
import { onRecAudio, offRecAudio } from '../utils/FuncRecordUpload.js';
import { gptAPI, sendNameAPI } from '../service/ApiService.js';
import { ttsAPI, ttsStop } from '../utils/FuncGoogleTTS.js';

const TxtRecContext = createContext();

export const TxtRecProvider = ({ children }) => {
  const situationNum = parseInt(localStorage.getItem("situationId"));

  // gpt와 대화하기 관련 상태변수
  const [cacheId, setCacheId] = useState(null); // gpt의 cacheId
  const [content, setContent] = useState(""); // gpt의 답변

  // gpt에게 대화내용 전달 및 사용자 한 텀 텍스트 뽑아낼 때
  const [userText, setUserText] = useState('');
  const [recording, setRecording] = useState(false);

  // 음성 녹음 및 녹음 파일을 업로드할 때
  const [fileNameList, setFileNameList] = useState([]);
  const [fileName, setFileName] = useState(null);
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
    onRecAudio(setFileName, mediaRecorderRef, audioChunks); // 음성 녹음 시작
    startRecording(handleResult, console.error); // azure stt
  };

  const handleStopRecording = async () => {
    try {
      await stopRecording();  // 음성 인식 중지 

      // stt로 인식된 사용자의 말 text가 하나라도 있을 때 -> 다음 단계(gpt턴)로 넘어감
      if (userText && userText.length > 0) { 
        const newRes = await gptAPI(userText, cacheId, situationNum) // 백엔드 api 호출 : 1. gpt와 대화하기 호출
        setCacheId(newRes.newCacheId);
        setContent(newRes.newContent);
        setUserMicDis(true); // 사용자 마이크 비활성화
        await offRecAudio(mediaRecorderRef); // 녹음 파일 azure storage에 업로드 및 파일 이름 list화 작업
      }
    } catch (error) {
      console.log('handleStopRecording: ', error);
    }
    setRecording(false);
  };

  useEffect(() => {
    if (fileName && userText !== "") {
      setFileNameList((prevFileNameList) => [...prevFileNameList, fileName]);
      console.log("방금 음성 파일명: ", fileName);
      sendNameAPI(fileName); // 백엔드 (변경된) api 호출 : 2. 음성 파일명 전송 호출
    }
  }, [fileName]);
  
  useEffect(() => { // GPT의 content가 변경되면 ttsAPI 호출
    if (content !== "" && cacheId !== null) {
      console.log("content : ", content); 
      ttsAPI(content, setUserMicDis);
    };
  }, [cacheId, content]);

  return (
    <TxtRecContext.Provider value={{ ttsStop, fileNameList, setUserMicDis, userMicDis, 
      setCacheId, setContent, recording, handleStartRecording, handleStopRecording }}>
      {children}
    </TxtRecContext.Provider>
  );
};

export const useTxtRec = () => useContext(TxtRecContext);
