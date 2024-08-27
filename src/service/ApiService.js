import { API_BASE_URL } from "../api/apiConfig.js";

// 백엔드 호출
export function call(api, method, request) {
  let headers = new Headers({
    "Content-Type": "application/json",
  });

  const Authorization = localStorage.getItem('accessToken');
  if (Authorization && Authorization !== null) {
    headers.append("Authorization", "Bearer " + Authorization);
  }

  let options = {
    headers,
    url: API_BASE_URL + api,
    method: method,
  };
  if (request) {
    options.body = JSON.stringify(request);
  }

  return fetch(options.url, options).then((response) => {
    if(response.status === 200) {
      return response.json();
    } else if(response.status === 401 || 403){
      window.location.href = "/login"; // redirection
    } else {
      Promise.reject(response);
      throw Error(response);
    }
  }).catch((error) => {
    console.log("http error");
    console.log(error);
  });
}

const rmvServer = (str) => {
  return str.replace("서버: ", "");
};

// gpt api 호출
export function gptAPI (message, cacheId) {
  let headers = new Headers({
    "simulationId": localStorage.getItem('simulationId'),
    "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
    "Content-Type": "application/json",
  });

  let body = JSON.stringify({
    "message": message,
    "cacheId": cacheId,
  })

  let options = {
    url: API_BASE_URL + "/api/v1/chatGPT/remember",
    headers,
    method: 'POST',
    body
  };

  return fetch(options.url, options).then((response) => {
    if(response.status === 200) {
      return response.json();
    } else if(response.status === 401 || 403){
      window.location.href = "/login";
    } else {
      Promise.reject(response);
      throw Error(response);
    }
  }).catch((error) => {
    console.log("[http error]", error);
  }).then((response) => {
    const newCacheId = response.cacheId;
    const newContent = rmvServer(response.choices[0].message.content);
    const newResponse = {newCacheId, newContent};
    return newResponse;
  })
  .catch((error) => {
    console.log('[Error calling GPT API]', error);
  });
};

// 사용자 대화 내용 저장 api 호출
export function saveUserMessageAPI (content) {
  let simulationId = localStorage.getItem('simulationId');

  let headers = new Headers({
    "patientId": localStorage.getItem('patientId'),
    "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
    "Content-Type": "application/json",
  });

  let body = JSON.stringify({
    "content": content,
  })

  let options = {
    url: API_BASE_URL + `/api/v1/simulations/${simulationId}`,
    headers,
    method: 'POST',
    body
  };

  return fetch(options.url, options).then((response) => {
    if(response.status === 200) {
      console.log("userMessageSaveAPI : ", content);
      return ;
    } else if(response.status === 401 || 403){
      window.location.href = "/login";
    } else {
      Promise.reject(response);
      throw Error(response);
    }
  }).catch((error) => {
    console.log("[http error]", error);
  });
}

// 오디오 파일명 리스트 보내기 api 호출
export function sendAudioFileNameListAPI (nameList) {
  let simulationId = localStorage.getItem('simulationId');

  let headers = new Headers({
    "simulationId": simulationId,
    "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
    "Content-Type": "application/json",
  });

  let body = JSON.stringify({
    "audioFileNameList": nameList,
  })

  let options = {
    url: API_BASE_URL + `/simulations/${simulationId}/speech-rate`,
    headers,
    method: 'POST',
    body
  };

  return fetch(options.url, options).then((response) => {
    if(response.status === 200) {
      console.log("[sendAudioFileNameListAPI] 오디오 파일명 리스트 보내기 성공");
      return ;
    } else if(response.status === 401 || 403){
      window.location.href = "/login";
    } else {
      Promise.reject(response);
      throw Error(response);
    }
  }).catch((error) => {
    console.log("[http error]", error);
  });
}