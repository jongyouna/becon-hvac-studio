/**
 * BECON HVAC AI Studio Internationalization (i18n) Module
 * 한국어 / English 완전 지원 딕셔너리 및 언어 전환 엔진
 */

export const translations = {
  ko: {
    // Brand & Header
    "brand.name": "BECON",
    "brand.sub": "HVAC AI Studio",
    "badge.copilot": "DDC Copilot 2.5",
    "badge.bacnet_live": "BACnet/IP 연동: Building-04 (AHU-01/Chiller-01)",
    "banner.text": "DDC 제어기(192.168.1.100) 정상 통신 중 | 외기 31.4℃ / 65% | AI 최적화 냉수 밸브 PID 루프 및 CO2 수요환기 시퀀스 가동 중 (-14.8% 절감)",
    "banner.update_text": "BECON HVAC Logic Agent v2.5 — 자연어 기반 Sequence of Operation(SOO) 및 BACnet DDC 제어 코드 자동 생성",
    "btn.export_soo": "SOO 사양서 출력",
    "btn.logout": "로그아웃",
    "user.role_pro": "님 (Pro)",
    "user.default_title": "HVAC 수석 엔지니어",

    // Sidebar
    "nav.ai_logic": "AI 로직",
    "nav.ahu_plant": "설비 계통",
    "nav.archive": "시퀀스 보관",
    "nav.energy_sim": "에너지 시뮬",
    "nav.settings": "DDC 설정",
    "nav.account": "계정",

    // Copilot Main
    "copilot.title": "BECON HVAC Logic Agent",
    "copilot.model_tag": "Gemini-HVAC v2.5",
    "copilot.subtitle": "자연어 요구사항 → Sequence of Operation (SOO) & DDC 제어 코드 자동 생성",
    "copilot.btn_clear": "대화 초기화",
    "copilot.mode_temp": "🌡️ 냉난방 온도/밸브 PID",
    "copilot.mode_iaq": "💨 CO2 수요제어환기 (DCV)",
    "copilot.mode_safety": "🛡️ 동파방지 & 인터록 안전",
    "copilot.mode_energy": "⚡ 피크 컷 & 에너지 절감",
    "copilot.placeholder": "원하시는 HVAC 제어 조건이나 시퀀스를 자연어로 입력하세요 (예: 외기 30도 이상 시 냉수 밸브 70% 제어 및 댐퍼 연동)...",
    "copilot.welcome_title": "안녕하세요! BECON 자연어 기반 HVAC 제어 로직 생성 AI 에이전트입니다. 🏢⚡",
    "copilot.welcome_desc": "공조기(AHU), 칠러(Chiller), 보일러, VAV 등의 운전 조건 및 요구사항을 자연어로 입력하시면, Sequence of Operation(SOO), BACnet 포인트 매핑표, IEC 61131-3 제어 코드 및 안전 인터록 규칙을 자동으로 생성해 드립니다.",
    "copilot.welcome_card_title": "💡 이렇게 명령해보세요:",
    "copilot.welcome_ex1": "여름철 주간 외기온도가 28도 이상일 때 급기온도 16도 유지 냉수밸브 PID 제어 시퀀스 만들어줘",
    "copilot.welcome_ex2": "실내 CO2 농도가 800ppm 초과 시 외기 댐퍼 100% 개방 및 급기팬 증속 환기 로직 생성",
    "copilot.welcome_ex3": "겨울철 외기온도 2도 이하 시 프리히터 100% 개방 및 팬 정지 동파방지 안전 로직 작성",
    "copilot.welcome_ex4": "전력 피크 시간대(14~16시) 냉방 설정온도 1.5도 상향 및 칠러 80% 리밋 제어",

    // Prompt Chips
    "chip.temp_pid": "🌡️ 외기보상 냉수 PID 제어",
    "chip.co2_dcv": "💨 CO2 연동 외기 댐퍼 DCV 로직",
    "chip.freeze_guard": "❄️ 동파 방지 긴급 인터록 시퀀스",
    "chip.peak_cut": "⚡ 피크 전력 억제 수요반응(DR)",
    "chip.vav_loop": "🌀 VAV 정압 제어 루프",

    "prompt.temp_pid": "여름철 주간 외기온도가 28도 이상일 때 급기온도 16도 유지 냉수 밸브 PID 제어 시퀀스 만들어줘",
    "prompt.co2_dcv": "실내 CO2 농도가 800ppm 초과 시 외기 도입 댐퍼 100% 개방 및 환기팬 증속 로직 생성",
    "prompt.freeze_guard": "겨울철 외기온도 2도 이하 시 프리히터 100% 개방 및 팬 정지 동파방지 안전 로직 작성",
    "prompt.peak_cut": "14시~16시 전력 피크 시간대 냉방 설정온도 1.5도 상향 및 칠러 80% 리밋 제어 시퀀스",
    "prompt.vav_loop": "공조기(AHU-1) 가변 풍량(VAV) 정압 유지 인버터 주파수 PID 제어 루프",

    // Actions in Chat
    "action.copy": "로직 복사",
    "action.deploy_ddc": "🚀 DDC 배포 (BACnet Push)",
    "action.feedback": "👍 검증 완료",
    "action.approved": "❤️ 엔지니어 승인됨",

    // HUD Panel
    "hud.title_preset": "공조 설비 환경 프리셋",
    "hud.preset_summer": "여름철 고온 냉방 (Summer)",
    "hud.preset_winter": "겨울철 한파 동파 (Winter)",
    "hud.preset_economizer": "외기 냉방 이코노마이저",
    "hud.preset_high_co2": "고농도 CO2 환기 부하",
    "hud.btn_sim": "제어 로직 시뮬레이션 실행",
    "hud.title_telem": "공조 센서 실시간 텔레메트리",
    "hud.oa_label": "외기 환경 (OA)",
    "hud.sa_label": "급기 온도 (SA)",
    "hud.ra_label": "환기/실내 (RA)",
    "hud.co2_label": "실내 CO2",
    "hud.title_actuators": "DDC 제어 출력 지표 (Actuators)",
    "hud.meter_chw": "냉수 밸브 개도율 (CHW Valve)",
    "hud.meter_hw": "온수 밸브 개도율 (HW Valve)",
    "hud.meter_oad": "외기 도입 댐퍼 (OA Damper)",
    "hud.meter_fan": "급기팬 인버터 주파수 (SF VFD)",
    "hud.meter_co2": "CO2 환기 부하 (IAQ Load)",
    "hud.power_title": "실시간 공조 소비 전력",
    "hud.power_saving": "AI 부하 최적화 가동 중 (-14.8% 절감)",
    "hud.badge_optimal": "AUTO OPTIMAL",
    "ahu.stat_normal": "정상",

    // AHU Plant Tab
    "plant.title": "🏢 Building #4 공조기(AHU-01) 정밀 계통도",
    "plant.desc": "BACnet MSTP로 연동된 DDC 컨트롤러 및 입출력 모듈 계통도입니다.",
    "plant.node_oa": "외기 유입구 (OA: 31.4℃)",
    "plant.node_damper": "가변 댐퍼 (OAD: 35%)",
    "plant.node_filter": "헤파 필터 (45 Pa)",
    "plant.node_coil": "냉수 코일 (CHW: 68%)",
    "plant.node_fan": "급기팬 (48.5 Hz)",
    "plant.node_zone": "실내 거주구역 (RA: 24.8℃ / 680ppm)",

    // Archive Tab
    "archive.title1": "외기보상 냉수 밸브 PID 제어 시퀀스",
    "archive.desc1": "외기온도 24~32℃ 연동 급기온도 설정치 자동 보정 및 밸브 PID 루프",
    "archive.title2": "CO2 비례 외기 댐퍼 수요환기 로직",
    "archive.desc2": "실내 CO2 600~1000ppm 비례 댐퍼 전개 및 팬 인버터 부스팅",
    "archive.title3": "저온 동파 방지 긴급 오버라이드",
    "archive.desc3": "외기 2℃ 이하 시 온수밸브 100%, 댐퍼 0%, 팬 정지 긴급 안전 로직",

    // Energy Sim Tab
    "sim.trend_title": "AI 제어 로직 적용 후 월간 전력 소비 절감 추이",
    "sim.bar1": "기존(48kW)",
    "sim.bar2": "스케줄(41kW)",
    "sim.bar3": "PID튜닝(37kW)",
    "sim.bar4": "AI로직(34kW)",
    "sim.history_title": "DDC 로직 배포 이력 (Audit Log)",
    "sim.th_time": "배포시각",
    "sim.th_name": "로직 명칭",
    "sim.th_target": "대상 제어기",
    "sim.th_status": "결과",
    "sim.tag_success": "배포 성공",

    // Login & Auth Forms
    "login.title": "HVAC AI Studio 로그인",
    "login.subtitle": "빌딩 자동제어(BAS) 및 스마트 공조 제어 로직 생성 플랫폼",
    "login.email_label": "엔지니어 계정 (이메일)",
    "login.email_placeholder": "Email (예: engineer@becon-hvac.ai)",
    "login.password_label": "비밀번호",
    "login.password_placeholder": "Password",
    "login.btn_login": "로그인",
    "login.btn_demo": "체험 모드로 바로 시작하기 (HVAC Demo)",
    "login.save_account": "계정 정보 저장",
    "login.google_login": "구글 계정으로 로그인",
    "login.google_otp": "DDC 2단계 보안 OTP 인증",
    "login.no_account": "엔지니어 계정이 없으신가요?",
    "login.link_signup": "회원가입",
    "login.forgot_password": "비밀번호를 분실하셨나요?",
    "login.link_find": "비밀번호 찾기",

    // Signup Form
    "signup.title": "엔지니어 계정 등록",
    "signup.name_label": "엔지니어 성명",
    "signup.name_placeholder": "홍길동",
    "signup.email_label": "회사/엔지니어 이메일",
    "signup.email_placeholder": "engineer@building.com",
    "signup.password_label": "비밀번호",
    "signup.password_placeholder": "6자리 이상 비밀번호",
    "signup.confirm_label": "비밀번호 확인",
    "signup.confirm_placeholder": "비밀번호 재입력",
    "signup.btn_submit": "계정 생성 완료",
    "signup.has_account": "이미 계정이 있으신가요?",
    "signup.link_login": "로그인으로 이동",

    // Find Account Form
    "find.title": "비밀번호 찾기",
    "find.subtitle": "가입 시 등록한 엔지니어 이메일 주소를 입력하시면 비밀번호 재설정 링크를 보내드립니다.",
    "find.email_label": "가입 이메일",
    "find.email_placeholder": "engineer@building.com",
    "find.btn_submit": "재설정 이메일 전송",
    "find.remember": "기억나셨나요?",
    "find.link_login": "로그인으로 돌아가기",

    // General Toasts
    "toast.demo_success": "🚀 체험 모드로 로그인되었습니다. 대시보드로 이동합니다...",
    "toast.login_success": "로그인 성공! 대시보드로 이동합니다...",
    "toast.input_required": "이메일과 비밀번호를 입력해주세요.",
    "toast.otp_info": "BECON 2단계 보안 인증(OTP)이 활성화되어 있습니다.",
  },

  en: {
    // Brand & Header
    "brand.name": "BECON",
    "brand.sub": "HVAC AI Studio",
    "badge.copilot": "DDC Copilot 2.5",
    "badge.bacnet_live": "BACnet/IP Connected: Building-04 (AHU-01/Chiller-01)",
    "banner.text": "DDC Controller (192.168.1.100) Online | OA 31.4℃ / 65% | AI Optimized CHW Valve PID Loop & CO2 Demand Ventilation Active (-14.8% Savings)",
    "banner.update_text": "BECON HVAC Logic Agent v2.5 — Natural Language Sequence of Operation (SOO) & BACnet DDC Code Auto-Generator",
    "btn.export_soo": "Export SOO Report",
    "btn.logout": "Log Out",
    "user.role_pro": " (Pro)",
    "user.default_title": "Lead HVAC Engineer",

    // Sidebar
    "nav.ai_logic": "AI Logic",
    "nav.ahu_plant": "AHU Plant",
    "nav.archive": "SOO Archive",
    "nav.energy_sim": "Energy Sim",
    "nav.settings": "DDC Settings",
    "nav.account": "Account",

    // Copilot Main
    "copilot.title": "BECON HVAC Logic Agent",
    "copilot.model_tag": "Gemini-HVAC v2.5",
    "copilot.subtitle": "Natural Language Requirements → Sequence of Operation (SOO) & DDC Code Generator",
    "copilot.btn_clear": "Clear Chat",
    "copilot.mode_temp": "🌡️ Temp / Valve PID",
    "copilot.mode_iaq": "💨 CO2 Demand Vent (DCV)",
    "copilot.mode_safety": "🛡️ Freeze & Safety Interlocks",
    "copilot.mode_energy": "⚡ Peak Cut & Energy Saving",
    "copilot.placeholder": "Enter your HVAC control conditions or sequences in natural language (e.g., When OA > 30C, maintain CHW Valve 70% and modulate damper)...",
    "copilot.welcome_title": "Welcome! I am BECON HVAC Control Logic AI Agent. 🏢⚡",
    "copilot.welcome_desc": "Enter operating requirements for AHUs, Chillers, Boilers, or VAVs in natural language to automatically generate Sequence of Operation (SOO), BACnet point mapping, IEC 61131-3 control codes, and safety interlocks.",
    "copilot.welcome_card_title": "💡 Try prompts like:",
    "copilot.welcome_ex1": "Create a summer cooling CHW valve PID loop to maintain 16°C supply air when outdoor temp is above 28°C",
    "copilot.welcome_ex2": "Generate a DCV sequence to open OA damper 100% and boost supply fan when indoor CO2 exceeds 800 ppm",
    "copilot.welcome_ex3": "Write a winter freeze protection interlock to force HW valve 100% and shut down fan when OA is below 2°C",
    "copilot.welcome_ex4": "Create a peak demand curtailment logic to raise cooling setpoint by 1.5°C and limit chiller to 80% between 14:00-16:00",

    // Prompt Chips
    "chip.temp_pid": "🌡️ OA Reset CHW PID Control",
    "chip.co2_dcv": "💨 CO2 Proportional DCV Logic",
    "chip.freeze_guard": "❄️ Freeze Protection Interlock",
    "chip.peak_cut": "⚡ Peak Demand Response (DR)",
    "chip.vav_loop": "🌀 VAV Static Pressure Loop",

    "prompt.temp_pid": "Create a summer cooling CHW valve PID loop to maintain 16°C supply air when outdoor temp is above 28°C",
    "prompt.co2_dcv": "Generate a DCV sequence to open OA damper 100% and boost supply fan when indoor CO2 exceeds 800 ppm",
    "prompt.freeze_guard": "Write a winter freeze protection interlock to force HW valve 100% and shut down fan when OA is below 2°C",
    "prompt.peak_cut": "Create a peak demand curtailment logic to raise cooling setpoint by 1.5°C and limit chiller to 80% between 14:00-16:00",
    "prompt.vav_loop": "Generate AHU-1 VAV supply fan static pressure maintenance inverter PID loop",

    // Actions in Chat
    "action.copy": "Copy Logic",
    "action.deploy_ddc": "🚀 Deploy to DDC (BACnet Push)",
    "action.feedback": "👍 Verified",
    "action.approved": "❤️ Engineer Approved",

    // HUD Panel
    "hud.title_preset": "HVAC Environment Presets",
    "hud.preset_summer": "Summer Peak Cooling",
    "hud.preset_winter": "Winter Freeze Alert",
    "hud.preset_economizer": "Economizer Free Cooling",
    "hud.preset_high_co2": "High CO2 Ventilation Load",
    "hud.btn_sim": "Run Logic Simulation",
    "hud.title_telem": "Live Telemetry Sensors",
    "hud.oa_label": "Outdoor Air (OA)",
    "hud.sa_label": "Supply Air (SA)",
    "hud.ra_label": "Return Air (RA)",
    "hud.co2_label": "Indoor CO2",
    "hud.title_actuators": "DDC Control Outputs (Actuators)",
    "hud.meter_chw": "CHW Valve Position",
    "hud.meter_hw": "HW Valve Position",
    "hud.meter_oad": "OA Damper Position",
    "hud.meter_fan": "Supply Fan Inverter (SF VFD)",
    "hud.meter_co2": "CO2 IAQ Load",
    "hud.power_title": "Real-Time Power Consumption",
    "hud.power_saving": "AI Load Optimization Active (-14.8% Saved)",
    "hud.badge_optimal": "AUTO OPTIMAL",
    "ahu.stat_normal": "Normal",

    // AHU Plant Tab
    "plant.title": "🏢 Building #4 AHU-01 Detailed Schematic",
    "plant.desc": "BACnet MSTP connected DDC controller and I/O module schematic diagram.",
    "plant.node_oa": "Outdoor Air Inlet (OA: 31.4℃)",
    "plant.node_damper": "Modulating Damper (OAD: 35%)",
    "plant.node_filter": "HEPA Filter (45 Pa)",
    "plant.node_coil": "Cooling Coil (CHW: 68%)",
    "plant.node_fan": "Supply Fan (48.5 Hz)",
    "plant.node_zone": "Occupied Zone (RA: 24.8℃ / 680ppm)",

    // Archive Tab
    "archive.title1": "Outdoor Reset CHW Valve PID Sequence",
    "archive.desc1": "Auto-reset supply air setpoint based on 24-32°C OA and modulates cooling valve PID loop",
    "archive.title2": "CO2 Proportional OA Damper DCV Logic",
    "archive.desc2": "Modulates OA damper between 600-1000ppm CO2 and boosts fan inverter speed",
    "archive.title3": "Freeze Protection Emergency Override",
    "archive.desc3": "Emergency safety logic forcing HW valve 100%, OA damper 0%, and fan stop when OA <= 2°C",

    // Energy Sim Tab
    "sim.trend_title": "Monthly Power Savings Trend with AI Control Logic",
    "sim.bar1": "Baseline (48kW)",
    "sim.bar2": "Scheduled (41kW)",
    "sim.bar3": "PID Tuned (37kW)",
    "sim.bar4": "AI Logic (34kW)",
    "sim.history_title": "DDC Logic Deployment Audit Log",
    "sim.th_time": "Timestamp",
    "sim.th_name": "Sequence Name",
    "sim.th_target": "Target Controller",
    "sim.th_status": "Status",
    "sim.tag_success": "Deploy Success",

    // Login & Auth Forms
    "login.title": "HVAC AI Studio Login",
    "login.subtitle": "Building Automation System (BAS) & Smart HVAC Logic Generation Platform",
    "login.email_label": "Engineer Account (Email)",
    "login.email_placeholder": "Email (e.g., engineer@becon-hvac.ai)",
    "login.password_label": "Password",
    "login.password_placeholder": "Password",
    "login.btn_login": "Sign In",
    "login.btn_demo": "Instant Demo Login (HVAC Demo)",
    "login.save_account": "Remember Account",
    "login.google_login": "Sign in with Google",
    "login.google_otp": "DDC 2-Factor Security OTP",
    "login.no_account": "Don't have an engineer account?",
    "login.link_signup": "Sign Up",
    "login.forgot_password": "Forgot your password?",
    "login.link_find": "Find Password",

    // Signup Form
    "signup.title": "Engineer Account Registration",
    "signup.name_label": "Engineer Full Name",
    "signup.name_placeholder": "John Doe",
    "signup.email_label": "Company / Engineer Email",
    "signup.email_placeholder": "engineer@building.com",
    "signup.password_label": "Password",
    "signup.password_placeholder": "At least 6 characters",
    "signup.confirm_label": "Confirm Password",
    "signup.confirm_placeholder": "Re-enter password",
    "signup.btn_submit": "Complete Registration",
    "signup.has_account": "Already have an account?",
    "signup.link_login": "Go to Sign In",

    // Find Account Form
    "find.title": "Reset Password",
    "find.subtitle": "Enter your registered engineer email address and we'll send you a password reset link.",
    "find.email_label": "Registered Email",
    "find.email_placeholder": "engineer@building.com",
    "find.btn_submit": "Send Reset Link",
    "find.remember": "Remembered your password?",
    "find.link_login": "Return to Sign In",

    // General Toasts
    "toast.demo_success": "🚀 Logged in with Demo mode. Redirecting to dashboard...",
    "toast.login_success": "Login successful! Redirecting to dashboard...",
    "toast.input_required": "Please enter both email and password.",
    "toast.otp_info": "BECON 2-Factor Authentication (OTP) is currently active.",
  }
};

