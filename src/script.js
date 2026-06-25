// === DEEPER & CLEANER AUDIO ENGINE ===
window.audioCtx = new (window.AudioContext || window.webkitAudioContext)();

window.playSound = function(type) {
    if(window.audioCtx.state === 'suspended') window.audioCtx.resume();
    const osc = window.audioCtx.createOscillator();
    const gainNode = window.audioCtx.createGain();
    const filter = window.audioCtx.createBiquadFilter();

    filter.type = 'lowpass'; 
    filter.frequency.value = 350; 
    
    osc.connect(filter); 
    filter.connect(gainNode); 
    gainNode.connect(window.audioCtx.destination);

    const now = window.audioCtx.currentTime;

    if(type === 'open') {
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(130, now); 
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.18);
        gainNode.gain.setValueAtTime(0, now); 
        gainNode.gain.linearRampToValueAtTime(0.15, now + 0.04); 
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'close') {
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(220, now); 
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
        gainNode.gain.setValueAtTime(0, now); 
        gainNode.gain.linearRampToValueAtTime(0.12, now + 0.04); 
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'click') {
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(160, now);
        gainNode.gain.setValueAtTime(0.12, now); 
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now); osc.stop(now + 0.04);
    } else if (type === 'move') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(220, now);
        gainNode.gain.setValueAtTime(0.05, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.start(now); osc.stop(now + 0.05);
    } else if (type === 'rotate') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(340, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);
        gainNode.gain.setValueAtTime(0.09, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc.start(now); osc.stop(now + 0.09);
    } else if (type === 'drop') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(55, now + 0.12);
        gainNode.gain.setValueAtTime(0.2, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.start(now); osc.stop(now + 0.13);
    } else if (type === 'gameover') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.6);
        gainNode.gain.setValueAtTime(0.16, now);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.start(now); osc.stop(now + 0.6);
    }
};

// Kurzes aufsteigendes Arpeggio für gecleartes Tetris-Linien (1-4 Töne je nach Anzahl)
window.playLineClearSound = function(linesCleared) {
    if(window.audioCtx.state === 'suspended') window.audioCtx.resume();
    const notes = [523.25, 659.25, 783.99, 1046.5];
    const count = Math.min(linesCleared, 4);
    for(let i = 0; i < count; i++) {
        const osc = window.audioCtx.createOscillator();
        const gainNode = window.audioCtx.createGain();
        osc.type = 'triangle';
        osc.connect(gainNode);
        gainNode.connect(window.audioCtx.destination);
        const startTime = window.audioCtx.currentTime + i * 0.08;
        osc.frequency.setValueAtTime(notes[i], startTime);
        gainNode.gain.setValueAtTime(0.0001, startTime);
        gainNode.gain.linearRampToValueAtTime(0.16, startTime + 0.02);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.2);
        osc.start(startTime); osc.stop(startTime + 0.22);
    }
};

// === MAUS ENGINE ===
const cursorDot = document.getElementById('cursor-dot');
const cursorOutline = document.getElementById('cursor-outline');
let mouseX = window.innerWidth/2, mouseY = window.innerHeight/2;
let outX = mouseX, outY = mouseY;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX; mouseY = e.clientY;
    if(cursorDot) { cursorDot.style.left = mouseX + 'px'; cursorDot.style.top = mouseY + 'px'; }
});

function animateCursor() {
    outX += (mouseX - outX) * 0.1; 
    outY += (mouseY - outY) * 0.1;
    if(cursorOutline) { cursorOutline.style.left = outX + 'px'; cursorOutline.style.top = outY + 'px'; }
    requestAnimationFrame(animateCursor);
}
animateCursor();

// Kleiner "Pop"-Bounce für Score-/Ergebnis-Anzeigen
function popElement(el) {
    if(!el) return;
    el.classList.remove('score-pop');
    void el.offsetWidth;
    el.classList.add('score-pop');
}

// === CURSOR SELECTION ENGINE ===
window.setCursorType = function(type) {
    window.playSound('click');
    const circleBtn = document.getElementById('cursor-circle-btn');
    const crossBtn = document.getElementById('cursor-cross-btn');
    const dotBtn = document.getElementById('cursor-dot-btn');
    
    document.body.classList.remove('cross-mode', 'dot-mode');
    [circleBtn, crossBtn, dotBtn].forEach(btn => { if(btn) btn.classList.remove('active-mode'); });

    if(type === 'cross') {
        document.body.classList.add('cross-mode');
        if(crossBtn) crossBtn.classList.add('active-mode');
    } else if(type === 'dot') {
        document.body.classList.add('dot-mode');
        if(dotBtn) dotBtn.classList.add('active-mode');
    } else {
        if(circleBtn) circleBtn.classList.add('active-mode');
    }
};

// === GLOBAL THEME ACCENT ENGINE ===
window.changeBg = function(gradient, accentHex, glowRGBA, el) { 
    const bgLayer = document.getElementById('desktop-bg-layer');
    if(bgLayer) {
        bgLayer.style.background = gradient;
        bgLayer.style.backgroundImage = gradient;
        bgLayer.style.backgroundSize = "400% 400%";
    }
    document.documentElement.style.setProperty('--accent-color', accentHex);
    document.documentElement.style.setProperty('--accent-glow', glowRGBA);
    if(el) {
        const group = el.closest('.color-grid');
        if(group) group.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
        el.classList.add('selected');
    }
    window.playSound('click'); 
};

window.changeCursorColor = function(hex, el) { 
    document.documentElement.style.setProperty('--cursor-color', hex); 
    if(el) {
        const group = el.closest('.color-grid');
        if(group) group.querySelectorAll('.color-btn').forEach(btn => btn.classList.remove('selected'));
        el.classList.add('selected');
    }
    window.playSound('click'); 
};

// === GLAS-ANPASSUNG (Unschärfe) ===
function fillSliderTrack(el) {
    if(!el) return;
    const min = parseFloat(el.min), max = parseFloat(el.max), val = parseFloat(el.value);
    const pct = ((val - min) / (max - min)) * 100;
    el.style.background = `linear-gradient(90deg, var(--accent-color) 0%, var(--accent-color) ${pct}%, rgba(255,255,255,0.12) ${pct}%, rgba(255,255,255,0.12) 100%)`;
}

window.changeBlurAmount = function(val) {
    document.documentElement.style.setProperty('--glass-blur', val + 'px');
    fillSliderTrack(document.getElementById('blur-slider'));
};

document.addEventListener('DOMContentLoaded', () => {
    fillSliderTrack(document.getElementById('blur-slider'));
});

// === LOGIN LOGIK & LOGOUT ===
window.checkLogin = function() {
    window.playSound('click');
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    const errorMsg = document.getElementById('login-error');
    if (!userField || !passField) return;

    if (userField.value.trim().toLowerCase() === "admin" && passField.value.trim().startsWith("Brat")) {
        const loginScreen = document.getElementById('login-screen');
        loginScreen.style.opacity = '0';
        loginScreen.style.pointerEvents = 'none';
        window.playSound('open');
        setTimeout(() => { document.getElementById('os-workspace').style.display = 'block'; }, 600);
    } else {
        errorMsg.style.display = 'block';
    }
};

window.logoutOS = function() {
    window.playSound('close');
    document.getElementById('os-workspace').style.display = 'none';
    const loginScreen = document.getElementById('login-screen');
    loginScreen.style.opacity = '1';
    loginScreen.style.pointerEvents = 'auto';
    document.getElementById('password').value = '';
    document.getElementById('login-error').style.display = 'none';
    
    document.querySelectorAll('.window.active').forEach(win => {
        win.classList.remove('active');
    });
};

// === SYSTEM DIALOG ===
window.showOSDialog = function(title, msg) {
    document.getElementById('dialog-title').innerText = title;
    document.getElementById('dialog-content').innerText = msg;
    document.getElementById('os-dialog-overlay').style.display = 'flex';
};
document.getElementById('dialog-ok').addEventListener('click', () => {
    window.playSound('click');
    document.getElementById('os-dialog-overlay').style.display = 'none';
});

// === FENSTER ENGINE ===
window.highestZIndex = 10;

function syncDockIndicator(appId) {
    const tile = document.querySelector('.app-tile[data-app="' + appId + '"]');
    if(!tile) return;
    const app = document.getElementById(appId);
    if(app && app.classList.contains('active')) tile.classList.add('tile-open');
    else tile.classList.remove('tile-open');
}

window.toggleApp = function(appId) {
    const app = document.getElementById(appId);
    if (!app) return;
    if (app.classList.contains('active')) { closeApp(appId); } else { openApp(appId); }
};

window.openApp = function(appId) {
    const app = document.getElementById(appId);
    if (!app) return;
    window.playSound('open');
    app.classList.add('active');
    window.highestZIndex++;
    app.style.zIndex = window.highestZIndex;
    
    if (!app.dataset.targetX) {
        app.dataset.targetX = parseInt(app.style.left || 100);
        app.dataset.currentX = app.dataset.targetX;
        app.dataset.targetY = parseInt(app.style.top || 100);
        app.dataset.currentY = app.dataset.targetY;
    }
    syncDockIndicator(appId);
};

window.closeApp = function(appId) {
    window.playSound('close');
    const app = document.getElementById(appId);
    if(app) app.classList.remove('active');
    if(appId === 'snake' && typeof resetSnakeGame === 'function') resetSnakeGame();
    if(appId === 'lytetris' && typeof resetTetrisGame === 'function') resetTetrisGame();
    if(appId === 'lyracer' && typeof resetRacerGame === 'function') resetRacerGame();
    syncDockIndicator(appId);
};

// DRAG SYSTEM
let activeDragWindow = null;
let dragOffsetX = 0, dragOffsetY = 0;

document.querySelectorAll('.window-header').forEach(header => {
    header.addEventListener('mousedown', (e) => {
        if(e.target.classList.contains('btn') || e.target.tagName.toLowerCase() === 'input' || e.target.tagName.toLowerCase() === 'button') return; 
        e.preventDefault();
        const win = header.closest('.window');
        window.highestZIndex++; win.style.zIndex = window.highestZIndex;
        activeDragWindow = win;
        
        const rect = win.getBoundingClientRect();
        dragOffsetX = e.clientX - rect.left;
        dragOffsetY = e.clientY - rect.top;
    });
});

document.addEventListener('mousemove', (e) => {
    if (!activeDragWindow) return;
    activeDragWindow.dataset.targetX = e.clientX - dragOffsetX;
    activeDragWindow.dataset.targetY = e.clientY - dragOffsetY;
});

document.addEventListener('mouseup', (e) => {
    if (activeDragWindow) activeDragWindow = null;
});

function renderWindows() {
    document.querySelectorAll('.window.active').forEach(win => {
        if (win.dataset.targetX !== undefined) {
            let tX = parseFloat(win.dataset.targetX); let tY = parseFloat(win.dataset.targetY);
            let cX = parseFloat(win.dataset.currentX); let cY = parseFloat(win.dataset.currentY);
            cX += (tX - cX) * 0.2; cY += (tY - cY) * 0.2;
            win.dataset.currentX = cX; win.dataset.currentY = cY;
            win.style.left = cX + 'px'; win.style.top = cY + 'px';
        }
    });
    requestAnimationFrame(renderWindows);
}
renderWindows();

// === TERMINAL ===
const termInput = document.getElementById('term-input');
const termOutput = document.getElementById('terminal-output');

if (termInput) {
    termInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const val = termInput.value;
            termOutput.innerHTML += `<br><span style="color:#fff">lyra@admin:~$</span> ${val}`;
            
            if (val === 'help') termOutput.innerHTML += `<br>Verfügbare Befehle: help, clear, echo [text], date, whoami`;
            else if (val === 'clear') termOutput.innerHTML = `Lyra 3 loaded.<br>Tippe 'help' für Befehle.`;
            else if (val === 'date') termOutput.innerHTML += `<br>${new Date().toLocaleString('de-DE')}`;
            else if (val === 'whoami') termOutput.innerHTML += `<br>Du bist als 'admin' angemeldet.`;
            else if (val.startsWith('echo ')) termOutput.innerHTML += `<br>${val.substring(5)}`;
            else if (val.trim() !== "") termOutput.innerHTML += `<br>Befehl nicht gefunden: ${val}`;
            
            termInput.value = '';
            termOutput.scrollTop = termOutput.scrollHeight;
        }
    });
}

