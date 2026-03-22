/* --- GAME CONFIG --- */
// NAME: Immortal Snail Simulator
// EMOJI: 🕹️
/* ------------------- */

/* Paste your actual game code BELOW this line! */

(function() {
    // 1. Setup the World and Player
    const world = document.createElement('div');
    world.style = "position:fixed; top:0; left:0; width:20000px; height:20000px; background:#2d5a27; z-index:9998; background-image: radial-gradient(#3a6b33 1px, transparent 1px); background-size: 80px 80px; transition: opacity 0.5s;";
    document.body.appendChild(world);

    const player = document.createElement('div');
    player.innerText = '🧙';
    player.style = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); font-size:40px; z-index:10000; display: none;";
    document.body.appendChild(player);

    const snail = document.createElement('div');
    snail.innerText = '🐌';
    snail.style = "position:fixed; font-size:30px; z-index:9999; filter: drop-shadow(2px 2px 2px black); display: none;";
    document.body.appendChild(snail);

    // 2. Game State Variables
    let pWorldX, pWorldY, sWorldX, sWorldY, alive, gameRunning;
    const keys = {};
    const pSpeed = 4.5; // Slightly slower (was 6)
    const sSpeed = 1.3; // Slightly slower (was 1.8)

    window.onkeydown = (e) => keys[e.key.toLowerCase()] = true;
    window.onkeyup = (e) => keys[e.key.toLowerCase()] = false;

    // 3. UI Elements (Countdown & Game Over)
    const overlay = document.createElement('div');
    overlay.style = "position:fixed; top:50%; left:50%; transform:translate(-50%, -50%); z-index:10001; text-align:center; font-family:sans-serif; color:white; text-shadow:2px 2px 4px rgba(0,0,0,0.5); pointer-events: none;";
    document.body.appendChild(overlay);

    function initGame() {
        pWorldX = 10000;
        pWorldY = 10000;
        sWorldX = 10300; // Start a bit further away
        sWorldY = 10300;
        alive = true;
        gameRunning = false;
        
        player.innerText = '🧙';
        player.style.display = 'block';
        snail.style.display = 'block';
        world.style.opacity = '1';
        
        startCountdown();
    }

    function startCountdown() {
        let count = 3;
        overlay.style.fontSize = '80px';
        
        const timer = setInterval(() => {
            if (count > 0) {
                overlay.innerText = count;
                count--;
            } else if (count === 0) {
                overlay.innerText = "GO!";
                count--;
            } else {
                clearInterval(timer);
                overlay.innerText = "";
                gameRunning = true;
                gameLoop();
            }
        }, 800);
    }

    function showGameOver() {
        gameRunning = false;
        overlay.style.pointerEvents = 'auto'; // Re-enable clicks
        overlay.innerHTML = `
            <div style="background:rgba(0,0,0,0.8); padding:40px; border-radius:20px; border:2px solid white;">
                <h1 style="margin:0 0 20px 0;">YOU DIED</h1>
                <p style="font-size:20px; margin-bottom:30px;">The snail claimed your soul.</p>
                <button id="playAgain" style="padding:10px 20px; font-size:18px; cursor:pointer; margin-right:10px;">Play Again</button>
                <button id="quitBtn" style="padding:10px 20px; font-size:18px; cursor:pointer;">Quit</button>
            </div>
        `;

        document.getElementById('playAgain').onclick = () => {
            overlay.innerHTML = "";
            overlay.style.pointerEvents = 'none';
            initGame();
        };

        document.getElementById('quitBtn').onclick = () => {
            location.reload();
        };
    }

    function gameLoop() {
        if (!alive || !gameRunning) return;

        // Move Player
        if (keys['w']) pWorldY -= pSpeed;
        if (keys['s']) pWorldY += pSpeed;
        if (keys['a']) pWorldX -= pSpeed;
        if (keys['d']) pWorldX += pSpeed;

        // Camera
        world.style.left = (window.innerWidth / 2 - pWorldX) + 'px';
        world.style.top = (window.innerHeight / 2 - pWorldY) + 'px';

        // Snail Intelligence
        const dx = pWorldX - sWorldX;
        const dy = pWorldY - sWorldY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            sWorldX += (dx / dist) * sSpeed;
            sWorldY += (dy / dist) * sSpeed;
        }

        // Update Snail Visuals
        snail.style.left = (sWorldX - pWorldX + window.innerWidth / 2 - 15) + 'px';
        snail.style.top = (sWorldY - pWorldY + window.innerHeight / 2 - 15) + 'px';

        // Death Check
        if (dist < 30) {
            alive = false;
            player.innerText = '💀';
            setTimeout(showGameOver, 500);
        } else {
            requestAnimationFrame(gameLoop);
        }
    }

    // Launch Game
    initGame();
})();




(function() { if (!document.getElementById('dec-nav')) { const nav = document.createElement('a'); nav.id = 'dec-nav'; nav.href = '../index.html'; nav.innerText = '← Dec Games'; nav.style.cssText = 'position:fixed; top:15px; left:15px; z-index:9999; padding:10px 15px; background:rgba(0,0,0,0.8); color:white; text-decoration:none; border-radius:8px; font-family:sans-serif; font-weight:bold; border:1px solid rgba(255,255,255,0.2); pointer-events: auto;'; document.body.appendChild(nav); } })();
