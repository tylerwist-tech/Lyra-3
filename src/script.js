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
        gainNode.gain.linearRampToValueAtTime(0.25, now + 0.04); 
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'close') {
        osc.type = 'sine'; 
        osc.frequency.setValueAtTime(220, now); 
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.18);
        gainNode.gain.setValueAtTime(0, now); 
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.04); 
        gainNode.gain.linearRampToValueAtTime(0, now + 0.2);
        osc.start(now); osc.stop(now + 0.2);
    } else if (type === 'click') {
        osc.type = 'triangle'; 
        osc.frequency.setValueAtTime(160, now);
        gainNode.gain.setValueAtTime(0.12, now); 
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now); osc.stop(now + 0.04);
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

// === CURSOR SELECTION ENGINE ===
window.setCursorType = function(type) {
    window.playSound('click');
    const circleBtn = document.getElementById('cursor-circle-btn');
    const crossBtn = document.getElementById('cursor-cross-btn');
    
    document.body.classList.remove('cross-mode');
    if(circleBtn) circleBtn.classList.remove('active-mode');
    if(crossBtn) crossBtn.classList.remove('active-mode');

    if(type === 'cross') {
        document.body.classList.add('cross-mode');
        if(crossBtn) crossBtn.classList.add('active-mode');
    } else {
        if(circleBtn) circleBtn.classList.add('active-mode');
    }
};

// === GLOBAL THEME ACCENT ENGINE ===
window.changeBg = function(gradient, accentHex, glowRGBA) { 
    const bgLayer = document.getElementById('desktop-bg-layer');
    if(bgLayer) {
        bgLayer.style.background = gradient;
        bgLayer.style.backgroundImage = gradient;
        bgLayer.style.backgroundSize = "400% 400%";
    }
    document.documentElement.style.setProperty('--accent-color', accentHex);
    document.documentElement.style.setProperty('--accent-glow', glowRGBA);
    window.playSound('click'); 
};

window.changeCursorColor = function(hex) { 
    document.documentElement.style.setProperty('--cursor-color', hex); 
    window.playSound('click'); 
};

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
};

window.closeApp = function(appId) {
    window.playSound('close');
    const app = document.getElementById(appId);
    if(app) app.classList.remove('active');
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

document.addEventListener('mouseup', () => {
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
        window.playSound('click');
        checkTTTWin();
        tttPlayer = "X";
    }
}

function checkTTTWin() {
    const wins = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
    for(let w of wins) {
        if(tttBoard[w[0]] && tttBoard[w[0]] === tttBoard[w[1]] && tttBoard[w[0]] === tttBoard[w[2]]) {
            tttActive = false;
            setTimeout(() => { window.showOSDialog("Spielende", tttBoard[w[0]] + " gewinnt!"); initTTT(); }, 200);
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

// === SNAKE ENGINE ===
const sCanvas = document.getElementById('snake-canvas');
const sCtx = sCanvas ? sCanvas.getContext('2d') : null;
let sSnake = [{x: 200, y: 200}];
let sFood = {x: 100, y: 100};
let dx = 20, dy = 0;
let sScore = 0;
let sInterval;
let changingDirection = false;

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
        sScore += 10; document.getElementById('snake-score').innerText = "Score: " + sScore;
        window.playSound('click'); generateFoodLocation();
    } else { sSnake.pop(); }

    if(head.x < 0 || head.x >= 400 || head.y < 0 || head.y >= 400 || sSnake.slice(1).some(p => p.x === head.x && p.y === head.y)) {
        clearInterval(sInterval);
        document.getElementById('snake-overlay').style.display = 'flex';
        document.getElementById('snake-start-btn').style.display = 'block';
        document.getElementById('snake-countdown').style.display = 'none';
        document.getElementById('snake-start-btn').innerText = "Wiederholen";
        drawInitialSnake(); return;
    }

    drawCyberGrid();
    sCtx.shadowBlur = 18; sCtx.shadowColor = '#ff4757'; sCtx.fillStyle = '#ff4757';
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

// === UHR ===
setInterval(() => {
    const d = new Date();
    const clockEl = document.getElementById('clock');
    if(clockEl) clockEl.innerText = d.toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
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
