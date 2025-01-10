class Quiz {
    constructor() {
        // Make sure this URL matches your deployed dashboard API
        this.DASHBOARD_API = 'https://quizdashboard-prepventure.onrender.com/api';
        this.testAPIConnection();  // Add API connection test
        this.init();
    }

    // Add API connection test method
    async testAPIConnection() {
        try {
            const response = await fetch(`${this.DASHBOARD_API}/exercises/test`);
            const data = await response.json();
            console.log('API Test Response:', data);
            
            if (!response.ok) {
                throw new Error('API test failed');
            }
        } catch (error) {
            console.error('API Connection Test Failed:', error);
            this.showError('Cannot connect to quiz database. Please try again later.');
        }
    }

    // Add error display method
    showError(message) {
        document.getElementById('questionContainer').innerHTML = `
            <div class="error-message" style="text-align: center; padding: 20px;">
                <h2>Error</h2>
                <p>${message}</p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        `;
    }

    async init() {
        try {
            console.log('Quiz initialization started...');
            const urlParams = new URLSearchParams(window.location.search);
            this.exerciseId = urlParams.get('exerciseId');
            
            console.log('Exercise ID from URL:', this.exerciseId);
            
            if (!this.exerciseId) {
                alert('No exercise ID provided!');
                return;
            }

            await this.loadExerciseData();
        } catch (error) {
            console.error('Initialization error:', error);
            document.getElementById('questionContainer').innerHTML = `
                <div class="error-message" style="text-align: center; padding: 20px;">
                    <h2>Error Loading Quiz</h2>
                    <p>Error details: ${error.message}</p>
                    <p>Exercise ID: ${this.exerciseId}</p>
                    <button onclick="location.reload()">Try Again</button>
                </div>
            `;
        }
    }

    async loadExerciseData() {
        try {
            const exerciseUrl = `${this.DASHBOARD_API}/exercises/${this.exerciseId}`;
            console.log('Attempting to fetch exercise from:', exerciseUrl);

            const exerciseResponse = await fetch(exerciseUrl);
            console.log('Exercise Response Status:', exerciseResponse.status);
            
            if (!exerciseResponse.ok) {
                const errorText = await exerciseResponse.text();
                console.error('Exercise Response Error:', errorText);
                throw new Error(`Failed to load exercise (${exerciseResponse.status})`);
            }
            
            this.exercise = await exerciseResponse.json();
            console.log('Exercise Data Received:', this.exercise);

            if (!this.exercise.questions || this.exercise.questions.length === 0) {
                throw new Error('No questions found for this exercise');
            }

            this.questions = this.exercise.questions;
            console.log('Questions Data:', this.questions);

            this.setupQuiz();
        } catch (error) {
            console.error('Error in loadExerciseData:', error);
            this.showError(`Failed to load quiz data: ${error.message}`);
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

// Initialize quiz and make it globally available
let quiz;
document.addEventListener('DOMContentLoaded', () => {
    console.log('Document loaded, initializing quiz...');
    quiz = new Quiz();
});