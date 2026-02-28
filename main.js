(function () {
  "use strict";

  const SCREEN = Object.freeze({
    TITLE: "TITLE",
    TEST_INTRO: "TEST_INTRO",
    TEST_MENU: "TEST_MENU",
    SELECT: "SELECT",
    PLAYER_SETUP: "PLAYER_SETUP",
    TOURNAMENT: "TOURNAMENT",
    GAME_SOUTU: "GAME_SOUTU",
    GAME_KIVENHEITTO: "GAME_KIVENHEITTO",
    GAME_KEVYTHEITTO: "GAME_KEVYTHEITTO",
    GAME_POLKYNTYONTO: "GAME_POLKYNTYONTO",
    GAME_PASKANTYONTO: "GAME_PASKANTYONTO",
    GAME_TRIATHLON: "GAME_TRIATHLON",
    RESULTS: "RESULTS",
    FINAL: "FINAL",
  });

  const EVENTS = ["Soutu", "Kivenheitto", "Polkyntyonto", "Kevyen esineen heitto", "Paskan työntö", "Triathlon"];

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
      name: "Porge",
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
      sunglassesCheererId: null,
      shoutTimer: 0,
      shoutText: "",
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
      throwLineX: 305,
      positionX: 220,
      speed: 0,
      power: 0,
      tapFlash: 0,
      timeSinceTap: 99,
      aiTapTimer: 0,
      aiTapInterval: 0.2,
      aiStopTargetX: 280,
      throwDistance: 0,
      throwAnimT: 0,
      isFoul: false,
      sunglassesCheererId: null,
      cheerPositions: [],
    },
    kevytheitto: {
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
      throwLineX: 305,
      positionX: 220,
      speed: 0,
      power: 0,
      tapFlash: 0,
      timeSinceTap: 99,
      aiTapTimer: 0,
      aiTapInterval: 0.2,
      aiStopTargetX: 280,
      throwDistance: 0,
      throwAnimT: 0,
      isFoul: false,
      sunglassesCheererId: null,
      cheerPositions: [],
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
      sunglassesCheererId: null,
      shoutTimer: 0,
      shoutText: "",
    },
    paskantyonto: {
      runOrder: [],
      currentRunIndex: 0,
      currentContestantId: null,
      currentDistance: 0,
      targetDistance: 5,
      speed: 0,
      elapsed: 0,
      finishedRuns: [],
      phase: "idle",
      phaseTimer: 0,
      tapFlash: 0,
      sunglassesCheererId: null,
      shoutTimer: 0,
      shoutText: "",
      tapAccumulator: 0,
      step: 0,
    },
    triathlon: {
      runOrder: [],
      currentRunIndex: 0,
      currentContestantId: null,
      phase: "starterCall",
      phaseTimer: 0,
      canLevel: 1,
      beerDrainBudget: 0,
      runDistance: 0,
      runTargetDistance: 140,
      runSpeed: 0,
      spinAngle: 0,
      spinCount: 0,
      spinTarget: 10,
      dartGauge: 0,
      dartGaugeDir: 1,
      dartScore: null,
      dartAttemptIndex: 0,
      dartTotalScore: 0,
      dartScores: [],
      dartCount: 5,
      dartBetweenTimer: 0,
      totalTime: 0,
      elapsed: 0,
      tapFlash: 0,
      sunglassesCheererId: null,
      shoutTimer: 0,
      shoutText: "",
      track: null,
      finishedRuns: [],
    },
    ui: {
      buttons: [],
      message: "",
    },
    testIntroUntil: 0,
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
    musicGain: null,
    musicPlaying: false,
    musicTimeouts: [],
  };

  // Ladattu MIDI-melodia (hurtti.mid). Jos ei lataudu, ei soiteta mitään.
  let selectMusicNotes = [];

  const assets = {
    titleBgImage: new Image(),
    titleBgLoaded: false,
  };
  assets.titleBgImage.onload = () => {
    assets.titleBgLoaded = true;
  };
  assets.titleBgImage.src = "./munat.jpg";

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
    const selectedHumanId = gameState.selectedContestantIds[0] || CONTESTANTS[0].id;
    gameState.tournament.contestants = CONTESTANTS.map((c) =>
      createTournamentContestant(c, c.id === selectedHumanId ? "human" : "ai")
    );
    simulation.updateLeader();
  }

  function syncSetupContestantsToSelection() {
    const selectedHumanId = gameState.selectedContestantIds[0] || CONTESTANTS[0].id;
    const existingMap = new Map(gameState.tournament.contestants.map((c) => [c.id, c]));

    gameState.tournament.contestants = CONTESTANTS.map((base) => {
      const prev = existingMap.get(base.id);
      return {
        id: base.id,
        name: base.name,
        stats: { ...base.stats },
        colors: { ...base.colors },
        controller: base.id === selectedHumanId ? "human" : "ai",
        points: prev?.points ?? 0,
      };
    });
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
    if (gameState.screen === SCREEN.SELECT && nextScreen !== SCREEN.SELECT) {
      stopSelectMusic();
    }
    if (nextScreen === SCREEN.TEST_INTRO) {
      gameState.testIntroUntil = Date.now() + 3000;
    }
    gameState.screen = nextScreen;
    gameState.ui.message = "";
    if (nextScreen === SCREEN.PLAYER_SETUP) {
      simulation.syncSetupContestantsToSelection();
    }
    if (nextScreen === SCREEN.SELECT) {
      startSelectMusic();
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

  function playC64Note(frequency, duration, startTime, masterGain) {
    if (!audio.ctx || !masterGain) {
      return;
    }
    const osc = audio.ctx.createOscillator();
    const amp = audio.ctx.createGain();
    osc.type = "square";
    osc.frequency.value = frequency;
    const t0 = startTime;
    const attack = 0.012;
    const decay = 0.04;
    const sustain = 0.08;
    amp.gain.setValueAtTime(0, t0);
    amp.gain.linearRampToValueAtTime(0.2, t0 + attack);
    amp.gain.linearRampToValueAtTime(sustain, t0 + attack + decay);
    amp.gain.setValueAtTime(sustain, t0 + Math.max(attack + decay, duration - 0.02));
    amp.gain.linearRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(amp);
    amp.connect(masterGain);
    osc.start(t0);
    osc.stop(t0 + duration);
  }

  function readMidVLQ(data, offset) {
    let v = 0;
    let shift = 0;
    let i = offset;
    for (;;) {
      const b = data[i];
      i += 1;
      v = (v << 7) | (b & 0x7f);
      if ((b & 0x80) === 0) {
        return { value: v, next: i };
      }
      shift += 7;
      if (shift >= 28) {
        return { value: 0, next: i };
      }
    }
  }

  function parseMidToNotes(arrayBuffer) {
    const data = new Uint8Array(arrayBuffer);
    const view = new DataView(arrayBuffer);
    if (data.length < 14 || String.fromCharCode(data[0], data[1], data[2], data[3]) !== "MThd") {
      return [];
    }
    const headerLen = view.getUint32(4, false);
    const format = view.getUint16(8, false);
    const numTracks = view.getUint16(10, false);
    let division = view.getUint16(12, false);
    if (division & 0x8000) {
      return [];
    }
    const ticksPerQuarter = division & 0x7fff;
    let globalTempoUsec = 500000;
    const allNotes = [];
    let pos = 14 + (headerLen > 6 ? headerLen - 6 : 0);
    for (let tr = 0; tr < numTracks && pos + 8 <= data.length; tr++) {
      if (String.fromCharCode(data[pos], data[pos + 1], data[pos + 2], data[pos + 3]) !== "MTrk") {
        break;
      }
      const trackEnd = pos + 8 + view.getUint32(pos + 4, false);
      pos += 8;
      let tick = 0;
      let status = 0;
      const trackNotes = [];
      const openNotes = {};
      while (pos < trackEnd) {
        const vlq = readMidVLQ(data, pos);
        pos = vlq.next;
        tick += vlq.value;
        if (pos >= trackEnd) break;
        let b = data[pos];
        if (b >= 0x80) {
          status = b;
          pos += 1;
        }
        if (pos >= trackEnd) break;
        if (status === 0xff) {
          const metaType = data[pos];
          pos += 1;
          const metaLen = data[pos];
          pos += 1;
          if (metaType === 0x51 && metaLen === 3 && pos + 3 <= trackEnd) {
            globalTempoUsec = (data[pos] << 16) | (data[pos + 1] << 8) | data[pos + 2];
          }
          pos += metaLen;
          continue;
        }
        if (status === 0xf0 || status === 0xf7) {
          const len = data[pos];
          pos += 1 + len;
          continue;
        }
        const cmd = status >>> 4;
        const ch = status & 0x0f;
        if (cmd === 0x9) {
          const note = data[pos];
          const vel = data[pos + 1];
          pos += 2;
          if (vel > 0) {
            openNotes[note] = tick;
          } else {
            if (openNotes[note] != null) {
              trackNotes.push({ note, start: openNotes[note], end: tick });
              delete openNotes[note];
            }
          }
          continue;
        }
        if (cmd === 0x8) {
          const note = data[pos];
          pos += 2;
          if (openNotes[note] != null) {
            trackNotes.push({ note, start: openNotes[note], end: tick });
            delete openNotes[note];
          }
          continue;
        }
        if (cmd === 0xa || cmd === 0xb || cmd === 0xe) {
          pos += 2;
          continue;
        }
        if (cmd === 0xc || cmd === 0xd) {
          pos += 1;
          continue;
        }
        pos += 1;
      }
      if (trackNotes.length > 0) {
        allNotes.push({ trackNotes, ticksPerQuarter });
      }
    }
    if (allNotes.length === 0) {
      return [];
    }
    let best = allNotes[0];
    allNotes.forEach((t) => {
      if (t.trackNotes.length > best.trackNotes.length) best = t;
    });
    const tpq = best.ticksPerQuarter;
    const tempo = globalTempoUsec;
    const secPerTick = (tempo / 1e6) / tpq;
    const out = [];
    best.trackNotes.forEach((n) => {
      const startSec = n.start * secPerTick;
      const duration = Math.max(0.02, (n.end - n.start) * secPerTick);
      const freq = 440 * Math.pow(2, (n.note - 69) / 12);
      out.push({ f: freq, d: duration, t: startSec });
    });
    out.sort((a, b) => a.t - b.t);
    let lastEnd = 0;
    const result = [];
    out.forEach((n) => {
      const gap = n.t - lastEnd;
      if (gap > 0.02) {
        result.push({ r: true, d: gap });
      }
      result.push({ f: n.f, d: n.d });
      lastEnd = n.t + n.d;
    });
    return result;
  }

  function loadSelectMusicMidi(onLoaded) {
    if (selectMusicNotes.length > 0) {
      return;
    }
    if (typeof location !== "undefined" && location.protocol === "file:") {
      return;
    }
    fetch("./hurtti.mid")
      .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error("not found"))))
      .then((buf) => {
        const notes = parseMidToNotes(buf);
        if (notes.length > 0) {
          selectMusicNotes = notes;
          if (onLoaded) onLoaded();
        }
      })
      .catch(() => {});
  }

  function startSelectMusic() {
    ensureAudioContext();
    if (!audio.ctx) {
      return;
    }
    if (typeof audio.ctx.resume === "function") {
      audio.ctx.resume().catch(() => {});
    }
    loadSelectMusicMidi(() => {
      if (gameState.screen !== SCREEN.SELECT) return;
      startSelectMusic();
    });
    if (selectMusicNotes.length === 0) {
      return;
    }
    stopSelectMusic();
    audio.musicPlaying = true;
    audio.musicGain = audio.ctx.createGain();
    audio.musicGain.gain.value = 0.35;
    audio.musicGain.connect(audio.ctx.destination);

    let time = audio.ctx.currentTime + 0.15;

    function scheduleLoop() {
      if (!audio.musicPlaying || !audio.musicGain) {
        return;
      }
      time = Math.max(time, audio.ctx.currentTime + 0.02);
      const loopStart = time;
      selectMusicNotes.forEach((n) => {
        if (n.r) {
          time += n.d;
          return;
        }
        playC64Note(n.f, n.d, time, audio.musicGain);
        time += n.d;
      });
      const id = setTimeout(scheduleLoop, Math.max(100, (time - loopStart) * 1000 - 50));
      audio.musicTimeouts.push(id);
    }
    scheduleLoop();
  }

  function stopSelectMusic() {
    audio.musicPlaying = false;
    audio.musicTimeouts.forEach(clearTimeout);
    audio.musicTimeouts.length = 0;
    if (audio.ctx && audio.musicGain) {
      const now = audio.ctx.currentTime;
      audio.musicGain.gain.setValueAtTime(audio.musicGain.gain.value, now);
      audio.musicGain.gain.linearRampToValueAtTime(0.0001, now + 0.12);
    }
    audio.musicGain = null;
  }

  function addButton(x, y, w, h, label, onClick, visible = true) {
    gameState.ui.buttons.push({ x, y, w, h, label, onClick, visible });
  }

  function drawFrame() {
    clearCanvas();
    gameState.ui.buttons = [];

    addFullscreenButton();

    switch (gameState.screen) {
      case SCREEN.TITLE:
        drawTitle();
        break;
      case SCREEN.TEST_INTRO:
        drawTestIntro();
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
      case SCREEN.GAME_KEVYTHEITTO:
        drawKevytheitto();
        break;
      case SCREEN.GAME_POLKYNTYONTO:
        drawPolkyntyonto();
        break;
      case SCREEN.GAME_PASKANTYONTO:
        drawPaskantyonto();
        break;
      case SCREEN.GAME_TRIATHLON:
        drawTriathlon();
        break;
      case SCREEN.RESULTS:
        drawResults();
        break;
      case SCREEN.FINAL:
        drawFinal();
        break;
      default:
        break;
    }
  }

  function clearCanvas() {
    ctx.fillStyle = "#140f29";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  function tryLockLandscape() {
    if (typeof screen === "undefined" || !screen.orientation || !screen.orientation.lock) {
      return;
    }
    screen.orientation.lock("landscape").catch(() => {
      // iOS Safari and some browsers do not allow lock.
    });
  }

  function isFullscreenActive() {
    return !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.msFullscreenElement
    );
  }

  function canUseFullscreen() {
    const ua = navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod/.test(ua);
    if (isIOS) {
      return false;
    }
    const root = document.documentElement;
    return !!(
      root.requestFullscreen ||
      root.webkitRequestFullscreen ||
      root.msRequestFullscreen
    );
  }

  function toggleFullscreen() {
    if (!canUseFullscreen()) {
      return;
    }
    const root = document.documentElement;
    if (!isFullscreenActive()) {
      const request =
        root.requestFullscreen ||
        root.webkitRequestFullscreen ||
        root.msRequestFullscreen;
      if (request) {
        request.call(root);
      }
      tryLockLandscape();
      return;
    }

    const exit =
      document.exitFullscreen ||
      document.webkitExitFullscreen ||
      document.msExitFullscreen;
    if (exit) {
      exit.call(document);
    }
  }

  function addFullscreenButton() {
    if (!canUseFullscreen()) {
      return;
    }
    const label = isFullscreenActive() ? "POISTU FS" : "FULLSCREEN";
    addButton(canvas.width - 176, 16, 160, 44, label, () => {
      toggleFullscreen();
    });
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
    if (assets.titleBgLoaded) {
      drawImageCover(assets.titleBgImage, 0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "rgba(20, 15, 41, 0.45)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.fillStyle = "#f0f8ff";
    ctx.font = "bold 72px monospace";
    ctx.textAlign = "center";
    ctx.fillText("MUNAJAISET", canvas.width / 2, 140);

    ctx.font = "22px monospace";
    ctx.fillStyle = "#c8e4ff";
    ctx.fillText("Sinäkö tuleva munamies?", canvas.width / 2, 190);

    ctx.font = "16px monospace";
    ctx.fillStyle = "#b8d8f0";
    ctx.fillText("Pelin beta-versio", canvas.width / 2, 218);

    const startBtn = { x: 340, y: 300, w: 280, h: 68, label: "ALOITA MUNAJAISET" };
    addButton(startBtn.x, startBtn.y, startBtn.w, startBtn.h, startBtn.label, () => {
      gameState.quickTest.enabled = false;
      setScreen(SCREEN.SELECT);
    });

    const testBtn = { x: 340, y: 388, w: 280, h: 64, label: "HARJOITTLE" };
    addButton(testBtn.x, testBtn.y, testBtn.w, testBtn.h, testBtn.label, () => {
      setScreen(SCREEN.TEST_INTRO);
    });

    drawButtons();
  }

  function drawTestIntro() {
    ctx.fillStyle = "#c03030";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 180px monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("-1", canvas.width / 2, canvas.height / 2);
    ctx.textAlign = "left";
    addButton(0, 0, canvas.width, canvas.height, "", () => {
      setScreen(SCREEN.TEST_MENU);
    }, false);
    drawButtons();
  }

  function drawImageCover(img, x, y, w, h) {
    const scale = Math.max(w / img.width, h / img.height);
    const drawW = img.width * scale;
    const drawH = img.height * scale;
    const offsetX = x + (w - drawW) / 2;
    const offsetY = y + (h - drawH) / 2;
    ctx.drawImage(img, offsetX, offsetY, drawW, drawH);
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

    const events = ["Soutu", "Kivenheitto", "Polkyntyonto", "Kevyen esineen heitto", "Paskan työntö", "Triathlon"];
    events.forEach((eventName, idx) => {
      const y = 186 + idx * 52;
      addButton(210, y, 360, 48, eventName.toUpperCase(), () => {
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
    ctx.fillText("VALITSE OMA KISAAJA", 70, 72);

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

    const nextBtn = { x: 640, y: 458, w: 250, h: 50, label: "ALOITA MUNAJAISET" };
    addButton(nextBtn.x, nextBtn.y, nextBtn.w, nextBtn.h, nextBtn.label, () => {
      if (gameState.selectedContestantIds.length === 0) {
        gameState.ui.message = "Valitse oma kisaajasi.";
        return;
      }
      simulation.bootstrapTournamentContestants();
      setScreen(SCREEN.TOURNAMENT);
    });

    if (gameState.ui.message) {
      ctx.fillStyle = "#ffd27d";
      ctx.font = "18px monospace";
      ctx.fillText(gameState.ui.message, 70, 448);
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
    const playBtn = { x: 650, y: 400, w: 190, h: 56, label: "MUNAJAISET" };

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
    ctx.fillText("MUNAJAISET", 100, 95);

    ctx.font = "22px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Seuraava laji: ${EVENTS[gameState.eventIndex] ?? "Valmis"}`, 100, 135);

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "20px monospace";
    ctx.fillText("Tilanne", 100, 180);

    const rows = [...gameState.tournament.contestants].sort((a, b) => b.points - a.points);
    rows.forEach((c, i) => {
      const y = 215 + i * 30;
      const isLeader = c.id === gameState.tournament.currentLeaderId;
      const isChampion = c.id === gameState.tournament.championId;
      const isHuman = c.controller === "human";
      const shirtColor = isChampion ? SHIRT_COLORS.CHAMPION : isLeader ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT;
      ctx.fillStyle = isHuman ? "#7dffb3" : isLeader ? "#ff6b9f" : "#d7f1ff";
      const label = `${i + 1}. ${c.name} (${c.points}p)`;
      ctx.fillText(label, 100, y);
      drawPixelContestant(c, 650, y - 16, 2, { shirtColor, shortsColor: "#ffffff" });
    });

    const nextEvent = EVENTS[gameState.eventIndex] ?? null;
    const btnLabel =
      nextEvent === "Soutu"
        ? "ALOITA SOUTU"
        : nextEvent === "Kivenheitto"
          ? "ALOITA KIVENHEITTO"
          : nextEvent === "Polkyntyonto"
            ? "ALOITA POLKYNTYONTO"
            : nextEvent === "Kevyen esineen heitto"
              ? "ALOITA KEVYTHEITTO"
            : nextEvent === "Paskan työntö"
              ? "ALOITA PASKAN TYONTO"
            : nextEvent === "Triathlon"
              ? "ALOITA TRIATHLON"
        : nextEvent
          ? `${nextEvent} (TULOSSA)`
          : "MUNAJAISET OHI";
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
      if (nextEvent === "Kevyen esineen heitto") {
        startKevytheittoEvent();
        return;
      }
      if (nextEvent === "Paskan työntö") {
        startPaskantyontoEvent();
        return;
      }
      if (nextEvent === "Triathlon") {
        startTriathlonEvent();
        return;
      }
      gameState.ui.message = nextEvent
        ? "Tata lajia ei ole viela toteutettu."
        : "Munajaiset ovat ohi.";
    });

    if (gameState.ui.message) {
      ctx.fillStyle = "#ffd27d";
      ctx.font = "18px monospace";
      ctx.fillText(gameState.ui.message, 100, 455);
    }

    drawButtons();
  }

  function toggleContestantSelection(contestantId) {
    const current = gameState.selectedContestantIds[0];
    if (current === contestantId) {
      gameState.selectedContestantIds = [];
      return;
    }
    gameState.selectedContestantIds = [contestantId];
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
    gameState.tournament.contestants = CONTESTANTS.map((c) =>
      createTournamentContestant(c, c.id === preferredId ? "human" : "ai")
    );
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
    if (eventName === "Kevyen esineen heitto") {
      startKevytheittoEvent();
      return;
    }
    if (eventName === "Paskan työntö") {
      startPaskantyontoEvent();
      return;
    }
    if (eventName === "Triathlon") {
      startTriathlonEvent();
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
    const base =
      23 -
      contestant.stats.speed * 0.45 -
      contestant.stats.strength * 0.35 -
      contestant.stats.stamina * 0.4;
    const jitter = (Math.random() - 0.5) * 2.4;
    return {
      id: contestant.id,
      name: contestant.name,
      time: Math.max(13, Math.min(20, base + jitter)),
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

  function startKevytheittoEvent() {
    const k = gameState.kevytheitto;
    k.runOrder = getHumanContestants().map((c) => c.id);
    k.turnQueue = buildKivenTurnQueue(k.runOrder, k.attemptsPerPlayer);
    k.currentRunIndex = 0;
    k.currentAttemptNumber = 1;
    k.finishedRuns = getAiContestants().flatMap((ai) =>
      simulateKevytheittoAiAttempts(ai, k.attemptsPerPlayer)
    );
    if (k.turnQueue.length === 0) {
      finalizeKevytheittoResults();
      return;
    }
    setupCurrentKevytRun();
    setScreen(SCREEN.GAME_KEVYTHEITTO);
  }

  function startPaskantyontoEvent() {
    const p = gameState.paskantyonto;
    p.runOrder = getHumanContestants().map((c) => c.id);
    p.currentRunIndex = 0;
    p.finishedRuns = getAiContestants().map((ai) => simulatePaskantyontoAiRun(ai));
    if (p.runOrder.length === 0) {
      finalizePaskantyontoResults();
      return;
    }
    setupCurrentPaskantyontoRun();
    setScreen(SCREEN.GAME_PASKANTYONTO);
  }

  function simulatePaskantyontoAiRun(contestant) {
    const { speed, strength, stamina } = contestant.stats;
    const base = 20 - (speed * 0.5 + strength * 0.5 + stamina * 0.4);
    const jitter = (Math.random() - 0.5) * 2;
    const time = Math.max(8, Math.min(20, base + jitter));
    return {
      id: contestant.id,
      name: contestant.name,
      time,
    };
  }

  function simulatePolkyAiRun(contestant) {
    const base =
      82 -
      contestant.stats.speed * 1.8 -
      contestant.stats.strength * 1.2 -
      contestant.stats.stamina * 1.6 -
      contestant.stats.accuracy * 0.3;
    const jitter = (Math.random() - 0.5) * 6;
    return {
      id: contestant.id,
      name: contestant.name,
      time: Math.max(32, base + jitter),
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
      return { x: 170, y: 340, angle: 0, headingRight: true };
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
    const headingRight = p1.x >= p0.x;
    return {
      x: p0.x + (p1.x - p0.x) * t,
      y: p0.y + (p1.y - p0.y) * t,
      angle: Math.atan2(p1.y - p0.y, p1.x - p0.x),
      headingRight,
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
    p.phase = "starterCall";
    p.phaseTimer = 0;
    p.tapFlash = 0;
    p.nextCornerIndex = 0;
    p.bumpTextTimer = 0;
    p.logDropped = false;
    p.logDropProgress = 0;
    p.sunglassesCheererId = pickSunglassesCheerer(contestant.id);
    p.shoutTimer = 0;
    p.shoutText = "";
  }

  function setupCurrentPaskantyontoRun() {
    const p = gameState.paskantyonto;
    const contestantId = p.runOrder[p.currentRunIndex];
    const contestant = gameState.tournament.contestants.find((c) => c.id === contestantId);
    if (!contestant) {
      return;
    }
    p.currentContestantId = contestant.id;
    p.currentDistance = 0;
    p.targetDistance = 5;
    p.speed = 0;
    p.elapsed = 0;
    p.phase = "starterCall";
    p.phaseTimer = 0;
    p.tapFlash = 0;
    p.sunglassesCheererId = pickSunglassesCheerer(contestant.id);
    p.shoutTimer = 0;
    p.shoutText = "";
    p.tapAccumulator = 0;
    p.step = 0;
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
    const foulChance = Math.max(0.01, 0.05 - contestant.stats.accuracy * 0.003);
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
      3.8 +
      contestant.stats.strength * 0.38 +
      contestant.stats.speed * 0.05 +
      contestant.stats.accuracy * 0.30 +
      contestant.stats.stamina * 0.08 +
      (Math.random() - 0.35) * 1.8;
    return {
      id: contestant.id,
      name: contestant.name,
      attempt,
      distance: Math.max(4.0, Math.min(10.3, distance)),
      foul: false,
    };
  }

  function simulateKevytheittoAiAttempts(contestant, attemptsPerPlayer) {
    const attempts = [];
    for (let attempt = 1; attempt <= attemptsPerPlayer; attempt += 1) {
      attempts.push(simulateKevytheittoAiRun(contestant, attempt));
    }
    return attempts;
  }

  function simulateKevytheittoAiRun(contestant, attempt) {
    const foulChance = Math.max(0.02, 0.06 - contestant.stats.accuracy * 0.003);
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
      1.1 +
      contestant.stats.strength * 0.12 +
      contestant.stats.speed * 0.03 +
      contestant.stats.accuracy * 0.09 +
      contestant.stats.stamina * 0.03 +
      (Math.random() - 0.35) * 0.55;
    return {
      id: contestant.id,
      name: contestant.name,
      attempt,
      distance: Math.max(1.3, Math.min(3.4, distance)),
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
    soutu.phase = "starterCall";
    soutu.phaseTimer = 0;
    soutu.aiTapInterval = Math.max(0.14, 0.42 - contestant.stats.speed * 0.02);
    soutu.sunglassesCheererId = pickSunglassesCheerer(contestant.id);
    soutu.shoutTimer = 0;
    soutu.shoutText = "";
  }

  function createSoutuTrack() {
    const start = { x: 190, y: 330 };
    const buoy = { x: 720, y: 240 };
    const turnRadius = 34;
    const approach = { x: buoy.x, y: buoy.y + turnRadius };
    const arcExit = { x: buoy.x, y: buoy.y - turnRadius };
    const finishLineX = start.x;
    const postFinishEnd = { x: 70, y: 250 };
    const startToApproach = distance2d(start.x, start.y, approach.x, approach.y);
    const turnLength = Math.PI * turnRadius;
    const returnLength = distance2d(arcExit.x, arcExit.y, postFinishEnd.x, postFinishEnd.y);
    const denom = arcExit.x - postFinishEnd.x;
    const finishT = Math.max(0, Math.min(1, Math.abs(denom) < 0.001 ? 1 : (arcExit.x - finishLineX) / denom));
    const finishDistance = startToApproach + turnLength + returnLength * finishT;
    return {
      start,
      buoy,
      approach,
      arcExit,
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
      const angleAround = Math.PI / 2 - circleT * Math.PI;
      const x = track.buoy.x + Math.cos(angleAround) * track.turnRadius;
      const y = track.buoy.y + Math.sin(angleAround) * track.turnRadius;
      const tangentAngle = angleAround - Math.PI / 2;
      return { x, y, angle: tangentAngle, stage: "kierto" };
    }

    const dReturn = dAfterApproach - track.turnLength;
    const t = Math.min(1, dReturn / track.returnLength);
    const x = track.arcExit.x + (track.postFinishEnd.x - track.arcExit.x) * t;
    const y = track.arcExit.y + (track.postFinishEnd.y - track.arcExit.y) * t;
    const angle = Math.atan2(track.postFinishEnd.y - track.arcExit.y, track.postFinishEnd.x - track.arcExit.x);
    return { x, y, angle, stage: x <= track.finishLineX ? "maalin-jalkeen" : "paluu" };
  }

  function getCurrentSoutuContestant() {
    return gameState.tournament.contestants.find((c) => c.id === gameState.soutu.currentContestantId) || null;
  }

  function getCurrentKivenContestant() {
    return gameState.tournament.contestants.find((c) => c.id === gameState.kivenheitto.currentContestantId) || null;
  }

  function getCurrentKevytContestant() {
    return gameState.tournament.contestants.find((c) => c.id === gameState.kevytheitto.currentContestantId) || null;
  }

  function isCurrentSoutuHuman() {
    const current = getCurrentSoutuContestant();
    return !!current && current.controller === "human";
  }

  function onSoutuTap() {
    if (gameState.screen !== SCREEN.GAME_SOUTU) {
      return;
    }
    if (!isCurrentSoutuHuman()) {
      return;
    }
    if (gameState.soutu.phase === "starterCall") {
      gameState.soutu.phase = "running";
    }
    if (gameState.soutu.phase !== "running") {
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

  function onKevytheittoTap() {
    const k = gameState.kevytheitto;
    if (gameState.screen !== SCREEN.GAME_KEVYTHEITTO || k.phase !== "running") {
      return;
    }
    const current = getCurrentKevytContestant();
    if (!current || current.controller !== "human") {
      return;
    }
    applyKevytTapImpulse(current, 1);
  }

  function onPolkyTap() {
    const p = gameState.polkyntyonto;
    if (gameState.screen !== SCREEN.GAME_POLKYNTYONTO) {
      return;
    }
    const current = gameState.tournament.contestants.find((c) => c.id === p.currentContestantId);
    if (!current || current.controller !== "human") {
      return;
    }
    if (p.phase === "starterCall") {
      p.phase = "running";
    }
    if (p.phase !== "running") {
      return;
    }
    const push = 13 + current.stats.speed * 1.7 + current.stats.strength * 1.0;
    p.speed += push;
    p.tapFlash = 0.12;
    playBeep(560 + current.stats.strength * 8, 0.03, 0.025);
  }

  function onPaskantyontoTap() {
    const p = gameState.paskantyonto;
    if (gameState.screen !== SCREEN.GAME_PASKANTYONTO) {
      return;
    }
    const current = gameState.tournament.contestants.find((c) => c.id === p.currentContestantId);
    if (!current || current.controller !== "human") {
      return;
    }
    if (p.phase === "starterCall") {
      p.phase = "running";
    }
    if (p.phase !== "running") {
      return;
    }
    const push = 9 + current.stats.strength * 1.5 + current.stats.speed * 0.9;
    p.speed += push;
    p.tapAccumulator += 1;
    p.tapFlash = 0.14;
    playBeep(480 + current.stats.strength * 12, 0.035, 0.028);
  }

  function getDartScoreFromDist(dist) {
    return Math.min(10, Math.max(1, Math.round(10.5 - dist * 120)));
  }

  function onTriathlonTap() {
    const t = gameState.triathlon;
    if (gameState.screen !== SCREEN.GAME_TRIATHLON) {
      return;
    }
    const current = gameState.tournament.contestants.find((c) => c.id === t.currentContestantId);
    if (!current || current.controller !== "human") {
      return;
    }
    if (t.phase === "starterCall") {
      t.phase = "beerChug";
      t.tapFlash = 0.12;
      playBeep(400, 0.03, 0.02);
      return;
    }
    if (t.phase === "beerChug") {
      t.beerDrainBudget += 0.04;
      t.tapFlash = 0.1;
      playBeep(350 + (1 - t.canLevel) * 200, 0.025, 0.02);
      return;
    }
    if (t.phase === "run") {
      const boost = 10 + current.stats.speed * 1.5 + current.stats.stamina * 0.8;
      t.runSpeed += boost;
      t.tapFlash = 0.12;
      playBeep(450 + current.stats.speed * 15, 0.025, 0.02);
      return;
    }
    if (t.phase === "spin") {
      t.spinAngle += Math.PI * 2 * 0.22;
      t.spinCount = Math.floor(t.spinAngle / (Math.PI * 2));
      t.tapFlash = 0.1;
      playBeep(500 + t.spinCount * 30, 0.02, 0.02);
      if (t.spinCount >= t.spinTarget) {
        t.phase = "dartPause";
        t.phaseTimer = 2.0;
      }
      return;
    }
    if (t.phase === "dart") {
      if (t.dartBetweenTimer > 0) {
        return;
      }
      const dist = Math.abs(t.dartGauge - 0.5);
      const hit = getDartScoreFromDist(dist);
      t.dartTotalScore += hit;
      t.dartScores.push(hit);
      t.dartAttemptIndex += 1;
      t.dartScore = null;
      t.dartGauge = 0.5;
      t.dartGaugeDir = 1;
      if (t.dartAttemptIndex < t.dartCount) {
        t.dartBetweenTimer = 1.0;
      }
      t.tapFlash = 0.15;
      playBeep(920, 0.08, 0.05);
      if (t.dartAttemptIndex >= t.dartCount) {
        t.totalTime = t.elapsed;
        t.finishedRuns.push({
          id: current.id,
          name: current.name,
          totalTime: t.totalTime,
          dartScore: t.dartTotalScore,
          finalScore: Math.max(0.1, t.totalTime - t.dartTotalScore),
        });
        t.shoutText = `AIKA! ${t.totalTime.toFixed(2)} s`;
        t.shoutTimer = 3.0;
        t.phase = "betweenRuns";
        t.phaseTimer = 1.0;
      }
      return;
    }
  }

  function applyKivenTapImpulse(contestant, multiplier) {
    const k = gameState.kivenheitto;
    const baseImpulse = 20 + contestant.stats.strength * 2.0 + contestant.stats.speed * 1.1;
    const powerGain = 2.2 + contestant.stats.strength * 0.48 + contestant.stats.stamina * 0.2;
    k.speed += baseImpulse * multiplier;
    k.power += powerGain * multiplier;
    k.timeSinceTap = 0;
    k.tapFlash = 0.1;
    playBeep(500 + contestant.stats.strength * 18, 0.025, 0.022);
  }

  function applyKevytTapImpulse(contestant, multiplier) {
    const k = gameState.kevytheitto;
    const baseImpulse = 15 + contestant.stats.strength * 1.8 + contestant.stats.speed * 0.9;
    const powerGain = 1.9 + contestant.stats.strength * 0.42 + contestant.stats.stamina * 0.18;
    k.speed += baseImpulse * multiplier;
    k.power += powerGain * multiplier;
    k.timeSinceTap = 0;
    k.tapFlash = 0.1;
    playBeep(700 + contestant.stats.accuracy * 14, 0.02, 0.02);
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
    k.sunglassesCheererId = pickSunglassesCheerer(contestant.id);
    k.cheerPositions = buildKivenCheerPositions();
  }

  function setupCurrentKevytRun() {
    const k = gameState.kevytheitto;
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
    k.sunglassesCheererId = pickSunglassesCheerer(contestant.id);
    k.cheerPositions = buildKivenCheerPositions();
  }

  function buildKivenCheerPositions() {
    const topBand = [
      { x: 108 + Math.random() * 18, y: 184 + Math.random() * 8 },
      { x: 152 + Math.random() * 20, y: 186 + Math.random() * 8 },
      { x: 194 + Math.random() * 18, y: 184 + Math.random() * 8 },
      { x: 236 + Math.random() * 18, y: 186 + Math.random() * 8 },
    ];
    const throwArea = [
      { x: 340 + Math.random() * 42, y: 276 + Math.random() * 18 },
      { x: 388 + Math.random() * 42, y: 282 + Math.random() * 18 },
      { x: 442 + Math.random() * 44, y: 278 + Math.random() * 20 },
    ];
    return [...topBand, ...throwArea];
  }

  function pickSunglassesCheerer(currentContestantId) {
    const supporters = gameState.tournament.contestants.filter((c) => c.id !== currentContestantId);
    if (supporters.length === 0) {
      return null;
    }
    return supporters[Math.floor(Math.random() * supporters.length)].id;
  }

  function update(deltaSeconds) {
    if (gameState.screen === SCREEN.TEST_INTRO && Date.now() >= gameState.testIntroUntil) {
      setScreen(SCREEN.TEST_MENU);
      return;
    }
    if (gameState.screen === SCREEN.GAME_SOUTU) {
      updateSoutu(deltaSeconds);
      return;
    }
    if (gameState.screen === SCREEN.GAME_KIVENHEITTO) {
      updateKivenheitto(deltaSeconds);
      return;
    }
    if (gameState.screen === SCREEN.GAME_KEVYTHEITTO) {
      updateKevytheitto(deltaSeconds);
      return;
    }
    if (gameState.screen === SCREEN.GAME_POLKYNTYONTO) {
      updatePolkyntyonto(deltaSeconds);
      return;
    }
    if (gameState.screen === SCREEN.GAME_PASKANTYONTO) {
      updatePaskantyonto(deltaSeconds);
      return;
    }
    if (gameState.screen === SCREEN.GAME_TRIATHLON) {
      updateTriathlon(deltaSeconds);
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
    if (soutu.shoutTimer > 0) {
      soutu.shoutTimer -= deltaSeconds;
    }

    if (soutu.phase === "starterCall") {
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

      const drag = (120 + (10 - current.stats.stamina) * 10) * deltaSeconds;
      soutu.speed = Math.max(0, soutu.speed - drag);
      const meterPerSecond = soutu.speed * 0.10;
      const previousDistance = soutu.currentDistance;
      soutu.currentDistance += meterPerSecond * deltaSeconds;
      soutu.elapsed += deltaSeconds;

      const finishDistance = soutu.track?.finishDistance ?? soutu.targetDistance;
      if (previousDistance < finishDistance && soutu.currentDistance >= finishDistance) {
        soutu.finishTime = soutu.elapsed;
        soutu.finishedRuns.push({ id: current.id, name: current.name, time: soutu.finishTime });
        soutu.shoutText = `AIKA! ${soutu.finishTime.toFixed(2)} s`;
        soutu.shoutTimer = 3.0;
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
      k.speed = Math.max(0, k.speed - (150 + (10 - current.stats.stamina) * 7) * deltaSeconds);
      k.power = Math.max(0, k.power - 11 * deltaSeconds);
      k.positionX += k.speed * deltaSeconds * 0.42;

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

      if (k.timeSinceTap > 0.28 && k.power > 3.8) {
        const proximityBonus = Math.max(0, 1 - Math.abs(k.throwLineX - k.positionX) / 55);
        const rawDistance =
          0.7 +
          Math.min(5.2, k.power * 0.14) +
          current.stats.strength * 0.10 +
          current.stats.accuracy * 0.08 +
          proximityBonus * 3.4 +
          (Math.random() - 0.5) * 0.9;
        k.throwDistance = Math.max(0.6, Math.min(10.2, rawDistance));
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

  function updateKevytheitto(deltaSeconds) {
    const k = gameState.kevytheitto;
    const current = getCurrentKevytContestant();
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
          applyKevytTapImpulse(current, 0.92 + Math.random() * 0.18);
        }
      }

      k.timeSinceTap += deltaSeconds;
      k.speed = Math.max(0, k.speed - (165 + (10 - current.stats.stamina) * 8) * deltaSeconds);
      k.power = Math.max(0, k.power - 11 * deltaSeconds);
      k.positionX += k.speed * deltaSeconds * 0.33;

      if (k.positionX >= k.throwLineX) {
        k.positionX = k.throwLineX;
        k.isFoul = true;
        k.throwDistance = 0;
        k.phase = "throwing";
        k.phaseTimer = 0.9;
        k.throwAnimT = 0;
        playBeep(210, 0.12, 0.05);
        return;
      }

      if (k.timeSinceTap > 0.28 && k.power > 3.8) {
        const proximityBonus = Math.max(0, 1 - Math.abs(k.throwLineX - k.positionX) / 55);
        const rawDistance =
          (0.7 +
            Math.min(5.2, k.power * 0.14) +
            current.stats.strength * 0.10 +
            current.stats.accuracy * 0.08 +
            proximityBonus * 3.4 +
            (Math.random() - 0.5) * 0.9) /
          3;
        k.throwDistance = Math.max(0.2, Math.min(3.4, rawDistance));
        k.phase = "throwing";
        k.phaseTimer = 1.0;
        k.throwAnimT = 0;
        playBeep(980, 0.045, 0.05);
      }
      return;
    }

    if (k.phase === "throwing") {
      k.phaseTimer -= deltaSeconds;
      k.throwAnimT = Math.min(1, k.throwAnimT + deltaSeconds * 1.6);
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
        finalizeKevytheittoResults();
      } else {
        setupCurrentKevytRun();
      }
    }
  }

  function finalizeKevytheittoResults() {
    const attempts = gameState.kevytheitto.finishedRuns;
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
      eventName: "Kevyen esineen heitto",
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
    if (p.shoutTimer > 0) {
      p.shoutTimer -= deltaSeconds;
    }
    if (p.bumpTextTimer > 0) {
      p.bumpTextTimer -= deltaSeconds;
    }

    if (p.phase === "starterCall") {
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
        p.shoutText = `AIKA! ${p.elapsed.toFixed(2)} s`;
        p.shoutTimer = 3.0;
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

  function updatePaskantyonto(deltaSeconds) {
    const p = gameState.paskantyonto;
    const current = gameState.tournament.contestants.find((c) => c.id === p.currentContestantId);
    if (!current) {
      return;
    }
    if (p.tapFlash > 0) {
      p.tapFlash -= deltaSeconds;
    }
    if (p.shoutTimer > 0) {
      p.shoutTimer -= deltaSeconds;
    }
    if (p.phase === "starterCall") {
      return;
    }
    if (p.phase === "running") {
      const tapsPerStep = 40;
      if (p.tapAccumulator >= tapsPerStep) {
        p.step += 1;
        p.tapAccumulator = 0;
      }
      const maxSpeedFromStep = 18 + 28 * Math.log2(1 + p.step);
      p.speed = Math.min(p.speed, maxSpeedFromStep);
      const drag = 78;
      p.speed = Math.max(0, p.speed - drag * deltaSeconds);
      p.currentDistance += p.speed * 0.018 * deltaSeconds;
      p.elapsed += deltaSeconds;
      if (current.controller === "ai") {
        p.step = Math.min(12, Math.floor(p.elapsed / 5));
        p.speed = Math.min(p.speed, 18 + 28 * Math.log2(1 + p.step));
        const aiPush = 8 + current.stats.strength * 1.5 + current.stats.speed * 0.9;
        p.speed += aiPush * Math.min(1, deltaSeconds * 8);
      }
      if (p.currentDistance >= p.targetDistance) {
        p.currentDistance = p.targetDistance;
        p.finishedRuns.push({ id: current.id, name: current.name, time: p.elapsed });
        p.shoutText = `AIKA! ${p.elapsed.toFixed(2)} s`;
        p.shoutTimer = 3.0;
        p.phase = "betweenRuns";
        p.phaseTimer = 1.0;
        playBeep(920, 0.08, 0.05);
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
        finalizePaskantyontoResults();
      } else {
        setupCurrentPaskantyontoRun();
      }
    }
  }

  function finalizePaskantyontoResults() {
    const ranked = [...gameState.paskantyonto.finishedRuns].sort((a, b) => a.time - b.time);
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
      eventName: "Paskan työntö",
      metricLabel: "Aika",
      rows: ranked,
    };
    simulation.updateLeader();
    setScreen(SCREEN.RESULTS);
  }

  function createTriathlonRunTrack() {
    return {
      startX: 140,
      endX: 820,
      pierY: 300,
      length: 80,
    };
  }

  function startTriathlonEvent() {
    const t = gameState.triathlon;
    t.runOrder = getHumanContestants().map((c) => c.id);
    t.currentRunIndex = 0;
    t.finishedRuns = getAiContestants().map((ai) => simulateTriathlonAiRun(ai));
    t.track = createTriathlonRunTrack();
    if (t.runOrder.length === 0) {
      finalizeTriathlonResults();
      return;
    }
    setupCurrentTriathlonRun();
    setScreen(SCREEN.GAME_TRIATHLON);
  }

  function simulateTriathlonAiRun(contestant) {
    const totalTime = 35 + (10 - contestant.stats.speed) * 2.5 + (10 - contestant.stats.stamina) * 1.5 + (Math.random() - 0.5) * 4;
    let dartTotalScore = 0;
    for (let i = 0; i < 5; i += 1) {
      dartTotalScore += Math.min(10, Math.max(1, Math.round(contestant.stats.accuracy * 0.8 + 2 + (Math.random() - 0.5) * 2)));
    }
    const finalScore = Math.max(0.1, totalTime - dartTotalScore);
    return {
      id: contestant.id,
      name: contestant.name,
      totalTime,
      dartScore: dartTotalScore,
      finalScore,
    };
  }

  function setupCurrentTriathlonRun() {
    const t = gameState.triathlon;
    const contestantId = t.runOrder[t.currentRunIndex];
    const contestant = gameState.tournament.contestants.find((c) => c.id === contestantId);
    if (!contestant) {
      return;
    }
    t.currentContestantId = contestantId;
    t.phase = "starterCall";
    t.phaseTimer = 0;
    t.canLevel = 1;
    t.beerDrainBudget = 0;
    t.runDistance = 0;
    t.runSpeed = 0;
    t.spinAngle = 0;
    t.spinCount = 0;
    t.dartGauge = 0.5;
    t.dartGaugeDir = 1;
    t.dartScore = null;
    t.dartAttemptIndex = 0;
    t.dartTotalScore = 0;
    t.dartScores = [];
    t.dartBetweenTimer = 0;
    t.totalTime = 0;
    t.elapsed = 0;
    t.tapFlash = 0;
    t.sunglassesCheererId = pickSunglassesCheerer(contestantId);
    t.shoutTimer = 0;
    t.shoutText = "";
  }

  function updateTriathlon(deltaSeconds) {
    const t = gameState.triathlon;
    const current = gameState.tournament.contestants.find((c) => c.id === t.currentContestantId);
    if (!current) {
      return;
    }
    if (t.tapFlash > 0) {
      t.tapFlash -= deltaSeconds;
    }
    if (t.shoutTimer > 0) {
      t.shoutTimer -= deltaSeconds;
    }
    if (t.phase === "starterCall") {
      return;
    }
    t.elapsed += deltaSeconds;

    if (t.phase === "beerChug") {
      const maxDrainPerSecond = 0.2;
      const drain = Math.min(
        current.controller === "human" ? t.beerDrainBudget : 1,
        maxDrainPerSecond * deltaSeconds
      );
      t.canLevel = Math.max(0, t.canLevel - drain);
      if (current.controller === "human") {
        t.beerDrainBudget = Math.max(0, t.beerDrainBudget - drain);
      }
      if (t.canLevel <= 0) {
        t.canLevel = 0;
        t.phase = "run";
        t.runSpeed = 0;
      }
      return;
    }

    if (t.phase === "run") {
      const drag = 95 * deltaSeconds;
      t.runSpeed = Math.max(0, t.runSpeed - drag);
      if (current.controller === "ai") {
        const aiBoost = 8 + current.stats.speed * 1.2 + current.stats.stamina * 0.8;
        t.runSpeed += aiBoost * Math.min(1, deltaSeconds * 7);
      }
      t.runDistance += t.runSpeed * 0.035 * deltaSeconds;
      if (t.runDistance >= t.runTargetDistance) {
        t.runDistance = t.runTargetDistance;
        t.phase = "spin";
        t.spinAngle = 0;
        t.spinCount = 0;
      }
      return;
    }

    if (t.phase === "spin") {
      t.spinCount = Math.min(t.spinTarget, Math.floor(t.spinAngle / (Math.PI * 2)));
      if (current.controller === "ai") {
        t.spinAngle += (2.2 + current.stats.speed * 0.28) * Math.PI * 2 * deltaSeconds;
        if (t.spinCount >= t.spinTarget) {
          t.phase = "dartPause";
          t.phaseTimer = 2.0;
        }
      }
      return;
    }

    if (t.phase === "dartPause") {
      t.phaseTimer -= deltaSeconds;
      if (t.phaseTimer <= 0) {
        t.phase = "dart";
        t.dartAttemptIndex = 0;
        t.dartTotalScore = 0;
        t.dartScores = [];
        t.dartScore = null;
        t.dartBetweenTimer = 0;
        t.dartGauge = 0.5;
        t.dartGaugeDir = 1;
      }
      return;
    }

    if (t.phase === "dart") {
      if (t.dartBetweenTimer > 0) {
        t.dartBetweenTimer -= deltaSeconds;
        if (t.dartBetweenTimer < 0) {
          t.dartBetweenTimer = 0;
        }
        return;
      }
      const gaugeSpeed = 1.8;
      t.dartGauge += t.dartGaugeDir * gaugeSpeed * deltaSeconds;
      if (t.dartGauge >= 1) {
        t.dartGauge = 1;
        t.dartGaugeDir = -1;
      } else if (t.dartGauge <= 0) {
        t.dartGauge = 0;
        t.dartGaugeDir = 1;
      }
      if (current.controller === "ai") {
        const aiDist = Math.abs(t.dartGauge - 0.5);
        if (t.dartScore === null && aiDist < 0.018 + (Math.random() * 0.012)) {
          const hit = getDartScoreFromDist(aiDist);
          t.dartTotalScore += hit;
          t.dartScores.push(hit);
          t.dartAttemptIndex += 1;
          t.dartScore = null;
          t.dartGauge = 0.5;
          t.dartGaugeDir = 1;
          if (t.dartAttemptIndex < t.dartCount) {
            t.dartBetweenTimer = 1.0;
          }
          playBeep(920, 0.08, 0.05);
          if (t.dartAttemptIndex >= t.dartCount) {
            t.totalTime = t.elapsed;
            t.finishedRuns.push({
              id: current.id,
              name: current.name,
              totalTime: t.totalTime,
              dartScore: t.dartTotalScore,
              finalScore: Math.max(0.1, t.totalTime - t.dartTotalScore),
            });
            t.shoutText = `AIKA! ${t.totalTime.toFixed(2)} s`;
            t.shoutTimer = 3.0;
            t.phase = "betweenRuns";
            t.phaseTimer = 1.0;
          }
        }
      }
      return;
    }

    if (t.phase === "betweenRuns") {
      t.phaseTimer -= deltaSeconds;
      if (t.phaseTimer > 0) {
        return;
      }
      t.currentRunIndex += 1;
      if (t.currentRunIndex >= t.runOrder.length) {
        finalizeTriathlonResults();
      } else {
        setupCurrentTriathlonRun();
      }
    }
  }

  function finalizeTriathlonResults() {
    const t = gameState.triathlon;
    const ranked = [...t.finishedRuns].sort((a, b) => a.finalScore - b.finalScore);
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
    gameState.tournament.championId = ranked[0]?.id ?? gameState.tournament.currentLeaderId;
    simulation.updateLeader();
    gameState.tournament.lastResults = {
      eventName: "Triathlon",
      metricLabel: "Lopputulos",
      rows: ranked,
    };
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
    ctx.fillText(`Matka: ${(progress * 100).toFixed(0)} %`, 100, 404);
    ctx.fillText(`Kierrosaika: ${(soutu.finishTime ?? soutu.elapsed).toFixed(2)} s`, 300, 404);
    ctx.fillText(`Nopeus: ${Math.round(soutu.speed)}`, 100, 426);

    let stageText = "Meno poijulle";
    if (pose.stage === "kierto") {
      stageText = "Kierretaan poijua";
    } else if (pose.stage === "paluu") {
      stageText = "Paluu laiturin ylapuolelta";
    } else if (pose.stage === "maalin-jalkeen") {
      stageText = "Maali ylitetty";
    }
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Vaihe: ${stageText}`, 300, 426);

    if (soutu.phase === "starterCall") {
      ctx.fillStyle = "#ffd27d";
      ctx.fillText("Odotetaan ensimmaista rampytysta...", 100, 445);
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
    ctx.fillText(`Yritys: ${k.currentAttemptNumber}/${k.attemptsPerPlayer}`, 360, 156);
    drawKivenLeaderboard();

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

  function drawKevytheitto() {
    drawPanel(60, 40, 840, 460);
    const k = gameState.kevytheitto;
    const current = getCurrentKevytContestant();
    if (!current) {
      return;
    }

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "left";
    ctx.fillText("KEVYEN ESINEEN HEITTO", 100, 92);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Vuoro ${k.currentRunIndex + 1}/${k.turnQueue.length}: ${current.name}`, 100, 128);
    ctx.fillText(`Yritys: ${k.currentAttemptNumber}/${k.attemptsPerPlayer}`, 360, 156);
    drawKevytLeaderboard();

    drawKevytheittoScene(current);

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

    drawPolkyScene(pose, current);

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "18px monospace";
    ctx.fillText(`Aika: ${p.elapsed.toFixed(2)} s`, 100, 415);
    ctx.fillText(`Nopeus: ${Math.round(p.speed)}`, 280, 415);
    ctx.fillText(`Matka: ${Math.round((p.currentDistance / p.targetDistance) * 100)} %`, 450, 415);

    if (p.phase === "starterCall") {
      ctx.fillStyle = "#ffd27d";
      ctx.fillText("Odotetaan ensimmaista rampytysta...", 100, 445);
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

  function drawPaskantyonto() {
    drawPanel(60, 40, 840, 460);
    const p = gameState.paskantyonto;
    const current = gameState.tournament.contestants.find((c) => c.id === p.currentContestantId);
    if (!current) {
      return;
    }
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "left";
    ctx.fillText("PASKAN TYONTO", 100, 92);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Vuoro ${p.currentRunIndex + 1}/${p.runOrder.length}: ${current.name}`, 100, 128);

    drawPaskantyontoScene(current);

    const progress = Math.min(1, p.currentDistance / p.targetDistance);
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "18px monospace";
    ctx.fillText(`Matka: ${(progress * 5).toFixed(1)} / 5 m`, 100, 412);
    ctx.fillText(`Aika: ${p.elapsed.toFixed(2)} s`, 300, 412);
    ctx.fillText(`Nopeus: ${Math.round(p.speed)}`, 500, 412);
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Pykala: ${p.step} (seuraava: ${p.tapAccumulator}/40)`, 100, 432);

    if (p.phase === "starterCall") {
      ctx.fillStyle = "#ffd27d";
      ctx.fillText("Odotetaan ensimmaista rampytysta...", 100, 455);
    } else if (current.controller === "human") {
      ctx.fillStyle = "#7dffb3";
      ctx.fillText("NAPUTA HULLUNA! AUTO LAAKASTUU JOS ET RAMPYTA.", 100, 455);
    } else {
      ctx.fillStyle = "#ffc77d";
      ctx.fillText("Tekoaly tyontaa...", 100, 455);
    }
  }

  function drawTriathlon() {
    drawPanel(60, 40, 840, 460);
    const t = gameState.triathlon;
    const current = gameState.tournament.contestants.find((c) => c.id === t.currentContestantId);
    if (!current) {
      return;
    }
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 34px monospace";
    ctx.textAlign = "left";
    ctx.fillText("TRIATHLON", 100, 92);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText(`Vuoro ${t.currentRunIndex + 1}/${t.runOrder.length}: ${current.name}`, 100, 128);

    drawTriathlonScene(current);

    const phaseLabel =
      t.phase === "beerChug"
        ? "Oluen juonti"
        : t.phase === "run"
          ? "Juoksu"
          : t.phase === "spin"
            ? "Tukkihumala"
            : t.phase === "dartPause"
              ? "Tauko"
              : t.phase === "dart"
                ? "Tikanheitto"
                : t.phase === "starterCall"
                  ? "Valmistaudu"
                  : "";
    ctx.fillStyle = "#a3d5ff";
    ctx.font = "18px monospace";
    ctx.fillText(`Vaihe: ${phaseLabel}`, 100, 412);
    ctx.fillText(`Aika: ${t.elapsed.toFixed(2)} s`, 280, 412);
    if (t.phase === "beerChug") {
      ctx.fillText(`Tölkki: ${Math.round(t.canLevel * 100)}%`, 450, 412);
    } else if (t.phase === "run") {
      ctx.fillText(`Matka: ${Math.round((t.runDistance / t.runTargetDistance) * 100)}%`, 450, 412);
    } else if (t.phase === "spin") {
      ctx.fillText(`Pyöritys: ${t.spinCount}/${t.spinTarget}`, 450, 412);
    } else if (t.phase === "dartPause") {
      ctx.fillText(`Tauko ${t.phaseTimer.toFixed(1)} s`, 450, 412);
    } else if (t.phase === "dart") {
      if (t.dartBetweenTimer > 0) {
        ctx.fillText(`Tauko ${t.dartBetweenTimer.toFixed(1)} s`, 450, 412);
      } else {
        ctx.fillText(`Tikka: ${t.dartAttemptIndex}/${t.dartCount} (yht: ${t.dartTotalScore})`, 450, 412);
      }
    }

    if (t.phase === "starterCall") {
      ctx.fillStyle = "#ffd27d";
      ctx.fillText("Odotetaan ensimmaista napautusta...", 100, 445);
    } else if (current.controller === "human") {
      ctx.fillStyle = "#7dffb3";
      if (t.phase === "beerChug") {
        ctx.fillText("NAPUTA TYHJENTÄÄKSESI TÖLKIN!", 100, 445);
      } else if (t.phase === "run") {
        ctx.fillText("NAPUTA JUOKSUUN!", 100, 445);
      } else if (t.phase === "spin") {
        ctx.fillText("NAPUTA PYÖRITYKSEEN!", 100, 445);
      } else if (t.phase === "dartPause") {
        ctx.fillStyle = "#ffd27d";
        ctx.fillText("Tauko ennen tikanheittoa...", 100, 445);
      } else if (t.phase === "dart") {
        if (t.dartBetweenTimer > 0) {
          ctx.fillStyle = "#ffd27d";
          ctx.fillText("Tauko – seuraava tikka kohta...", 100, 445);
        } else {
          ctx.fillText(`PAINA VIIVALLA! Tikka ${t.dartAttemptIndex + 1}/${t.dartCount}`, 100, 445);
        }
      }
    } else {
      ctx.fillStyle = "#ffc77d";
      ctx.fillText("Tekoaly suorittaa...", 100, 445);
    }
  }

  function drawTriathlonScene(contestant) {
    const t = gameState.triathlon;
    const track = t.track;
    const showPierScene = t.phase === "starterCall" || t.phase === "beerChug" || t.phase === "run" || t.phase === "spin" || t.phase === "dart" || t.phase === "dartPause";
    if (track && showPierScene) {
      const pierY = track ? track.pierY : 300;
      const startX = track ? track.startX : 140;
      const endX = track ? track.endX : 820;
      const pierLeft = 80;
      const pierW = 760;
      const shoreRight = 140;

      ctx.fillStyle = "#2a4a6a";
      ctx.fillRect(shoreRight, 0, 960 - shoreRight, 500);
      for (let i = 0; i < 24; i += 1) {
        const wx = shoreRight + (i % 6) * 140 + (i % 3) * 20;
        const wy = 80 + (i % 5) * 90 + Math.sin(i * 0.7) * 30;
        ctx.fillStyle = "rgba(80, 140, 200, 0.35)";
        ctx.fillRect(wx, wy, 60, 12);
      }

      ctx.fillStyle = "#3d5a2f";
      ctx.fillRect(0, 0, shoreRight, 500);
      ctx.fillStyle = "#2a4a1a";
      ctx.fillRect(0, 320, shoreRight, 180);
      for (let i = 0; i < 8; i += 1) {
        const tx = 25 + (i % 4) * 32;
        const ty = 140 + Math.floor(i / 4) * 120;
        ctx.fillStyle = "#1a3d0f";
        ctx.beginPath();
        ctx.moveTo(tx, ty + 28);
        ctx.lineTo(tx + 8, ty);
        ctx.lineTo(tx + 20, ty + 28);
        ctx.closePath();
        ctx.fill();
        ctx.fillStyle = "#2a5a1a";
        ctx.fillRect(tx + 6, ty + 26, 8, 14);
      }

      ctx.fillStyle = "#5a4a3a";
      ctx.fillRect(pierLeft, pierY - 15, pierW, 50);
      ctx.strokeStyle = "#8f7a5a";
      ctx.lineWidth = 2;
      ctx.strokeRect(pierLeft, pierY - 15, pierW, 50);
      const overrun = 40;
      const downH = 75;
      const upH = 55;
      ctx.setLineDash([8, 6]);
      ctx.strokeStyle = "rgba(255, 255, 200, 0.6)";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(startX, pierY);
      ctx.lineTo(startX, pierY + downH);
      ctx.lineTo(endX + overrun, pierY + downH);
      ctx.lineTo(endX + overrun, pierY - upH);
      ctx.lineTo(startX, pierY - upH);
      ctx.closePath();
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#ffcf66";
      ctx.fillRect(startX - 4, pierY - 2, 8, 20);
      ctx.fillStyle = "#d7f1ff";
      ctx.font = "12px monospace";
      ctx.fillText("Tölkki", startX - 18, pierY - 22);
    }

    if (track && showPierScene) {
      const cheerAnchor = drawCheeringCrowd(
        [
          { x: 100, y: 180 },
          { x: 140, y: 185 },
          { x: 180, y: 182 },
          { x: 500, y: 182 },
          { x: 820, y: 185 },
        ],
        contestant.id,
        t.sunglassesCheererId,
        2
      );
      if (t.phase === "starterCall" && cheerAnchor) {
        drawSpeechBubbleFromAnchor(cheerAnchor, "AJANOTTAJA VALMIS!");
      } else if (t.shoutTimer > 0 && cheerAnchor) {
        drawSpeechBubbleFromAnchor(cheerAnchor, t.shoutText);
      }
    }

    if (t.phase === "beerChug") {
      const pierY = track ? track.pierY : 300;
      const startX = track ? track.startX : 140;
      const canX = startX + 25;
      const canY = pierY - 55;
      ctx.fillStyle = "#f4e8a0";
      ctx.fillRect(canX, canY, 24, 42);
      ctx.strokeStyle = "#c4a830";
      ctx.lineWidth = 2;
      ctx.strokeRect(canX, canY, 24, 42);
      const fillH = 42 * t.canLevel;
      ctx.fillStyle = "#6d4c2a";
      ctx.fillRect(canX + 2, canY + 42 - fillH, 20, fillH);
      drawPixelContestant(contestant, canX - 20, canY - 10, 2.5, {
        shirtColor: contestant.id === gameState.tournament.currentLeaderId ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT,
        shortsColor: "#ffffff",
      });
    }

    if (t.phase === "run") {
      const pierY = track ? track.pierY : 300;
      const startX = track ? track.startX : 140;
      const endX = track ? track.endX : 820;
      const p = Math.min(1, t.runDistance / t.runTargetDistance);
      const progress = p <= 1 / 6
        ? p / (1 / 6) * 0.25
        : p <= 1 / 2
          ? 0.25 + (p - 1 / 6) / (1 / 3) * 0.25
          : p <= 2 / 3
            ? 0.5 + (p - 1 / 2) / (1 / 6) * 0.25
            : 0.75 + (p - 2 / 3) / (1 / 3) * 0.25;
      const overrun = 40;
      const downH = 75;
      const upH = 55;
      let runX;
      let runY;
      let angle = 0;
      if (progress < 0.25) {
        const seg = progress / 0.25;
        runX = startX;
        runY = pierY + seg * downH;
        angle = Math.PI / 2;
      } else if (progress < 0.5) {
        const seg = (progress - 0.25) / 0.25;
        runX = startX + seg * (endX + overrun - startX);
        runY = pierY + downH;
        angle = 0;
      } else if (progress < 0.75) {
        const seg = (progress - 0.5) / 0.25;
        runX = endX + overrun;
        runY = pierY + downH - seg * (downH + upH);
        angle = -Math.PI / 2;
      } else {
        const seg = (progress - 0.75) / 0.25;
        runX = endX + overrun - seg * (endX + overrun - startX);
        runY = pierY - upH + seg * upH;
        angle = Math.PI;
      }
      const cx = runX;
      const cy = runY - 26;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.translate(-cx, -cy);
      drawPixelContestant(contestant, runX - 12, runY - 52, 3, {
        shirtColor: contestant.id === gameState.tournament.currentLeaderId ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT,
        shortsColor: "#ffffff",
      });
      ctx.restore();
    }

    if (t.phase === "spin" && track) {
      const pierY = track.pierY;
      const startX = track.startX;
      const cx = startX + 28;
      const cy = pierY - 26;
      const rot = t.spinAngle % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      drawPixelContestant(contestant, -16, -24, 4, {
        shirtColor: contestant.id === gameState.tournament.currentLeaderId ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT,
        shortsColor: "#ffffff",
      });
      ctx.restore();
      ctx.fillStyle = "#a3d5ff";
      ctx.font = "16px monospace";
      ctx.textAlign = "center";
      ctx.fillText(`${t.spinCount} / ${t.spinTarget} kierrosta`, cx, cy + 72);
      ctx.textAlign = "left";
    }

    if (t.phase === "dartPause") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.35)";
      ctx.fillRect(0, 0, 960, 500);
      ctx.fillStyle = "#ffd27d";
      ctx.font = "bold 28px monospace";
      ctx.textAlign = "center";
      ctx.fillText("Tauko – tikanheitto kohta!", 480, 260);
      ctx.font = "22px monospace";
      ctx.fillText(`${Math.ceil(t.phaseTimer)} s`, 480, 300);
      ctx.textAlign = "left";
    }

    if ((t.phase === "dart" || t.phase === "dartPause") && track) {
      const scores = t.dartScores || [];
      const boxH = 24 + (scores.length > 0 ? (scores.length + 1) * 18 : 18);
      ctx.fillStyle = "rgba(20, 30, 50, 0.85)";
      ctx.fillRect(720, 52, 218, boxH);
      ctx.strokeStyle = "#5a7a9a";
      ctx.lineWidth = 2;
      ctx.strokeRect(720, 52, 218, boxH);
      ctx.fillStyle = "#d7f1ff";
      ctx.font = "bold 13px monospace";
      ctx.textAlign = "right";
      ctx.fillText("Tikka", 920, 68);
      scores.forEach((pts, i) => {
        ctx.fillText(`${i + 1}. ${pts} p`, 920, 86 + i * 18);
      });
      if (scores.length > 0) {
        ctx.fillStyle = "#ffcf66";
        ctx.fillText(`Yht: ${t.dartTotalScore}`, 920, 86 + scores.length * 18);
      }
      ctx.textAlign = "left";
    }

    if (t.phase === "dart" && track) {
      const startX = track.startX;
      const pierY = track.pierY;
      const boardX = startX + 100;
      const boardY = pierY - 95;
      ctx.fillStyle = "#2a4a2a";
      ctx.fillRect(boardX - 50, boardY - 50, 100, 100);
      ctx.strokeStyle = "#5a8a5a";
      ctx.lineWidth = 4;
      ctx.strokeRect(boardX - 50, boardY - 50, 100, 100);
      ctx.fillStyle = "#ff4444";
      ctx.beginPath();
      ctx.arc(boardX, boardY, 35, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#fff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(boardX, boardY, 8, 0, Math.PI * 2);
      ctx.fill();
      const gaugeX = boardX;
      const gaugeY = pierY + 35;
      const gaugeW = 200;
      ctx.fillStyle = "#333";
      ctx.fillRect(gaugeX - gaugeW / 2, gaugeY - 12, gaugeW, 24);
      ctx.strokeStyle = "#666";
      ctx.strokeRect(gaugeX - gaugeW / 2, gaugeY - 12, gaugeW, 24);
      ctx.fillStyle = "#ff0";
      ctx.fillRect(gaugeX - 2, gaugeY - 10, 4, 20);
      const needleX = gaugeX - gaugeW / 2 + t.dartGauge * gaugeW;
      ctx.fillStyle = "#f00";
      ctx.fillRect(needleX - 3, gaugeY - 14, 6, 28);
      ctx.fillStyle = "#fff";
      ctx.fillRect(gaugeX - 1, gaugeY - 8, 2, 16);
      ctx.font = "14px monospace";
      ctx.textAlign = "center";
      ctx.fillText("PAINA VIIVALLA!", gaugeX, gaugeY + 28);
      ctx.textAlign = "left";
    }
  }

  function drawPaskantyontoScene(contestant) {
    const p = gameState.paskantyonto;
    const laneY = 300;
    const laneH = 70;
    const startX = 100;
    const laneW = 700;
    const scale = laneW / p.targetDistance;
    const carX = startX + p.currentDistance * scale;

    ctx.fillStyle = "#3d4a2f";
    ctx.fillRect(85, laneY - 10, laneW + 40, laneH + 30);
    ctx.strokeStyle = "#5a6b42";
    ctx.lineWidth = 2;
    ctx.strokeRect(85, laneY - 10, laneW + 40, laneH + 30);

    ctx.fillStyle = "#ffcf66";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(startX + laneW, laneY - 4);
    ctx.lineTo(startX + laneW, laneY + laneH + 4);
    ctx.stroke();
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "14px monospace";
    ctx.fillText("5 m", startX + laneW - 18, laneY + laneH + 22);

    const paskaAnchor = drawCheeringCrowd(
      [
        { x: 88, y: 268 },
        { x: 88, y: 305 },
        { x: 88, y: 342 },
        { x: 808, y: 268 },
        { x: 808, y: 305 },
        { x: 808, y: 342 },
      ],
      contestant.id,
      p.sunglassesCheererId,
      2
    );
    if (p.phase === "starterCall" && paskaAnchor) {
      drawSpeechBubbleFromAnchor(paskaAnchor, "AJANOTTAJA VALMIS!");
    } else if (p.shoutTimer > 0 && paskaAnchor) {
      drawSpeechBubbleFromAnchor(paskaAnchor, p.shoutText);
    }

    const carW = 76;
    const carH = 34;
    const cy = laneY + laneH / 2 - carH / 2;
    ctx.save();
    ctx.translate(carX, cy);
    const blue = "#2a3a6a";
    const blueDark = "#1a2a4a";
    const blueEdge = "#4a5a8a";
    const wheelColor = "#2d3325";
    const hoodTop = 14;
    const cabinTop = 8;
    ctx.fillStyle = blue;
    ctx.beginPath();
    ctx.moveTo(4, carH - 4);
    ctx.lineTo(8, carH - 10);
    ctx.quadraticCurveTo(12, 2, 22, 4);
    ctx.lineTo(48, 4);
    ctx.quadraticCurveTo(54, 2, 58, 8);
    ctx.quadraticCurveTo(62, 12, 62, 18);
    ctx.quadraticCurveTo(64, 24, 68, 26);
    ctx.lineTo(72, 26);
    ctx.quadraticCurveTo(76, 24, 76, carH - 8);
    ctx.quadraticCurveTo(74, carH - 2, 68, carH - 2);
    ctx.lineTo(12, carH - 2);
    ctx.quadraticCurveTo(6, carH - 2, 4, carH - 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = blueEdge;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = blueDark;
    ctx.beginPath();
    ctx.moveTo(24, 8);
    ctx.lineTo(42, 8);
    ctx.quadraticCurveTo(46, 10, 46, 14);
    ctx.lineTo(46, 20);
    ctx.lineTo(24, 20);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = blueEdge;
    ctx.stroke();
    ctx.fillStyle = blueDark;
    ctx.beginPath();
    ctx.ellipse(12, carH - 4, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(64, carH - 4, 10, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = wheelColor;
    ctx.beginPath();
    ctx.ellipse(12, carH - 4, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(64, carH - 4, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(38, carH - 4, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    const pusherX = carX - 28;
    drawPixelContestant(contestant, pusherX, laneY + laneH / 2 - 26, 3, {
      shirtColor: contestant.id === gameState.tournament.currentLeaderId ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT,
      shortsColor: "#ffffff",
    });
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
    drawCheeringCrowd(
      k.cheerPositions.length > 0
        ? k.cheerPositions
        : [
            { x: 110, y: 188 },
            { x: 150, y: 190 },
            { x: 190, y: 188 },
            { x: 230, y: 190 },
            { x: 270, y: 188 },
          ],
      contestant.id,
      k.sunglassesCheererId,
      2
    );

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

    const liveBest = getLiveKivenBestDistance();
    if (liveBest > 0) {
      const bestX = Math.min(field.x + field.w - 10, k.throwLineX + liveBest * 28);
      ctx.strokeStyle = "#ffd27d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bestX, 222);
      ctx.lineTo(bestX, 350);
      ctx.stroke();
      ctx.fillStyle = "#ffd27d";
      ctx.font = "12px monospace";
      ctx.fillText("PARAS", bestX - 18, 218);
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

  function drawKevytheittoScene(contestant) {
    const k = gameState.kevytheitto;
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
    drawCheeringCrowd(
      k.cheerPositions.length > 0
        ? k.cheerPositions
        : [
            { x: 110, y: 188 },
            { x: 150, y: 190 },
            { x: 190, y: 188 },
            { x: 230, y: 190 },
            { x: 270, y: 188 },
          ],
      contestant.id,
      k.sunglassesCheererId,
      2
    );

    drawPixelContestant(contestant, k.positionX - 16, y - 52, 3, {
      shirtColor: contestant.id === gameState.tournament.currentLeaderId ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT,
      shortsColor: "#ffffff",
    });

    const matchX = k.positionX + 12;
    const matchY = y - 34;
    drawMatchstick(matchX, matchY, k.tapFlash > 0 ? "#f2c874" : "#d6aa55", "#f2994a", 1.15);

    if (k.phase === "throwing" && !k.isFoul) {
      const t = k.throwAnimT;
      const fx0 = matchX;
      const fy0 = matchY;
      const landingX = Math.min(field.x + field.w - 12, k.throwLineX + k.throwDistance * 28);
      const fx = fx0 + t * (landingX - fx0);
      const fy = fy0 - Math.sin(t * Math.PI) * 26;
      drawMatchstick(fx, fy, "#f6d68d", "#f2a66d", 0.95);
      ctx.fillStyle = "#ffffff";
      ctx.fillText(`${k.throwDistance.toFixed(1)} m`, Math.min(field.x + field.w - 70, fx + 12), fy - 10);
    }

    const liveBest = getLiveKevytBestDistance();
    if (liveBest > 0) {
      const bestX = Math.min(field.x + field.w - 10, k.throwLineX + liveBest * 28);
      ctx.strokeStyle = "#ffd27d";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(bestX, 222);
      ctx.lineTo(bestX, 350);
      ctx.stroke();
      ctx.fillStyle = "#ffd27d";
      ctx.font = "12px monospace";
      ctx.fillText("PARAS", bestX - 18, 218);
    }

    ctx.fillStyle = "#cfe2ff";
    ctx.font = "12px monospace";
    const markers = [1, 2, 3];
    markers.forEach((m) => {
      const mx = Math.min(field.x + field.w - 10, k.throwLineX + m * 28);
      ctx.fillRect(mx, 318, 2, 24);
      ctx.fillText(`${m}m`, mx - 8, 356);
    });
  }

  function drawMatchstick(x, y, bodyColor, tipColor, scale = 1) {
    const w = 8 * scale;
    const h = 2 * scale;
    ctx.fillStyle = bodyColor;
    ctx.fillRect(x - w / 2, y - h / 2, w, h);
    ctx.fillStyle = tipColor;
    ctx.fillRect(x + w / 2 - 2 * scale, y - h / 2 - 0.5 * scale, 2.5 * scale, 3 * scale);
  }

  function getLiveKevytBestDistance() {
    const runs = gameState.kevytheitto.finishedRuns;
    let best = 0;
    runs.forEach((run) => {
      if (!run.foul && run.distance > best) {
        best = run.distance;
      }
    });
    const k = gameState.kevytheitto;
    if (k.phase === "throwing" && !k.isFoul) {
      best = Math.max(best, k.throwDistance);
    }
    return best;
  }

  function getKevytLiveLeaderboard() {
    const k = gameState.kevytheitto;
    const byId = new Map();
    gameState.tournament.contestants.forEach((c) => {
      byId.set(c.id, {
        id: c.id,
        name: c.name,
        best: 0,
        hasResult: false,
        foulOnly: true,
      });
    });

    k.finishedRuns.forEach((run) => {
      const row = byId.get(run.id);
      if (!row) {
        return;
      }
      row.hasResult = true;
      if (!run.foul) {
        row.foulOnly = false;
        row.best = Math.max(row.best, run.distance);
      }
    });

    return [...byId.values()].sort((a, b) => b.best - a.best);
  }

  function drawKevytLeaderboard() {
    const rows = getKevytLiveLeaderboard().slice(0, 8);
    const x = 625;
    const y = 170;
    const w = 235;
    const h = 195;
    drawPanel(x, y, w, h);
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 15px monospace";
    ctx.fillText("LIVE", x + 10, y + 24);
    ctx.fillText("PARAS", x + 150, y + 24);
    ctx.font = "12px monospace";
    rows.forEach((row, idx) => {
      const yy = y + 46 + idx * 18;
      const contestant = gameState.tournament.contestants.find((c) => c.id === row.id);
      const isHuman = contestant?.controller === "human";
      ctx.fillStyle = isHuman ? "#7dffb3" : "#d7f1ff";
      ctx.fillText(`${idx + 1}. ${row.name}`, x + 10, yy);
      const metric = row.best > 0 ? `${row.best.toFixed(1)}m` : row.hasResult ? "HYL." : "-";
      ctx.fillText(metric, x + 150, yy);
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

  function drawKivenLeaderboard() {
    const rows = getKivenLiveLeaderboard();
    const panelX = 620;
    const panelY = 66;
    const panelW = 240;
    const panelH = 290;

    ctx.fillStyle = "rgba(25, 18, 52, 0.85)";
    ctx.fillRect(panelX, panelY, panelW, panelH);
    ctx.strokeStyle = "#a57aff";
    ctx.lineWidth = 3;
    ctx.strokeRect(panelX, panelY, panelW, panelH);

    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 16px monospace";
    ctx.textAlign = "left";
    ctx.fillText("KIVENHEITTO TOP", panelX + 12, panelY + 24);

    ctx.font = "13px monospace";
    rows.forEach((row, i) => {
      const y = panelY + 48 + i * 28;
      const color = i === 0 ? "#ffd27d" : "#d7f1ff";
      ctx.fillStyle = color;
      ctx.fillText(`${i + 1}. ${row.name}`, panelX + 12, y);
      ctx.textAlign = "right";
      ctx.fillText(row.metricText, panelX + panelW - 12, y);
      ctx.textAlign = "left";
    });
  }

  function getLiveKivenBestDistance() {
    const k = gameState.kivenheitto;
    let best = 0;
    k.finishedRuns.forEach((run) => {
      if (!run.foul && run.distance > best) {
        best = run.distance;
      }
    });
    if (k.phase === "throwing" && !k.isFoul) {
      best = Math.max(best, k.throwDistance);
    }
    return best;
  }

  function getKivenLiveLeaderboard() {
    const k = gameState.kivenheitto;
    const contestants = gameState.tournament.contestants;
    const bestById = new Map();

    contestants.forEach((c) => {
      bestById.set(c.id, 0);
    });

    k.finishedRuns.forEach((run) => {
      if (run.foul) {
        return;
      }
      const prev = bestById.get(run.id) ?? 0;
      if (run.distance > prev) {
        bestById.set(run.id, run.distance);
      }
    });

    if (k.phase === "throwing" && !k.isFoul && k.currentContestantId) {
      const prev = bestById.get(k.currentContestantId) ?? 0;
      bestById.set(k.currentContestantId, Math.max(prev, k.throwDistance));
    }

    const rows = contestants.map((c) => {
      const best = bestById.get(c.id) ?? 0;
      return {
        id: c.id,
        name: c.name,
        best,
        metricText: best > 0 ? `${best.toFixed(1)} m` : "-",
      };
    });

    rows.sort((a, b) => {
      if (b.best !== a.best) {
        return b.best - a.best;
      }
      return a.name.localeCompare(b.name);
    });

    return rows;
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

    ctx.strokeStyle = "#ffcf66";
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(track.finishLineX, 206);
    ctx.lineTo(track.finishLineX, 356);
    ctx.stroke();
    ctx.fillStyle = "#ffcf66";

    ctx.fillStyle = "#d24545";
    ctx.beginPath();
    ctx.arc(track.buoy.x, track.buoy.y, 14, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#ffd7d7";
    ctx.fillRect(track.buoy.x - 3, track.buoy.y - 21, 6, 7);
    ctx.fillStyle = "#d7f1ff";

    // Soudussa yleiso on laiturilla.
    const soutuCheererAnchor = drawCheeringCrowd(
      [
        { x: 84, y: 254 },
        { x: 104, y: 246 },
        { x: 124, y: 252 },
        { x: 144, y: 244 },
        { x: 160, y: 252 },
        { x: 174, y: 244 },
        { x: 186, y: 252 },
      ],
      contestant.id,
      gameState.soutu.sunglassesCheererId,
      2
    );
    if (gameState.soutu.phase === "starterCall" && soutuCheererAnchor) {
      drawSpeechBubbleFromAnchor(soutuCheererAnchor, "AJANOTTAJA VALMIS!");
    } else if (gameState.soutu.shoutTimer > 0 && soutuCheererAnchor) {
      drawSpeechBubbleFromAnchor(soutuCheererAnchor, gameState.soutu.shoutText);
    }

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

    const polkyCheererAnchor = drawCheeringCrowd(
      [
        { x: 108, y: 188 },
        { x: 148, y: 190 },
        { x: 188, y: 188 },
        { x: 228, y: 190 },
        { x: 268, y: 188 },
        { x: 308, y: 190 },
        { x: 348, y: 188 },
      ],
      contestant.id,
      p.sunglassesCheererId,
      2
    );
    if (p.phase === "starterCall" && polkyCheererAnchor) {
      drawSpeechBubbleFromAnchor(polkyCheererAnchor, "AJANOTTAJA VALMIS!");
    } else if (p.shoutTimer > 0 && polkyCheererAnchor) {
      drawSpeechBubbleFromAnchor(polkyCheererAnchor, p.shoutText);
    }

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
    const tilt = Math.atan2(Math.sin(pose.angle), Math.abs(Math.cos(pose.angle)));
    if (!pose.headingRight) {
      ctx.scale(-1, 1);
    }
    ctx.rotate(tilt);
    ctx.fillStyle = "#d7c84a";
    ctx.fillRect(-10, -10, 26, 13);
    ctx.fillStyle = "#4a4a4f";
    ctx.beginPath();
    ctx.arc(-5, 10, 6, 0, Math.PI * 2);
    ctx.arc(12, 10, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = "#d7f1ff";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(-10, -4);
    ctx.lineTo(-24, -12);
    ctx.stroke();
    if (!p.logDropped) {
      ctx.fillStyle = "#7b4c2a";
      ctx.fillRect(-13, -21, 30, 10);
    }
    ctx.restore();

    if (p.logDropped) {
      const t = p.logDropProgress;
      const dir = pose.headingRight ? 1 : -1;
      const startX = pose.x + dir * 2;
      const startY = pose.y - 20;
      const endX = pose.x - dir * 26;
      const endY = pose.y + 20;
      const lx = startX + (endX - startX) * t;
      const ly = startY + (endY - startY) * t + Math.sin(t * Math.PI) * 8;
      ctx.save();
      ctx.translate(lx, ly);
      ctx.rotate((Math.atan2(Math.sin(pose.angle), Math.abs(Math.cos(pose.angle))) * (1 - t)) - t * 0.7);
      ctx.fillStyle = "#6b3f20";
      ctx.fillRect(-17, -5, 34, 10);
      ctx.restore();
    }

    const contestantX = pose.headingRight ? pose.x - 34 : pose.x + 10;
    drawPixelContestant(contestant, contestantX, pose.y - 48, 3, {
      shirtColor: contestant.id === gameState.tournament.currentLeaderId ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT,
      shortsColor: "#ffffff",
    });
  }

  function drawBoat(pose, contestant) {
    const x = pose.x;
    const y = pose.y;
    const rowPhase = (performance.now() / 1000) * (1.8 + Math.min(3.2, gameState.soutu.speed * 0.035));
    const stroke = Math.sin(rowPhase);
    const oarSwing = stroke * 8;
    const oarPull = stroke > 0 ? 5 : -4;
    ctx.save();
    ctx.translate(x, y);
    // Paluumatkalla veneen keula on poijun takana oikein menosuuntaan.
    const visualAngle = pose.stage === "paluu" || pose.stage === "maalin-jalkeen" ? pose.angle + Math.PI : pose.angle;
    ctx.rotate(visualAngle);

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
    // Airot liikkuvat parina edestaakse soutulyonnin mukaan.
    ctx.beginPath();
    ctx.moveTo(-7 + oarPull * 0.4, -2);
    ctx.lineTo(-20 + oarPull, -oarOffset - oarSwing);
    ctx.moveTo(7 + oarPull * 0.4, 2);
    ctx.lineTo(20 + oarPull, oarOffset + oarSwing);
    ctx.stroke();

    ctx.restore();
  }

  function drawCheeringCrowd(positions, currentContestantId, sunglassesCheererId, scale) {
    const supporters = gameState.tournament.contestants.filter((c) => c.id !== currentContestantId);
    if (supporters.length === 0) {
      return null;
    }
    let sunglassesAnchor = null;
    positions.forEach((pos, i) => {
      const c = supporters[i % supporters.length];
      const isLeader = c.id === gameState.tournament.currentLeaderId;
      const isChampion = c.id === gameState.tournament.championId;
      const shirtColor = isChampion ? SHIRT_COLORS.CHAMPION : isLeader ? SHIRT_COLORS.LEADER : SHIRT_COLORS.DEFAULT;
      drawPixelContestant(c, pos.x, pos.y, scale, { shirtColor, shortsColor: "#ffffff" });
      if (c.id === sunglassesCheererId) {
        drawBigSunglasses(pos.x, pos.y, scale);
        sunglassesAnchor = { x: pos.x + 6 * scale, y: pos.y + 4 * scale };
      }
    });
    return sunglassesAnchor;
  }

  function drawBigSunglasses(x, y, scale) {
    ctx.fillStyle = "#0b0b0b";
    ctx.fillRect(x + 0.4 * scale, y + 4.7 * scale, 3.2 * scale, 2.0 * scale);
    ctx.fillRect(x + 4.2 * scale, y + 4.7 * scale, 3.2 * scale, 2.0 * scale);
    ctx.fillRect(x + 3.0 * scale, y + 5.2 * scale, 1.2 * scale, 0.7 * scale);
  }

  function drawSpeechBubbleFromAnchor(anchor, text) {
    const w = 252;
    const h = 42;
    const x = Math.max(12, Math.min(canvas.width - w - 12, anchor.x - w * 0.38));
    const y = Math.max(12, anchor.y - 74);
    const tailX = Math.max(x + 26, Math.min(x + w - 26, anchor.x - 4));
    const tailTipY = anchor.y - 6;

    ctx.fillStyle = "#ffffff";
    drawRoundedRect(x, y, w, h, 12);
    ctx.fill();
    ctx.strokeStyle = "#1e1e1e";
    ctx.lineWidth = 2.5;
    drawRoundedRect(x, y, w, h, 12);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(tailX - 9, y + h - 2);
    ctx.quadraticCurveTo(tailX - 1, y + h + 6, tailX + 3, tailTipY);
    ctx.quadraticCurveTo(tailX + 7, y + h + 5, tailX + 13, y + h - 2);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#1e1e1e";
    ctx.font = "bold 15px monospace";
    ctx.textAlign = "left";
    ctx.fillText(text, x + 12, y + 27);
  }

  function drawRoundedRect(x, y, w, h, r) {
    const rr = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rr, y);
    ctx.arcTo(x + w, y, x + w, y + h, rr);
    ctx.arcTo(x + w, y + h, x, y + h, rr);
    ctx.arcTo(x, y + h, x, y, rr);
    ctx.arcTo(x, y, x + w, y, rr);
    ctx.closePath();
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

    const isTriathlon = results.eventName === "Triathlon";
    ctx.font = "19px monospace";
    ctx.fillStyle = "#a3d5ff";
    ctx.fillText("Sija", 120, 145);
    ctx.fillText("Nimi", 200, 145);
    if (isTriathlon) {
      ctx.fillText("Aika", 330, 145);
      ctx.fillText("Tikka", 430, 145);
      ctx.fillText("Lopputulos", 510, 145);
    } else {
      ctx.fillText(results.metricLabel || "Tulos", 450, 145);
    }
    ctx.fillText("+P", 640, 145);
    ctx.fillText("Yht.", 700, 145);

    results.rows.forEach((row, i) => {
      const y = 180 + i * 34;
      const contestant = gameState.tournament.contestants.find((c) => c.id === row.id);
      const isHuman = contestant?.controller === "human";
      ctx.fillStyle = isHuman ? "#7dffb3" : "#d7f1ff";
      ctx.fillText(String(row.rank), 120, y);
      ctx.fillText(row.name, 200, y);
      if (isTriathlon && typeof row.totalTime === "number" && typeof row.dartScore === "number" && typeof row.finalScore === "number") {
        ctx.fillText(`${row.totalTime.toFixed(2)} s`, 330, y);
        ctx.fillText(String(row.dartScore), 430, y);
        ctx.fillText(row.finalScore.toFixed(1), 510, y);
      } else {
        ctx.fillText(getResultMetricText(row), 450, y);
      }
      ctx.fillText(String(row.pointsAwarded), 640, y);
      ctx.fillText(String(row.totalPoints), 700, y);
    });

    const isTriathlonResults = isTriathlon;
    const continueBtn = {
      x: 590,
      y: 410,
      w: 250,
      h: 56,
      label: gameState.quickTest.enabled ? "TAKAISIN TESTIIN" : isTriathlonResults ? "NÄYTÄ VOITTAJA" : "JATKA MUNAJAISIA",
    };
    addButton(continueBtn.x, continueBtn.y, continueBtn.w, continueBtn.h, continueBtn.label, () => {
      if (gameState.quickTest.enabled) {
        setScreen(SCREEN.TEST_MENU);
        return;
      }
      if (isTriathlonResults) {
        setScreen(SCREEN.FINAL);
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
    if (typeof row.finalScore === "number") {
      return `${row.finalScore.toFixed(1)}`;
    }
    if (typeof row.time === "number") {
      return `${row.time.toFixed(2)} s`;
    }
    if (typeof row.distance === "number") {
      return `${row.distance.toFixed(1)} m`;
    }
    return "-";
  }

  function drawFinal() {
    drawPanel(80, 40, 800, 460);
    const championId = gameState.tournament.championId;
    const champion = gameState.tournament.contestants.find((c) => c.id === championId);
    ctx.fillStyle = "#d7f1ff";
    ctx.font = "bold 38px monospace";
    ctx.textAlign = "center";
    ctx.fillText("MUNAJAISET OHI!", 480, 95);
    ctx.font = "bold 28px monospace";
    ctx.fillStyle = "#ffcf66";
    ctx.fillText("MUNAMIES", 480, 155);
    if (champion) {
      ctx.fillStyle = "#d7f1ff";
      ctx.font = "26px monospace";
      ctx.fillText(champion.name, 480, 200);
      drawPixelContestant(champion, 480 - 40, 230, 5, {
        shirtColor: SHIRT_COLORS.CHAMPION,
        shortsColor: "#ffffff",
      });
    }
    const confetti = gameState.finalConfetti || [];
    if (confetti.length === 0 && typeof gameState.finalConfetti === "undefined") {
      gameState.finalConfetti = [];
      for (let i = 0; i < 50; i += 1) {
        gameState.finalConfetti.push({
          x: 200 + Math.random() * 560,
          y: -10 - Math.random() * 100,
          vx: (Math.random() - 0.5) * 80,
          vy: 60 + Math.random() * 80,
          w: 8 + Math.random() * 12,
          h: 6 + Math.random() * 8,
          color: ["#ff6b9f", "#8fd8ff", "#ffcf66", "#7dffb3", "#c77dff"][Math.floor(Math.random() * 5)],
        });
      }
    }
    if (gameState.finalConfetti && gameState.finalConfetti.length > 0) {
      gameState.finalConfetti.forEach((c) => {
        c.x += c.vx * 0.016;
        c.y += c.vy * 0.016;
        c.vy += 25 * 0.016;
        ctx.fillStyle = c.color;
        ctx.fillRect(c.x, c.y, c.w, c.h);
      });
    }
    ctx.textAlign = "left";
    addButton(380, 400, 200, 56, "ALOITA ALUSTA", () => {
      gameState.eventIndex = 0;
      gameState.tournament.championId = null;
      gameState.tournament.contestants = [];
      gameState.finalConfetti = undefined;
      setScreen(SCREEN.TITLE);
    });
    drawButtons();
  }

  function drawPixelContestant(contestant, x, y, scale, style) {
    const shirtColor = style?.shirtColor ?? SHIRT_COLORS.DEFAULT;
    const shortsColor = style?.shortsColor ?? "#ffffff";
    const p = contestant.colors;
    const isPorge = contestant.id === "porge-arthuros";
    const isLirkki = contestant.id === "lirkki";
    const isPokki = contestant.id === "pokki";
    const isPressa = contestant.id === "pressa";
    const isHarpo = contestant.id === "harpo";
    const isRippeli = contestant.id === "rippeli";
    const isAndil = contestant.id === "andil";
    const characterShirtColor =
      shirtColor === SHIRT_COLORS.LEADER || shirtColor === SHIRT_COLORS.CHAMPION
        ? shirtColor
        : isPressa
          ? "#9a6b46"
          : isPorge || isLirkki || isHarpo
            ? "#c52828"
            : shirtColor;
    const characterShortsColor = isRippeli ? "#4a4a4a" : shortsColor;

    const px = (dx, dy, w, h, color) => {
      ctx.fillStyle = color;
      ctx.fillRect(x + dx * scale, y + dy * scale, w * scale, h * scale);
    };

    if (isPorge) {
      // Selvasti laihempi, pitka siluetti.
      px(2, 2, 4, 2, p.hair);
      px(2, 4, 4, 4, p.skin);
      px(3, 5, 1, 1, p.eyes);
      px(4, 5, 1, 1, p.eyes);
      px(2, 8, 4, 6, characterShirtColor);
      px(2, 14, 4, 3, shortsColor);
      px(1, 9, 1, 4, p.skin);
      px(6, 9, 1, 4, p.skin);
      px(2, 17, 1, 3, p.skin);
      px(5, 17, 1, 3, p.skin);
      return;
    }

    if (isLirkki) {
      // Lirkki on hoikka ja muita lyhyempi.
      px(2, 3, 4, 2, p.hair);
      px(2, 5, 4, 3, p.skin);
      px(3, 6, 1, 1, p.eyes);
      px(4, 6, 1, 1, p.eyes);
      px(2, 8, 4, 4, characterShirtColor);
      px(2, 12, 4, 2, shortsColor);
      px(1, 9, 1, 3, p.skin);
      px(6, 9, 1, 3, p.skin);
      px(2, 14, 1, 2, p.skin);
      px(5, 14, 1, 2, p.skin);
      return;
    }

    if (isAndil) {
      px(2, 2, 4, 2, p.hair);
    } else {
      px(0, 2, 8, 2, p.hair);
    }
    if (isRippeli) {
      px(0, 3, 8, 1, "#1a1a1a");
    }
    px(1, 4, 6, 4, p.skin);
    px(2, 5, 1, 1, p.eyes);
    px(5, 5, 1, 1, p.eyes);
    px(0, 8, 8, 5, characterShirtColor);
    px(0, 13, 8, 3, characterShortsColor);
    px(-1, 9, 1, 3, p.skin);
    px(8, 9, 1, 3, p.skin);
    px(1, 16, 2, 3, p.skin);
    px(5, 16, 2, 3, p.skin);

    if (isPokki) {
      // Pokille lila bolero paidan paalle.
      px(0, 8, 2, 4, "#b57dff");
      px(6, 8, 2, 4, "#b57dff");
      px(2, 8, 4, 2, "#b57dff");
    }

    if (isPressa) {
      // Pressalle oranssit viikset + lyhyt parta.
      px(2, 7, 1, 1, "#e5791c");
      px(3, 7, 2, 1, "#e5791c");
      px(5, 7, 1, 1, "#e5791c");
      px(3, 8, 2, 1, "#c76012");
      px(3, 9, 2, 1, "#c76012");
    }

    if (isHarpo) {
      // Harpolle mustat viikset + lyhyt parta.
      px(2, 7, 1, 1, "#1b1b1b");
      px(3, 7, 2, 1, "#1b1b1b");
      px(5, 7, 1, 1, "#1b1b1b");
      px(3, 8, 2, 1, "#0f0f0f");
      px(3, 9, 2, 1, "#0f0f0f");
    }
  }

  function drawButtons() {
    gameState.ui.buttons.forEach((button) => {
      if (button.visible) {
        drawButton(button);
      }
    });
  }

  function handlePointerDown(event) {
    tryLockLandscape();
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
    onKevytheittoTap();
    onPolkyTap();
    onPaskantyontoTap();
    onTriathlonTap();
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
