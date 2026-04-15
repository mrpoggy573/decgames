/* --- GAME CONFIG --- */
// NAME: New Game 6
// EMOJI: 🕹️
/* ------------------- */

/* Paste your actual game code BELOW this line! */

(function() {
    const wordPool = ["the", "be", "to", "of", "and", "a", "in", "that", "have", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at", "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what", "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take", "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also", "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"];
    
    document.body.innerHTML = '';
    const bgColor = '#2c2c2c'; 
    document.body.style.cssText = `background:${bgColor}; color:#eee; font-family:monospace; padding:50px; display:flex; flex-direction:column; align-items:center; height:100vh; overflow:hidden; margin:0;`;

    const header = document.createElement('div');
    header.style.cssText = 'margin-bottom:20px; font-size:20px; display:flex; gap:30px; background:#1e1e1e; padding:15px; border-radius:8px; border:1px solid #444; z-index:10;';
    header.innerHTML = `<div>Time: <span id="timer">07:00</span></div><div>WPM: <span id="wpm">0</span></div><div>Errors: <span id="errors">0</span></div>`;
    document.body.appendChild(header);

    const wrapper = document.createElement('div');
    wrapper.style.cssText = 'position:relative; width:950px; height:400px; overflow:hidden;';
    
    const textBox = document.createElement('div');
    textBox.style.cssText = 'display:flex; flex-wrap:wrap; gap:15px; font-size:32px; transition: transform 0.2s ease; padding-top: 50px; padding-bottom:300px; position:relative;';
    
    const mask = document.createElement('div');
    mask.style.cssText = `position:absolute; bottom:0; left:0; width:100%; height:140px; background: linear-gradient(to top, ${bgColor} 40%, transparent 100%); pointer-events:none; z-index:5;`;
    
    wrapper.appendChild(textBox);
    wrapper.appendChild(mask);
    document.body.appendChild(wrapper);

    const hiddenInput = document.createElement('input');
    hiddenInput.style.cssText = 'position:fixed; opacity:0; top:0;';
    document.body.appendChild(hiddenInput);
    hiddenInput.focus();

    const testWords = Array.from({length: 500}, () => wordPool[Math.floor(Math.random() * wordPool.length)]);
    textBox.innerHTML = testWords.map((word, wIdx) => `<div id="word-${wIdx}" style="display:inline-block; color:#ffffff; white-space: pre; position:relative;">${word}</div>`).join('');

    let wordIdx = 0, correctCount = 0, totalErrors = 0, startTime = null, timeLeft = 420;
    let errorMap = new Set(); 

    const renderWord = () => {
        const wordEl = document.getElementById(`word-${wordIdx}`);
        const typed = hiddenInput.value;
        const target = testWords[wordIdx];
        
        let html = '';
        const currentPos = typed.length;
        // Don't expand the word length unless the user types beyond it
        const maxLength = Math.max(target.length, currentPos);

        for (let i = 0; i < maxLength; i++) {
            const tChar = target[i] || ""; 
            const pChar = typed[i] || "";  
            const charId = `w${wordIdx}c${i}`;
            
            let charColor = '#ffffff';
            // Only show cursor if it's the current position
            let cursorClass = (i === currentPos) ? 'border-left: 3px solid #3498db; margin-left: -3px;' : '';

            if (pChar) {
                if (pChar === tChar) {
                    charColor = errorMap.has(charId) ? '#ffa500' : '#4ade80';
                } else {
                    if (!errorMap.has(charId)) { totalErrors++; errorMap.add(charId); }
                    charColor = '#f87171';
                }
            }
            
            // If we are at the end of the word string and typing further, we need to show those extra chars
            const displayChar = pChar || tChar || " ";
            html += `<span style="color:${charColor}; ${cursorClass}">${displayChar}</span>`;
        }
        
        // Handle the cursor when it's exactly at the end of what's been rendered
        if (currentPos >= maxLength) {
             html += `<span style="border-left: 3px solid #3498db; margin-left: -3px;">&nbsp;</span>`;
        }

        wordEl.innerHTML = html;

        if (wordEl.offsetTop > 150) {
            textBox.style.transform = `translateY(-${wordEl.offsetTop - 100}px)`;
        }
    };

    const startTimer = () => {
        const t = setInterval(() => {
            if (--timeLeft <= 0) { clearInterval(t); hiddenInput.disabled = true; alert("Time up!"); }
            const m = Math.floor(timeLeft / 60), s = timeLeft % 60;
            document.getElementById('timer').innerText = `${m}:${s < 10 ? '0' : ''}${s}`;
        }, 1000);
    };

    window.addEventListener('keydown', () => hiddenInput.focus());
    
    hiddenInput.addEventListener('input', () => {
        if (!startTime) { startTime = Date.now(); startTimer(); }
        
        const val = hiddenInput.value;
        
        if (val.endsWith(' ')) {
            const wordEl = document.getElementById(`word-${wordIdx}`);
            if (val.trim() === testWords[wordIdx]) correctCount++;
            wordEl.style.opacity = '0.2';
            wordEl.innerHTML = testWords[wordIdx]; 
            wordIdx++;
            hiddenInput.value = '';
            renderWord();
        } else {
            renderWord();
        }

        const mins = (Date.now() - startTime) / 60000;
        document.getElementById('wpm').innerText = Math.round(correctCount / mins) || 0;
        document.getElementById('errors').innerText = totalErrors;
    });

    renderWord();
})();




(function() { if (!document.getElementById('dec-nav')) { const nav = document.createElement('a'); nav.id = 'dec-nav'; nav.href = '../index.html'; nav.innerText = '← Dec Games'; nav.style.cssText = 'position:fixed; top:15px; left:15px; z-index:9999; padding:10px 15px; background:rgba(0,0,0,0.8); color:white; text-decoration:none; border-radius:8px; font-family:sans-serif; font-weight:bold; border:1px solid rgba(255,255,255,0.2); pointer-events: auto;'; document.body.appendChild(nav); } })();
