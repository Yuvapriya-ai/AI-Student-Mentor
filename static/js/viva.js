const vivaQuestions = {

    project: {
        easy: [
            {
                question: "What is the main purpose of the AI Student Mentor project?",
                answer: "The main purpose of AI Student Mentor is to help BCA students with project development, learning guidance, documentation, viva preparation, study assistance, progress tracking and project idea evaluation."
            },
            {
                question: "What type of application is AI Student Mentor?",
                answer: "AI Student Mentor is an AI-based web application designed to assist students throughout their academic project development process."
            },
            {
                question: "Who are the main users of this system?",
                answer: "The main users are students, especially students working on academic projects who need guidance, documentation assistance and viva preparation."
            },
            {
                question: "What are the major modules of AI Student Mentor?",
                answer: "The system contains Student Profile Management, Learning Roadmap, AI Project Mentor, Documentation Assistant, Project Viva Assistant, AI Study Assistant, Project Progress Tracker and AI Project Idea Evaluator."
            },
            {
                question: "Why was this project developed?",
                answer: "The project was developed to provide students with a centralized AI-powered platform for guidance and support during different stages of their academic project."
            }
        ],

        medium: [
            {
                question: "How does AI Student Mentor help students during project development?",
                answer: "It provides project guidance, learning roadmaps, documentation support, viva preparation, study assistance, progress tracking and project idea evaluation through different modules."
            },
            {
                question: "What problem does AI Student Mentor attempt to solve?",
                answer: "It attempts to reduce the difficulty students face in finding guidance and managing different project-related activities by bringing these facilities into one AI-based system."
            },
            {
                question: "How are the different modules connected to the overall system?",
                answer: "The modules address different stages of project development while operating as parts of one integrated AI Student Mentor platform."
            },
            {
                question: "What makes the project different from a normal student management system?",
                answer: "The project incorporates AI-based assistance for project guidance, documentation, viva preparation, study questions and project idea evaluation rather than only storing student information."
            },
            {
                question: "What future enhancements can be added to the project?",
                answer: "Future enhancements can include more advanced AI capabilities, improved personalization, additional academic assistance features and expanded project analysis capabilities."
            }
        ],

        hard: [
            {
                question: "Explain the overall workflow of the AI Student Mentor system.",
                answer: "The student provides relevant information and interacts with the required module. The system processes the input, uses the appropriate application logic and AI assistance, and provides the corresponding guidance, generated content, evaluation or tracking information."
            },
            {
                question: "How can AI improve the effectiveness of an academic project mentor?",
                answer: "AI can provide personalized guidance, generate relevant questions or content, analyze project information and give suggestions based on the student's requirements."
            },
            {
                question: "What are the limitations of an AI-based project mentor?",
                answer: "AI-generated responses may not always be completely accurate or contextually perfect, so students should verify important technical and academic information."
            }
        ]
    },


    python: {
        easy: [
            {
                question: "What is Python?",
                answer: "Python is a high-level, interpreted programming language known for its simple syntax and wide range of applications."
            },
            {
                question: "Why is Python suitable for AI applications?",
                answer: "Python has a simple syntax and provides many libraries and frameworks useful for artificial intelligence, machine learning and data processing."
            },
            {
                question: "What is a Python function?",
                answer: "A function is a reusable block of code designed to perform a particular task."
            },
            {
                question: "What is a Python module?",
                answer: "A Python module is a file containing Python code such as functions, classes and variables that can be imported into another program."
            },
            {
                question: "What is exception handling in Python?",
                answer: "Exception handling allows a program to handle runtime errors using mechanisms such as try, except, else and finally."
            }
        ],

        medium: [
            {
                question: "What is the difference between a list and a tuple in Python?",
                answer: "A list is mutable, meaning its elements can be changed after creation, while a tuple is immutable."
            },
            {
                question: "What is object-oriented programming in Python?",
                answer: "Object-oriented programming is a programming approach based on objects and classes that allows code to be organized using concepts such as encapsulation, inheritance and polymorphism."
            },
            {
                question: "What is the purpose of import in Python?",
                answer: "The import statement allows code from another module or package to be used in the current Python program."
            },
            {
                question: "What is a dictionary in Python?",
                answer: "A dictionary is a mutable collection that stores data as key-value pairs."
            },
            {
                question: "Why is exception handling important?",
                answer: "It prevents unexpected runtime errors from terminating the application abruptly and allows the program to respond appropriately to errors."
            }
        ],

        hard: [
            {
                question: "Explain the difference between interpreted and compiled programming languages in the context of Python.",
                answer: "Python is generally described as an interpreted language because Python programs are executed through the Python interpreter. Python source code is first converted into bytecode, which is then executed by the Python virtual machine."
            },
            {
                question: "How does object-oriented programming improve project organization?",
                answer: "OOP organizes related data and behavior into classes and objects, making large applications easier to structure, maintain and extend."
            },
            {
                question: "Why is modular programming useful in a project like AI Student Mentor?",
                answer: "Modular programming separates functionality into different components, making the application easier to develop, test, maintain and extend."
            }
        ]
    },


    flask: {
        easy: [
            {
                question: "What is Flask?",
                answer: "Flask is a lightweight Python web framework used to build web applications."
            },
            {
                question: "Why is Flask used in this project?",
                answer: "Flask is used to connect the Python backend with the web interface and handle application routes and requests."
            },
            {
                question: "What is a route in Flask?",
                answer: "A route defines a URL path that the Flask application responds to and associates it with a Python function."
            },
            {
                question: "What is a template in Flask?",
                answer: "A template is an HTML file used to define the structure of a web page and can contain dynamic content."
            },
            {
                question: "What is the purpose of the static folder?",
                answer: "The static folder is commonly used to store CSS, JavaScript, images and other static files used by the web application."
            }
        ],

        medium: [
            {
                question: "How does Flask connect the frontend and backend?",
                answer: "Flask handles browser requests through routes, executes backend Python logic and returns HTML templates or other responses to the frontend."
            },
            {
                question: "What is Jinja2 in Flask?",
                answer: "Jinja2 is the template engine used by Flask to generate dynamic HTML pages using template expressions and control structures."
            },
            {
                question: "What is the purpose of url_for()?",
                answer: "url_for() generates URLs for Flask routes and helps avoid hard-coding route paths in templates."
            },
            {
                question: "What is the difference between GET and POST requests?",
                answer: "GET is commonly used to request or retrieve data, while POST is commonly used to submit data to the server."
            }
        ],

        hard: [
            {
                question: "Explain the request-response cycle in a Flask application.",
                answer: "A browser sends a request to a Flask route. Flask matches the route, executes the associated Python function, processes the required logic and sends a response such as an HTML page or data back to the browser."
            },
            {
                question: "Why is a framework such as Flask useful instead of creating a web server from scratch?",
                answer: "Flask provides routing, request handling, template integration and other web-development facilities, allowing developers to focus on application functionality rather than implementing basic web-server infrastructure."
            }
        ]
    },


    ai: {
        easy: [
            {
                question: "What is Artificial Intelligence?",
                answer: "Artificial Intelligence is a field of computer science focused on creating systems that can perform tasks that normally require human intelligence."
            },
            {
                question: "What is an AI assistant?",
                answer: "An AI assistant is a software system that uses artificial intelligence to understand user input and provide useful responses or assistance."
            },
            {
                question: "How is AI used in AI Student Mentor?",
                answer: "AI is used to provide project guidance, generate documentation or viva-related content, answer study questions and evaluate project ideas."
            },
            {
                question: "What is an LLM?",
                answer: "An LLM, or Large Language Model, is an AI model trained on large amounts of text data to understand and generate human-like language."
            },
            {
                question: "What is an AI prompt?",
                answer: "A prompt is the instruction or input provided to an AI model to guide the response it generates."
            }
        ],

        medium: [
            {
                question: "What is the role of an LLM in an AI-based application?",
                answer: "An LLM can understand natural-language input and generate relevant text responses, making it useful for conversational and content-generation features."
            },
            {
                question: "What is prompt engineering?",
                answer: "Prompt engineering is the process of designing effective instructions or prompts to obtain useful and relevant outputs from an AI model."
            },
            {
                question: "What is the difference between AI and traditional rule-based software?",
                answer: "Traditional rule-based software primarily follows explicitly programmed rules, while AI systems can use learned patterns or language models to handle more flexible and complex inputs."
            },
            {
                question: "Why should AI-generated answers be verified?",
                answer: "AI models can sometimes generate incorrect or incomplete information, so important technical and academic answers should be verified."
            }
        ],

        hard: [
            {
                question: "How can hallucination affect an AI Student Mentor application?",
                answer: "AI hallucination can cause the system to produce information that sounds convincing but is incorrect or unsupported. Therefore, important project and academic information should be verified."
            },
            {
                question: "How would you improve the reliability of an AI-powered mentor?",
                answer: "Reliability can be improved through better prompts, controlled inputs, validation, relevant project context, appropriate model selection and verification of important outputs."
            }
        ]
    },


    database: {
        easy: [
            {
                question: "What is a database?",
                answer: "A database is an organized collection of data that can be stored, accessed and managed efficiently."
            },
            {
                question: "What is MySQL?",
                answer: "MySQL is a relational database management system that uses SQL to store and manage structured data."
            },
            {
                question: "What is SQL?",
                answer: "SQL stands for Structured Query Language and is used to create, retrieve, update and manage data in relational databases."
            },
            {
                question: "What is a table?",
                answer: "A table is a database structure consisting of rows and columns used to store related data."
            },
            {
                question: "What is a primary key?",
                answer: "A primary key is a column or set of columns that uniquely identifies each record in a table."
            }
        ],

        medium: [
            {
                question: "Why is MySQL suitable for a student project?",
                answer: "MySQL is a relational database system that can efficiently store structured application data and supports SQL operations required by web applications."
            },
            {
                question: "What is a foreign key?",
                answer: "A foreign key is a column that creates a relationship between tables by referencing a primary key or unique key in another table."
            },
            {
                question: "What is normalization?",
                answer: "Normalization is the process of organizing database tables to reduce unnecessary data duplication and improve data integrity."
            },
            {
                question: "What is CRUD?",
                answer: "CRUD represents Create, Read, Update and Delete, the four basic operations commonly performed on stored data."
            }
        ],

        hard: [
            {
                question: "Why should an application use a relational database instead of storing all information in separate files?",
                answer: "A relational database provides structured storage, relationships between data, querying capabilities, constraints and better management of application data compared with unstructured file storage."
            },
            {
                question: "How can database security be improved in a Flask application?",
                answer: "Security can be improved through input validation, parameterized queries, secure authentication practices, proper access control and protection of sensitive database credentials."
            }
        ]
    },


    frontend: {
        easy: [
            {
                question: "What is HTML?",
                answer: "HTML stands for HyperText Markup Language and is used to structure content on web pages."
            },
            {
                question: "What is CSS?",
                answer: "CSS stands for Cascading Style Sheets and is used to control the appearance and layout of web pages."
            },
            {
                question: "What is JavaScript?",
                answer: "JavaScript is a programming language commonly used to add interactivity and dynamic behavior to web pages."
            },
            {
                question: "What is responsive design?",
                answer: "Responsive design allows a website layout to adapt to different screen sizes and devices."
            }
        ],

        medium: [
            {
                question: "Why are HTML, CSS and JavaScript used together?",
                answer: "HTML provides structure, CSS provides presentation and JavaScript provides behavior and interactivity."
            },
            {
                question: "What is the DOM?",
                answer: "The Document Object Model represents an HTML document as a structure of objects that JavaScript can access and modify."
            },
            {
                question: "How does JavaScript interact with HTML?",
                answer: "JavaScript can access HTML elements through the DOM and modify their content, attributes, styles and behavior."
            }
        ],

        hard: [
            {
                question: "How can frontend validation improve a web application?",
                answer: "Frontend validation can provide immediate feedback and prevent obviously invalid input from being submitted, although important validation must also be performed on the backend."
            },
            {
                question: "Why should CSS be separated from HTML?",
                answer: "Separating CSS from HTML improves code organization, reusability and maintainability and allows presentation to be changed without rewriting the page structure."
            }
        ]
    },


    modules: {
        easy: [
            {
                question: "What is the purpose of the Student Profile Management module?",
                answer: "It manages student-related information that can be used to personalize the AI Student Mentor experience."
            },
            {
                question: "What is the purpose of the Learning Roadmap module?",
                answer: "It provides students with a structured learning path to help them understand what they should learn and work on."
            },
            {
                question: "What does the AI Project Mentor module do?",
                answer: "It provides AI-based guidance to students regarding their project development."
            },
            {
                question: "What is the Documentation Assistant?",
                answer: "It assists students in preparing project-related documentation."
            },
            {
                question: "What is the purpose of the Project Viva Assistant?",
                answer: "It helps students prepare for their project viva through questions, answers and practice."
            }
        ],

        medium: [
            {
                question: "How does the Project Progress Tracker help students?",
                answer: "It allows students to track project milestones, completed tasks, pending tasks and overall project progress."
            },
            {
                question: "What is the purpose of the AI Project Idea Evaluator?",
                answer: "It evaluates project ideas based on aspects such as originality, difficulty, technologies, complexity, feasibility and suggestions."
            },
            {
                question: "How does the AI Study Assistant support students?",
                answer: "It provides a question-and-answer style assistant for project and study-related questions."
            },
            {
                question: "Why are multiple modules useful in AI Student Mentor?",
                answer: "Multiple modules separate different student needs into focused functions while keeping them within one integrated platform."
            }
        ],

        hard: [
            {
                question: "How would you integrate all eight modules into one maintainable application?",
                answer: "The application can be organized into separate frontend pages and backend functions for each module, with shared database access, common authentication or student information and clearly separated application logic."
            },
            {
                question: "Which module would be most useful during the final stage of an academic project and why?",
                answer: "The Project Viva Assistant and Project Progress Tracker are particularly useful near completion because one supports final viva preparation while the other helps ensure that project tasks and milestones are completed."
            }
        ]
    },


    implementation: {
        easy: [
            {
                question: "What is meant by project implementation?",
                answer: "Project implementation is the process of converting the project design and requirements into a working software application."
            },
            {
                question: "What is the role of the backend?",
                answer: "The backend handles application logic, data processing, database operations and communication between the frontend and other services."
            },
            {
                question: "What is the role of the frontend?",
                answer: "The frontend provides the user interface through which students interact with the application."
            }
        ],

        medium: [
            {
                question: "Why should frontend and backend responsibilities be separated?",
                answer: "Separation makes the application easier to organize, maintain, test and modify because presentation logic and application logic are handled independently."
            },
            {
                question: "How does a web application communicate with a database?",
                answer: "The backend application sends database queries or commands to retrieve or modify stored data and then uses the results to provide a response to the frontend."
            }
        ],

        hard: [
            {
                question: "What factors should be considered when designing the architecture of AI Student Mentor?",
                answer: "Important factors include modularity, maintainability, database design, security, scalability, frontend-backend communication, AI integration and reliability."
            }
        ]
    },


    future: {
        easy: [
            {
                question: "What are future enhancements?",
                answer: "Future enhancements are additional features or improvements that can be added to the system after the current version."
            },
            {
                question: "Can more AI features be added to AI Student Mentor?",
                answer: "Yes. Additional AI-powered features can be integrated to improve personalization and academic assistance."
            },
            {
                question: "Can the project be expanded for more students?",
                answer: "Yes. The system can be further developed to support more users and additional academic requirements."
            }
        ],

        medium: [
            {
                question: "How can personalization improve AI Student Mentor?",
                answer: "Personalization can allow the system to provide guidance based on a student's profile, learning requirements, project stage and progress."
            },
            {
                question: "How can the system be improved for larger usage?",
                answer: "The system can be improved through better architecture, optimized database operations, scalable deployment and efficient handling of AI requests."
            }
        ],

        hard: [
            {
                question: "What would be your first priority when scaling AI Student Mentor?",
                answer: "A major priority would be designing a reliable and scalable architecture that can efficiently handle users, database operations and AI requests while maintaining security and performance."
            }
        ]
    }
};


