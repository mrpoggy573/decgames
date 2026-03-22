/* --- GAME CONFIG --- */
// NAME: Guess Who
// EMOJI: 🔍
/* ------------------- */

const suspects = [
    { name: "Alex", hair: "brown", eyes: "blue", job: "doctor", vibe: "professional", accessory: "glasses", gender: "male", color: "#3498db" },
    { name: "Bella", hair: "blonde", eyes: "green", job: "artist", vibe: "chill", accessory: "hat", gender: "female", color: "#e67e22" },
    { name: "Casper", hair: "black", eyes: "brown", job: "chef", vibe: "angry", accessory: "beard", gender: "male", color: "#2ecc71" },
    { name: "Dani", hair: "red", eyes: "blue", job: "pilot", vibe: "brave", accessory: "earrings", gender: "female", color: "#e74c3c" },
    { name: "Elias", hair: "silver", eyes: "grey", job: "writer", vibe: "mysterious", accessory: "scarf", gender: "male", color: "#9b59b6" },
    { name: "Fiona", hair: "white", eyes: "hazel", job: "coder", vibe: "tired", accessory: "headphones", gender: "female", color: "#1abc9c" },
    { name: "Gabe", hair: "bald", eyes: "brown", job: "coach", vibe: "loud", accessory: "whistle", gender: "male", color: "#f1c40f" },
    { name: "Holly", hair: "pink", eyes: "blue", job: "influencer", vibe: "bubbly", accessory: "phone", gender: "female", color: "#fd79a8" },
    { name: "Ivan", hair: "brown", eyes: "brown", job: "spy", vibe: "mysterious", accessory: "briefcase", gender: "male", color: "#2d3436" },
    { name: "Jade", hair: "purple", eyes: "green", job: "gamer", vibe: "focused", accessory: "headset", gender: "female", color: "#a29bfe" },
    { name: "Kai", hair: "black", eyes: "blue", job: "surfer", vibe: "chill", accessory: "necklace", gender: "male", color: "#00cec9" },
    { name: "Luna", hair: "white", eyes: "silver", job: "astronomer", vibe: "dreamy", accessory: "telescope", gender: "female", color: "#dfe6e9" },
    { name: "Milo", hair: "orange", eyes: "green", job: "gardener", vibe: "happy", accessory: "plants", gender: "male", color: "#55efc4" },
    { name: "Nora", hair: "black", eyes: "grey", job: "detective", vibe: "serious", accessory: "magnifier", gender: "female", color: "#636e72" },
    { name: "Otis", hair: "brown", eyes: "blue", job: "baker", vibe: "sweet", accessory: "apron", gender: "male", color: "#fab1a0" }
];

let secretPerson = suspects[Math.floor(Math.random() * suspects.length)];
let traits = ["hair", "eyes", "job", "vibe", "accessory", "gender"];

const style = document.createElement('style');
style.textContent = `
    body { font-family: 'Inter', sans-serif; background: #0b0e14; color: #fff; display: flex; flex-direction: column; align-items: center; padding: 20px; margin: 0; }
    #board { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; max-width: 900px; margin: 20px 0; perspective: 1000px; }
    .card { background: #1c2533; border-radius: 12px; padding: 15px; text-align: center; transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; }
    .card.eliminated { transform: rotateX(-180deg); opacity: 0.1; pointer-events: none; filter: grayscale(1); }
    .avatar { width: 50px; height: 50px; border-radius: 50%; margin: 0 auto 10px; display: flex; align-items: center; justify-content: center; font-weight: bold; border: 2px solid transparent; font-size: 1.2rem; }
    .controls { background: #1c2533; padding: 20px; border-radius: 15px; width: 100%; max-width: 700px; display: flex; gap: 10px; flex-wrap: wrap; justify-content: center; }
    input, select, button { padding: 10px 15px; border-radius: 8px; border: 1px solid #2d3748; background: #0b0e14; color: white; }
    button { background: #4a90e2; border: none; font-weight: bold; cursor: pointer; }
    button:hover { background: #357abd; }
    #status { font-size: 1.1rem; color: #4ade80; margin-bottom: 10px; font-weight: bold; height: 24px; }
    .title { font-size: 2rem; margin: 10px; color: #fff; text-transform: uppercase; letter-spacing: 2px; }
`;
document.head.appendChild(style);

document.body.innerHTML = `
    <div class="title">Guess Who</div>
    <div id="status">Analyze the field to find the target.</div>
    <div id="board"></div>
    <div class="controls">
        <select id="t-sel"></select>
        <input type="text" id="t-val" placeholder="Value (e.g. blue, chef, chill)">
        <button id="ask-btn">Analyze</button>
        <button onclick="location.reload()">Reset Game</button>
    </div>
`;

const board = document.getElementById('board');
const tSel = document.getElementById('t-sel');

traits.forEach(t => {
    let opt = document.createElement('option');
    opt.value = t;
    opt.textContent = t.toUpperCase();
    tSel.appendChild(opt);
});

function drawBoard() {
    board.innerHTML = '';
    suspects.forEach(s => {
        let card = document.createElement('div');
        card.className = 'card';
        card.id = `sus-${s.name}`;
        card.innerHTML = `
            <div class="avatar" style="border-color: ${s.color}; color: ${s.color}">${s.name[0]}</div>
            <div style="font-weight: bold;">${s.name}</div>
            <div style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">${s.job}</div>
        `;
        board.appendChild(card);
    });
}

document.getElementById('ask-btn').onclick = () => {
    const trait = tSel.value;
    const value = document.getElementById('t-val').value.toLowerCase().trim();
    if (!value) return;
    const hit = secretPerson[trait].toLowerCase() === value;
    document.getElementById('status').innerText = `IS ${trait.toUpperCase()} ${value.toUpperCase()}? ${hit ? "YES" : "NO"}`;
    suspects.forEach(p => {
        const card = document.getElementById(`sus-${p.name}`);
        const pMatch = p[trait].toLowerCase() === value;
        if (pMatch !== hit) card.classList.add('eliminated');
    });
    document.getElementById('t-val').value = "";
};

drawBoard();

// DEC GAMES NAV BUTTON
(function() { if (!document.getElementById('dec-nav')) { const nav = document.createElement('a'); nav.id = 'dec-nav'; nav.href = '../index.html'; nav.innerText = '← Dec Games'; nav.style.cssText = 'position:fixed; top:15px; left:15px; z-index:99999; padding:10px 15px; background:rgba(0,0,0,0.8); color:white; text-decoration:none; border-radius:8px; font-family:sans-serif; font-weight:bold; border:1px solid rgba(255,255,255,0.2); pointer-events: auto;'; document.body.appendChild(nav); } })();
