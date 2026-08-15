document.querySelectorAll(".tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((t) => t.classList.remove("tab--active"));
    document.querySelectorAll(".tab-panel").forEach((p) => p.classList.add("tab-panel--hidden"));
    tab.classList.add("tab--active");
    document.getElementById(`${tab.dataset.tab}-panel`).classList.remove("tab-panel--hidden");
  });
});

function maskAccount(account) {
  if (account.length <= 2) return account[0] + "*".repeat(account.length - 1);
  const visible = Math.ceil(account.length / 3);
  return account.slice(0, visible) + "*".repeat(account.length - visible);
}

document.getElementById("find-id-panel").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("find-id-name").value.trim();
  const resultEl = document.getElementById("find-id-result");

  if (!name) {
    showToast("이름을 입력해주세요.");
    return;
  }

  const user = getUsers().find((u) => u.name === name);
  resultEl.textContent = user
    ? `회원님의 계정은 ${maskAccount(user.account)} 입니다.`
    : "일치하는 계정이 없습니다.";
});

let verifiedAccount = null;

document.getElementById("find-password-panel").addEventListener("submit", (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById("find-pw-submit");
  const newPasswordField = document.getElementById("new-password-field");

  if (!verifiedAccount) {
    const account = document.getElementById("find-pw-account").value.trim();
    const name = document.getElementById("find-pw-name").value.trim();
    const user = findUserByAccount(account);

    if (!user || user.name !== name) {
      showToast("일치하는 계정 정보를 찾을 수 없습니다.");
      return;
    }

    verifiedAccount = account;
    newPasswordField.hidden = false;
    submitBtn.textContent = "비밀번호 변경";
    showToast("본인 확인이 완료되었습니다. 새 비밀번호를 입력해주세요.");
    return;
  }

  const newPassword = document.getElementById("new-password").value;
  if (!newPassword) {
    showToast("새 비밀번호를 입력해주세요.");
    return;
  }

  updateUserPassword(verifiedAccount, newPassword);
  showToast("비밀번호가 변경되었습니다. 로그인 화면으로 이동합니다.");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1200);
});