/* =========================================================
   DEFAULT QUESTIONS
========================================================= */

const defaultQuestions = [
    {
        question: "What is the main objective of your project?",
        answer: "The objective is to develop an AI-based student mentoring platform that provides assistance throughout different stages of academic project development."
    },
    {
        question: "Why did you select this project?",
        answer: "The project was selected to address common difficulties students face during project development and provide centralized AI-based assistance."
    },
    {
        question: "What technologies are used in your project?",
        answer: "The project uses technologies such as Python, Flask, HTML, CSS, JavaScript, MySQL and AI/LLM-based assistance."
    },
    {
        question: "What are the major modules of your project?",
        answer: "The major modules are Student Profile Management, Learning Roadmap, AI Project Mentor, Documentation Assistant, Project Viva Assistant, AI Study Assistant, Project Progress Tracker and AI Project Idea Evaluator."
    },
    {
        question: "What are the future enhancements of your project?",
        answer: "Future enhancements can include improved AI capabilities, personalization, additional academic features and better project analysis."
    }
];


/* =========================================================
   APPLICATION STATE
========================================================= */

let selectedDifficulty = "easy";

let currentQuestions = [];

let currentQuestionIndex = 0;

let questionsPracticed = 0;

let correctAnswers = 0;

let wrongAnswers = 0;


