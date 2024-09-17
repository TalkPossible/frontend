let backendHost;

const hostname = window && window.location && window.location.hostname;

if (hostname === "localhost") {
  backendHost = "https://talkpossible.site";
  //backendHost = "http://localhost:8080";
}

export const API_BASE_URL = `${backendHost}`;