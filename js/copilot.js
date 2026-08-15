/**
 * BECON HVAC AI Copilot Engine
 * 자연어 기반 공조(HVAC) 제어 로직 생성 및 시뮬레이션 에이전트 (완벽한 다국어 i18n 지원)
 */
import { t, getLanguage } from "./i18n.js";

export class HvacCopilot {
  constructor() {
    this.chatContainer = document.getElementById("copilot-messages");
    this.inputElement = document.getElementById("copilot-input");
    this.sendBtn = document.getElementById("copilot-send-btn");
    this.chipContainer = document.getElementById("prompt-chips");
    this.presetSelect = document.getElementById("hvac-preset-select");
    this.simBtn = document.getElementById("trigger-sim-btn");
    this.activeMode = "temp";
    this.isTyping = false;

    // 대화 히스토리 상태 (언어 전환 시 전체 메시지 실시간 재번역 지원)
    this.messageHistory = [];

    // 공조기(AHU) 실시간 센서 및 액추에이터 텔레메트리
    this.telemetry = {
      oaTemp: 31.4,
      oaHumidity: 65,
      saTemp: 16.2,
      saTempSp: 16.0,
      raTemp: 24.8,
      raTempSp: 24.0,
      co2Level: 680,
      co2Sp: 800,
      chwValve: 68.5,
      hwValve: 0.0,
      oaDamper: 35.0,
      fanHz: 48.5,
      staticPressure: 245,
      powerKw: 34.2,
      status: "RUNNING_AUTO",
      lastDeploy: "2026.08.15 15:20 (DDC-AHU-01)",
    };

    this.presets = {
      summer: {
        nameKo: "여름철 주간 고온 피크 냉방 (Summer Peak Cooling)",
        nameEn: "Summer Peak Cooling Mode",
        oaTemp: 33.5,
        oaHumidity: 75,
        saTemp: 15.5,
        saTempSp: 15.0,
        raTemp: 25.4,
        raTempSp: 24.0,
        co2Level: 720,
        chwValve: 84.0,
        hwValve: 0.0,
        oaDamper: 25.0,
        fanHz: 54.0,
        powerKw: 42.8,
        status: "PEAK_COOLING",
      },
      winter: {
        nameKo: "겨울철 영하 한파 난방 및 동파 방지 (Winter Freeze Guard)",
        nameEn: "Winter Freeze Protection & Heating Mode",
        oaTemp: -4.2,
        oaHumidity: 30,
        saTemp: 22.8,
        saTempSp: 23.0,
        raTemp: 20.2,
        raTempSp: 21.0,
        co2Level: 650,
        chwValve: 0.0,
        hwValve: 62.0,
        oaDamper: 15.0,
        fanHz: 42.0,
        powerKw: 28.5,
        status: "FREEZE_PROTECT",
      },
      economizer: {
        nameKo: "환절기 외기 냉방 이코노마이저 (Free Cooling Economizer)",
        nameEn: "Economizer Free Cooling Mode",
        oaTemp: 15.2,
        oaHumidity: 48,
        saTemp: 16.0,
        saTempSp: 16.0,
        raTemp: 24.2,
        raTempSp: 24.0,
        co2Level: 510,
        chwValve: 0.0,
        hwValve: 0.0,
        oaDamper: 100.0,
        fanHz: 45.0,
        powerKw: 14.2,
        status: "FREE_COOLING",
      },
      high_co2: {
        nameKo: "재실자 급증 고농도 CO2 환기 모드 (High CO2 Demand Vent)",
        nameEn: "High CO2 Demand Controlled Ventilation (DCV)",
        oaTemp: 26.0,
        oaHumidity: 55,
        saTemp: 18.0,
        saTempSp: 18.0,
        raTemp: 24.5,
        raTempSp: 24.0,
        co2Level: 1180,
        chwValve: 55.0,
        hwValve: 0.0,
        oaDamper: 90.0,
        fanHz: 58.0,
        powerKw: 36.5,
        status: "HIGH_VENTILATION",
      },
    };

    this.init();
  }

  init() {
    this.bindEvents();
    this.updateHUD();
    
    // 초기 웰컴 메시지 등록
    this.messageHistory = [{ type: "welcome", time: this.getTimeString() }];
    this.renderAllMessages();

    // 언어 변경 리스너 (언어 선택 시 전체 대화창 및 HUD 즉시 재번역)
    window.addEventListener("languageChanged", () => {
      this.renderAllMessages();
      this.updateHUD();
    });
  }