/* =========================================================
   DOM ELEMENTS
========================================================= */

const topicSelect =
    document.getElementById("viva-topic");

const questionCountSelect =
    document.getElementById("question-count");

const generateButton =
    document.getElementById("generateQuestions");

const resetButton =
    document.getElementById("resetSession");

const emptyState =
    document.getElementById("emptyState");

const questionsContainer =
    document.getElementById("questionsContainer");

const questionsPracticedElement =
    document.getElementById("questionsPracticed");

const correctAnswersElement =
    document.getElementById("correctAnswers");

const wrongAnswersElement =
    document.getElementById("wrongAnswers");

const currentScoreElement =
    document.getElementById("currentScore");

const progressCircle =
    document.querySelector(".progress-circle");

const progressPercentage =
    document.querySelector(".progress-inner strong");


/* =========================================================
   DIFFICULTY BUTTONS
========================================================= */

const difficultyButtons =
    document.querySelectorAll(".difficulty-btn");


difficultyButtons.forEach(button => {

    button.addEventListener("click", () => {

        difficultyButtons.forEach(btn => {
            btn.classList.remove("selected");
        });

        button.classList.add("selected");

        selectedDifficulty =
            button.dataset.level;

    });

});


/* =========================================================
   SHUFFLE QUESTIONS
========================================================= */

