// utility functions
function getRandomInterval(min, max) {
  return Math.random() * (max - min) + min;
}

function getRandomIndex(arr) {
  const index = Math.floor(Math.random() * arr.length);
  if (index === lastSelected) {
    getRandomIndex(arr);
  }
  lastSelected = index;
  return index;
}

function stripVariables(fn) {
  return function withStripped() {
    fn();
  };
}

// UI variables
const moles = document.querySelectorAll('.mole');
const startButton = document.querySelector('button.start');
const resetButton = document.querySelector('button.reset');
const stopButton = document.querySelector('button.stop');
const resumeButton = document.querySelector('button.resume');
const scoreText = document.querySelector('span.scoreNumber');
const gameOverMessage = document.querySelector('h2.gameOver');
const timeLeftText = document.querySelector('span.timeLeftNumber');
// game variables
let score = 0;
let lastSelected;
let startTime;
let gameTimeout;
let timeLeftInterval;
let gameActive = false;
const GAME_TIME = 10000;
const RESET_TIME = 2000;
const TIME_LEFT_INTERVAL_UPDATE = 100;
let timeLeftInGame = GAME_TIME;
const gameStates = {
  START: 'START',
  STOP: 'STOP',
  RESUME: 'RESUME',
  RESET: 'RESET',
  GAME_OVER: 'GAME_OVER',
};

// mole functionality
function showMole() {
  const indexOfMoleToShow = getRandomIndex(moles);
  const randomShowTime = getRandomInterval(300, 2000);
  const mole = moles[indexOfMoleToShow];

  mole.classList.add('show');
  setTimeout(function nextShow() {
    if (gameActive) {
      showMole();
    }
    mole.classList.remove('show');
  }, randomShowTime);
}

function hitMole(e) {
  if (!e.isTrusted || !gameActive) {
    return;
  }
  score += 1;
  e.target.classList.remove('show');
  scoreText.innerHTML = score;
}

for (let i = 0; i < moles.length; i += 1) {
  moles[i].addEventListener('click', hitMole);
}

// button controls functionality
function setUiBasedOnState(state) {
  switch (state) {
    case gameStates.START: {
      resetButton.classList.remove('hidden');
      stopButton.classList.remove('hidden');
      startButton.classList.add('hidden');
      resumeButton.classList.add('hidden');
      break;
    }
    case gameStates.STOP: {
      stopButton.classList.add('hidden');
      resumeButton.classList.remove('hidden');
      break;
    }
    case gameStates.RESUME: {
      stopButton.classList.remove('hidden');
      resumeButton.classList.add('hidden');
      break;
    }
    case gameStates.RESET: {
      startButton.classList.remove('hidden');
      resetButton.classList.add('hidden');
      stopButton.classList.add('hidden');
      resumeButton.classList.add('hidden');
      gameOverMessage.classList.add('hidden');
      timeLeftText.innerHTML = '10.0';
      break;
    }
    case gameStates.GAME_OVER: {
      startButton.classList.add('hidden');
      resetButton.classList.add('hidden');
      stopButton.classList.add('hidden');
      resumeButton.classList.add('hidden');
      gameOverMessage.classList.remove('hidden');
      break;
    }
    default:
      break;
  }
}

function resetGame(dontChangeUiState) {
  score = 0;
  scoreText.innerHTML = score;
  gameActive = false;
  timeLeftInGame = GAME_TIME;
  clearInterval(timeLeftInterval);
  clearTimeout(gameTimeout);
  if (!dontChangeUiState) {
    setUiBasedOnState(gameStates.RESET);
  }
}

function startTimeoutForEndGame(gameTimeLeft) {
  const gameTime = gameTimeLeft || GAME_TIME;
  timeLeftInterval = setInterval(function setTimeLeftUi() {
    const timeLeftMs = startTime + timeLeftInGame - Date.now();
    if (timeLeftMs >= 0) {
      timeLeftText.innerHTML = (timeLeftMs / 1000).toFixed(1);
    } else {
      timeLeftText.innerHTML = (0).toFixed(1);
      clearInterval(timeLeftInterval);
    }
  }, TIME_LEFT_INTERVAL_UPDATE);
  gameTimeout = setTimeout(function endGame() {
    gameActive = false;
    setUiBasedOnState(gameStates.GAME_OVER);
    setTimeout(function resetTheGameForNextPlay() {
      setUiBasedOnState(gameStates.RESET);
    }, RESET_TIME);
  }, gameTime);
}

function startGame(gameTimeLeft) {
  if (!gameTimeLeft) {
    resetGame(true);
    setUiBasedOnState(gameStates.START);
  }
  startTime = Date.now();
  gameActive = true;
  startTimeoutForEndGame(gameTimeLeft);
  showMole();
}

function toggleGame() {
  const gameState = gameActive ? gameStates.STOP : gameStates.RESUME;
  gameActive = !gameActive;
  if (gameState === gameStates.STOP) {
    timeLeftInGame = startTime + timeLeftInGame - Date.now();
    clearTimeout(gameTimeout);
    clearInterval(timeLeftInterval);
  } else {
    startGame(timeLeftInGame);
  }
  setUiBasedOnState(gameState);
}

// strip the variables since we aren't using the event
startButton.addEventListener('click', stripVariables(startGame));
resetButton.addEventListener('click', stripVariables(resetGame));
stopButton.addEventListener('click', stripVariables(toggleGame));
resumeButton.addEventListener('click', stripVariables(toggleGame));
