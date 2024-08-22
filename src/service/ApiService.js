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
    } else if(response.status === 403){
      window.location.href = "/signin"; // redirection
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
  let url = API_BASE_URL + "/api/v1/chatGPT/remember"

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

  console.log(options)

  return fetch(options.url, options).then((response) => {
    if(response.status === 200) {
      return response.json();
    } else if(response.status === 403){
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