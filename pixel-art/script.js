(function() {
    const html = `
    <div id="app" style="font-family:sans-serif; padding:20px; background:#1a1a1a; color:#eee; min-height:100vh; display:flex; flex-direction:column; align-items:center; overflow:hidden;">
        <div id="controls" style="background:#2d2d2d; padding:20px; border-radius:12px; display:flex; gap:15px; flex-wrap:wrap; justify-content:center; box-shadow: 0 4px 15px rgba(0,0,0,0.5); z-index:10;">
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label>Project Name</label>
                <input type="text" id="projName" value="MyMasterpiece" style="padding:5px; border-radius:4px; border:none;">
            </div>
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label>Grid Scale (Tiles)</label>
                <input type="range" id="gridTiles" min="8" max="100" value="16">
                <span id="tilesVal" style="text-align:center">16 x 16</span>
            </div>
            <div style="display:flex; flex-direction:column; gap:5px; align-items:center;">
                <label>Show Grid</label>
                <input type="checkbox" id="toggleGrid" checked style="width:20px; height:20px;">
            </div>
            <div style="display:flex; flex-direction:column; gap:5px;">
                <label>Color</label>
                <input type="color" id="colorPicker" value="#00ffcc" style="height:30px; border:none; background:none; cursor:pointer;">
            </div>
            <div style="display:flex; align-items:flex-end; gap:10px;">
                <button id="save" style="background:#27ae60; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Save JSON</button>
                <input type="file" id="load" style="display:none;">
                <button onclick="document.getElementById('load').click()" style="background:#2980b9; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Load JSON</button>
                <button id="clear" style="background:#c0392b; color:white; border:none; padding:8px 15px; border-radius:4px; cursor:pointer;">Reset</button>
            </div>
            <div style="font-size:12px; color:#888; align-self:center; margin-left:10px;">
                Zoom: Scroll or Up/Down Arrows
            </div>
        </div>
        <div id="viewport" style="flex:1; width:100%; display:flex; justify-content:center; align-items:center; overflow:auto; padding:50px;">
            <div id="canvas-container" style="background:#fff; line-height:0; cursor:crosshair; user-select:none; display:grid; box-shadow: 0 0 20px rgba(0,0,0,0.5);"></div>
        </div>
    </div>`;

    document.body.innerHTML = html;
    document.body.style.margin = "0";

    const container = document.getElementById('canvas-container');
    const colorPicker = document.getElementById('colorPicker');
    const gridTilesInput = document.getElementById('gridTiles');
    const tilesVal = document.getElementById('tilesVal');
    const projName = document.getElementById('projName');
    const toggleGrid = document.getElementById('toggleGrid');
    
    let isDrawing = false;
    let zoomLevel = 25; 

    function buildGrid() {
        const size = parseInt(gridTilesInput.value);
        tilesVal.innerText = `${size} x ${size}`;
        container.innerHTML = '';
        
        container.style.gridTemplateColumns = `repeat(${size}, ${zoomLevel}px)`;
        container.style.gridTemplateRows = `repeat(${size}, ${zoomLevel}px)`;

        for (let i = 0; i < size * size; i++) {
            const pixel = document.createElement('div');
            pixel.className = 'pixel';
            pixel.style.boxSizing = 'border-box';
            pixel.style.backgroundColor = 'transparent';
            pixel.style.width = `${zoomLevel}px`;
            pixel.style.height = `${zoomLevel}px`;
            
            const paint = () => { if (isDrawing) pixel.style.backgroundColor = colorPicker.value; };
            pixel.onmousedown = (e) => { e.preventDefault(); isDrawing = true; paint(); };
            pixel.onmouseenter = paint;
            container.appendChild(pixel);
        }
        applyBorders();
    }

    function updateVisualZoom() {
        const size = parseInt(gridTilesInput.value);
        container.style.gridTemplateColumns = `repeat(${size}, ${zoomLevel}px)`;
        container.style.gridTemplateRows = `repeat(${size}, ${zoomLevel}px)`;
        const pixels = container.querySelectorAll('.pixel');
        pixels.forEach(p => {
            p.style.width = `${zoomLevel}px`;
            p.style.height = `${zoomLevel}px`;
        });
    }

    function applyBorders() {
        const pixels = container.querySelectorAll('.pixel');
        pixels.forEach(p => p.style.border = toggleGrid.checked ? '1px solid rgba(0,0,0,0.05)' : 'none');
    }

    function handleZoom(delta) {
        zoomLevel = Math.max(2, Math.min(100, zoomLevel + delta));
        updateVisualZoom();
    }

    window.addEventListener('wheel', (e) => {
        if (!e.ctrlKey) {
            e.preventDefault();
            handleZoom(e.deltaY > 0 ? -2 : 2);
        }
    }, { passive: false });

    window.addEventListener('keydown', (e) => {
        if (e.key === "ArrowUp") { e.preventDefault(); handleZoom(2); }
        if (e.key === "ArrowDown") { e.preventDefault(); handleZoom(-2); }
    });

    toggleGrid.onchange = applyBorders;
    window.onmouseup = () => isDrawing = false;
    gridTilesInput.oninput = buildGrid;
    document.getElementById('clear').onclick = buildGrid;

    document.getElementById('save').onclick = () => {
        const colors = Array.from(container.children).map(p => p.style.backgroundColor);
        const data = JSON.stringify({ name: projName.value, size: gridTilesInput.value, colors });
        const blob = new Blob([data], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob); 
        a.download = `${projName.value || 'art'}.json`; 
        a.click();
    };

    document.getElementById('load').onchange = (e) => {
        const reader = new FileReader();
        reader.onload = (event) => {
            const data = JSON.parse(event.target.result);
            projName.value = data.name || "LoadedArt";
            gridTilesInput.value = data.size;
            buildGrid();
            const pixels = container.children;
            data.colors.forEach((color, i) => { if(pixels[i]) pixels[i].style.backgroundColor = color; });
        };
        reader.readAsText(e.target.files);
    };

    buildGrid();
})();

(function() { if (!document.getElementById('dec-nav')) { const nav = document.createElement('a'); nav.id = 'dec-nav'; nav.href = '../index.html'; nav.innerText = '← Dec Games'; nav.style.cssText = 'position:fixed; top:15px; left:15px; z-index:9999; padding:10px 15px; background:rgba(0,0,0,0.8); color:white; text-decoration:none; border-radius:8px; font-family:sans-serif; font-weight:bold; border:1px solid rgba(255,255,255,0.2); pointer-events: auto;'; document.body.appendChild(nav); } })();
