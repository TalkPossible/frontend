// tts api 호출 
export function ttsAPI(content, setUserMicDis) {
  const ttsKey = process.env.REACT_APP_TTS_API_KEY;

  var data = {    
    "voice":{
      "languageCode":"ko-KR",
      'name':'ko-KR-Neural2-C',
      'ssmlGender':'MALE'
    },
    "input":{
      "text": content
    },
    "audioConfig":{
      "audioEncoding":"mp3"
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
    var audioFile = new Audio();
    let audioBlob = base64ToBlob(res.audioContent, "mp3");
    audioFile.src = window.URL.createObjectURL(audioBlob);
    audioFile.playbackRate = 1; //재생속도
    audioFile.addEventListener('ended', () => { // 음성이 끝난 후 이벤트 리스너 추가
      setUserMicDis(false); // 사용자 마이크 활성화 
    });

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