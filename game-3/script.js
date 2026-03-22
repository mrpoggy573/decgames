/* --- GAME CONFIG --- */
// NAME: Numble
// EMOJI: 1️⃣
/* ------------------- */

/* Paste your actual game code BELOW this line! */
javascript:(function() {
    // --- Global Variables and Constants ---
    const CODE_LENGTH = 5;
    const MAX_GUESSES = 10;
    let secretCode = generateSecretCode();
    let guessesRemaining = MAX_GUESSES;
    let gameOver = false;
    // Track keyboard colors: 0-9 keys initially gray
    const keyboardStatus = {};
    for (let i = 0; i <= 9; i++) {
        keyboardStatus[i] = '#3a3a3c';
    }

    // --- Setup and Styling (Uses HTML DOM manipulation) ---
    document.body.innerHTML = '';
    document.body.style.backgroundColor = '#121213'; /* Dark background */
    document.body.style.display = 'flex';
    document.body.style.flexDirection = 'column';
    document.body.style.alignItems = 'center';
    document.body.style.justifyContent = 'center';
    document.body.style.height = '100vh';
    document.body.style.margin = '0';
    document.body.style.color = '#FFF';
    document.body.style.fontFamily = 'Helvetica, Arial, sans-serif';

    const container = document.createElement('div');
    container.style.padding = '20px';
    container.style.maxWidth = '400px';
    container.style.width = '90%';
    document.body.appendChild(container);

    const titleEl = document.createElement('h1');
    titleEl.textContent = "5-Digit Codebreaker";
    titleEl.style.textAlign = 'center';
    titleEl.style.borderBottom = '2px solid #3a3a3c';
    titleEl.style.paddingBottom = '10px';
    container.appendChild(titleEl);

    const guessesArea = document.createElement('div');
    guessesArea.id = 'guesses-area';
    guessesArea.style.marginBottom = '20px';
    container.appendChild(guessesArea);

    const inputArea = document.createElement('div');
    inputArea.style.display = 'flex';
    inputArea.style.gap = '10px';
    inputArea.style.width = '100%';
    container.appendChild(inputArea);

    const inputEl = document.createElement('input');
    inputEl.type = 'text';
    inputEl.maxLength = CODE_LENGTH;
    inputEl.placeholder = "Enter 5 digits";
    inputEl.style.backgroundColor = '#121213';
    inputEl.style.border = '1px solid #3a3a3c';
    inputEl.style.color = '#FFF';
    inputEl.style.padding = '10px';
    inputEl.style.flexGrow = '1';
    inputEl.style.fontSize = '1.2em';
    inputArea.appendChild(inputEl);
    inputEl.focus();

    const submitBtn = document.createElement('button');
    submitBtn.textContent = 'Guess';
    submitBtn.style.padding = '10px 15px';
    submitBtn.style.backgroundColor = '#538d4e'; /* Wordle green */
    submitBtn.style.color = 'white';
    submitBtn.style.border = 'none';
    submitBtn.style.cursor = 'pointer';
    submitBtn.style.fontSize = '1em';
    inputArea.appendChild(submitBtn);

    const playAgainBtn = document.createElement('button');
    playAgainBtn.textContent = 'Play Again';
    playAgainBtn.style.padding = '10px 15px';
    playAgainBtn.style.backgroundColor = '#3a3a3c';
    playAgainBtn.style.color = 'white';
    playAgainBtn.style.border = 'none';
    playAgainBtn.style.cursor = 'pointer';
    playAgainBtn.style.marginTop = '20px';
    playAgainBtn.style.display = 'none'; /* Hidden until game over */
    container.appendChild(playAgainBtn);

    const keyboardArea = document.createElement('div');
    keyboardArea.id = 'keyboard-area';
    keyboardArea.style.display = 'flex';
    keyboardArea.style.justifyContent = 'center';
    keyboardArea.style.marginTop = '20px';
    keyboardArea.style.gap = '5px';
    container.appendChild(keyboardArea);


    // --- Game Logic Functions ---

    function generateSecretCode() {
        let code = '';
        for (let i = 0; i < CODE_LENGTH; i++) {
            code += Math.floor(Math.random() * 10).toString();
        }
        return code;
    }

    function resetGame() {
        secretCode = generateSecretCode();
        guessesRemaining = MAX_GUESSES;
        gameOver = false;
        guessesArea.innerHTML = '';
        inputEl.value = '';
        inputEl.disabled = false;
        submitBtn.disabled = false;
        playAgainBtn.style.display = 'none';
        inputEl.focus();
        // Reset keyboard colors
        for (let i = 0; i <= 9; i++) {
            keyboardStatus[i] = '#3a3a3c';
        }
        updateKeyboardDisplay();
        // console.log("New secret code:", secretCode);
    }

    function handleGuess() {
        if (gameOver) return;

        const guess = inputEl.value.trim();
        if (guess.length !== CODE_LENGTH || isNaN(guess)) {
            alert(`Please enter exactly ${CODE_LENGTH} digits.`);
            return;
        }

        inputEl.value = '';
        guessesRemaining--;

        displayGuessResult(guess);

        if (guess === secretCode) {
            endGame(true, guess);
        } else if (guessesRemaining === 0) {
            endGame(false, guess);
        }
    }

    function updateKeyboardStatus(guessColors, guess) {
        for (let i = 0; i < CODE_LENGTH; i++) {
            const digit = guess[i];
            const color = guessColors[i];
            
            // Green overrides everything
            if (color === '#538d4e') {
                keyboardStatus[digit] = '#538d4e';
            } 
            // Yellow overrides gray/black, but not green
            else if (color === '#b59f3b' && keyboardStatus[digit] !== '#538d4e') {
                 keyboardStatus[digit] = '#b59f3b';
            } 
            // Black (not in code) overrides gray (default)
            else if (color === '#3a3a3c' && keyboardStatus[digit] === '#3a3a3c') {
                keyboardStatus[digit] = '#212122'; /* Darker black for excluded */
            }
        }
        updateKeyboardDisplay();
    }

    function updateKeyboardDisplay() {
        keyboardArea.innerHTML = '';
        for (let i = 0; i <= 9; i++) {
            const key = document.createElement('div');
            key.textContent = i;
            key.style.width = '30px';
            key.style.height = '45px';
            key.style.display = 'flex';
            key.style.alignItems = 'center';
            key.style.justifyContent = 'center';
            key.style.backgroundColor = keyboardStatus[i];
            key.style.color = '#FFF';
            key.style.borderRadius = '4px';
            key.style.fontWeight = 'bold';
            key.style.cursor = 'default';
            keyboardArea.appendChild(key);
        }
    }

    function displayGuessResult(guess) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.justifyContent = 'center';
        row.style.gap = '5px';
        row.style.marginBottom = '5px';

        const secretFreq = {};
        for (const digit of secretCode) {
            secretFreq[digit] = (secretFreq[digit] || 0) + 1;
        }

        const colors = Array(CODE_LENGTH).fill('#3a3a3c'); /* Black/Gray base */

        // First pass: Mark Greens and decrease frequency count
        for (let i = 0; i < CODE_LENGTH; i++) {
            if (guess[i] === secretCode[i]) {
                colors[i] = '#538d4e'; /* Green */
                secretFreq[guess[i]]--;
            }
        }

        // Second pass: Mark Yellows
        for (let i = 0; i < CODE_LENGTH; i++) {
            if (colors[i] === '#538d4e') continue; 
            
            if (secretFreq[guess[i]] > 0) {
                colors[i] = '#b59f3b'; /* Yellow */
                secretFreq[guess[i]]--;
            }
        }
        
        updateKeyboardStatus(colors, guess);

        // Create the visual blocks
        for (let i = 0; i < CODE_LENGTH; i++) {
            const block = document.createElement('div');
            block.textContent = guess[i];
            block.style.width = '40px';
            block.style.height = '40px';
            block.style.display = 'flex';
            block.style.alignItems = 'center';
            block.style.justifyContent = 'center';
            block.style.backgroundColor = colors[i];
            block.style.border = '1px solid #3a3a3c';
            block.style.fontWeight = 'bold';
            block.style.fontSize = '1.2em';
            block.style.borderRadius = '3px';
            row.appendChild(block);
        }
        guessesArea.appendChild(row);
    }

    function endGame(won) {
        gameOver = true;
        inputEl.disabled = true;
        submitBtn.disabled = true;
        playAgainBtn.style.display = 'block';

        const message = document.createElement('p');
        message.style.textAlign = 'center';
        message.style.marginTop = '15px';
        if (won) {
            message.textContent = `🎉 You won in ${MAX_GUESSES - guessesRemaining} guesses!`;
            message.style.color = '#538d4e';
        } else {
            message.textContent = `💔 Game Over. The code was ${secretCode}.`;
            message.style.color = '#787c7e';
        }
        guessesArea.appendChild(message);
    }

    // --- Event Listeners ---
    submitBtn.addEventListener('click', handleGuess);
    inputEl.addEventListener('keydown', function(event) {
        if (event.key === 'Enter') {
            handleGuess();
        }
    });
    playAgainBtn.addEventListener('click', resetGame);


    // --- Start the Application Flow ---
    resetGame(); // Initializes the first game and keyboard
})();





(function() { if (!document.getElementById('dec-nav')) { const nav = document.createElement('a'); nav.id = 'dec-nav'; nav.href = '../index.html'; nav.innerText = '← Dec Games'; nav.style.cssText = 'position:fixed; top:15px; left:15px; z-index:9999; padding:10px 15px; background:rgba(0,0,0,0.8); color:white; text-decoration:none; border-radius:8px; font-family:sans-serif; font-weight:bold; border:1px solid rgba(255,255,255,0.2); pointer-events: auto;'; document.body.appendChild(nav); } })();
