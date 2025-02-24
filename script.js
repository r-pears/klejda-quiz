const quizContainer = document.getElementById("quiz");
const resultContainer = document.getElementById("result");
const submitButton = document.getElementById("submit");
const retryButton = document.getElementById("retry");
const showAnswerButton = document.getElementById("showAnswer");

let currentQuestion = 0;
let score = 0;
let questions = [];

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Should have error handling for fetch request
async function loadQuiz() {
  try {
    const response = await fetch(
      "https://opentdb.com/api.php?amount=10&type=multiple"
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    questions = data.results;
    displayQuestion();
  } catch (error) {
    console.error("Failed to load quiz questions:", error);
  }
}

function displayQuestion() {
  const question = questions[currentQuestion];
  const answers = [...question.incorrect_answers, question.correct_answer];
  shuffleArray(answers);

  let output = `<div class="question">${decodeHTML(question.question)}</div>
                  <div class="answers">`;

  // index is redundant in this case
  answers.forEach((answer) => {
    output += `
            <div class="answer" onclick="selectAnswer(this, '${answer}')">
                ${decodeHTML(answer)}
            </div>`;
  });

  output += "</div>";
  quizContainer.innerHTML = output;
  quizContainer.classList.add("fade-in");

  submitButton.style.display = "none";
  resultContainer.style.display = "none";
}

let answerSelected = false;

function selectAnswer(selectedElement, answer) {

    if (answerSelected) return; 
    answerSelected = true;

    const answers = document.querySelectorAll('.answer');
    answers.forEach(a => a.classList.remove('selected'));
    selectedElement.classList.add('selected');


  setTimeout(() => {
    if (answer === questions[currentQuestion].correct_answer) {
      score++;
      selectedElement.classList.add("correct");
    } else {
      selectedElement.classList.add("incorrect");
      // use more descriptive variable names
      answers.forEach((answer) => {
        if (
          answer.textContent.trim() ===
          decodeHTML(questions[currentQuestion].correct_answer)
        ) {
          answer.classList.add("correct");
        }
      });
    }


        setTimeout(() => {
            currentQuestion++;
            if (currentQuestion < questions.length) {
                displayQuestion();
                answerSelected = false; 
            } else {
                displayResult();
            }
        }, 1500);
    }, 500);

}


function displayResult() {
  quizContainer.style.display = "none";
  submitButton.style.display = "none";
  retryButton.style.display = "inline-block";
  showAnswerButton.style.display = "inline-block";
  resultContainer.innerHTML = `You scored ${score} out of ${questions.length}!`;
  resultContainer.style.display = "block";
  resultContainer.classList.add("fade-in");
}

retryButton.addEventListener("click", () => {
  currentQuestion = 0;
  score = 0;
  quizContainer.style.display = "block";
  retryButton.style.display = "none";
  showAnswerButton.style.display = "none";
  resultContainer.style.display = "none";
  loadQuiz();
});

showAnswerButton.addEventListener("click", () => {
  quizContainer.innerHTML = questions
    .map(
      (question, index) => `
        <div class="question-review">
            <p><strong>Question ${index + 1}:</strong> ${decodeHTML(
        question.question
      )}</p>
            <p><strong>Correct Answer:</strong> ${decodeHTML(
              question.correct_answer
            )}</p>
        </div>
    `
    )
    .join("");
  quizContainer.style.display = "block";
  quizContainer.classList.add("fade-in");
});

loadQuiz();