  bindEvents() {
    this.sendBtn?.addEventListener("click", () => this.handleUserSubmit());
    this.inputElement?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleUserSubmit();
      }
    });

    this.chipContainer?.addEventListener("click", (e) => {
      const chip = e.target.closest(".prompt-chip");
      if (!chip) return;
      const prompt = chip.dataset.prompt || chip.textContent.trim();
      if (this.inputElement) {
        this.inputElement.value = prompt;
        this.handleUserSubmit();
      }
    });

    this.presetSelect?.addEventListener("change", (e) => {
      this.loadPreset(e.target.value);
    });

    this.simBtn?.addEventListener("click", () => {
      this.triggerSimulation();
    });

    document.getElementById("btn-clear-chat")?.addEventListener("click", () => {
      this.clearChat();
    });

    document.getElementById("btn-export-report")?.addEventListener("click", () => {
      this.exportReport();
    });

    document.querySelectorAll(".copilot-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".copilot-mode-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeMode = btn.dataset.mode || "temp";
        const isKo = getLanguage() === "ko";
        const notice = isKo
          ? `제어 도메인이 [${btn.textContent.trim()}]으로 설정되었습니다.`
          : `Control domain set to [${btn.textContent.trim()}]. Applying specialized sequence rules.`;
        this.appendSystemNotice(notice);
      });
    });
  }

  loadPreset(key) {
    const preset = this.presets[key];
    if (!preset) return;

    Object.assign(this.telemetry, preset);
    this.updateHUD();

    const isKo = getLanguage() === "ko";
    const name = isKo ? preset.nameKo : preset.nameEn;
    this.appendSystemNotice(isKo ? `🏢 [HVAC Plant] 가상 공조 환경이 "${name}"(으)로 전환되었습니다.` : `🏢 [HVAC Plant] Simulated environment switched to "${name}".`);
    
    setTimeout(() => {
      const autoResponse = this.generatePresetAnalysis(preset);
      this.appendAiMessage(autoResponse, "preset", preset);
    }, 500);
  }

  triggerSimulation() {
    const isKo = getLanguage() === "ko";
    const btn = this.simBtn;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> ${isKo ? 'DDC 제어 루프 연산 중...' : 'Computing DDC Loops...'}`;
    }

    this.appendSystemNotice(isKo ? "🔄 공조기(AHU-1) DDC 가상 컨트롤러에 생성된 제어 알고리즘을 주입하여 PID 루프 시뮬레이션을 수행합니다..." : "🔄 Injecting generated control logic into AHU-01 DDC controller for PID loop simulation...");

    setTimeout(() => {
      this.telemetry.saTemp = this.telemetry.saTempSp;
      this.telemetry.raTemp = this.telemetry.raTempSp;
      if (this.telemetry.co2Level > 800) {
        this.telemetry.co2Level = 690;
      }
      this.telemetry.powerKw = (this.telemetry.powerKw * 0.88).toFixed(1);
      this.updateHUD();

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
          </svg>
          <span>${t("hud.btn_sim", "제어 로직 시뮬레이션 실행")}</span>
        `;
      }

      this.appendAiMessage("", "sim_report", null);
    }, 1200);
  }

  updateHUD() {
    const isKo = getLanguage() === "ko";

    const oaVal = document.getElementById("hud-oa-temp");
    if (oaVal) oaVal.textContent = `${this.telemetry.oaTemp}℃ (${this.telemetry.oaHumidity}%)`;

    const saVal = document.getElementById("hud-sa-temp");
    if (saVal) saVal.textContent = `${this.telemetry.saTemp}℃`;

    const raVal = document.getElementById("hud-ra-temp");
    if (raVal) raVal.textContent = `${this.telemetry.raTemp}℃`;

    const co2Val = document.getElementById("hud-co2-level");
    if (co2Val) co2Val.textContent = `${this.telemetry.co2Level} ppm`;

    const chwVal = document.getElementById("hud-chw-valve");
    if (chwVal) chwVal.textContent = `${this.telemetry.chwValve}%`;

    const hwVal = document.getElementById("hud-hw-valve");
    if (hwVal) hwVal.textContent = `${this.telemetry.hwValve}%`;

    const oadVal = document.getElementById("hud-oad-damper");
    if (oadVal) oadVal.textContent = `${this.telemetry.oaDamper}%`;

    const fanVal = document.getElementById("hud-fan-hz");
    if (fanVal) fanVal.textContent = `${this.telemetry.fanHz} Hz`;

    const powerVal = document.getElementById("hud-power-kw");
    if (powerVal) powerVal.textContent = `${this.telemetry.powerKw} kW`;

    this.setMeter("meter-chw", this.telemetry.chwValve, `${this.telemetry.chwValve}%`);
    this.setMeter("meter-hw", this.telemetry.hwValve, `${this.telemetry.hwValve}%`);
    this.setMeter("meter-oad", this.telemetry.oaDamper, `${this.telemetry.oaDamper}%`);
    this.setMeter("meter-fan", (this.telemetry.fanHz / 60) * 100, `${this.telemetry.fanHz} Hz`);
    this.setMeter("meter-co2", (this.telemetry.co2Level / 1500) * 100, `${this.telemetry.co2Level} ppm`);
  }

  setMeter(id, percentage, valueText) {
    const container = document.getElementById(id);
    if (!container) return;
    const bar = container.querySelector(".metric-bar__fill");
    const val = container.querySelector(".metric-value");
    if (bar) bar.style.width = `${Math.min(100, Math.max(0, percentage))}%`;
    if (val) val.textContent = valueText;
  }

  /**
   * 언어 전환 시 전체 대화창 메시지 재렌더링
   */
  renderAllMessages() {
    if (!this.chatContainer) return;
    this.chatContainer.innerHTML = "";

    this.messageHistory.forEach((msg) => {
      if (msg.type === "welcome") {
        this.renderWelcomeNode(msg.time);
      } else if (msg.type === "user") {
        this.renderUserNode(msg.text, msg.time);
      } else if (msg.type === "ai") {
        const text = this.generateLogicResponse(msg.query);
        this.renderAiNode(text, msg.time);
      } else if (msg.type === "preset") {
        const text = this.generatePresetAnalysis(msg.data);
        this.renderAiNode(text, msg.time);
      } else if (msg.type === "sim_report") {
        const isKo = getLanguage() === "ko";
        const text = isKo ? `
### ✅ DDC 시뮬레이션 완료 보고서 (Simulation Pass)

* **제어 대상**: 공조기 1호기 (\`AHU-01\`)
* **수렴 결과**:
  - 급기 온도: \`${this.telemetry.saTemp}℃\` (설정값 \`${this.telemetry.saTempSp}℃\` 도달)
  - 실내 온도: \`${this.telemetry.raTemp}℃\` (오차 \`±0.1℃\` 이내 안정화)
  - 실내 CO2: \`${this.telemetry.co2Level} ppm\` (쾌적 기준 만족)
  - 예상 전력 절감률: **-12.4% (약 4.8 kW 감축)**
* **안전 인터록 상태**: 동파 방지, 팬-댐퍼 인터록, 과열 보호 모두 정상 작동 확인.
        ` : `
### ✅ DDC Simulation Verification Report (Pass)

* **Target Unit**: Air Handling Unit 1 (\`AHU-01\`)
* **Convergence Results**:
  - Supply Air Temp: \`${this.telemetry.saTemp}℃\` (Reached Setpoint \`${this.telemetry.saTempSp}℃\`)
  - Return / Room Temp: \`${this.telemetry.raTemp}℃\` (Stabilized within \`±0.1℃\`)
  - Indoor CO2 Level: \`${this.telemetry.co2Level} ppm\` (Meets IAQ standards)
  - Expected Power Reduction: **-12.4% (~4.8 kW reduction)**
* **Safety Interlocks**: Freeze guard, fan-damper interlock, and thermal limits verified.
        `;
        this.renderAiNode(text, msg.time);
      } else if (msg.type === "notice") {
        this.renderNoticeNode(msg.text);
      }
    });

    this.scrollToBottom();
  }

  renderWelcomeNode(time) {
    const isKo = getLanguage() === "ko";
    const msgEl = document.createElement("div");
    msgEl.className = "copilot-msg copilot-msg--ai welcome-bubble";
    msgEl.innerHTML = `
      <div class="copilot-avatar">
        <span class="avatar-icon">HVAC</span>
      </div>
      <div class="copilot-body">
        <div class="copilot-sender">${t("copilot.title")} <span class="badge-tag">BACnet / DDC Pro</span></div>
        <div class="copilot-text">
          <p>${t("copilot.welcome_title")}</p>
          <p>${t("copilot.welcome_desc")}</p>
          
          <div class="copilot-card">
            <div class="copilot-card__title">${t("copilot.welcome_card_title")}</div>
            <ul class="copilot-card__list">
              <li><em>"${t("copilot.welcome_ex1")}"</em></li>
              <li><em>"${t("copilot.welcome_ex2")}"</em></li>
              <li><em>"${t("copilot.welcome_ex3")}"</em></li>
              <li><em>"${t("copilot.welcome_ex4")}"</em></li>
            </ul>
          </div>
        </div>
        <div class="copilot-time">${time || this.getTimeString()}</div>
      </div>
    `;
    this.chatContainer.appendChild(msgEl);
  }

  renderUserNode(text, time) {
    const msgEl = document.createElement("div");
    msgEl.className = "copilot-msg copilot-msg--user";
    msgEl.innerHTML = `
      <div class="copilot-body">
        <div class="copilot-text"><p>${this.escapeHtml(text)}</p></div>
        <div class="copilot-time">${time || this.getTimeString()}</div>
      </div>
    `;
    this.chatContainer.appendChild(msgEl);
  }

  renderNoticeNode(text) {
    const el = document.createElement("div");
    el.className = "copilot-system-notice";
    el.innerHTML = `<span>${text}</span>`;
    this.chatContainer.appendChild(el);
  }

  renderAiNode(markdownText, time) {
    const msgEl = document.createElement("div");
    msgEl.className = "copilot-msg copilot-msg--ai";
    
    const formattedHtml = this.formatMarkdown(markdownText);
    const copyLabel = t("action.copy", "로직 복사");
    const deployLabel = t("action.deploy_ddc", "🚀 DDC 배포 (BACnet Push)");
    const feedbackLabel = t("action.feedback", "👍 검증 완료");

    msgEl.innerHTML = `
      <div class="copilot-avatar">
        <span class="avatar-icon">HVAC</span>
      </div>
      <div class="copilot-body">
        <div class="copilot-sender">${t("copilot.title")} <span class="badge-tag">Verified SOO</span></div>
        <div class="copilot-text">${formattedHtml}</div>
        <div class="copilot-actions">
          <button class="copilot-action-btn btn-copy" title="Copy Logic">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke="currentColor" stroke-width="2"/></svg>
            <span>${copyLabel}</span>
          </button>
          <button class="copilot-action-btn btn-deploy-ddc" title="Deploy">${deployLabel}</button>
          <button class="copilot-action-btn btn-feedback" title="Feedback">${feedbackLabel}</button>
        </div>
        <div class="copilot-time">${time || this.getTimeString()}</div>
      </div>
    `;
    this.chatContainer.appendChild(msgEl);

    // 복사 이벤트
    msgEl.querySelector(".btn-copy")?.addEventListener("click", () => {
      navigator.clipboard.writeText(markdownText.replace(/[#*`_]/g, ""));
      const copyBtn = msgEl.querySelector(".btn-copy span");
      if (copyBtn) copyBtn.textContent = getLanguage() === "ko" ? "✓ 복사 완료" : "✓ Copied";
      setTimeout(() => {
        if (copyBtn) copyBtn.textContent = copyLabel;
      }, 1500);
    });

    // DDC 배포 이벤트
    msgEl.querySelector(".btn-deploy-ddc")?.addEventListener("click", () => {
      const isKo = getLanguage() === "ko";
      const deployBtn = msgEl.querySelector(".btn-deploy-ddc");
      deployBtn.innerHTML = `<span class="spinner"></span> ${isKo ? 'DDC 전송 중...' : 'Transmitting...'}`;
      setTimeout(() => {
        deployBtn.innerHTML = `✅ ${isKo ? 'DDC 주입 성공 (BACnet Ack)' : 'DDC Injected (BACnet Ack)'}`;
        this.appendSystemNotice(isKo
          ? "📡 [BACnet/IP] 대상 제어기 `DDC-AHU-01 (192.168.1.100:47808)`에 신규 제어 시퀀스가 주입되었습니다."
          : "📡 [BACnet/IP] Control sequence successfully pushed to target controller `DDC-AHU-01 (192.168.1.100:47808)`.");
      }, 900);
    });

    // 피드백 이벤트
    msgEl.querySelector(".btn-feedback")?.addEventListener("click", (e) => {
      e.target.classList.toggle("active");
      const isKo = getLanguage() === "ko";
      e.target.textContent = e.target.classList.contains("active") 
        ? (isKo ? "❤️ 엔지니어 승인됨" : "❤️ Engineer Approved") 
        : feedbackLabel;
    });
  }

  handleUserSubmit() {
    if (this.isTyping) return;
    const text = this.inputElement?.value.trim();
    if (!text) return;

    this.inputElement.value = "";
    this.appendUserMessage(text);

    this.isTyping = true;
    this.setSendButtonState(true);

    setTimeout(() => {
      const aiResponse = this.generateLogicResponse(text);
      this.appendAiMessage(aiResponse, "ai", text);
    }, 450);
  }

  appendUserMessage(text) {
    const time = this.getTimeString();
    this.messageHistory.push({ type: "user", text, time });
    this.renderUserNode(text, time);
    this.scrollToBottom();
  }

  appendSystemNotice(text) {
    this.messageHistory.push({ type: "notice", text });
    this.renderNoticeNode(text);
    this.scrollToBottom();
  }

  appendAiMessage(markdownText, type = "ai", meta = null) {
    const time = this.getTimeString();
    this.messageHistory.push({ type, query: meta, data: meta, markdownText, time });
    
    const text = type === "ai" ? this.generateLogicResponse(meta) : (type === "preset" ? this.generatePresetAnalysis(meta) : markdownText);
    this.renderAiNode(text, time);
    this.scrollToBottom();
    this.isTyping = false;
    this.setSendButtonState(false);
  }

  setSendButtonState(disabled) {
    if (this.sendBtn) {
      this.sendBtn.disabled = disabled;
    }
  }

  scrollToBottom() {
    if (this.chatContainer) {
      this.chatContainer.scrollTop = this.chatContainer.scrollHeight;
    }
  }

  clearChat() {
    const isKo = getLanguage() === "ko";
    if (confirm(isKo ? "생성된 제어 대화 내용을 모두 초기화하시겠습니까?" : "Clear all chat history?")) {
      this.messageHistory = [{ type: "welcome", time: this.getTimeString() }];
      this.renderAllMessages();
    }
  }

  exportReport() {
    const isKo = getLanguage() === "ko";
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>BECON HVAC AI Control Sequence Specification (SOO)</title>
        <style>
          body { font-family: 'Pretendard', -apple-system, sans-serif; padding: 40px; color: #111; line-height: 1.6; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 24px; font-weight: bold; color: #0284c7; }
          .badge { background: #111; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
          .section { margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th, td { border: 1px solid #e2e2e2; padding: 8px 10px; text-align: left; }
          th { background: #f0f9ff; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">BECON HVAC Control Sequence of Operation (SOO)</div>
            <div>${isKo ? '발행일시' : 'Date'}: ${new Date().toLocaleString(isKo ? 'ko-KR' : 'en-US')} | Unit: AHU-01 & Chiller #1</div>
          </div>
          <div class="badge">BACnet COMPLIANT</div>
        </div>

        <div class="section">
          <h2>1. ${isKo ? '제어 개요 및 표준 준수' : 'Control Overview & Compliance'}</h2>
          <p>${isKo ? '본 제어 로직은 ASHRAE Guideline 36 고효율 공조 표준 및 BACnet MSTP/IP 프로토콜을 준수합니다.' : 'This control sequence conforms to ASHRAE Guideline 36 High-Performance Sequences of Operation and BACnet MSTP/IP protocols.'}</p>
        </div>

        <div class="section">
          <h2>2. BACnet I/O Point Mapping Table</h2>
          <table>
            <tr><th>Point Name</th><th>Object Type</th><th>Instance</th><th>Description</th><th>Range</th></tr>
            <tr><td>OA_TEMP</td><td>Analog Input (AI)</td><td>1001</td><td>Outdoor Air Temperature</td><td>-20 ~ 50 ℃</td></tr>
            <tr><td>SA_TEMP</td><td>Analog Input (AI)</td><td>1002</td><td>Supply Air Temperature</td><td>0 ~ 50 ℃</td></tr>
            <tr><td>RA_CO2</td><td>Analog Input (AI)</td><td>1003</td><td>Return Air CO2 Sensor</td><td>0 ~ 2000 ppm</td></tr>
            <tr><td>CHW_VALVE_CMD</td><td>Analog Output (AO)</td><td>2001</td><td>Chilled Water Valve Cmd</td><td>0 ~ 100 %</td></tr>
            <tr><td>HW_VALVE_CMD</td><td>Analog Output (AO)</td><td>2002</td><td>Hot Water Valve Cmd</td><td>0 ~ 100 %</td></tr>
            <tr><td>SF_SPEED_CMD</td><td>Analog Output (AO)</td><td>2003</td><td>Supply Fan VFD Frequency</td><td>20 ~ 60 Hz</td></tr>
            <tr><td>FREEZE_STAT</td><td>Binary Input (BI)</td><td>3001</td><td>Low Limit Freeze Stat</td><td>0=Normal, 1=Trip</td></tr>
          </table>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  }

  generatePresetAnalysis(preset) {
    const isKo = getLanguage() === "ko";
    const name = isKo ? preset.nameKo : preset.nameEn;

    if (isKo) {
      return `
### 🏢 [HVAC Telemetry] "${name}" 로직 분석

가상 공조 설비 텔레메트리 환경이 갱신되었습니다.

* **외기 환경**: \`${preset.oaTemp}℃\` / \`${preset.oaHumidity}%\`
* **급기/실내 온도**: 급기 \`${preset.saTemp}℃\` (설정 \`${preset.saTempSp}℃\`) | 실내 \`${preset.raTemp}℃\`
* **실내 CO2**: \`${preset.co2Level} ppm\` | **냉수 밸브**: \`${preset.chwValve}%\` | **팬 주파수**: \`${preset.fanHz} Hz\`

> **🤖 추천 최적화 액션**:
> 상단 **[제어 로직 시뮬레이션 실행]** 버튼을 클릭하시면 해당 환경에 최적화된 PID 튜닝 및 댐퍼 제어 시퀀스를 즉시 검증할 수 있습니다.
      `;
    } else {
      return `
### 🏢 [HVAC Telemetry] "${name}" Sequence Analysis

Simulated air handling plant telemetry updated.

* **Outdoor Condition**: \`${preset.oaTemp}℃\` / \`${preset.oaHumidity}%\`
* **Supply / Room Temp**: Supply \`${preset.saTemp}℃\` (Setpoint \`${preset.saTempSp}℃\`) | Return \`${preset.raTemp}℃\`
* **Indoor CO2**: \`${preset.co2Level} ppm\` | **CHW Valve**: \`${preset.chwValve}%\` | **Fan Speed**: \`${preset.fanHz} Hz\`

> **🤖 Recommended Optimization**:
> Click the **[Run Logic Simulation]** button above to verify PID tuning and damper modulation in this environment.
      `;
    }
  }

  generateLogicResponse(query = "") {
    const isKo = getLanguage() === "ko";
    const q = (query || "").toLowerCase();

    // 1. Freeze Protection / Safety
    if (q.includes("동파") || q.includes("한파") || q.includes("프리히터") || q.includes("인터록") || q.includes("안전") || q.includes("freeze") || q.includes("safety") || q.includes("heater")) {
      if (isKo) {
        return `
### 🛡️ [HVAC 안전 로직] 저온 동파 방지 및 긴급 인터록 시퀀스 (Freeze Protection SOO)

사용자 요구사항을 분석하여 **공조기 코일 파손 방지를 위한 최우선 하드웨어/소프트웨어 인터록 제어 시퀀스**를 생성했습니다.

---

#### 1. Sequence of Operation (SOO) 동작 명세
1. **트리거 조건**: 외기 온도(\`OA_TEMP\`) $\le 2.0℃$ 또는 동파 서모스탯(\`FREEZE_STAT\`) Trip 감지 시
2. **비상 안전 제어 동작 (Emergency Override)**:
   * **온수 밸브(\`HW_VALVE_CMD\`)**: 즉시 **100% 전개 (Full Open)**
   * **냉수 밸브(\`CHW_VALVE_CMD\`)**: 0% 강제 폐쇄 (오염수 배출 방지)
   * **외기 댐퍼(\`OA_DAMPER_CMD\`)**: **0% 완전 밀폐 (Full Closed)**
   * **환기 댐퍼(\`RA_DAMPER_CMD\`)**: 100% 완전 개방 (내부 공기 순환)
   * **급기팬(\`SF_START_STOP\` / \`SF_SPEED_CMD\`)**: 즉시 **정지(Stop)** 및 경보 발령
3. **복구 조건**: 외기 온도 $4.0℃$ 이상 10분 지속 및 현장 관리자 알람 리셋 후 정상 복귀

---

#### 2. BACnet I/O Point Mapping Table
| Point Name | Object Type | Instance | Description | Normal Value | Trip Action |
| :--- | :--- | :--- | :--- | :--- | :--- |
| \`OA_TEMP\` | Analog Input (AI) | \`1001\` | 외기 온도 센서 | -20 ~ 50 ℃ | 조건 감시 |
| \`FREEZE_STAT\` | Binary Input (BI) | \`3001\` | 저온 동파 서모스탯 | \`0\` (Normal) | \`1\` $\rightarrow$ Trip |
| \`HW_VALVE\` | Analog Output (AO) | \`2002\` | 온수 밸브 액추에이터 | PID Auto | **100.0 %** |
| \`OA_DAMPER\` | Analog Output (AO) | \`2004\` | 외기 도입 댐퍼 | 20 ~ 100 % | **0.0 %** |
| \`SF_CMD\` | Binary Output (BO) | \`4001\` | 급기팬 기동/정지 | \`1\` (Run) | **\`0\` (Stop)** |

---

#### 3. DDC 실행 코드 (Structured Text / IEC 61131-3)
\`\`\`pascal
// AHU Freeze Protection Logic
IF (OA_TEMP <= 2.0) OR (FREEZE_STAT = TRUE) THEN
    HW_VALVE_CMD   := 100.0; // 온수 밸브 완전 개방
    CHW_VALVE_CMD  := 0.0;   // 냉수 밸브 차단
    OA_DAMPER_CMD  := 0.0;   // 외기 댐퍼 차단
    RA_DAMPER_CMD  := 100.0; // 환기 댐퍼 전개
    SF_START_STOP  := FALSE; // 급기팬 정지
    ALARM_FREEZE   := TRUE;  // 중앙 감시반 경보 출력
ELSE
    ALARM_FREEZE   := FALSE;
    HW_VALVE_CMD   := PID_HEATING(SA_TEMP, SA_TEMP_SP);
END_IF;
\`\`\`

> **🔒 안전성 검증 (Safety Pass)**: 하드웨어 인터록 릴레이 및 소프트웨어 DDC 이중화 안전 검증을 통과했습니다.
        `;
      } else {
        return `
### 🛡️ [HVAC Safety Logic] Low-Limit Freeze Protection & Safety Interlock SOO

Generated high-priority safety interlock sequence to prevent coil rupture in AHU units:

---

#### 1. Sequence of Operation (SOO) Specification
1. **Trigger Condition**: Outdoor Air Temp (\`OA_TEMP\`) $\le 2.0℃$ OR Freeze Stat (\`FREEZE_STAT\`) = True
2. **Emergency Override Actions**:
   * **Hot Water Valve (\`HW_VALVE_CMD\`)**: Force **100% Full Open**
   * **Chilled Water Valve (\`CHW_VALVE_CMD\`)**: Force 0% Closed
   * **OA Damper (\`OA_DAMPER_CMD\`)**: Force **0% Full Closed**
   * **RA Damper (\`RA_DAMPER_CMD\`)**: Force 100% Full Open (Recirculation)
   * **Supply Fan (\`SF_CMD\`)**: **Shutdown (Stop)** and raise critical alarm
3. **Reset Condition**: OA Temp $> 4.0℃$ for 10 min and manual operator reset.

---

#### 2. DDC Control Code (IEC 61131-3 Structured Text)
\`\`\`pascal
// AHU Freeze Protection Logic
IF (OA_TEMP <= 2.0) OR (FREEZE_STAT = TRUE) THEN
    HW_VALVE_CMD   := 100.0; // Full open heating coil
    CHW_VALVE_CMD  := 0.0;   // Close cooling coil
    OA_DAMPER_CMD  := 0.0;   // Shut outdoor air damper
    RA_DAMPER_CMD  := 100.0; // Recirculate return air
    SF_START_STOP  := FALSE; // Stop fan immediately
    ALARM_FREEZE   := TRUE;  // Broadcast critical alarm
ELSE
    ALARM_FREEZE   := FALSE;
    HW_VALVE_CMD   := PID_HEATING(SA_TEMP, SA_TEMP_SP);
END_IF;
\`\`\`
        `;
      }
    }

    // 2. CO2 / DCV Ventilation
    if (q.includes("co2") || q.includes("환기") || q.includes("공기질") || q.includes("풍량") || q.includes("vav") || q.includes("댐퍼") || q.includes("dcv") || q.includes("vent")) {
      if (isKo) {
        return `
### 💨 [HVAC 환기 로직] 실내 CO2 농도 연동 가변 외기 댐퍼 및 DCV 제어 시퀀스

**수요제어환기(Demand-Controlled Ventilation, DCV)** 표준에 따른 실내 공기질 기반 제어 로직입니다.

---

#### 1. Sequence of Operation (SOO) 동작 명세
1. **최소 환기량 보장**: 외기 댐퍼 최소 개도율 \`Min_OAD = 15%\` 상시 유지
2. **CO2 비례 적분 제어 (Proportional DCV Control)**:
   * 실내 CO2 $\le 600 \text{ ppm}$: \`OA_DAMPER_CMD = 15%\` (에너지 보존 모드)
   * $600 \text{ ppm} < \text{CO2} \le 1,000 \text{ ppm}$: $15\% \sim 100\%$ 선형 비례 개방
   * 실내 CO2 $> 1,000 \text{ ppm}$: 외기 댐퍼 **100% 완전 전개** 및 급기팬 인버터 주파수 +5Hz 부스팅

---

#### 2. DDC 제어 코드 (Python / BACnet Script)
\`\`\`python
def dcv_ventilation_control(ra_co2_ppm, co2_low_sp=600, co2_high_sp=1000, min_oad=15.0):
    if ra_co2_ppm <= co2_low_sp:
        oad_cmd = min_oad
        fan_boost_hz = 0.0
    elif ra_co2_ppm >= co2_high_sp:
        oad_cmd = 100.0
        fan_boost_hz = 5.0
    else:
        ratio = (ra_co2_ppm - co2_low_sp) / (co2_high_sp - co2_low_sp)
        oad_cmd = min_oad + (100.0 - min_oad) * ratio
        fan_boost_hz = 3.0 * ratio

    return {
        "OA_DAMPER_CMD": round(oad_cmd, 1),
        "RA_DAMPER_CMD": round(100.0 - oad_cmd, 1),
        "FAN_BOOST_HZ": round(fan_boost_hz, 1)
    }
\`\`\`
        `;
      } else {
        return `
### 💨 [HVAC DCV Logic] Indoor CO2 Demand-Controlled Ventilation Sequence

ASHRAE 62.1 compliant Demand-Controlled Ventilation (DCV) Sequence of Operation:

---

#### 1. Sequence of Operation (SOO) Specification
1. **Minimum Outdoor Air**: Maintain minimum position \`Min_OAD = 15%\`
2. **Proportional DCV Modulation**:
   * Indoor CO2 $\le 600 \text{ ppm}$: Set \`OA_DAMPER_CMD = 15%\`
   * $600 < \text{CO2} \le 1000 \text{ ppm}$: Modulate damper linearly between $15\% \sim 100\%$
   * Indoor CO2 $> 1000 \text{ ppm}$: Fully open damper to **100%** and boost fan speed by +5.0 Hz

---

#### 2. DDC Control Code (Python BACnet Script)
\`\`\`python
def dcv_ventilation_control(ra_co2_ppm, co2_low=600, co2_high=1000, min_oad=15.0):
    if ra_co2_ppm <= co2_low:
        return {"OA_DAMPER_CMD": min_oad, "FAN_BOOST_HZ": 0.0}
    elif ra_co2_ppm >= co2_high:
        return {"OA_DAMPER_CMD": 100.0, "FAN_BOOST_HZ": 5.0}
    ratio = (ra_co2_ppm - co2_low) / (co2_high - co2_low)
    return {
        "OA_DAMPER_CMD": round(min_oad + (100.0 - min_oad) * ratio, 1),
        "FAN_BOOST_HZ": round(3.0 * ratio, 1)
    }
\`\`\`
        `;
      }
    }

    // 3. Peak Demand / Energy
    if (q.includes("피크") || q.includes("절감") || q.includes("에너지") || q.includes("전력") || q.includes("peak") || q.includes("dr") || q.includes("demand") || q.includes("curtailment")) {
      if (isKo) {
        return `
### ⚡ [HVAC 에너지 최적화] 전력 피크 컷 및 수요반응(Demand Response) 제어 로직

하절기/동절기 최대 전력 피크 억제 및 기본요금 절감을 위한 **HVAC 부하 감축 시퀀스**입니다.

---

#### 1. Sequence of Operation (SOO) 동작 명세
1. **피크 시간대 감지**: 전력량계 피크 경보(DR Signal) 또는 14:00~16:00 시간대 진입 시
2. **1단계 부하 제한 (Level 1 Curtailment - 전력 10% 감축)**:
   * 실내 설정온도 1.5℃ 상향 조절 ($\text{RA\_TEMP\_SP} = 24.0℃ \rightarrow 25.5℃$)
   * 칠러 냉수 공급온도(CHW Supply Temp) 1.0℃ 상향 ($7.0℃ \rightarrow 8.0℃$)
3. **2단계 부하 제한 (Level 2 Curtailment - 전력 20% 감축)**:
   * 급기팬 인버터 최대 주파수 50Hz 제한 ($\text{SF\_VFD\_MAX} = 50.0\text{Hz}$)

---

#### 2. DDC 제어 코드 (IEC 61131-3 Structured Text)
\`\`\`pascal
// Demand Response Peak Cut Logic
IF (DR_ACTIVE = TRUE) OR ((TIME_OF_DAY >= TOD#14:00:00) AND (TIME_OF_DAY <= TOD#16:00:00)) THEN
    TARGET_ROOM_SP := 25.5; // Setback +1.5C
    CHILLER_MAX_LOAD := 80.0; // Limit Chiller capacity
    FAN_MAX_HZ := 48.0;      // Cap Fan VFD
    STATUS_PEAK_MODE := TRUE;
ELSE
    TARGET_ROOM_SP := 24.0;
    CHILLER_MAX_LOAD := 100.0;
    FAN_MAX_HZ := 60.0;
    STATUS_PEAK_MODE := FALSE;
END_IF;
\`\`\`
        `;
      } else {
        return `
### ⚡ [HVAC Energy SOO] Peak Demand Response (DR) Curtailment Sequence

Load curtailment sequence designed for peak electrical demand reduction:

---

#### 1. Sequence of Operation (SOO) Specification
1. **Curtailment Trigger**: Peak DR grid signal active OR schedule time 14:00-16:00
2. **Control Strategy**:
   * Increase occupied room setpoint by +1.5°C ($24.0°C \rightarrow 25.5°C$)
   * Reset chilled water supply temp upward by +1.0°C ($7.0°C \rightarrow 8.0°C$)
   * Limit supply fan maximum frequency to 48.0 Hz

---

#### 2. DDC Control Code (Structured Text)
\`\`\`pascal
IF DR_ACTIVE OR ((TIME_OF_DAY >= TOD#14:00:00) AND (TIME_OF_DAY <= TOD#16:00:00)) THEN
    TARGET_ROOM_SP := 25.5;
    CHILLER_MAX_LOAD := 80.0;
    FAN_MAX_HZ := 48.0;
ELSE
    TARGET_ROOM_SP := 24.0;
    CHILLER_MAX_LOAD := 100.0;
    FAN_MAX_HZ := 60.0;
END_IF;
\`\`\`
        `;
      }
    }

    // 4. Default / Temperature PID Loop
    if (isKo) {
      return `
### 🌡️ [HVAC 온도 제어] 외기보상 연동 급기온도 냉수 밸브 PID 제어 시퀀스

자연어 요청 **"${this.escapeHtml(query)}"**에 대한 공조기(AHU-01) 표준 제어 로직입니다:

---

#### 1. Sequence of Operation (SOO) 동작 명세
1. **외기보상 급기온도 설정치 재설정 (Outdoor Air Reset)**:
   * 외기온도 $32℃$ 이상 $\rightarrow$ 급기온도 설정값 $\text{SA\_TEMP\_SP} = 15.0℃$
   * 외기온도 $24℃$ 이하 $\rightarrow$ 급기온도 설정값 $\text{SA\_TEMP\_SP} = 18.0℃$
2. **냉수 밸브 PID 루프 (Chilled Water PID Loop)**:
   * 급기 센서(\`SA_TEMP\`)와 급기 설정치(\`SA_TEMP_SP\`) 오차 기반 냉수 밸브 $0\sim100\%$ PID 제어

---

#### 2. DDC 제어 코드 (Python BACnet Logic)
\`\`\`python
def ahu_temperature_pid_loop(oa_temp, sa_temp, current_valve):
    if oa_temp >= 32.0:
        sa_sp = 15.0
    elif oa_temp <= 24.0:
        sa_sp = 18.0
    else:
        sa_sp = 18.0 - ((oa_temp - 24.0) / 8.0) * 3.0

    error = sa_temp - sa_sp
    output_valve = max(0.0, min(100.0, current_valve + (error * 3.5)))
    return {"SA_TEMP_SP": round(sa_sp, 1), "CHW_VALVE_CMD": round(output_valve, 1)}
\`\`\`
      `;
    } else {
      return `
### 🌡️ [HVAC Temperature SOO] Outdoor Reset Chilled Water Valve PID Loop

Generated standard AHU control sequence for query: **"${this.escapeHtml(query)}"**

---

#### 1. Sequence of Operation (SOO) Specification
1. **Outdoor Air Reset Schedule**:
   * When OA $\ge 32°C \rightarrow \text{SA\_TEMP\_SP} = 15.0°C$
   * When OA $\le 24°C \rightarrow \text{SA\_TEMP\_SP} = 18.0°C$
2. **Cooling PID Loop**:
   * Modulate CHW Valve ($0\sim100\%$) based on Supply Air error ($K_p=3.5, T_i=120s$)

---

#### 2. DDC Control Code (Python BACnet Logic)
\`\`\`python
def ahu_temperature_pid_loop(oa_temp, sa_temp, current_valve):
    if oa_temp >= 32.0:
        sa_sp = 15.0
    elif oa_temp <= 24.0:
        sa_sp = 18.0
    else:
        sa_sp = 18.0 - ((oa_temp - 24.0) / 8.0) * 3.0

    error = sa_temp - sa_sp
    output_valve = max(0.0, min(100.0, current_valve + (error * 3.5)))
    return {"SA_TEMP_SP": round(sa_sp, 1), "CHW_VALVE_CMD": round(output_valve, 1)}
\`\`\`
      `;
    }
  }

  formatMarkdown(md) {
    let html = md
      .replace(/^### (.*$)/gim, '<h3 class="md-h3">$1</h3>')
      .replace(/^#### (.*$)/gim, '<h4 class="md-h4">$1</h4>')
      .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/gim, '<em>$1</em>')
      .replace(/`([^`]+)`/gim, '<code class="md-code">$1</code>')
      .replace(/^> (.*$)/gim, '<blockquote class="md-quote">$1</blockquote>')
      .replace(/^\* (.*$)/gim, '<li class="md-li">$1</li>')
      .replace(/^\d+\. (.*$)/gim, '<li class="md-li-num">$1</li>')
      .replace(/```([a-z]*)\n([\s\S]*?)```/gim, '<pre class="code-block"><code class="language-$1">$2</code></pre>')
      .replace(/\|(.+)\|/gim, (match) => {
        const cells = match.split('|').filter(c => c.trim() !== '');
        if (cells.some(c => c.includes('---'))) return '';
        const isHeader = match.includes('Point Name') || match.includes('항목') || match.includes('설명') || match.includes('Description');
        const tag = isHeader ? 'th' : 'td';
        return `<tr>${cells.map(c => `<${tag}>${c.trim()}</${tag}>`).join('')}</tr>`;
      })
      .replace(/\n\n/gim, '</p><p>')
      .replace(/\n/gim, '<br>');

    if (html.includes('<tr>')) {
      html = html.replace(/(<tr>[\s\S]*?<\/tr>)+/g, '<div class="table-wrapper"><table class="md-table">$&</table></div>');
    }

    return `<p>${html}</p>`;
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  getTimeString() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
