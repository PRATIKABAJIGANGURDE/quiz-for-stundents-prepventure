class Quiz {
    constructor() {
        this.DASHBOARD_API = 'https://dashboard-for-prepventure.onrender.com/api';
        this.init();
    }

    async init() {
        // Get exerciseId from URL
        const urlParams = new URLSearchParams(window.location.search);
        this.exerciseId = urlParams.get('exerciseId');
        
        if (!this.exerciseId) {
            alert('No exercise ID provided!');
            return;
        }

        await this.loadExerciseData();
    }

    async loadExerciseData() {
        try {
            // First fetch exercise details
            const exerciseResponse = await fetch(`${this.DASHBOARD_API}/exercises/${this.exerciseId}`);
            if (!exerciseResponse.ok) throw new Error('Failed to load exercise');
            this.exercise = await exerciseResponse.json();

            // Then fetch questions for this exercise
            const questionsResponse = await fetch(`${this.DASHBOARD_API}/exercises/${this.exerciseId}/questions`);
            if (!questionsResponse.ok) throw new Error('Failed to load questions');
            this.questions = await questionsResponse.json();

            // Setup quiz with fetched data
            this.setupQuiz();
        } catch (error) {
            console.error('Error loading quiz data:', error);
        }
    }

    setupQuiz() {
        // Display exercise info
        document.getElementById('quizTitle').textContent = 
            `${this.exercise.subject} - Chapter ${this.exercise.chapter} - Exercise ${this.exercise.exerciseNumber}`;
        
        // Set timer if specified
        if (this.exercise.timerMinutes) {
            this.startTimer(this.exercise.timerMinutes * 60);
        }

        // Display first question
        this.currentQuestionIndex = 0;
        this.score = 0;
        this.displayQuestion();
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        const questionContainer = document.getElementById('questionContainer');
        
        questionContainer.innerHTML = `
            <div class="question">
                <p>${question.text}</p>
                ${question.imageUrl ? `<img src="${this.DASHBOARD_API}${question.imageUrl}" alt="Question Image">` : ''}
                <div class="options">
                    <button onclick="quiz.checkAnswer('A')">${question.options.A}</button>
                    <button onclick="quiz.checkAnswer('B')">${question.options.B}</button>
                    <button onclick="quiz.checkAnswer('C')">${question.options.C}</button>
                    <button onclick="quiz.checkAnswer('D')">${question.options.D}</button>
                </div>
            </div>
        `;
    }

    checkAnswer(selectedAnswer) {
        const question = this.questions[this.currentQuestionIndex];
        if (selectedAnswer === question.correctAnswer) {
            this.score++;
        }

        this.currentQuestionIndex++;
        if (this.currentQuestionIndex < this.questions.length) {
            this.displayQuestion();
        } else {
            this.showResults();
        }
    }

    showResults() {
        const container = document.getElementById('questionContainer');
        const percentage = (this.score / this.questions.length) * 100;
        
        container.innerHTML = `
            <div class="results">
                <h2>Quiz Complete!</h2>
                <p>Your score: ${this.score}/${this.questions.length} (${percentage.toFixed(1)}%)</p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        `;
    }

    startTimer(seconds) {
        const timerDisplay = document.getElementById('timer');
        let timeLeft = seconds;

        this.timer = setInterval(() => {
            const minutes = Math.floor(timeLeft / 60);
            const secs = timeLeft % 60;
            timerDisplay.textContent = `${minutes}:${secs.toString().padStart(2, '0')}`;

            if (timeLeft === 0) {
                clearInterval(this.timer);
                this.showResults();
            }
            timeLeft--;
        }, 1000);
    }
}

// Initialize quiz
const quiz = new Quiz();