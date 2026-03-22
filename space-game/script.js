/* --- GAME CONFIG --- */
// NAME: Space Game
// EMOJI: 🚀
/* ------------------- */
(function() {
    // --- 1. UI & TOOLTIPS ---
    document.body.innerHTML = ''; 
    const ui = document.createElement('div');
    ui.style = 'position:fixed; bottom:0; left:0; width:100%; color:white; font-family:monospace; z-index:100; background:rgba(10,10,10,0.98); padding:12px; border-top:2px solid #333; display:flex; justify-content:center; gap:10px; flex-wrap:wrap; box-sizing:border-box;';
    
    const tooltip = document.createElement('div');
    tooltip.style = 'position:fixed; background:rgba(0,0,0,0.9); color:#0af; padding:5px 10px; border:1px solid #0af; border-radius:4px; font-family:monospace; font-size:12px; pointer-events:none; display:none; z-index:1000;';
    document.body.appendChild(tooltip);

    const statusMsg = document.createElement('div');
    statusMsg.style = 'position:fixed; top:20%; left:50%; transform:translateX(-50%); color:#fb0; font-family:monospace; font-size:24px; pointer-events:none; display:none; z-index:500; text-shadow: 2px 2px #000;';
    statusMsg.innerText = "Placez où vous voulez (Place where you want)";
    document.body.appendChild(statusMsg);

    const createBtn = (id, text, english, color) => {
        const btn = document.createElement('button');
        if(id) btn.id = id; 
        btn.innerText = text; btn.className = 'menuBtn';
        btn.style.background = color;
        btn.onmouseenter = (e) => { tooltip.style.display = 'block'; tooltip.innerText = `English: ${english}`; };
        btn.onmousemove = (e) => { tooltip.style.left = (e.clientX + 15) + 'px'; tooltip.style.top = (e.clientY - 30) + 'px'; };
        btn.onmouseleave = () => tooltip.style.display = 'none';
        return btn;
    };

    ui.innerHTML = `<div style="position:absolute; top:-30px; left:10px; background:rgba(0,0,0,0.8); padding:4px 12px; border-radius:5px 5px 0 0; font-size:12px; border:1px solid #333; border-bottom:none;">SÉLECTION: <span id="selName" style="color:#0af;">AUCUNE</span> | ZOOM: <span id="zoomDisplay">0.15</span>x | TEMPS: <span id="speedDisplay">1.0</span>x</div>`;
    
    ui.appendChild(createBtn('slowBtn', 'RALENTIR', 'SLOW DOWN', '#444'));
    ui.appendChild(createBtn('fastBtn', 'ACCÉLÉRER', 'SPEED UP', '#444'));
    ui.appendChild(createBtn('moveBtn', 'DÉPLACER', 'MOVE', '#642'));
    ui.appendChild(createBtn('followBtn', 'SUIVRE: OFF', 'FOLLOW: OFF', '#246'));
    ui.appendChild(createBtn('spawnMenuBtn', '+ CORPS CÉLESTE', '+ CELESTIAL BODY', '#262'));
    ui.appendChild(createBtn('presetsBtn', 'PRÉRÉGLAGES', 'PRESETS', '#057'));
    ui.appendChild(createBtn('clearBtn', 'EFFACER', 'CLEAR ALL', '#622'));
    ui.appendChild(createBtn('pauseBtn', 'PAUSE (Espace)', 'PAUSE (Space)', '#333'));
    document.body.appendChild(ui);

    const spawnMenu = document.createElement('div');
    spawnMenu.className = 'subMenu';
    spawnMenu.style = 'position:fixed; bottom:80px; left:40%; display:none; flex-direction:column; gap:5px; background:rgba(20,20,20,0.9); padding:10px; border:1px solid #555; border-radius:8px;';
    const typeBtn = (txt, eng, col, type) => {
        const b = createBtn('', txt, eng, col);
        b.onclick = () => { pendingSpawn = type; spawnMenu.style.display = 'none'; statusMsg.style.display = 'block'; };
        return b;
    };
    spawnMenu.appendChild(typeBtn('Planète', 'Planet', '#353', 'planet'));
    spawnMenu.appendChild(typeBtn('Lune', 'Moon (Auto-Orbit)', '#555', 'moon'));
    spawnMenu.appendChild(typeBtn('Géante Gazeuse', 'Gas Giant', '#753', 'gas'));
    spawnMenu.appendChild(typeBtn('Étoile', 'Star', '#860', 'star'));
    spawnMenu.appendChild(typeBtn('Trou Noir', 'Black Hole', '#000', 'blackhole'));
    document.body.appendChild(spawnMenu);

    const presetsMenu = document.createElement('div');
    presetsMenu.className = 'subMenu';
    presetsMenu.style = 'position:fixed; bottom:80px; left:55%; display:none; flex-direction:column; gap:5px; background:rgba(20,20,20,0.9); padding:10px; border:1px solid #555; border-radius:8px;';
    const preBtn = (txt, eng, col, key) => {
        const b = createBtn('', txt, eng, col);
        b.onclick = () => { loadPreset(key); presetsMenu.style.display = 'none'; };
        return b;
    };
    presetsMenu.appendChild(preBtn('Système Solaire', 'Solar System', '#057', 'solar'));
    presetsMenu.appendChild(preBtn('Étoile Seule', 'Lone Star', '#860', 'lone'));
    presetsMenu.appendChild(preBtn('Gaia BH (Orbit)', 'Gaia Black Hole', '#426', 'gaia'));
    presetsMenu.appendChild(preBtn('5 Binaires Chaos', '5 Chaos Binaries', '#b40', 'binary5'));
    presetsMenu.appendChild(preBtn('Collision BH', 'BH Collision', '#000', 'bhcrash'));
    document.body.appendChild(presetsMenu);

    const inspector = document.createElement('div');
    inspector.id = "inspector";
    inspector.style = 'position:fixed; top:20px; right:20px; background:rgba(20,20,20,0.95); padding:15px; border:1px solid #555; color:white; font-family:monospace; display:none; z-index:101; width:240px; border-radius:8px;';
    inspector.innerHTML = `
        <div style="color:#fb0; margin-bottom:10px; border-bottom:1px solid #444;">INSPECTEUR</div>
        Nom: <input type="text" id="nameInput" style="width:100%; background:#000; color:#fff; border:1px solid #777; margin-bottom:10px;">
        Taille: <input type="range" id="sizeSlider" min="2" max="250" value="10" style="width:100%; margin-bottom:10px;">
        Masse: <span id="massDisp">0</span>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:5px; margin-top:10px;">
            <button id="staticBtn" class="menuBtn" style="background:#444;">STATIQUE: NON</button>
            <button id="delBtn" class="menuBtn" style="background:#622;">SUPPRIMER</button>
            <button id="closeInspector" class="menuBtn" style="background:#333; grid-column: span 2;">FERMER</button>
        </div>
    `;
    document.body.appendChild(inspector);

    const style = document.createElement('style');
    style.innerHTML = `.menuBtn { color:white; border:1px solid #444; padding:8px 12px; cursor:pointer; font-family:monospace; border-radius:4px; font-size:11px; transition:0.2s; } .active { border-color: #0af; box-shadow: 0 0 10px #0af; }`;
    document.head.appendChild(style);

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);
    document.body.style.cssText = 'margin:0; overflow:hidden; background:black;';

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.onresize = resize; resize();

    // --- 2. PHYSICS ---
    const G = 0.8; 
    let planets = [], isPaused = false, cameraZoom = 0.15, offsetX = 0, offsetY = 0;
    let timeScale = 0.05; 
    let selectedPlanet = null, following = false, moveMode = false, pendingSpawn = null;
    let isPanning = false, lastMX = 0, lastMY = 0;

    const names = ["Aero", "Boreas", "Cygnus", "Delta", "Eon", "Flux", "Giga", "Helios", "Ion", "Juno", "Krios", "Lumina"];
    const getRandomName = () => names[Math.floor(Math.random() * names.length)] + "-" + Math.floor(Math.random() * 999);

    class Planet {
        constructor(x, y, radius, color, vx = 0, vy = 0, mass = null, name = "Objet", isStatic = false) {
            this.x = x; this.y = y;
            this.radius = radius;
            this.mass = mass || Math.pow(radius, 3) / 5;
            this.color = color; this.vx = vx; this.vy = vy;
            this.name = name; this.isStatic = isStatic; this.parent = null; this.path = [];
        }
        draw() {
            const sx = (this.x - canvas.width/2 + offsetX) * cameraZoom + canvas.width/2;
            const sy = (this.y - canvas.height/2 + offsetY) * cameraZoom + canvas.height/2;
            const sr = Math.max(1, this.radius * cameraZoom);
            if (this.path.length > 2 && this.parent) {
                ctx.beginPath(); ctx.strokeStyle = this.color; ctx.globalAlpha = 0.2;
                for(let p of this.path) ctx.lineTo((this.parent.x + p.dx - canvas.width/2 + offsetX) * cameraZoom + canvas.width/2, (this.parent.y + p.dy - canvas.height/2 + offsetY) * cameraZoom + canvas.height/2);
                ctx.stroke(); ctx.globalAlpha = 1.0;
            }
            ctx.beginPath(); ctx.arc(sx, sy, sr, 0, Math.PI * 2);
            ctx.fillStyle = (selectedPlanet === this) ? "white" : this.color;
            ctx.fill();
            if (cameraZoom > 0.04) { ctx.fillStyle = "white"; ctx.font = "10px monospace"; ctx.fillText(this.name, sx + sr + 3, sy + 3); }
        }
        update() {
            if (isPaused || this.isStatic) return;
            this.x += this.vx * (timeScale * 20); 
            this.y += this.vy * (timeScale * 20);
            if (this.parent) { this.path.push({ dx: this.x - this.parent.x, dy: this.y - this.parent.y }); if (this.path.length > 100) this.path.shift(); }
        }
    }

    function applyPhysics() {
        if (isPaused) return;
        const steps = timeScale * 20;
        for (let i = 0; i < planets.length; i++) {
            for (let j = i + 1; j < planets.length; j++) {
                let p1 = planets[i], p2 = planets[j];
                let dx = p2.x - p1.x, dy = p2.y - p1.y, d2 = dx*dx + dy*dy, d = Math.sqrt(d2);
                if (d < (p1.radius + p2.radius) * 0.95) {
                    let big = p1.mass >= p2.mass ? p1 : p2, small = p1.mass < p2.mass ? p1 : p2;
                    if (!big.isStatic) { big.vx = (big.vx*big.mass + small.vx*small.mass)/(big.mass+small.mass); big.vy = (big.vy*big.mass + small.vy*small.mass)/(big.mass+small.mass); }
                    big.mass += small.mass; big.radius = Math.pow(big.mass*5, 1/3);
                    planets.splice(planets.indexOf(small), 1); return;
                }
                let f = G * (p1.mass * p2.mass) / d2;
                if (!p1.isStatic) { p1.vx += (dx/d)*(f/p1.mass)*steps; p1.vy += (dy/d)*(f/p1.mass)*steps; }
                if (!p2.isStatic) { p2.vx -= (dx/d)*(f/p2.mass)*steps; p2.vy -= (dy/d)*(f/p2.mass)*steps; }
            }
        }
    }

    const loadPreset = (type) => {
        planets = []; offsetX = 0; offsetY = 0; following = false; selectedPlanet = null; timeScale = 0.05;
        const cx = canvas.width/2, cy = canvas.height/2;
        const add = (x, y, r, c, m, n, vx=0, vy=0, s=false) => {
            const p = new Planet(x, y, r, c, vx, vy, m, n, s);
            planets.push(p); return p;
        };

        if (type === 'solar') {
            const sun = add(cx, cy, 45, '#ff0', 1200000, "Soleil", 0, 0, true);
            const orbit = (d, r, c, m, n) => {
                const v = Math.sqrt((G * sun.mass) / d);
                const p = add(cx + d, cy, r, c, m, n, 0, v);
                p.parent = sun; return p;
            };
            orbit(180, 4, '#aaa', 20, "Mercure");
            orbit(300, 8, '#ec0', 100, "Vénus");
            const e = orbit(450, 9, '#28f', 500, "Terre");
            const l = add(e.x + 30, e.y, 2.5, '#eee', 5, "Lune", 0, e.vy + Math.sqrt((G * e.mass)/30)); l.parent = e;
            orbit(650, 7, '#f44', 60, "Mars");
            orbit(1100, 25, '#f96', 5000, "Jupiter");
            orbit(1700, 20, '#db5', 4000, "Saturne");
            orbit(2300, 15, '#aff', 1500, "Uranus");
            orbit(2900, 15, '#35f', 1500, "Neptune");
            orbit(3500, 3, '#963', 20, "Pluton");
        } else if (type === 'lone') {
            add(cx, cy, 45, '#ff0', 1200000, "Soleil", 0, 0, false);
        } else if (type === 'gaia') {
            const bh = add(cx - 50, cy, 10, 'black', 2000000, "Gaia-BH", 0, 3, false);
            const star = add(cx + 350, cy, 20, '#f80', 50000, "Étoile", 0, -8, false);
            star.parent = bh;
        } else if (type === 'binary5') {
            for(let i=0; i<5; i++) {
                const a = (i/5) * Math.PI * 2;
                // High tangential velocity for chaotic slingshot
                add(cx + Math.cos(a)*400, cy + Math.sin(a)*400, 15, `hsl(${i*72},80%,60%)`, 400000, "Binaire-"+i, -Math.sin(a)*8, Math.cos(a)*8, false);
            }
        } else if (type === 'bhcrash') {
            add(cx - 350, cy, 12, 'black', 1500000, "BH-1", 0, 4, false);
            add(cx + 350, cy, 12, 'black', 1500000, "BH-2", 0, -4, false);
        }
        document.getElementById('speedDisplay').innerText = "1.0";
    };

    canvas.onclick = (e) => {
        if (e.target.closest('div')) return;
        const wx = (e.clientX - canvas.width/2) / cameraZoom + canvas.width/2 - offsetX;
        const wy = (e.clientY - canvas.height/2) / cameraZoom + canvas.height/2 - offsetY;

        if (pendingSpawn) {
            let p;
            if (pendingSpawn === 'planet') p = new Planet(wx, wy, 8, '#28f', 0, 0, 150, getRandomName());
            else if (pendingSpawn === 'moon') p = new Planet(wx, wy, 3, '#ddd', 0, 0, 5, "Moon-" + Math.floor(Math.random()*99));
            else if (pendingSpawn === 'gas') p = new Planet(wx, wy, 20, '#f96', 0, 0, 2000, getRandomName());
            else if (pendingSpawn === 'star') p = new Planet(wx, wy, 40, '#ff0', 0, 0, 800000, "Étoile", false);
            else if (pendingSpawn === 'blackhole') p = new Planet(wx, wy, 15, 'black', 0, 0, 2000000, "Trou Noir", false);
            
            if (planets.length > 0 && !p.isStatic) {
                let t = planets.reduce((a, b) => Math.sqrt((wx-a.x)**2 + (wy-a.y)**2)/a.mass < Math.sqrt((wx-b.x)**2 + (wy-b.y)**2)/b.mass ? a : b);
                let dx = wx - t.x, dy = wy - t.y, d = Math.sqrt(dx*dx + dy*dy), s = Math.sqrt((G * t.mass) / d);
                p.vx = (dy/d)*s + t.vx; p.vy = (-(dx/d))*s + t.vy; p.parent = t;
            }
            planets.push(p); selectedPlanet = p; pendingSpawn = null; statusMsg.style.display = 'none';
            inspector.style.display = 'block'; document.getElementById('nameInput').value = p.name;
            return;
        }

        if (moveMode && selectedPlanet) { selectedPlanet.x = wx; selectedPlanet.y = wy; selectedPlanet.path = []; moveMode = false; document.getElementById('moveBtn').classList.remove('active'); return; }

        let found = planets.find(p => Math.sqrt((wx-p.x)**2 + (wy-p.y)**2) < (p.radius + 30)/cameraZoom);
        if (found) {
            selectedPlanet = found;
            inspector.style.display = 'block'; document.getElementById('nameInput').value = found.name;
            document.getElementById('staticBtn').innerText = "STATIQUE: " + (found.isStatic ? "OUI" : "NON");
            document.getElementById('massDisp').innerText = Math.round(found.mass);
            document.getElementById('sizeSlider').value = found.radius;
        } else { inspector.style.display = 'none'; }
    };

    canvas.onmousedown = (e) => { if (!selectedPlanet || !moveMode) { isPanning = true; lastMX = e.clientX; lastMY = e.clientY; } };
    window.onmousemove = (e) => { if (isPanning && !following) { offsetX += (e.clientX - lastMX) / cameraZoom; offsetY += (e.clientY - lastMY) / cameraZoom; lastMX = e.clientX; lastMY = e.clientY; } };
    window.onmouseup = () => isPanning = false;

    document.getElementById('nameInput').oninput = (e) => { if(selectedPlanet) selectedPlanet.name = e.target.value; };
    document.getElementById('sizeSlider').oninput = (e) => {
        if(selectedPlanet) {
            let r = parseFloat(e.target.value);
            selectedPlanet.radius = r;
            selectedPlanet.mass = Math.pow(r, 3)/5;
            document.getElementById('massDisp').innerText = Math.round(selectedPlanet.mass);
        }
    };
    document.getElementById('staticBtn').onclick = () => { if (selectedPlanet) { selectedPlanet.isStatic = !selectedPlanet.isStatic; document.getElementById('staticBtn').innerText = "STATIQUE: " + (selectedPlanet.isStatic ? "OUI" : "NON"); } };
    document.getElementById('delBtn').onclick = () => { if (selectedPlanet) { planets = planets.filter(p => p !== selectedPlanet); selectedPlanet = null; inspector.style.display = 'none'; } };
    document.getElementById('moveBtn').onclick = () => { if (selectedPlanet) { moveMode = !moveMode; document.getElementById('moveBtn').classList.toggle('active', moveMode); }};
    document.getElementById('followBtn').onclick = () => { if (selectedPlanet) { following = !following; document.getElementById('followBtn').innerText = "SUIVRE: " + (following ? "ON" : "OFF"); document.getElementById('followBtn').classList.toggle('active', following); }};
    document.getElementById('spawnMenuBtn').onclick = () => { spawnMenu.style.display = (spawnMenu.style.display === 'flex' ? 'none' : 'flex'); presetsMenu.style.display = 'none'; };
    document.getElementById('presetsBtn').onclick = () => { presetsMenu.style.display = (presetsMenu.style.display === 'flex' ? 'none' : 'flex'); spawnMenu.style.display = 'none'; };
    document.getElementById('clearBtn').onclick = () => { planets = []; selectedPlanet = null; following = false; inspector.style.display = 'none'; };
    document.getElementById('fastBtn').onclick = () => { timeScale *= 1.25; document.getElementById('speedDisplay').innerText = (timeScale/0.05).toFixed(1); };
    document.getElementById('slowBtn').onclick = () => { timeScale /= 1.25; document.getElementById('speedDisplay').innerText = (timeScale/0.05).toFixed(1); };
    
    const togglePause = () => { isPaused = !isPaused; document.getElementById('pauseBtn').innerText = isPaused ? "REPRENDRE (Espace)" : "PAUSE (Espace)"; };
    document.getElementById('pauseBtn').onclick = togglePause;

    window.addEventListener('keydown', (e) => {
        if (e.key === "ArrowUp") cameraZoom *= 1.15; if (e.key === "ArrowDown") cameraZoom *= 0.85;
        if (e.code === "Space") { e.preventDefault(); togglePause(); }
        document.getElementById('zoomDisplay').innerText = cameraZoom.toFixed(2);
    });

    function loop() {
        ctx.fillStyle = 'black'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        applyPhysics();
        if (following && selectedPlanet) { offsetX = -(selectedPlanet.x - canvas.width/2); offsetY = -(selectedPlanet.y - canvas.height/2); }
        planets.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(loop);
    }
    loadPreset('solar'); loop();
})();

/* --- THE HOME BUTTON (Don't touch this) --- */
(function() { 
    if (!document.getElementById('dec-nav')) { 
        const nav = document.createElement('a'); 
        nav.id = 'dec-nav'; 
        nav.href = '../index.html'; 
        nav.innerText = '← Dec Games'; 
        nav.style.cssText = 'position:fixed; top:15px; left:15px; z-index:99999; padding:10px 15px; background:rgba(0,0,0,0.8); color:white; text-decoration:none; border-radius:8px; font-family:sans-serif; font-weight:bold; border:1px solid rgba(255,255,255,0.2); pointer-events: auto;'; 
        document.body.appendChild(nav); 
    } 
})();