// === FILE EXPLORER STORAGE AND ACTIVE CATEGORY ===
let savedNotes = JSON.parse(localStorage.getItem('lyraNotes')) || [];
let savedImages = JSON.parse(localStorage.getItem('lyraImages')) || [];
let currentExplorerFolder = 'notes'; // 'notes' oder 'bilder'

window.switchExplorerFolder = function(folder) {
    window.playSound('click');
    currentExplorerFolder = folder;
    document.getElementById('sidebar-notes').classList.remove('active');
    document.getElementById('sidebar-images').classList.remove('active');
    
    const addr = document.getElementById('explorer-address');
    if(folder === 'notes') {
        document.getElementById('sidebar-notes').classList.add('active');
        addr.innerText = "C:\\\\LyraSystem\\\\Notizen";
    } else {
        document.getElementById('sidebar-images').classList.add('active');
        addr.innerText = "C:\\\\LyraSystem\\\\Bilder";
    }
    renderExplorer();
};

// === SCHWEBENDES MENU EVENT LOGIC (LONG PRESS & HOLD) ===
let contextMenuTarget = null; // { type: 'notes'/'bilder', id: '...' }
let holdTimer = null;
const ctxMenuEl = document.getElementById('explorer-context-menu');

function attachFileContextEvents(element, type, id) {
    let wasHeld = false;
    
    element.addEventListener('mousedown', (e) => {
        if(e.button !== 0) return; // Nur linker Mausklick
        wasHeld = false;
        holdTimer = setTimeout(() => {
            wasHeld = true;
            window.playSound('click');
            contextMenuTarget = { type, id };
            showFloatingMenu(e.clientX, e.clientY);
        }, 550); // 550ms gedrückt halten löst schwebendes Menü aus
    });

    element.addEventListener('mouseup', () => {
        clearTimeout(holdTimer);
    });

    element.addEventListener('mouseleave', () => {
        clearTimeout(holdTimer);
    });

    element.addEventListener('click', (e) => {
        if(wasHeld) {
            e.preventDefault();
            e.stopPropagation();
            return;
        }
        // Normaler Klick öffnet Datei direkt
        if(type === 'notes') {
            window.openNote(id);
        } else {
            window.openPixelArtItem(id);
        }
    });
}

function showFloatingMenu(x, y) {
    if(!ctxMenuEl) return;
    ctxMenuEl.style.left = (x + 10) + 'px';
    ctxMenuEl.style.top = (y + 5) + 'px';
    ctxMenuEl.style.display = 'flex';
}

// Menü schließen wenn man irgendwo anders hinklickt
document.addEventListener('mousedown', (e) => {
    if(ctxMenuEl && !ctxMenuEl.contains(e.target) && holdTimer === null) {
        ctxMenuEl.style.display = 'none';
    }
});

// Context Menu Action Handlers
document.getElementById('ctx-btn-open').addEventListener('click', () => {
    if(!contextMenuTarget) return;
    ctxMenuEl.style.display = 'none';
    if(contextMenuTarget.type === 'notes') {
        window.openNote(contextMenuTarget.id);
    } else {
        window.openPixelArtItem(contextMenuTarget.id);
    }
});

document.getElementById('ctx-btn-delete').addEventListener('click', () => {
    if(!contextMenuTarget) return;
    ctxMenuEl.style.display = 'none';
    window.playSound('close');
    
    if(contextMenuTarget.type === 'notes') {
        savedNotes = savedNotes.filter(n => n.id !== contextMenuTarget.id);
        localStorage.setItem('lyraNotes', JSON.stringify(savedNotes));
    } else {
        savedImages = savedImages.filter(i => i.id !== contextMenuTarget.id);
        localStorage.setItem('lyraImages', JSON.stringify(savedImages));
    }
    renderExplorer();
});

// === RENDER EXPLORER FUNCTION ===
function renderExplorer() {
    const list = document.getElementById('explorer-list');
    if(!list) return;
    list.innerHTML = '';
    
    if(currentExplorerFolder === 'notes') {
        if(savedNotes.length === 0) {
            list.style.display = 'flex';
            list.innerHTML = '<div style="color: rgba(255,255,255,0.3); margin: auto; font-size: 13px;">Dieser Ordner ist leer.</div>';
            return;
        }
        list.style.display = 'grid'; 
        savedNotes.forEach(note => {
            let div = document.createElement('div');
            div.className = 'explorer-item';
            div.innerHTML = `<div class="file-icon"><svg viewBox="0 0 24 24" width="34" height="34" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg></div> <span>${note.title}</span>`;
            attachFileContextEvents(div, 'notes', note.id);
            list.appendChild(div);
        });
    } else {
        // Bilder-Ordner
        if(savedImages.length === 0) {
            list.style.display = 'flex';
            list.innerHTML = '<div style="color: rgba(255,255,255,0.3); margin: auto; font-size: 13px;">Keine Bilder vorhanden.</div>';
            return;
        }
        list.style.display = 'grid';
        savedImages.forEach(img => {
            let div = document.createElement('div');
            div.className = 'explorer-item';
            div.innerHTML = `<div class="file-icon" style="color: var(--accent-color)"><svg viewBox="0 0 24 24" width="34" height="34" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></div> <span>${img.title}</span>`;
            attachFileContextEvents(div, 'bilder', img.id);
            list.appendChild(div);
        });
    }
}

// === NOTES LOGIC ===
window.saveNote = function() {
    let title = document.getElementById('note-title').value.trim() || "Unbenannte Notiz";
    let content = document.getElementById('note-content').value;
    let id = document.getElementById('note-id').value;

    if(!id) {
        id = "note_" + Date.now();
        savedNotes.push({ id, title, content, date: new Date().toLocaleDateString('de-DE') });
        document.getElementById('note-id').value = id;
    } else {
        let note = savedNotes.find(n => n.id === id);
        if(note) { note.title = title; note.content = content; }
    }
    
    localStorage.setItem('lyraNotes', JSON.stringify(savedNotes));
    window.playSound('open');
    window.showOSDialog("Erfolg", "Deine Notiz wurde gespeichert.");
    renderExplorer();
};

window.createNewNote = function() {
    document.getElementById('note-id').value = "";
    document.getElementById('note-title').value = "";
    document.getElementById('note-content').value = "";
    document.getElementById('note-title').focus();
    window.playSound('click');
};

window.openNote = function(id) {
    let note = savedNotes.find(n => n.id === id);
    if(note) {
        document.getElementById('note-id').value = note.id;
        document.getElementById('note-title').value = note.title;
        document.getElementById('note-content').value = note.content;
        window.openApp('lynotes');
    }
};

// === MODERN PIXEL MAL STUDIO ENGINE ===
let currentPixelTool = 'pencil'; // 'pencil', 'eraser', 'bucket'
let currentPixelColor = '#818cf8';
let pixelGridData = Array(16 * 16).fill('#transparent');
let pixelAppActiveId = null;

function buildPixelGrid() {
    const container = document.getElementById('pixel-canvas-grid');
    if(!container) return;
    container.innerHTML = '';
    for(let i = 0; i < 256; i++) {
        const cell = document.createElement('div');
        cell.className = 'pixel-cell';
        cell.style.backgroundColor = pixelGridData[i] === '#transparent' ? '' : pixelGridData[i];
        
        // Mouse Listeners für flüssiges Zeichnen bei gedrückter Maus
        cell.addEventListener('mousedown', (e) => {
            if(e.button !== 0) return;
            window.handlePixelCellAction(i);
        });
        cell.addEventListener('mouseenter', (e) => {
            if(e.buttons === 1) { // Linke Maustaste gehalten
                window.handlePixelCellAction(i);
            }
        });
        container.appendChild(cell);
    }
}

window.setPixelTool = function(tool) {
    window.playSound('click');
    currentPixelTool = tool;
    document.querySelectorAll('.pixel-tool-btn').forEach(btn => btn.classList.remove('active-mode'));
    document.getElementById('tool-' + tool).classList.add('active-mode');
};

window.updatePixelColor = function(val) {
    currentPixelColor = val;
};

window.handlePixelCellAction = function(index) {
    if(currentPixelTool === 'pencil') {
        pixelGridData[index] = currentPixelColor;
    } else if(currentPixelTool === 'eraser') {
        pixelGridData[index] = '#transparent';
    } else if(currentPixelTool === 'bucket') {
        // Flood Fill Algorithmus für Pixel Studio
        const targetColor = pixelGridData[index];
        if(targetColor === currentPixelColor) return;
        floodFillPixel(index, targetColor, currentPixelColor);
    }
    const cells = document.getElementById('pixel-canvas-grid').children;
    if(cells[index]) {
        cells[index].style.backgroundColor = pixelGridData[index] === '#transparent' ? '' : pixelGridData[index];
    }
};

function floodFillPixel(startIdx, targetColor, replacementColor) {
    let queue = [startIdx];
    let visited = new Set();
    while(queue.length > 0) {
        let idx = queue.shift();
        if(visited.has(idx)) continue;
        visited.add(idx);
        if(pixelGridData[idx] === targetColor) {
            pixelGridData[idx] = replacementColor;
            const cells = document.getElementById('pixel-canvas-grid').children;
            if(cells[idx]) cells[idx].style.backgroundColor = replacementColor === '#transparent' ? '' : replacementColor;
            
            let x = idx % 16;
            let y = Math.floor(idx / 16);
            if(x > 0) queue.push(idx - 1);
            if(x < 15) queue.push(idx + 1);
            if(y > 0) queue.push(idx - 16);
            if(y < 15) queue.push(idx + 16);
        }
    }
}

window.clearPixelGrid = function() {
    window.playSound('close');
    pixelGridData = Array(16 * 16).fill('#transparent');
    buildPixelGrid();
};

window.savePixelArt = function() {
    window.playSound('open');
    let title = prompt("Name für dieses Pixel-Kunstwerk:", "Mein Kunstwerk");
    if(!title || title.trim() === "") title = "Unbenanntes Bild";
    
    const newImg = {
        id: "img_" + Date.now(),
        title: title.trim(),
        grid: [...pixelGridData]
    };
    savedImages.push(newImg);
    localStorage.setItem('lyraImages', JSON.stringify(savedImages));
    window.showOSDialog("Studio", "Bild erfolgreich im Explorer unter 'Bilder' gespeichert.");
    renderExplorer();
};

window.openPixelArtItem = function(id) {
    let img = savedImages.find(i => i.id === id);
    if(img) {
        pixelGridData = [...img.grid];
        buildPixelGrid();
        window.openApp('lypixel');
    }
};

// Initialisiere Grid bei App-Start
buildPixelGrid();

// === TIC TAC TOE ===
let tttBoard = ["","","","","","","","",""];
let tttPlayer = "X";
let tttActive = true;
let currentTTTMode = 'pvp';
let tttWinsX = 0, tttWinsO = 0;
let tttHighscoreX = parseInt(localStorage.getItem('lyraTTTHighscore')) || 0;

function updateTTTHUD() {
    const scoreEl = document.getElementById('ttt-score');
    const hsEl = document.getElementById('ttt-highscore');
    if(scoreEl) scoreEl.innerText = "Siege X: " + tttWinsX + " · O: " + tttWinsO;
    if(hsEl) hsEl.innerText = "Highscore X: " + tttHighscoreX;
}

window.setTTTMode = function(mode) {
    currentTTTMode = mode;
    document.getElementById('btn-pvp').classList.remove('active-mode');
    document.getElementById('btn-pvc').classList.remove('active-mode');
    document.getElementById('btn-' + mode).classList.add('active-mode');
    window.playSound('click');
    initTTT();
}

