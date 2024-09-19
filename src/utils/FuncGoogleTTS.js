// tts api 호출 
var audioFile = new Audio();
let handleAudioEnded;

function ttsStop() {
  audioFile.pause();

  // 오디오 URL 리소스 해제
  if (audioFile.src) {
    window.URL.revokeObjectURL(audioFile.src);
    audioFile.src = '';  // 오디오 소스 초기화
  }

  // 등록된 handleAudioEnded 리스너 해제
  if (handleAudioEnded) {
    audioFile.removeEventListener('ended', handleAudioEnded);
    handleAudioEnded = null; // 해제 후 null로 설정
  }
}

function ttsAPI(content, setUserMicDis) {
  const ttsKey = process.env.REACT_APP_TTS_API_KEY;

  var data = {    
    "voice":{
      "languageCode":"ko-KR",
      'name':'ko-KR-Neural2-A',
      'ssmlGender':'FEMALE'
    },
    "input":{
      "text": content
    },
    "audioConfig":{
      "audioEncoding":"MP3"
    }
  };

  let options = {
    url: "https://texttospeech.googleapis.com/v1/text:synthesize?key=" + ttsKey,
    headers: new Headers({'Content-Type': 'application/json; charset=UTF-8'}),
    method: 'POST',
    body: JSON.stringify(data)
  }

  return fetch(options.url, options).then((response) => {
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    return response.json();
  })
  .then(res => {
    let audioBlob = base64ToBlob(res.audioContent, "mp3");
    audioFile.src = window.URL.createObjectURL(audioBlob);
    audioFile.playbackRate = 1; //재생속도

    // 음성이 끝난 후 이벤트 리스너 추가 - 클로저로 setUserMicDis 전달
    handleAudioEnded = () => {
      setUserMicDis(false);  // 음성이 끝나면 마이크 활성화
    };

    // 중복 리스너 방지를 위해 이전 리스너가 있으면 제거
    audioFile.removeEventListener('ended', handleAudioEnded);
    audioFile.addEventListener('ended', handleAudioEnded);

    audioFile.play();
  })
  .catch(error => {
    console.error('There was a problem with the fetch operation:', error);
    alert("오류", "음성 불러오기 오류가 발생하였습니다. 관리자에게 문의해주세요.");
  });
}

const base64ToBlob = (base64, fileType) => {
  let typeHeader = "data:application/" + fileType + ";base64,"; // base64 헤더 파일 유형 정의
  let audioSrc = typeHeader + base64; 
  let arr = audioSrc.split(",");
  let array = arr[0].match(/:(.*?);/);
  let mime = (array && array.length > 1 ? array[1] : fileType) || fileType;
  // url헤더 제거하고 btye로 변환
  let bytes = window.atob(arr[1]);
  // 예외를 처리하고 0보다 작은 ASCII 코드를 0보다 큰 값으로 변환
  let ab = new ArrayBuffer(bytes.length);
  // 뷰 생성(메모리에 직접): 8비트 부호 없는 정수, 길이 1바이트
  let ia = new Uint8Array(ab);
  for (let i = 0; i < bytes.length; i++) {
    ia[i] = bytes.charCodeAt(i);
  }
  return new Blob([ab], {
    type: mime
  });
}

export {ttsStop, ttsAPI};