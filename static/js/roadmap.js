/* =========================================================
   AI STUDENT MENTOR
   LEARNING ROADMAP JAVASCRIPT
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
                button.classList.contains(
                    "locked-btn"
                )
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
            ".topic-check"
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

    function saveTopicState(index) {

        let completedTopics =
            JSON.parse(
                localStorage.getItem(
                    "roadmapTopics"
                )
            ) || [];


        if (
            !completedTopics.includes(index)
        ) {

            completedTopics.push(index);

        }


        localStorage.setItem(
            "roadmapTopics",
            JSON.stringify(completedTopics)
        );

    }


    /* =====================================================
       LOAD TOPIC STATE
    ====================================================== */

    function loadTopicState() {

        const completedTopics =
            JSON.parse(
                localStorage.getItem(
                    "roadmapTopics"
                )
            ) || [];


        topicChecks.forEach((check, index) => {

            if (
                completedTopics.includes(index)
            ) {

                check.classList.add("done");

                check.textContent = "✓";

            }

        });


        updateCurrentModuleProgress();

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


        const percentage =
            Math.round(
                (completed / total) * 100
            );


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

                aiModal.classList.add("show");

            }
        );

    }


    if (closeAiModal) {

        closeAiModal.addEventListener(
            "click",
            () => {

                aiModal.classList.remove(
                    "show"
                );

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
       AI OPTIONS
    ====================================================== */

    const aiOptions =
        document.querySelectorAll(
            ".ai-options button"
        );


    aiOptions.forEach(option => {

        option.addEventListener(
            "click",
            () => {

                const message =
                    option.textContent.trim();


                aiModal.classList.remove(
                    "show"
                );


                showNotification(
                    `"${message}" will be handled by your AI Mentor.`
                );

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
       ADD TOAST STYLE
    ====================================================== */

    const toastStyle =
        document.createElement("style");


    toastStyle.textContent = `

        .roadmap-toast {

            position: fixed;

            right: 25px;

            bottom: 25px;

            max-width: 320px;

            padding: 13px 16px;

            border-radius: 10px;

            background: #10152b;

            color: white;

            font-family: "Inter", sans-serif;

            font-size: 8px;

            line-height: 1.5;

            box-shadow:
                0 12px 30px rgba(0,0,0,0.18);

            z-index: 500;

            opacity: 0;

            transform: translateY(10px);

            transition: 0.3s ease;

        }

        .roadmap-toast.show {

            opacity: 1;

            transform: translateY(0);

        }

        .highlight-topic {

            background: #f0efff;

            border-radius: 7px;

            padding-left: 8px;

            transition: 0.3s;

        }

    `;


    document.head.appendChild(
        toastStyle
    );


    /* =====================================================
       ANIMATE SUMMARY PROGRESS
    ====================================================== */

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
    ====================================================== */

    loadTopicState();


    console.log(
        "AI Student Mentor - Learning Roadmap loaded."
    );

});