/* =========================================================
   AI STUDENT MENTOR
   LEARNING ROADMAP JAVASCRIPT
========================================================= */


/* =========================================================
   STUDENT PROFILE
========================================================= */

function getInitial(name) {

    if (!name || name.trim() === "") {
        return "Y";
    }

    return name.trim().charAt(0).toUpperCase();
}


async function loadStudentProfile() {

    try {

        const response = await fetch("/api/profile");
        const data = await response.json();

        if (!response.ok || !data.success || !data.profile) {

            console.error(
                "Could not load student profile."
            );

            return;
        }

        const profile = data.profile;

        const name =
            profile.name &&
            profile.name.trim()
                ? profile.name.trim()
                : "Student";

        const initial = getInitial(name);


        /* =================================================
           TOP-RIGHT PROFILE
        ================================================= */

        const topAvatar =
            document.querySelector(".top-avatar");

        if (topAvatar) {
            topAvatar.textContent = initial;
        }


        const topProfileName =
            document.querySelector(".top-profile strong");

        if (topProfileName) {
            topProfileName.textContent = name;
        }


        /* =================================================
           SIDEBAR PROFILE
        ================================================= */

        const sidebarAvatar =
            document.querySelector(".user-avatar");

        if (sidebarAvatar) {
            sidebarAvatar.textContent = initial;
        }


        const sidebarName =
            document.querySelector(".user-details strong");

        if (sidebarName) {
            sidebarName.textContent = name;
        }


        console.log(
            "Roadmap profile loaded from MySQL:",
            profile
        );

    } catch (error) {

        console.error(
            "Roadmap profile loading error:",
            error
        );

    }
}


/* =========================================================
   AI RESPONSE MARKDOWN FORMATTER
========================================================= */

