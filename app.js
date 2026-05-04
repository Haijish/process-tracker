(() => {
  "use strict";

  const STORE_KEY = "honshitsuTrackerState.v1";
  const MIN_ANALYSIS_POINTS = 50;

  const DEFAULT_ITEMS = [
    {
      id: "momentary_wellbeing",
      aliases: ["wellbeing"],
      label: "今のウェルビーイング",
      kind: "outcome",
      low: "低い",
      high: "高い",
      polarity: "positive",
    },
    {
      id: "target_problem",
      aliases: ["symptom"],
      label: "困りごとの強さ",
      kind: "outcome",
      low: "ない",
      high: "非常に",
      polarity: "negative",
    },
    {
      id: "anxiety",
      label: "不安・緊張",
      kind: "process",
      low: "ない",
      high: "強い",
      polarity: "negative",
      module: "acceptance_space",
    },
    {
      id: "boredom_low_engagement",
      aliases: ["boredom"],
      label: "退屈・低関与",
      kind: "process",
      low: "ない",
      high: "強い",
      polarity: "negative",
      module: "behavioral_activation",
    },
    {
      id: "cognitive_fixation",
      aliases: ["fusion"],
      label: "認知的固着・反すう",
      kind: "process",
      low: "ほどける",
      high: "固い",
      polarity: "negative",
      module: "defusion_labeling",
    },
    {
      id: "present_moment_attention",
      label: "今ここへの注意",
      kind: "process",
      low: "散っている",
      high: "向いている",
      polarity: "positive",
      module: "mindful_attention",
    },
    {
      id: "values_action",
      aliases: ["values"],
      label: "価値に沿った行動",
      kind: "process",
      low: "少ない",
      high: "多い",
      polarity: "positive",
      module: "values_next_step",
    },
    {
      id: "avoidance",
      label: "回避・先送り",
      kind: "process",
      low: "ない",
      high: "強い",
      polarity: "negative",
      module: "graded_approach",
    },
    {
      id: "energy_body",
      aliases: ["energy"],
      label: "活力・身体の重さ",
      kind: "process",
      low: "重い",
      high: "軽い",
      polarity: "positive",
      module: "exercise_plus_reflection",
    },
    {
      id: "sleep_quality",
      label: "睡眠の質",
      kind: "process",
      low: "悪い",
      high: "良い",
      polarity: "positive",
      module: "sleep_anchor",
    },
    {
      id: "social_connection",
      label: "つながり・孤立感",
      kind: "process",
      low: "孤立",
      high: "つながり",
      polarity: "positive",
      module: "social_reachout",
    },
    {
      id: "interpersonal_stress",
      label: "対人ストレス",
      kind: "process",
      low: "ない",
      high: "強い",
      polarity: "negative",
      module: "assertive_message",
    },
  ];

  const DEFAULT_WINDOWS = [
    { label: "朝", start: "08:00", end: "10:30" },
    { label: "昼", start: "12:30", end: "15:00" },
    { label: "夜", start: "18:30", end: "21:30" },
  ];

  const GOOGLE_SHEETS = {
    title: "Process Tracker",
    ema: "EMA",
    analysis: "Analysis",
    modules: "Interventions",
  };

  const MODULES = {
    breathing_downshift: {
      id: "breathing_downshift",
      title: "呼吸・身体ダウンシフト",
      tag: "不安・身体",
      focus: "覚醒を下げる",
      summary: "身体の緊張を少し落として、次の行動を選べる幅を戻します。",
      steps: ["足裏を床に置く", "4秒吸って6秒吐く", "次の一手を一つ決める"],
    },
    acceptance_space: {
      id: "acceptance_space",
      title: "アクセプタンス",
      tag: "不安",
      focus: "戦わずに持つ",
      summary: "不安を消すタスクにせず、持ったまま行動の自由度を残します。",
      steps: ["感情に名前をつける", "身体感覚を10秒見る", "不快感があってもできる行動を選ぶ"],
    },
    defusion_labeling: {
      id: "defusion_labeling",
      title: "脱フュージョン",
      tag: "認知的固着",
      focus: "思考と距離を取る",
      summary: "考えを事実として扱わず、頭の中の文章として見直します。",
      steps: ["固着した考えを一文にする", "文頭に「私は今、こう考えている」を足す", "ゆっくり一度読む"],
    },
    cognitive_reappraisal: {
      id: "cognitive_reappraisal",
      title: "認知的再評価",
      tag: "認知",
      focus: "別の見方を探す",
      summary: "固着した考えを、根拠と別解に分けて扱います。",
      steps: ["自動思考を一文にする", "根拠と反証を一つずつ書く", "少し柔らかい別の文に直す"],
    },
    values_next_step: {
      id: "values_next_step",
      title: "価値の一手",
      tag: "価値行動",
      focus: "方向を取り戻す",
      summary: "気分の良し悪しから離れて、大事にしたい方向へ一歩だけ進めます。",
      steps: ["今日の価値語を一つ選ぶ", "5分以内の行動へ縮める", "実行だけを記録する"],
    },
    behavioral_activation: {
      id: "behavioral_activation",
      title: "行動活性",
      tag: "退屈・回避",
      focus: "環境を少し変える",
      summary: "刺激を大きくせず、手触りのある行動で現在地を変えます。",
      steps: ["2分で始められる行動を選ぶ", "抵抗感を1から5で見る", "終わったら状態を再記録する"],
    },
    graded_approach: {
      id: "graded_approach",
      title: "小さな接近",
      tag: "回避",
      focus: "避けている行動に近づく",
      summary: "安全な範囲で、避けている行動を最小ステップに分けます。",
      steps: ["避けている行動を一つ選ぶ", "安全な最小ステップにする", "実行後に不安と達成度を記録する"],
    },
    mindful_attention: {
      id: "mindful_attention",
      title: "今ここへの注意",
      tag: "注意",
      focus: "現在の情報に戻る",
      summary: "短い感覚入力で、思考の渦から現在の情報へ戻します。",
      steps: ["見えるものを三つ見る", "聞こえる音を二つ聞く", "身体感覚を一つ見る"],
    },
    compassion_reset: {
      id: "compassion_reset",
      title: "コンパッション",
      tag: "自責",
      focus: "責めすぎをほどく",
      summary: "不調や失敗の後に、自分を責める循環を少し弱めます。",
      steps: ["今しんどいと認める", "同じ状況の友人に言う言葉を書く", "その言葉を自分にも向ける"],
    },
    social_reachout: {
      id: "social_reachout",
      title: "つながり行動",
      tag: "社会的つながり",
      focus: "孤立を弱める",
      summary: "大きな相談ではなく、短い接点からつながりを回復します。",
      steps: ["連絡できる人を一人選ぶ", "短い一文だけ送る", "返信を待つ間の行動を決める"],
    },
    assertive_message: {
      id: "assertive_message",
      title: "境界線・非暴力的コミュニケーション",
      tag: "対人ストレス",
      focus: "必要を短く伝える",
      summary: "相手を変える前に、自分の感情、必要、依頼を分けます。",
      steps: ["事実を一文にする", "自分の感情と必要を分ける", "依頼を短く書く"],
    },
    sleep_anchor: {
      id: "sleep_anchor",
      title: "睡眠アンカー",
      tag: "睡眠",
      focus: "リズム",
      summary: "睡眠の質を直接操作しようとせず、起床と光の固定点を作ります。",
      steps: ["明日の起床時刻を決める", "起床後に光を浴びる場所を決める", "夜の刺激を一つ減らす"],
    },
    exercise_plus_reflection: {
      id: "exercise_plus_reflection",
      title: "軽い運動 + 振り返り",
      tag: "ウェルビーイング",
      focus: "身体から状態を動かす",
      summary: "運動と心理的振り返りを組み合わせ、ウェルビーイングの土台を作ります。",
      steps: ["10分歩く", "身体の変化を一つ見る", "価値に沿った次の行動を一つ選ぶ"],
    },
    gratitude_three_good: {
      id: "gratitude_three_good",
      title: "3つのよかったこと",
      tag: "ポジティブ心理学",
      focus: "よい出来事への注意",
      summary: "よかったことを拾い、明日増やせる条件を見つけます。",
      steps: ["よかったことを三つ書く", "自分が関われた点を一つ見る", "明日増やせる条件を一つ決める"],
    },
    generic: {
      id: "generic",
      title: "個別項目のミニ実験",
      tag: "個別",
      focus: "検証",
      summary: "見つかった変数に対して、小さく介入して次の記録で確かめます。",
      steps: ["その変数を1段だけ動かす行動を決める", "実行前の値を記録する", "30分から半日後に同じ項目を記録する"],
    },
  };

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

  let state = loadState();
  let notificationTimer = null;
  let googleTokenClient = null;
  let googleAccessGranted = false;
  let googleClientReadyPromise = null;

  document.addEventListener("DOMContentLoaded", () => {
    bindEvents();
    renderAll();
    scheduleNotificationTimer();
    registerServiceWorker();
    reportGoogleConfigStatus();
  });

  function googleConfig() {
    return window.PROCESS_TRACKER_GOOGLE_CONFIG || null;
  }

  function hasGoogleConfig() {
    const config = googleConfig();
    return Boolean(config?.clientId && config?.apiKey && !config.clientId.includes("YOUR_") && !config.apiKey.includes("YOUR_"));
  }

  function isHttpAppOrigin() {
    return window.location.protocol === "http:" || window.location.protocol === "https:";
  }

  function reportGoogleConfigStatus() {
    if (hasGoogleConfig()) {
      console.info("Process Tracker: Google Sheets config loaded.");
    } else {
      console.info("Process Tracker: Google Sheets config not set. Copy google-config.example.js to google-config.js and fill in your values.");
    }
  }

  function loadState() {
    const fallback = {
      records: [],
      customItems: [],
      windows: cloneDefaultWindows(),
      target: "momentary_wellbeing",
      lastAnalysis: null,
      completedModules: {},
      notificationEnabled: false,
      nextPromptAt: null,
      googleSheets: emptyGoogleSheetsState(),
    };

    try {
      const parsed = JSON.parse(localStorage.getItem(STORE_KEY) || "null");
      if (!parsed || typeof parsed !== "object") return fallback;
      return {
        ...fallback,
        ...parsed,
        records: Array.isArray(parsed.records) ? parsed.records : [],
        customItems: Array.isArray(parsed.customItems) ? parsed.customItems : [],
        windows: normalizeWindows(parsed.windows),
        target: normalizeTarget(parsed.target),
        googleSheets: normalizeGoogleSheets(parsed.googleSheets),
        completedModules:
          parsed.completedModules && typeof parsed.completedModules === "object"
            ? parsed.completedModules
            : {},
      };
    } catch {
      return fallback;
    }
  }

  function normalizeWindows(windows) {
    if (!Array.isArray(windows) || windows.length !== 3) return cloneDefaultWindows();
    return windows.map((window, index) => ({
      label: DEFAULT_WINDOWS[index].label,
      start: isTime(window.start) ? window.start : DEFAULT_WINDOWS[index].start,
      end: isTime(window.end) ? window.end : DEFAULT_WINDOWS[index].end,
    }));
  }

  function cloneDefaultWindows() {
    return DEFAULT_WINDOWS.map((window) => ({ ...window }));
  }

  function emptyGoogleSheetsState() {
    return {
      spreadsheetId: "",
      syncedRecordIds: [],
      lastSyncAt: null,
    };
  }

  function normalizeGoogleSheets(value) {
    if (!value || typeof value !== "object") return emptyGoogleSheetsState();
    return {
      spreadsheetId: typeof value.spreadsheetId === "string" ? value.spreadsheetId : "",
      syncedRecordIds: Array.isArray(value.syncedRecordIds) ? value.syncedRecordIds.filter(Boolean) : [],
      lastSyncAt: typeof value.lastSyncAt === "string" ? value.lastSyncAt : null,
    };
  }

  function isTime(value) {
    return typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
  }

  function normalizeTarget(target) {
    if (target === "symptom") return "target_problem";
    if (target === "wellbeing") return "momentary_wellbeing";
    return target === "target_problem" ? "target_problem" : "momentary_wellbeing";
  }

  function persist(options = {}) {
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
    if (!options.quiet) flashSaveStatus();
  }

  function flashSaveStatus() {
    const status = $("#saveStatus");
    status.textContent = "保存中";
    window.setTimeout(() => {
      status.textContent = "保存済み";
    }, 260);
  }

  function bindEvents() {
    $$(".tab").forEach((button) => {
      button.addEventListener("click", () => setView(button.dataset.view));
    });

    $("#quickCheckBtn").addEventListener("click", openEmaDialog);
    $("#runCheckInTop").addEventListener("click", openEmaDialog);
    $("#openCheckInFromPage").addEventListener("click", openEmaDialog);
    $("#runAnalysisMini").addEventListener("click", () => {
      setView("analysis");
      runAnalysis();
    });
    $("#runAnalysisBtn").addEventListener("click", runAnalysis);
    $("#targetSelect").addEventListener("change", (event) => {
      state.target = event.target.value;
      persist();
      renderAll();
    });
    $("#trendMetric").addEventListener("change", renderTrend);
    $("#addSampleDataBtn").addEventListener("click", addSampleData);
    $("#exportDataBtn").addEventListener("click", copyJsonToClipboard);
    $("#downloadDataBtn").addEventListener("click", downloadData);
    $("#importDataInput").addEventListener("change", importData);
    $("#clearDataBtn").addEventListener("click", clearData);
    $("#enableNotificationsBtn").addEventListener("click", enableNotifications);
    $("#completeModuleBtn").addEventListener("click", completeCurrentModule);
    $("#connectGoogleSheetsBtn").addEventListener("click", connectGoogleSheets);
    $("#syncGoogleSheetsBtn").addEventListener("click", syncGoogleSheets);

    $("#customItemForm").addEventListener("submit", (event) => {
      event.preventDefault();
      addCustomItem();
    });

    $("#emaForm").addEventListener("submit", (event) => {
      event.preventDefault();
      if (event.submitter?.value === "cancel") {
        $("#emaDialog").close();
        return;
      }
      saveEmaRecord();
    });
  }

  function setView(name) {
    $$(".tab").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.view === name);
    });
    $$(".view").forEach((view) => {
      view.classList.toggle("is-active", view.id === `view-${name}`);
    });
  }

  function allItems() {
    const normalizedCustom = state.customItems.map((item) => ({
      id: item.id,
      label: item.label,
      kind: "process",
      low: "低い",
      high: "高い",
      polarity: item.polarity || "neutral",
      module: inferModuleForLabel(item.label),
      custom: true,
    }));
    return [...DEFAULT_ITEMS, ...normalizedCustom];
  }

  function recordValue(record, itemId) {
    const item = getItem(itemId);
    const ids = item ? [item.id, ...(item.aliases || [])] : [itemId];
    for (const id of ids) {
      const value = record.values?.[id];
      if (Number.isFinite(value)) return Number(value);
    }
    return null;
  }

  function processItems() {
    return allItems().filter((item) => item.kind === "process");
  }

  function getItem(id) {
    return allItems().find((item) => item.id === id || item.aliases?.includes(id));
  }

  function openEmaDialog() {
    $("#dialogTimestamp").textContent = formatDateTime(new Date());
    renderEmaSliders();
    const dialog = $("#emaDialog");
    if (typeof dialog.showModal === "function") {
      dialog.showModal();
    } else {
      toast("このブラウザではダイアログ表示に制限があります。");
    }
  }

  function renderEmaSliders() {
    const container = $("#emaSliderList");
    container.innerHTML = "";
    allItems().forEach((item) => {
      const row = document.createElement("section");
      row.className = "slider-row";
      row.innerHTML = `
        <div class="slider-top">
          <strong>${escapeHtml(item.label)}</strong>
          <output class="slider-value" for="ema-${escapeHtml(item.id)}">3</output>
        </div>
        <div class="range-wrap">
          <small>${escapeHtml(item.low)}</small>
          <input id="ema-${escapeHtml(item.id)}" name="${escapeHtml(item.id)}" type="range" min="1" max="5" step="1" value="3" />
          <small>${escapeHtml(item.high)}</small>
        </div>
      `;
      const input = $("input", row);
      const output = $("output", row);
      input.addEventListener("input", () => {
        output.textContent = input.value;
      });
      container.appendChild(row);
    });
  }

  function saveEmaRecord() {
    const values = {};
    allItems().forEach((item) => {
      const input = $(`#ema-${cssEscape(item.id)}`);
      values[item.id] = Number(input?.value || 3);
    });

    state.records.push({
      id: uid("record"),
      timestamp: new Date().toISOString(),
      context: $("#contextSelect").value,
      values,
    });
    state.records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    state.lastAnalysis = markAnalysisStale(state.lastAnalysis);
    persist();
    $("#emaDialog").close();
    toast("記録しました。");
    renderAll();
  }

  function markAnalysisStale(analysis) {
    if (!analysis) return null;
    return { ...analysis, stale: true };
  }

  function addCustomItem() {
    const input = $("#customItemName");
    const label = input.value.trim();
    if (!label) {
      toast("項目名を入れてください。");
      return;
    }
    if (allItems().some((item) => item.label === label)) {
      toast("同じ項目名があります。");
      return;
    }
    state.customItems.push({
      id: `custom_${Date.now().toString(36)}`,
      label,
      polarity: $("#customItemPolarity").value,
    });
    input.value = "";
    state.lastAnalysis = markAnalysisStale(state.lastAnalysis);
    persist();
    toast("独自項目を追加しました。");
    renderAll();
  }

  function removeCustomItem(id) {
    state.customItems = state.customItems.filter((item) => item.id !== id);
    state.lastAnalysis = markAnalysisStale(state.lastAnalysis);
    persist();
    renderAll();
  }

  function runAnalysis() {
    const target = $("#targetSelect").value;
    state.target = target;
    const analysis = computeAnalysis(state.records, target);
    state.lastAnalysis = analysis;
    persist();
    renderAll();
    const confirmed = analysis.results.filter((result) => result.status === "confirmed").length;
    toast(confirmed ? `${confirmed}件の本質候補を確認しました。` : "予備候補を更新しました。");
  }

  function computeAnalysis(records, targetId) {
    const sorted = [...records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    const items = processItems();
    const targetItem = getItem(targetId) || DEFAULT_ITEMS[0];
    const rawTarget = seriesFor(sorted, targetId);
    const targetForBetterDirection =
      targetId === "target_problem" ? rawTarget.map((value) => (value == null ? null : -value)) : rawTarget;
    const y = residualize(targetForBetterDirection);
    const validFeatures = [];

    items.forEach((item) => {
      const raw = seriesFor(sorted, item.id);
      const observed = raw.filter(Number.isFinite).length;
      if (observed < Math.min(20, Math.max(8, Math.floor(sorted.length * 0.35)))) {
        validFeatures.push({
          item,
          observed,
          residual: null,
          skipped: true,
          score: 0,
          sign: 0,
        });
        return;
      }
      const residual = residualize(raw);
      const score = importance(residual.values, y.values);
      validFeatures.push({
        item,
        observed,
        residual: residual.values,
        phi: residual.phi,
        score: score.score,
        sign: score.sign,
        same: score.same,
        lag: score.lag,
      });
    });

    const usable = validFeatures.filter((feature) => feature.residual);
    const shadowMax = [];
    const rng = mulberry32(hashString(`${targetId}:${sorted.length}:${sorted.at(-1)?.timestamp || ""}`));
    const iterations = usable.length ? 128 : 0;

    for (let i = 0; i < iterations; i += 1) {
      let maxScore = 0;
      usable.forEach((feature) => {
        const shuffled = shuffle(feature.residual, rng);
        const shadow = importance(shuffled, y.values);
        maxScore = Math.max(maxScore, shadow.score);
      });
      shadowMax.push(maxScore);
    }

    const threshold95 = quantile(shadowMax, 0.95) || 0.18;
    const threshold80 = quantile(shadowMax, 0.8) || 0.12;
    const sampleFactor = Math.sqrt(Math.min(1, sorted.length / MIN_ANALYSIS_POINTS));

    const results = validFeatures
      .map((feature) => {
        let status = "rejected";
        if (!feature.skipped) {
          const confirmedGate = sorted.length >= MIN_ANALYSIS_POINTS && feature.score >= Math.max(0.18, threshold95);
          const tentativeGate = feature.score >= Math.max(0.12, threshold80 * 0.96);
          status = confirmedGate ? "confirmed" : tentativeGate ? "tentative" : "rejected";
        }

        return {
          itemId: feature.item.id,
          label: feature.item.label,
          polarity: feature.item.polarity,
          module: feature.item.module || inferModuleForLabel(feature.item.label),
          status,
          score: round(feature.score * sampleFactor, 3),
          rawScore: round(feature.score, 3),
          threshold: round(threshold95, 3),
          direction: directionLabel(feature.sign),
          sign: round(feature.sign, 3),
          observed: feature.observed,
          skipped: Boolean(feature.skipped),
        };
      })
      .sort((a, b) => b.rawScore - a.rawScore);

    return {
      target: targetId,
      targetLabel: targetItem.label,
      runAt: new Date().toISOString(),
      n: sorted.length,
      variables: usable.length,
      targetPhi: round(y.phi, 3),
      threshold95: round(threshold95, 3),
      threshold80: round(threshold80, 3),
      results,
      stale: false,
    };
  }

  function seriesFor(records, itemId) {
    return records.map((record) => {
      const value = recordValue(record, itemId);
      return Number.isFinite(value) ? Number(value) : null;
    });
  }

  function residualize(series) {
    if (series.length < 3) {
      return { values: series.map((value) => Number(value) || 0), phi: 0 };
    }

    const filled = fillMissing(series);
    const n = filled.length;
    const xs = filled.map((_, index) => index);
    const xMean = mean(xs);
    const yMean = mean(filled);
    const denom = xs.reduce((sum, x) => sum + (x - xMean) ** 2, 0) || 1;
    const slope = xs.reduce((sum, x, index) => sum + (x - xMean) * (filled[index] - yMean), 0) / denom;
    const intercept = yMean - slope * xMean;
    const detrended = filled.map((value, index) => value - (intercept + slope * index));
    const lagDenom = detrended.slice(0, -1).reduce((sum, value) => sum + value ** 2, 0) || 1;
    const lagNumer = detrended.slice(1).reduce((sum, value, index) => sum + value * detrended[index], 0);
    const phi = clamp(lagNumer / lagDenom, -0.85, 0.85);
    const residual = detrended.map((value, index) => (index === 0 ? 0 : value - phi * detrended[index - 1]));
    return { values: standardize(residual), phi };
  }

  function fillMissing(series) {
    const finite = series.map((value) => (Number.isFinite(value) ? Number(value) : null));
    const fallback = mean(finite.filter(Number.isFinite));
    if (!Number.isFinite(fallback)) return series.map(() => 0);

    let lastKnownIndex = finite.findIndex(Number.isFinite);
    if (lastKnownIndex === -1) return series.map(() => fallback);
    for (let index = 0; index < lastKnownIndex; index += 1) {
      finite[index] = finite[lastKnownIndex];
    }

    let index = lastKnownIndex + 1;
    while (index < finite.length) {
      if (Number.isFinite(finite[index])) {
        index += 1;
        continue;
      }
      const gapStart = index - 1;
      let gapEnd = index;
      while (gapEnd < finite.length && !Number.isFinite(finite[gapEnd])) gapEnd += 1;
      const startValue = finite[gapStart];
      const endValue = Number.isFinite(finite[gapEnd]) ? finite[gapEnd] : startValue;
      const gapLength = gapEnd - gapStart;
      for (let cursor = gapStart + 1; cursor < gapEnd; cursor += 1) {
        const ratio = (cursor - gapStart) / gapLength;
        finite[cursor] = startValue + (endValue - startValue) * ratio;
      }
      index = gapEnd + 1;
    }
    return finite;
  }

  function importance(x, y) {
    const same = correlation(x, y);
    const lag = correlation(x.slice(0, -1), y.slice(1));
    const sameWeight = 0.36;
    const lagWeight = 0.64;
    const score = Math.abs(same) * sameWeight + Math.abs(lag) * lagWeight;
    const sign = Math.abs(lag) >= Math.abs(same) ? lag : same;
    return {
      score: Number.isFinite(score) ? score : 0,
      same: Number.isFinite(same) ? same : 0,
      lag: Number.isFinite(lag) ? lag : 0,
      sign: Number.isFinite(sign) ? sign : 0,
    };
  }

  function correlation(a, b) {
    const pairs = [];
    for (let index = 0; index < Math.min(a.length, b.length); index += 1) {
      if (Number.isFinite(a[index]) && Number.isFinite(b[index])) pairs.push([a[index], b[index]]);
    }
    if (pairs.length < 3) return 0;
    const aMean = mean(pairs.map((pair) => pair[0]));
    const bMean = mean(pairs.map((pair) => pair[1]));
    let numerator = 0;
    let aDenom = 0;
    let bDenom = 0;
    pairs.forEach(([av, bv]) => {
      const da = av - aMean;
      const db = bv - bMean;
      numerator += da * db;
      aDenom += da ** 2;
      bDenom += db ** 2;
    });
    const denom = Math.sqrt(aDenom * bDenom);
    return denom ? numerator / denom : 0;
  }

  function renderAll() {
    state.target = normalizeTarget(state.target);
    $("#targetSelect").value = state.target;
    renderStats();
    renderSafety();
    renderTrend();
    renderFactorList();
    renderModule();
    renderRecent();
    renderItemPreview();
    renderWindowPreview();
    renderAnalysis();
    renderTherapy();
    renderSettings();
  }

  function renderStats() {
    const records = sortedRecords();
    const n = records.length;
    const phase = n >= MIN_ANALYSIS_POINTS ? "Phase 2" : "Phase 1";
    const missing = Math.max(0, MIN_ANALYSIS_POINTS - n);
    const days = daySpan(records);
    const avg = days ? (n / days).toFixed(1) : "0.0";
    const next = ensureNextPrompt();
    const module = currentModules()[0];

    $("#recordCount").textContent = String(n);
    $("#recordPace").textContent = n ? `${days}日 / 平均${avg}回` : "最初の記録待ち";
    $("#phaseLabel").textContent = phase;
    $("#phaseHint").textContent = n >= MIN_ANALYSIS_POINTS ? "解析後に介入提案" : `介入提案まであと${missing}時点`;
    $("#nextPrompt").textContent = next ? formatTime(new Date(next)) : "未設定";
    $("#notificationState").textContent = state.notificationEnabled ? "通知有効" : "ページ表示中のみ";
    $("#todayModuleName").textContent = module ? module.title : "提案待ち";
    $("#todayModuleFocus").textContent = module ? module.focus : "50時点後";
    $("#todaySubcopy").textContent =
      module
        ? "解析結果から、いま扱うべきプロセスを絞ります。"
        : "50時点が集まるまでは介入を提案せず、記録だけを続けます。";
  }

  function renderSafety() {
    const banner = $("#safetyBanner");
    banner.hidden = true;
  }

  function renderTrend() {
    const metric = $("#trendMetric").value;
    const item = getItem(metric);
    const records = sortedRecords().slice(-42);
    const values = records.map((record) => recordValue(record, metric)).filter(Number.isFinite);
    const container = $("#trendChart");

    if (!item || values.length < 2) {
      container.innerHTML = `<div class="chart-empty">2件以上の記録で推移が表示されます。</div>`;
      $("#trendCaption").textContent = item ? item.label : "指標";
      return;
    }

    const width = 680;
    const height = 260;
    const padding = { top: 22, right: 22, bottom: 32, left: 34 };
    const usableWidth = width - padding.left - padding.right;
    const usableHeight = height - padding.top - padding.bottom;
    const points = records
      .map((record, index) => ({
        value: recordValue(record, metric),
        x: padding.left + (records.length === 1 ? 0 : (index / (records.length - 1)) * usableWidth),
      }))
      .filter((point) => Number.isFinite(point.value))
      .map((point) => ({
        ...point,
        y: padding.top + ((5 - point.value) / 4) * usableHeight,
      }));

    const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x},${point.y}`).join(" ");
    const area = `${path} L${points.at(-1).x},${height - padding.bottom} L${points[0].x},${height - padding.bottom} Z`;
    const last = points.at(-1);
    const firstDate = formatShortDate(new Date(records[0].timestamp));
    const lastDate = formatShortDate(new Date(records.at(-1).timestamp));

    container.innerHTML = `
      <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" aria-hidden="true">
        <path d="${area}" fill="rgba(47, 125, 107, 0.13)"></path>
        <path d="${path}" fill="none" stroke="#2f7d6b" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"></path>
        ${points
          .map((point) => `<circle cx="${point.x}" cy="${point.y}" r="4" fill="#ffffff" stroke="#2f7d6b" stroke-width="3"></circle>`)
          .join("")}
        <text x="${padding.left}" y="18" fill="#65706e" font-size="12">5</text>
        <text x="${padding.left}" y="${height - padding.bottom + 18}" fill="#65706e" font-size="12">1</text>
        <text x="${padding.left}" y="${height - 8}" fill="#65706e" font-size="12">${escapeHtml(firstDate)}</text>
        <text x="${width - padding.right - 58}" y="${height - 8}" fill="#65706e" font-size="12">${escapeHtml(lastDate)}</text>
        <circle cx="${last.x}" cy="${last.y}" r="8" fill="#d86650"></circle>
      </svg>
    `;
    const average = mean(values).toFixed(1);
    $("#trendCaption").textContent = `${item.label} / 平均${average}`;
  }

  function renderFactorList() {
    const container = $("#factorList");
    const analysis = state.lastAnalysis;
    const n = state.records.length;

    if (!analysis) {
      const missing = Math.max(0, MIN_ANALYSIS_POINTS - n);
      $("#factorCaption").textContent = n >= MIN_ANALYSIS_POINTS ? "解析できます" : `あと${missing}時点`;
      container.innerHTML = `
        <div class="factor-row">
          <div>
            <strong>データ蓄積中</strong>
            <span>50時点でキー要因の判定に切り替わります。</span>
          </div>
          <span class="status-pill tentative">Phase 1</span>
        </div>
      `;
      return;
    }

    const visible = analysis.results
      .filter((result) => result.status !== "rejected")
      .slice(0, 4);
    $("#factorCaption").textContent = analysis.stale
      ? "新しい記録あり"
      : `${formatShortDate(new Date(analysis.runAt))} 実行`;

    const rows = visible.length ? visible : analysis.results.slice(0, 3);
    container.innerHTML = rows
      .map(
        (result) => `
          <div class="factor-row">
            <div>
              <strong>${escapeHtml(result.label)}</strong>
              <span>${escapeHtml(result.direction)} / 重要度 ${result.rawScore.toFixed(2)}</span>
            </div>
            <span class="status-pill ${result.status}">${statusLabel(result.status)}</span>
          </div>
        `,
      )
      .join("");
  }

  function renderModule() {
    const module = currentModules()[0];
    $("#completeModuleBtn").disabled = !module;
    if (!module) {
      const waitText = interventionWaitText();
      $("#moduleCaption").textContent = "50時点後に表示";
      $("#moduleBody").innerHTML = `
        <span class="module-focus">記録のみ</span>
        <h3>まだ介入は提案しません</h3>
        <p>${escapeHtml(waitText)}</p>
      `;
      return;
    }
    $("#moduleCaption").textContent = module.tag;
    $("#moduleBody").innerHTML = moduleMarkup(module);
  }

  function renderRecent() {
    const records = sortedRecords().slice(-6).reverse();
    const container = $("#recentList");
    if (!records.length) {
      container.innerHTML = `
        <div class="recent-row">
          <div>
            <strong>まだ記録がありません</strong>
            <span>30秒記録から始められます。</span>
          </div>
        </div>
      `;
      return;
    }
    container.innerHTML = records
      .map((record) => {
        const wellbeing = recordValue(record, "momentary_wellbeing") ?? "-";
        const symptom = recordValue(record, "target_problem") ?? "-";
        return `
          <div class="recent-row">
            <div>
              <strong>${formatDateTime(new Date(record.timestamp))}</strong>
              <span>${contextLabel(record.context)} / WB ${wellbeing} / 困りごと ${symptom}</span>
            </div>
          </div>
        `;
      })
      .join("");
  }

  function renderItemPreview() {
    const items = allItems();
    $("#itemCountLabel").textContent = `標準${DEFAULT_ITEMS.length}項目 + 独自${state.customItems.length}項目`;
    $("#itemPreviewList").innerHTML = items
      .map(
        (item) => `
          <div class="item-preview-row">
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${item.kind === "outcome" ? "アウトカム" : "プロセス"} / ${polarityLabel(item.polarity)}</span>
            </div>
            <span class="status-pill ${item.kind === "outcome" ? "tentative" : "confirmed"}">${item.low}〜${item.high}</span>
          </div>
        `,
      )
      .join("");
  }

  function renderWindowPreview() {
    $("#windowPreviewList").innerHTML = state.windows
      .map(
        (window) => `
          <div class="window-preview-row">
            <div>
              <strong>${escapeHtml(window.label)}</strong>
              <span>${window.start} から ${window.end}</span>
            </div>
          </div>
        `,
      )
      .join("");
  }

  function renderAnalysis() {
    const analysis = state.lastAnalysis;
    const quality = $("#analysisQuality");
    const table = $("#analysisTableBody");

    if (!analysis) {
      $("#analysisQualityCaption").textContent = "未実行";
      quality.innerHTML = qualityItems([
        ["記録数", state.records.length],
        ["必要時点", MIN_ANALYSIS_POINTS],
        ["変数", processItems().length],
        ["状態", "待機"],
      ]);
      table.innerHTML = `<tr><td colspan="5">解析結果はまだありません。</td></tr>`;
      return;
    }

    $("#analysisQualityCaption").textContent = analysis.stale ? "新しい記録があります" : "最新";
    quality.innerHTML = qualityItems([
      ["記録数", analysis.n],
      ["変数", analysis.variables],
      ["AR係数", analysis.targetPhi],
      ["Shadow95", analysis.threshold95],
    ]);

    table.innerHTML = analysis.results
      .map(
        (result) => `
          <tr>
            <td>
              <strong>${escapeHtml(result.label)}</strong>
              <div class="muted-cell">${result.observed}時点</div>
            </td>
            <td><span class="status-pill ${result.status}">${statusLabel(result.status)}</span></td>
            <td>${escapeHtml(result.skipped ? "データ不足" : result.direction)}</td>
            <td>
              <div class="score-bar" aria-label="${result.rawScore}">
                <span style="width:${Math.round(clamp(result.rawScore, 0, 1) * 100)}%"></span>
              </div>
            </td>
            <td>${result.threshold.toFixed(2)}</td>
          </tr>
        `,
      )
      .join("");
  }

  function renderTherapy() {
    const modules = currentModules();
    if (!modules.length) {
      const waitText = interventionWaitText();
      $("#therapyGrid").innerHTML = `
        <article class="therapy-card">
          <header>
            <h2>介入はまだ表示しません</h2>
            <span class="therapy-tag">記録中</span>
          </header>
          <p>${escapeHtml(waitText)}</p>
        </article>
      `;
      return;
    }
    const library = [
      ...modules,
      MODULES.breathing_downshift,
      MODULES.acceptance_space,
      MODULES.defusion_labeling,
      MODULES.cognitive_reappraisal,
      MODULES.values_next_step,
      MODULES.behavioral_activation,
      MODULES.graded_approach,
      MODULES.mindful_attention,
      MODULES.compassion_reset,
      MODULES.social_reachout,
      MODULES.assertive_message,
      MODULES.sleep_anchor,
      MODULES.exercise_plus_reflection,
      MODULES.gratitude_three_good,
    ];
    const unique = [];
    const seen = new Set();
    library.forEach((module) => {
      if (!seen.has(module.id)) {
        seen.add(module.id);
        unique.push(module);
      }
    });

    $("#therapyGrid").innerHTML = unique
      .slice(0, 9)
      .map(
        (module) => `
          <article class="therapy-card">
            <header>
              <h2>${escapeHtml(module.title)}</h2>
              <span class="therapy-tag">${escapeHtml(module.tag)}</span>
            </header>
            <p>${escapeHtml(module.summary)}</p>
            <ol class="step-list">
              ${module.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
            </ol>
          </article>
        `,
      )
      .join("");
  }

  function renderSettings() {
    renderCustomItems();
    renderScheduleForm();
    renderGoogleSheetsStatus();
  }

  function renderCustomItems() {
    const container = $("#customItemList");
    if (!state.customItems.length) {
      container.innerHTML = `
        <div class="settings-row">
          <div>
            <strong>独自項目なし</strong>
            <span>追加するとEMAと解析に入ります。</span>
          </div>
        </div>
      `;
      return;
    }
    container.innerHTML = state.customItems
      .map(
        (item) => `
          <div class="settings-row">
            <div>
              <strong>${escapeHtml(item.label)}</strong>
              <span>${polarityLabel(item.polarity)}</span>
            </div>
            <button class="button ghost" type="button" data-remove-custom="${escapeHtml(item.id)}">削除</button>
          </div>
        `,
      )
      .join("");
    $$("[data-remove-custom]", container).forEach((button) => {
      button.addEventListener("click", () => removeCustomItem(button.dataset.removeCustom));
    });
  }

  function renderScheduleForm() {
    const container = $("#scheduleForm");
    container.innerHTML = state.windows
      .map(
        (window, index) => `
          <div class="schedule-row">
            <strong>${escapeHtml(window.label)}</strong>
            <label>
              <span>開始</span>
              <input type="time" value="${escapeHtml(window.start)}" data-window-index="${index}" data-window-field="start" />
            </label>
            <label>
              <span>終了</span>
              <input type="time" value="${escapeHtml(window.end)}" data-window-index="${index}" data-window-field="end" />
            </label>
          </div>
        `,
      )
      .join("");
    $$("[data-window-index]", container).forEach((input) => {
      input.addEventListener("change", () => {
        const index = Number(input.dataset.windowIndex);
        const field = input.dataset.windowField;
        state.windows[index][field] = input.value;
        state.nextPromptAt = null;
        persist();
        renderStats();
        renderWindowPreview();
        scheduleNotificationTimer();
      });
    });
  }

  function renderGoogleSheetsStatus() {
    const configured = hasGoogleConfig();
    const spreadsheetId = state.googleSheets?.spreadsheetId || "";
    const unsynced = unsyncedRecords().length;
    const status = $("#googleSheetsStatus");
    const detail = $("#googleSheetsDetail");
    const connectButton = $("#connectGoogleSheetsBtn");
    const syncButton = $("#syncGoogleSheetsBtn");

    connectButton.disabled = !configured || !isHttpAppOrigin();
    syncButton.disabled = !configured || !isHttpAppOrigin() || !spreadsheetId || !state.records.length;

    if (!configured) {
      status.textContent = "設定未完了";
      detail.innerHTML = "google-config.js に CLIENT_ID と API_KEY を入れてください。";
      return;
    }

    if (!isHttpAppOrigin()) {
      status.textContent = "HTTPで開いてください";
      detail.innerHTML = "Google連携は file:// では動きません。http://127.0.0.1:8787/ またはHTTPSの公開URLで開いてください。";
      return;
    }

    if (!spreadsheetId) {
      status.textContent = "未接続";
      detail.innerHTML = `${state.records.length}件のローカル記録があります。連携すると本人のGoogle Drive内に専用シートを作ります。`;
      return;
    }

    status.textContent = unsynced ? `未同期 ${unsynced}件` : "同期済み";
    const lastSync = state.googleSheets.lastSyncAt
      ? `最終同期: ${formatDateTime(new Date(state.googleSheets.lastSyncAt))}`
      : "まだ同期していません";
    detail.innerHTML = `
      <div>シートID: ${escapeHtml(spreadsheetId)}</div>
      <div>${escapeHtml(lastSync)}</div>
      <div>未同期の記録: ${unsynced}件</div>
    `;
  }

  function qualityItems(items) {
    return items
      .map(
        ([label, value]) => `
          <div class="quality-item">
            <span>${escapeHtml(label)}</span>
            <strong>${escapeHtml(String(value))}</strong>
          </div>
        `,
      )
      .join("");
  }

  function moduleMarkup(module) {
    return `
      <span class="module-focus">${escapeHtml(module.focus)}</span>
      <h3>${escapeHtml(module.title)}</h3>
      <p>${escapeHtml(module.summary)}</p>
      <ol class="step-list">
        ${module.steps.map((step) => `<li>${escapeHtml(step)}</li>`).join("")}
      </ol>
    `;
  }

  function currentModules() {
    const analysis = state.lastAnalysis;
    const hasPersonalized = state.records.length >= MIN_ANALYSIS_POINTS && analysis && !analysis.stale;
    if (!hasPersonalized) return [];

    const selected = analysis.results
      .filter((result) => result.status === "confirmed" || result.status === "tentative")
      .slice(0, 4)
      .map((result) => moduleForResult(result));

    return selected.length ? dailyRotated(selected) : [];
  }

  function interventionWaitText() {
    const missing = Math.max(0, MIN_ANALYSIS_POINTS - state.records.length);
    if (missing > 0) {
      return `あと${missing}時点の記録が集まったら、ローカル探索分析の結果に基づいてマイクロ介入を表示します。`;
    }
    if (!state.lastAnalysis || state.lastAnalysis.stale) {
      return "50時点は集まっています。解析を実行すると、結果に対応する介入モジュールを表示します。";
    }
    return "今回の解析では十分に強い介入候補がありません。記録を続けて、次回の解析で再評価します。";
  }

  function moduleForResult(result) {
    const module = MODULES[result.module] || MODULES.generic;
    if (module.id !== "generic") return module;
    return {
      ...MODULES.generic,
      title: `${result.label}のミニ実験`,
      tag: result.label,
    };
  }

  function dailyRotated(modules) {
    const day = Math.floor(Date.now() / 86400000);
    const offset = day % modules.length;
    return [...modules.slice(offset), ...modules.slice(0, offset)];
  }

  function completeCurrentModule() {
    const module = currentModules()[0];
    if (!module) {
      toast("50時点の記録と解析後に介入が表示されます。");
      return;
    }
    state.completedModules[module.id] = (state.completedModules[module.id] || 0) + 1;
    persist();
    toast(`${module.title}を完了にしました。`);
  }

  function addSampleData() {
    const rng = mulberry32(hashString(`sample:${Date.now()}:${state.records.length}`));
    const items = allItems();
    const start = new Date();
    start.setDate(start.getDate() - 20);
    start.setHours(8, 30, 0, 0);
    const additions = [];

    for (let day = 0; day < 20; day += 1) {
      [9, 14, 20].forEach((hour) => {
        const timestamp = new Date(start);
        timestamp.setDate(start.getDate() + day);
        timestamp.setHours(hour, Math.floor(rng() * 50), 0, 0);

        const weekly = Math.sin((day / 7) * Math.PI * 2);
        const stress = clamp(3 + weekly * 0.7 + noise(rng, 0.9), 1, 5);
        const fusion = clamp(2.8 + stress * 0.42 + noise(rng, 0.75), 1, 5);
        const values = clamp(4.2 - stress * 0.34 + noise(rng, 0.65), 1, 5);
        const energy = clamp(3.4 - stress * 0.16 + values * 0.24 + noise(rng, 0.65), 1, 5);
        const boredom = clamp(2.7 + noise(rng, 1.05) - values * 0.12, 1, 5);
        const wellbeing = clamp(3.8 - stress * 0.34 - fusion * 0.25 + values * 0.45 + energy * 0.18 + noise(rng, 0.55), 1, 5);
        const symptom = clamp(1.7 + stress * 0.44 + fusion * 0.25 - values * 0.2 + noise(rng, 0.55), 1, 5);

        const valuesById = {
          momentary_wellbeing: roundToScale(wellbeing),
          target_problem: roundToScale(symptom),
          anxiety: roundToScale(stress),
          boredom_low_engagement: roundToScale(boredom),
          cognitive_fixation: roundToScale(fusion),
          present_moment_attention: roundToScale(clamp(5.4 - fusion + noise(rng, 0.65), 1, 5)),
          values_action: roundToScale(values),
          avoidance: roundToScale(clamp(stress * 0.5 + fusion * 0.35 + noise(rng, 0.7), 1, 5)),
          energy_body: roundToScale(energy),
          sleep_quality: roundToScale(clamp(energy + noise(rng, 0.8), 1, 5)),
          social_connection: roundToScale(clamp(values + noise(rng, 0.9), 1, 5)),
          interpersonal_stress: roundToScale(clamp(stress + noise(rng, 0.75), 1, 5)),
        };

        items.forEach((item) => {
          if (valuesById[item.id]) return;
          const lower = item.label.toLowerCase();
          if (lower.includes("睡眠") || lower.includes("sleep")) {
            valuesById[item.id] = roundToScale(clamp(energy + noise(rng, 0.8), 1, 5));
          } else if (lower.includes("関係") || lower.includes("人")) {
            valuesById[item.id] = roundToScale(clamp(stress + noise(rng, 0.7), 1, 5));
          } else {
            valuesById[item.id] = roundToScale(clamp(3 + noise(rng, 1), 1, 5));
          }
        });

        additions.push({
          id: uid("sample"),
          timestamp: timestamp.toISOString(),
          context: ["work", "home", "people", "alone"][Math.floor(rng() * 4)],
          values: valuesById,
          sample: true,
        });
      });
    }

    state.records.push(...additions);
    state.records.sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
    state.lastAnalysis = null;
    persist();
    renderAll();
    toast("サンプル60時点を追加しました。");
  }

  async function copyJsonToClipboard() {
    const payload = JSON.stringify(exportPayload(), null, 2);
    try {
      await navigator.clipboard.writeText(payload);
      toast("JSONをクリップボードにコピーしました。");
    } catch {
      downloadBlob("honshitsu-data.json", payload, "application/json");
      toast("JSONファイルを書き出しました。");
    }
  }

  function downloadData() {
    downloadBlob("honshitsu-data.json", JSON.stringify(exportPayload(), null, 2), "application/json");
  }

  function exportPayload() {
    return {
      version: 1,
      exportedAt: new Date().toISOString(),
      records: state.records,
      customItems: state.customItems,
      windows: state.windows,
      target: state.target,
    };
  }

  function importData(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      try {
        const payload = JSON.parse(String(reader.result));
        if (!Array.isArray(payload.records)) throw new Error("records missing");
        state.records = payload.records;
        state.customItems = Array.isArray(payload.customItems) ? payload.customItems : state.customItems;
        state.windows = normalizeWindows(payload.windows);
        state.target = normalizeTarget(payload.target);
        state.lastAnalysis = null;
        persist();
        renderAll();
        toast("データを読み込みました。");
      } catch {
        toast("JSONを読み込めませんでした。");
      } finally {
        event.target.value = "";
      }
    });
    reader.readAsText(file);
  }

  async function connectGoogleSheets() {
    if (!hasGoogleConfig()) {
      toast("Google設定がまだ入っていません。");
      renderGoogleSheetsStatus();
      return;
    }
    const ok = window.confirm(
      "あなたのGoogle DriveにProcess Tracker専用スプレッドシートを作成します。作成されたシートはあなたのGoogleアカウントに保存されます。続けますか？",
    );
    if (!ok) return;

    try {
      await ensureGoogleAccess({ prompt: "consent" });
      const spreadsheet = await createProcessTrackerSpreadsheet();
      state.googleSheets = {
        ...emptyGoogleSheetsState(),
        spreadsheetId: spreadsheet.result.spreadsheetId,
      };
      persist();
      renderGoogleSheetsStatus();
      toast("Google Sheets連携ができました。");
    } catch (error) {
      console.error(error);
      toast("Google Sheets連携に失敗しました。");
    }
  }

  async function syncGoogleSheets() {
    if (!hasGoogleConfig()) {
      toast("Google設定がまだ入っていません。");
      return;
    }
    if (!state.googleSheets?.spreadsheetId) {
      await connectGoogleSheets();
      if (!state.googleSheets?.spreadsheetId) return;
    }

    const records = unsyncedRecords();
    if (!records.length) {
      toast("未同期の記録はありません。");
      renderGoogleSheetsStatus();
      return;
    }

    const ok = window.confirm(
      `未同期のEMA記録${records.length}件を、あなたのGoogleスプレッドシートに送信します。送信先はあなたのGoogle Drive内のProcess Trackerシートです。続けますか？`,
    );
    if (!ok) return;

    try {
      await ensureGoogleAccess({ prompt: "" });
      await appendEmaRecords(records);
      state.googleSheets.syncedRecordIds = uniqueIds([
        ...(state.googleSheets.syncedRecordIds || []),
        ...records.map((record) => record.id),
      ]);
      state.googleSheets.lastSyncAt = new Date().toISOString();
      persist();
      renderGoogleSheetsStatus();
      toast(`${records.length}件をGoogle Sheetsへ同期しました。`);
    } catch (error) {
      console.error(error);
      toast("Google Sheets同期に失敗しました。");
    }
  }

  function unsyncedRecords() {
    const synced = new Set(state.googleSheets?.syncedRecordIds || []);
    return sortedRecords().filter((record) => record.id && !synced.has(record.id));
  }

  async function ensureGoogleAccess(options = {}) {
    await ensureGoogleClientReady();
    if (googleAccessGranted && !options.prompt) return;

    await new Promise((resolve, reject) => {
      googleTokenClient.callback = (response) => {
        if (response.error) {
          reject(new Error(response.error));
          return;
        }
        googleAccessGranted = true;
        resolve(response);
      };
      googleTokenClient.requestAccessToken({ prompt: options.prompt || "" });
    });
  }

  async function ensureGoogleClientReady() {
    if (googleClientReadyPromise) return googleClientReadyPromise;
    googleClientReadyPromise = new Promise((resolve, reject) => {
      const startedAt = Date.now();
      const waitForScripts = () => {
        if (window.gapi && window.google?.accounts?.oauth2) {
          initializeGoogleClient().then(resolve).catch(reject);
          return;
        }
        if (Date.now() - startedAt > 12000) {
          reject(new Error("Google libraries did not load."));
          return;
        }
        window.setTimeout(waitForScripts, 150);
      };
      waitForScripts();
    });
    return googleClientReadyPromise;
  }

  async function initializeGoogleClient() {
    const config = googleConfig();
    await new Promise((resolve) => window.gapi.load("client", resolve));
    await window.gapi.client.init({
      apiKey: config.apiKey,
      discoveryDocs: config.discoveryDocs,
    });
    googleTokenClient = window.google.accounts.oauth2.initTokenClient({
      client_id: config.clientId,
      scope: config.scopes,
      callback: () => {},
    });
  }

  async function createProcessTrackerSpreadsheet() {
    const spreadsheet = await window.gapi.client.sheets.spreadsheets.create({
      resource: {
        properties: { title: GOOGLE_SHEETS.title },
        sheets: [
          { properties: { title: GOOGLE_SHEETS.ema } },
          { properties: { title: GOOGLE_SHEETS.analysis } },
          { properties: { title: GOOGLE_SHEETS.modules } },
        ],
      },
    });
    await writeSheetHeaders(spreadsheet.result.spreadsheetId);
    return spreadsheet;
  }

  async function writeSheetHeaders(spreadsheetId) {
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${GOOGLE_SHEETS.ema}!A1`,
      valueInputOption: "RAW",
      resource: { values: [emaHeaderRow()] },
    });
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${GOOGLE_SHEETS.analysis}!A1`,
      valueInputOption: "RAW",
      resource: {
        values: [["synced_at", "analysis_run_at", "target", "process", "status", "direction", "importance", "threshold"]],
      },
    });
    await window.gapi.client.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${GOOGLE_SHEETS.modules}!A1`,
      valueInputOption: "RAW",
      resource: {
        values: [["synced_at", "module_id", "module_title", "completion_count"]],
      },
    });
  }

  async function appendEmaRecords(records) {
    await window.gapi.client.sheets.spreadsheets.values.append({
      spreadsheetId: state.googleSheets.spreadsheetId,
      range: `${GOOGLE_SHEETS.ema}!A1`,
      valueInputOption: "RAW",
      insertDataOption: "INSERT_ROWS",
      resource: { values: records.map(emaRecordRow) },
    });
  }

  function emaHeaderRow() {
    return [
      "record_id",
      "timestamp",
      "context",
      "sample",
      ...allItems().map((item) => item.id),
    ];
  }

  function emaRecordRow(record) {
    return [
      record.id,
      record.timestamp,
      contextLabel(record.context),
      record.sample ? "sample" : "",
      ...allItems().map((item) => recordValue(record, item.id) ?? ""),
    ];
  }

  function clearData() {
    const ok = window.confirm("記録、独自項目、解析結果を削除します。よろしいですか？");
    if (!ok) return;
    state = {
      records: [],
      customItems: [],
      windows: cloneDefaultWindows(),
      target: "momentary_wellbeing",
      lastAnalysis: null,
      completedModules: {},
      notificationEnabled: false,
      nextPromptAt: null,
      googleSheets: emptyGoogleSheetsState(),
    };
    persist();
    renderAll();
    scheduleNotificationTimer();
    toast("データを削除しました。");
  }

  async function enableNotifications() {
    if (!("Notification" in window)) {
      toast("このブラウザでは通知を使えません。");
      return;
    }
    const permission = Notification.permission === "granted" ? "granted" : await Notification.requestPermission();
    if (permission !== "granted") {
      toast("通知が許可されませんでした。");
      return;
    }
    state.notificationEnabled = true;
    state.nextPromptAt = null;
    persist();
    renderStats();
    scheduleNotificationTimer();
    toast("通知を有効化しました。");
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    const isSecureEnough =
      window.location.protocol === "https:" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost";
    if (!isSecureEnough) return;
    navigator.serviceWorker.register("./sw.js").catch(() => {
      // Offline support is optional; the app still works without the worker.
    });
  }

  function scheduleNotificationTimer() {
    window.clearTimeout(notificationTimer);
    const next = ensureNextPrompt();
    if (!state.notificationEnabled || !next || !("Notification" in window) || Notification.permission !== "granted") {
      return;
    }
    const delay = Math.max(1000, new Date(next).getTime() - Date.now());
    notificationTimer = window.setTimeout(() => {
      const notification = new Notification("30秒記録", {
        body: "いまの状態を記録する時間です。",
        tag: "process-tracker-ema",
      });
      notification.addEventListener("click", () => {
        window.focus();
        openEmaDialog();
      });
      state.nextPromptAt = null;
      persist({ quiet: true });
      renderStats();
      scheduleNotificationTimer();
    }, delay);
  }

  function ensureNextPrompt() {
    const existing = state.nextPromptAt ? new Date(state.nextPromptAt) : null;
    if (existing && existing.getTime() > Date.now()) return existing.toISOString();
    const next = computeNextPrompt();
    state.nextPromptAt = next ? next.toISOString() : null;
    persist({ quiet: true });
    return state.nextPromptAt;
  }

  function computeNextPrompt() {
    const now = new Date();
    for (let dayOffset = 0; dayOffset < 3; dayOffset += 1) {
      for (const windowConfig of state.windows) {
        const start = dateWithTime(now, windowConfig.start, dayOffset);
        const end = dateWithTime(now, windowConfig.end, dayOffset);
        if (end <= start) end.setDate(end.getDate() + 1);
        if (end.getTime() <= now.getTime()) continue;
        const floor = start.getTime() < now.getTime() ? now.getTime() + 60000 : start.getTime();
        const span = Math.max(60000, end.getTime() - floor);
        return new Date(floor + Math.random() * span);
      }
    }
    return null;
  }

  function dateWithTime(base, time, dayOffset) {
    const [hours, minutes] = time.split(":").map(Number);
    const date = new Date(base);
    date.setDate(date.getDate() + dayOffset);
    date.setHours(hours, minutes, 0, 0);
    return date;
  }

  function sortedRecords() {
    return [...state.records].sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  }

  function daySpan(records) {
    if (!records.length) return 0;
    const first = new Date(records[0].timestamp);
    const last = new Date(records.at(-1).timestamp);
    return Math.max(1, Math.ceil((last - first) / 86400000) + 1);
  }

  function inferModuleForLabel(label) {
    const normalized = String(label).toLowerCase();
    if (normalized.includes("睡眠") || normalized.includes("sleep")) return "sleep";
    if (normalized.includes("関係") || normalized.includes("人間") || normalized.includes("対人")) return "relationship";
    if (normalized.includes("不安")) return "acceptance_space";
    if (normalized.includes("退屈")) return "behavioral_activation";
    if (normalized.includes("回避") || normalized.includes("先送り")) return "graded_approach";
    if (normalized.includes("固着") || normalized.includes("反すう") || normalized.includes("思考")) return "defusion_labeling";
    if (normalized.includes("価値")) return "values_next_step";
    if (normalized.includes("活力") || normalized.includes("疲")) return "exercise_plus_reflection";
    return "generic";
  }

  function directionLabel(sign) {
    if (Math.abs(sign) < 0.04) return "方向は弱い";
    return sign > 0 ? "高いほど好調側" : "下がるほど好調側";
  }

  function statusLabel(status) {
    return {
      confirmed: "Confirmed",
      tentative: "Tentative",
      rejected: "Rejected",
    }[status];
  }

  function polarityLabel(polarity) {
    return {
      positive: "高いほど好調",
      negative: "高いほど不調",
      neutral: "中立",
    }[polarity || "neutral"];
  }

  function contextLabel(context) {
    return {
      work: "仕事・学業",
      home: "家",
      move: "移動中",
      people: "人といる",
      alone: "ひとり",
      other: "その他",
    }[context || "other"];
  }

  function formatDateTime(date) {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function formatShortDate(date) {
    return new Intl.DateTimeFormat("ja-JP", {
      month: "numeric",
      day: "numeric",
    }).format(date);
  }

  function formatTime(date) {
    return new Intl.DateTimeFormat("ja-JP", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  }

  function downloadBlob(filename, content, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  function toast(message) {
    const element = $("#toast");
    element.textContent = message;
    element.classList.add("is-visible");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => {
      element.classList.remove("is-visible");
    }, 2600);
  }

  function cssEscape(value) {
    if (window.CSS?.escape) return CSS.escape(value);
    return String(value).replace(/[^a-zA-Z0-9_-]/g, "\\$&");
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function mean(values) {
    const finite = values.filter(Number.isFinite);
    if (!finite.length) return 0;
    return finite.reduce((sum, value) => sum + value, 0) / finite.length;
  }

  function standardize(values) {
    const avg = mean(values);
    const variance = mean(values.map((value) => (value - avg) ** 2));
    const sd = Math.sqrt(variance) || 1;
    return values.map((value) => (value - avg) / sd);
  }

  function quantile(values, q) {
    if (!values.length) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const position = (sorted.length - 1) * q;
    const base = Math.floor(position);
    const rest = position - base;
    if (sorted[base + 1] == null) return sorted[base];
    return sorted[base] + rest * (sorted[base + 1] - sorted[base]);
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function round(value, digits = 2) {
    const factor = 10 ** digits;
    return Math.round(value * factor) / factor;
  }

  function roundToScale(value) {
    return clamp(Math.round(value), 1, 5);
  }

  function noise(rng, scale) {
    return (rng() + rng() + rng() - 1.5) * scale;
  }

  function uid(prefix) {
    return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  }

  function uniqueIds(ids) {
    return Array.from(new Set(ids.filter(Boolean)));
  }

  function hashString(value) {
    let hash = 1779033703 ^ value.length;
    for (let index = 0; index < value.length; index += 1) {
      hash = Math.imul(hash ^ value.charCodeAt(index), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return hash >>> 0;
  }

  function mulberry32(seed) {
    let value = seed >>> 0;
    return function next() {
      value += 0x6d2b79f5;
      let t = value;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function shuffle(array, rng) {
    const copy = [...array];
    for (let index = copy.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(rng() * (index + 1));
      [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
    }
    return copy;
  }
})();