window.initTTT = function() {
    tttBoard = ["","","","","","","","",""];
    tttPlayer = "X";
    tttActive = true;
    const grid = document.getElementById('tic-grid');
    if(grid) {
        grid.innerHTML = "";
        tttBoard.forEach((cell, i) => {
            const div = document.createElement('div');
            div.onclick = () => handleTTTClick(i, div);
            grid.appendChild(div);
        });
    }
}

function handleTTTClick(index, div) {
    if(tttBoard[index] === "" && tttActive) {
        tttBoard[index] = tttPlayer;
        div.innerText = tttPlayer;
        div.style.color = tttPlayer === "X" ? "var(--accent-color)" : "#f87171";
        div.classList.add('ttt-placed');
        window.playSound('click');
        if (checkTTTWin()) return;
        
        if(tttActive && currentTTTMode === 'pvc') {
            tttPlayer = "O";
            setTimeout(computerTTTMove, 400);
        } else if (tttActive) {
            tttPlayer = tttPlayer === "X" ? "O" : "X";
        }
    }
}

function computerTTTMove() {
    let empty = tttBoard.map((val, i) => val === "" ? i : null).filter(val => val !== null);
    if(empty.length > 0) {
        let randIndex = empty[Math.floor(Math.random() * empty.length)];
        tttBoard[randIndex] = "O";
        const gridDivs = document.getElementById('tic-grid').children;
        gridDivs[randIndex].innerText = "O";
        gridDivs[randIndex].style.color = "#f87171";
        gridDivs[randIndex].classList.add('ttt-placed');
        window.playSound('click');
        checkTTTWin();
        tttPlayer = "X";
    }
}

function checkTTTWin() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    const gridDivs = document.getElementById('tic-grid').children;
    for(let w of wins) {
        if(tttBoard[w[0]] && tttBoard[w[0]] === tttBoard[w[1]] && tttBoard[w[0]] === tttBoard[w[2]]) {
            tttActive = false;
            const winner = tttBoard[w[0]];
            w.forEach(i => gridDivs[i] && gridDivs[i].classList.add('ttt-win'));
            if(winner === 'X') { tttWinsX++; if(tttWinsX > tttHighscoreX) { tttHighscoreX = tttWinsX; localStorage.setItem('lyraTTTHighscore', tttHighscoreX); } }
            else { tttWinsO++; }
            updateTTTHUD();
            setTimeout(() => { window.showOSDialog("Spielende", winner + " gewinnt!"); initTTT(); }, 650);
            return true;
        }
    }
    if(!tttBoard.includes("")) {
        tttActive = false;
        setTimeout(() => { window.showOSDialog("Spielende", "Unentschieden!"); initTTT(); }, 200);
        return true;
    }
    return false;
}
initTTT();

// === HI-DPI CANVAS HELPER (scharfe statt pixelige Canvas-Darstellung) ===
function setupHiDPICanvas(canvas, logicalWidth, logicalHeight) {
    if(!canvas) return null;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = logicalWidth * dpr;
    canvas.height = logicalHeight * dpr;
    canvas.style.width = logicalWidth + 'px';
    canvas.style.height = logicalHeight + 'px';
    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);
    return ctx;
}

// === SNAKE ENGINE ===
const sCanvas = document.getElementById('snake-canvas');
const sCtx = setupHiDPICanvas(sCanvas, 400, 400);
let sSnake = [{x: 200, y: 200}];
let sFood = {x: 100, y: 100};
let dx = 20, dy = 0;
let sScore = 0;
let sInterval;
let changingDirection = false;
let sGameOver = true;
let sHighscore = parseInt(localStorage.getItem('lyraSnakeHighscore')) || 0;

function updateSnakeHUD() {
    const scoreEl = document.getElementById('snake-score');
    const hsEl = document.getElementById('snake-highscore');
    if(scoreEl) scoreEl.innerText = "Score: " + sScore;
    if(hsEl) hsEl.innerText = "Highscore: " + sHighscore;
}

function resetSnakeGame() {
    if(sInterval) clearInterval(sInterval);
    sGameOver = true;
    dx = 20; dy = 0;
    sSnake = [{x: 200, y: 200}, {x: 180, y: 200}, {x: 160, y: 200}];
    sFood = {x: 80, y: 120}; sScore = 0;
    updateSnakeHUD();
    const overlay = document.getElementById('snake-overlay');
    if(overlay) overlay.style.display = 'flex';
    const startBtn = document.getElementById('snake-start-btn');
    if(startBtn) { startBtn.style.display = 'block'; startBtn.innerText = 'Starten'; }
    const cd = document.getElementById('snake-countdown');
    if(cd) cd.style.display = 'none';
    drawInitialSnake();
}

function drawCyberGrid() {
    if(!sCtx) return;
    sCtx.fillStyle = '#06060a';
    sCtx.fillRect(0, 0, 400, 400);
    sCtx.strokeStyle = 'rgba(255, 255, 255, 0.015)';
    sCtx.lineWidth = 1;
    for(let i = 0; i < 400; i += 20) {
        sCtx.beginPath(); sCtx.moveTo(i, 0); sCtx.lineTo(i, 400); sCtx.stroke();
        sCtx.beginPath(); sCtx.moveTo(0, i); sCtx.lineTo(400, i); sCtx.stroke();
    }
}

function drawInitialSnake() {
    if(!sCtx) return;
    drawCyberGrid();
    sCtx.shadowBlur = 15; sCtx.shadowColor = '#4ade80'; sCtx.fillStyle = '#4ade80';
    sCtx.fillRect(200, 200, 18, 18);
    sCtx.shadowBlur = 0;
}
if(sCanvas) drawInitialSnake();

window.startSnakeCountdown = function() {
    document.getElementById('snake-start-btn').style.display = 'none';
    const cd = document.getElementById('snake-countdown');
    cd.style.display = 'block';
    let count = 3; cd.innerText = count;
    let cdInterval = setInterval(() => {
        count--;
        if(count > 0) { cd.innerText = count; } 
        else { clearInterval(cdInterval); document.getElementById('snake-overlay').style.display = 'none'; initSnakeGame(); }
    }, 1000);
}

function initSnakeGame() {
    dx = 20; dy = 0;
    sSnake = [{x: 200, y: 200}, {x: 180, y: 200}, {x: 160, y: 200}];
    sFood = {x: 80, y: 120}; sScore = 0;
    sGameOver = false;
    document.getElementById('snake-score').innerText = "Score: 0";
    
    if(!window.snakeKeyBound) {
        document.addEventListener('keydown', (e) => {
            if(!document.getElementById('snake').classList.contains('active')) return;
            if(changingDirection) return;
            
            const key = e.key.toLowerCase();
            if((e.key === 'ArrowUp' || key === 'w') && dy === 0) { dx=0; dy=-20; changingDirection = true; e.preventDefault(); }
            if((e.key === 'ArrowDown' || key === 's') && dy === 0) { dx=0; dy=20; changingDirection = true; e.preventDefault(); }
            if((e.key === 'ArrowLeft' || key === 'a') && dx === 0) { dx=-20; dy=0; changingDirection = true; e.preventDefault(); }
            if((e.key === 'ArrowRight' || key === 'd') && dx === 0) { dx=20; dy=0; changingDirection = true; e.preventDefault(); }
        });
        window.snakeKeyBound = true;
    }
    if(sInterval) clearInterval(sInterval);
    sInterval = setInterval(updateSnake, 145); 
}

function updateSnake() {
    if(!document.getElementById('snake').classList.contains('active')) return;
    changingDirection = false;
    
    const head = {x: sSnake[0].x + dx, y: sSnake[0].y + dy};
    sSnake.unshift(head);

    if(head.x === sFood.x && head.y === sFood.y) {
        sScore += 10;
        updateSnakeHUD();
        popElement(document.getElementById('snake-score'));
        window.playSound('click'); generateFoodLocation();
    } else { sSnake.pop(); }

    if(head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400 || sSnake.slice(1).some(p => p.x === head.x && p.y === head.y)) {
        clearInterval(sInterval);
        sGameOver = true;
        if(sScore > sHighscore) { sHighscore = sScore; localStorage.setItem('lyraSnakeHighscore', sHighscore); }
        updateSnakeHUD();
        document.getElementById('snake-overlay').style.display = 'flex';
        document.getElementById('snake-start-btn').style.display = 'block';
        document.getElementById('snake-countdown').style.display = 'none';
        document.getElementById('snake-start-btn').innerText = "Wiederholen";
        drawInitialSnake(); return;
    }

    drawCyberGrid();
    const foodPulse = 14 + Math.sin(Date.now() / 160) * 8;
    sCtx.shadowBlur = foodPulse; sCtx.shadowColor = '#ff4757'; sCtx.fillStyle = '#ff4757';
    sCtx.fillRect(sFood.x + 2, sFood.y + 2, 16, 16);
    
    sCtx.shadowColor = '#4ade80'; sCtx.shadowBlur = 12;
    sSnake.forEach((p, index) => {
        sCtx.fillStyle = index === 0 ? '#67e8f9' : '#4ade80';
        sCtx.fillRect(p.x + 1, p.y + 1, 18, 18);
    });
    sCtx.shadowBlur = 0;
}

function generateFoodLocation() {
    while(true) {
        sFood.x = Math.floor(Math.random() * 20) * 20;
        sFood.y = Math.floor(Math.random() * 20) * 20;
        if(!sSnake.some(p => p.x === sFood.x && p.y === sFood.y)) break;
    }
}

// === LYTETRIS ENGINE ===
function parseTetroShape(rows) {
    const cells = [];
    rows.forEach((row, y) => {
        for(let x = 0; x < row.length; x++) { if(row[x] === 'X') cells.push([x, y]); }
    });
    return cells;
}

const TETROMINO_SHAPES = {
    I: [["....","XXXX","....","...."], ["..X.","..X.","..X.","..X."], ["....","....","XXXX","...."], [".X..",".X..",".X..",".X.."]],
    O: [[".XX.",".XX.","....","...."], [".XX.",".XX.","....","...."], [".XX.",".XX.","....","...."], [".XX.",".XX.","....","...."]],
    T: [[".X..","XXX.","....","...."], [".X..",".XX.",".X..","...."], ["....","XXX.",".X..","...."], [".X..","XX..",".X..","...."]],
    S: [[".XX.","XX..","....","...."], [".X..",".XX.","..X.","...."], [".XX.","XX..","....","...."], [".X..",".XX.","..X.","...."]],
    Z: [["XX..",".XX.","....","...."], ["..X.",".XX.",".X..","...."], ["XX..",".XX.","....","...."], ["..X.",".XX.",".X..","...."]],
    J: [["X...","XXX.","....","...."], [".XX.",".X..",".X..","...."], ["....","XXX.","..X.","...."], [".X..",".X..","XX..","...."]],
    L: [["..X.","XXX.","....","...."], [".X..",".X..",".XX.","...."], ["....","XXX.","X...","...."], ["XX..",".X..",".X..","...."]]
};
const TETROMINO_CELLS = {};
Object.keys(TETROMINO_SHAPES).forEach(type => { TETROMINO_CELLS[type] = TETROMINO_SHAPES[type].map(parseTetroShape); });
const TETRO_COLORS = { I: '#22d3ee', J: '#3b82f6', L: '#f97316', O: '#facc15', S: '#4ade80', T: '#a78bfa', Z: '#f87171' };

const T_COLS = 10, T_ROWS = 20, T_CELL = 20;
let tBoard = Array.from({length: T_ROWS}, () => Array(T_COLS).fill(null));
let tCurrent = null;
let tNextType = null;
let tScore = 0, tLinesCleared = 0, tLevel = 1, tDropSpeed = 800;
let tInterval = null;
let tGameOver = false;
let tHighscore = parseInt(localStorage.getItem('lyraTetrisHighscore')) || 0;

