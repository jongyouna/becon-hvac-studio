// 데모용 클라이언트 사이드 인증 모듈입니다. 실제 서버/DB 없이 브라우저 localStorage에만
// 데이터를 저장하는 목업이며, 실제 서비스의 보안 요구사항을 충족하지 않습니다.
const AUTH_USERS_KEY = "ts_users";
const AUTH_SESSION_KEY = "ts_session";

function getUsers() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_USERS_KEY)) || [];
  } catch {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(AUTH_USERS_KEY, JSON.stringify(users));
}

function findUserByAccount(account) {
  return getUsers().find((u) => u.account === account);
}

function addUser(user) {
  const users = getUsers();
  users.push(user);
  saveUsers(users);
}

function updateUserPassword(account, newPassword) {
  const users = getUsers();
  const user = users.find((u) => u.account === account);
  if (!user) return false;
  user.password = newPassword;
  saveUsers(users);
  return true;
}

function setSession(account) {
  localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ account, loggedInAt: Date.now() }));
}

function getSession() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_SESSION_KEY));
  } catch {
    return null;
  }
}

function clearSession() {
  localStorage.removeItem(AUTH_SESSION_KEY);
}

function requireAuth(redirectTo) {
  if (!getSession()) {
    window.location.href = redirectTo;
  }
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}
