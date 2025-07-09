// Classe principal do aplicativo Pomodoro
class PomodoroApp {
    constructor() {
        // Definindo os tempos padrão para trabalho, pausa curta e pausa longa (em minutos)
        this.settings = {
            work: 25,
            shortBreak: 5,
            longBreak: 15
        };
        
        // Define o modo atual como "trabalho"
        this.currentMode = 'work';
        
        // Define se o cronômetro está rodando
        this.isRunning = false;
        
        // Tempo restante em segundos (começa com tempo de trabalho)
        this.timeLeft = this.settings.work * 60;
        
        // Tempo total da sessão atual (usado para calcular progresso)
        this.totalTime = this.settings.work * 60;
        
        // Armazena o ID do intervalo do setInterval
        this.interval = null;
        
        // Conta quantas sessões de trabalho foram concluídas
        this.completedSessions = 0;
        
        // Inicializa a interface do app e exibe o tempo
        this.initializeApp();
        this.updateDisplay();
    }
    
    // Inicializa botões e som
    initializeApp() {
        // Adiciona a classe 'active' no botão de trabalho
        document.getElementById('workBtn').classList.add('active');
        
        // Cria contexto de áudio para tocar alarme
        this.createAlarmSound();
    }
    
    // Cria o contexto de som usando a Web Audio API
    createAlarmSound() {
        this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    
    // Toca um som de alarme ao final do cronômetro
    playAlarmSound() {
        if (this.audioContext) {
            const oscillator = this.audioContext.createOscillator(); // Gera o som
            const gainNode = this.audioContext.createGain(); // Controla o volume
            
            // Conecta os componentes de áudio
            oscillator.connect(gainNode);
            gainNode.connect(this.audioContext.destination);
            
            // Define variações de frequência para o som do alarme
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime);
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.2);
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 0.4);
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 0.6);
            oscillator.frequency.setValueAtTime(600, this.audioContext.currentTime + 0.8);
            oscillator.frequency.setValueAtTime(800, this.audioContext.currentTime + 1.0);
            oscillator.frequency.setValueAtTime(1000, this.audioContext.currentTime + 1.2);
            
            // Define volume inicial e final
            gainNode.gain.setValueAtTime(0.3, this.audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 1.5);
            
            // Inicia e para o som
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 1.5);
        }
    }
    
    // Atualiza o visor de tempo, progresso e mascote
    updateDisplay() {
        const minutes = Math.floor(this.timeLeft / 60); // Calcula minutos restantes
        const seconds = this.timeLeft % 60;             // Calcula segundos restantes
        
        // Atualiza o visor do tempo no formato MM:SS
        document.getElementById('timerDisplay').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Define os nomes visíveis de cada modo
        const modeNames = {
            work: 'HORA DE FOCAR',
            shortBreak: 'PAUSA CURTA',
            longBreak: 'PAUSA LONGA'
        };
        
        // Atualiza o nome do modo exibido na interface
        document.getElementById('modeDisplay').textContent = modeNames[this.currentMode];
        
        // Atualiza a barra de progresso com base no tempo restante
        const progress = 1 - (this.timeLeft / this.totalTime);
        document.getElementById('progressBar').style.width = `${progress * 100}%`;
        
        // Atualiza o mascote conforme o modo atual
        this.updateMascot();
    }
    
    // Troca o mascote de acordo com o modo
    updateMascot() {
        const mascotImg = document.querySelector('.mascot-gif');
        if (this.currentMode === 'work') {
            mascotImg.src = 'write.gif'; // Mascote escrevendo
            mascotImg.alt = 'Mascote escrevendo';
        } else {
            mascotImg.src = 'relax.gif'; // Mascote relaxando
            mascotImg.alt = 'Mascote relaxando';
        }
    }
    
    // Alterna entre iniciar e pausar o cronômetro
    toggleTimer() {
        if (this.isRunning) {
            this.pauseTimer();
        } else {
            this.startTimer();
        }
    }
    
    // Inicia o cronômetro
    startTimer() {
        this.isRunning = true;
        document.getElementById('startStopBtn').textContent = 'PAUSAR';
        
        // Executa a cada segundo
        this.interval = setInterval(() => {
            this.timeLeft--;
            this.updateDisplay();
            
            // Se o tempo acabou, finaliza o cronômetro
            if (this.timeLeft <= 0) {
                this.timerComplete();
            }
        }, 1000);
    }
    
    // Pausa o cronômetro
    pauseTimer() {
        this.isRunning = false;
        document.getElementById('startStopBtn').textContent = 'INICIAR';
        clearInterval(this.interval);
    }
    
    // Executado quando o cronômetro chega a zero
    timerComplete() {
        this.pauseTimer();
        this.playAlarmSound();
        this.showTimerCompleteModal();
        
        // Lógica de troca de modo após o término da sessão
        if (this.currentMode === 'work') {
            this.completedSessions++;
            
            // A cada 4 sessões completas, dá uma pausa longa
            if (this.completedSessions % 4 === 0) {
                this.selectMode('longBreak');
            } else {
                this.selectMode('shortBreak');
            }
        } else {
            this.selectMode('work');
        }
        
        this.updateDisplay();
    }
    
    // Mostra o modal ao final de uma sessão
    showTimerCompleteModal() {
        const modal = document.getElementById('timerCompleteModal');
        const message = document.getElementById('timerCompleteMessage');
        
        // Define a mensagem conforme o modo encerrado
        if (this.currentMode === 'work') {
            message.textContent = `Parabéns! Você completou uma sessão de foco de ${this.settings.work} minutos.`;
        } else if (this.currentMode === 'shortBreak') {
            message.textContent = `Pausa curta finalizada! Hora de voltar ao foco.`;
        } else {
            message.textContent = `Pausa longa finalizada! Você está pronto para mais foco.`;
        }
        
        modal.classList.add('active');
    }
    
    // Troca entre os modos (trabalho, pausa curta, longa)
    selectMode(mode) {
        this.currentMode = mode;
        this.timeLeft = this.settings[mode] * 60;
        this.totalTime = this.settings[mode] * 60;
        
        // Atualiza os botões visuais de modo
        document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(mode + 'Btn').classList.add('active');
        
        this.updateDisplay();
    }
    
    // Reinicia o cronômetro no modo atual
    resetTimer() {
        this.pauseTimer();
        this.timeLeft = this.settings[this.currentMode] * 60;
        this.totalTime = this.settings[this.currentMode] * 60;
        this.updateDisplay();
    }
    
    // Ajusta o tempo dos modos pelas setas de + e -
    adjustTime(mode, change) {
        // Garante que o tempo fique entre 1 e 60 minutos
        this.settings[mode] = Math.max(1, Math.min(60, this.settings[mode] + change));
        
        // Atualiza o texto com o novo tempo
        document.getElementById(mode + 'Value').textContent = this.settings[mode] + ' min';
        
        // Se o modo sendo ajustado for o atual, atualiza o cronômetro
        if (mode === this.currentMode) {
            this.timeLeft = this.settings[mode] * 60;
            this.totalTime = this.settings[mode] * 60;
            this.updateDisplay();
        }
    }
}

// Cria uma variável global do app
let app;

// Funções globais ligadas a botões da interface
function toggleTimer() {
    app.toggleTimer();
}

function selectMode(mode) {
    app.selectMode(mode);
}

function resetTimer() {
    app.resetTimer();
}

function adjustTime(mode, change) {
    app.adjustTime(mode, change);
}

function openSettings() {
    document.getElementById('settingsModal').classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsModal').classList.remove('active');
}

function closeTimerComplete() {
    document.getElementById('timerCompleteModal').classList.remove('active');
}

// Fecha modais ao clicar fora deles
document.addEventListener('click', function(event) {
    const settingsModal = document.getElementById('settingsModal');
    const timerCompleteModal = document.getElementById('timerCompleteModal');
    
    if (event.target === settingsModal) {
        closeSettings();
    }
    
    if (event.target === timerCompleteModal) {
        closeTimerComplete();
    }
});

// Quando a página carregar, inicializa a aplicação
document.addEventListener('DOMContentLoaded', () => {
    app = new PomodoroApp();
});