function shuffleQuestions(questions) {

    const shuffled = [...questions];

    for (
        let i = shuffled.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            shuffled[i],
            shuffled[j]
        ] = [
            shuffled[j],
            shuffled[i]
        ];

    }

    return shuffled;
}


/* =========================================================
   GET QUESTIONS
========================================================= */

function getQuestions(topic, difficulty) {

    if (
        vivaQuestions[topic] &&
        vivaQuestions[topic][difficulty]
    ) {

        return vivaQuestions[topic][difficulty];

    }

    return defaultQuestions;

}


/* =========================================================
   GENERATE QUESTIONS
========================================================= */

function generateQuestions() {

    const topic =
        topicSelect.value;

    const count =
        parseInt(
            questionCountSelect.value
        );


    let questions;


    if (!topic) {

        questions =
            defaultQuestions;

    } else {

        questions =
            getQuestions(
                topic,
                selectedDifficulty
            );

    }


    currentQuestions =
        shuffleQuestions(
            questions
        ).slice(0, count);


    currentQuestionIndex = 0;

    questionsPracticed = 0;

    correctAnswers = 0;

    wrongAnswers = 0;


    updateStats();

    renderQuestions();

}


/* =========================================================
   RENDER QUESTIONS
========================================================= */

function renderQuestions() {

    emptyState.style.display = "none";

    questionsContainer.innerHTML = "";


    if (currentQuestions.length === 0) {

        emptyState.style.display = "flex";

        return;

    }


    currentQuestions.forEach(
        (item, index) => {

            const questionCard =
                document.createElement("div");

            questionCard.className =
                "question-card";


            questionCard.dataset.index =
                index;


            questionCard.innerHTML = `

                <div class="question-number">
                    QUESTION ${index + 1}
                </div>

                <h3>
                    ${item.question}
                </h3>

                <textarea
                    class="answer-area"
                    id="answer-${index}"
                    placeholder="Type your answer here..."
                ></textarea>

                <div class="question-actions">

                    <button
                        type="button"
                        class="check-answer-btn"
                        data-index="${index}">
                        Check Answer
                    </button>

                    <button
                        type="button"
                        class="show-answer-btn"
                        data-index="${index}">
                        Show Model Answer
                    </button>

                </div>

                <div
                    class="answer-result"
                    id="result-${index}">
                </div>

                <div
                    class="model-answer"
                    id="model-answer-${index}">

                    <strong>
                        Model Answer
                    </strong>

                    <p>
                        ${item.answer}
                    </p>

                </div>

            `;


            questionsContainer.appendChild(
                questionCard
            );

        }
    );


    attachQuestionEvents();

}


