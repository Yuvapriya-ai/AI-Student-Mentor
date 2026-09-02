/* =========================================================
   AI STUDENT MENTOR
   STUDY ASSISTANT JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const questionInput =
        document.getElementById("questionInput");

    const questionCategory =
        document.getElementById("questionCategory");

    const difficultyLevel =
        document.getElementById("difficultyLevel");

    const answerStyle =
        document.getElementById("answerStyle");

    const explanationType =
        document.getElementById("explanationType");

    const characterCount =
        document.getElementById("characterCount");

    const askQuestionBtn =
        document.getElementById("askQuestionBtn");

    const questionCount =
        document.getElementById("questionCount");

    const emptyState =
        document.getElementById("emptyState");

    const generatedAnswer =
        document.getElementById("generatedAnswer");

    const answerTitle =
        document.getElementById("answerTitle");

    const answerContent =
        document.getElementById("answerContent");

    const answerWordCount =
        document.getElementById("answerWordCount");

    const copyAnswerBtn =
        document.getElementById("copyAnswerBtn");

    const clearAnswerBtn =
        document.getElementById("clearAnswerBtn");

    const notificationBtn =
        document.getElementById("notificationBtn");

    const notificationPopup =
        document.getElementById("notificationPopup");

    const studyTipButton =
        document.getElementById("studyTipButton");


    /* =====================================================
       STATE
    ===================================================== */

    let totalQuestions = 0;


    /* =====================================================
       CHARACTER COUNTER
    ===================================================== */

    if (questionInput) {

        questionInput.addEventListener("input", function () {

            const count = questionInput.value.length;

            characterCount.textContent =
                `${count} characters`;

        });

    }


    /* =====================================================
       ASK QUESTION
    ===================================================== */

    if (askQuestionBtn) {

        askQuestionBtn.addEventListener("click", async function () {

            const question =
                questionInput.value.trim();

            if (!question) {

                showNotification(
                    "Please enter a question first."
                );

                questionInput.focus();

                return;
            }


            /* Increase question count */

            totalQuestions++;

            questionCount.textContent =
                totalQuestions;


            /* Loading state */

            askQuestionBtn.disabled = true;

            askQuestionBtn.innerHTML = `
                <span class="ask-icon">⟳</span>
                Thinking...
            `;


            try {

                /*
                 * Try Flask backend first.
                 *
                 * If your backend route exists,
                 * the response will be used.
                 *
                 * Otherwise the built-in answer
                 * generator will be used.
                 */

                const response = await fetch(
                    "/api/study-assistant",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            question: question,

                            category:
                                questionCategory.value,

                            difficulty:
                                difficultyLevel.value,

                            answer_style:
                                answerStyle.value,

                            explanation_type:
                                explanationType.value

                        })
                    }
                );


                if (response.ok) {

                    const data =
                        await response.json();

                    if (data.answer) {

                        displayAnswer(
                            question,
                            data.answer
                        );

                    } else {

                        displayAnswer(
                            question,
                            generateLocalAnswer(
                                question
                            )
                        );

                    }

                } else {

                    displayAnswer(
                        question,
                        generateLocalAnswer(
                            question
                        )
                    );

                }

            } catch (error) {

                /*
                 * Backend not connected.
                 * Use local fallback instead of
                 * displaying a JavaScript error.
                 */

                displayAnswer(
                    question,
                    generateLocalAnswer(
                        question
                    )
                );

            }


            /* Restore button */

            askQuestionBtn.disabled = false;

            askQuestionBtn.innerHTML = `
                <span class="ask-icon">✦</span>
                Ask AI Assistant
                <span class="arrow">→</span>
            `;

        });

    }


    /* =====================================================
       DISPLAY ANSWER
    ===================================================== */

    function displayAnswer(question, answer) {

        emptyState.style.display = "none";

        generatedAnswer.style.display = "block";


        answerTitle.textContent =
            createAnswerTitle(question);


        answerContent.innerHTML =
            formatAnswer(answer);


        updateWordCount(answer);


        /*
         * Scroll answer area to top
         */

        const preview =
            document.getElementById("answerPreview");

        if (preview) {

            preview.scrollTop = 0;

        }

    }


    /* =====================================================
       ANSWER TITLE
    ===================================================== */

    function createAnswerTitle(question) {

        const category =
            questionCategory.value;

        const titles = {

            general:
                "Project Explanation",

            module:
                "Project Module Explanation",

            technology:
                "Technology Explanation",

            database:
                "Database Explanation",

            ai:
                "AI / LLM Explanation",

            implementation:
                "Implementation Explanation",

            architecture:
                "Project Architecture",

            learning:
                "Learning Explanation"

        };

        return titles[category] ||
               "Project Explanation";
    }


    /* =====================================================
       FORMAT ANSWER
    ===================================================== */

    function formatAnswer(text) {

        /*
         * Escape HTML first so normal user/API
         * text cannot inject HTML.
         */

        const escaped =
            escapeHTML(text);


        /*
         * Convert simple markdown-like formatting
         */

        let formatted =
            escaped.replace(
                /\*\*(.*?)\*\*/g,
                "<strong>$1</strong>"
            );


        /*
         * Convert numbered lines
         */

        formatted =
            formatted.replace(
                /^(\d+)\.\s+(.*)$/gm,
                "<p><strong>$1.</strong> $2</p>"
            );


        /*
         * Convert headings
         */

        formatted =
            formatted.replace(
                /^###\s+(.*)$/gm,
                "<h3>$1</h3>"
            );


        /*
         * Convert remaining paragraphs
         */

        formatted =
            formatted
                .split(/\n\s*\n/)
                .map(function (paragraph) {

                    if (
                        paragraph.trim().startsWith("<h3>") ||
                        paragraph.trim().startsWith("<p>")
                    ) {

                        return paragraph;

                    }

                    return `<p>${paragraph
                        .replace(/\n/g, "<br>")}</p>`;

                })
                .join("");


        return formatted;

    }


    /* =====================================================
       LOCAL ANSWER GENERATOR
    ===================================================== */

    function generateLocalAnswer(question) {

        const category =
            questionCategory.value;

        const difficulty =
            difficultyLevel.value;

        const style =
            answerStyle.value;

        const explanation =
            explanationType.value;


        let answer = "";


        if (category === "module") {

            answer = `
The AI Student Mentor project contains eight core modules.

1. Student Profile Management – manages student academic details, skills and interests.

2. Learning Roadmap – provides a personalized learning path based on the student's goals.

3. AI Project Mentor – helps students select or create projects and provides technology stack, project structure, database requirements and development guidance.

4. Documentation Assistant – generates synopsis, abstract, introduction, problem statement, objectives, methodology, module descriptions, conclusion and future enhancements.

5. Project Viva Assistant – generates project-specific viva questions and model answers, including basic, technical, module, AI/LLM, database and implementation questions.

6. AI Project Question Assistant – allows students to ask questions about project modules, technologies, database, AI concepts, implementation and architecture.

7. Project Progress Tracker – manages tasks and milestones and calculates project completion percentage.

8. AI Project Idea Evaluator – evaluates originality, difficulty, technologies, complexity, AI feasibility and suitability for a BCA project.
`;

        } else if (category === "technology") {

            answer = `
The AI Student Mentor uses HTML, CSS and JavaScript for the frontend.

Python and Flask are used for backend development.

MySQL is used as the database for storing student information, project-related data and progress.

For artificial intelligence, the system uses a Large Language Model through the OpenAI API.

Visual Studio Code is used as the development environment.
`;

        } else if (category === "database") {

            answer = `
MySQL is used as the database of the AI Student Mentor system.

Student information, academic details, technical skills and project progress can be stored in MySQL.

The Flask backend communicates with MySQL to store and retrieve structured application data.

The database provides persistent storage so that information does not disappear when the application is restarted.

For a project explanation, the important concept to remember is:

Frontend → Flask Backend → MySQL Database

The AI-related request flow can be represented as:

Frontend → Flask → OpenAI API → AI Response → Frontend
`;

        } else if (category === "ai") {

            answer = `
The AI functionality of the AI Student Mentor is based on a Large Language Model and the OpenAI API.

The student enters a question or request through the frontend.

The Flask backend receives the request and prepares a structured prompt.

The request is sent to the OpenAI API.

The LLM processes the prompt and generates a response.

The response is then returned to the Flask backend and displayed on the frontend.

The simplified flow is:

Student → Frontend → Flask → OpenAI API → LLM Processing → Flask → Frontend
`;

        } else if (category === "implementation") {

            answer = `
The implementation uses a three-layer structure.

Frontend:
HTML, CSS and JavaScript are responsible for the user interface and interaction.

Backend:
Python and Flask handle application logic, routing and communication with external AI services.

Database:
MySQL stores persistent student and project-related information.

The OpenAI API is integrated with the Flask backend so that AI-generated responses can be processed and displayed in the frontend.
`;

        } else if (category === "architecture") {

            answer = `
The AI Student Mentor follows a frontend-backend-database architecture with AI integration.

The frontend is developed using HTML, CSS and JavaScript.

The backend is developed using Python and Flask.

MySQL is used for persistent data storage.

The OpenAI API provides access to the Large Language Model.

The general architecture is:

Student
↓
Frontend Interface
↓
Flask Backend
↓
MySQL Database / OpenAI API
↓
AI Processing
↓
Personalized Response
↓
Frontend
`;

        } else if (category === "learning") {

            answer = `
The best way to study a project concept is to understand its purpose, implementation and relationship with the other components.

For every concept, try to understand:

1. What it is.
2. Why it is used.
3. How it is implemented.
4. Where it is used in the project.
5. How it communicates with other components.

For example, if you study Flask, understand that it is the Python backend framework used to handle routes, application logic and communication between the frontend, database and AI services.
`;

        } else {

            answer = `
The AI Student Mentor is an integrated platform designed to provide students with learning and academic project guidance.

It combines learning guidance, project development, documentation, viva preparation, project-related question answering, progress tracking and project idea evaluation.

The main technologies are HTML, CSS, JavaScript, Python, Flask, MySQL, a Large Language Model and the OpenAI API.

The purpose of the system is to provide personalized AI-based assistance throughout the student's project development process.
`;

        }


        /*
         * Modify response based on selected style.
         */

        if (style === "brief") {

            answer =
                answer.substring(
                    0,
                    Math.min(answer.length, 950)
                );

        }


        /*
         * Add difficulty guidance.
         */

        if (difficulty === "advanced") {

            answer += `

For an advanced understanding, focus on the interaction between the Flask backend, MySQL database and OpenAI API, including request processing, data flow, API communication and system integration.
`;

        }


        /*
         * Academic style note.
         */

        if (explanation === "academic") {

            answer += `

From an academic perspective, this concept should be explained by clearly identifying its purpose, implementation, role within the system and contribution to the overall functionality of the AI Student Mentor.
`;

        }


        if (explanation === "simple") {

            answer += `

In simple terms, remember what the component does, why the project needs it and how it connects with the other parts of the system.
`;

        }


        if (explanation === "technical") {

            answer += `

Technically, the component should be understood in terms of its data flow, API interaction, backend processing, database communication and frontend response handling.
`;

        }


        return answer.trim();

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    /* =====================================================
       WORD COUNT
    ===================================================== */

    function updateWordCount(text) {

        const cleanText =
            text.trim();

        if (!cleanText) {

            answerWordCount.textContent =
                "0 words";

            return;

        }

        const words =
            cleanText.split(/\s+/).length;

        answerWordCount.textContent =
            `${words} words`;

    }


    /* =====================================================
       QUICK QUESTIONS
    ===================================================== */

    const quickCards =
        document.querySelectorAll(".quick-card");


    quickCards.forEach(function (card) {

        card.addEventListener("click", function () {

            const question =
                card.dataset.question;

            questionInput.value =
                question;


            characterCount.textContent =
                `${question.length} characters`;


            /*
             * Automatically select suitable category
             */

            const text =
                question.toLowerCase();


            if (text.includes("module")) {

                questionCategory.value =
                    "module";

            } else if (
                text.includes("mysql") ||
                text.includes("database")
            ) {

                questionCategory.value =
                    "database";

            } else if (
                text.includes("openai") ||
                text.includes("llm") ||
                text.includes("ai")
            ) {

                questionCategory.value =
                    "ai";

            } else if (
                text.includes("architecture") ||
                text.includes("workflow")
            ) {

                questionCategory.value =
                    "architecture";

            }


            questionInput.focus();

            /*
             * Scroll smoothly to question panel.
             */

            document.querySelector(
                ".question-card"
            ).scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        });

    });


    /* =====================================================
       COPY ANSWER
    ===================================================== */

    if (copyAnswerBtn) {

        copyAnswerBtn.addEventListener(
            "click",
            async function () {

                const text =
                    answerContent.innerText.trim();

                if (!text) {

                    showNotification(
                        "There is no answer to copy."
                    );

                    return;

                }


                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    showNotification(
                        "Answer copied successfully."
                    );

                } catch (error) {

                    showNotification(
                        "Unable to copy the answer."
                    );

                }

            }
        );

    }


    /* =====================================================
       CLEAR ANSWER
    ===================================================== */

    if (clearAnswerBtn) {

        clearAnswerBtn.addEventListener(
            "click",
            function () {

                generatedAnswer.style.display =
                    "none";

                emptyState.style.display =
                    "flex";

                answerContent.innerHTML =
                    "";

                answerTitle.textContent =
                    "Project Explanation";

                answerWordCount.textContent =
                    "0 words";

            }
        );

    }


    /* =====================================================
       NOTIFICATION
    ===================================================== */

    if (notificationBtn) {

        notificationBtn.addEventListener(
            "click",
            function () {

                notificationPopup.classList.toggle(
                    "show"
                );

            }
        );

    }


    /* =====================================================
       CLOSE NOTIFICATION
    ===================================================== */

    document.addEventListener(
        "click",
        function (event) {

            if (
                notificationPopup &&
                notificationBtn &&
                !notificationPopup.contains(event.target) &&
                !notificationBtn.contains(event.target)
            ) {

                notificationPopup.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =====================================================
       SHOW NOTIFICATION
    ===================================================== */

    function showNotification(message) {

        if (!notificationPopup) {
            return;
        }

        const paragraph =
            notificationPopup.querySelector("p");

        if (paragraph) {

            paragraph.textContent =
                message;

        }

        notificationPopup.classList.add(
            "show"
        );


        setTimeout(function () {

            notificationPopup.classList.remove(
                "show"
            );

        }, 3000);

    }


    /* =====================================================
       STUDY TIP BUTTON
    ===================================================== */

    if (studyTipButton) {

        studyTipButton.addEventListener(
            "click",
            function () {

                questionInput.value =
                    "Explain the overall architecture and workflow of the AI Student Mentor project.";

                characterCount.textContent =
                    `${questionInput.value.length} characters`;

                questionCategory.value =
                    "architecture";

                difficultyLevel.value =
                    "intermediate";

                answerStyle.value =
                    "detailed";

                explanationType.value =
                    "academic";


                questionInput.focus();


                document.querySelector(
                    ".question-card"
                ).scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }
        );

    }


    /* =====================================================
       ENTER KEY SUPPORT
    ===================================================== */

    if (questionInput) {

        questionInput.addEventListener(
            "keydown",
            function (event) {

                /*
                 * Ctrl + Enter or
                 * Shift + Enter sends question.
                 */

                if (
                    event.key === "Enter" &&
                    (event.ctrlKey || event.shiftKey)
                ) {

                    event.preventDefault();

                    askQuestionBtn.click();

                }

            }
        );

    }

});