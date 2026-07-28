
const CONFIG = {
    soundEnabled: localStorage.getItem('soundEnabled') !== 'false',
    darkMode: localStorage.getItem('darkMode') !== 'false',
};


const messagesArea = document.getElementById('messagesArea');
const messageInput = document.getElementById('messageInput');
const messageForm = document.getElementById('messageForm');
const soundToggleBtn = document.getElementById('soundToggleBtn');
const themeToggleBtn = document.getElementById('themeToggleBtn');


const socket = io();

socket.on('connect', () => {
    console.log('Connected to server');
    addBotMessage('Welcome! 👋 I\'m your SIBA Guide Bot. Ask me anything about admissions, fees, attendance, scholarships, or any other university-related questions. How can I help?');
});

socket.on('response', (data) => {
    removeTypingIndicator();
    addBotMessage(data.message);
});

socket.on('disconnect', () => {
    console.log('Disconnected from server');
});


function playSound(type) {
    if (!CONFIG.soundEnabled) return;

    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        if (type === 'send') {
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.1);
        } else if (type === 'receive') {
            oscillator.frequency.value = 600;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.15);
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.15);
        }
    } catch (e) {
        console.log('Audio context error:', e);
    }
}


function addMessage(text, isUser) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `flex ${isUser ? 'justify-end' : 'justify-start'} mb-4 gap-3 items-end`;

    
    if (!isUser) {
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar bot-avatar';
        avatar.textContent = '🤖';
        avatar.style.cursor = 'pointer';
        avatar.title = 'Click to interact!';

        avatar.addEventListener('mouseenter', () => {
            avatar.style.transform = 'scale(1.2) rotate(10deg)';
            avatar.style.transition = 'all 0.3s ease';
        });

        avatar.addEventListener('mouseleave', () => {
            avatar.style.transform = 'scale(1)';
        });

        avatar.addEventListener('click', () => {
            avatar.style.animation = 'avatarBounce 0.6s ease';
            setTimeout(() => {
                avatar.style.animation = 'avatarFloat 3s ease-in-out infinite';
            }, 600);
        });

        messageDiv.appendChild(avatar);
    }

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = `max-w-xs sm:max-w-md lg:max-w-lg px-4 py-3 rounded-2xl message-bubble ${
        isUser
            ? 'user-message text-white'
            : 'bot-message text-gray-100'
    }`;

    
    let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formattedText = formattedText.replace(/\n/g, '<br>');

    bubbleDiv.innerHTML = formattedText;
    messageDiv.appendChild(bubbleDiv);

    
    if (isUser) {
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar user-avatar';
        avatar.textContent = '👤';
        avatar.style.cursor = 'pointer';
        avatar.title = 'Click to interact!';

        avatar.addEventListener('mouseenter', () => {
            avatar.style.transform = 'scale(1.2) rotate(-10deg)';
            avatar.style.transition = 'all 0.3s ease';
        });

        avatar.addEventListener('mouseleave', () => {
            avatar.style.transform = 'scale(1)';
        });

        avatar.addEventListener('click', () => {
            avatar.style.animation = 'avatarBounce 0.6s ease';
            setTimeout(() => {
                avatar.style.animation = 'avatarFloat 3s ease-in-out infinite';
            }, 600);
        });

        messageDiv.appendChild(avatar);
    }

    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;

    return messageDiv;
}

function addBotMessage(text) {
    addMessage(text, false);
    playSound('receive');
}

function addUserMessage(text) {
    addMessage(text, true);
    playSound('send');
}

function showTypingIndicator() {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'flex justify-start mb-4 gap-3 items-end';
    messageDiv.id = 'typingIndicator';

    const avatar = document.createElement('div');
    avatar.className = 'message-avatar bot-avatar';
    avatar.textContent = '🤖';
    messageDiv.appendChild(avatar);

    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'px-4 py-3 rounded-2xl bot-message flex gap-2 items-center';

    for (let i = 0; i < 3; i++) {
        const dot = document.createElement('div');
        dot.className = 'w-2 h-2 bg-indigo-500 rounded-full typing-dot';
        bubbleDiv.appendChild(dot);
    }

    messageDiv.appendChild(bubbleDiv);
    messagesArea.appendChild(messageDiv);
    messagesArea.scrollTop = messagesArea.scrollHeight;
}

function removeTypingIndicator() {
    const indicator = document.getElementById('typingIndicator');
    if (indicator) {
        indicator.remove();
    }
}

function sendMessage() {
    const text = messageInput.value.trim();
    if (!text) return;

    addUserMessage(text);
    messageInput.value = '';
    messageInput.focus();

    showTypingIndicator();
    socket.emit('message', text);
}


function updateSoundButtonUI() {
    if (CONFIG.soundEnabled) {
        soundToggleBtn.textContent = '🔊';
        soundToggleBtn.classList.remove('opacity-50');
    } else {
        soundToggleBtn.textContent = '🔇';
        soundToggleBtn.classList.add('opacity-50');
    }
}

soundToggleBtn.addEventListener('click', () => {
    CONFIG.soundEnabled = !CONFIG.soundEnabled;
    localStorage.setItem('soundEnabled', CONFIG.soundEnabled);
    updateSoundButtonUI();
});


function updateThemeButtonUI() {
    if (CONFIG.darkMode) {
        themeToggleBtn.textContent = '🌙';
        document.body.classList.remove('light-mode');
        document.documentElement.style.colorScheme = 'dark';
    } else {
        themeToggleBtn.textContent = '☀️';
        document.body.classList.add('light-mode');
        document.documentElement.style.colorScheme = 'light';
    }
}

themeToggleBtn.addEventListener('click', () => {
    CONFIG.darkMode = !CONFIG.darkMode;
    localStorage.setItem('darkMode', CONFIG.darkMode);
    updateThemeButtonUI();
});


messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    sendMessage();
});

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});


updateSoundButtonUI();
updateThemeButtonUI();

messageInput.focus();
