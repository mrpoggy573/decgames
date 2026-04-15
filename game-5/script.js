/* --- GAME CONFIG --- */
// NAME: New Game 5
// EMOJI: 🕹️
/* ------------------- */

/* Paste your actual game code BELOW this line! */

(function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    document.body.innerHTML = ''; document.body.appendChild(canvas);
    document.body.style.margin = '0'; document.body.style.overflow = 'hidden';
    document.body.style.backgroundColor = '#050505';
    canvas.style.position = 'fixed'; canvas.style.top = '0'; canvas.style.left = '0';

    function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
    window.addEventListener('resize', resize); resize();

    let state = 'MENU', gameMode = 'CLASSIC', paused = false, score = 0, sessionHighscore = 0;
    let gameOver = false, won = false, button, player, keys = {}, camY = 0;
    let currentDifficulty = 'NORMAL', codeInput = "", hardcoreUnlocked = false, deathReason = "";
    let hands = [], handTimer = 0, shake = 0, particles = [];
    
    let activeICBMs = [];
    let icbmSpawnTimer = 5;
    let deathPhase = 0, deathTimer = 0, flashAlpha = 0, cutsceneTimer = 0;
    let buttonTimer = 10, lastTime = Date.now();

    const configs = {
        EASY: { handFreq: 160, handSpeed: 12, handThickness: 60, icbmFreq: 999, aimTime: 4.0 }, 
        NORMAL: { handFreq: 110, handSpeed: 18, handThickness: 80, icbmFreq: 8, aimTime: 3.0 },
        HARD: { handFreq: 80, handSpeed: 24, handThickness: 110, icbmFreq: 5, aimTime: 2.0 },
        HARDCORE: { handFreq: 65, handSpeed: 28, handThickness: 130, icbmFreq: 2.5, aimTime: 1.0 } 
    };

    function resetGame(level) {
        currentDifficulty = level; score = 0; gameOver = false; won = false;
        camY = 0; deathReason = ""; handTimer = 0; hands = []; shake = 0; particles = [];
        deathPhase = 0; deathTimer = 0; flashAlpha = 0; cutsceneTimer = 0;
        activeICBMs = []; icbmSpawnTimer = configs[level].icbmFreq;
        buttonTimer = gameMode === 'AIM' ? configs[level].aimTime : 10;
        lastTime = Date.now();
        player = { x: canvas.width / 2, y: canvas.height / 2, speed: 13 };
        button = { x: canvas.width / 2, y: canvas.height / 3, radius: 45 };
        state = 'PLAY'; paused = false;
    }

    function createExplosion(x, y, color, count = 15) {
        for(let i=0; i<count; i++) particles.push({ x, y, vx: (Math.random()-0.5)*20, vy: (Math.random()-0.5)*20, life: 1.0, color });
    }

    function spawnICBM() {
        if (currentDifficulty === 'EASY' || gameMode === 'AIM') return;
        if (currentDifficulty !== 'HARDCORE' && activeICBMs.some(m => m.phase !== 'EXPLODE')) return;
        activeICBMs.push({ targetX: player.x, targetY: player.y, timer: 2.2, phase: 'LOCK', blastRadius: 300, missileY: player.y - 1200, explosionRing: 0 });
    }

    function collectButton() {
        createExplosion(button.x, button.y, '#ff0000');
        score++; shake = 12;
        if (score > sessionHighscore) sessionHighscore = score;
        buttonTimer = gameMode === 'AIM' ? configs[currentDifficulty].aimTime : 10; 
        button.x = 100 + Math.random() * (canvas.width - 200);
        button.y = gameMode === 'AIM' ? 100 + Math.random() * (canvas.height - 200) : player.y + (Math.random() * 1200 - 600);
    }

    function drawButtonArrow() {
        if (gameMode === 'AIM') return;
        let dx = button.x - player.x, dy = button.y - player.y;
        let angle = Math.atan2(dy, dx);
        ctx.save();
        ctx.translate(player.x, player.y - 60);
        ctx.rotate(angle);
        ctx.shadowBlur = 20; ctx.shadowColor = '#ffd700';
        ctx.fillStyle = '#ffd700';
        ctx.beginPath();
        ctx.moveTo(25, 0); ctx.lineTo(0, -12); ctx.lineTo(5, 0); ctx.lineTo(0, 12); ctx.closePath();
        ctx.fill(); ctx.fillRect(-10, -4, 12, 8);
        ctx.restore();
    }

    window.addEventListener('mousedown', e => {
        if (state === 'MENU') {
            if (e.clientY > 180 && e.clientY < 320) {
                if (e.clientY < 210) currentDifficulty = 'EASY';
                else if (e.clientY < 245) currentDifficulty = 'NORMAL';
                else if (e.clientY < 280) currentDifficulty = 'HARD';
                else if (hardcoreUnlocked && e.clientY < 315) currentDifficulty = 'HARDCORE';
            }
            if (e.clientY > 330 && e.clientY < 360) gameMode = gameMode === 'CLASSIC' ? 'AIM' : 'CLASSIC';
            if (e.clientY > 380 && e.clientY < 430) resetGame(currentDifficulty);
        } else if (state === 'PLAY' && !paused && !gameOver) {
            let dx = e.clientX - button.x, dy = (e.clientY + camY) - button.y;
            if (Math.sqrt(dx*dx + dy*dy) < button.radius + 20) collectButton();
        }
    });

    window.addEventListener('keydown', e => {
        if (state === 'MENU' && e.code === 'KeyS') { state = 'CODE'; codeInput = ""; return; }
        if (state === 'CODE') {
            if (e.key === 'Enter') { if (codeInput === 'sashaisveryawesome') hardcoreUnlocked = true; state = 'MENU'; }
            else if (e.key === 'Backspace') codeInput = codeInput.slice(0, -1);
            else if (e.key.length === 1) codeInput += e.key; return;
        }
        if (state === 'PLAY') {
            if (e.code === 'KeyP') paused = !paused;
            keys[e.code] = true;
            // Prevent R skip during active death cutscene
            if (e.code === 'KeyR' && (gameOver || won) && deathPhase >= 2) state = 'MENU';
            if (e.code === 'KeyE' && !paused && !gameOver) {
                let dx = player.x - button.x, dy = player.y - button.y;
                if (Math.sqrt(dx*dx + dy*dy) < 140) collectButton();
            }
        }
    });
    window.addEventListener('keyup', e => keys[e.code] = false);

    function gameLoop() {
        let now = Date.now(), dt = (now - lastTime) / 1000; lastTime = now;
        if (shake > 0) shake *= 0.85;
        ctx.fillStyle = '#050505'; ctx.fillRect(0, 0, canvas.width, canvas.height);
        let cfg = configs[currentDifficulty];

        if (state === 'MENU') {
            ctx.fillStyle = 'white'; ctx.textAlign = 'center'; ctx.font = '30px Courier';
            ctx.fillText("PROTOTYPE CHASE", canvas.width/2, 100);
            ctx.font = '20px Courier'; ctx.fillText("HIGHSCORE: " + sessionHighscore, canvas.width/2, 140);
            ctx.fillStyle = currentDifficulty === 'EASY' ? '#0f0' : 'gray'; ctx.fillText("[ EASY ]", canvas.width/2, 200);
            ctx.fillStyle = currentDifficulty === 'NORMAL' ? '#ff0' : 'gray'; ctx.fillText("[ NORMAL ]", canvas.width/2, 235);
            ctx.fillStyle = currentDifficulty === 'HARD' ? '#f40' : 'gray'; ctx.fillText("[ HARD ]", canvas.width/2, 270);
            if(hardcoreUnlocked) { ctx.fillStyle = currentDifficulty === 'HARDCORE' ? '#f0f' : 'gray'; ctx.fillText("[ HARDCORE ]", canvas.width/2, 305); }
            ctx.fillStyle = 'cyan'; ctx.fillText("MODE: " + gameMode, canvas.width/2, 350);
            ctx.fillStyle = 'white'; ctx.fillText("START GAME", canvas.width/2, 410);
        } else if (state === 'PLAY') {
            if (paused) {
                ctx.fillStyle = 'white'; ctx.textAlign='center'; ctx.fillText("PAUSED", canvas.width/2, canvas.height/2);
            } else if (!gameOver && !won) {
                buttonTimer -= dt; if (buttonTimer <= 0) { gameOver = true; deathReason = "TIME EXPIRED"; }
                
                icbmSpawnTimer -= dt;
                if (icbmSpawnTimer <= 0) { spawnICBM(); icbmSpawnTimer = cfg.icbmFreq; }

                activeICBMs.forEach((m, i) => {
                    if (m.phase === 'LOCK') {
                        m.timer -= dt; m.targetX = player.x; m.targetY = player.y;
                        if (m.timer <= 0) { m.phase = 'FIRE'; }
                    } else if (m.phase === 'FIRE') {
                        m.missileY += 15;
                        if (m.missileY >= m.targetY) {
                            createExplosion(m.targetX, m.targetY, '#ff4400', 80);
                            createExplosion(m.targetX, m.targetY, '#ffcc00', 40);
                            shake = 65; m.phase = 'EXPLODE';
                        }
                    } 
                    
                    // Unified ICBM Hitbox (Missile drop + Explosion)
                    let dToM = Math.sqrt((player.x - m.targetX)**2 + (player.y - m.targetY)**2);
                    if (m.phase === 'FIRE' && m.missileY > m.targetY - 100 && dToM < 60) {
                        gameOver = true; deathReason = "MISSILE IMPACT";
                    }
                    if (m.phase === 'EXPLODE') {
                        m.explosionRing += 8;
                        if (dToM < m.blastRadius) { gameOver = true; deathReason = "THERMAL BLAST"; }
                        if (m.explosionRing > m.blastRadius * 2.2) activeICBMs.splice(i, 1);
                    }
                });

                if (gameMode === 'CLASSIC') {
                    if (keys['ArrowUp'] || keys['KeyW']) player.y -= player.speed;
                    if (keys['ArrowDown'] || keys['KeyS']) player.y += player.speed;
                    if (keys['ArrowLeft'] || keys['KeyA']) player.x -= player.speed;
                    if (keys['ArrowRight'] || keys['KeyD']) player.x += player.speed;
                    handTimer++;
                    if (handTimer > cfg.handFreq - (score * 2.5)) { 
                        const side = Math.random() > 0.5 ? 'LEFT' : 'RIGHT';
                        hands.push({ side, y: player.y + (Math.random() * 600 - 300), x: side === 'LEFT' ? -600 : canvas.width + 600, timer: Math.max(10, 25 - score), active: false, height: cfg.handThickness + (score * 1.5), snap: 0 });
                        handTimer = 0; 
                    }
                    camY += (player.y - canvas.height/2 - camY) * 0.1;
                }
                
                hands.forEach((h, i) => {
                    if (h.timer > 0) h.timer--; else if (h.active || (h.timer===0 && (h.active=true))) {
                        h.x += (h.side === 'LEFT' ? cfg.handSpeed : -cfg.handSpeed);
                        if (Math.abs(h.x - player.x) < 250) h.snap = Math.min(1, h.snap + 0.15);
                        let cX = Math.max(h.x - 250, Math.min(player.x, h.x + 250)), cY = Math.max(h.y - h.height/2, Math.min(player.y, h.y + h.height/2));
                        if ((player.x-cX)**2 + (player.y-cY)**2 < 30*30) { gameOver = true; deathReason = "THE PROTOTYPE"; }
                        if (h.x < -1000 || h.x > canvas.width + 1000) hands.splice(i, 1);
                    }
                });

                if (score >= 20) won = true;

                ctx.save(); ctx.translate((Math.random()-0.5)*shake, -camY + (Math.random()-0.5)*shake);
                activeICBMs.forEach(m => {
                    if (m.phase === 'LOCK' || m.phase === 'FIRE') {
                        // Flashing Bright Orange during attack
                        let flashColor = (Math.floor(Date.now()/100)%2) ? '#ffae00' : 'red';
                        ctx.strokeStyle = m.phase === 'LOCK' ? 'rgba(255, 0, 0, 0.6)' : flashColor;
                        ctx.lineWidth = m.phase === 'FIRE' ? 6 : 2;
                        ctx.beginPath(); ctx.arc(m.targetX, m.targetY, m.blastRadius, 0, Math.PI*2); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(m.targetX-20, m.targetY); ctx.lineTo(m.targetX+20, m.targetY); ctx.stroke();
                        ctx.beginPath(); ctx.moveTo(m.targetX, m.targetY-20); ctx.lineTo(m.targetX, m.targetY+20); ctx.stroke();
                    }
                    if (m.phase === 'FIRE') {
                        ctx.fillStyle = '#444'; ctx.fillRect(m.targetX - 12, m.missileY - 80, 24, 80);
                        ctx.fillStyle = '#ffae00'; ctx.beginPath(); ctx.moveTo(m.targetX-12, m.missileY); ctx.lineTo(m.targetX+12, m.missileY); ctx.lineTo(m.targetX, m.missileY+20); ctx.closePath(); ctx.fill();
                    }
                    if (m.phase === 'EXPLODE') {
                        ctx.strokeStyle = `rgba(255, 174, 0, ${1 - m.explosionRing/(m.blastRadius*2.2)})`;
                        ctx.lineWidth = 15; ctx.beginPath(); ctx.arc(m.targetX, m.targetY, m.explosionRing, 0, Math.PI*2); ctx.stroke();
                    }
                });

                hands.forEach(h => {
                    if (h.timer > 0) {
                        ctx.fillStyle = `rgba(255, 0, 0, ${0.3 + Math.sin(now/15)*0.1})`; ctx.fillRect(0, h.y - h.height/2, canvas.width, h.height);
                        ctx.fillStyle = 'white'; ctx.save(); ctx.translate(h.side === 'LEFT' ? 60 : canvas.width - 60, h.y); if (h.side === 'RIGHT') ctx.rotate(Math.PI);
                        ctx.beginPath(); ctx.moveTo(25, 0); ctx.lineTo(-15, -20); ctx.lineTo(-15, 20); ctx.closePath(); ctx.fill(); ctx.restore();
                    }
                    if (h.active) {
                        let tX = h.side === 'LEFT' ? h.x + 250 : h.x - 250, d = h.side === 'LEFT' ? 1 : -1;
                        ctx.fillStyle = '#1a1a1a'; ctx.fillRect(h.x - 250, h.y - h.height/3, 500, h.height/1.5);
                        ctx.fillStyle = '#777'; ctx.fillRect(tX - (20*d), h.y - h.height/2, 40*d, h.height);
                        for(let f=0; f<4; f++) {
                            let fY = (h.y - h.height/2) + (f * (h.height/3.5)) + 5, ang = (f < 2 ? -0.4 : 0.4) * (1 - h.snap);
                            ctx.save(); ctx.translate(tX, fY); ctx.rotate(ang * d);
                            ctx.fillStyle = '#555'; ctx.fillRect(0, -6, 70 * d, 12);
                            ctx.fillStyle = '#999'; ctx.fillRect(70 * d, -8, 20 * d, 16); ctx.restore();
                        }
                    }
                });
                ctx.restore();

                ctx.save(); ctx.translate(0, -camY);
                ctx.fillStyle = 'red'; ctx.beginPath(); ctx.arc(button.x, button.y, 45, 0, Math.PI*2); ctx.fill();
                if (gameMode === 'CLASSIC' && Math.sqrt((player.x-button.x)**2 + (player.y-button.y)**2) < 140) {
                    ctx.fillStyle = 'white'; ctx.font = 'bold 18px Courier'; ctx.textAlign='center'; ctx.fillText("[E]", button.x, button.y - 65);
                }
                ctx.fillStyle = '#00f'; ctx.beginPath(); ctx.arc(player.x, player.y, 25, 0, Math.PI*2); ctx.fill();
                drawButtonArrow();
                ctx.restore();
                
                ctx.fillStyle = 'white'; ctx.font = 'bold 30px Courier'; ctx.textAlign = 'center';
                ctx.fillText(buttonTimer.toFixed(2) + "s", canvas.width/2, 60);
                ctx.textAlign = 'left'; ctx.font = '20px Courier'; ctx.fillText(`SCORE: ${score}/20`, 20, 40);
            } else if (gameOver) {
                deathTimer += dt; ctx.fillStyle = "red"; ctx.textAlign = "center"; ctx.font = "40px Courier";
                if (deathPhase === 0) { ctx.fillText("IT'S NOT OVER.", canvas.width/2, canvas.height/2); if (deathTimer > 2) { deathPhase = 1; deathTimer = 0; } }
                else if (deathPhase === 1) { ctx.fillText("GET UP.", canvas.width/2, canvas.height/2); if (deathTimer > 1.5) { deathPhase = 2; } }
                else { 
                    flashAlpha = Math.min(1, flashAlpha + 0.05); 
                    if (flashAlpha >= 1) { flashAlpha = 0; state = 'MENU'; } 
                }
                // Debug death reason in corner
                ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.font = "12px Courier"; ctx.textAlign = "left";
                ctx.fillText("DEBUG: killed_by_" + deathReason.toLowerCase().replace(" ", "_"), 10, canvas.height - 10);
            } else if (won) {
                cutsceneTimer += dt; ctx.fillStyle = "#222"; ctx.fillRect(canvas.width/2 - 200, 100, 400, 300);
                ctx.fillStyle = "#f0f"; ctx.fillRect(canvas.width/2 - 50, 400 - (cutsceneTimer*50), 100, 100);
                ctx.fillStyle = "white"; ctx.font = "20px Courier"; ctx.textAlign = "center";
                ctx.fillText("HE WILL MAKE ME PART OF HIM!", canvas.width/2, canvas.height - 100);
                if (cutsceneTimer > 5) state = 'MENU';
            }
        }

        particles.forEach((p, i) => {
            p.x += p.vx; p.y += p.vy; p.life -= 0.02;
            ctx.fillStyle = p.color; ctx.globalAlpha = p.life;
            ctx.fillRect(p.x, p.y, 6, 6);
            if(p.life <= 0) particles.splice(i, 1);
        });
        ctx.globalAlpha = 1.0;

        if (flashAlpha > 0) { ctx.fillStyle = `rgba(255,255,255,${flashAlpha})`; ctx.fillRect(0,0,canvas.width,canvas.height); }
        requestAnimationFrame(gameLoop);
    }
    gameLoop();
})();










(function() { if (!document.getElementById('dec-nav')) { const nav = document.createElement('a'); nav.id = 'dec-nav'; nav.href = '../index.html'; nav.innerText = '← Dec Games'; nav.style.cssText = 'position:fixed; top:15px; left:15px; z-index:9999; padding:10px 15px; background:rgba(0,0,0,0.8); color:white; text-decoration:none; border-radius:8px; font-family:sans-serif; font-weight:bold; border:1px solid rgba(255,255,255,0.2); pointer-events: auto;'; document.body.appendChild(nav); } })();