function resetTetrisGame() {
    if(tInterval) clearInterval(tInterval);
    tGameOver = true;
    tBoard = emptyTetrisBoard();
    tCurrent = null;
    tNextType = null;
    tScore = 0; tLinesCleared = 0; tLevel = 1; tDropSpeed = 800;
    updateTetrisHUD();
    drawTetrisBoard();
    if(tNextCtx) tNextCtx.clearRect(0, 0, 80, 80);
    const overlay = document.getElementById('tetris-overlay');
    if(overlay) overlay.style.display = 'flex';
    const startBtn = document.getElementById('tetris-start-btn');
    if(startBtn) { startBtn.style.display = 'block'; startBtn.innerText = 'Starten'; }
    const cd = document.getElementById('tetris-countdown');
    if(cd) cd.style.display = 'none';
}

const tCanvas = document.getElementById('tetris-canvas');
const tCtx = setupHiDPICanvas(tCanvas, 200, 400);
const tNextCanvas = document.getElementById('tetris-next-canvas');
const tNextCtx = setupHiDPICanvas(tNextCanvas, 80, 80);

function emptyTetrisBoard() { return Array.from({length: T_ROWS}, () => Array(T_COLS).fill(null)); }
function randomPieceType() { const types = Object.keys(TETROMINO_CELLS); return types[Math.floor(Math.random() * types.length)]; }

function getTetroCells(piece) {
    return TETROMINO_CELLS[piece.type][piece.rot].map(([cx, cy]) => [piece.x + cx, piece.y + cy]);
}

function checkTetroCollision(piece, dx, dy, rotOverride) {
    const rot = rotOverride !== undefined ? rotOverride : piece.rot;
    const cells = getTetroCells({ type: piece.type, rot, x: piece.x + dx, y: piece.y + dy });
    for(const [x, y] of cells) {
        if(x < 0 || x >= T_COLS || y >= T_ROWS) return true;
        if(y >= 0 && tBoard[y][x]) return true;
    }
    return false;
}

function spawnTetromino() {
    const type = tNextType || randomPieceType();
    tNextType = randomPieceType();
    tCurrent = { type, rot: 0, x: 3, y: 0 };
    drawNextTetroPreview();
    if(checkTetroCollision(tCurrent, 0, 0)) { endTetrisGame(); }
}

window.moveTetrisPiece = function(dx, dy) {
    if(!tCurrent || tGameOver) return false;
    if(!checkTetroCollision(tCurrent, dx, dy)) { tCurrent.x += dx; tCurrent.y += dy; return true; }
    return false;
};

window.rotateTetrisPiece = function() {
    if(!tCurrent || tGameOver) return;
    const newRot = (tCurrent.rot + 1) % 4;
    const kicks = [0, -1, 1, -2, 2];
    for(const k of kicks) {
        if(!checkTetroCollision(tCurrent, k, 0, newRot)) {
            tCurrent.x += k; tCurrent.rot = newRot;
            window.playSound('rotate');
            drawTetrisBoard();
            return;
        }
    }
};

window.hardDropTetris = function() {
    if(!tCurrent || tGameOver) return;
    let dist = 0;
    while(!checkTetroCollision(tCurrent, 0, dist + 1)) dist++;
    tCurrent.y += dist;
    lockTetrisPiece();
    drawTetrisBoard();
};

function lockTetrisPiece() {
    const color = TETRO_COLORS[tCurrent.type];
    getTetroCells(tCurrent).forEach(([x, y]) => { if(y >= 0) tBoard[y][x] = color; });
    window.playSound('drop');
    tCurrent = null;

    const fullRows = [];
    for(let y = 0; y < T_ROWS; y++) {
        if(tBoard[y].every(cell => cell !== null)) fullRows.push(y);
    }

    if(fullRows.length > 0) {
        if(tInterval) clearInterval(tInterval);
        flashClearedRows(fullRows, () => {
            applyLineClear(fullRows);
            spawnTetromino();
            if(!tGameOver) tInterval = setInterval(tetrisTick, tDropSpeed);
            drawTetrisBoard();
        });
    } else {
        spawnTetromino();
    }
}

function flashClearedRows(rows, onComplete) {
    let flashCount = 0;
    const maxFlashes = 4;
    const flashTimer = setInterval(() => {
        flashCount++;
        drawTetrisBoard();
        if(flashCount % 2 === 1 && tCtx) {
            rows.forEach(y => {
                tCtx.fillStyle = 'rgba(255,255,255,0.85)';
                tCtx.fillRect(0, y * T_CELL, T_COLS * T_CELL, T_CELL);
            });
        }
        if(flashCount >= maxFlashes) {
            clearInterval(flashTimer);
            onComplete();
        }
    }, 70);
}

function applyLineClear(rows) {
    const cleared = rows.length;
    rows.sort((a, b) => a - b).forEach(y => {
        tBoard.splice(y, 1);
        tBoard.unshift(Array(T_COLS).fill(null));
    });
    const points = [0, 100, 300, 500, 800][cleared] * tLevel;
    tScore += points;
    tLinesCleared += cleared;
    tLevel = Math.floor(tLinesCleared / 10) + 1;
    tDropSpeed = Math.max(120, 800 - (tLevel - 1) * 60);
    window.playLineClearSound(cleared);
    updateTetrisHUD();
    popElement(document.getElementById('tetris-score'));
    popElement(document.getElementById('tetris-lines'));
}

function updateTetrisHUD() {
    const scoreEl = document.getElementById('tetris-score');
    const linesEl = document.getElementById('tetris-lines');
    const hsEl = document.getElementById('tetris-highscore');
    if(scoreEl) scoreEl.innerText = "Score: " + tScore;
    if(linesEl) linesEl.innerText = "Level " + tLevel + " · Linien: " + tLinesCleared;
    if(hsEl) hsEl.innerText = "Highscore: " + tHighscore;
}

function drawTetroCell(ctx, x, y, color) {
    ctx.fillStyle = color;
    ctx.shadowColor = color; ctx.shadowBlur = 8;
    ctx.fillRect(x * T_CELL + 1, y * T_CELL + 1, T_CELL - 2, T_CELL - 2);
    ctx.shadowBlur = 0;
}

function drawTetrisBoard() {
    if(!tCtx) return;
    tCtx.fillStyle = '#06060a';
    tCtx.fillRect(0, 0, T_COLS * T_CELL, T_ROWS * T_CELL);
    tCtx.strokeStyle = 'rgba(255,255,255,0.04)'; tCtx.lineWidth = 1;
    for(let x = 0; x <= T_COLS; x++) { tCtx.beginPath(); tCtx.moveTo(x*T_CELL, 0); tCtx.lineTo(x*T_CELL, T_ROWS*T_CELL); tCtx.stroke(); }
    for(let y = 0; y <= T_ROWS; y++) { tCtx.beginPath(); tCtx.moveTo(0, y*T_CELL); tCtx.lineTo(T_COLS*T_CELL, y*T_CELL); tCtx.stroke(); }

    for(let y = 0; y < T_ROWS; y++) {
        for(let x = 0; x < T_COLS; x++) { if(tBoard[y][x]) drawTetroCell(tCtx, x, y, tBoard[y][x]); }
    }
    if(tCurrent) {
        const color = TETRO_COLORS[tCurrent.type];
        getTetroCells(tCurrent).forEach(([x, y]) => { if(y >= 0) drawTetroCell(tCtx, x, y, color); });
    }
}

function drawNextTetroPreview() {
    if(!tNextCtx || !tNextType) return;
    tNextCtx.clearRect(0, 0, 80, 80);
    const cells = TETROMINO_CELLS[tNextType][0];
    const color = TETRO_COLORS[tNextType];
    const size = 16;
    const offset = (80 - 4 * size) / 2;
    cells.forEach(([cx, cy]) => {
        tNextCtx.fillStyle = color;
        tNextCtx.shadowColor = color; tNextCtx.shadowBlur = 6;
        tNextCtx.fillRect(offset + cx * size + 1, offset + cy * size + 1, size - 2, size - 2);
        tNextCtx.shadowBlur = 0;
    });
}

function tetrisTick() {
    const win = document.getElementById('lytetris');
    if(!win || !win.classList.contains('active') || tGameOver) return;
    if(!window.moveTetrisPiece(0, 1)) { lockTetrisPiece(); }
    drawTetrisBoard();
}

function endTetrisGame() {
    tGameOver = true;
    if(tInterval) clearInterval(tInterval);
    if(tScore > tHighscore) {
        tHighscore = tScore;
        localStorage.setItem('lyraTetrisHighscore', tHighscore);
    }
    window.playSound('gameover');
    updateTetrisHUD();
    document.getElementById('tetris-overlay').style.display = 'flex';
    document.getElementById('tetris-start-btn').style.display = 'block';
    document.getElementById('tetris-start-btn').innerText = 'Wiederholen';
    document.getElementById('tetris-countdown').style.display = 'none';
}

window.startTetrisCountdown = function() {
    document.getElementById('tetris-start-btn').style.display = 'none';
    const cd = document.getElementById('tetris-countdown');
    cd.style.display = 'block';
    let count = 3; cd.innerText = count;
    let cdInterval = setInterval(() => {
        count--;
        if(count > 0) { cd.innerText = count; }
        else { clearInterval(cdInterval); document.getElementById('tetris-overlay').style.display = 'none'; initTetrisGame(); }
    }, 1000);
};

function initTetrisGame() {
    tBoard = emptyTetrisBoard();
    tScore = 0; tLinesCleared = 0; tLevel = 1; tDropSpeed = 800; tGameOver = false;
    tNextType = randomPieceType();
    spawnTetromino();
    updateTetrisHUD();
    drawTetrisBoard();

    if(!window.tetrisKeyBound) {
        document.addEventListener('keydown', (e) => {
            const win = document.getElementById('lytetris');
            if(!win || !win.classList.contains('active') || tGameOver) return;
            const key = e.key.toLowerCase();
            if(e.key === 'ArrowLeft' || key === 'a') { if(window.moveTetrisPiece(-1, 0)) window.playSound('move'); e.preventDefault(); }
            else if(e.key === 'ArrowRight' || key === 'd') { if(window.moveTetrisPiece(1, 0)) window.playSound('move'); e.preventDefault(); }
            else if(e.key === 'ArrowDown' || key === 's') { if(window.moveTetrisPiece(0, 1)) { tScore += 1; updateTetrisHUD(); } e.preventDefault(); }
            else if(e.key === 'ArrowUp' || key === 'w') { window.rotateTetrisPiece(); e.preventDefault(); }
            else if(e.key === ' ') { window.hardDropTetris(); e.preventDefault(); }
            drawTetrisBoard();
        });
        window.tetrisKeyBound = true;
    }

    if(tInterval) clearInterval(tInterval);
    tInterval = setInterval(tetrisTick, tDropSpeed);
}

if(tCanvas) drawTetrisBoard();
updateTetrisHUD();

// === LYRACER ENGINE ===
const R_WIDTH = 280, R_HEIGHT = 460;
const R_CAR_WIDTH = 42, R_CAR_HEIGHT = 74;
const R_ROAD_MARGIN = 12;
const R_LANE_WIDTH = (R_WIDTH - R_ROAD_MARGIN * 2) / 3;
const R_PLAYER_MIN_Y = R_HEIGHT * 0.42;
const R_PLAYER_MAX_Y = R_HEIGHT - R_CAR_HEIGHT - 14;
const R_MOVE_SPEED = 230; // px/Sekunde
const RACER_COLORS = ['#f87171', '#fbbf24', '#a78bfa', '#34d399', '#fb923c'];

const rCanvas = document.getElementById('racer-canvas');
const rCtx = setupHiDPICanvas(rCanvas, R_WIDTH, R_HEIGHT);

