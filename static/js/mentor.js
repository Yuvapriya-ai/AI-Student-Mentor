/* =========================================================
   AI STUDENT MENTOR
   AI PROJECT MENTOR JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       STUDENT IDENTITY
    ====================================================== */

    function getInitial(name) {

        if (!name || name.trim() === "") {
            return "Y";
        }

        return name.trim().charAt(0).toUpperCase();
    }


    /* =====================================================
       LOAD STUDENT PROFILE FROM MYSQL
    ====================================================== */

    async function loadStudentProfile() {

        try {

            const response =
                await fetch("/api/profile");

            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success ||
                !data.profile
            ) {

                console.error(
                    "Could not load student profile."
                );

                return;
            }


            const profile =
                data.profile;


            const name =
                profile.name &&
                profile.name.trim()
                    ? profile.name.trim()
                    : "Student";


            const initial =
                getInitial(name);


            /* -------------------------------------------------
               TOP RIGHT PROFILE
            ------------------------------------------------- */

            const topAvatar =
                document.querySelector(".top-avatar");

            if (topAvatar) {

                topAvatar.textContent =
                    initial;

            }


            const topProfileName =
                document.querySelector(
                    ".top-profile strong"
                );

            if (topProfileName) {

                topProfileName.textContent =
                    name;

            }


            /* -------------------------------------------------
               SIDEBAR PROFILE
            ------------------------------------------------- */

            const sidebarAvatar =
                document.querySelector(".user-avatar");

            if (sidebarAvatar) {

                sidebarAvatar.textContent =
                    initial;

            }


            const sidebarName =
                document.querySelector(
                    ".user-details strong"
                );

            if (sidebarName) {

                sidebarName.textContent =
                    name;

            }


            console.log(
                "Mentor profile loaded from MySQL:",
                profile
            );


        } catch (error) {

            console.error(
                "Mentor profile loading error:",
                error
            );

        }

    }


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

    async function sendMessage(message) {

        message = message.trim();


        if (message === "") {
            return;
        }


        addUserMessage(message);


        chatInput.value = "";


        resizeTextarea();


        try {

            const response =
                await fetch("/api/mentor", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({
                        message: message
                    })

                });


            const data =
                await response.json();


            if (!response.ok || !data.success) {

                throw new Error(
                    data.error ||
                    "Something went wrong."
                );

            }


            /*
             * Gemini is instructed to return plain text.
             * We escape the response first for safety,
             * then convert only line breaks into <br>.
             */

            const cleanResponse =
                cleanAIResponse(
                    data.response || ""
                );


            addAIMessage(
                cleanResponse
            );


        } catch (error) {

            console.error(
                "Mentor API Error:",
                error
            );


            addAIMessage(`
                Sorry, I couldn't connect to the AI Mentor right now.
                <br><br>
                Please try again in a moment.
            `);

        }

    }


    /* =====================================================
       CLEAN AI RESPONSE
    ====================================================== */

    function cleanAIResponse(text) {

        if (!text) {
            return "";
        }


        let cleaned =
            String(text).trim();


        /*
         * Remove accidental Markdown bold markers.
         */

        cleaned =
            cleaned.replace(/\*\*/g, "");


        /*
         * Remove accidental Markdown inline code markers.
         */

        cleaned =
            cleaned.replace(/`/g, "");


        /*
         * Remove escaped Markdown code fence characters.
         */

        cleaned =
            cleaned.replace(/\\```/g, "");


        /*
         * Remove unnecessary backslashes before
         * punctuation that sometimes appear in AI output.
         */

        cleaned =
            cleaned.replace(/\\([.,!?])/g, "$1");


        /*
         * Convert Windows line endings to normal line endings.
         */

        cleaned =
            cleaned.replace(/\r\n/g, "\n");


        /*
         * Escape HTML so AI output cannot inject HTML.
         */

        cleaned =
            escapeHTML(cleaned);


        /*
         * Convert line breaks into chat-friendly HTML.
         */

        cleaned =
            cleaned.replace(/\n/g, "<br>");


        return cleaned;

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
                ${getCurrentUserInitial()}
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
       CURRENT USER INITIAL
    ====================================================== */

    function getCurrentUserInitial() {

        const sidebarName =
            document.querySelector(
                ".user-details strong"
            );


        if (
            sidebarName &&
            sidebarName.textContent.trim()
        ) {

            return getInitial(
                sidebarName.textContent
            );

        }


        return "Y";

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

    if (sendBtn && chatInput) {

        sendBtn.addEventListener("click", () => {

            sendMessage(
                chatInput.value
            );

        });

    }


    /* =====================================================
       ENTER TO SEND
    ====================================================== */

    if (chatInput) {

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

    }


    /* =====================================================
       AUTO RESIZE TEXTAREA
    ====================================================== */

    if (chatInput) {

        chatInput.addEventListener(
            "input",
            resizeTextarea
        );

    }


    function resizeTextarea() {

        if (!chatInput) {
            return;
        }


        chatInput.style.height =
            "auto";


        chatInput.style.height =
            Math.min(
                chatInput.scrollHeight,
                100
            ) + "px";

    }


    /* =====================================================
       CLEAR CHAT
    ====================================================== */

    if (clearChatBtn && chatBody) {

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

                    <div class="quick-questions">

                        <button
                            type="button"
                            data-question="How should I structure my project?"
                        >
                            How should I structure my project?
                        </button>

                        <button
                            type="button"
                            data-question="Which technologies should I use?"
                        >
                            Which technologies should I use?
                        </button>

                        <button
                            type="button"
                            data-question="How can I improve my project?"
                        >
                            How can I improve my project?
                        </button>

                        <button
                            type="button"
                            data-question="Give me project implementation steps"
                        >
                            Give me project implementation steps
                        </button>

                    </div>

                `;


                /*
                 * Reconnect quick-question buttons
                 * after clearing the chat.
                 */

                const newQuickQuestions =
                    chatBody.querySelectorAll(
                        ".quick-questions button"
                    );


                newQuickQuestions.forEach(button => {

                    button.addEventListener(
                        "click",
                        () => {

                            sendMessage(
                                button.dataset.question
                            );

                        }
                    );

                });


                scrollChatToBottom();

            }
        );

    }


    /* =====================================================
       PROJECT TOOLS
    ====================================================== */

    const toolItems =
        document.querySelectorAll(
            ".tool-item"
        );


    const toolModal =
        document.getElementById(
            "toolModal"
        );


    const closeToolModal =
        document.getElementById(
            "closeToolModal"
        );


    const modalTitle =
        document.getElementById(
            "modalTitle"
        );


    const modalDescription =
        document.getElementById(
            "modalDescription"
        );


    const modalInput =
        document.getElementById(
            "modalInput"
        );


    const modalActionBtn =
        document.getElementById(
            "modalActionBtn"
        );


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

        tool.addEventListener(
            "click",
            () => {

                const type =
                    tool.dataset.tool;


                const data =
                    toolData[type];


                if (!data) {
                    return;
                }


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

            }
        );

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

    if (modalActionBtn) {

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

    }


    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    if (closeToolModal) {

        closeToolModal.addEventListener(
            "click",
            () => {

                toolModal.classList.remove(
                    "show"
                );

            }
        );

    }


    if (toolModal) {

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

    }


    /* =====================================================
       VIEW ROADMAP
    ====================================================== */

    const viewRoadmapBtn =
        document.getElementById(
            "viewRoadmapBtn"
        );


    if (viewRoadmapBtn) {

        viewRoadmapBtn.addEventListener(
            "click",
            () => {

                window.location.href =
                    "/roadmap";

            }
        );

    }


    /* =====================================================
       AI SUGGESTION
    ====================================================== */

    const suggestionBtn =
        document.getElementById(
            "suggestionBtn"
        );


    if (suggestionBtn) {

        suggestionBtn.addEventListener(
            "click",
            () => {

                sendMessage(
                    "Review my current project architecture and tell me what I should improve."
                );

            }
        );

    }


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


    if (
        notificationBtn &&
        notificationPopup
    ) {

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

    }


    /* =====================================================
       SCROLL CHAT
    ====================================================== */

    function scrollChatToBottom() {

        if (!chatBody) {
            return;
        }


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


        div.textContent =
            text;


        return div.innerHTML;

    }


    /* =====================================================
       INITIAL LOAD
    ====================================================== */

    loadStudentProfile();


    console.log(
        "AI Student Mentor - Project Mentor loaded."
    );

});