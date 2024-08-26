import { BlobServiceClient } from '@azure/storage-blob';

const storageAccAzure = process.env.REACT_APP_AZURE_STORAGE_ACC;
const storageContainerNameAzure = process.env.REACT_APP_AZURE_STORAGE_CONTAINER_NAME;
const storageSasTokenAzure = process.env.REACT_APP_AZURE_STORAGE_SAS_TOKEN;

export const onRecAudio = (setStream, setMedia, setOnRec, setSource, setAnalyser, setAudioUrl) => {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const analyser = audioCtx.createScriptProcessor(0, 1, 1);
  setAnalyser(analyser);

  function makeSound(stream) {
    const source = audioCtx.createMediaStreamSource(stream);
    setSource(source);
    source.connect(analyser);
    analyser.connect(audioCtx.destination);
  }

  navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
    const mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.addEventListener('dataavailable', (e) => {
      setAudioUrl(e.data);
    });

    mediaRecorder.start();
    setStream(stream);
    setMedia(mediaRecorder);
    makeSound(stream);

    analyser.onaudioprocess = function (e) {
      setOnRec(false);
    };
  }).catch((error) => {
    alert('마이크 사용 권한을 허용해야 녹음을 진행할 수 있습니다.');
  });
};

export const offRecAudio = (stream, media, analyser, source, setOnRec) => {
  stream.getAudioTracks().forEach(function (track) {
    track.stop();
  });

  media.stop();
  analyser.disconnect();
  source.disconnect();

  setOnRec(true);
};

export const onSubmitAudioFile = async (audioUrl) => {
  if (audioUrl) {
    const time = new Date().getTime();
    const fileName = "audioFile" + "_" + time;
    const sound = new File([audioUrl], `${fileName}.wav`, { lastModified: new Date().getTime() });
    const options = {
      blobHTTPHeaders: { blobContentType: "audio/wav" }
    };

    const account = storageAccAzure;
    const storageSasToken = storageSasTokenAzure;
    const containerName = storageContainerNameAzure;

    const blobServiceClient = new BlobServiceClient(`https://${account}.blob.core.windows.net/?${storageSasToken}`);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(sound.name);

    await blockBlobClient.uploadData(sound, options);

    return fileName;
  }
};