/* =========================================================
   QUESTION EVENTS
========================================================= */

function attachQuestionEvents() {

    const checkButtons =
        document.querySelectorAll(
            ".check-answer-btn"
        );


    const showButtons =
        document.querySelectorAll(
            ".show-answer-btn"
        );


    checkButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const index =
                    parseInt(
                        button.dataset.index
                    );

                checkAnswer(index);

            }
        );

    });


    showButtons.forEach(button => {

        button.addEventListener(
            "click",
            () => {

                const index =
                    parseInt(
                        button.dataset.index
                    );

                showModelAnswer(index);

            }
        );

    });

}


/* =========================================================
   CHECK ANSWER
========================================================= */

function checkAnswer(index) {

    const textarea =
        document.getElementById(
            `answer-${index}`
        );


    const result =
        document.getElementById(
            `result-${index}`
        );


    const card =
        document.querySelector(
            `.question-card[data-index="${index}"]`
        );


    const answer =
        textarea.value.trim();


    if (!answer) {

        result.textContent =
            "Please enter an answer first.";

        result.className =
            "answer-result wrong";

        return;

    }


    /*
       Simple keyword-based evaluation.
       This is a frontend demonstration.
       It can later be replaced with
       backend AI evaluation.
    */

    const correctAnswer =
        currentQuestions[index].answer
            .toLowerCase();


    const userAnswer =
        answer.toLowerCase();


    const keywords =
        extractKeywords(
            correctAnswer
        );


    let matchedKeywords = 0;


    keywords.forEach(keyword => {

        if (
            userAnswer.includes(keyword)
        ) {

            matchedKeywords++;

        }

    });


    const matchPercentage =
        keywords.length > 0
            ? (
                matchedKeywords /
                keywords.length
            ) * 100
            : 0;


    card.classList.remove(
        "correct",
        "wrong"
    );


    if (matchPercentage >= 30) {

        card.classList.add(
            "correct"
        );

        result.textContent =
            "✓ Good answer! Your response contains relevant points.";

        result.className =
            "answer-result correct";


        correctAnswers++;

    } else {

        card.classList.add(
            "wrong"
        );

        result.textContent =
            "✗ Your answer may need more important points. Review the model answer.";

        result.className =
            "answer-result wrong";


        wrongAnswers++;

    }


    questionsPracticed++;


    updateStats();

}


