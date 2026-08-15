# BECON Cloud Pro — HVAC AI Logic Studio (자연어 기반 공조 제어 로직 생성 Agent)

BECON HVAC AI Studio는 빌딩 자동제어(BAS), 공조기(AHU), 칠러(Chiller), VAV 제어 시퀀스를 **자연어로 입력받아 검증된 Sequence of Operation(SOO), BACnet/Modbus I/O 포인트 매핑표, IEC 61131-3 제어 코드 및 안전 인터록 규칙**을 자동으로 생성하고 시뮬레이션하는 전문 AI Agent 플랫폼입니다.

---

## 🌟 주요 기능

1. **BECON HVAC AI Logic Agent (자연어 제어 로직 생성)**:
   - **온도 제어**: 외기보상 연동 급기온도 냉/온수 밸브 PID 루프 자동 생성
   - **수요제어환기 (DCV)**: 실내 CO2 농도 비례 가변 외기 댐퍼 및 팬 인버터 제어 시퀀스
   - **안전 인터록**: 영하 한파 동파 방지(Freeze Stat), 팬-댐퍼 연동, 연기 감지 긴급 차단
   - **에너지 최적화 & 피크 컷**: 14~16시 전력 피크 억제 수요반응(Demand Response) 부하 감축 시퀀스
   - **BACnet DDC 코드 출력**: Structured Text (IEC 61131-3) 및 Python BACnet 스크립트 생성

2. **실시간 AHU 텔레메트리 HUD & 로직 시뮬레이션**:
   - 외기(OA), 급기(SA), 환기(RA), CO2, 밸브 개도율, 팬 주파수 실시간 모니터링
   - 생성된 제어 로직을 가상 AHU 컨트롤러에 주입하여 수렴 상태 즉시 시뮬레이션
   - 원클릭 DDC 제어기 배포 (BACnet Push 시뮬레이션) 및 SOO 사양서 PDF 출력

3. **인증 및 배포 환경**:
   - Firebase Authentication (이메일/비밀번호, Google 로그인)
   - 빠른 검증을 위한 **'체험 모드로 바로 시작하기 (HVAC Demo)'** 원클릭 로그인 지원
   - GitHub Actions (`.github/workflows/deploy-pages.yml`) 자동 배포 파이프라인

---

## 🚀 로컬 실행 방법

1. 저장소 디렉터리로 이동:
   ```bash
   cd becon-cloud-pro
   ```

2. 로컬 서버 실행:
   ```bash
   npx serve . -l 3000
   ```

3. 브라우저에서 `http://localhost:3000` 접속 후 **[체험 모드로 바로 시작하기]** 클릭

---

## 📁 프로젝트 구조

```
becon-cloud-pro/
├── index.html                 # HVAC AI Studio 로그인 & 데모 접속
├── signup.html                # 엔지니어 회원가입
├── find-account.html          # 비밀번호 재설정
├── dashboard.html             # HVAC AI Logic Generator & AHU HUD 워크스페이스
├── css/
│   └── style.css              # HVAC 엔지니어링 테마 & 반응형 스타일시트
├── js/
│   ├── auth.js                # Firebase Auth & 데모 세션 관리
│   ├── copilot.js             # HVAC 자연어 로직 생성 AI Agent 엔진
│   ├── dashboard.js           # 대시보드 탭 & 텔레메트리 컨트롤러
│   ├── main.js                # 로그인 스크립트
│   ├── signup.js              # 회원가입 스크립트
│   ├── find-account.js        # 비밀번호 찾기 스크립트
│   ├── firebase-config.js     # 로컬 설정 파일
│   └── firebase-config.example.js
├── package.json               # 로컬 실행 스크립트
└── .github/workflows/
    └── deploy-pages.yml       # GitHub Actions 자동 배포 파이프라인
```
