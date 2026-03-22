(function() {
    document.body.style.margin = 0;

    document.body.innerHTML = `
    <div style="display:flex;height:100vh;background:#1a1a1a;color:#eee;font-family:sans-serif;">
        <div style="width:220px;background:#222;padding:12px;display:flex;flex-direction:column;gap:10px;">
            <b>Tools</b>
            <input id="color" type="color" value="#00ffcc">
            <select id="tool">
                <option value="brush">Brush</option>
                <option value="eraser">Eraser</option>
                <option value="fill">Fill</option>
                <option value="spray">Spray</option>
            </select>
            <select id="size">
                <option>1</option><option>2</option><option>4</option><option>8</option>
            </select>
            <button id="undo">Undo</button>
            <button id="redo">Redo</button>
            <b>Zoom</b>
            <input id="zoomSlider" type="range" min="5" max="80" value="20">
            <b>Grid Size</b>
            <input id="gridSize" type="range" min="8" max="128" value="16">
            <b>Export</b>
            <button id="png">PNG</button>
            <button id="jpg">JPG</button>
            <button id="webp">WEBP</button>
            <b>Debug</b>
            <button id="dump">Dump Canvas Data</button>
        </div>
        <div style="flex:1;display:flex;flex-direction:column;">
            <div style="background:#333;padding:6px;text-align:center;">Pixel Editor</div>
            <div id="wrap" style="flex:1;overflow:auto;display:flex;justify-content:center;align-items:center;">
                <canvas id="c"></canvas>
            </div>
        </div>
    </div>
    `;

    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    canvas.style.imageRendering = "pixelated";

    let size = 16;
    let zoom = 20;
    let pixels = [];
    let history = [];
    let redoStack = [];

    function initGrid(newSize, preserve=true, initialArt=false) {
        const old = pixels;
        pixels = [];
        for (let y = 0; y < newSize; y++) {
            pixels[y] = [];
            for (let x = 0; x < newSize; x++) {
                if (initialArt) {
                    pixels[y][x] = "#ffff66"; 
                } else {
                    pixels[y][x] = preserve && old[y] && old[y][x] ? old[y][x] : "#ffff66";
                }
            }
        }

        if (initialArt) {
            const watermelon = [
                "0000000000",
                "0222222220",
                "0233333320",
                "0244444420",
                "0244444420",
                "0244444420",
                "0233333320",
                "0222222220",
                "0000000000"
            ];
            const startX = Math.floor((newSize - watermelon[0].length) / 2);
            const startY = Math.floor((newSize - watermelon.length) / 2);
            const colors = {
                "0": "#ffff66",
                "2": "#00aa00",
                "3": "#ff4444",
                "4": "#000000"
            };
            watermelon.forEach((row, j) => {
                row.split("").forEach((c, i) => {
                    const px = startX + i, py = startY + j;
                    if (pixels[py] && pixels[py][px] !== undefined)
                        pixels[py][px] = colors[c];
                });
            });
        }

        size = newSize;
        resizeCanvas();
        draw();
        pushHistory();
    }

    function pushHistory() {
        const state = { size, pixels: JSON.parse(JSON.stringify(pixels)) };
        history.push(state);
        if (history.length > 100) history.shift();
        redoStack = [];
    }

    function undo() {
        if (history.length < 2) return;
        redoStack.push(history.pop());
        const prev = history[history.length - 1];
        size = prev.size;
        pixels = JSON.parse(JSON.stringify(prev.pixels));
        resizeCanvas();
        draw();
    }

    function redo() {
        if (!redoStack.length) return;
        const next = redoStack.pop();
        history.push(next);
        size = next.size;
        pixels = JSON.parse(JSON.stringify(next.pixels));
        resizeCanvas();
        draw();
    }

    function resizeCanvas() {
        canvas.width = size;
        canvas.height = size;
        updateZoom();
    }

    function updateZoom() {
        canvas.style.width = (size * zoom) + "px";
        canvas.style.height = (size * zoom) + "px";
    }

    function draw() {
        for (let y = 0; y < size; y++) {
            if (!pixels[y]) continue;
            for (let x = 0; x < size; x++) {
                if (pixels[y][x] === undefined) continue;
                ctx.fillStyle = pixels[y][x];
                ctx.fillRect(x, y, 1, 1);
            }
        }
    }

    function clamp(x, min, max) { return Math.max(min, Math.min(max, x)); }

    function getPos(e) {
        const rect = canvas.getBoundingClientRect();
        let x = Math.floor((e.clientX - rect.left) / zoom);
        let y = Math.floor((e.clientY - rect.top) / zoom);
        x = clamp(x, 0, size - 1);
        y = clamp(y, 0, size - 1);
        return { x, y };
    }

    function paint(x, y, color, sizeB) {
        for (let dy = 0; dy < sizeB; dy++) {
            for (let dx = 0; dx < sizeB; dx++) {
                if (pixels[y + dy] && pixels[y + dy][x + dx] !== undefined)
                    pixels[y + dy][x + dx] = color;
            }
        }
    }

    function fill(x, y, target, color) {
        if (target === color) return;
        const stack = [[x, y]];
        while (stack.length) {
            const [cx, cy] = stack.pop();
            if (!pixels[cy] || pixels[cy][cx] !== target) continue;
            pixels[cy][cx] = color;
            stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
        }
    }

    function spray(x, y, color) {
        for (let i = 0; i < 10; i++) {
            const rx = x + Math.floor(Math.random() * 3) - 1;
            const ry = y + Math.floor(Math.random() * 3) - 1;
            if (pixels[ry] && pixels[ry][rx] !== undefined)
                pixels[ry][rx] = color;
        }
    }

    let drawing = false;

    function act(e) {
        const { x, y } = getPos(e);
        const tool = document.getElementById("tool").value;
        const color = document.getElementById("color").value;
        const sizeB = parseInt(document.getElementById("size").value);

        if (!pixels[y] || pixels[y][x] === undefined) return;

        if (tool === "brush") paint(x, y, color, sizeB);
        if (tool === "eraser") paint(x, y, "#ffff66", sizeB);
        if (tool === "fill") fill(x, y, pixels[y][x], color);
        if (tool === "spray") spray(x, y, color);

        draw();
    }

    canvas.onmousedown = e => { drawing = true; act(e); };
    canvas.onmousemove = e => { if (drawing) act(e); };
    window.onmouseup = () => { if (drawing) pushHistory(); drawing = false; };

    canvas.ontouchstart = e => { drawing = true; act(e.touches[0]); };
    canvas.ontouchmove = e => { act(e.touches[0]); };
    window.ontouchend = () => { if (drawing) pushHistory(); drawing = false; };

    document.getElementById("zoomSlider").oninput = e => {
        zoom = parseInt(e.target.value);
        updateZoom();
    };

    document.getElementById("undo").onclick = undo;
    document.getElementById("redo").onclick = redo;

    document.getElementById("gridSize").oninput = e => {
        initGrid(parseInt(e.target.value), true);
    };

    function exportImg(type) {
        const out = document.createElement("canvas");
        out.width = size;
        out.height = size;
        const octx = out.getContext("2d");
        octx.imageSmoothingEnabled = false;

        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                octx.fillStyle = pixels[y][x];
                octx.fillRect(x, y, 1, 1);
            }
        }

        const a = document.createElement("a");
        a.href = out.toDataURL("image/" + type);
        a.download = "pixel-art." + type;
        a.click();
    }

    document.getElementById("png").onclick = () => exportImg("png");
    document.getElementById("jpg").onclick = () => exportImg("jpeg");
    document.getElementById("webp").onclick = () => exportImg("webp");

    // 🔹 DUMP canvas command
    document.getElementById("dump").onclick = () => {
        const data = [];
        for (let y = 0; y < size; y++) {
            for (let x = 0; x < size; x++) {
                data.push({ x, y, color: pixels[y][x] });
            }
        }
        console.log(JSON.stringify(data, null, 2));
        alert("Canvas data printed to console!");
    };

    initGrid(size, false, true); // initial watermelon slice
})();

(function() { if (!document.getElementById('dec-nav')) { const nav = document.createElement('a'); nav.id = 'dec-nav'; nav.href = '../index.html'; nav.innerText = '← Dec Games'; nav.style.cssText = 'position:fixed; top:15px; left:15px; z-index:9999; padding:10px 15px; background:rgba(0,0,0,0.8); color:white; text-decoration:none; border-radius:8px; font-family:sans-serif; font-weight:bold; border:1px solid rgba(255,255,255,0.2); pointer-events: auto;'; document.body.appendChild(nav); } })();
