'use strict';

// Constants
const DIFFICULTIES = {
  easy: { maxNumber: 20, timerDuration: 45 },
  medium: { maxNumber: 50, timerDuration: 30 },
  hard: { maxNumber: 100, timerDuration: 15 },
};

// Game state
let randomNumber;
let score = 20;
let highScore = 0;
let isGameWon = false;
let isGameOver = false;
let timerId;
let difficulty = 'medium'; // default difficulty
let timerDuration; // timer duration will be set in resetGame()
let previousGuess = null; // added to store the previous guess

// Audio elements
let gameOverSound = document.getElementById('game-over-sound');
let clickButtonSound = document.getElementById('click-button-sound');
let correctAnswerSound = document.getElementById('correct-answer-sound');
let wrongAnswerSound = document.getElementById('wrong-answer-sound');

// Input field
let guessInput = document.querySelector('.guess');

// Set the visual selection to the default difficulty
document.querySelector('#difficulty').value = difficulty;

// Generate a random number based on the current difficulty
function generateRandomNumber() {
  const maxNumber = DIFFICULTIES[difficulty].maxNumber;
  return Math.trunc(Math.random() * maxNumber) + 1;
}

// Prepare for a new game without clearing the input field
function prepareForNewGame() {
  score = 20;
  isGameWon = false;
  isGameOver = false;
  previousGuess = null; // reset previous guess

  document.querySelector('.message').textContent = 'Start guessing...';
  document.querySelector('.score').textContent = score;
  document.querySelector('.number').textContent = '?';
  document.querySelector('#prev-guess').textContent = ''; // clear previous guess display

  // Reset background color
  document.querySelector('body').style.backgroundColor = '#222';
  document.querySelector('.number').style.width = '15rem';

  // Reset timer
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }

  // Set timer duration and new random number based on difficulty
  const difficultySettings = DIFFICULTIES[difficulty];
  timerDuration = difficultySettings.timerDuration;
  document.querySelector('#time').textContent = timerDuration;
  randomNumber = generateRandomNumber();

  // Update .between text according to difficulty
  document.querySelector(
    '.between'
  ).textContent = `(Between 1 and ${difficultySettings.maxNumber})`;

  // Set focus to the input field
  guessInput.focus();
}

// Reset the game to its initial state
function resetGame() {
  prepareForNewGame();
  guessInput.value = '';
}

// Call resetGame() at the start to set initial game state
resetGame();

// Check the user's guess and update the game state accordingly
function checkGuess() {
  if (isGameOver) {
    return;
  }

  const guess = Number(guessInput.value);

  if (isGameWon) {
    if (guess) {
      // Use the new guess for the new game
      isGameWon = false;
      document.querySelector('.number').textContent = '?';
      document.querySelector('.number').style.width = '15rem';
      checkGuess();
      return;
    } else {
      prepareForNewGame();
      return;
    }
  }

  // Start timer on first guess
  if (!timerId) {
    startTimer();
  }

  if (!guess) {
    document.querySelector('.message').textContent = '⛔ Not a Number!';
  } else if (guess === randomNumber) {
    handleCorrectGuess();
  } else {
    handleIncorrectGuess(guess);
  }

  guessInput.value = '';
}

// Start the timer
function startTimer() {
  let timeLeft = timerDuration;
  timerId = setInterval(function () {
    timeLeft--;
    document.querySelector('#time').textContent = timeLeft;
    if (timeLeft <= 0) {
      clearInterval(timerId);
      document.querySelector('.message').textContent = '☠ Time is up!';
      gameOverSound.play();
      isGameOver = true;

      // Reset background color
      document.querySelector('body').style.backgroundColor = '#222';
    }
  }, 1000);
}

// Handle a correct guess
function handleCorrectGuess() {
  document.querySelector('.message').textContent = '🎉 Correct Number!';

  document.querySelector('body').style.backgroundColor = '#60b347';
  document.querySelector('.number').style.width = '30rem';
  score++;
  document.querySelector('.score').textContent = score;
  document.querySelector('.number').textContent = randomNumber;
  randomNumber = generateRandomNumber();

  if (score > highScore) {
    highScore = score;
    document.querySelector('.highscore').textContent = highScore;
  }
  isGameWon = true;

  // Stop the timer
  clearInterval(timerId);
  timerId = null;

  correctAnswerSound.play();
}

// Handle an incorrect guess
function handleIncorrectGuess(guess) {
  if (score > 1) {
    document.querySelector('.message').textContent =
      guess > randomNumber ? '📈 Too High Number!' : '📉 Too Low Number!';
    score--;
    document.querySelector('.score').textContent = score;
    // Reset background color
    document.querySelector('body').style.backgroundColor = '#222';
    // Update previous guess
    previousGuess = guess;
    document.querySelector('#prev-guess').textContent = previousGuess;
    // Show the previous guess text
    document.querySelector('.previous-guess').classList.remove('hidden');
  } else {
    document.querySelector('.score').textContent = 0;
    document.querySelector('.message').textContent = '☠ Game Over!';
    gameOverSound.play();
    isGameOver = true;

    // Stop the timer
    clearInterval(timerId);
    timerId = null;
  }
  wrongAnswerSound.play();
}

document.querySelector('.check').addEventListener('click', function () {
  checkGuess();
});

document.querySelector('.again').addEventListener('click', function () {
  clickButtonSound.play();
  resetGame();
});

// Listen for changes in difficulty
document.querySelector('#difficulty').addEventListener('change', function (e) {
  clickButtonSound.play();
  difficulty = e.target.value;
  resetGame();
});

// Listen for 'Enter' key press on the input field
guessInput.addEventListener('keydown', function (e) {
  if (e.key === 'Enter') {
    checkGuess();
  }
});