/* =========================================================
   EXTRACT KEYWORDS
========================================================= */

function extractKeywords(text) {

    const stopWords = [

        "the",
        "is",
        "a",
        "an",
        "and",
        "of",
        "to",
        "in",
        "for",
        "on",
        "with",
        "that",
        "this",
        "it",
        "are",
        "as",
        "be",
        "can",
        "from",
        "by",
        "or",
        "which",
        "used",
        "such"

    ];


    return text
        .replace(
            /[^\w\s]/g,
            ""
        )
        .split(/\s+/)
        .filter(
            word =>
                word.length > 4 &&
                !stopWords.includes(word)
        )
        .filter(
            (word, index, array) =>
                array.indexOf(word) === index
        );

}


/* =========================================================
   SHOW MODEL ANSWER
========================================================= */

function showModelAnswer(index) {

    const modelAnswer =
        document.getElementById(
            `model-answer-${index}`
        );


    const button =
        document.querySelector(
            `.show-answer-btn[data-index="${index}"]`
        );


    if (
        modelAnswer.classList.contains(
            "show"
        )
    ) {

        modelAnswer.classList.remove(
            "show"
        );

        button.textContent =
            "Show Model Answer";

    } else {

        modelAnswer.classList.add(
            "show"
        );

        button.textContent =
            "Hide Model Answer";

    }

}


