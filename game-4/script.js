/* --- GAME CONFIG --- */
// NAME: Pong
// EMOJI: 🕹️
/* ------------------- */

/* Paste your actual game code BELOW this line! */
(function() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 800; canvas.height = 550; 
    canvas.style = "position:fixed; top:50%; left:50%; transform:translate(-50%,-50%); z-index:9999; background:#0a0a0a; border:4px solid #333; border-radius:10px; font-family:monospace;";
    document.body.appendChild(canvas);
    
    let gameState = 'MENU', ball = null, trail = [], particles = [], keys = {}, barWidth = 400;
    let p1 = { name: "Player 1", y: 225, h: 100, w: 12, score: 0, color: '#3498db' };
    let p2 = { name: "CPU", y: 225, h: 100, w: 12, score: 0, color: '#9b59b6' };

    function createHit(x, y, color) {
        for(let i=0; i<10; i++) {
            particles.push({ x, y, vx: (Math.random()-0.5)*10, vy: (Math.random()-0.5)*10, life: 1.0, color });
        }
    }

    canvas.onclick = (e) => {
        const r = canvas.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
        if (gameState === 'MENU') {
            if (mx > 320 && mx < 480 && my > 250 && my < 300) {
                gameState = 'PLAYING';
                ball = { x: 400, y: 250, vx: 5, vy: 4, r: 8 };
            }
            if (mx > 320 && mx < 480 && my > 320 && my < 360) {
                let n = prompt("Enter Name:"); if(n) p1.name = n;
            }
        } else if (gameState === 'VICTORY') {
            p1.score = 0; p2.score = 0; barWidth = 400; gameState = 'MENU';
        }
    };

    function update() {
        window.onkeydown = e => keys[e.key.toLowerCase()] = true;
        window.onkeyup = e => keys[e.key.toLowerCase()] = false;

        if (gameState === 'PLAYING' && ball) {
            if (keys['w'] || keys['arrowup']) p1.y -= 9;
            if (keys['s'] || keys['arrowdown']) p1.y += 9;
            p1.y = Math.max(0, Math.min(450, p1.y));
            p2.y += (ball.y - (p2.y + 50)) * 0.08;
            p2.y = Math.max(0, Math.min(450, p2.y));

            ball.x += ball.vx; ball.y += ball.vy;
            trail.push({x: ball.x, y: ball.y}); if (trail.length > 12) trail.shift();
            
            if (ball.y <= 0 || ball.y >= 542) { 
                ball.vy *= -1; ball.y = Math.max(0, Math.min(542, ball.y));
                createHit(ball.x, ball.y, 'white');
            }

            let pad = (ball.vx < 0) ? p1 : p2;
            let px = (ball.vx < 0) ? 20 : 768;
            if (ball.x > px && ball.x < px + 12 && ball.y > pad.y && ball.y < pad.y + 100) {
                ball.vx *= -1.06; ball.vy = ((ball.y - (pad.y + 50)) / 50) * 8;
                ball.x = (ball.vx < 0) ? px - 1 : px + 13;
                createHit(ball.x, ball.y, pad.color);
            }

            if (ball.x < 0 || ball.x > 800) {
                ball.vx > 0 ? p1.score++ : p2.score++;
                if (p1.score >= 15 || p2.score >= 15) { gameState = 'VICTORY'; ball = null; } 
                else { ball = { x: 400, y: 250, vx: 5, vy: 4, r: 8 }; }
            }
            let total = p1.score + p2.score;
            let targetW = total === 0 ? 400 : (p1.score / total) * 800;
            barWidth += (targetW - barWidth) * 0.05;
        }

        particles.forEach((p, i) => { p.x += p.vx; p.y += p.vy; p.life -= 0.02; if (p.life <= 0) particles.splice(i, 1); });
        draw();
        requestAnimationFrame(update);
    }

    function draw() {
        ctx.fillStyle = "#0a0a0a"; ctx.fillRect(0, 0, 800, 550);
        
        if (gameState === 'MENU') {
            ctx.fillStyle = "white"; ctx.font = "bold 95px sans-serif"; ctx.textAlign = "center";
            ctx.fillText("PONG", 400, 180); 
            ctx.textAlign = "left";
            ctx.fillStyle = "#3498db"; ctx.fillRect(320, 250, 160, 50);
            ctx.fillStyle = "#9b59b6"; ctx.fillRect(320, 320, 160, 40);
            ctx.fillStyle = "white"; ctx.font = "20px monospace"; 
            ctx.fillText("PLAY", 375, 282); ctx.fillText("NAME", 375, 347);
        } else if (gameState === 'PLAYING') {
            trail.forEach((t, i) => { ctx.globalAlpha = i/12; ctx.fillStyle = "#333"; ctx.fillRect(t.x-4, t.y-4, 8, 8); });
            ctx.globalAlpha = 1;
            particles.forEach(p => { ctx.globalAlpha = p.life; ctx.fillStyle = p.color; ctx.fillRect(p.x, p.y, 4, 4); });
            ctx.globalAlpha = 1;
            ctx.fillStyle = p1.color; ctx.fillRect(20, p1.y, 12, 100);
            ctx.fillStyle = p2.color; ctx.fillRect(768, p2.y, 12, 100);
            ctx.fillStyle = "white"; ctx.beginPath(); ctx.arc(ball.x, ball.y, 8, 0, 7); ctx.fill();
            
            ctx.font = "14px monospace"; ctx.fillStyle = p1.color; ctx.fillText(p1.name, 20, 30);
            ctx.fillStyle = p2.color; ctx.textAlign = "right"; ctx.fillText(p2.name, 780, 30);
            ctx.textAlign = "center"; ctx.font = "40px monospace"; ctx.fillStyle = "white"; ctx.fillText(p1.score, 320, 60); ctx.fillText(p2.score, 450, 60);
            
            ctx.fillStyle = p2.color; ctx.fillRect(0, 530, 800, 20);
            ctx.fillStyle = p1.color; ctx.fillRect(0, 530, barWidth, 20);
        } else if (gameState === 'VICTORY') {
            ctx.textAlign = "center"; ctx.fillStyle = "white"; ctx.font = "bold 50px monospace";
            let winner = p1.score >= 15 ? p1.name : p2.name;
            ctx.fillText(winner + " WINS!", 400, 250);
            ctx.font = "20px monospace"; ctx.fillText("Click to reset", 400, 300);
        }
    }
    update();
})();



(function() { if (!document.getElementById('dec-nav')) { const nav = document.createElement('a'); nav.id = 'dec-nav'; nav.href = '../index.html'; nav.innerText = '← Dec Games'; nav.style.cssText = 'position:fixed; top:15px; left:15px; z-index:9999; padding:10px 15px; background:rgba(0,0,0,0.8); color:white; text-decoration:none; border-radius:8px; font-family:sans-serif; font-weight:bold; border:1px solid rgba(255,255,255,0.2); pointer-events: auto;'; document.body.appendChild(nav); } })();