let currentLang = localStorage.getItem("becon_lang") || "ko";

export function getLanguage() {
  return currentLang;
}

export function t(key, fallback = "") {
  const dict = translations[currentLang] || translations.ko;
  return dict[key] || fallback || key;
}

export function setLanguage(lang) {
  if (lang !== "ko" && lang !== "en") return;
  currentLang = lang;
  localStorage.setItem("becon_lang", lang);
  applyTranslations();
  updateDropdownUI();
  window.dispatchEvent(new CustomEvent("languageChanged", { detail: { lang } }));
}

export function applyTranslations() {
  const dict = translations[currentLang] || translations.ko;

  // 1. Text content replacement (data-i18n)
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    if (dict[key]) {
      el.textContent = dict[key];
    }
  });

  // 2. Placeholders (data-i18n-placeholder)
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    if (dict[key]) {
      el.placeholder = dict[key];
    }
  });

  // 3. Titles / Tooltips (data-i18n-title)
  document.querySelectorAll("[data-i18n-title]").forEach((el) => {
    const key = el.getAttribute("data-i18n-title");
    if (dict[key]) {
      el.title = dict[key];
    }
  });

  // 4. Data prompt values on buttons (data-i18n-prompt)
  document.querySelectorAll("[data-i18n-prompt]").forEach((el) => {
    const key = el.getAttribute("data-i18n-prompt");
    if (dict[key]) {
      el.dataset.prompt = dict[key];
    }
  });
}