let rPlayerX = R_WIDTH / 2 - R_CAR_WIDTH / 2;
let rPlayerY = R_PLAYER_MAX_Y;
let rObstacles = [];
let rScore = 0;
let rElapsedMs = 0;
let rFallSpeed = 150;
let rSpawnTimerMs = 600;
let rRoadOffset = 0;
let rGameOver = true;
let rHighscore = parseInt(localStorage.getItem('lyraRacerHighscore')) || 0;
let racerKeys = { left: false, right: false, up: false, down: false };
let racerAnimFrameId = null;
let racerLastTime = 0;

function rClamp(v, min, max) { return Math.max(min, Math.min(max, v)); }

function racerLaneCenterX(lane) {
    return R_ROAD_MARGIN + lane * R_LANE_WIDTH + R_LANE_WIDTH / 2 - R_CAR_WIDTH / 2;
}

function rectsOverlap(a, b, inset) {
    return a.x + inset < b.x + b.w - inset &&
           a.x + a.w - inset > b.x + inset &&
           a.y + inset < b.y + b.h - inset &&
           a.y + a.h - inset > b.y + inset;
}

function updateRacerScore() {
    const el = document.getElementById('racer-score');
    if(el) el.innerText = "Score: " + rScore;
    const hsEl = document.getElementById('racer-highscore');
    if(hsEl) hsEl.innerText = "Highscore: " + rHighscore;
}

function drawCarShape(ctx, x, y, color) {
    const w = R_CAR_WIDTH, h = R_CAR_HEIGHT;
    ctx.fillStyle = color;
    ctx.shadowColor = color; ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.moveTo(x, y + h * 0.22);
    ctx.lineTo(x + w * 0.12, y);
    ctx.lineTo(x + w * 0.88, y);
    ctx.lineTo(x + w, y + h * 0.22);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(8,8,14,0.55)';
    ctx.fillRect(x + w * 0.16, y + h * 0.1, w * 0.68, h * 0.26);
}

function drawRoad() {
    rCtx.fillStyle = '#15151c';
    rCtx.fillRect(0, 0, R_WIDTH, R_HEIGHT);

    rCtx.strokeStyle = 'rgba(255,255,255,0.18)';
    rCtx.lineWidth = 3;
    rCtx.beginPath(); rCtx.moveTo(R_ROAD_MARGIN, 0); rCtx.lineTo(R_ROAD_MARGIN, R_HEIGHT); rCtx.stroke();
    rCtx.beginPath(); rCtx.moveTo(R_WIDTH - R_ROAD_MARGIN, 0); rCtx.lineTo(R_WIDTH - R_ROAD_MARGIN, R_HEIGHT); rCtx.stroke();

    rCtx.strokeStyle = 'rgba(255,255,255,0.28)';
    rCtx.lineWidth = 3;
    rCtx.setLineDash([20, 16]);
    rCtx.lineDashOffset = -rRoadOffset;
    for(let lane = 1; lane < 3; lane++) {
        const x = R_ROAD_MARGIN + lane * R_LANE_WIDTH;
        rCtx.beginPath();
        rCtx.moveTo(x, 0);
        rCtx.lineTo(x, R_HEIGHT);
        rCtx.stroke();
    }
    rCtx.setLineDash([]);
}

function drawRacerFrame() {
    if(!rCtx) return;
    drawRoad();
    rObstacles.forEach(o => drawCarShape(rCtx, o.x, o.y, o.color));
    drawCarShape(rCtx, rPlayerX, rPlayerY, '#67e8f9');
}

function checkRacerCollision() {
    const playerRect = { x: rPlayerX, y: rPlayerY, w: R_CAR_WIDTH, h: R_CAR_HEIGHT };
    for(const o of rObstacles) {
        const oRect = { x: o.x, y: o.y, w: R_CAR_WIDTH, h: R_CAR_HEIGHT };
        if(rectsOverlap(playerRect, oRect, 7)) return true;
    }
    return false;
}

function updateRacerGame(dt) {
    rElapsedMs += dt;

    let dx = 0, dy = 0;
    if(racerKeys.left) dx -= 1;
    if(racerKeys.right) dx += 1;
    if(racerKeys.up) dy -= 1;
    if(racerKeys.down) dy += 1;
    if(dx !== 0 && dy !== 0) { dx *= 0.7071; dy *= 0.7071; }

    rPlayerX = rClamp(rPlayerX + dx * R_MOVE_SPEED * (dt / 1000), R_ROAD_MARGIN, R_WIDTH - R_ROAD_MARGIN - R_CAR_WIDTH);
    rPlayerY = rClamp(rPlayerY + dy * R_MOVE_SPEED * (dt / 1000), R_PLAYER_MIN_Y, R_PLAYER_MAX_Y);

    rRoadOffset = (rRoadOffset + rFallSpeed * (dt / 1000)) % 36;

    rObstacles.forEach(o => { o.y += rFallSpeed * (dt / 1000); });
    rObstacles = rObstacles.filter(o => o.y < R_HEIGHT + 20);

    rSpawnTimerMs -= dt;
    if(rSpawnTimerMs <= 0) {
        const lane = Math.floor(Math.random() * 3);
        rObstacles.push({ x: racerLaneCenterX(lane), y: -R_CAR_HEIGHT - 10, color: RACER_COLORS[Math.floor(Math.random() * RACER_COLORS.length)] });
        rSpawnTimerMs = Math.max(420, 950 - rElapsedMs / 55);
    }

    rFallSpeed = Math.min(420, 150 + rElapsedMs / 130);

    rScore = Math.floor(rElapsedMs / 100);
    updateRacerScore();

    if(checkRacerCollision()) {
        endRacerGame();
    }
}

function racerLoop(timestamp) {
    const win = document.getElementById('lyracer');
    if(!win || !win.classList.contains('active') || rGameOver) { racerAnimFrameId = null; return; }

    if(!racerLastTime) racerLastTime = timestamp;
    const dt = Math.min(timestamp - racerLastTime, 50);
    racerLastTime = timestamp;

    updateRacerGame(dt);
    drawRacerFrame();

    racerAnimFrameId = requestAnimationFrame(racerLoop);
}

function endRacerGame() {
    rGameOver = true;
    if(racerAnimFrameId) { cancelAnimationFrame(racerAnimFrameId); racerAnimFrameId = null; }
    if(rScore > rHighscore) {
        rHighscore = rScore;
        localStorage.setItem('lyraRacerHighscore', rHighscore);
    }
    window.playSound('gameover');
    updateRacerScore();
    document.getElementById('racer-overlay').style.display = 'flex';
    document.getElementById('racer-start-btn').style.display = 'block';
    document.getElementById('racer-start-btn').innerText = 'Wiederholen';
    document.getElementById('racer-countdown').style.display = 'none';
}

window.startRacerCountdown = function() {
    document.getElementById('racer-start-btn').style.display = 'none';
    const cd = document.getElementById('racer-countdown');
    cd.style.display = 'block';
    let count = 3; cd.innerText = count;
    let cdInterval = setInterval(() => {
        count--;
        if(count > 0) { cd.innerText = count; }
        else { clearInterval(cdInterval); document.getElementById('racer-overlay').style.display = 'none'; initRacerGame(); }
    }, 1000);
};

function initRacerGame() {
    rPlayerX = R_WIDTH / 2 - R_CAR_WIDTH / 2;
    rPlayerY = R_PLAYER_MAX_Y;
    rObstacles = [];
    rScore = 0;
    rElapsedMs = 0;
    rFallSpeed = 150;
    rSpawnTimerMs = 600;
    rRoadOffset = 0;
    rGameOver = false;
    racerKeys = { left: false, right: false, up: false, down: false };
    racerLastTime = 0;
    updateRacerScore();

    if(!window.racerKeyBound) {
        document.addEventListener('keydown', (e) => {
            const win = document.getElementById('lyracer');
            if(!win || !win.classList.contains('active') || rGameOver) return;
            const key = e.key.toLowerCase();
            if(e.key === 'ArrowLeft' || key === 'a') { racerKeys.left = true; e.preventDefault(); }
            else if(e.key === 'ArrowRight' || key === 'd') { racerKeys.right = true; e.preventDefault(); }
            else if(e.key === 'ArrowUp' || key === 'w') { racerKeys.up = true; e.preventDefault(); }
            else if(e.key === 'ArrowDown' || key === 's') { racerKeys.down = true; e.preventDefault(); }
        });
        document.addEventListener('keyup', (e) => {
            const key = e.key.toLowerCase();
            if(e.key === 'ArrowLeft' || key === 'a') racerKeys.left = false;
            else if(e.key === 'ArrowRight' || key === 'd') racerKeys.right = false;
            else if(e.key === 'ArrowUp' || key === 'w') racerKeys.up = false;
            else if(e.key === 'ArrowDown' || key === 's') racerKeys.down = false;
        });
        window.addEventListener('blur', () => { racerKeys = { left: false, right: false, up: false, down: false }; });
        window.racerKeyBound = true;
    }

    if(racerAnimFrameId) cancelAnimationFrame(racerAnimFrameId);
    racerAnimFrameId = requestAnimationFrame(racerLoop);
}

function resetRacerGame() {
    rGameOver = true;
    if(racerAnimFrameId) { cancelAnimationFrame(racerAnimFrameId); racerAnimFrameId = null; }
    racerKeys = { left: false, right: false, up: false, down: false };
    rPlayerX = R_WIDTH / 2 - R_CAR_WIDTH / 2;
    rPlayerY = R_PLAYER_MAX_Y;
    rObstacles = [];
    rScore = 0;
    rElapsedMs = 0;
    rFallSpeed = 150;
    rRoadOffset = 0;
    updateRacerScore();
    const overlay = document.getElementById('racer-overlay');
    if(overlay) overlay.style.display = 'flex';
    const startBtn = document.getElementById('racer-start-btn');
    if(startBtn) { startBtn.style.display = 'block'; startBtn.innerText = 'Starten'; }
    const cd = document.getElementById('racer-countdown');
    if(cd) cd.style.display = 'none';
    drawRacerFrame();
}

if(rCanvas) drawRacerFrame();
updateRacerScore();

// === MONEY EMPIRE ===
const MONEY_EMPIRE_DEFAULT = { money: 0, total: 0, upgrades: { click: 0, passive: 0, bank: 0 }, perClick: 1, perSecond: 0 };
const MONEY_EMPIRE_UPGRADES = {
    click: { baseCost: 50, scale: 1.35, perClick: 1 },
    passive: { baseCost: 120, scale: 1.38, perSecond: 1 },
    bank: { baseCost: 850, scale: 1.45, perSecond: 8 }
};

function loadMoneyEmpireState() {
    try {
        const saved = JSON.parse(localStorage.getItem('lyraMoneyEmpire'));
        if(saved && typeof saved === 'object') {
            return {
                money: Number(saved.money) || 0,
                total: Number(saved.total) || 0,
                upgrades: {
                    click: Number(saved.upgrades && saved.upgrades.click) || 0,
                    passive: Number(saved.upgrades && saved.upgrades.passive) || 0,
                    bank: Number(saved.upgrades && saved.upgrades.bank) || 0
                },
                perClick: 1,
                perSecond: 0
            };
        }
    } catch(e) {}
    return JSON.parse(JSON.stringify(MONEY_EMPIRE_DEFAULT));
}

let moneyEmpireState = loadMoneyEmpireState();

function formatMoneyEmpire(value) {
    const n = Math.floor(value);
    if(n >= 1000000000000) return '$' + (n / 1000000000000).toFixed(2).replace(/\.00$/, '') + 'T';
    if(n >= 1000000000) return '$' + (n / 1000000000).toFixed(2).replace(/\.00$/, '') + 'B';
    if(n >= 1000000) return '$' + (n / 1000000).toFixed(2).replace(/\.00$/, '') + 'M';
    return '$' + n.toLocaleString('en-US');
}

function saveMoneyEmpireState() {
    localStorage.setItem('lyraMoneyEmpire', JSON.stringify(moneyEmpireState));
}

