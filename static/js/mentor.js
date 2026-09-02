/* =========================================================
   AI STUDENT MENTOR
   AI PROJECT MENTOR JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const chatBody =
        document.getElementById("chatBody");

    const chatInput =
        document.getElementById("chatInput");

    const sendBtn =
        document.getElementById("sendBtn");

    const clearChatBtn =
        document.getElementById("clearChatBtn");

    const quickQuestions =
        document.querySelectorAll(
            ".quick-questions button"
        );


    /* =====================================================
       SEND MESSAGE
    ====================================================== */

    function sendMessage(message) {

        message = message.trim();


        if (message === "") {
            return;
        }


        addUserMessage(message);


        chatInput.value = "";

        resizeTextarea();


        setTimeout(() => {

            addAIMessage(
                generateResponse(message)
            );

        }, 700);

    }


    /* =====================================================
       USER MESSAGE
    ====================================================== */

    function addUserMessage(message) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "message user-message";


        wrapper.innerHTML = `

            <div class="message-avatar">
                Y
            </div>

            <div class="message-content">

                <span class="message-name">
                    You
                </span>

                <div class="message-bubble">
                    ${escapeHTML(message)}
                </div>

            </div>

        `;


        chatBody.appendChild(wrapper);


        scrollChatToBottom();

    }


    /* =====================================================
       AI MESSAGE
    ====================================================== */

    function addAIMessage(message) {

        const wrapper =
            document.createElement("div");

        wrapper.className =
            "message ai-message";


        wrapper.innerHTML = `

            <div class="message-avatar">
                ✦
            </div>

            <div class="message-content">

                <span class="message-name">
                    AI Mentor
                </span>

                <div class="message-bubble">
                    ${message}
                </div>

            </div>

        `;


        chatBody.appendChild(wrapper);


        scrollChatToBottom();

    }


    /* =====================================================
       BASIC AI RESPONSE
    ====================================================== */

    function generateResponse(message) {

        const text =
            message.toLowerCase();


        if (
            text.includes("structure") ||
            text.includes("architecture")
        ) {

            return `

                A good structure for your AI Student Mentor
                project would separate the application into
                frontend, backend, database and AI components.

                <br><br>

                <strong>Suggested flow:</strong>

                <br>

                User → Flask Backend → AI/API → Database → UI

                <br><br>

                Keep each major feature as a separate module
                so the project remains easy to maintain.

            `;

        }


        if (
            text.includes("technology") ||
            text.includes("technologies") ||
            text.includes("tech stack")
        ) {

            return `

                For your project, a suitable technology stack
                could be:

                <br><br>

                <strong>Frontend:</strong>
                HTML, CSS, JavaScript

                <br>

                <strong>Backend:</strong>
                Python + Flask

                <br>

                <strong>Database:</strong>
                MySQL

                <br>

                <strong>AI:</strong>
                LLM / OpenAI API

                <br><br>

                This keeps the architecture practical for a
                BCA-level AI project.

            `;

        }


        if (
            text.includes("improve") ||
            text.includes("better")
        ) {

            return `

                To improve your project, focus on three areas:

                <br><br>

                1. Make every module useful and connected.

                <br>

                2. Add proper database storage for student
                progress and project information.

                <br>

                3. Make the AI responses specific to the
                student's project rather than generic.

                <br><br>

                A strong project should demonstrate both
                functionality and a clear problem-solving purpose.

            `;

        }


        if (
            text.includes("step") ||
            text.includes("implementation")
        ) {

            return `

                I recommend implementing the project in this order:

                <br><br>

                <strong>1.</strong> Design the database

                <br>

                <strong>2.</strong> Create Flask routes

                <br>

                <strong>3.</strong> Complete the frontend modules

                <br>

                <strong>4.</strong> Connect frontend with Flask

                <br>

                <strong>5.</strong> Integrate the AI API

                <br>

                <strong>6.</strong> Test each module

                <br>

                <strong>7.</strong> Connect the complete workflow

                <br><br>

                This approach makes debugging much easier.

            `;

        }


        if (
            text.includes("database") ||
            text.includes("mysql")
        ) {

            return `

                For MySQL, you can organize your database
                around students, projects, roadmap progress,
                modules and interactions.

                <br><br>

                Start with the core student and project tables,
                then add module-specific tables as the project
                grows.

            `;

        }


        if (
            text.includes("debug") ||
            text.includes("error") ||
            text.includes("bug")
        ) {

            return `

                I can help you debug it.

                <br><br>

                Send me:

                <br>

                • The error message

                <br>

                • The relevant HTML/CSS/JS/Python code

                <br>

                • What you expected to happen

                <br>

                • What actually happened

                <br><br>

                Then we can identify the problem step by step.

            `;

        }


        return `

            That's a good project question.

            <br><br>

            For the AI Student Mentor project, I recommend
            breaking the problem into smaller parts first.

            <br><br>

            Tell me whether you need help with the
            <strong>frontend, Flask backend, MySQL database,
            AI integration, project architecture or a specific
            error</strong>, and I can guide you from there.

        `;

    }


    /* =====================================================
       QUICK QUESTIONS
    ====================================================== */

    quickQuestions.forEach(button => {

        button.addEventListener("click", () => {

            const question =
                button.dataset.question;

            sendMessage(question);

        });

    });


    /* =====================================================
       SEND BUTTON
    ====================================================== */

    sendBtn.addEventListener("click", () => {

        sendMessage(
            chatInput.value
        );

    });


    /* =====================================================
       ENTER TO SEND
    ====================================================== */

    chatInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Enter" &&
                !event.shiftKey
            ) {

                event.preventDefault();

                sendMessage(
                    chatInput.value
                );

            }

        }
    );


    /* =====================================================
       AUTO RESIZE TEXTAREA
    ====================================================== */

    chatInput.addEventListener(
        "input",
        resizeTextarea
    );


    function resizeTextarea() {

        chatInput.style.height = "auto";

        chatInput.style.height =
            Math.min(
                chatInput.scrollHeight,
                100
            ) + "px";

    }


    /* =====================================================
       CLEAR CHAT
    ====================================================== */

    clearChatBtn.addEventListener(
        "click",
        () => {

            chatBody.innerHTML = `

                <div class="message ai-message">

                    <div class="message-avatar">
                        ✦
                    </div>

                    <div class="message-content">

                        <span class="message-name">
                            AI Mentor
                        </span>

                        <div class="message-bubble">

                            Hello! I'm your AI Project Mentor.

                            <br><br>

                            What would you like to work on today?

                        </div>

                    </div>

                </div>

            `;

        }
    );


    /* =====================================================
       PROJECT TOOLS
    ====================================================== */

    const toolItems =
        document.querySelectorAll(".tool-item");

    const toolModal =
        document.getElementById("toolModal");

    const closeToolModal =
        document.getElementById("closeToolModal");

    const modalTitle =
        document.getElementById("modalTitle");

    const modalDescription =
        document.getElementById("modalDescription");

    const modalInput =
        document.getElementById("modalInput");

    const modalActionBtn =
        document.getElementById("modalActionBtn");


    const toolData = {

        idea: {

            title: "Project Ideas",

            description:
                "Tell me your interests, skills or preferred domain and I will help you explore suitable project ideas."

        },

        architecture: {

            title: "System Architecture",

            description:
                "Describe your project and I will help you break it into components, modules and a logical system flow."

        },

        technology: {

            title: "Technology Selection",

            description:
                "Tell me what you want to build and I will help you select suitable frontend, backend, database and AI technologies."

        },

        debug: {

            title: "Debug My Project",

            description:
                "Paste your error or describe the problem. Include the relevant code whenever possible."

        }

    };


    toolItems.forEach(tool => {

        tool.addEventListener("click", () => {

            const type =
                tool.dataset.tool;

            const data =
                toolData[type];


            modalTitle.textContent =
                data.title;

            modalDescription.textContent =
                data.description;

            modalInput.value = "";

            modalInput.placeholder =
                getPlaceholder(type);


            toolModal.classList.add(
                "show"
            );

            setTimeout(() => {

                modalInput.focus();

            }, 200);

        });

    });


    function getPlaceholder(type) {

        if (type === "idea") {

            return "Example: I want to build an AI project for college students...";

        }

        if (type === "architecture") {

            return "Describe your project and its main features...";

        }

        if (type === "technology") {

            return "Example: I want to build a Flask-based AI application...";

        }

        if (type === "debug") {

            return "Paste the error message or describe the problem...";

        }

        return "Tell me what you need help with...";

    }


    /* =====================================================
       MODAL ACTION
    ====================================================== */

    modalActionBtn.addEventListener(
        "click",
        () => {

            const input =
                modalInput.value.trim();


            if (input === "") {

                modalInput.focus();

                return;

            }


            toolModal.classList.remove(
                "show"
            );


            sendMessage(input);

            chatInput.focus();

        }
    );


    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    closeToolModal.addEventListener(
        "click",
        () => {

            toolModal.classList.remove(
                "show"
            );

        }
    );


    toolModal.addEventListener(
        "click",
        event => {

            if (
                event.target === toolModal
            ) {

                toolModal.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =====================================================
       VIEW ROADMAP
    ====================================================== */

    const viewRoadmapBtn =
        document.getElementById(
            "viewRoadmapBtn"
        );


    viewRoadmapBtn.addEventListener(
        "click",
        () => {

            window.location.href =
                "/roadmap";

        }
    );


    /* =====================================================
       AI SUGGESTION
    ====================================================== */

    const suggestionBtn =
        document.getElementById(
            "suggestionBtn"
        );


    suggestionBtn.addEventListener(
        "click",
        () => {

            sendMessage(
                "Review my current project architecture and tell me what I should improve."
            );

        }
    );


    /* =====================================================
       NOTIFICATIONS
    ====================================================== */

    const notificationBtn =
        document.getElementById(
            "notificationBtn"
        );

    const notificationPopup =
        document.getElementById(
            "notificationPopup"
        );


    notificationBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            notificationPopup.classList.toggle(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
                !notificationPopup.contains(
                    event.target
                ) &&
                !notificationBtn.contains(
                    event.target
                )
            ) {

                notificationPopup.classList.remove(
                    "show"
                );

            }

        }
    );


    /* =====================================================
       SCROLL CHAT
    ====================================================== */

    function scrollChatToBottom() {

        chatBody.scrollTo({

            top: chatBody.scrollHeight,

            behavior: "smooth"

        });

    }


    /* =====================================================
       ESCAPE HTML
    ====================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent = text;

        return div.innerHTML;

    }


    /* =====================================================
       INITIAL LOAD
    ====================================================== */

    console.log(
        "AI Student Mentor - Project Mentor loaded."
    );

});