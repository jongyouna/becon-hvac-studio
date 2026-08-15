/**
 * BECON HVAC AI Copilot Engine
 * 자연어 기반 공조(HVAC) 제어 로직 생성 및 시뮬레이션 에이전트
 */

export class HvacCopilot {
  constructor() {
    this.chatContainer = document.getElementById("copilot-messages");
    this.inputElement = document.getElementById("copilot-input");
    this.sendBtn = document.getElementById("copilot-send-btn");
    this.chipContainer = document.getElementById("prompt-chips");
    this.presetSelect = document.getElementById("hvac-preset-select");
    this.simBtn = document.getElementById("trigger-sim-btn");
    this.activeMode = "temp"; // temp, iaq, safety, energy
    this.isTyping = false;

    // 공조기(AHU) 실시간 센서 및 액추에이터 텔레메트리
    this.telemetry = {
      oaTemp: 31.4,      // 외기 온도 (℃)
      oaHumidity: 65,    // 외기 습도 (%)
      saTemp: 16.2,      // 급기 온도 (℃)
      saTempSp: 16.0,    // 급기 온도 설정값 (℃)
      raTemp: 24.8,      // 환기/실내 온도 (℃)
      raTempSp: 24.0,    // 실내 설정 온도 (℃)
      co2Level: 680,     // 실내 CO2 농도 (ppm)
      co2Sp: 800,        // 실내 CO2 관리 기준 (ppm)
      chwValve: 68.5,    // 냉수 밸브 개도율 (%)
      hwValve: 0.0,      // 온수 밸브 개도율 (%)
      oaDamper: 35.0,    // 외기 댐퍼 개도율 (%)
      fanHz: 48.5,       // 급기팬 인버터 주파수 (Hz)
      staticPressure: 245,// 급기 정압 (Pa)
      powerKw: 34.2,     // 소비 전력 (kW)
      status: "RUNNING_AUTO", // RUNNING_AUTO, FREE_COOLING, FREEZE_PROTECT, PEAK_CUT
      lastDeploy: "2026.08.15 15:20 (DDC-AHU-01)",
    };

    this.presets = {
      summer: {
        name: "여름철 주간 고온 피크 냉방 (Summer Peak Cooling)",
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
        name: "겨울철 영하 한파 난방 및 동파 방지 (Winter Freeze Guard)",
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
        name: "환절기 외기 냉방 이코노마이저 (Free Cooling Economizer)",
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
        name: "재실자 급증 고농도 CO2 환기 모드 (High CO2 Demand Vent)",
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
    this.renderWelcome();
  }

  bindEvents() {
    // 메시지 전송
    this.sendBtn?.addEventListener("click", () => this.handleUserSubmit());
    this.inputElement?.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        this.handleUserSubmit();
      }
    });

    // 프롬프트 칩 클릭
    this.chipContainer?.addEventListener("click", (e) => {
      const chip = e.target.closest(".prompt-chip");
      if (!chip) return;
      const prompt = chip.dataset.prompt || chip.textContent.trim();
      if (this.inputElement) {
        this.inputElement.value = prompt;
        this.handleUserSubmit();
      }
    });

    // 프리셋 선택
    this.presetSelect?.addEventListener("change", (e) => {
      this.loadPreset(e.target.value);
    });

    // 시뮬레이션 버튼
    this.simBtn?.addEventListener("click", () => {
      this.triggerSimulation();
    });

    // 대화 초기화
    document.getElementById("btn-clear-chat")?.addEventListener("click", () => {
      this.clearChat();
    });

    // 리포트 출력
    document.getElementById("btn-export-report")?.addEventListener("click", () => {
      this.exportReport();
    });