function recalcMoneyEmpireStats() {
    moneyEmpireState.perClick = 1 + moneyEmpireState.upgrades.click * MONEY_EMPIRE_UPGRADES.click.perClick;
    moneyEmpireState.perSecond = moneyEmpireState.upgrades.passive * MONEY_EMPIRE_UPGRADES.passive.perSecond + moneyEmpireState.upgrades.bank * MONEY_EMPIRE_UPGRADES.bank.perSecond;
}

function getMoneyEmpireUpgradeCost(type) {
    const upgrade = MONEY_EMPIRE_UPGRADES[type];
    if(!upgrade) return Infinity;
    return Math.floor(upgrade.baseCost * Math.pow(upgrade.scale, moneyEmpireState.upgrades[type]));
}

function updateMoneyEmpireHUD() {
    recalcMoneyEmpireStats();
    const balanceEl = document.getElementById('moneyempire-balance');
    const perClickEl = document.getElementById('moneyempire-per-click');
    const perSecondEl = document.getElementById('moneyempire-per-second');
    if(balanceEl) balanceEl.innerText = formatMoneyEmpire(moneyEmpireState.money);
    if(perClickEl) perClickEl.innerText = '+' + formatMoneyEmpire(moneyEmpireState.perClick) + ' / Click';
    if(perSecondEl) perSecondEl.innerText = '+' + formatMoneyEmpire(moneyEmpireState.perSecond) + ' / Sek';

    ['click', 'passive', 'bank'].forEach(type => {
        const cost = getMoneyEmpireUpgradeCost(type);
        const btn = document.getElementById('moneyempire-upgrade-' + type);
        const costEl = document.getElementById('moneyempire-' + type + '-cost');
        const infoEl = document.getElementById('moneyempire-' + type + '-info');
        if(btn) btn.classList.toggle('disabled', moneyEmpireState.money < cost);
        if(costEl) costEl.innerText = formatMoneyEmpire(cost);
        if(infoEl) {
            const count = moneyEmpireState.upgrades[type];
            if(type === 'click') infoEl.innerText = '+1 pro Click (x' + count + ')';
            else if(type === 'passive') infoEl.innerText = '+1 pro Sek (x' + count + ')';
            else infoEl.innerText = '+8 pro Sek (x' + count + ')';
        }
    });
}

function showMoneyEmpireFloat(amount) {
    const clicker = document.querySelector('.moneyempire-clicker');
    if(!clicker) return;
    const el = document.createElement('span');
    el.className = 'moneyempire-float';
    el.innerText = '+' + formatMoneyEmpire(amount);
    clicker.appendChild(el);
    setTimeout(() => { el.remove(); }, 800);
}

window.moneyEmpireClick = function() {
    recalcMoneyEmpireStats();
    moneyEmpireState.money += moneyEmpireState.perClick;
    moneyEmpireState.total += moneyEmpireState.perClick;
    saveMoneyEmpireState();
    updateMoneyEmpireHUD();
    showMoneyEmpireFloat(moneyEmpireState.perClick);
    popElement(document.getElementById('moneyempire-balance'));
    window.playSound('click');
};

window.buyMoneyEmpireUpgrade = function(type) {
    const cost = getMoneyEmpireUpgradeCost(type);
    if(moneyEmpireState.money < cost) {
        window.playSound('close');
        return;
    }
    moneyEmpireState.money -= cost;
    moneyEmpireState.upgrades[type]++;
    recalcMoneyEmpireStats();
    saveMoneyEmpireState();
    updateMoneyEmpireHUD();
    popElement(document.getElementById('moneyempire-balance'));
    window.playSound('open');
};

setInterval(() => {
    const win = document.getElementById('moneyempire');
    if(!win || !win.classList.contains('active')) return;
    recalcMoneyEmpireStats();
    if(moneyEmpireState.perSecond <= 0) return;
    moneyEmpireState.money += moneyEmpireState.perSecond;
    moneyEmpireState.total += moneyEmpireState.perSecond;
    saveMoneyEmpireState();
    updateMoneyEmpireHUD();
}, 1000);

updateMoneyEmpireHUD();

// === UHR ===
setInterval(() => {
    const d = new Date();
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
    document.querySelectorAll('.widget-clock-time').forEach(el => {
        el.innerText = d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'});
    });
    document.querySelectorAll('.widget-clock-date').forEach(el => {
        el.innerText = d.toLocaleDateString('de-DE', {weekday: 'short', day: 'numeric', month: 'long'});
    });
}, 1000);

// === CALCULATOR ===
let calcStr = "";
window.calcInput = function(val) { 
    calcStr += val; 
    document.getElementById('calc-display').innerText = calcStr; 
    window.playSound('click'); 
};
window.calcClear = function() { 
    calcStr = ""; 
    document.getElementById('calc-display').innerText = "0"; 
    window.playSound('click'); 
};
window.calcResult = function() { 
    try { 
        if(/^[0-9+\-*/(). ]+$/.test(calcStr)) {
            calcStr = Function('"use strict";return (' + calcStr + ')')().toString(); 
            document.getElementById('calc-display').innerText = calcStr; 
            popElement(document.getElementById('calc-display'));
            window.playSound('open'); 
        } else {
            throw new Error("Formatfehler");
        }
    } catch(e) { 
        document.getElementById('calc-display').innerText = "Error"; 
        calcStr = "";
    } 
};

// Initialer Aufruf für Explorer-Inhalte
renderExplorer();

// === WIDGET SYSTEM ===
let placedWidgets = JSON.parse(localStorage.getItem('lyraWidgets')) || [];
let activeDragWidgetEl = null;
let activeDragWidgetData = null;
let widgetDragOffsetX = 0, widgetDragOffsetY = 0;
let widgetTimerState = {};
const WIDGET_GRID = 20;

function snapToGrid(value) {
    return Math.round(value / WIDGET_GRID) * WIDGET_GRID;
}

function saveWidgets() {
    localStorage.setItem('lyraWidgets', JSON.stringify(placedWidgets));
}

function buildCalendarWidgetHTML() {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const today = now.getDate();
    const monthNames = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];

    let startOffset = new Date(year, month, 1).getDay() - 1;
    if(startOffset < 0) startOffset = 6;
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    let html = `<div class="widget-cal-header">${monthNames[month]} ${year}</div><div class="widget-cal-grid">`;
    ['Mo','Di','Mi','Do','Fr','Sa','So'].forEach(d => { html += `<div class="widget-cal-dow">${d}</div>`; });
    for(let i = 0; i < startOffset; i++) { html += `<div class="widget-cal-day empty"></div>`; }
    for(let d = 1; d <= daysInMonth; d++) {
        html += `<div class="widget-cal-day${d === today ? ' today' : ''}">${d}</div>`;
    }
    html += `</div>`;
    return html;
}

function formatTimerMs(ms) {
    const totalSec = Math.floor(ms / 1000);
    const m = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return m + ':' + s;
}

function buildWidgetInnerHTML(widget) {
    const type = widget.type;
    if(type === 'clock') {
        const d = new Date();
        return `<div class="widget-clock-time">${d.toLocaleTimeString('de-DE', {hour:'2-digit', minute:'2-digit'})}</div><div class="widget-clock-date">${d.toLocaleDateString('de-DE', {weekday:'short', day:'numeric', month:'long'})}</div>`;
    } else if(type === 'calendar') {
        return buildCalendarWidgetHTML();
    } else if(type === 'note') {
        const content = (widget.content || '').replace(/</g, '&lt;');
        return `<textarea class="widget-note-textarea" placeholder="Notiz..." oninput="window.updateNoteWidget('${widget.id}', this.value)">${content}</textarea>`;
    } else if(type === 'counter') {
        return `<div class="widget-counter-value">${widget.count || 0}</div><div class="widget-counter-controls"><button class="widget-mini-btn" onclick="window.adjustCounterWidget('${widget.id}', -1)">−</button><button class="widget-mini-btn" onclick="window.adjustCounterWidget('${widget.id}', 1)">+</button></div>`;
    } else if(type === 'timer') {
        const state = widgetTimerState[widget.id];
        const displayVal = state ? formatTimerMs(state.elapsedMs) : '00:00';
        const toggleIcon = (state && state.running) ? '⏸' : '▶';
        return `<div class="widget-timer-display">${displayVal}</div><div class="widget-timer-controls"><button class="widget-mini-btn widget-timer-toggle" onclick="window.toggleTimerWidget('${widget.id}')">${toggleIcon}</button><button class="widget-mini-btn" onclick="window.resetTimerWidget('${widget.id}')">↺</button></div>`;
    }
    return '';
}

window.updateNoteWidget = function(id, value) {
    const widget = placedWidgets.find(w => w.id === id);
    if(!widget) return;
    widget.content = value;
    saveWidgets();
};

window.adjustCounterWidget = function(id, delta) {
    const widget = placedWidgets.find(w => w.id === id);
    if(!widget) return;
    widget.count = (widget.count || 0) + delta;
    saveWidgets();
    const el = document.querySelector('.desktop-widget[data-widget-id="' + id + '"] .widget-counter-value');
    if(el) { el.innerText = widget.count; popElement(el); }
    window.playSound('click');
};

window.toggleTimerWidget = function(id) {
    if(!widgetTimerState[id]) widgetTimerState[id] = { running: false, elapsedMs: 0, intervalId: null, startTs: 0 };
    const state = widgetTimerState[id];
    const btn = document.querySelector('.desktop-widget[data-widget-id="' + id + '"] .widget-timer-toggle');

    if(!state.running) {
        state.running = true;
        state.startTs = Date.now() - state.elapsedMs;
        state.intervalId = setInterval(() => {
            state.elapsedMs = Date.now() - state.startTs;
            const display = document.querySelector('.desktop-widget[data-widget-id="' + id + '"] .widget-timer-display');
            if(display) display.innerText = formatTimerMs(state.elapsedMs);
        }, 250);
        if(btn) btn.innerText = '⏸';
    } else {
        state.running = false;
        clearInterval(state.intervalId);
        if(btn) btn.innerText = '▶';
    }
    window.playSound('click');
};

window.resetTimerWidget = function(id) {
    if(!widgetTimerState[id]) return;
    const state = widgetTimerState[id];
    state.running = false;
    clearInterval(state.intervalId);
    state.elapsedMs = 0;
    const display = document.querySelector('.desktop-widget[data-widget-id="' + id + '"] .widget-timer-display');
    if(display) display.innerText = '00:00';
    const btn = document.querySelector('.desktop-widget[data-widget-id="' + id + '"] .widget-timer-toggle');
    if(btn) btn.innerText = '▶';
    window.playSound('close');
};

function attachWidgetDragMove(el, widget) {
    el.addEventListener('mousedown', (e) => {
        const tag = e.target.tagName.toLowerCase();
        if(e.target.closest('.widget-remove-btn')) return;
        if(tag === 'textarea' || tag === 'button' || tag === 'input') return;
        if(e.button !== 0) return;
        e.preventDefault();
        activeDragWidgetEl = el;
        activeDragWidgetData = widget;
        el.classList.add('dragging');
        const rect = el.getBoundingClientRect();
        widgetDragOffsetX = e.clientX - rect.left;
        widgetDragOffsetY = e.clientY - rect.top;
        el.style.zIndex = 200;
    });
}

document.addEventListener('mousemove', (e) => {
    if(!activeDragWidgetEl) return;
    activeDragWidgetEl.style.left = (e.clientX - widgetDragOffsetX) + 'px';
    activeDragWidgetEl.style.top = (e.clientY - widgetDragOffsetY) + 'px';
});

