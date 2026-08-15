# Test Site 로그인 UI 목업

로그인/회원가입/계정·비밀번호 찾기 흐름을 갖춘 **정적 프론트엔드 UI 목업**입니다.

## 안내
- 실제 서버·DB가 없습니다. 로그인/회원가입/계정 찾기/비밀번호 찾기 기능은 모두 브라우저의
  `localStorage`에만 데이터를 저장하는 클라이언트 사이드 목업이며, 비밀번호도 평문으로
  저장됩니다. 실제 서비스 수준의 보안을 제공하지 않습니다.
- 디자인 참고 및 프론트엔드 학습용으로 제작된 개인 프로젝트입니다.
- 실제 서비스에 사용하거나 사용자로부터 실제 로그인 정보를 수집하는 용도로 사용하지 마세요.

## 실행 방법
정적 HTML/CSS/JS로만 구성되어 있어 별도 빌드 과정이 필요 없습니다.

```bash
# 저장소 루트에서
open index.html   # 또는 브라우저로 직접 열기
```

또는 간단한 정적 서버로 실행:

```bash
npx serve .
```

## 사용 흐름
1. `signup.html`에서 회원가입하면 계정 정보가 `localStorage`에 저장됩니다.
2. `index.html`에서 가입한 계정으로 로그인하면 `dashboard.html`(로그인한 사용자만 볼 수 있는
   페이지)로 이동합니다.
3. `find-account.html`에서 이름으로 계정을 찾거나, 계정+이름 확인 후 비밀번호를 재설정할 수
   있습니다.
4. `dashboard.html`은 로그인 세션이 없으면 자동으로 `index.html`로 리다이렉트됩니다.

## 구성
- `index.html` — 로그인 화면
- `signup.html` — 회원가입 화면
- `find-account.html` — 계정/비밀번호 찾기 화면
- `dashboard.html` — 로그인한 사용자만 접근 가능한 콘텐츠 화면
- `css/style.css` — 레이아웃/스타일
- `js/auth.js` — localStorage 기반 목업 인증 로직(회원 관리, 세션, 토스트)
- `js/main.js`, `js/signup.js`, `js/find-account.js`, `js/dashboard.js` — 각 화면 스크립트
