
document.body.innerHTML = '';
const container = document.createElement('div');
container.style.cssText = "display:flex; justify-content:center; align-items:center; height:100vh; background:#000; margin:0; overflow:hidden; font-family: 'Courier New';";
document.body.appendChild(container);

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
canvas.width = 800; canvas.height = 600;
container.appendChild(canvas);

const CAM_MAP = {
    "1A": {x: 620, y: 320}, "1B": {x: 600, y: 370}, "1C": {x: 580, y: 420}, 
    "3": {x: 550, y: 460}, "5":  {x: 550, y: 350}, "7": {x: 710, y: 370},
    "6":  {x: 740, y: 460}, "2A": {x: 600, y: 500}, "2B": {x: 600, y: 540}, 
    "4A": {x: 680, y: 500}, "4B": {x: 680, y: 540}
};

let state = {
    mode: "start", night: 1, power: 100, hour: 12, time: 0, pan: 0, targetPan: 0,
    doors: { left: false, right: false }, lights: { left: false, right: false },
    lightTime: { left: 0, right: 0 }, currentCam: "1A", enemies: []
};

function resetGame() {
    state.power = 100; state.hour = 12; state.time = 0;
    state.doors = { left: false, right: false }; state.lights = { left: false, right: false };
    state.enemies = [
        { id: "Freddy", room: "1A", side: "right", color: "#634121", doorTimer: 0, attackTimer: 0 },
        { id: "Bonnie", room: "1A", side: "left", color: "#4B0082", doorTimer: 0, attackTimer: 0 },
        { id: "Chica", room: "1A", side: "right", color: "#FFD700", doorTimer: 0, attackTimer: 0 },
        { id: "Foxy", room: "1C", side: "left", color: "#8B0000", doorTimer: 0, attackTimer: 0 }
    ];
}

canvas.addEventListener('mousemove', (e) => {
    const r = canvas.getBoundingClientRect();
    state.targetPan = ((canvas.width / 2) - (e.clientX - r.left)) * 0.6;
});

function drawFace(x, y, col, id) {
    ctx.fillStyle = col;
    if (id === "Freddy") ctx.fillRect(x, y, 70, 70);
    else if (id === "Bonnie") { ctx.fillRect(x, y, 70, 70); ctx.fillRect(x+10, y-25, 15, 25); ctx.fillRect(x+45, y-25, 15, 25); }
    else if (id === "Chica") { ctx.beginPath(); ctx.arc(x+35, y+35, 40, 0, 7); ctx.fill(); }
    else if (id === "Foxy") { ctx.beginPath(); ctx.moveTo(x, y+70); ctx.lineTo(x+35, y); ctx.lineTo(x+70, y+70); ctx.fill(); }
    ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(x+20, y+25, 5, 0, 7); ctx.fill(); ctx.beginPath(); ctx.arc(x+50, y+25, 5, 0, 7); ctx.fill();
}

function updateGame() {
    state.time++;
    // Speed multiplier: Increases by 0.25 every night
    const nightMult = 1 + (state.night - 1) * 0.25;

    state.pan += (state.targetPan - state.pan) * 0.08;
    state.lightTime.left = state.lights.left ? state.lightTime.left + 1 : 0;
    state.lightTime.right = state.lights.right ? state.lightTime.right + 1 : 0;

    // Hour logic: Exactly 300 seconds (5 minutes) per hour
    if (state.time % 18000 === 0) {
        state.hour = (state.hour === 12) ? 1 : state.hour + 1;
        if (state.hour === 6) state.mode = "win";
    }

    // Power Drain: Base 50,000 interval divided by night multiplier
    let drain = 1 + (state.doors.left?1.2:0) + (state.doors.right?1.2:0) + (state.lights.left||state.lights.right||state.mode==="cams"?0.4:0);
    if (state.time % Math.floor((50000 / nightMult) / drain) === 0 && state.power > 0) state.power--;
    if (state.power <= 0) state.mode = "lose";

    state.enemies.forEach(e => {
        if (e.room === "DOOR") {
            const isProtected = (e.side === "left" ? state.doors.left : state.doors.right);
            if (isProtected) {
                e.attackTimer = 0;
                e.doorTimer++;
                // Door Stay: 60,000 frames standard, effectively shorter as speed increases
                if (e.doorTimer >= (60000 / nightMult)) { e.room = "1B"; e.doorTimer = 0; }
            } else {
                // Attack Grace: 6,000 frames (100s) scales down per night
                e.attackTimer++;
                if (e.attackTimer >= (6000 / nightMult)) state.mode = "lose";
            }
        } 
        // AI Tick: Every 6,000 frames (100s) divided by night speed, 15% chance
        else if (state.time % Math.floor(6000 / nightMult) === 0 && Math.random() < 0.15) {
            if (e.room === "1A") e.room = "1B";
            else if (e.room === "1B") e.room = (e.side === "left") ? "2A" : "4A";
            else if (e.room === "2A") e.room = "2B";
            else if (e.room === "4A") e.room = "4B";
            else if (e.room === "2B" || e.room === "4B") { e.room = "DOOR"; e.doorTimer = 0; e.attackTimer = 0; }
        }
    });
}