document.addEventListener('mouseup', () => {
    if(!activeDragWidgetEl) return;
    const snappedX = snapToGrid(parseInt(activeDragWidgetEl.style.left));
    const snappedY = snapToGrid(parseInt(activeDragWidgetEl.style.top));
    activeDragWidgetEl.classList.remove('dragging');
    activeDragWidgetEl.style.left = snappedX + 'px';
    activeDragWidgetEl.style.top = snappedY + 'px';
    activeDragWidgetData.x = snappedX;
    activeDragWidgetData.y = snappedY;
    saveWidgets();
    const elRef = activeDragWidgetEl;
    setTimeout(() => { elRef.style.zIndex = ''; }, 260);
    activeDragWidgetEl = null;
    activeDragWidgetData = null;
});

function buildWidgetElement(widget) {
    const el = document.createElement('div');
    el.className = 'desktop-widget glass-panel widget-type-' + widget.type;
    el.style.left = widget.x + 'px';
    el.style.top = widget.y + 'px';
    el.dataset.widgetId = widget.id;
    el.innerHTML = `<button class="widget-remove-btn" onclick="window.removeWidget('${widget.id}')">✕</button>` + buildWidgetInnerHTML(widget);
    attachWidgetDragMove(el, widget);
    return el;
}

function renderPlacedWidgets() {
    const layer = document.getElementById('desktop-widgets-layer');
    if(!layer) return;
    layer.innerHTML = '';
    placedWidgets.forEach(w => layer.appendChild(buildWidgetElement(w)));
}

window.removeWidget = function(id) {
    window.playSound('close');
    if(widgetTimerState[id] && widgetTimerState[id].intervalId) clearInterval(widgetTimerState[id].intervalId);
    delete widgetTimerState[id];
    placedWidgets = placedWidgets.filter(w => w.id !== id);
    saveWidgets();
    renderPlacedWidgets();
};

window.startWidgetDrag = function(e, type) {
    if(e.button !== 0) return;
    e.preventDefault();
    window.playSound('click');

    const previewWidget = { id: 'preview', type: type, content: '', count: 0 };
    const ghost = document.createElement('div');
    ghost.className = 'widget-drag-ghost glass-panel widget-type-' + type;
    ghost.innerHTML = buildWidgetInnerHTML(previewWidget);
    ghost.style.left = e.clientX + 'px';
    ghost.style.top = e.clientY + 'px';
    document.body.appendChild(ghost);

    function onMove(ev) {
        ghost.style.left = ev.clientX + 'px';
        ghost.style.top = ev.clientY + 'px';
    }

    function onUp(ev) {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onUp);
        ghost.remove();

        const dropTarget = document.elementFromPoint(ev.clientX, ev.clientY);
        const blocked = dropTarget && (dropTarget.closest('.bottom-floating-bar') || dropTarget.closest('.dialog-overlay') || dropTarget.closest('.top-bar'));

        if(!blocked) {
            const newWidget = {
                id: 'widget_' + Date.now(),
                type: type,
                x: snapToGrid(Math.max(10, Math.min(window.innerWidth - 190, ev.clientX - 85))),
                y: snapToGrid(Math.max(50, Math.min(window.innerHeight - 190, ev.clientY - 85)))
            };
            placedWidgets.push(newWidget);
            saveWidgets();
            renderPlacedWidgets();
            window.playSound('open');
        } else {
            window.playSound('close');
        }
    }

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
};

renderPlacedWidgets();