/* =========================================================
   UPDATE STATS
========================================================= */

function updateStats() {

    questionsPracticedElement.textContent =
        questionsPracticed;


    correctAnswersElement.textContent =
        correctAnswers;


    wrongAnswersElement.textContent =
        wrongAnswers;


    let score = 0;


    if (questionsPracticed > 0) {

        score =
            Math.round(
                (
                    correctAnswers /
                    questionsPracticed
                ) * 100
            );

    }


    currentScoreElement.textContent =
        `${score}%`;


    /*
       Preparation percentage:
       Based on number of questions
       practiced in the current session.
    */

    let preparation = 0;


    if (currentQuestions.length > 0) {

        preparation =
            Math.round(
                (
                    questionsPracticed /
                    currentQuestions.length
                ) * 100
            );

    }


    if (preparation > 100) {
        preparation = 100;
    }


    progressPercentage.textContent =
        `${preparation}%`;


    if (progressCircle) {

        const degrees =
            preparation * 3.6;


        progressCircle.style.background =
            `conic-gradient(
                #3b82f6 0deg,
                #4f46e5 ${degrees}deg,
                rgba(120, 160, 255, 0.10)
                ${degrees}deg
            )`;

    }

}


/* =========================================================
   RESET SESSION
========================================================= */

function resetSession() {

    currentQuestions = [];

    currentQuestionIndex = 0;

    questionsPracticed = 0;

    correctAnswers = 0;

    wrongAnswers = 0;


    questionsContainer.innerHTML = "";

    emptyState.style.display = "flex";


    updateStats();

}


/* =========================================================
   GENERATE BUTTON
========================================================= */

generateButton.addEventListener(
    "click",
    () => {

        generateButton.disabled = true;

        generateButton.innerHTML =
            `
            <span>✦</span>
            Generating Questions...
            `;


        setTimeout(() => {

            generateQuestions();


            generateButton.disabled =
                false;

            generateButton.innerHTML =
                `
                <span>✦</span>
                Generate Viva Questions
                `;


            document
                .getElementById(
                    "questionsSection"
                )
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }, 700);

    }
);


/* =========================================================
   RESET BUTTON
========================================================= */

resetButton.addEventListener(
    "click",
    () => {

        resetSession();

    }
);


/* =========================================================
   NOTIFICATION BUTTON
========================================================= */

const notificationButton =
    document.querySelector(
        ".notification-btn"
    );


if (notificationButton) {

    notificationButton.addEventListener(
        "click",
        () => {

            let popup =
                document.querySelector(
                    ".notification-popup"
                );


            if (!popup) {

                popup =
                    document.createElement(
                        "div"
                    );

                popup.className =
                    "notification-popup";


                popup.innerHTML = `

                    <strong>
                        Viva Assistant
                    </strong>

                    <p>
                        Select a topic and difficulty
                        level to start your viva
                        preparation.
                    </p>

                `;


                document.body.appendChild(
                    popup
                );

            }


            popup.classList.toggle(
                "show"
            );

        }
    );

}


/* =========================================================
   CLOSE NOTIFICATION WHEN CLICKING OUTSIDE
========================================================= */

document.addEventListener(
    "click",
    event => {

        const popup =
            document.querySelector(
                ".notification-popup"
            );


        if (
            popup &&
            !event.target.closest(
                ".notification-btn"
            ) &&
            !event.target.closest(
                ".notification-popup"
            )
        ) {

            popup.classList.remove(
                "show"
            );

        }

    }
);


/* =========================================================
   INITIAL STATE
========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        updateStats();

        emptyState.style.display =
            "flex";

        questionsContainer.innerHTML =
            "";

    }
);

