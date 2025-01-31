import { BlobServiceClient } from '@azure/storage-blob';

const storageAccAzure = process.env.REACT_APP_AZURE_STORAGE_ACC;
const storageContainerNameAzure = process.env.REACT_APP_AZURE_STORAGE_CONTAINER_NAME;
const storageSasTokenAzure = process.env.REACT_APP_AZURE_STORAGE_SAS_TOKEN;

// ==============================================================================

const onRecAudio = async (setFileName, mediaRecorderRef, audioChunks) => {
  // 이전 녹음이 진행 중이라면 중지
  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
    mediaRecorderRef.current.stop();  // 기존 녹음을 중지
  }

  // 기존 audioChunks 비우기
  audioChunks.current = [];

  // 새로운 녹음 시작
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorderRef.current = new MediaRecorder(stream);

  mediaRecorderRef.current.ondataavailable = (event) => {
    audioChunks.current.push(event.data);
  };

  mediaRecorderRef.current.onstop = async () => {
    const blob = new Blob(audioChunks.current, { type: 'audio/webm' });
    const wavBlob = await convertBlobToWav(blob);
    const blobName = await onSubmitAudioFile(wavBlob);
    // console.log("blobName ", blobName);
    await setFileName(blobName);
    audioChunks.current = [];
  };

  mediaRecorderRef.current.start();
};

// ==============================================================================

const offRecAudio = async (mediaRecorderRef) => {
  if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
    await mediaRecorderRef.current.stop();

    // 미디어 스트림의 모든 트랙을 중지
    const stream = mediaRecorderRef.current.stream;
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
    
    // MediaRecorder 참조를 null로 설정
    mediaRecorderRef.current = null;
  }
};

// ==============================================================================

const onSubmitAudioFile = async (audioBlob) => {
  if (audioBlob) {
    const blobName = `${new Date().toISOString().replace(/[:.]/g, '_')}.wav`;

    const blobServiceClient = new BlobServiceClient(`https://${storageAccAzure}.blob.core.windows.net/?${storageSasTokenAzure}`);
    const containerClient = blobServiceClient.getContainerClient(storageContainerNameAzure);
    const blockBlobClient = containerClient.getBlockBlobClient(blobName);

    await blockBlobClient.uploadData(audioBlob, {
      blobHTTPHeaders: { blobContentType: "audio/wav" },
    });
    
    return blobName;
  }
};

// ==============================================================================

const convertBlobToWav = async (blob) => {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)({
    sampleRate: 16000,
  });
  const arrayBuffer = await blob.arrayBuffer();
  const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
  const numberOfChannels = audioBuffer.numberOfChannels;
  const length = audioBuffer.length * numberOfChannels * 2 + 44;
  const buffer = new ArrayBuffer(length);
  const view = new DataView(buffer);
  
  // WAV 파일 헤더 작성
  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + audioBuffer.length * numberOfChannels * 2, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numberOfChannels, true);
  view.setUint32(24, 16000, true);
  view.setUint32(28, 16000 * 2 * numberOfChannels, true);
  view.setUint16(32, numberOfChannels * 2, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, audioBuffer.length * numberOfChannels * 2, true);
  
  // PCM 샘플 작성
  const offset = 44;
  for (let i = 0; i < audioBuffer.length; i++) {
    for (let channel = 0; channel < numberOfChannels; channel++) {
      const sample = audioBuffer.getChannelData(channel)[i];
      const intSample = sample < 0 ? sample * 32768 : sample * 32767;
      view.setInt16(offset + (i * numberOfChannels + channel) * 2, intSample, true);
    }
  }
  return new Blob([buffer], { type: 'audio/wav' });
};

// ==============================================================================

const writeString = (view, offset, string) => {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
};

// ==============================================================================

export {onRecAudio, offRecAudio};