// === APP STORE SYSTEM ===
// === ALLE APPS ALS SYSTEM-EINTRÄGE (inkl. Widgets + App Store) ===
const CORE_APPS = [
    { id: 'lysettings', name: 'Optionen', icon: `<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>` },
    { id: 'lyexplorer', name: 'Explorer', icon: `<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>` },
    { id: 'lycalc', name: 'Rechner', icon: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"></rect><line x1="8" y1="6" x2="16" y2="6"></line><line x1="16" y1="14" x2="16" y2="18"></line><path d="M16 10h.01"></path><path d="M12 10h.01"></path><path d="M8 10h.01"></path><path d="M12 14h.01"></path><path d="M8 14h.01"></path><path d="M12 18h.01"></path><path d="M8 18h.01"></path></svg>` },
    { id: 'lyterminal', name: 'Terminal', icon: `<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>` }
];

const DEFAULT_DOCK_APPS = ['lysettings', 'lyexplorer', 'lycalc', 'lyterminal'];

const SYSTEM_APPS = [
    { id: 'lywidgets', name: 'Widgets', icon: `<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"></rect><rect x="14" y="3" width="7" height="7" rx="1.5"></rect><rect x="3" y="14" width="7" height="7" rx="1.5"></rect><rect x="14" y="14" width="7" height="7" rx="1.5"></rect></svg>`, system: true },
    { id: 'lyappstore', name: 'App Store', icon: `<svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"></path><path d="M3 6h18"></path><path d="M16 10a4 4 0 0 1-8 0"></path></svg>`, system: true }
];

const STORE_APPS = [
    { id: 'lynotes', name: 'Notizen', icon: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>` },
    { id: 'lypixel', name: 'LyPixel', icon: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>` },
    { id: 'lyttt', name: 'TicTacToe', icon: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="4" y1="9" x2="20" y2="9"></line><line x1="4" y1="15" x2="20" y2="15"></line><line x1="10" y1="3" x2="8" y2="21"></line><line x1="16" y1="3" x2="14" y2="21"></line></svg>` },
    { id: 'snake', name: 'Snake', icon: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2.2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7h6v5h6v5h5"></path><circle cx="20.3" cy="17" r="1.6" fill="currentColor" stroke="none"></circle></svg>` },
    { id: 'lytetris', name: 'LyTetris', icon: `<svg viewBox="0 0 24 24" width="26" height="26" fill="currentColor" stroke="none"><rect x="2" y="10" width="6" height="6" rx="1"></rect><rect x="9" y="10" width="6" height="6" rx="1"></rect><rect x="16" y="10" width="6" height="6" rx="1"></rect><rect x="9" y="3" width="6" height="6" rx="1"></rect></svg>` },
    { id: 'lyracer', name: 'LyRacer', icon: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M14 16H9m10 0h3v-3.15a1 1 0 0 0-.84-.99L19 11l-2.7-3.6a1 1 0 0 0-.8-.4H5.24a2 2 0 0 0-1.8 1.1l-.8 1.63A6 6 0 0 0 2 12.42V16h2"></path><circle cx="6.5" cy="16.5" r="2.5"></circle><circle cx="16.5" cy="16.5" r="2.5"></circle></svg>` },
    { id: 'moneyempire', name: 'Money Empire', icon: `<svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"></circle><path d="M12 7v10"></path><path d="M15.5 9.5c-.7-1-1.9-1.5-3.5-1.5-2 0-3.2.8-3.2 2.1 0 3.1 6.4 1.4 6.4 4.6 0 1.3-1.2 2.3-3.4 2.3-1.7 0-3-.5-3.8-1.6"></path></svg>` }
];

// System-App-Positionen (feste Icons, bewegbar, aber nicht deinstallierbar)
let systemAppPositions = JSON.parse(localStorage.getItem('lyraSystemAppPos')) || {
    lywidgets: { x: window.innerWidth - 120, y: 70 },
    lyappstore: { x: window.innerWidth - 120, y: 178 }
};

let installedApps = JSON.parse(localStorage.getItem('lyraInstalledApps')) || [];
let coreAppPositions = readLyraJSON('lyraCoreAppPos', {});
let savedDockApps = readLyraJSON('lyraDockApps', null);
let dockApps = Array.isArray(savedDockApps) ? savedDockApps.filter((id, index, arr) => getAppInfo(id) && arr.indexOf(id) === index) : DEFAULT_DOCK_APPS.slice();
let installingApps = new Set();
const APP_INSTALL_DURATION = 7000;

let activeDragAppEl = null;
let activeDragAppData = null;
let appDragOffsetX = 0, appDragOffsetY = 0;
let appDragMoved = false;
let appDragStartX = 0, appDragStartY = 0;
let activeDockDrag = null;

// Kontext-Menü für Desktop-Icons
let appCtxTarget = null;
const appCtxMenu = document.getElementById('app-context-menu');

function showAppContextMenu(x, y, entry, isSystem) {
    if(!appCtxMenu) return;
    appCtxTarget = { entry, isSystem };
    const uninstallBtn = document.getElementById('app-ctx-uninstall');
    if(uninstallBtn) { uninstallBtn.style.display = isSystem ? 'none' : 'flex'; }
    appCtxMenu.style.left = (x + 10) + 'px';
    appCtxMenu.style.top = (y + 5) + 'px';
    appCtxMenu.style.display = 'flex';
}

document.addEventListener('mousedown', (e) => {
    if(appCtxMenu && !appCtxMenu.contains(e.target)) appCtxMenu.style.display = 'none';
});

document.getElementById('app-ctx-open').addEventListener('click', () => {
    if(!appCtxTarget) return;
    appCtxMenu.style.display = 'none';
    const appId = appCtxTarget.isSystem ? appCtxTarget.entry.id : appCtxTarget.entry.appId;
    window.openApp(appId);
    window.playSound('open');
});

document.getElementById('app-ctx-uninstall').addEventListener('click', () => {
    if(!appCtxTarget || appCtxTarget.isSystem) return;
    appCtxMenu.style.display = 'none';
    window.uninstallApp(appCtxTarget.entry.appId);
});

function readLyraJSON(key, fallback) {
    try {
        const value = JSON.parse(localStorage.getItem(key));
        return value === null ? fallback : value;
    } catch(e) {
        return fallback;
    }
}

function saveInstalledApps() {
    localStorage.setItem('lyraInstalledApps', JSON.stringify(installedApps));
}

function saveSystemAppPositions() {
    localStorage.setItem('lyraSystemAppPos', JSON.stringify(systemAppPositions));
}

function saveCoreAppPositions() {
    localStorage.setItem('lyraCoreAppPos', JSON.stringify(coreAppPositions));
}

function saveDockApps() {
    localStorage.setItem('lyraDockApps', JSON.stringify(dockApps));
}

function isAppInDock(appId) {
    return dockApps.includes(appId);
}

function getDesktopEntryAppId(entry, isSystem, isCore) {
    return (isSystem || isCore) ? entry.id : entry.appId;
}

function getDesktopDropPosition(x, y) {
    return {
        x: snapToGrid(Math.max(10, Math.min(window.innerWidth - 105, x - 42))),
        y: snapToGrid(Math.max(50, Math.min(window.innerHeight - 150, y - 42)))
    };
}

function isPointInDock(x, y) {
    const dock = document.querySelector('.dock');
    if(!dock) return false;
    const rect = dock.getBoundingClientRect();
    return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function setDockDropPreview(active) {
    const dock = document.querySelector('.dock');
    if(dock) dock.classList.toggle('dock-drop-target', !!active);
}

function setDesktopAppPosition(appId, pos) {
    if(CORE_APPS.some(app => app.id === appId)) {
        coreAppPositions[appId] = pos;
        saveCoreAppPositions();
        return;
    }
    if(SYSTEM_APPS.some(app => app.id === appId)) {
        systemAppPositions[appId] = pos;
        saveSystemAppPositions();
        return;
    }
    const entry = installedApps.find(app => app.appId === appId);
    if(entry) {
        entry.x = pos.x;
        entry.y = pos.y;
        saveInstalledApps();
    }
}

function moveDesktopAppToDock(appId) {
    if(!getAppInfo(appId) || isAppInDock(appId)) return;
    dockApps.push(appId);
    saveDockApps();
    renderDock();
    renderInstalledApps();
    window.playSound('open');
}

function moveDockAppToDesktop(appId, x, y) {
    if(!isAppInDock(appId)) return;
    dockApps = dockApps.filter(id => id !== appId);
    saveDockApps();
    setDesktopAppPosition(appId, getDesktopDropPosition(x, y));
    renderDock();
    renderInstalledApps();
    window.playSound('open');
}

function attachAppIconEvents(el, entry, isSystem, isCore) {
    let holdTimer = null;
    let wasHeld = false;

    el.addEventListener('mousedown', (e) => {
        if(e.button !== 0) return;
        e.preventDefault();
        wasHeld = false;
        activeDragAppEl = el;
        activeDragAppData = { entry, isSystem, isCore };
        appDragMoved = false;
        appDragStartX = e.clientX;
        appDragStartY = e.clientY;
        const rect = el.getBoundingClientRect();
        appDragOffsetX = e.clientX - rect.left;
        appDragOffsetY = e.clientY - rect.top;
    });

    el.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        showAppContextMenu(e.clientX, e.clientY, entry, isSystem || isCore);
    });
}

document.addEventListener('mousemove', (e) => {
    if(!activeDragAppEl) return;
    const dist = Math.hypot(e.clientX - appDragStartX, e.clientY - appDragStartY);
    if(!appDragMoved && dist > 6) {
        appDragMoved = true;
        activeDragAppEl.classList.add('dragging');
        activeDragAppEl.style.zIndex = 200;
    }
    if(appDragMoved) {
        activeDragAppEl.style.left = (e.clientX - appDragOffsetX) + 'px';
        activeDragAppEl.style.top = (e.clientY - appDragOffsetY) + 'px';
        setDockDropPreview(isPointInDock(e.clientX, e.clientY));
    }
});

document.addEventListener('mouseup', () => {
    if(!activeDragAppEl) return;
    if(appDragMoved) {
        const { entry, isSystem, isCore } = activeDragAppData;
        const appId = getDesktopEntryAppId(entry, isSystem, isCore);
        if(isPointInDock(e.clientX, e.clientY)) {
            activeDragAppEl.classList.remove('dragging');
            activeDragAppEl.style.zIndex = '';
            moveDesktopAppToDock(appId);
            setDockDropPreview(false);
            activeDragAppEl = null;
            activeDragAppData = null;
            appDragMoved = false;
            return;
        }
        const snappedX = snapToGrid(parseInt(activeDragAppEl.style.left));
        const snappedY = snapToGrid(parseInt(activeDragAppEl.style.top));
        activeDragAppEl.classList.remove('dragging');
        activeDragAppEl.style.left = snappedX + 'px';
        activeDragAppEl.style.top = snappedY + 'px';
        activeDragAppEl.style.zIndex = '';
        if(isCore) {
            coreAppPositions[entry.id] = { x: snappedX, y: snappedY };
            saveCoreAppPositions();
        } else if(isSystem) {
            systemAppPositions[entry.id] = { x: snappedX, y: snappedY };
            saveSystemAppPositions();
        } else {
            entry.x = snappedX; entry.y = snappedY;
            saveInstalledApps();
        }
    } else {
        // Kurzer Klick = App öffnen
        const { entry, isSystem, isCore } = activeDragAppData;
        const appId = getDesktopEntryAppId(entry, isSystem, isCore);
        window.openApp(appId);
    }
    setDockDropPreview(false);
    activeDragAppEl = null;
    activeDragAppData = null;
    appDragMoved = false;
});

function getAppInfo(appId) {
    return CORE_APPS.find(a => a.id === appId) || SYSTEM_APPS.find(a => a.id === appId) || STORE_APPS.find(a => a.id === appId);
}

function buildAppIconElement(entry, isSystem, isCore) {
    const appInfo = getAppInfo(getDesktopEntryAppId(entry, isSystem, isCore));
    if(!appInfo) return null;
    const pos = isCore ? coreAppPositions[entry.id] : (isSystem ? systemAppPositions[entry.id] : { x: entry.x, y: entry.y });
    const el = document.createElement('div');
    el.className = 'installed-app-icon';
    el.style.left = (pos ? pos.x : 100) + 'px';
    el.style.top = (pos ? pos.y : 100) + 'px';
    el.dataset.appId = getDesktopEntryAppId(entry, isSystem, isCore);
    el.innerHTML = `<div class="icon-svg">${appInfo.icon}</div><span>${appInfo.name}</span>`;
    attachAppIconEvents(el, entry, isSystem, isCore);
    return el;
}

function animateDockResize(dock, beforeWidth, afterWidth) {
    if(!dock || !beforeWidth || !afterWidth || Math.abs(beforeWidth - afterWidth) < 2) return;
    dock.style.width = beforeWidth + 'px';
    dock.offsetWidth;
    dock.style.width = afterWidth + 'px';
    setTimeout(() => { dock.style.width = ''; }, 280);
}

function attachDockTileEvents(el, appId) {
    el.addEventListener('mousedown', (e) => {
        if(e.button !== 0) return;
        e.preventDefault();
        const rect = el.getBoundingClientRect();
        activeDockDrag = {
            appId,
            sourceEl: el,
            ghost: null,
            moved: false,
            startX: e.clientX,
            startY: e.clientY,
            offsetX: e.clientX - rect.left,
            offsetY: e.clientY - rect.top
        };
    });
}

function buildDockTileElement(appId) {
    const appInfo = getAppInfo(appId);
    if(!appInfo) return null;
    const el = document.createElement('div');
    el.className = 'app-tile';
    el.dataset.app = appId;
    el.title = appInfo.name;
    el.innerHTML = appInfo.icon;
    attachDockTileEvents(el, appId);
    return el;
}

function renderDock() {
    const container = document.querySelector('.dock-container');
    if(!container) return;
    const dock = document.querySelector('.dock');
    const beforeWidth = dock ? dock.getBoundingClientRect().width : 0;
    const validDockApps = dockApps.filter((id, index, arr) => getAppInfo(id) && arr.indexOf(id) === index);
    if(validDockApps.length !== dockApps.length) {
        dockApps = validDockApps;
        saveDockApps();
    }

    container.innerHTML = '';
    dockApps.forEach(appId => {
        const el = buildDockTileElement(appId);
        if(el) container.appendChild(el);
    });

    const afterWidth = dock ? dock.getBoundingClientRect().width : 0;
    animateDockResize(dock, beforeWidth, afterWidth);
    dockApps.forEach(syncDockIndicator);
}

document.addEventListener('mousemove', (e) => {
    if(!activeDockDrag) return;
    const dist = Math.hypot(e.clientX - activeDockDrag.startX, e.clientY - activeDockDrag.startY);
    if(!activeDockDrag.moved && dist > 6) {
        activeDockDrag.moved = true;
        activeDockDrag.sourceEl.classList.add('dock-dragging-source');
        const rect = activeDockDrag.sourceEl.getBoundingClientRect();
        const ghost = activeDockDrag.sourceEl.cloneNode(true);
        ghost.classList.add('dock-drag-ghost');
        ghost.style.left = rect.left + 'px';
        ghost.style.top = rect.top + 'px';
        ghost.style.width = rect.width + 'px';
        ghost.style.height = rect.height + 'px';
        document.body.appendChild(ghost);
        activeDockDrag.ghost = ghost;
    }
    if(activeDockDrag.moved && activeDockDrag.ghost) {
        activeDockDrag.ghost.style.left = (e.clientX - activeDockDrag.offsetX) + 'px';
        activeDockDrag.ghost.style.top = (e.clientY - activeDockDrag.offsetY) + 'px';
    }
});

document.addEventListener('mouseup', (e) => {
    if(!activeDockDrag) return;
    const dragData = activeDockDrag;
    if(dragData.sourceEl) dragData.sourceEl.classList.remove('dock-dragging-source');
    if(dragData.ghost) dragData.ghost.remove();
    activeDockDrag = null;

    if(!dragData.moved) {
        window.toggleApp(dragData.appId);
        return;
    }

    if(!isPointInDock(e.clientX, e.clientY)) {
        moveDockAppToDesktop(dragData.appId, e.clientX, e.clientY);
    }
});

function renderInstalledApps() {
    const layer = document.getElementById('desktop-apps-layer');
    if(!layer) return;
    layer.innerHTML = '';
    CORE_APPS.forEach(app => {
        if(isAppInDock(app.id)) return;
        if(!coreAppPositions[app.id]) {
            coreAppPositions[app.id] = findNextAppSlot();
            saveCoreAppPositions();
        }
        const el = buildAppIconElement(app, false, true);
        if(el) layer.appendChild(el);
    });
    // System-Apps (Widgets, AppStore)
    SYSTEM_APPS.forEach(app => {
        if(isAppInDock(app.id)) return;
        if(!systemAppPositions[app.id]) {
            systemAppPositions[app.id] = findNextAppSlot();
            saveSystemAppPositions();
        }
        const el = buildAppIconElement(app, true);
        if(el) layer.appendChild(el);
    });
    // Installierte Apps
    installedApps.forEach(entry => {
        if(isAppInDock(entry.appId)) return;
        const el = buildAppIconElement(entry, false);
        if(el) layer.appendChild(el);
    });
}

function renderAppStoreList() {
    const list = document.getElementById('appstore-list');
    if(!list) return;
    const available = STORE_APPS.filter(app => !installedApps.some(i => i.appId === app.id));
    if(available.length === 0) {
        list.innerHTML = '<div class="appstore-empty">Alle Apps installiert ✓</div>';
        return;
    }
    list.innerHTML = available.map(app => {
        if(installingApps.has(app.id)) {
            return `<div class="appstore-tile"><div class="appstore-tile-icon">${app.icon}</div><div class="appstore-tile-name">${app.name}</div><div class="appstore-progress-track"><div class="appstore-progress-fill"></div></div></div>`;
        }
        return `<div class="appstore-tile"><div class="appstore-tile-icon">${app.icon}</div><div class="appstore-tile-name">${app.name}</div><button class="appstore-install-btn" onclick="window.installApp('${app.id}')">Installieren</button></div>`;
    }).join('');
}

function findNextAppSlot() {
    const SLOT_HEIGHT = 108;
    const SLOT_WIDTH = 100;
    const baseX = window.innerWidth - 120;
    const baseY = 70;
    const perCol = Math.max(1, Math.floor((window.innerHeight - 160) / SLOT_HEIGHT));
    const occupied = new Set();

    CORE_APPS.forEach(app => {
        const pos = coreAppPositions[app.id];
        if(pos && !isAppInDock(app.id)) occupied.add(snapToGrid(pos.x) + ':' + snapToGrid(pos.y));
    });
    SYSTEM_APPS.forEach(app => {
        const pos = systemAppPositions[app.id];
        if(pos && !isAppInDock(app.id)) occupied.add(snapToGrid(pos.x) + ':' + snapToGrid(pos.y));
    });
    installedApps.forEach(entry => {
        if(!isAppInDock(entry.appId)) occupied.add(snapToGrid(entry.x) + ':' + snapToGrid(entry.y));
    });

    for(let i = 0; i < 120; i++) {
        const col = Math.floor(i / perCol);
        const row = i % perCol;
        const pos = { x: Math.max(10, baseX - col * SLOT_WIDTH), y: baseY + row * SLOT_HEIGHT };
        const key = snapToGrid(pos.x) + ':' + snapToGrid(pos.y);
        if(!occupied.has(key)) return pos;
    }
    return { x: Math.max(10, baseX), y: baseY };
}

window.installApp = function(appId) {
    if(!STORE_APPS.find(a => a.id === appId) || installingApps.has(appId)) return;
    window.playSound('click');
    installingApps.add(appId);
    renderAppStoreList();
    setTimeout(() => {
        installingApps.delete(appId);
        const slot = findNextAppSlot();
        installedApps.push({ appId, x: slot.x, y: slot.y });
        saveInstalledApps();
        renderInstalledApps();
        renderAppStoreList();
        window.playSound('open');
    }, APP_INSTALL_DURATION);
};

window.uninstallApp = function(appId) {
    window.playSound('close');
    const app = document.getElementById(appId);
    if(app && app.classList.contains('active')) window.closeApp(appId);
    installedApps = installedApps.filter(i => i.appId !== appId);
    dockApps = dockApps.filter(id => id !== appId);
    saveDockApps();
    saveInstalledApps();
    renderDock();
    renderInstalledApps();
    renderAppStoreList();
};

renderDock();
renderInstalledApps();
renderAppStoreList();
updateSnakeHUD();
updateTTTHUD();