function escapeHtml(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


function formatAiResponse(markdown) {

    if (!markdown) {
        return "";
    }


    const normalizedText =
        String(markdown)
            .replace(/\r\n/g, "\n")
            .replace(/\r/g, "\n")
            .trim();


    const lines =
        normalizedText.split("\n");


    let html = "";
    let paragraphLines = [];
    let listItems = [];


    function flushParagraph() {

        if (paragraphLines.length === 0) {
            return;
        }

        const paragraph =
            paragraphLines
                .join(" ")
                .trim();


        if (paragraph) {

            html += `
                <p class="ai-paragraph">
                    ${formatInlineMarkdown(paragraph)}
                </p>
            `;

        }

        paragraphLines = [];

    }


    function flushList() {

        if (listItems.length === 0) {
            return;
        }

        html += `
            <ul class="ai-response-list">
                ${listItems
                    .map(item => `
                        <li>
                            ${formatInlineMarkdown(item)}
                        </li>
                    `)
                    .join("")}
            </ul>
        `;

        listItems = [];

    }


    lines.forEach(line => {

        const trimmed =
            line.trim();


        /* EMPTY LINE */

        if (!trimmed) {

            flushParagraph();
            flushList();

            return;
        }


        /* HORIZONTAL RULE */

        if (
            /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed)
        ) {

            flushParagraph();
            flushList();

            html += "<hr>";

            return;
        }


        /* HEADINGS */

        const headingMatch =
            trimmed.match(/^#{1,6}\s+(.+)$/);


        if (headingMatch) {

            flushParagraph();
            flushList();

            const headingText =
                headingMatch[1].trim();

            html += `
                <h4>
                    ${formatInlineMarkdown(headingText)}
                </h4>
            `;

            return;
        }


        /* BULLET LIST */

        const bulletMatch =
            trimmed.match(/^[-*+]\s+(.+)$/);


        if (bulletMatch) {

            flushParagraph();

            listItems.push(
                bulletMatch[1].trim()
            );

            return;
        }


        /* NUMBERED LIST */

        const numberedMatch =
            trimmed.match(/^\d+\.\s+(.+)$/);


        if (numberedMatch) {

            flushParagraph();

            listItems.push(
                numberedMatch[1].trim()
            );

            return;
        }


        /* NORMAL TEXT */

        flushList();

        paragraphLines.push(trimmed);

    });


    flushParagraph();
    flushList();


    return html;
}


/* =========================================================
   INLINE MARKDOWN FORMATTER
========================================================= */

function formatInlineMarkdown(text) {

    let safeText =
        escapeHtml(text);


    /* BOLD + ITALIC */

    safeText =
        safeText.replace(
            /\*\*\*(.+?)\*\*\*/g,
            "<strong><em>$1</em></strong>"
        );


    /* BOLD */

    safeText =
        safeText.replace(
            /\*\*(.+?)\*\*/g,
            "<strong>$1</strong>"
        );


    safeText =
        safeText.replace(
            /__(.+?)__/g,
            "<strong>$1</strong>"
        );


    /* ITALIC */

    safeText =
        safeText.replace(
            /\*(.+?)\*/g,
            "<em>$1</em>"
        );


    safeText =
        safeText.replace(
            /_(.+?)_/g,
            "<em>$1</em>"
        );


    /* INLINE CODE */

    safeText =
        safeText.replace(
            /`([^`]+)`/g,
            "<code>$1</code>"
        );


    return safeText;
}


/* =========================================================
   AI RESPONSE HELPERS
========================================================= */

function showAiThinking(element) {

    if (!element) {
        return;
    }

    element.classList.add("ai-thinking");

    element.textContent =
        "Thinking...";
}


function showAiResponse(element, response) {

    if (!element) {
        return;
    }

    element.classList.remove("ai-thinking");

    element.innerHTML =
        formatAiResponse(response);

    element.scrollTop = 0;
}


function showAiError(element, message) {

    if (!element) {
        return;
    }

    element.classList.remove("ai-thinking");

    element.innerHTML = `
        <p class="ai-paragraph">
            ${escapeHtml(message)}
        </p>
    `;
}


/* =========================================================
   PAGE INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


    /* =====================================================
       FILTERS
    ====================================================== */

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const modules =
        document.querySelectorAll(".roadmap-module");


    filterButtons.forEach(button => {

        button.addEventListener("click", () => {

            filterButtons.forEach(btn => {
                btn.classList.remove("active");
            });

            button.classList.add("active");


            const filter =
                button.dataset.filter;


            modules.forEach(module => {

                const status =
                    module.dataset.status;


                if (
                    filter === "all" ||
                    filter === status
                ) {

                    module.classList.remove("hidden");

                } else {

                    module.classList.add("hidden");

                }

            });

        });

    });


    /* =====================================================
       MODULE BUTTONS
    ====================================================== */

    const moduleButtons =
        document.querySelectorAll(".module-btn");


    moduleButtons.forEach(button => {

        button.addEventListener("click", () => {

            const moduleNumber =
                button.dataset.module;


            if (
                button.classList.contains("locked-btn")
            ) {

                showNotification(
                    "Complete the current module before unlocking this module."
                );

                return;
            }


            if (moduleNumber === "3") {

                const currentTopics =
                    document.querySelector(
                        ".current-topics"
                    );


                if (currentTopics) {

                    currentTopics.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });

                }

            } else {

                showNotification(
                    `Module ${moduleNumber} is already completed.`
                );

            }

        });

    });


    /* =====================================================
       CURRENT TOPIC CHECKBOXES
    ====================================================== */

    const topicChecks =
        document.querySelectorAll(
            ".current-topics .topic-check"
        );


    topicChecks.forEach((check, index) => {

        check.addEventListener("click", () => {

            if (
                !check.classList.contains("done")
            ) {

                check.classList.add("done");

                check.textContent = "✓";

                updateCurrentModuleProgress();

                saveTopicState(index);

            }

        });

    });


    /* =====================================================
       SAVE TOPIC STATE
    ====================================================== */

    async function saveTopicState(index) {

        const currentTopicChecks =
            document.querySelectorAll(
                ".current-topics .topic-check"
            );


        const topicCheck =
            currentTopicChecks[index];


        if (!topicCheck) {
            return;
        }


        const topicRow =
            topicCheck.closest(".topic-row");


        if (!topicRow) {
            return;
        }


        const topicName =
            topicRow
                .querySelector("span")
                .textContent
                .trim();


        try {

            const response =
                await fetch("/api/roadmap", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        module_number: 3,
                        topic_name: topicName
                    })

                });


            const data =
                await response.json();


            if (!data.success) {

                showNotification(
                    data.message ||
                    "Failed to save roadmap progress."
                );

                return;

            }


            showNotification(
                "Progress saved successfully."
            );


        } catch (error) {

            console.error(
                "ROADMAP SAVE ERROR:",
                error
            );


            showNotification(
                "Could not save progress. Please try again."
            );

        }

    }


    /* =====================================================
       LOAD TOPIC STATE
    ====================================================== */

    async function loadTopicState() {

        try {

            const response =
                await fetch("/api/roadmap");


            const data =
                await response.json();


            if (!data.success) {

                console.error(
                    "Failed to load roadmap progress:",
                    data.message
                );

                return;

            }


            topicChecks.forEach(check => {

                const topicRow =
                    check.closest(".topic-row");


                if (!topicRow) {
                    return;
                }


                const topicName =
                    topicRow
                        .querySelector("span")
                        .textContent
                        .trim();


                const completed =
                    data.completed_topics.some(
                        topic =>
                            topic.module_number === 3 &&
                            topic.topic_name === topicName &&
                            topic.completed === 1
                    );


                if (completed) {

                    check.classList.add("done");

                    check.textContent = "✓";

                }

            });


            updateCurrentModuleProgress();


        } catch (error) {

            console.error(
                "ROADMAP LOAD ERROR:",
                error
            );

        }

    }


    /* =====================================================
       UPDATE CURRENT MODULE
    ====================================================== */

    function updateCurrentModuleProgress() {

        const completed =
            document.querySelectorAll(
                ".current-topics .topic-check.done"
            ).length;


        const total =
            document.querySelectorAll(
                ".current-topics .topic-check"
            ).length;


        if (total === 0) {
            return;
        }


        /*
         * Keep the existing roadmap percentage logic.
         * The 68% represents the current overall roadmap
         * progress already defined for the project.
         */

        const percentage = 68;


        const progressBar =
            document.querySelector(
                ".current-card .progress-bar"
            );


        const progressNumber =
            document.querySelector(
                ".current-card .progress-info strong"
            );


        const topicCount =
            document.querySelector(
                ".topic-heading span"
            );


        if (progressBar) {

            progressBar.style.width =
                percentage + "%";

        }


        if (progressNumber) {

            progressNumber.textContent =
                percentage + "%";

        }


        if (topicCount) {

            topicCount.textContent =
                `${completed} / ${total} completed`;

        }


        /* =========================================
           OVERALL ROADMAP PROGRESS
        ========================================== */

        const overallPercentage = 68;


        const overallNumber =
            document.getElementById(
                "overallPercent"
            );


        const overallBar =
            document.getElementById(
                "overallProgressBar"
            );


        if (overallNumber) {

            overallNumber.textContent =
                overallPercentage + "%";

        }


        if (overallBar) {

            overallBar.style.width =
                overallPercentage + "%";

        }

    }


    /* =====================================================
       AI MENTOR MODAL
    ====================================================== */

    const aiRoadmapBtn =
        document.getElementById(
            "aiRoadmapBtn"
        );


    const aiModal =
        document.getElementById(
            "aiModal"
        );


    const closeAiModal =
        document.getElementById(
            "closeAiModal"
        );


    if (aiRoadmapBtn) {

        aiRoadmapBtn.addEventListener(
            "click",
            () => {

                if (aiModal) {

                    aiModal.classList.add("show");

                }

            }
        );

    }


    if (closeAiModal) {

        closeAiModal.addEventListener(
            "click",
            () => {

                if (aiModal) {

                    aiModal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    if (aiModal) {

        aiModal.addEventListener(
            "click",
            event => {

                if (
                    event.target === aiModal
                ) {

                    aiModal.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    /* =====================================================
       AI ROADMAP OPTIONS
    ====================================================== */

    const aiOptions =
        document.querySelectorAll(
            ".ai-options button"
        );


    aiOptions.forEach(option => {

        option.addEventListener(
            "click",
            async () => {

                const message =
                    option.textContent.trim();


                const aiRoadmapResponse =
                    document.getElementById(
                        "aiRoadmapResponse"
                    );


                const aiRoadmapResponseContent =
                    document.getElementById(
                        "aiRoadmapResponseContent"
                    );


                /* =========================================
                   SHOW RESPONSE AREA
                ========================================== */

                if (aiModal) {

                    aiModal.classList.add("show");

                }


                if (
                    aiRoadmapResponse &&
                    aiRoadmapResponseContent
                ) {

                    aiRoadmapResponse.classList.add(
                        "show"
                    );

                    showAiThinking(
                        aiRoadmapResponseContent
                    );

                }


                /* =========================================
                   DISABLE OPTIONS WHILE LOADING
                ========================================== */

                aiOptions.forEach(button => {
                    button.disabled = true;
                });


                showNotification(
                    "Your AI Mentor is preparing your roadmap guidance..."
                );


                /* =========================================
                   SEND REQUEST TO BACKEND
                ========================================== */

                try {

                    const response =
                        await fetch(
                            "/api/roadmap-ai",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({
                                    message: message
                                })
                            }
                        );


                    const data =
                        await response.json();


                    /* =====================================
                       SUCCESS
                    ====================================== */

                    if (
                        response.ok &&
                        data.success &&
                        data.response
                    ) {

                        showNotification(
                            "AI Roadmap guidance received."
                        );


                        showAiResponse(
                            aiRoadmapResponseContent,
                            data.response
                        );


                    } else {

                        const errorMessage =
                            data.error ||
                            "Unable to get AI roadmap guidance.";


                        showAiError(
                            aiRoadmapResponseContent,
                            errorMessage
                        );


                        showNotification(
                            errorMessage
                        );

                    }


                } catch (error) {

                    console.error(
                        "Roadmap AI Error:",
                        error
                    );


                    showAiError(
                        aiRoadmapResponseContent,
                        "Unable to connect to the AI Roadmap Mentor."
                    );


                    showNotification(
                        "Unable to connect to the AI Roadmap Mentor."
                    );

                } finally {

                    aiOptions.forEach(button => {
                        button.disabled = false;
                    });

                }

            }
        );

    });


    /* =====================================================
       NEXT STEP
    ====================================================== */

    const nextStepBtn =
        document.getElementById(
            "nextStepBtn"
        );


    if (nextStepBtn) {

        nextStepBtn.addEventListener(
            "click",
            () => {

                const target =
                    document.querySelector(
                        ".current-topics .topic-check:not(.done)"
                    );


                if (target) {

                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "center"
                    });


                    target.parentElement.classList.add(
                        "highlight-topic"
                    );


                    setTimeout(() => {

                        target.parentElement.classList.remove(
                            "highlight-topic"
                        );

                    }, 1800);

                }

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
       NOTIFICATION HELPER
    ====================================================== */

    function showNotification(message) {

        const notification =
            document.createElement("div");


        notification.className =
            "roadmap-toast";


        notification.textContent =
            message;


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
       ANIMATE SUMMARY PROGRESS
    ===================================================== */

    const overallProgress =
        document.getElementById(
            "overallProgressBar"
        );


    if (overallProgress) {

        const target =
            overallProgress.style.width ||
            "68%";


        overallProgress.style.width =
            "0%";


        setTimeout(() => {

            overallProgress.style.width =
                target;

        }, 300);

    }


    /* =====================================================
       INITIALIZE
    ===================================================== */

    loadStudentProfile();

    loadTopicState();


    console.log(
        "AI Student Mentor - Learning Roadmap loaded."
    );

});

