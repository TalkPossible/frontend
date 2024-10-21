import { API_BASE_URL } from "../api/apiConfig.js";

// 백엔드 호출
async function call(api, method, request) {
  const Authorization = localStorage.getItem('accessToken');

  let headers = new Headers({
    "Content-Type": "application/json",
  });

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

  try {
    const response = await fetch(options.url, options);

    if (response.status === 200) {
      return await response.json();
    } else if (response.status === 403) {
      window.location.href = "/login"; // redirection
    } else {
      throw new Error(`HTTP Error: ${response.status}`);
    }
  } catch (error) {
    alert("오류 발생");
    console.error("HTTP error:", error);
    throw error; // Optional: rethrow the error if you want it to propagate
  }
}

const rmvServer = (str) => {
  return str.replace("서버: ", "");
};

// gpt api 호출
async function gptAPI(message, cacheId, situationNum) {

  let a;

  switch (situationNum) {
    case 1 : // restaurant
      a = "restaurant";
      break;
    case 4 : // library
      a = "library";
      break;
    case 5:
      a = "reservation";
      break;
    case 6:
      a = "hairsalon";
      break;

    default:
      throw new Error("Invalid situation number");
  }

  let headers = new Headers({
    "simulationId": localStorage.getItem('simulationId'),
    "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
    "Content-Type": "application/json",
  });

  let body = JSON.stringify({
    "message": message,
    "cacheId": cacheId,
  });

  let options = {
    method: 'POST',
    headers,
    body
  };

  try {
    const response = await fetch(API_BASE_URL + `/api/v1/chatGPT/${a}`, options);

    if (response.status === 200) {
      const responseData = await response.json();

      // 새로운 캐시 ID와 서버 응답 처리
      const newCacheId = responseData.cacheId;
      const newContent = rmvServer(responseData.choices[0].message.content);
      const newResponse = { newCacheId, newContent };

      return newResponse;
    } else if (response.status === 403) {
      window.location.href = "/login";
    } else {
      throw new Error(`[gptAPI] status: ${response.status}`);
    }
  } catch (error) {
    alert("오류 발생");
    console.error("[gptAPI]", error);
    throw error; // 오류를 다시 던져서 호출한 곳에서도 처리할 수 있게 함
  }
}

// 사용자 대화 내용 저장 api 호출
async function sendNameAPI(fileName, retryCount = 3, delay = 1000) {
  let simulationId = localStorage.getItem('simulationId');

  const makeRequest = async () => {
    try {
      let headers = new Headers({
        "patientId": localStorage.getItem('patientId'),
        "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
        "Content-Type": "application/json",
      });

      let body = JSON.stringify({
        "vName": fileName
      });

      let options = {
        method: 'POST',
        headers,
        body
      };

      const response = await fetch(API_BASE_URL + `/api/v1/simulations/${simulationId}`, options);

      if (response.status === 200) {
        // console.log("sendNameAPI : ", fileName);
        return;
      } else if (response.status === 403) {
        window.location.href = "/login";
        return;
      } else {
        throw new Error(`[sendNameAPI] status: ${response.status}`);
      }
    } catch (error) {
      if (retryCount > 0) {
        console.warn(`Retrying... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay)); // Delay before retry
        await makeRequest(); // Retry the request
      } else {
        alert("오류 발생");
        console.error("[sendNameAPI]", error);
      }
    }
  };

  await makeRequest();
}


// 오디오 파일명 리스트 보내기 api 호출 (발화속도 측정을 위함)
async function sendAudioFileNameListAPI(nameList, retryCount = 3, delay = 1000) {
  let simulationId = localStorage.getItem('simulationId');

  const makeRequest = async () => {
    try {
      let headers = new Headers({
        "simulationId": simulationId,
        "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
        "Content-Type": "application/json",
      });

      let body = JSON.stringify({
        "audioFileNameList": nameList,
      });

      let options = {
        method: 'POST',
        headers,
        body
      };

      const response = await fetch(API_BASE_URL + `/api/v1/simulations/${simulationId}/speech-rate`, options);

      if (response.status === 200) {
        // console.log("[sendAudioFileNameListAPI] 오디오 파일명 리스트 보내기 성공");
        return;
      } else if (response.status === 403) {
        window.location.href = "/login";
        return;
      } else {
        throw new Error(`[sendAudioFileNameListAPI] status: ${response.status}`);
      }
    } catch (error) {
      if (retryCount > 0) {
        console.warn(`Retrying... (${retryCount} attempts left)`);
        await new Promise(resolve => setTimeout(resolve, delay)); // Delay before retry
        await makeRequest(); // Retry the request
      } else {
        alert("오류 발생");
        console.error("[sendAudioFileNameListAPI]", error);
      }
    }
  };

  await makeRequest();
}

// 환자 등록 api 호출
async function enrollPatient(name, birthday, gender, phoneNum) {
  let headers = new Headers({
    "Authorization": `Bearer ${localStorage.getItem('accessToken')}`,
    "Content-Type": "application/json",
  });

  const makeRequest = async () => {
    try {
      let body = JSON.stringify({
        "name": name, 
        "birthday": birthday, 
        "gender": gender, 
        "phoneNum": phoneNum, 
      });

      let options = {
        method: 'POST',
        headers,
        body
      };

      const response = await fetch(API_BASE_URL + `/api/v1/patients`, options);

      if (response.status === 200) {
        return;
      } else if (response.status === 403) {
        window.location.href = "/login";
        return;
      } else {
        throw new Error(`[enrollPatientAPI] status: ${response.status}`);
      }
    } catch (error) {
      alert("오류 발생");
      console.error("[enrollPatientAPI]", error);
    }
  };

  await makeRequest();
}


export {call, gptAPI, sendNameAPI, sendAudioFileNameListAPI, enrollPatient};