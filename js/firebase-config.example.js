// 로컬 개발용 템플릿입니다. 이 파일을 js/firebase-config.js로 복사한 뒤,
// Firebase 콘솔(https://console.firebase.google.com) > 프로젝트 설정 > 일반 탭 >
// "내 앱" > SDK 설정 및 구성에서 값을 그대로 붙여넣으세요.
//
// 이 값들은 브라우저에 그대로 노출되는 공개 설정값이며 비밀 키가 아닙니다.
// 실제 접근 제어는 Firebase 콘솔의 Authentication 허용 도메인 및
// Security Rules에서 관리됩니다.
//
// 배포본(js/firebase-config.js)은 GitHub Actions 워크플로가 저장소 Secrets로부터
// 자동 생성하므로 git에 커밋하지 않습니다(.gitignore 처리됨).
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};