export function updateDropdownUI() {
  const currentLabel = document.getElementById("current-lang-label");
  if (currentLabel) {
    currentLabel.textContent = currentLang === "ko" ? "한국어" : "English";
  }

  document.querySelectorAll(".lang-option").forEach((opt) => {
    const optLang = opt.getAttribute("data-lang");
    if (optLang === currentLang) {
      opt.classList.add("selected");
    } else {
      opt.classList.remove("selected");
    }
  });
}

export function initLanguageSelector() {
  applyTranslations();
  updateDropdownUI();

  // Dropdown toggle click
  const dropdownBtn = document.getElementById("lang-select-btn");
  const dropdownMenu = document.getElementById("lang-dropdown-menu");

  dropdownBtn?.addEventListener("click", (e) => {
    e.stopPropagation();
    dropdownMenu?.classList.toggle("show");
  });

  // Language options click
  document.querySelectorAll(".lang-option").forEach((opt) => {
    opt.addEventListener("click", (e) => {
      e.stopPropagation();
      const selectedLang = opt.getAttribute("data-lang");
      if (selectedLang) {
        setLanguage(selectedLang);
      }
      dropdownMenu?.classList.remove("show");
    });
  });

  // Click outside to close dropdown
  document.addEventListener("click", () => {
    dropdownMenu?.classList.remove("show");
  });
}

// Auto init on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLanguageSelector);
} else {
  initLanguageSelector();
}