function drawOffice() {
    ctx.save(); ctx.translate(state.pan, 0);
    ctx.fillStyle = "#111"; ctx.fillRect(-240, 0, 1280, 450); 
    ctx.fillStyle = "#000"; ctx.fillRect(-240, 450, 1280, 150); 
    
    [-200, 800].forEach((x, i) => {
        const side = i === 0 ? "left" : "right";
        ctx.fillStyle = "#000"; ctx.fillRect(x, 50, 200, 400); 
        if (state.lights[side]) {
            ctx.fillStyle = "rgba(0,0,255,0.05)"; ctx.fillRect(x, 50, 200, 400);
            if (state.lightTime[side] > 15) state.enemies.forEach(en => { if(en.room==="DOOR" && en.side===side) drawFace(x+65, 150, en.color, en.id); });
        }
        if (state.doors[side]) { ctx.fillStyle = "#300"; ctx.fillRect(x, 50, 200, 400); }
    });

    const btn = (x, y, act, col, lab) => { 
        ctx.fillStyle = "#222"; ctx.fillRect(x, y, 45, 55); ctx.fillStyle = act?col:"#000"; ctx.fillRect(x+5, y+5, 35, 25);
        ctx.fillStyle="white"; ctx.font="9px Courier"; ctx.fillText(lab, x+5, y+45);
    };
    btn(20, 240, state.doors.left, "red", "DOOR"); btn(20, 300, state.lights.left, "blue", "LIGHT");
    btn(735, 240, state.doors.right, "red", "DOOR"); btn(735, 300, state.lights.right, "blue", "LIGHT");
    ctx.restore();
    drawHUD();
}

function drawCams() {
    ctx.fillStyle = "#000"; ctx.fillRect(0,0,800,600);
    ctx.fillStyle = "white"; ctx.font = "18px Courier"; ctx.fillText(`CAM: ${state.currentCam} (NIGHT ${state.night})`, 70, 90);
    let off = 0; state.enemies.forEach(e => { if (e.room === state.currentCam) { drawFace(100 + (off * 100), 180, e.color, e.id); off++; } });
    for (let id in CAM_MAP) { 
        let c = CAM_MAP[id]; ctx.fillStyle = state.currentCam === id ? "#ff0" : "#222"; ctx.fillRect(c.x, c.y, 38, 28); 
        ctx.fillStyle = state.currentCam === id ? "#000" : "#fff"; ctx.font = "11px Arial"; ctx.fillText(id, c.x+8, c.y+18); 
    }
    drawHUD();
}

function drawHUD() {
    ctx.fillStyle = "white"; ctx.font = "20px Courier";
    ctx.fillText(`${state.hour} AM`, 700, 40); ctx.fillText(`Power: ${state.power}%`, 30, 540);
    ctx.fillStyle = "rgba(255,255,255,0.2)"; ctx.fillRect(300, 545, 200, 45);
    ctx.fillStyle = "white"; ctx.textAlign="center"; ctx.fillText("MONITOR", 400, 575); ctx.textAlign="left";
}

canvas.addEventListener('mousedown', (e) => {
    const r = canvas.getBoundingClientRect();
    const mx = e.clientX - r.left, my = e.clientY - r.top;
    if (["start", "win", "lose"].includes(state.mode)) { 
        if (state.mode === "win") state.night++;
        resetGame(); 
        state.mode = "office"; 
        return; 
    }
    if (my > 540 && mx > 300 && mx < 500) { state.mode = (state.mode === "office" ? "cams" : "office"); return; }
    if (state.mode === "office") {
        let ax = mx - state.pan;
        if (ax > 20 && ax < 65) { if (my > 240 && my < 295) state.doors.left = !state.doors.left; if (my > 300 && my < 355) state.lights.left = !state.lights.left; }
        if (ax > 735 && ax < 780) { if (my > 240 && my < 295) state.doors.right = !state.doors.right; if (my > 300 && my < 355) state.lights.right = !state.lights.right; }
    } else {
        for (let id in CAM_MAP) { let c = CAM_MAP[id]; if (mx > c.x && mx < c.x+38 && my > c.y && my < c.y+28) state.currentCam = id; }
    }
});

function loop() {
    if (state.mode === "office" || state.mode === "cams") updateGame();
    ctx.clearRect(0,0,800,600);
    if (state.mode === "office") drawOffice();
    else if (state.mode === "cams") drawCams();
    else { 
        ctx.fillStyle="white"; ctx.textAlign="center"; ctx.font="30px Courier";
        ctx.fillText(state.mode.toUpperCase(), 400, 250); ctx.font="15px Courier";
        ctx.fillText("NIGHT " + state.night + " - CLICK TO START", 400, 320); ctx.textAlign="left";
    }
    requestAnimationFrame(loop);
}
resetGame(); loop();


console.log("Waiting for Cube's code...");

(function() { if (!document.getElementById('dec-nav')) { const nav = document.createElement('a'); nav.id = 'dec-nav'; nav.href = '../index.html'; nav.innerText = '← Dec Games'; nav.style.cssText = 'position:fixed; top:15px; left:15px; z-index:9999; padding:10px 15px; background:rgba(0,0,0,0.8); color:white; text-decoration:none; border-radius:8px; font-family:sans-serif; font-weight:bold; border:1px solid rgba(255,255,255,0.2); pointer-events: auto;'; document.body.appendChild(nav); } })();
