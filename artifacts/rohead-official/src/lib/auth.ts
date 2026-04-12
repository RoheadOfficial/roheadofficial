export function getToken() {
  return localStorage.getItem("rohead_token");
}

export function setToken(token: string) {
  localStorage.setItem("rohead_token", token);
}

export function removeToken() {
  localStorage.removeItem("rohead_token");
}

export function getAuthHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}
