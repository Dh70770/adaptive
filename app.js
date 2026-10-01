import { questions } from './questions.js';

const QUIZ_LENGTH = 10; // Počet otázek na jedno kolo

let activeQuestions = [];
let currentQuestionIndex = 0;
let score = 0;
let isAnswerSubmitted = false;

// DOM prvky
const quizHeader = document.getElementById('quiz-header');
const quizCard = document.getElementById('quiz-card');
const resultsCard = document.getElementById('results-card');

const questionNumberEl = document.getElementById('question-number');
const scoreCounterEl = document.getElementById('score-counter');
const progressBarFill = document.getElementById('progress-bar-fill');

const categoryBadge = document.getElementById('category-badge');
const difficultyBadge = document.getElementById('difficulty-badge');
const questionText = document.getElementById('question-text');
const optionsContainer = document.getElementById('options-container');

const explanationBox = document.getElementById('explanation-box');
const explanationStatus = document.getElementById('explanation-status');
const explanationText = document.getElementById('explanation-text');

const nextBtn = document.getElementById('next-btn');
const restartBtn = document.getElementById('restart-btn');

const finalScoreEl = document.getElementById('final-score');
const finalPercentageEl = document.getElementById('final-percentage');
const resultsMessageEl = document.getElementById('results-message');
const resultsIconEl = document.getElementById('results-icon');

// Fisher-Yates shuffle
function shuffleArray(array) {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Příprava dat kvízu: náhodný výběr a zamíchání možností se zachováním reference
function setupQuizData() {
  const selectedQuestions = shuffleArray(questions).slice(0, QUIZ_LENGTH);

  return selectedQuestions.map((q) => {
    const optionsWithMeta = q.moznosti.map((text, idx) => ({
      text: text,
      isCorrect: idx === q.spravna
    }));

    return {
      ...q,
      shuffledOptions: shuffleArray(optionsWithMeta)
    };
  });
}

function startQuiz() {
  score = 0;
  currentQuestionIndex = 0;
  isAnswerSubmitted = false;
  activeQuestions = setupQuizData();

  resultsCard.classList.add('hidden');
  quizHeader.classList.remove('hidden');
  quizCard.classList.remove('hidden');

  renderQuestion();
}

function renderQuestion() {
  isAnswerSubmitted = false;
  const currentQ = activeQuestions[currentQuestionIndex];
  const questionNum = currentQuestionIndex + 1;
  const total = activeQuestions.length;

  questionNumberEl.textContent = `Otázka ${questionNum}/${total}`;
  scoreCounterEl.textContent = `Skóre: ${score}`;
  progressBarFill.style.width = `${(questionNum / total) * 100}%`;

  categoryBadge.textContent = currentQ.kategorie.toUpperCase();
  difficultyBadge.textContent = currentQ.obtiznost === 'easy' ? 'Lehká' : currentQ.obtiznost === 'medium' ? 'Střední' : 'Těžká';
  questionText.textContent = currentQ.zadani;

  optionsContainer.innerHTML = '';
  explanationBox.classList.add('hidden');
  nextBtn.classList.add('hidden');

  currentQ.shuffledOptions.forEach((option) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = option.text;
    btn.dataset.isCorrect = option.isCorrect;

    btn.addEventListener('click', () => handleOptionClick(btn, option.isCorrect));
    optionsContainer.appendChild(btn);
  });
}

function handleOptionClick(selectedBtn, isCorrect) {
  if (isAnswerSubmitted) return;
  isAnswerSubmitted = true;

  const currentQ = activeQuestions[currentQuestionIndex];
  const allBtns = optionsContainer.querySelectorAll('.option-btn');

  allBtns.forEach((btn) => {
    btn.disabled = true;
    if (btn.dataset.isCorrect === 'true') {
      btn.classList.add('correct');
    }
  });

  if (isCorrect) {
    score++;
    scoreCounterEl.textContent = `Skóre: ${score}`;
    explanationStatus.textContent = '✓ Správně!';
    explanationStatus.className = 'explanation-title success';
  } else {
    selectedBtn.classList.add('wrong');
    explanationStatus.textContent = '✗ Špatně!';
    explanationStatus.className = 'explanation-title error';
  }

  explanationText.textContent = currentQ.vysvetleni;
  explanationBox.classList.remove('hidden');

  const isLast = currentQuestionIndex === activeQuestions.length - 1;
  nextBtn.textContent = isLast ? 'Zobrazit výsledky 🏁' : 'Další otázka →';
  nextBtn.classList.remove('hidden');
}

function handleNext() {
  if (currentQuestionIndex < activeQuestions.length - 1) {
    currentQuestionIndex++;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  quizHeader.classList.add('hidden');
  quizCard.classList.add('hidden');
  resultsCard.classList.remove('hidden');

  const total = activeQuestions.length;
  const percentage = Math.round((score / total) * 100);

  finalScoreEl.textContent = `${score} / ${total}`;
  finalPercentageEl.textContent = `${percentage} %`;

  if (percentage === 100) {
    resultsIconEl.textContent = '🥇';
    resultsMessageEl.textContent = 'Fantastický výsledek! Pravopis máš v malíčku bez jediné chybičky.';
  } else if (percentage >= 80) {
    resultsIconEl.textContent = '🎉';
    resultsMessageEl.textContent = 'Skvělá práce! Máš výborný cit pro český jazyk.';
  } else if (percentage >= 50) {
    resultsIconEl.textContent = '👍';
    resultsMessageEl.textContent = 'Dobrý pokus! Základ máš solidní, stačí jen docvičit pár výjimek.';
  } else {
    resultsIconEl.textContent = '📚';
    resultsMessageEl.textContent = 'Nevěš hlavu! Pravopisné výjimky chtějí jen trochu více tréninku.';
  }
}

nextBtn.addEventListener('click', handleNext);
restartBtn.addEventListener('click', startQuiz);

startQuiz();
