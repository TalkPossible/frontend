import { API_BASE_URL } from "../api/apiConfig.js";

// 백엔드 호출
export function call(api, method, request) {
  let headers = new Headers({
    "Content-Type": "application/json",
  });

  const accessToken = process.env.REACT_APP_ACC_TOKEN;
  if (accessToken && accessToken !== null) {
    headers.append("Authorization", "Bearer " + accessToken);
    console.log(Object.fromEntries(headers.entries())); // 헤더 내용을 객체로 변환하여 콘솔에 출력
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

// gpt api 호출
export function gptAPI (message, cacheId) {
  const data = {message, cacheId};
  // console.log("gptAPI에 보낼 data 생김새 : ", data);
  const rmvServer = (str) => {
    return str.replace("서버: ", "");
  };

  return call("/api/v1/chatGPT/remember", "POST", data).then((response) => {
    const newCacheId = response.cacheId;
    const newContent = rmvServer(response.choices[0].message.content);
    const newResponse = {newCacheId, newContent};
    return newResponse;
  })
  .catch((error) => {
    console.log('Error calling GPT API: ', error);
  });
};