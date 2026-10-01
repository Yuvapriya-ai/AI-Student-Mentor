/* =========================================================
   AI STUDY ASSISTANT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ===================================================== */

    const questionInput =
        document.getElementById("studyQuestion");

    const askButton =
        document.getElementById("askStudyBtn");

    const clearButton =
        document.getElementById("clearStudyBtn");

    const responseArea =
        document.getElementById("studyResponse");

    const responseContent =
        document.getElementById("studyResponseContent");

    const responseLevel =
        document.getElementById("responseLevel");

    const levelButtons =
        document.querySelectorAll(".level-btn");

    const quickQuestions =
        document.querySelectorAll(".quick-card");

    const notificationButton =
        document.getElementById("notificationBtn");

    const notificationPopup =
        document.getElementById("notificationPopup");


    /* =====================================================
       CURRENT LEVEL
    ===================================================== */

    let selectedLevel = "basic";


    /* =====================================================
       LEVEL BUTTONS
    ===================================================== */

    levelButtons.forEach(button => {

        button.addEventListener("click", () => {

            levelButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            selectedLevel =
                button.dataset.level || "basic";

            console.log(
                "Selected study level:",
                selectedLevel
            );

            updateResponseLevel();
        });

    });


    /* =====================================================
       UPDATE RESPONSE LEVEL TEXT
    ===================================================== */

    function updateResponseLevel() {

        if (!responseLevel) {
            return;
        }

        if (selectedLevel === "basic") {

            responseLevel.textContent =
                "Basic explanation";

        } else if (selectedLevel === "intermediate") {

            responseLevel.textContent =
                "Intermediate explanation";

        } else if (selectedLevel === "advanced") {

            responseLevel.textContent =
                "Advanced explanation";
        }
    }


    /* =====================================================
       MARKDOWN FORMATTER
    ===================================================== */

    function formatMarkdown(text) {

        if (!text) {
            return "";
        }

        let html = text;

        /* Escape HTML */

        html = html
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");


        /* Code blocks */

        html = html.replace(
            /```([\s\S]*?)```/g,
            "<pre><code>$1</code></pre>"
        );


        /* Inline code */

        html = html.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


        /* Bold + italic */

        html = html.replace(
            /\*\*\*(.+?)\*\*\*/g,
            "<strong><em>$1</em></strong>"
        );


        /* Bold */

        html = html.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );


        /* Italic */

        html = html.replace(
            /\*(.+?)\*/g,
            "<em>$1</em>"
        );


        /* Headings */

        html = html.replace(
            /^### (.+)$/gm,
            "<h4>$1</h4>"
        );

        html = html.replace(
            /^## (.+)$/gm,
            "<h3>$1</h3>"
        );

        html = html.replace(
            /^# (.+)$/gm,
            "<h2>$1</h2>"
        );


        /* Numbered lists */

        html = html.replace(
            /^\d+\.\s+(.+)$/gm,
            "<li>$1</li>"
        );


        /* Bullet lists */

        html = html.replace(
            /^[-*]\s+(.+)$/gm,
            "<li>$1</li>"
        );


        /* Wrap list items */

        html = html.replace(
            /(<li>.*?<\/li>\n?)+/gs,
            "<ul>$&</ul>"
        );


        /* Horizontal rule */

        html = html.replace(
            /^(-{3,}|\*{3,}|_{3,})$/gm,
            "<hr>"
        );


        /* Paragraphs */

        html = html
            .split(/\n{2,}/)
            .map(block => {

                const trimmed =
                    block.trim();

                if (!trimmed) {
                    return "";
                }

                if (
                    trimmed.startsWith("<h2>") ||
                    trimmed.startsWith("<h3>") ||
                    trimmed.startsWith("<h4>") ||
                    trimmed.startsWith("<ul>") ||
                    trimmed.startsWith("<pre>") ||
                    trimmed.startsWith("<hr>")
                ) {
                    return trimmed;
                }

                return `
                    <p>
                        ${trimmed.replace(
                            /\n/g,
                            "<br>"
                        )}
                    </p>
                `;
            })
            .join("");

        return html;
    }


    /* =====================================================
       ASK AI
    ===================================================== */

    async function askAI(questionOverride = null) {

        const question =
            questionOverride ||
            (
                questionInput
                    ? questionInput.value.trim()
                    : ""
            );


        /* -----------------------------------------------
           VALIDATE QUESTION
        ----------------------------------------------- */

        if (!question) {

            showNotification(
                "Please enter a study question.",
                "error"
            );

            if (questionInput) {
                questionInput.focus();
            }

            return;
        }


        /* -----------------------------------------------
           UPDATE RESPONSE LEVEL
        ----------------------------------------------- */

        updateResponseLevel();


        /* -----------------------------------------------
           SHOW RESPONSE AREA
        ----------------------------------------------- */

        if (responseArea) {
            responseArea.classList.add("show");
        }


        /* -----------------------------------------------
           SHOW LOADING
        ----------------------------------------------- */

        if (askButton) {

            askButton.disabled = true;

            askButton.innerHTML =
                "<span>⏳</span> Thinking...";
        }


        if (responseContent) {

            responseContent.innerHTML = `
                <div class="study-loading">

                    <div class="loading-spinner"></div>

                    <p>
                        Preparing a
                        <strong>${selectedLevel}</strong>
                        level explanation...
                    </p>

                </div>
            `;
        }


        /* -----------------------------------------------
           SEND TO FLASK
        ----------------------------------------------- */

        try {

            const response = await fetch(
                "/api/study-assist",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        question: question,

                        /* Flask expects "difficulty" */

                        difficulty:
                            selectedLevel,

                        category:
                            "general",

                        answer_style:
                            "brief",

                        explanation_type:
                            "simple"
                    })
                }
            );


            /* -------------------------------------------
               READ JSON RESPONSE
            ------------------------------------------- */

            const data =
                await response.json();

            console.log(
                "Study Assistant API response:",
                data
            );


            /* -------------------------------------------
               SUCCESS
            ------------------------------------------- */

            if (
                response.ok &&
                data.success &&
                data.answer
            ) {

                if (responseContent) {

                    responseContent.innerHTML =
                        formatMarkdown(
                            data.answer
                        );
                }


                /*
                   IMPORTANT:
                   .study-response is hidden by default.
                   Add .show so the complete response
                   container becomes visible.
                */

                if (responseArea) {

                    responseArea.classList.add(
                        "show"
                    );
                }


                updateResponseLevel();

                console.log(
                    "Answer generated at level:",
                    selectedLevel
                );
            }


            /* -------------------------------------------
               ERROR FROM FLASK
            ------------------------------------------- */

            else {

                const errorMessage =
                    data.error ||
                    "Unable to get a response from the AI Study Assistant.";


                if (responseContent) {

                    responseContent.innerHTML = `
                        <div class="study-error">

                            <strong>
                                AI Study Assistant
                            </strong>

                            <p>
                                ${errorMessage}
                            </p>

                        </div>
                    `;
                }


                if (responseArea) {

                    responseArea.classList.add(
                        "show"
                    );
                }


                showNotification(
                    errorMessage,
                    "error"
                );
            }


        } catch (error) {

            console.error(
                "Study Assistant error:",
                error
            );


            if (responseContent) {

                responseContent.innerHTML = `
                    <div class="study-error">

                        <strong>
                            Unable to connect
                        </strong>

                        <p>
                            Please check your connection
                            and try again.
                        </p>

                    </div>
                `;
            }


            if (responseArea) {

                responseArea.classList.add(
                    "show"
                );
            }


            showNotification(
                "Unable to connect to the AI Study Assistant.",
                "error"
            );

        } finally {

            if (askButton) {

                askButton.disabled = false;

                askButton.innerHTML =
                    "<span>✦</span> Ask AI";
            }
        }
    }


    /* =====================================================
       ASK BUTTON
    ===================================================== */

    if (askButton) {

        askButton.addEventListener(
            "click",
            () => {
                askAI();
            }
        );
    }


    /* =====================================================
       ENTER KEY
    ===================================================== */

    if (questionInput) {

        questionInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    askAI();
                }
            }
        );
    }


    /* =====================================================
       QUICK QUESTIONS
    ===================================================== */

    quickQuestions.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const question =
                    card.dataset.question;

                if (!question) {
                    return;
                }

                if (questionInput) {

                    questionInput.value =
                        question;

                    questionInput.focus();
                }
            }
        );
    });


    /* =====================================================
       NEW QUESTION
    ===================================================== */

    if (clearButton) {

        clearButton.addEventListener(
            "click",
            () => {

                if (questionInput) {

                    questionInput.value = "";

                    questionInput.focus();
                }


                if (responseContent) {

                    responseContent.innerHTML = "";
                }


                /*
                   Hide the complete response container
                   again when starting a new question.
                */

                if (responseArea) {

                    responseArea.classList.remove(
                        "show"
                    );
                }


                selectedLevel = "basic";


                levelButtons.forEach(button => {

                    button.classList.remove(
                        "active"
                    );

                    if (
                        button.dataset.level ===
                        "basic"
                    ) {

                        button.classList.add(
                            "active"
                        );
                    }
                });


                updateResponseLevel();
            }
        );
    }


    /* =====================================================
       NOTIFICATION BUTTON
    ===================================================== */

    if (
        notificationButton &&
        notificationPopup
    ) {

        notificationButton.addEventListener(
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
                    !notificationButton.contains(
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
       NOTIFICATION
    ===================================================== */

    function showNotification(
        message,
        type = "info"
    ) {

        const existing =
            document.querySelector(
                ".study-notification"
            );

        if (existing) {
            existing.remove();
        }


        const notification =
            document.createElement("div");

        notification.className =
            `study-notification ${type}`;


        notification.innerHTML = `
            <span>${message}</span>
        `;


        document.body.appendChild(
            notification
        );


        setTimeout(() => {

            notification.classList.add(
                "show"
            );

        }, 50);


        setTimeout(() => {

            notification.classList.remove(
                "show"
            );


            setTimeout(() => {

                notification.remove();

            }, 300);

        }, 3000);
    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    updateResponseLevel();

    console.log(
        "AI Study Assistant initialized."
    );

});