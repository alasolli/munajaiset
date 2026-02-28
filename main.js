(function () {
  "use strict";

  const SCREEN = Object.freeze({
    TITLE: "TITLE",
    TEST_MENU: "TEST_MENU",
    SELECT: "SELECT",
    PLAYER_SETUP: "PLAYER_SETUP",
    TOURNAMENT: "TOURNAMENT",
    GAME_SOUTU: "GAME_SOUTU",
    GAME_KIVENHEITTO: "GAME_KIVENHEITTO",
    GAME_POLKYNTYONTO: "GAME_POLKYNTYONTO",
    RESULTS: "RESULTS",
  });

  const EVENTS = ["Soutu", "Kivenheitto", "Polkyntyonto"];

  const CONTESTANTS = [
    {
      id: "pressa",
      name: "Pressa",
      stats: { speed: 5, strength: 7, accuracy: 4, stamina: 6 },
      colors: { skin: "#e2bc8a", hair: "#dd6a1f", accent: "#ffb05e", eyes: "#ffffff", shorts: "#ffffff" },
    },
    {
      id: "rippeli",
      name: "Rippeli",
      stats: { speed: 8, strength: 5, accuracy: 6, stamina: 5 },
      colors: { skin: "#dcb58a", hair: "#e7b23a", accent: "#a96a24", eyes: "#ffffff", shorts: "#ffffff" },
    },
    {
      id: "porge-arthuros",
      name: "Porge Arthuros",
      stats: { speed: 5, strength: 5, accuracy: 6, stamina: 7 },
      colors: { skin: "#dfbe95", hair: "#f3f3f3", accent: "#99d9ff", eyes: "#ffffff", shorts: "#ffffff" },
    },
    {
      id: "andil",
      name: "Andil",
      stats: { speed: 3, strength: 9, accuracy: 5, stamina: 8 },
      colors: { skin: "#d9b285", hair: "#ffffff", accent: "#9ea8ff", eyes: "#ffffff", shorts: "#ffffff" },
    },
    {
      id: "lirkki",
      name: "Lirkki",
      stats: { speed: 9, strength: 3, accuracy: 6, stamina: 4 },
      colors: { skin: "#e8c99f", hair: "#8a4cff", accent: "#72ff9a", eyes: "#ffffff", shorts: "#ffffff" },
    },
    {
      id: "tantor",
      name: "Tantor",
      stats: { speed: 4, strength: 9, accuracy: 4, stamina: 7 },
      colors: { skin: "#cda278", hair: "#4d2f1b", accent: "#ff9b7d", eyes: "#ffffff", shorts: "#ffffff" },
    },
    {
      id: "pokki",
      name: "Pokki",
      stats: { speed: 5, strength: 7, accuracy: 5, stamina: 6 },
      colors: { skin: "#d7ae82", hair: "#b1b1b1", accent: "#ffd86b", eyes: "#ffffff", shorts: "#ffffff" },
    },
    {
      id: "harpo",
      name: "Harpo",
      stats: { speed: 5, strength: 7, accuracy: 6, stamina: 5 },
      colors: { skin: "#cfa67c", hair: "#8e8e8e", accent: "#84c4ff", eyes: "#ffffff", shorts: "#ffffff" },
    },
  ];

  const SHIRT_COLORS = {
    DEFAULT: "#ffffff",
    LEADER: "#ff6b9f",
    CHAMPION: "#8fd8ff",
  };

  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  if (!canvas || !ctx) {
    throw new Error("Canvas initialization failed.");
  }

  const gameState = {
    screen: SCREEN.TITLE,
    eventIndex: 0,
    selectedContestantIds: [],
    pointer: { x: 0, y: 0, down: false },
    quickTest: {
      enabled: false,
    },
    tournament: {
      contestants: [],
      currentLeaderId: null,
      championId: null,
      lastEventWinnerId: null,
      lastResults: null,
    },
    soutu: {
      runOrder: [],
      currentRunIndex: 0,
      currentDistance: 0,
      targetDistance: 1000,
      track: null,
      speed: 0,
      elapsed: 0,
      finishedRuns: [],
      phase: "idle",
      phaseTimer: 0,
      currentContestantId: null,
      finishTime: null,
      aiTapTimer: 0,
      aiTapInterval: 0.2,
      tapFlash: 0,
    },
    kivenheitto: {
      runOrder: [],
      turnQueue: [],
      currentRunIndex: 0,
      currentAttemptNumber: 1,
      attemptsPerPlayer: 3,
      currentContestantId: null,
      phase: "idle",
      phaseTimer: 0,
      finishedRuns: [],
      startX: 220,
      throwLineX: 510,
      positionX: 220,
      speed: 0,
      power: 0,
      tapFlash: 0,
      timeSinceTap: 99,
      aiTapTimer: 0,
      aiTapInterval: 0.2,
      aiStopTargetX: 470,
      throwDistance: 0,
      throwAnimT: 0,
      isFoul: false,
    },
    polkyntyonto: {
      runOrder: [],
      currentRunIndex: 0,
      currentContestantId: null,
      currentDistance: 0,
      targetDistance: 0,
      speed: 0,
      elapsed: 0,
      finishedRuns: [],
      phase: "idle",
      phaseTimer: 0,
      track: null,
      tapFlash: 0,
      nextCornerIndex: 0,
      bumpTextTimer: 0,
      dropSpeedThreshold: 300,
      logDropped: false,
      logDropProgress: 0,
    },
    ui: {
      buttons: [],
      message: "",
    },
  };

  const renderer = {
    drawFrame,
  };

  const input = {
    handlePointerDown,
  };

  const simulation = {
    bootstrapTournamentContestants,
    syncSetupContestantsToSelection,
    updateLeader,
    update,
  };

  const audio = {
    ctx: null,
    unlocked: false,
  };

  function createTournamentContestant(baseContestant, controller) {
    return {
      id: baseContestant.id,
      name: baseContestant.name,
      stats: { ...baseContestant.stats },
      colors: { ...baseContestant.colors },
      controller,
      points: 0,
    };
  }

  function bootstrapTournamentContestants() {
    const ids = gameState.selectedContestantIds;
    const humanSet = new Set(ids.slice(0, 1));

    gameState.tournament.contestants = CONTESTANTS.filter((c) => ids.includes(c.id)).map((c) =>
      createTournamentContestant(c, humanSet.has(c.id) ? "human" : "ai")
    );
    simulation.updateLeader();
  }

  function syncSetupContestantsToSelection() {
    const selectedIds = gameState.selectedContestantIds;
    const selected = CONTESTANTS.filter((c) => selectedIds.includes(c.id));
    const existingMap = new Map(gameState.tournament.contestants.map((c) => [c.id, c]));

    gameState.tournament.contestants = selected.map((base, idx) => {
      const prev = existingMap.get(base.id);
      return {
        id: base.id,
        name: base.name,
        stats: { ...base.stats },
        colors: { ...base.colors },
        controller: prev?.controller ?? (idx === 0 ? "human" : "ai"),
        points: prev?.points ?? 0,
      };
    });

    if (!gameState.tournament.contestants.some((c) => c.controller === "human") && gameState.tournament.contestants[0]) {
      gameState.tournament.contestants[0].controller = "human";
    }
    simulation.updateLeader();
  }

  function updateLeader() {
    const rows = gameState.tournament.contestants;
    const lastWinner = gameState.tournament.lastEventWinnerId;
    if (lastWinner && rows.some((c) => c.id === lastWinner)) {
      gameState.tournament.currentLeaderId = lastWinner;
      return;
    }
    const sorted = [...rows].sort((a, b) => b.points - a.points);
    gameState.tournament.currentLeaderId = sorted[0]?.id ?? null;
  }

  function setScreen(nextScreen) {
    gameState.screen = nextScreen;
    gameState.ui.message = "";
    if (nextScreen === SCREEN.PLAYER_SETUP) {
      simulation.syncSetupContestantsToSelection();
    }
  }

  function ensureAudioContext() {
    if (audio.unlocked) {
      return;
    }
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) {
      return;
    }
    audio.ctx = new Ctx();
    audio.unlocked = true;
  }

  function playBeep(frequency, duration, gain) {
    if (!audio.ctx) {
      return;
    }
    const now = audio.ctx.currentTime;
    const osc = audio.ctx.createOscillator();
    const amp = audio.ctx.createGain();
    osc.type = "square";
    osc.frequency.value = frequency;
    amp.gain.setValueAtTime(gain, now);
    amp.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(amp);
    amp.connect(audio.ctx.destination);
    osc.start(now);
    osc.stop(now + duration);
  }

  function addButton(x, y, w, h, label, onClick, visible = true) {
    gameState.ui.buttons.push({ x, y, w, h, label, onClick, visible });
  }

  function drawFrame() {
    clearCanvas();
    gameState.ui.buttons = [];

    switch (gameState.screen) {
      case SCREEN.TITLE:
        drawTitle();
        break;
      case SCREEN.TEST_MENU:
        drawTestMenu();
        break;
      case SCREEN.SELECT:
        drawSelect();
        break;
      case SCREEN.PLAYER_SETUP:
        drawPlayerSetup();
        break;
      case SCREEN.TOURNAMENT:
        drawTournament();
        break;
      case SCREEN.GAME_SOUTU:
        drawSoutu();
        break;
      case SCREEN.GAME_KIVENHEITTO:
        drawKivenheitto();
        break;
      case SCREEN.GAME_POLKYNTYONTO:
        drawPolkyntyonto();
        break;
      case SCREEN.RESULTS:
        drawResults();
        break;
      default:
        break;
    }
  }

  function clearCanvas() {
    ctx.fillStyle = "#140f29";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function drawPanel(x, y, w, h) {
    ctx.fillStyle = "#2b2150";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#a57aff";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
  }

  function drawButton(button) {
    const hovering =
      gameState.pointer.x >= button.x &&
      gameState.pointer.x <= button.x + button.w &&
      gameState.pointer.y >= button.y &&
      gameState.pointer.y <= button.y + button.h;

    ctx.fillStyle = hovering ? "#ff6b9f" : "#4f3c8f";
    ctx.fillRect(button.x, button.y, button.w, button.h);
    ctx.strokeStyle = "#d7f1ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(button.x, button.y, button.w, button.h);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 24px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(button.label, button.x + button.w / 2, button.y + button.h / 2);
  }

  function drawTitle() {
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 72px monospace";
    ctx.textAlign = "center";
    ctx.fillText("MUNAJAISET", canvas.width / 2, 140);

    ctx.font = "22px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText("Sinäkö tuleva munamies?", canvas.width / 2, 190);

    const startBtn = { x: 340, y: 300, w: 280, h: 68, label: "ALOITA TURNAUS" };
    addButton(startBtn.x, startBtn.y, startBtn.w, startBtn.h, startBtn.label, () => {
      gameState.quickTest.enabled = false;
      setScreen(SCREEN.SELECT);
    });

    const testBtn = { x: 340, y: 388, w: 280, h: 64, label: "TESTAA LAJIA" };
    addButton(testBtn.x, testBtn.y, testBtn.w, testBtn.h, testBtn.label, () => {
      setScreen(SCREEN.TEST_MENU);
    });

    drawButtons();
  }

  function drawTestMenu() {
    drawPanel(140, 60, 680, 420);
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 40px monospace";
    ctx.textAlign = "left";
    ctx.fillText("TESTAA LAJIA", 190, 120);
    ctx.font = "18px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText("Avaa valittu laji suoraan testiin (1 ihmispelaaja).", 190, 155);

    const events = ["Soutu", "Kivenheitto", "Polkyntyonto"];
    events.forEach((eventName, idx) => {
      const y = 200 + idx * 72;
      addButton(210, y, 360, 56, eventName.toUpperCase(), () => {
        startQuickTestForEvent(eventName);
      });
    });

    if (gameState.ui.message) {
      ctx.fillStyle = "#ffd27d";
      ctx.fillText(gameState.ui.message, 190, 402);
    }

    addButton(600, 420, 170, 46, "TAKAISIN", () => {
      setScreen(SCREEN.TITLE);
    });
    drawButtons();
  }

  function drawSelect() {
    drawPanel(40, 30, 880, 480);
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 32px monospace";
    ctx.textAlign = "left";
    ctx.fillText("VALITSE KISAAJAT (1-8)", 70, 72);

    ctx.font = "16px monospace";
    CONTESTANTS.forEach((c, i) => {
      const selected = gameState.selectedContestantIds.includes(c.id);
      const col = i % 4;
      const row = Math.floor(i / 4);
      const cardX = 70 + col * 210;
      const cardY = 100 + row * 190;
      const cardW = 190;
      const cardH = 170;

      ctx.fillStyle = selected ? "#4f2f73" : "#33275e";
      ctx.fillRect(cardX, cardY, cardW, cardH);
      ctx.strokeStyle = selected ? "#ff6b9f" : "#a57aff";
      ctx.lineWidth = 3;
      ctx.strokeRect(cardX, cardY, cardW, cardH);

      drawPixelContestant(c, cardX + 60, cardY + 50, 4, {
        shirtColor: selected ? "#ffd2e4" : SHIRT_COLORS.DEFAULT,
        shortsColor: "#ffffff",
      });

      ctx.fillStyle = "#d7f1ff";
      ctx.font = "bold 14px monospace";
      ctx.fillText(c.name.toUpperCase(), cardX + 10, cardY + 125);
      ctx.font = "12px monospace";
      ctx.fillStyle = "#a3d5ff";
      ctx.fillText(
        `${selected ? "VALITTU" : "NAPAUTA VALITAKSESI"}`,
        cardX + 10,
        cardY + 148
      );

      addButton(cardX, cardY, cardW, cardH, "", () => {
        toggleContestantSelection(c.id);
      }, false);
    });

    const nextBtn = { x: 720, y: 440, w: 170, h: 50, label: "SEURAAVA" };
    addButton(nextBtn.x, nextBtn.y, nextBtn.w, nextBtn.h, nextBtn.label, () => {
      if (gameState.selectedContestantIds.length === 0) {
        gameState.ui.message = "Valitse ainakin yksi kisaaja.";
        return;
      }
      setScreen(SCREEN.PLAYER_SETUP);
    });

    if (gameState.ui.message) {
      ctx.fillStyle = "#ffd27d";
      ctx.font = "18px monospace";
      ctx.fillText(gameState.ui.message, 70, 470);
    }

    drawButtons();
  }

  function drawPlayerSetup() {
    drawPanel(80, 60, 800, 420);
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 32px monospace";
    ctx.textAlign = "left";
    ctx.fillText("PELAAJA-ASETUS", 120, 110);

    ctx.font = "19px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText("Napauta rivi: IHMINEN / TEKOALY. Vahintaan 1 ihminen.", 120, 145);

    const selected = CONTESTANTS.filter((c) => gameState.selectedContestantIds.includes(c.id));

    selected.forEach((c, i) => {
      const y = 190 + i * 34;
      const existing = gameState.tournament.contestants.find((t) => t.id === c.id);
      const controller = existing?.controller ?? (i === 0 ? "human" : "ai");

      ctx.fillStyle = "#d7f1ff";
      ctx.fillText(c.name, 130, y);
      ctx.fillStyle = controller === "human" ? "#7dffb3" : "#ffc77d";
      ctx.fillText(controller === "human" ? "IHMINEN" : "TEKOALY", 430, y);
      drawPixelContestant(c, 610, y - 16, 2, {
        shirtColor: controller === "human" ? "#7dffb3" : "#ffc77d",
        shortsColor: "#ffffff",
      });

      addButton(120, y - 22, 500, 26, "", () => {
        ensureSetupContestants();
        const row = gameState.tournament.contestants.find((t) => t.id === c.id);
        row.controller = row.controller === "human" ? "ai" : "human";
      }, false);
    });

    const backBtn = { x: 120, y: 400, w: 160, h: 56, label: "TAKAISIN" };
    const playBtn = { x: 650, y: 400, w: 190, h: 56, label: "TURNAUS" };

    addButton(backBtn.x, backBtn.y, backBtn.w, backBtn.h, backBtn.label, () => {
      setScreen(SCREEN.SELECT);
    });

    addButton(playBtn.x, playBtn.y, playBtn.w, playBtn.h, playBtn.label, () => {
      ensureSetupContestants();
      const humanCount = gameState.tournament.contestants.filter((c) => c.controller === "human").length;
      if (humanCount < 1) {
        gameState.ui.message = "Tarvitset vahintaan yhden ihmispelaajan.";
        return;
      }
      simulation.updateLeader();
      setScreen(SCREEN.TOURNAMENT);
    });

    if (gameState.ui.message) {
      ctx.fillStyle = "#ffd27d";
      ctx.fillText(gameState.ui.message, 120, 380);
    }

    drawButtons();
  }

  function drawTournament() {
    drawPanel(60, 40, 840, 460);
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 36px monospace";
    ctx.textAlign = "left";
    ctx.fillText("TURNAUS", 100, 95);

    ctx.font = "22px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Seuraava laji: ${EVENTS[gameState.eventIndex] ?? "Valmis"}`, 100, 135);

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "20px monospace";
    ctx.fillText("Tilanne", 100, 180);
    ctx.fillText("Ohjaus", 460, 180);
    ctx.fillText("Paita", 680, 180);

    const rows = [...gameState.tournament.contestants].sort((a, b) => b.points - a.points);
    rows.forEach((c, i) => {
      const y = 215 + i * 30;
      const isLeader = c.id === gameState.tournament.currentLeaderId;
      const isChampion = c.id === gameState.tournament.championId;
      const shirtColor = isChampion ? SHIRT_COLORS.CHAMPION : isLeader ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT;
      ctx.fillStyle = isLeader ? "#ff6b9f" : "#d7f1ff";
      ctx.fillText(`${i + 1}. ${c.name} (${c.points}p)`, 100, y);
      ctx.fillStyle = "#d7f1ff";
      ctx.fillText(c.controller === "human" ? "IHMINEN" : "TEKOALY", 460, y);
      drawPixelContestant(c, 690, y - 16, 2, { shirtColor, shortsColor: "#ffffff" });
      ctx.fillStyle = shirtColor;
      ctx.fillText(
        isChampion ? "VAALEANSININEN" : isLeader ? "PINKKI" : "VALKOINEN",
        740,
        y
      );
    });

    const nextEvent = EVENTS[gameState.eventIndex] ?? null;
    const btnLabel =
      nextEvent === "Soutu"
        ? "ALOITA SOUTU"
        : nextEvent === "Kivenheitto"
          ? "ALOITA KIVENHEITTO"
          : nextEvent === "Polkyntyonto"
            ? "ALOITA POLKYNTYONTO"
        : nextEvent
          ? `${nextEvent} (TULOSSA)`
          : "TURNAUS VALMIS";
    const continueBtn = { x: 620, y: 420, w: 240, h: 56, label: btnLabel };
    addButton(continueBtn.x, continueBtn.y, continueBtn.w, continueBtn.h, continueBtn.label, () => {
      if (nextEvent === "Soutu") {
        startSoutuEvent();
        return;
      }
      if (nextEvent === "Kivenheitto") {
        startKivenheittoEvent();
        return;
      }
      if (nextEvent === "Polkyntyonto") {
        startPolkyntyontoEvent();
        return;
      }
      gameState.ui.message = nextEvent
        ? "Tata lajia ei ole viela toteutettu."
        : "Turnaus on valmis.";
    });

    if (gameState.ui.message) {
      ctx.fillStyle = "#ffd27d";
      ctx.font = "18px monospace";
      ctx.fillText(gameState.ui.message, 100, 455);
    }

    drawButtons();
  }

  function toggleContestantSelection(contestantId) {
    const selected = gameState.selectedContestantIds;
    const idx = selected.indexOf(contestantId);
    if (idx >= 0) {
      selected.splice(idx, 1);
      return;
    }
    if (selected.length >= 8) {
      gameState.ui.message = "Maksimi on 8 kisaajaa.";
      return;
    }
    selected.push(contestantId);
    gameState.tournament.contestants = [];
  }

  function ensureSetupContestants() {
    if (gameState.tournament.contestants.length === 0) {
      simulation.bootstrapTournamentContestants();
      return;
    }
    simulation.syncSetupContestantsToSelection();
  }

  function getHumanContestants() {
    return gameState.tournament.contestants.filter((c) => c.controller === "human");
  }

  function getAiContestants() {
    return gameState.tournament.contestants.filter((c) => c.controller === "ai");
  }

  function setupQuickTestRoster() {
    const preferredId = gameState.selectedContestantIds[0] || "pressa";
    const preferred = CONTESTANTS.find((c) => c.id === preferredId) || CONTESTANTS[0];
    gameState.tournament.contestants = [createTournamentContestant(preferred, "human")];
    gameState.tournament.lastResults = null;
    gameState.tournament.lastEventWinnerId = null;
    simulation.updateLeader();
  }

  function startQuickTestForEvent(eventName) {
    gameState.quickTest.enabled = true;
    setupQuickTestRoster();
    if (eventName === "Soutu") {
      startSoutuEvent();
      return;
    }
    if (eventName === "Kivenheitto") {
      startKivenheittoEvent();
      return;
    }
    if (eventName === "Polkyntyonto") {
      startPolkyntyontoEvent();
      return;
    }
    setScreen(SCREEN.TEST_MENU);
    gameState.ui.message = "Lajia ei ole viela toteutettu.";
  }

  function startSoutuEvent() {
    const soutu = gameState.soutu;
    soutu.runOrder = getHumanContestants().map((c) => c.id);
    soutu.currentRunIndex = 0;
    soutu.finishedRuns = getAiContestants().map((ai) => simulateSoutuAiRun(ai));
    soutu.track = createSoutuTrack();
    soutu.phase = "intro";
    soutu.phaseTimer = 1.2;
    if (soutu.runOrder.length === 0) {
      finalizeSoutuResults();
      return;
    }
    setupCurrentSoutuRun();
    setScreen(SCREEN.GAME_SOUTU);
  }

  function simulateSoutuAiRun(contestant) {
    const base = 95 - contestant.stats.speed * 4.2 - contestant.stats.strength * 2.4 - contestant.stats.stamina * 2.8;
    const jitter = (Math.random() - 0.5) * 8;
    return {
      id: contestant.id,
      name: contestant.name,
      time: Math.max(30, base + jitter),
    };
  }

  function startKivenheittoEvent() {
    const k = gameState.kivenheitto;
    k.runOrder = getHumanContestants().map((c) => c.id);
    k.turnQueue = buildKivenTurnQueue(k.runOrder, k.attemptsPerPlayer);
    k.currentRunIndex = 0;
    k.currentAttemptNumber = 1;
    k.finishedRuns = getAiContestants().flatMap((ai) =>
      simulateKivenheittoAiAttempts(ai, k.attemptsPerPlayer)
    );
    if (k.turnQueue.length === 0) {
      finalizeKivenheittoResults();
      return;
    }
    setupCurrentKivenRun();
    setScreen(SCREEN.GAME_KIVENHEITTO);
  }

  function startPolkyntyontoEvent() {
    const p = gameState.polkyntyonto;
    p.runOrder = getHumanContestants().map((c) => c.id);
    p.currentRunIndex = 0;
    p.finishedRuns = getAiContestants().map((ai) => simulatePolkyAiRun(ai));
    p.track = createPolkyTrack();
    if (p.runOrder.length === 0) {
      finalizePolkyResults();
      return;
    }
    setupCurrentPolkyRun();
    setScreen(SCREEN.GAME_POLKYNTYONTO);
  }

  function simulatePolkyAiRun(contestant) {
    const base = 78 - contestant.stats.speed * 2.2 - contestant.stats.strength * 1.8 - contestant.stats.stamina * 2.0;
    const jitter = (Math.random() - 0.5) * 6;
    return {
      id: contestant.id,
      name: contestant.name,
      time: Math.max(26, base + jitter),
    };
  }

  function createPolkyTrack() {
    const templatePoints = [
      { x: 170, y: 340 },
      { x: 270, y: 330 },
      { x: 360, y: 260 },
      { x: 500, y: 275 },
      { x: 590, y: 210 },
      { x: 730, y: 245 },
      { x: 800, y: 185 },
      { x: 700, y: 240 },
      { x: 560, y: 310 },
      { x: 420, y: 320 },
      { x: 300, y: 280 },
      { x: 210, y: 245 },
      { x: 130, y: 255 },
    ];
    const points = templatePoints.map((p, i) => {
      if (i === 0 || i === templatePoints.length - 1) {
        return { ...p };
      }
      const jitterX = (Math.random() - 0.5) * 36;
      const jitterY = (Math.random() - 0.5) * 42;
      return {
        x: p.x + jitterX,
        y: p.y + jitterY,
      };
    });
    const segmentLengths = [];
    const cumulative = [0];
    for (let i = 1; i < points.length; i += 1) {
      const len = distance2d(points[i - 1].x, points[i - 1].y, points[i].x, points[i].y);
      segmentLengths.push(len);
      cumulative.push(cumulative[i - 1] + len);
    }
    const corners = [];
    for (let i = 1; i < points.length - 1; i += 1) {
      const a0 = Math.atan2(points[i].y - points[i - 1].y, points[i].x - points[i - 1].x);
      const a1 = Math.atan2(points[i + 1].y - points[i].y, points[i + 1].x - points[i].x);
      let diff = Math.abs(a1 - a0);
      if (diff > Math.PI) {
        diff = Math.PI * 2 - diff;
      }
      const severity = Math.max(0, Math.min(1, diff / Math.PI));
      // Loiva mutka sallii enemman vauhtia, jyrkka vaatii hitaamman tulon.
      const jitter = (Math.random() - 0.5) * 36;
      const maxSpeed = Math.max(230, Math.min(370, 355 - severity * 125 + jitter));
      corners.push({ distance: cumulative[i], maxSpeed, severity });
    }
    return {
      points,
      segmentLengths,
      cumulative,
      corners,
      finishLineX: 150,
      totalLength: cumulative[cumulative.length - 1],
    };
  }

  function getPolkyPose(distance) {
    const p = gameState.polkyntyonto;
    const track = p.track;
    if (!track) {
      return { x: 170, y: 340, angle: 0 };
    }
    const d = Math.max(0, Math.min(distance, track.totalLength));
    let seg = 0;
    while (seg < track.segmentLengths.length - 1 && d > track.cumulative[seg + 1]) {
      seg += 1;
    }
    const segStart = track.cumulative[seg];
    const segLen = track.segmentLengths[seg] || 1;
    const t = Math.max(0, Math.min(1, (d - segStart) / segLen));
    const p0 = track.points[seg];
    const p1 = track.points[seg + 1];
    return {
      x: p0.x + (p1.x - p0.x) * t,
      y: p0.y + (p1.y - p0.y) * t,
      angle: Math.atan2(p1.y - p0.y, p1.x - p0.x),
    };
  }

  function setupCurrentPolkyRun() {
    const p = gameState.polkyntyonto;
    const contestantId = p.runOrder[p.currentRunIndex];
    const contestant = gameState.tournament.contestants.find((c) => c.id === contestantId);
    if (!contestant) {
      return;
    }
    p.currentContestantId = contestant.id;
    p.currentDistance = 0;
    p.targetDistance = p.track ? p.track.totalLength : 1000;
    p.speed = 0;
    p.elapsed = 0;
    p.phase = "intro";
    p.phaseTimer = 1.0;
    p.tapFlash = 0;
    p.nextCornerIndex = 0;
    p.bumpTextTimer = 0;
    p.logDropped = false;
    p.logDropProgress = 0;
  }

  function buildKivenTurnQueue(humanIds, attemptsPerPlayer) {
    const queue = [];
    for (let attempt = 1; attempt <= attemptsPerPlayer; attempt += 1) {
      humanIds.forEach((id) => {
        queue.push({ id, attempt });
      });
    }
    return queue;
  }

  function simulateKivenheittoAiAttempts(contestant, attemptsPerPlayer) {
    const attempts = [];
    for (let attempt = 1; attempt <= attemptsPerPlayer; attempt += 1) {
      attempts.push(simulateKivenheittoAiRun(contestant, attempt));
    }
    return attempts;
  }

  function simulateKivenheittoAiRun(contestant, attempt) {
    const foulChance = Math.max(0.03, 0.09 - contestant.stats.accuracy * 0.006);
    const foul = Math.random() < foulChance;
    if (foul) {
      return {
        id: contestant.id,
        name: contestant.name,
        attempt,
        distance: 0,
        foul: true,
      };
    }
    const distance =
      2.4 +
      contestant.stats.strength * 0.36 +
      contestant.stats.speed * 0.05 +
      contestant.stats.accuracy * 0.24 +
      (Math.random() - 0.5) * 1.2;
    return {
      id: contestant.id,
      name: contestant.name,
      attempt,
      distance: Math.max(2.5, Math.min(10.2, distance)),
      foul: false,
    };
  }

  function setupCurrentSoutuRun() {
    const soutu = gameState.soutu;
    const contestantId = soutu.runOrder[soutu.currentRunIndex];
    const contestant = gameState.tournament.contestants.find((c) => c.id === contestantId);
    if (!contestant) {
      return;
    }
    soutu.currentContestantId = contestant.id;
    soutu.currentDistance = 0;
    soutu.targetDistance = soutu.track ? soutu.track.totalLength : 1000;
    soutu.speed = 0;
    soutu.elapsed = 0;
    soutu.finishTime = null;
    soutu.aiTapTimer = 0;
    soutu.tapFlash = 0;
    soutu.phase = "intro";
    soutu.phaseTimer = 1.1;
    soutu.aiTapInterval = Math.max(0.14, 0.42 - contestant.stats.speed * 0.02);
  }

  function createSoutuTrack() {
    const start = { x: 190, y: 330 };
    const buoy = { x: 720, y: 240 };
    const turnRadius = 52;
    const approach = { x: buoy.x - turnRadius, y: 250 };
    const finishLineX = start.x;
    const postFinishEnd = { x: 70, y: 250 };
    const startToApproach = distance2d(start.x, start.y, approach.x, approach.y);
    const turnLength = Math.PI * 2 * turnRadius;
    const returnLength = distance2d(approach.x, approach.y, postFinishEnd.x, postFinishEnd.y);
    const finishT = Math.max(0, Math.min(1, (approach.x - finishLineX) / (approach.x - postFinishEnd.x)));
    const finishDistance = startToApproach + turnLength + returnLength * finishT;
    return {
      start,
      buoy,
      approach,
      finishLineX,
      postFinishEnd,
      turnRadius,
      startToApproach,
      turnLength,
      returnLength,
      finishDistance,
      totalLength: startToApproach + turnLength + returnLength,
    };
  }

  function distance2d(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
  }

  function getSoutuBoatPose() {
    const soutu = gameState.soutu;
    const track = soutu.track;
    if (!track) {
      return { x: 190, y: 330, angle: 0, stage: "meno" };
    }

    const d = Math.max(0, Math.min(soutu.currentDistance, track.totalLength));
    if (d <= track.startToApproach) {
      const t = d / track.startToApproach;
      const x = track.start.x + (track.approach.x - track.start.x) * t;
      const y = track.start.y + (track.approach.y - track.start.y) * t;
      const angle = Math.atan2(track.approach.y - track.start.y, track.approach.x - track.start.x);
      return { x, y, angle, stage: "meno" };
    }

    const dAfterApproach = d - track.startToApproach;
    if (dAfterApproach <= track.turnLength) {
      const circleT = dAfterApproach / track.turnLength;
      const angleAround = Math.PI - circleT * (Math.PI * 2);
      const x = track.buoy.x + Math.cos(angleAround) * track.turnRadius;
      const y = track.buoy.y + Math.sin(angleAround) * track.turnRadius;
      const tangentAngle = angleAround - Math.PI / 2;
      return { x, y, angle: tangentAngle, stage: "kierto" };
    }

    const dReturn = dAfterApproach - track.turnLength;
    const t = Math.min(1, dReturn / track.returnLength);
    const x = track.approach.x + (track.postFinishEnd.x - track.approach.x) * t;
    const y = track.approach.y + (track.postFinishEnd.y - track.approach.y) * t;
    const angle = Math.atan2(track.postFinishEnd.y - track.approach.y, track.postFinishEnd.x - track.approach.x);
    return { x, y, angle, stage: x <= track.finishLineX ? "maalin-jalkeen" : "paluu" };
  }

  function getCurrentSoutuContestant() {
    return gameState.tournament.contestants.find((c) => c.id === gameState.soutu.currentContestantId) || null;
  }

  function getCurrentKivenContestant() {
    return gameState.tournament.contestants.find((c) => c.id === gameState.kivenheitto.currentContestantId) || null;
  }

  function isCurrentSoutuHuman() {
    const current = getCurrentSoutuContestant();
    return !!current && current.controller === "human";
  }

  function onSoutuTap() {
    if (gameState.screen !== SCREEN.GAME_SOUTU || gameState.soutu.phase !== "running") {
      return;
    }
    if (!isCurrentSoutuHuman()) {
      return;
    }
    const current = getCurrentSoutuContestant();
    const speedBoost = 14 + current.stats.speed * 2.2 + current.stats.strength * 1.1;
    gameState.soutu.speed += speedBoost;
    gameState.soutu.tapFlash = 0.14;
    playBeep(660 + current.stats.speed * 8, 0.04, 0.03);
  }

  function onKivenheittoTap() {
    const k = gameState.kivenheitto;
    if (gameState.screen !== SCREEN.GAME_KIVENHEITTO || k.phase !== "running") {
      return;
    }
    const current = getCurrentKivenContestant();
    if (!current || current.controller !== "human") {
      return;
    }
    applyKivenTapImpulse(current, 1);
  }

  function onPolkyTap() {
    const p = gameState.polkyntyonto;
    if (gameState.screen !== SCREEN.GAME_POLKYNTYONTO || p.phase !== "running") {
      return;
    }
    const current = gameState.tournament.contestants.find((c) => c.id === p.currentContestantId);
    if (!current || current.controller !== "human") {
      return;
    }
    const push = 13 + current.stats.speed * 1.7 + current.stats.strength * 1.0;
    p.speed += push;
    p.tapFlash = 0.12;
    playBeep(560 + current.stats.strength * 8, 0.03, 0.025);
  }

  function applyKivenTapImpulse(contestant, multiplier) {
    const k = gameState.kivenheitto;
    const baseImpulse = 15 + contestant.stats.strength * 1.8 + contestant.stats.speed * 0.9;
    const powerGain = 3.0 + contestant.stats.strength * 0.55 + contestant.stats.stamina * 0.25;
    k.speed += baseImpulse * multiplier;
    k.power += powerGain * multiplier;
    k.timeSinceTap = 0;
    k.tapFlash = 0.1;
    playBeep(500 + contestant.stats.strength * 18, 0.025, 0.022);
  }

  function setupCurrentKivenRun() {
    const k = gameState.kivenheitto;
    const turn = k.turnQueue[k.currentRunIndex];
    const contestantId = turn?.id;
    const contestant = gameState.tournament.contestants.find((c) => c.id === contestantId);
    if (!contestant) {
      return;
    }
    k.currentAttemptNumber = turn.attempt;
    k.currentContestantId = contestant.id;
    k.phase = "intro";
    k.phaseTimer = 1.0;
    k.positionX = k.startX;
    k.speed = 0;
    k.power = 0;
    k.tapFlash = 0;
    k.timeSinceTap = 99;
    k.aiTapTimer = 0;
    k.aiTapInterval = Math.max(0.11, 0.28 - contestant.stats.speed * 0.014);
    const stopVariance = (Math.random() - 0.5) * 50;
    const baseStop = k.throwLineX - (34 - contestant.stats.accuracy * 2.2);
    k.aiStopTargetX = Math.min(k.throwLineX - 8, Math.max(k.startX + 125, baseStop + stopVariance));
    k.throwDistance = 0;
    k.throwAnimT = 0;
    k.isFoul = false;
  }

  function update(deltaSeconds) {
    if (gameState.screen === SCREEN.GAME_SOUTU) {
      updateSoutu(deltaSeconds);
      return;
    }
    if (gameState.screen === SCREEN.GAME_KIVENHEITTO) {
      updateKivenheitto(deltaSeconds);
      return;
    }
    if (gameState.screen === SCREEN.GAME_POLKYNTYONTO) {
      updatePolkyntyonto(deltaSeconds);
    }
  }

  function updateSoutu(deltaSeconds) {
    const soutu = gameState.soutu;
    const current = getCurrentSoutuContestant();
    if (!current) {
      return;
    }

    if (soutu.tapFlash > 0) {
      soutu.tapFlash -= deltaSeconds;
    }

    if (soutu.phase === "intro") {
      soutu.phaseTimer -= deltaSeconds;
      if (soutu.phaseTimer <= 0) {
        soutu.phase = "running";
      }
      return;
    }

    if (soutu.phase === "running") {
      if (current.controller === "ai") {
        soutu.aiTapTimer += deltaSeconds;
        if (soutu.aiTapTimer >= soutu.aiTapInterval) {
          const jitter = (Math.random() - 0.5) * 8;
          const speedBoost = 12 + current.stats.speed * 2 + current.stats.strength * 1 + jitter;
          soutu.speed += Math.max(6, speedBoost);
          soutu.aiTapTimer = 0;
          soutu.tapFlash = 0.07;
          playBeep(420 + current.stats.speed * 10, 0.02, 0.02);
        }
      }

      const drag = (76 + (10 - current.stats.stamina) * 7) * deltaSeconds;
      soutu.speed = Math.max(0, soutu.speed - drag);
      const meterPerSecond = soutu.speed * 0.10;
      const previousDistance = soutu.currentDistance;
      soutu.currentDistance += meterPerSecond * deltaSeconds;
      soutu.elapsed += deltaSeconds;

      const finishDistance = soutu.track?.finishDistance ?? soutu.targetDistance;
      if (previousDistance < finishDistance && soutu.currentDistance >= finishDistance) {
        soutu.finishTime = soutu.elapsed;
        soutu.finishedRuns.push({ id: current.id, name: current.name, time: soutu.finishTime });
        playBeep(920, 0.09, 0.05);
        soutu.phase = "finishGlide";
        soutu.phaseTimer = 0.9;
      }

      if (soutu.currentDistance >= soutu.targetDistance) {
        soutu.currentDistance = soutu.targetDistance;
      }
      return;
    }

    if (soutu.phase === "finishGlide") {
      const drag = (90 + (10 - current.stats.stamina) * 5) * deltaSeconds;
      soutu.speed = Math.max(0, soutu.speed - drag);
      const meterPerSecond = soutu.speed * 0.08;
      soutu.currentDistance = Math.min(soutu.targetDistance, soutu.currentDistance + meterPerSecond * deltaSeconds);
      soutu.phaseTimer -= deltaSeconds;
      if (soutu.phaseTimer <= 0) {
        soutu.phase = "betweenRuns";
        soutu.phaseTimer = 1.0;
      }
      return;
    }

    if (soutu.phase === "betweenRuns") {
      soutu.phaseTimer -= deltaSeconds;
      if (soutu.phaseTimer > 0) {
        return;
      }
      soutu.currentRunIndex += 1;
      if (soutu.currentRunIndex >= soutu.runOrder.length) {
        finalizeSoutuResults();
      } else {
        setupCurrentSoutuRun();
      }
    }
  }

  function finalizeSoutuResults() {
    const ranked = [...gameState.soutu.finishedRuns].sort((a, b) => a.time - b.time);
    const pointsByRank = [3, 2, 1];

    ranked.forEach((entry, idx) => {
      const points = pointsByRank[idx] ?? 0;
      const contestant = gameState.tournament.contestants.find((c) => c.id === entry.id);
      if (contestant) {
        contestant.points += points;
      }
      entry.rank = idx + 1;
      entry.pointsAwarded = points;
      entry.totalPoints = contestant ? contestant.points : points;
    });

    gameState.tournament.lastEventWinnerId = ranked[0]?.id ?? null;
    gameState.tournament.lastResults = {
      eventName: "Soutu",
      metricLabel: "Kierrosaika",
      rows: ranked,
    };
    simulation.updateLeader();
    setScreen(SCREEN.RESULTS);
  }

  function updateKivenheitto(deltaSeconds) {
    const k = gameState.kivenheitto;
    const current = getCurrentKivenContestant();
    if (!current) {
      return;
    }

    if (k.tapFlash > 0) {
      k.tapFlash -= deltaSeconds;
    }

    if (k.phase === "intro") {
      k.phaseTimer -= deltaSeconds;
      if (k.phaseTimer <= 0) {
        k.phase = "running";
        k.timeSinceTap = 99;
      }
      return;
    }

    if (k.phase === "running") {
      if (current.controller === "ai" && k.positionX < k.aiStopTargetX) {
        k.aiTapTimer += deltaSeconds;
        if (k.aiTapTimer >= k.aiTapInterval) {
          k.aiTapTimer = 0;
          applyKivenTapImpulse(current, 0.92 + Math.random() * 0.18);
        }
      }

      k.timeSinceTap += deltaSeconds;
      k.speed = Math.max(0, k.speed - (165 + (10 - current.stats.stamina) * 8) * deltaSeconds);
      k.power = Math.max(0, k.power - 8 * deltaSeconds);
      k.positionX += k.speed * deltaSeconds * 0.28;

      if (k.positionX >= k.throwLineX) {
        k.positionX = k.throwLineX;
        k.isFoul = true;
        k.throwDistance = 0;
        k.phase = "throwing";
        k.phaseTimer = 0.9;
        k.throwAnimT = 0;
        playBeep(170, 0.14, 0.05);
        return;
      }

      if (k.timeSinceTap > 0.32 && k.power > 3.5) {
        const proximityBonus = Math.max(0, 1 - Math.abs(k.throwLineX - k.positionX) / 85);
        const rawDistance =
          1.8 +
          Math.min(6.2, k.power * 0.18) +
          current.stats.strength * 0.20 +
          current.stats.accuracy * 0.16 +
          proximityBonus * 1.9 +
          (Math.random() - 0.5) * 1.2;
        k.throwDistance = Math.max(2.2, Math.min(10.8, rawDistance));
        k.phase = "throwing";
        k.phaseTimer = 1.0;
        k.throwAnimT = 0;
        playBeep(860, 0.06, 0.05);
      }
      return;
    }

    if (k.phase === "throwing") {
      k.phaseTimer -= deltaSeconds;
      k.throwAnimT = Math.min(1, k.throwAnimT + deltaSeconds * 1.4);
      if (k.phaseTimer <= 0) {
        k.finishedRuns.push({
          id: current.id,
          name: current.name,
          attempt: k.currentAttemptNumber,
          distance: k.throwDistance,
          foul: k.isFoul,
        });
        k.phase = "betweenRuns";
        k.phaseTimer = 1.0;
      }
      return;
    }

    if (k.phase === "betweenRuns") {
      k.phaseTimer -= deltaSeconds;
      if (k.phaseTimer > 0) {
        return;
      }
      k.currentRunIndex += 1;
      if (k.currentRunIndex >= k.turnQueue.length) {
        finalizeKivenheittoResults();
      } else {
        setupCurrentKivenRun();
      }
    }
  }

  function finalizeKivenheittoResults() {
    const attempts = gameState.kivenheitto.finishedRuns;
    const ranked = gameState.tournament.contestants.map((contestant) => {
      const ownAttempts = attempts.filter((a) => a.id === contestant.id);
      let best = -1;
      ownAttempts.forEach((a) => {
        if (!a.foul && a.distance > best) {
          best = a.distance;
        }
      });
      return {
        id: contestant.id,
        name: contestant.name,
        foul: best < 0,
        distance: best < 0 ? 0 : best,
        metricText: best < 0 ? "HYL." : `${best.toFixed(1)} m`,
      };
    });
    ranked.sort((a, b) => b.distance - a.distance);
    const pointsByRank = [3, 2, 1];

    ranked.forEach((entry, idx) => {
      const points = pointsByRank[idx] ?? 0;
      const contestant = gameState.tournament.contestants.find((c) => c.id === entry.id);
      if (contestant) {
        contestant.points += points;
      }
      entry.rank = idx + 1;
      entry.pointsAwarded = points;
      entry.totalPoints = contestant ? contestant.points : points;
    });

    gameState.tournament.lastEventWinnerId = ranked[0]?.id ?? null;
    gameState.tournament.lastResults = {
      eventName: "Kivenheitto",
      metricLabel: "Pituus",
      rows: ranked,
    };
    simulation.updateLeader();
    setScreen(SCREEN.RESULTS);
  }

  function updatePolkyntyonto(deltaSeconds) {
    const p = gameState.polkyntyonto;
    const current = gameState.tournament.contestants.find((c) => c.id === p.currentContestantId);
    if (!current) {
      return;
    }

    if (p.tapFlash > 0) {
      p.tapFlash -= deltaSeconds;
    }
    if (p.bumpTextTimer > 0) {
      p.bumpTextTimer -= deltaSeconds;
    }

    if (p.phase === "intro") {
      p.phaseTimer -= deltaSeconds;
      if (p.phaseTimer <= 0) {
        p.phase = "running";
      }
      return;
    }

    if (p.phase === "recovering") {
      p.phaseTimer -= deltaSeconds;
      p.logDropProgress = Math.min(1, p.logDropProgress + deltaSeconds * 2.4);
      if (p.phaseTimer <= 0) {
        p.phase = "running";
        p.logDropped = false;
        p.logDropProgress = 0;
      }
      return;
    }

    if (p.phase === "running") {
      const drag = (82 + (10 - current.stats.stamina) * 6) * deltaSeconds;
      p.speed = Math.max(0, p.speed - drag);
      p.currentDistance += p.speed * 0.16 * deltaSeconds;
      p.elapsed += deltaSeconds;

      while (p.track?.corners[p.nextCornerIndex] && p.currentDistance >= p.track.corners[p.nextCornerIndex].distance) {
        const corner = p.track.corners[p.nextCornerIndex];
        if (p.speed > (corner.maxSpeed ?? p.dropSpeedThreshold)) {
          p.currentDistance = corner.distance;
          p.speed = 0;
          p.phase = "recovering";
          p.phaseTimer = 1.2;
          p.bumpTextTimer = 1.0;
          p.logDropped = true;
          p.logDropProgress = 0;
          p.nextCornerIndex += 1;
          playBeep(190, 0.16, 0.05);
          return;
        }
        p.nextCornerIndex += 1;
      }

      if (p.currentDistance >= p.targetDistance) {
        p.currentDistance = p.targetDistance;
        p.finishedRuns.push({ id: current.id, name: current.name, time: p.elapsed });
        p.phase = "betweenRuns";
        p.phaseTimer = 1.0;
        playBeep(930, 0.08, 0.05);
      }
      return;
    }

    if (p.phase === "betweenRuns") {
      p.phaseTimer -= deltaSeconds;
      if (p.phaseTimer > 0) {
        return;
      }
      p.currentRunIndex += 1;
      if (p.currentRunIndex >= p.runOrder.length) {
        finalizePolkyResults();
      } else {
        setupCurrentPolkyRun();
      }
    }
  }

  function finalizePolkyResults() {
    const ranked = [...gameState.polkyntyonto.finishedRuns].sort((a, b) => a.time - b.time);
    const pointsByRank = [3, 2, 1];
    ranked.forEach((entry, idx) => {
      const points = pointsByRank[idx] ?? 0;
      const contestant = gameState.tournament.contestants.find((c) => c.id === entry.id);
      if (contestant) {
        contestant.points += points;
      }
      entry.rank = idx + 1;
      entry.pointsAwarded = points;
      entry.totalPoints = contestant ? contestant.points : points;
    });
    gameState.tournament.lastEventWinnerId = ranked[0]?.id ?? null;
    gameState.tournament.lastResults = {
      eventName: "Polkyntyonto",
      metricLabel: "Aika",
      rows: ranked,
    };
    simulation.updateLeader();
    setScreen(SCREEN.RESULTS);
  }

  function drawSoutu() {
    drawPanel(60, 40, 840, 460);
    const soutu = gameState.soutu;
    const current = getCurrentSoutuContestant();
    if (!current) {
      return;
    }

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "left";
    ctx.fillText("SOUTU", 100, 92);

    ctx.font = "20px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Vuoro ${soutu.currentRunIndex + 1}/${soutu.runOrder.length}: ${current.name}`, 100, 128);
    ctx.fillText(`Ohjaus: ${current.controller === "human" ? "IHMINEN" : "TEKOALY"}`, 100, 156);
    drawPixelContestant(current, 765, 80, 4, {
      shirtColor: current.id === gameState.tournament.currentLeaderId ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT,
      shortsColor: "#ffffff",
    });

    const track = soutu.track;
    const pose = getSoutuBoatPose();
    drawSoutuScene(track, pose, current);

    const progress = Math.max(0, Math.min(1, soutu.currentDistance / soutu.targetDistance));

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "18px monospace";
    ctx.fillText(`Matka: ${(progress * 100).toFixed(0)} %`, 100, 415);
    ctx.fillText(`Kierrosaika: ${(soutu.finishTime ?? soutu.elapsed).toFixed(2)} s`, 280, 415);
    ctx.fillText(`Nopeus: ${Math.round(soutu.speed)}`, 440, 415);

    let stageText = "Meno poijulle";
    if (pose.stage === "kierto") {
      stageText = "Kierretaan poijua";
    } else if (pose.stage === "paluu") {
      stageText = "Paluu laiturin ylapuolelta";
    } else if (pose.stage === "maalin-jalkeen") {
      stageText = "Maali ylitetty";
    }
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Vaihe: ${stageText}`, 620, 415);

    if (soutu.phase === "intro") {
      ctx.fillStyle = "#ffd27d";
      ctx.fillText("Valmistaudu...", 100, 445);
    } else if (current.controller === "human") {
      ctx.fillStyle = "#7dffb3";
      ctx.fillText("NAPUTA NOPEASTI! VENE ETENEE.", 100, 445);
    } else {
      ctx.fillStyle = "#ffc77d";
      ctx.fillText("Tekoaly soutaa...", 100, 445);
    }
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText("Ajanotto paattyy maaliviivan ylitykseen laiturin kohdalla.", 100, 468);
  }

  function drawKivenheitto() {
    drawPanel(60, 40, 840, 460);
    const k = gameState.kivenheitto;
    const current = getCurrentKivenContestant();
    if (!current) {
      return;
    }

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "left";
    ctx.fillText("KIVENHEITTO", 100, 92);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Vuoro ${k.currentRunIndex + 1}/${k.turnQueue.length}: ${current.name}`, 100, 128);
    ctx.fillText(`Ohjaus: ${current.controller === "human" ? "IHMINEN" : "TEKOALY"}`, 100, 156);
    ctx.fillText(`Yritys: ${k.currentAttemptNumber}/${k.attemptsPerPlayer}`, 360, 156);

    drawKivenheittoScene(current);

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "18px monospace";
    ctx.fillText(`Voima: ${Math.round(k.power)}`, 100, 415);
    ctx.fillText(`Nopeus: ${Math.round(k.speed)}`, 250, 415);
    ctx.fillText(`Sijainti: ${(k.positionX - k.startX).toFixed(0)} px`, 410, 415);

    if (k.phase === "intro") {
      ctx.fillStyle = "#ffd27d";
      ctx.fillText("Valmistaudu...", 100, 445);
    } else if (k.phase === "running") {
      if (current.controller === "human") {
        ctx.fillStyle = "#7dffb3";
        ctx.fillText("HAKKAA! LOPETA ENNEN HEITTOVIIVAA.", 100, 445);
      } else {
        ctx.fillStyle = "#ffc77d";
        ctx.fillText("Tekoaly rakentaa heittoa...", 100, 445);
      }
    } else if (k.phase === "throwing") {
      ctx.fillStyle = k.isFoul ? "#ff8f8f" : "#7dffb3";
      ctx.fillText(k.isFoul ? "HYLATTY: VIIVA YLITETTY!" : `Heitto: ${k.throwDistance.toFixed(1)} m`, 100, 445);
      if (k.isFoul) {
        drawYliastuttuBanner();
      }
    } else {
      ctx.fillStyle = "#a3d5ff";
      ctx.fillText("Seuraava kisaaja...", 100, 445);
    }
  }

  function drawPolkyntyonto() {
    drawPanel(60, 40, 840, 460);
    const p = gameState.polkyntyonto;
    const current = gameState.tournament.contestants.find((c) => c.id === p.currentContestantId);
    if (!current) {
      return;
    }
    const pose = getPolkyPose(p.currentDistance);

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "left";
    ctx.fillText("POLKYNTYONTO", 100, 92);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Vuoro ${p.currentRunIndex + 1}/${p.runOrder.length}: ${current.name}`, 100, 128);
    ctx.fillText(`Ohjaus: ${current.controller === "human" ? "IHMINEN" : "TEKOALY"}`, 100, 156);

    drawPolkyScene(pose, current);

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "18px monospace";
    ctx.fillText(`Aika: ${p.elapsed.toFixed(2)} s`, 100, 415);
    ctx.fillText(`Nopeus: ${Math.round(p.speed)}`, 280, 415);
    ctx.fillText(`Matka: ${Math.round((p.currentDistance / p.targetDistance) * 100)} %`, 450, 415);

    if (p.phase === "intro") {
      ctx.fillStyle = "#ffd27d";
      ctx.fillText("Valmistaudu tyontoon...", 100, 445);
    } else if (p.phase === "recovering") {
      ctx.fillStyle = "#ffb4b4";
      ctx.fillText("POLKKY PUTOI! NOSTETAAN UUDESTAAN...", 100, 445);
    } else {
      ctx.fillStyle = "#7dffb3";
      ctx.fillText("HAKKAA NOPEASTI! HALLITSE VAUHTI MUTKISSA.", 100, 445);
    }
    if (p.bumpTextTimer > 0) {
      ctx.fillStyle = "#ff6666";
      ctx.font = "bold 44px monospace";
      ctx.fillText("POLKKY PUTOI!", 260, 260);
    }
  }

  function drawYliastuttuBanner() {
    const w = 520;
    const h = 92;
    const x = (canvas.width - w) / 2;
    const y = 245;
    ctx.fillStyle = "#9f1f1f";
    ctx.fillRect(x, y, w, h);
    ctx.strokeStyle = "#ffd6d6";
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.font = "bold 56px monospace";
    ctx.fillText("YLIASTUTTU", canvas.width / 2, y + 62);
    ctx.textAlign = "left";
  }

  function drawKivenheittoScene(contestant) {
    const k = gameState.kivenheitto;
    const field = { x: 90, y: 185, w: 790, h: 190 };

    ctx.fillStyle = "#355f35";
    ctx.fillRect(field.x, field.y, field.w, field.h);
    for (let i = 0; i < 11; i += 1) {
      ctx.strokeStyle = i % 2 === 0 ? "#406d40" : "#447344";
      ctx.beginPath();
      ctx.moveTo(field.x, field.y + 10 + i * 16);
      ctx.lineTo(field.x + field.w, field.y + 10 + i * 16);
      ctx.stroke();
    }

    ctx.fillStyle = "#6d5a48";
    ctx.fillRect(field.x, 250, field.w, 70);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(k.throwLineX, 220);
    ctx.lineTo(k.throwLineX, 350);
    ctx.stroke();
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "14px monospace";
    ctx.fillText("HEITTOVIIVA", k.throwLineX - 45, 365);

    const y = 302;
    drawPixelContestant(contestant, k.positionX - 16, y - 52, 3, {
      shirtColor: contestant.id === gameState.tournament.currentLeaderId ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT,
      shortsColor: "#ffffff",
    });

    const stoneX = k.positionX + 12;
    const stoneY = y - 34;
    drawRoundedTriangle(stoneX, stoneY, 13, k.tapFlash > 0 ? "#b8c2d5" : "#8f9ab4");

    if (k.phase === "throwing" && !k.isFoul) {
      const t = k.throwAnimT;
      const fx0 = stoneX;
      const fy0 = stoneY;
      const landingX = Math.min(field.x + field.w - 12, k.throwLineX + k.throwDistance * 28);
      const fx = fx0 + t * (landingX - fx0);
      const fy = fy0 - Math.sin(t * Math.PI) * 58;
      drawRoundedTriangle(fx, fy, 10, "#d7e0f5");
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${k.throwDistance.toFixed(1)} m`, Math.min(field.x + field.w - 70, fx + 12), fy - 10);
    }

    ctx.fillStyle = "#cfe2ff";
    ctx.font = "12px monospace";
    const markers = [3, 5, 8, 10];
    markers.forEach((m) => {
      const mx = Math.min(field.x + field.w - 10, k.throwLineX + m * 28);
      ctx.fillRect(mx, 318, 2, 24);
      ctx.fillText(`${m}m`, mx - 8, 356);
    });
  }

  function drawRoundedTriangle(cx, cy, r, color) {
    const p1 = { x: cx, y: cy - r };
    const p2 = { x: cx + r * 0.88, y: cy + r * 0.58 };
    const p3 = { x: cx - r * 0.88, y: cy + r * 0.58 };
    const round = Math.max(2, r * 0.28);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y + round);
    ctx.quadraticCurveTo(p1.x, p1.y, p1.x + round, p1.y + round * 0.2);
    ctx.lineTo(p2.x - round * 0.75, p2.y - round * 0.35);
    ctx.quadraticCurveTo(p2.x, p2.y, p2.x - round * 0.7, p2.y - round * 1.0);
    ctx.lineTo(p3.x + round * 0.7, p3.y - round * 1.0);
    ctx.quadraticCurveTo(p3.x, p3.y, p3.x + round * 0.75, p3.y - round * 0.35);
    ctx.closePath();
    ctx.fill();
  }

  function drawSoutuScene(track, pose, contestant) {
    if (!track) {
      return;
    }

    const lake = { x: 100, y: 180, w: 740, h: 210 };
    ctx.fillStyle = "#1f3e74";
    ctx.fillRect(lake.x, lake.y, lake.w, lake.h);
    ctx.strokeStyle = "#88b7ff";
    ctx.lineWidth = 3;
    ctx.strokeRect(lake.x, lake.y, lake.w, lake.h);

    for (let i = 0; i < 9; i += 1) {
      const waveY = lake.y + 20 + i * 22;
      ctx.strokeStyle = i % 2 === 0 ? "#2f5d9a" : "#3467aa";
      ctx.beginPath();
      ctx.moveTo(lake.x + 10, waveY);
      ctx.lineTo(lake.x + lake.w - 10, waveY);
      ctx.stroke();
    }

    ctx.fillStyle = "#7f6650";
    ctx.fillRect(105, 280, 85, 78);
    ctx.fillStyle = "#5f4a37";
    ctx.fillRect(85, 312, 20, 20);
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "14px monospace";
    ctx.fillText("LAITURI", 92, 375);

    ctx.strokeStyle = "#ffcf66";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(track.finishLineX, 206);
    ctx.lineTo(track.finishLineX, 356);
    ctx.stroke();
    ctx.fillStyle = "#ffcf66";
    ctx.fillText("MAALI", track.finishLineX - 24, 198);

    ctx.fillStyle = "#d24545";
    ctx.beginPath();
    ctx.arc(track.buoy.x, track.buoy.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd7d7";
    ctx.fillRect(track.buoy.x - 3, track.buoy.y - 21, 6, 7);
    ctx.fillStyle = "#d7f1ff";
    ctx.fillText("POIJU", track.buoy.x - 20, track.buoy.y + 34);

    drawBoatWake(pose);
    drawBoat(pose, contestant);
  }

  function drawBoatWake(pose) {
    const speed = gameState.soutu.speed;
    if (speed < 6) {
      return;
    }
    const backX = pose.x - Math.cos(pose.angle) * 18;
    const backY = pose.y - Math.sin(pose.angle) * 18;
    const sideX = Math.cos(pose.angle + Math.PI / 2);
    const sideY = Math.sin(pose.angle + Math.PI / 2);
    ctx.strokeStyle = "rgba(210,240,255,0.75)";
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i += 1) {
      const fade = i * 7;
      ctx.beginPath();
      ctx.moveTo(backX + sideX * (5 + i) - Math.cos(pose.angle) * fade, backY + sideY * (5 + i) - Math.sin(pose.angle) * fade);
      ctx.lineTo(backX + sideX * (14 + i) - Math.cos(pose.angle) * (fade + 8), backY + sideY * (14 + i) - Math.sin(pose.angle) * (fade + 8));
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(backX - sideX * (5 + i) - Math.cos(pose.angle) * fade, backY - sideY * (5 + i) - Math.sin(pose.angle) * fade);
      ctx.lineTo(backX - sideX * (14 + i) - Math.cos(pose.angle) * (fade + 8), backY - sideY * (14 + i) - Math.sin(pose.angle) * (fade + 8));
      ctx.stroke();
    }
  }

  function drawPolkyScene(pose, contestant) {
    const p = gameState.polkyntyonto;
    const field = { x: 90, y: 180, w: 790, h: 210 };
    ctx.fillStyle = "#2d5631";
    ctx.fillRect(field.x, field.y, field.w, field.h);
    ctx.fillStyle = "#5e5e63";
    ctx.fillRect(field.x, 180, field.w, 78);
    ctx.fillStyle = "#254628";
    ctx.fillRect(field.x, 258, field.w, 132);

    const track = p.track;
    if (track) {
      ctx.strokeStyle = "#8f7652";
      ctx.lineWidth = 18;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.beginPath();
      ctx.moveTo(track.points[0].x, track.points[0].y);
      for (let i = 1; i < track.points.length; i += 1) {
        ctx.lineTo(track.points[i].x, track.points[i].y);
      }
      ctx.stroke();
      ctx.strokeStyle = "#b79a70";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(track.points[0].x, track.points[0].y);
      for (let i = 1; i < track.points.length; i += 1) {
        ctx.lineTo(track.points[i].x, track.points[i].y);
      }
      ctx.stroke();

      ctx.strokeStyle = "#ffcf66";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(track.finishLineX, 222);
      ctx.lineTo(track.finishLineX, 360);
      ctx.stroke();
      ctx.fillStyle = "#ffcf66";
      ctx.font = "14px monospace";
      ctx.fillText("MAALI", track.finishLineX - 22, 215);
    }

    ctx.save();
    ctx.translate(pose.x, pose.y);
    ctx.rotate(pose.angle);
    ctx.fillStyle = "#d7c84a";
    ctx.fillRect(-16, -8, 24, 14);
    ctx.fillStyle = "#4a4a4f";
    ctx.beginPath();
    ctx.arc(-14, 8, 6, 0, Math.PI * 2);
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d7f1ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(8, -4);
    ctx.lineTo(22, -11);
    ctx.stroke();
    if (!p.logDropped) {
      ctx.fillStyle = "#7b4c2a";
      ctx.fillRect(-18, -19, 28, 10);
    }
    ctx.restore();

    if (p.logDropped) {
      const t = p.logDropProgress;
      const startX = pose.x - Math.cos(pose.angle) * 4;
      const startY = pose.y - 18;
      const endX = pose.x - 26;
      const endY = pose.y + 20;
      const lx = startX + (endX - startX) * t;
      const ly = startY + (endY - startY) * t + Math.sin(t * Math.PI) * 8;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate(pose.angle * (1 - t) - t * 0.7);
      ctx.fillStyle = "#6b3f20";
      ctx.fillRect(-17, -5, 34, 10);
      ctx.restore();
    }

    drawPixelContestant(contestant, pose.x - 30, pose.y - 56, 3, {
      shirtColor: contestant.id === gameState.tournament.currentLeaderId ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT,
      shortsColor: "#ffffff",
    });
  }

  function drawBoat(pose, contestant) {
    const x = pose.x;
    const y = pose.y;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(pose.angle);

    ctx.fillStyle = "#6d4228";
    ctx.fillRect(-22, -6, 44, 12);
    ctx.fillStyle = "#8a5a3c";
    ctx.fillRect(-18, -4, 36, 8);

    const shirtColor =
      contestant.id === gameState.tournament.currentLeaderId ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT;
    ctx.fillStyle = shirtColor;
    ctx.fillRect(-4, -11, 8, 6);
    ctx.fillStyle = contestant.colors.skin;
    ctx.fillRect(-3, -15, 6, 4);

    const oarOffset = gameState.soutu.tapFlash > 0 ? 10 : 6;
    ctx.strokeStyle = "#d9bf8b";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-7, -2);
    ctx.lineTo(-20, -oarOffset);
    ctx.moveTo(7, 2);
    ctx.lineTo(20, oarOffset);
    ctx.stroke();

    ctx.restore();
  }

  function drawResults() {
    drawPanel(80, 50, 800, 440);
    const results = gameState.tournament.lastResults;
    if (!results) {
      return;
    }

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`${results.eventName.toUpperCase()} - TULOKSET`, 120, 100);

    ctx.font = "19px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText("Sija", 120, 145);
    ctx.fillText("Nimi", 200, 145);
    ctx.fillText(results.metricLabel || "Tulos", 450, 145);
    ctx.fillText("+P", 600, 145);
    ctx.fillText("Yht.", 690, 145);

    results.rows.forEach((row, i) => {
      const y = 180 + i * 34;
      const isWinner = i === 0;
      ctx.fillStyle = isWinner ? "#ff6b9f" : "#d7f1ff";
      ctx.fillText(String(row.rank), 120, y);
      ctx.fillText(row.name, 200, y);
      ctx.fillText(getResultMetricText(row), 450, y);
      ctx.fillText(String(row.pointsAwarded), 600, y);
      ctx.fillText(String(row.totalPoints), 690, y);
    });

    const continueBtn = { x: 590, y: 410, w: 250, h: 56, label: "JATKA TURNAUKSEEN" };
    if (gameState.quickTest.enabled) {
      continueBtn.label = "TAKAISIN TESTIIN";
    }
    addButton(continueBtn.x, continueBtn.y, continueBtn.w, continueBtn.h, continueBtn.label, () => {
      if (gameState.quickTest.enabled) {
        setScreen(SCREEN.TEST_MENU);
        return;
      }
      gameState.eventIndex += 1;
      setScreen(SCREEN.TOURNAMENT);
    });
    drawButtons();
  }

  function getResultMetricText(row) {
    if (typeof row.metricText === "string") {
      return row.metricText;
    }
    if (typeof row.time === "number") {
      return `${row.time.toFixed(2)} s`;
    }
    if (typeof row.distance === "number") {
      return `${row.distance.toFixed(1)} m`;
    }
    return "-";
  }

  function drawPixelContestant(contestant, x, y, scale, style) {
    const shirtColor = style?.shirtColor ?? SHIRT_COLORS.DEFAULT;
    const shortsColor = style?.shortsColor ?? "#ffffff";
    const p = contestant.colors;

    const px = (dx, dy, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + dx * scale, y + dy * scale, w * scale, h * scale);
    };

    px(0, 2, 8, 2, p.hair);
    px(1, 4, 6, 4, p.skin);
    px(2, 5, 1, 1, p.eyes);
    px(5, 5, 1, 1, p.eyes);
    px(0, 8, 8, 5, shirtColor);
    px(0, 13, 8, 3, shortsColor);
    px(-1, 9, 1, 3, p.accent);
    px(8, 9, 1, 3, p.accent);
    px(1, 16, 2, 3, p.skin);
    px(5, 16, 2, 3, p.skin);
  }

  function drawButtons() {
    gameState.ui.buttons.forEach((button) => {
      if (button.visible) {
        drawButton(button);
      }
    });
  }

  function handlePointerDown(event) {
    ensureAudioContext();
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;
    gameState.pointer.x = x;
    gameState.pointer.y = y;
    gameState.pointer.down = true;

    const hit = gameState.ui.buttons.find(
      (btn) => x >= btn.x && x <= btn.x + btn.w && y >= btn.y && y <= btn.y + btn.h
    );
    if (hit && typeof hit.onClick === "function") {
      hit.onClick();
      return;
    }
    onSoutuTap();
    onKivenheittoTap();
    onPolkyTap();
  }

  function handlePointerMove(event) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    gameState.pointer.x = (event.clientX - rect.left) * scaleX;
    gameState.pointer.y = (event.clientY - rect.top) * scaleY;
  }

  function handlePointerUp() {
    gameState.pointer.down = false;
  }

  canvas.addEventListener("pointerdown", input.handlePointerDown);
  canvas.addEventListener("pointermove", handlePointerMove);
  window.addEventListener("pointerup", handlePointerUp);

  let lastFrameTime = performance.now();

  function loop(now) {
    const deltaSeconds = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;
    simulation.update(deltaSeconds);
    renderer.drawFrame();
    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
})();