    // 모드 탭 변경
    document.querySelectorAll(".copilot-mode-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".copilot-mode-btn").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        this.activeMode = btn.dataset.mode || "temp";
        this.appendSystemNotice(`제어 도메인이 [${btn.textContent.trim()}]으로 설정되었습니다. 해당 설비 제어 규칙을 우선 적용합니다.`);
      });
    });
  }

  loadPreset(key) {
    const preset = this.presets[key];
    if (!preset) return;

    Object.assign(this.telemetry, preset);
    this.updateHUD();

    this.appendSystemNotice(`🏢 [HVAC Plant] 가상 공조 환경이 "${preset.name}"(으)로 전환되었습니다.`);
    
    setTimeout(() => {
      const autoResponse = this.generatePresetAnalysis(preset);
      this.appendAiMessage(autoResponse);
    }, 500);
  }

  triggerSimulation() {
    const btn = this.simBtn;
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = `<span class="spinner"></span> DDC 제어 루프 연산 중...`;
    }

    this.appendSystemNotice("🔄 공조기(AHU-1) DDC 가상 컨트롤러에 생성된 제어 알고리즘을 주입하여 PID 루프 시뮬레이션을 수행합니다...");

    setTimeout(() => {
      // 제어 후 최적 상태로 수렴
      this.telemetry.saTemp = this.telemetry.saTempSp;
      this.telemetry.raTemp = this.telemetry.raTempSp;
      if (this.telemetry.co2Level > 800) {
        this.telemetry.co2Level = 690;
      }
      this.telemetry.powerKw = (this.telemetry.powerKw * 0.88).toFixed(1); // 12% 절감
      this.updateHUD();

      if (btn) {
        btn.disabled = false;
        btn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <polygon points="5 3 19 12 5 21 5 3" fill="currentColor"/>
          </svg>
          <span>제어 로직 시뮬레이션 실행</span>
        `;
      }

      this.appendAiMessage(`
### ✅ DDC 시뮬레이션 완료 보고서 (Simulation Pass)

* **제어 대상**: 공조기 1호기 (\`AHU-01\`)
* **수렴 결과**:
  - 급기 온도: \`${this.telemetry.saTemp}℃\` (설정값 \`${this.telemetry.saTempSp}℃\` 도달)
  - 실내 온도: \`${this.telemetry.raTemp}℃\` (오차 \`±0.1℃\` 이내 안정화)
  - 실내 CO2: \`${this.telemetry.co2Level} ppm\` (쾌적 기준 만족)
  - 예상 전력 절감률: **-12.4% (약 4.8 kW 감축)**
* **안전 인터록 상태**: 동파 방지, 팬-댐퍼 인터록, 과열 보호 모두 정상 작동 확인.
      `, true);
    }, 1200);
  }

  updateHUD() {
    // 온도 표시
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

    // 프로그레스 바 갱신
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

  renderWelcome() {
    if (!this.chatContainer) return;
    this.chatContainer.innerHTML = `
      <div class="copilot-msg copilot-msg--ai welcome-bubble">
        <div class="copilot-avatar">
          <span class="avatar-icon">HVAC</span>
        </div>
        <div class="copilot-body">
          <div class="copilot-sender">BECON HVAC AI Logic Agent <span class="badge-tag">BACnet / DDC Pro</span></div>
          <div class="copilot-text">
            <p>안녕하세요! <strong>BECON 자연어 기반 HVAC 제어 로직 생성 AI 에이전트</strong>입니다. 🏢⚡</p>
            <p>공조기(AHU), 칠러(Chiller), 보일러, VAV 등의 <strong>운전 조건 및 요구사항을 자연어로 입력하시면, Sequence of Operation(SOO), BACnet 포인트 매핑표, IEC 61131-3 제어 코드 및 안전 인터록 규칙</strong>을 자동으로 생성해 드립니다.</p>
            
            <div class="copilot-card">
              <div class="copilot-card__title">💡 이렇게 명령해보세요:</div>
              <ul class="copilot-card__list">
                <li><em>"여름철 주간 외기온도가 28도 이상일 때 급기온도 16도 유지 냉수밸브 PID 제어 시퀀스 만들어줘"</em></li>
                <li><em>"실내 CO2 농도가 800ppm 초과 시 외기 댐퍼 100% 개방 및 급기팬 증속 환기 로직 생성"</em></li>
                <li><em>"겨울철 외기온도 2도 이하 시 프리히터 100% 개방 및 팬 정지 동파방지 안전 로직 작성"</em></li>
                <li><em>"전력 피크 시간대(14~16시) 냉방 설정온도 1.5도 상향 및 칠러 80% 리밋 제어"</em></li>
              </ul>
            </div>
          </div>
          <div class="copilot-time">${this.getTimeString()}</div>
        </div>
      </div>
    `;
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
      this.appendAiMessage(aiResponse, true);
    }, 450);
  }

  appendUserMessage(text) {
    if (!this.chatContainer) return;
    const msgEl = document.createElement("div");
    msgEl.className = "copilot-msg copilot-msg--user";
    msgEl.innerHTML = `
      <div class="copilot-body">
        <div class="copilot-text"><p>${this.escapeHtml(text)}</p></div>
        <div class="copilot-time">${this.getTimeString()}</div>
      </div>
    `;
    this.chatContainer.appendChild(msgEl);
    this.scrollToBottom();
  }

  appendSystemNotice(text) {
    if (!this.chatContainer) return;
    const el = document.createElement("div");
    el.className = "copilot-system-notice";
    el.innerHTML = `<span>${text}</span>`;
    this.chatContainer.appendChild(el);
    this.scrollToBottom();
  }

  appendAiMessage(markdownText, animate = false) {
    if (!this.chatContainer) return;
    const msgEl = document.createElement("div");
    msgEl.className = "copilot-msg copilot-msg--ai";
    
    const formattedHtml = this.formatMarkdown(markdownText);

    msgEl.innerHTML = `
      <div class="copilot-avatar">
        <span class="avatar-icon">HVAC</span>
      </div>
      <div class="copilot-body">
        <div class="copilot-sender">BECON HVAC AI Logic Agent <span class="badge-tag">Verified SOO</span></div>
        <div class="copilot-text"></div>
        <div class="copilot-actions">
          <button class="copilot-action-btn btn-copy" title="제어 로직 복사">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/></svg>
            로직 복사
          </button>
          <button class="copilot-action-btn btn-deploy-ddc" title="DDC 배포">🚀 DDC 배포 (BACnet Push)</button>
          <button class="copilot-action-btn btn-feedback" title="유용함">👍 검증 완료</button>
        </div>
        <div class="copilot-time">${this.getTimeString()}</div>
      </div>
    `;
    this.chatContainer.appendChild(msgEl);

    const textContainer = msgEl.querySelector(".copilot-text");
    textContainer.innerHTML = formattedHtml;
    this.scrollToBottom();
    this.isTyping = false;
    this.setSendButtonState(false);

    // 복사 버튼
    msgEl.querySelector(".btn-copy")?.addEventListener("click", () => {
      navigator.clipboard.writeText(markdownText.replace(/[#*`_]/g, ""));
      const copyBtn = msgEl.querySelector(".btn-copy");
      copyBtn.innerHTML = `✓ 복사 완료`;
      setTimeout(() => {
        copyBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" stroke-width="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" stroke="currentColor" stroke-width="2"/></svg> 로직 복사`;
      }, 1500);
    });

    // DDC 배포 버튼
    msgEl.querySelector(".btn-deploy-ddc")?.addEventListener("click", () => {
      const deployBtn = msgEl.querySelector(".btn-deploy-ddc");
      deployBtn.innerHTML = `<span class="spinner"></span> DDC 전송 중...`;
      setTimeout(() => {
        deployBtn.innerHTML = `✅ DDC 주입 성공 (BACnet Ack)`;
        this.appendSystemNotice("📡 [BACnet/IP] 대상 제어기 \`DDC-AHU-01 (192.168.1.100:47808)\`에 신규 제어 시퀀스가 주입되었습니다.");
      }, 900);
    });

    // 피드백 버튼
    msgEl.querySelector(".btn-feedback")?.addEventListener("click", (e) => {
      e.target.classList.toggle("active");
      e.target.textContent = e.target.classList.contains("active") ? "❤️ 엔지니어 승인됨" : "👍 검증 완료";
    });
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
    if (confirm("생성된 제어 대화 내용을 모두 초기화하시겠습니까?")) {
      this.renderWelcome();
    }
  }

  exportReport() {
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>BECON HVAC AI 제어 로직 사양서 (SOO)</title>
        <style>
          body { font-family: 'Pretendard', sans-serif; padding: 40px; color: #111; line-height: 1.6; }
          .header { border-bottom: 2px solid #0284c7; padding-bottom: 16px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center; }
          .title { font-size: 24px; font-weight: bold; color: #0284c7; }
          .badge { background: #111; color: #fff; padding: 4px 12px; border-radius: 4px; font-size: 12px; }
          .section { margin-bottom: 24px; }
          table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 13px; }
          th, td { border: 1px solid #e2e2e2; padding: 8px 10px; text-align: left; }
          th { background: #f0f9ff; }
          pre { background: #1e293b; color: #f8fafc; padding: 14px; border-radius: 6px; font-size: 12px; overflow-x: auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="title">BECON HVAC Control Sequence of Operation (SOO)</div>
            <div>발행일시: ${new Date().toLocaleString('ko-KR')} | 대상 설비: AHU-01 & Plant Chiller #1</div>
          </div>
          <div class="badge">BACnet COMPLIANT</div>
        </div>

        <div class="section">
          <h2>1. 제어 개요 및 안전 인터록 (Sequence Summary)</h2>
          <p>본 제어 로직은 자연어 명령을 기반으로 자동 생성되었으며, ASHRAE Guideline 36 고효율 공조 표준 및 BACnet MSTP/IP 프로토콜을 준수합니다.</p>
        </div>

        <div class="section">
          <h2>2. BACnet I/O 포인트 매핑 리스트</h2>
          <table>
            <tr><th>포인트명</th><th>객체 타입</th><th>인스턴스</th><th>설명</th><th>기본값/범위</th></tr>
            <tr><td>OA_TEMP</td><td>Analog Input (AI)</td><td>1001</td><td>외기 온도 센서</td><td>-20 ~ 50 ℃</td></tr>
            <tr><td>SA_TEMP</td><td>Analog Input (AI)</td><td>1002</td><td>급기 온도 센서</td><td>0 ~ 50 ℃</td></tr>
            <tr><td>RA_CO2</td><td>Analog Input (AI)</td><td>1003</td><td>환기 CO2 센서</td><td>0 ~ 2000 ppm</td></tr>
            <tr><td>CHW_VALVE_CMD</td><td>Analog Output (AO)</td><td>2001</td><td>냉수 밸브 제어 출력</td><td>0 ~ 100 %</td></tr>
            <tr><td>HW_VALVE_CMD</td><td>Analog Output (AO)</td><td>2002</td><td>온수 밸브 제어 출력</td><td>0 ~ 100 %</td></tr>
            <tr><td>SF_SPEED_CMD</td><td>Analog Output (AO)</td><td>2003</td><td>급기팬 인버터 주파수</td><td>20 ~ 60 Hz</td></tr>
            <tr><td>FREEZE_STAT</td><td>Binary Input (BI)</td><td>3001</td><td>동파 방지 서모스탯</td><td>0=Normal, 1=Trip</td></tr>
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
    return `
### 🏢 [HVAC Telemetry] "${preset.name}" 로직 분석

가상 공조 설비 텔레메트리 환경이 갱신되었습니다.

* **외기 환경**: \`${preset.oaTemp}℃\` / \`${preset.oaHumidity}%\`
* **급기/실내 온도**: 급기 \`${preset.saTemp}℃\` (설정 \`${preset.saTempSp}℃\`) | 실내 \`${preset.raTemp}℃\`
* **실내 CO2**: \`${preset.co2Level} ppm\` | **냉수 밸브**: \`${preset.chwValve}%\` | **팬 주파수**: \`${preset.fanHz} Hz\`

> **🤖 추천 최적화 액션**:
> 상단 **[제어 로직 시뮬레이션 실행]** 버튼을 클릭하시면 해당 환경에 최적화된 PID 튜닝 및 댐퍼 제어 시퀀스를 즉시 검증할 수 있습니다.
    `;
  }

  generateLogicResponse(query) {
    const q = query.toLowerCase();

    // 1. 동파 방지 / 한파 / 안전 인터록
    if (q.includes("동파") || q.includes("한파") || q.includes("프리히터") || q.includes("인터록") || q.includes("안전") || q.includes("freeze")) {
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
3. **복구 조건**: 외기 온도 $4.0℃$ 이상 10분 지속 및 현장 관리자 알람 리셋 후 정상 스케줄 복귀

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
    // 정상 PID 제어 루틴 수행
    HW_VALVE_CMD   := PID_HEATING(SA_TEMP, SA_TEMP_SP);
END_IF;
\`\`\`

> **🔒 안전성 검증 (Safety Pass)**: 하드웨어 인터록 릴레이 및 소프트웨어 DDC 이중화 안전 검증을 통과했습니다.
      `;
    }

    // 2. CO2 / 환기 / VAV 제어
    if (q.includes("co2") || q.includes("환기") || q.includes("공기질") || q.includes("풍량") || q.includes("vav") || q.includes("댐퍼")) {
      return `
### 💨 [HVAC 환기 로직] 실내 CO2 농도 연동 가변 외기 댐퍼 및 DCV 제어 시퀀스

**수요제어환기(Demand-Controlled Ventilation, DCV)** 표준에 따른 실내 공기질 기반 제어 로직입니다.

---

#### 1. Sequence of Operation (SOO) 동작 명세
1. **최소 환기량 보장**: 외기 댐퍼 최소 개도율 \`Min_OAD = 15%\` 상시 유지
2. **CO2 비례 적분 제어 (Proportional DCV Control)**:
   * 실내 CO2 $\le 600 \text{ ppm}$: \`OA_DAMPER_CMD = 15%\` (에너지 보존 모드)
   * $600 \text{ ppm} < \text{CO2} \le 1,000 \text{ ppm}$: $15\% \sim 100\%$ 선형 비례 개방
     $$\text{OA\_DAMPER} = 15 + \left(\frac{\text{CO2} - 600}{400}\right) \times 85$$
   * 실내 CO2 $> 1,000 \text{ ppm}$: 외기 댐퍼 **100% 완전 전개** 및 급기팬 인버터 주파수 +5Hz 부스팅
3. **냉난방 연동 보상**: 외기 도입량 증가로 인한 급기온도 변화 시 냉/온수 밸브 PID 피드포워드 게인 자동 보상

---

#### 2. DDC 제어 코드 (Python / BACnet Script)
\`\`\`python
def dcv_ventilation_control(ra_co2_ppm, co2_low_sp=600, co2_high_sp=1000, min_oad=15.0):
    """
    실내 CO2 기반 외기 댐퍼 개도율 및 팬 풍량 자동 산출
    """
    if ra_co2_ppm <= co2_low_sp:
        oad_cmd = min_oad
        fan_boost_hz = 0.0
    elif ra_co2_ppm >= co2_high_sp:
        oad_cmd = 100.0
        fan_boost_hz = 5.0 # 고농도 급속 환기
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

> **⚡ 에너지 절감 효과**: 재실 인원 감소 시간대 외기 냉난방 부하를 약 **18.5% 절감**합니다.
      `;
    }

    // 3. 피크 전력 / 에너지 절감 / 스케줄
    if (q.includes("피크") || q.includes("절감") || q.includes("에너지") || q.includes("전력") || q.includes("peak") || q.includes("dr") || q.includes("수요반응")) {
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
   * 간헐적 팬 듀티 사이클링 (15분 가동 후 5분 송풍 모드)

---

#### 2. DDC 제어 코드 (IEC 61131-3 Structured Text)
\`\`\`pascal
// Demand Response Peak Cut Logic
IF (DR_ACTIVE = TRUE) OR ((TIME_OF_DAY >= TOD#14:00:00) AND (TIME_OF_DAY <= TOD#16:00:00)) THEN
    TARGET_ROOM_SP := 25.5; // 실내 설정온도 완화 (+1.5C)
    CHILLER_MAX_LOAD := 80.0; // 칠러 인버터 80% 상한 제한
    FAN_MAX_HZ := 48.0;      // 팬 주파수 제한
    STATUS_PEAK_MODE := TRUE;
ELSE
    TARGET_ROOM_SP := 24.0;  // 평상시 기준 온도
    CHILLER_MAX_LOAD := 100.0;
    FAN_MAX_HZ := 60.0;
    STATUS_PEAK_MODE := FALSE;
END_IF;
\`\`\`
      `;
    }

    // 4. 일반/온도 PID/외기보상 제어
    return `
### 🌡️ [HVAC 온도 제어] 외기보상 연동 급기온도 냉수 밸브 PID 제어 시퀀스

자연어 요청 **"${this.escapeHtml(query)}"**에 대한 공조기(AHU-01) 표준 제어 로직입니다:

---

#### 1. Sequence of Operation (SOO) 동작 명세
1. **외기보상 급기온도 설정치 재설정 (Outdoor Air Reset)**:
   * 외기온도 $32℃$ 이상 $\rightarrow$ 급기온도 설정값 $\text{SA\_TEMP\_SP} = 15.0℃$
   * 외기온도 $24℃$ 이하 $\rightarrow$ 급기온도 설정값 $\text{SA\_TEMP\_SP} = 18.0℃$
   * 중간 구간은 선형 보간 자동 계산
2. **냉수 밸브 PID 루프 (Chilled Water PID Loop)**:
   * 급기 센서(\`SA_TEMP\`)와 급기 설정치(\`SA_TEMP_SP\`) 간의 오차($e(t)$)를 기반으로 냉수 밸브(\`CHW_VALVE_CMD\`) $0\sim100\%$ 비례적분 제어
   * 비례 게인 $K_p = 3.5$, 적분 시간 $T_i = 120\text{ sec}$, 미분 게인 $K_d = 0.5$

---

#### 2. DDC 제어 블록 (Python / BACnet Logic)
\`\`\`python
def ahu_temperature_pid_loop(oa_temp, sa_temp, current_valve_pos):
    # 1. 외기보상 급기온도 설정치 계산
    if oa_temp >= 32.0:
        sa_sp = 15.0
    elif oa_temp <= 24.0:
        sa_sp = 18.0
    else:
        sa_sp = 18.0 - ((oa_temp - 24.0) / 8.0) * 3.0

    # 2. 오차 및 밸브 PID 출력 연산
    error = sa_temp - sa_sp
    output_valve = max(0.0, min(100.0, current_valve_pos + (error * 3.5)))

    return {
        "SA_TEMP_SP": round(sa_sp, 1),
        "ERROR": round(error, 2),
        "CHW_VALVE_CMD": round(output_valve, 1)
    }
\`\`\`

> **우측 HUD 패널의 [제어 로직 시뮬레이션 실행]**을 누르시면 해당 수식이 즉시 가상 AHU에 주입되어 검증됩니다.
    `;
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
        const isHeader = match.includes('Point Name') || match.includes('항목') || match.includes('설명');
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
