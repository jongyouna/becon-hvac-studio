document.getElementById("signup-form").addEventListener("submit", (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const account = document.getElementById("account").value.trim();
  const password = document.getElementById("password").value;
  const passwordConfirm = document.getElementById("password-confirm").value;

  if (!name || !account || !password || !passwordConfirm) {
    showToast("모든 항목을 입력해주세요.");
    return;
  }

  if (password !== passwordConfirm) {
    showToast("비밀번호가 일치하지 않습니다.");
    return;
  }

  if (findUserByAccount(account)) {
    showToast("이미 사용 중인 계정입니다.");
    return;
  }

  addUser({ name, account, password });
  showToast("회원가입이 완료되었습니다. 로그인 화면으로 이동합니다.");
  setTimeout(() => {
    window.location.href = "index.html";
  }, 1200);
});
