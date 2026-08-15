# Test Site 로그인 UI 목업

Firebase Authentication을 사용한 로그인/회원가입/비밀번호 찾기 흐름을 갖춘 정적
프론트엔드 사이트입니다.

## 안내
- 로그인/회원가입/비밀번호 재설정은 Firebase Authentication(이메일/비밀번호,
  구글 로그인)으로 동작합니다.
- 서버 코드는 없으며, 정적 파일 + Firebase 클라이언트 SDK로만 구성되어 있습니다.
- 디자인 참고 및 프론트엔드 학습용으로 제작된 개인 프로젝트입니다.

## Firebase 프로젝트 준비
1. [Firebase 콘솔](https://console.firebase.google.com)에서 프로젝트를 생성합니다.
2. Authentication > Sign-in method에서 **이메일/비밀번호**, (선택) **Google** 제공업체를
   사용 설정합니다.
3. Authentication > Settings > 승인된 도메인에 배포 도메인
   (`<username>.github.io`)을 추가합니다.
4. 프로젝트 설정 > 일반 탭 > 내 앱에서 웹 앱을 추가하고 SDK 설정 값(apiKey,
   authDomain, projectId, storageBucket, messagingSenderId, appId)을 확인합니다.

## GitHub Actions 배포 설정
이 저장소는 Firebase 설정값을 소스코드에 커밋하지 않고, GitHub Actions가 배포 시점에
저장소 Secrets로부터 `js/firebase-config.js`를 생성합니다.

1. 저장소 **Settings > Secrets and variables > Actions**에서 아래 6개 Repository
   secret을 등록합니다.
   - `FIREBASE_API_KEY`
   - `FIREBASE_AUTH_DOMAIN`
   - `FIREBASE_PROJECT_ID`
   - `FIREBASE_STORAGE_BUCKET`
   - `FIREBASE_MESSAGING_SENDER_ID`
   - `FIREBASE_APP_ID`
2. 저장소 **Settings > Pages > Build and deployment > Source**를 **GitHub Actions**로
   변경합니다(기존 "Deploy from a branch" 방식에서 전환).
3. `main` 브랜치에 푸시하면 `.github/workflows/deploy-pages.yml` 워크플로가 실행되어
   `js/firebase-config.js`를 생성하고 GitHub Pages로 배포합니다.

> Firebase 웹 SDK 설정값(apiKey 등)은 브라우저에 그대로 노출되는 공개 설정값이며
> 비밀 키가 아닙니다. Secrets로 관리하는 것은 소스코드에 하드코딩하지 않기 위함이며,
> 실제 접근 제어는 Firebase 콘솔의 승인된 도메인 및 Security Rules가 담당합니다.

## 로컬 개발
```bash
cp js/firebase-config.example.js js/firebase-config.js
# js/firebase-config.js를 실제 Firebase 프로젝트 값으로 채운 뒤
npx serve .
```
`js/firebase-config.js`는 `.gitignore`에 포함되어 있어 커밋되지 않습니다.

ES 모듈(`type="module"`)을 사용하므로 `index.html`을 파일로 직접 열면(`file://`) 동작하지
않습니다. 반드시 로컬 정적 서버(`npx serve .` 등)로 실행하세요.

## 사용 흐름
1. `signup.html`에서 이메일/비밀번호로 회원가입합니다(Firebase Authentication에 계정
   생성).
2. `index.html`에서 로그인하면 `dashboard.html`(로그인한 사용자만 볼 수 있는 페이지)로
   이동합니다.
3. `find-account.html`에서 이메일을 입력하면 Firebase가 비밀번호 재설정 메일을
   발송합니다.
4. `dashboard.html`은 로그인 세션이 없으면 자동으로 `index.html`로 리다이렉트됩니다.

## 구성
- `index.html` — 로그인 화면
- `signup.html` — 회원가입 화면
- `find-account.html` — 비밀번호 찾기 화면
- `dashboard.html` — 로그인한 사용자만 접근 가능한 콘텐츠 화면
- `css/style.css` — 레이아웃/스타일
- `js/auth.js` — Firebase Authentication 초기화 및 공통 헬퍼
- `js/firebase-config.example.js` — Firebase 설정값 템플릿(실값은 커밋하지 않음)
- `js/main.js`, `js/signup.js`, `js/find-account.js`, `js/dashboard.js` — 각 화면 스크립트
- `.github/workflows/deploy-pages.yml` — Secrets로부터 설정을 생성해 GitHub Pages에
  배포하는 워크플로
