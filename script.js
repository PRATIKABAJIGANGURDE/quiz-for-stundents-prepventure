class Quiz {
    constructor() {
        // This is your correct API URL
        this.DASHBOARD_API = 'https://quizdashboard-prepventure.onrender.com/api';
        this.init();
    }

    async init() {
        try {
            console.log('Quiz initialization started...');
            const urlParams = new URLSearchParams(window.location.search);
            this.exerciseId = urlParams.get('exerciseId');
            
            console.log('Exercise ID from URL:', this.exerciseId);
            
            if (!this.exerciseId) {
                throw new Error('No exercise ID provided!');
            }

            await this.loadExerciseData();
        } catch (error) {
            console.error('Initialization error:', error);
            this.showError(`Failed to initialize quiz: ${error.message}`);
        }
    }

    async loadExerciseData() {
        try {
            // Log the full URL we're trying to access
            const exerciseUrl = `${this.DASHBOARD_API}/exercises/${this.exerciseId}`;
            console.log('Fetching from:', exerciseUrl);

            const response = await fetch(exerciseUrl);
            console.log('Response status:', response.status);

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Data received:', data);

            // Store the exercise data
            this.exercise = data;
            
            // Check if questions exist in the correct path
            if (data.questions) {
                this.questions = data.questions;
            } else if (data.exercise && data.exercise.questions) {
                this.questions = data.exercise.questions;
            } else {
                console.error('Data structure:', data);
                throw new Error('Questions not found in exercise data');
            }

            if (!this.questions || this.questions.length === 0) {
                throw new Error('No questions found in this exercise');
            }

            this.setupQuiz();
        } catch (error) {
            console.error('Error:', error);
            this.showError(error.message);
        }
    }

    setupQuiz() {
        // Set initial quiz state
        this.currentQuestionIndex = 0;
        this.score = 0;

        // Display quiz title if available
        if (this.exercise.title) {
            document.getElementById('quizTitle').textContent = this.exercise.title;
        }

        // Start displaying questions
        this.displayQuestion();
    }

    displayQuestion() {
        const question = this.questions[this.currentQuestionIndex];
        const questionContainer = document.getElementById('questionContainer');
        
        questionContainer.innerHTML = `
            <div class="question">
                <p>${question.question || question.text}</p>
                <div class="options">
                    ${this.createOptionsHTML(question.options)}
                </div>
            </div>
        `;
    }

    createOptionsHTML(options) {
        // Handle both array and object formats of options
        if (Array.isArray(options)) {
            return options.map((option, index) => `
                <button onclick="quiz.checkAnswer('${index}')">${option}</button>
            `).join('');
        } else {
            return Object.entries(options).map(([key, value]) => `
                <button onclick="quiz.checkAnswer('${key}')">${value}</button>
            `).join('');
        }
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
        const percentage = (this.score / this.questions.length) * 100;
        const container = document.getElementById('questionContainer');
        
        container.innerHTML = `
            <div class="results">
                <h2>Quiz Complete!</h2>
                <p>Your score: ${this.score}/${this.questions.length} (${percentage.toFixed(1)}%)</p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        `;
    }

    showError(message) {
        document.getElementById('questionContainer').innerHTML = `
            <div class="error-message">
                <h2>Error Loading Quiz</h2>
                <p>${message}</p>
                <p>Exercise ID: ${this.exerciseId}</p>
                <button onclick="location.reload()">Try Again</button>
            </div>
        `;
    }
}

// Initialize quiz when document is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing quiz...');
    window.quiz = new Quiz();
});