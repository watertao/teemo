const SESSION_STORAGE_TOKEN_KEY = 'auth_token';
const REQ_HEADER_TOKEN_KEY = 'X-Auth-Token';

export function storeToken(token) {
  sessionStorage.setItem(SESSION_STORAGE_TOKEN_KEY, token);
}

export function appendTokenToRequest(option) {
  let newOptions = {headers: [], ...option};
  if (sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY)) {
    newOptions.headers[REQ_HEADER_TOKEN_KEY] = sessionStorage.getItem(SESSION_STORAGE_TOKEN_KEY);
  }
  return newOptions;
}
