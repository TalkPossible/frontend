let backendHost;

const hostname = window && window.location && window.location.hostname;

if (hostname === "localhost") {
  backendHost = "http://43.201.167.195";
}

export const API_BASE_URL = `${backendHost}`;