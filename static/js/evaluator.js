/* =========================================================
   AI STUDENT MENTOR
   PROJECT IDEA EVALUATOR JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const projectTitle =
        document.getElementById("projectTitle");

    const projectCategory =
        document.getElementById("projectCategory");

    const ideaInput =
        document.getElementById("ideaInput");

    const skillLevel =
        document.getElementById("skillLevel");

    const projectDuration =
        document.getElementById("projectDuration");

    const characterCount =
        document.getElementById("characterCount");

    const evaluateBtn =
        document.getElementById("evaluateBtn");

    const evaluationCount =
        document.getElementById("evaluationCount");

    const emptyState =
        document.getElementById("emptyState");

    const generatedResult =
        document.getElementById("generatedResult");

    const resultTitle =
        document.getElementById("resultTitle");

    const originalityScore =
        document.getElementById("originalityScore");

    const difficultyScore =
        document.getElementById("difficultyScore");

    const feasibilityScore =
        document.getElementById("feasibilityScore");

    const bcaScore =
        document.getElementById("bcaScore");

    const originalityText =
        document.getElementById("originalityText");

    const difficultyText =
        document.getElementById("difficultyText");

    const feasibilityText =
        document.getElementById("feasibilityText");

    const bcaText =
        document.getElementById("bcaText");

    const technologyList =
        document.getElementById("technologyList");

    const moduleList =
        document.getElementById("moduleList");

    const improvementList =
        document.getElementById("improvementList");

    const resultWordCount =
        document.getElementById("resultWordCount");

    const copyResultBtn =
        document.getElementById("copyResultBtn");

    const clearResultBtn =
        document.getElementById("clearResultBtn");

    const notificationBtn =
        document.getElementById("notificationBtn");

    const notificationPopup =
        document.getElementById("notificationPopup");

    const sampleIdeaButton =
        document.getElementById("sampleIdeaButton");


    /* =====================================================
       STATE
    ===================================================== */

    let totalEvaluations = 0;


    /* =====================================================
       CHARACTER COUNTER
    ===================================================== */

    if (ideaInput) {

        ideaInput.addEventListener(
            "input",
            function () {

                const count =
                    ideaInput.value.length;

                characterCount.textContent =
                    `${count} characters`;

            }
        );
    }


    /* =====================================================
       EVALUATE PROJECT IDEA
    ===================================================== */

    if (evaluateBtn) {

        evaluateBtn.addEventListener(
            "click",
            async function () {

                const title =
                    projectTitle.value.trim();

                const idea =
                    ideaInput.value.trim();

                if (!title) {

                    showNotification(
                        "Please enter a project title."
                    );

                    projectTitle.focus();

                    return;
                }


                if (!idea) {

                    showNotification(
                        "Please describe your project idea."
                    );

                    ideaInput.focus();

                    return;
                }


                /* Increase evaluation count */

                totalEvaluations++;

                evaluationCount.textContent =
                    totalEvaluations;


                /* Loading state */

                evaluateBtn.disabled = true;

                evaluateBtn.innerHTML = `
                    <span class="evaluate-icon">⟳</span>
                    Analyzing Idea...
                `;


                try {

                    /*
                     * Try Flask backend first.
                     *
                     * Expected endpoint:
                     *
                     * POST /api/evaluate-project
                     */

                    const response =
                        await fetch(
                            "/api/evaluate-project",
                            {
                                method: "POST",

                                headers: {
                                    "Content-Type":
                                        "application/json"
                                },

                                body: JSON.stringify({

                                    title: title,

                                    idea: idea,

                                    category:
                                        projectCategory.value,

                                    skill_level:
                                        skillLevel.value,

                                    duration:
                                        projectDuration.value

                                })
                            }
                        );


                    if (response.ok) {

                        const data =
                            await response.json();


                        if (data.evaluation) {

                            displayEvaluation(
                                title,
                                data.evaluation
                            );

                        } else {

                            displayEvaluation(
                                title,
                                generateLocalEvaluation(
                                    title,
                                    idea
                                )
                            );

                        }

                    } else {

                        displayEvaluation(
                            title,
                            generateLocalEvaluation(
                                title,
                                idea
                            )
                        );

                    }

                } catch (error) {

                    /*
                     * Backend not connected.
                     *
                     * Use local evaluation so the
                     * frontend can still be tested.
                     */

                    displayEvaluation(
                        title,
                        generateLocalEvaluation(
                            title,
                            idea
                        )
                    );

                }


                /* Restore button */

                evaluateBtn.disabled = false;

                evaluateBtn.innerHTML = `
                    <span class="evaluate-icon">✦</span>
                    Evaluate Project Idea
                    <span class="arrow">→</span>
                `;

            }
        );
    }


    /* =====================================================
       DISPLAY EVALUATION
    ===================================================== */

    function displayEvaluation(title, evaluation) {

        emptyState.style.display =
            "none";

        generatedResult.style.display =
            "block";


        resultTitle.textContent =
            title;


        originalityScore.textContent =
            evaluation.originality_score || "Good";

        difficultyScore.textContent =
            evaluation.difficulty || "Moderate";

        feasibilityScore.textContent =
            evaluation.ai_feasibility || "Good";

        bcaScore.textContent =
            evaluation.bca_suitability || "Suitable";


        originalityText.textContent =
            evaluation.originality_text || "";


        difficultyText.textContent =
            evaluation.difficulty_text || "";


        feasibilityText.textContent =
            evaluation.feasibility_text || "";


        bcaText.textContent =
            evaluation.bca_text || "";


        renderTechnologies(
            evaluation.technologies || []
        );


        renderModules(
            evaluation.modules || []
        );


        renderImprovements(
            evaluation.improvements || []
        );


        updateWordCount(
            buildEvaluationText(evaluation)
        );


        const preview =
            document.getElementById(
                "resultPreview"
            );

        if (preview) {

            preview.scrollTop = 0;

        }

    }


    /* =====================================================
       TECHNOLOGIES
    ===================================================== */

    function renderTechnologies(technologies) {

        technologyList.innerHTML = "";

        technologies.forEach(
            function (technology) {

                const tag =
                    document.createElement("span");

                tag.className =
                    "technology-tag";

                tag.textContent =
                    technology;

                technologyList.appendChild(tag);

            }
        );
    }


    /* =====================================================
       MODULES
    ===================================================== */

    function renderModules(modules) {

        moduleList.innerHTML = "";

        modules.forEach(
            function (module, index) {

                const item =
                    document.createElement("div");

                item.className =
                    "module-item";

                item.innerHTML = `
                    <span>
                        ${index + 1}
                    </span>

                    ${escapeHTML(module)}
                `;

                moduleList.appendChild(item);

            }
        );
    }


    /* =====================================================
       IMPROVEMENTS
    ===================================================== */

    function renderImprovements(improvements) {

        improvementList.innerHTML = "";

        improvements.forEach(
            function (improvement, index) {

                const item =
                    document.createElement("div");

                item.className =
                    "improvement-item";

                item.innerHTML = `
                    <span>
                        ${index + 1}
                    </span>

                    <div>
                        ${escapeHTML(improvement)}
                    </div>
                `;

                improvementList.appendChild(item);

            }
        );
    }


    /* =====================================================
       LOCAL EVALUATION
    ===================================================== */

    function generateLocalEvaluation(
        title,
        idea
    ) {

        const lowerIdea =
            idea.toLowerCase();


        let difficulty =
            "Moderate";

        let difficultyText =
            "The proposed project has a moderate development complexity. It should be manageable for a BCA project when the implementation is divided into smaller modules and developed step by step.";


        let originalityScore =
            "Good";

        let originalityText =
            "The idea has potential for originality when it provides a clear solution to a specific student, academic or real-world problem. The uniqueness can be improved by adding features that are not commonly available in similar applications.";


        let aiFeasibility =
            "Good";

        let feasibilityText =
            "AI can be integrated if the project requires intelligent recommendations, question answering, analysis, content generation or personalized assistance. The exact AI implementation should depend on the actual project requirements.";


        let bcaScore =
            "Suitable";

        let bcaText =
            "The idea can be suitable for a BCA academic project if its scope is clearly defined and the implementation demonstrates appropriate frontend, backend, database and, where applicable, AI concepts.";


        /* =================================================
           DIFFICULTY DETECTION
        ================================================== */

        if (
            lowerIdea.includes("machine learning") ||
            lowerIdea.includes("deep learning") ||
            lowerIdea.includes("computer vision") ||
            lowerIdea.includes("nlp") ||
            lowerIdea.includes("natural language")
        ) {

            difficulty =
                "Advanced";

            difficultyText =
                "The project may require advanced implementation because it involves AI or machine learning concepts. Dataset preparation, model integration, evaluation and system integration should be considered during development.";

        } else if (
            lowerIdea.includes("ai") ||
            lowerIdea.includes("artificial intelligence") ||
            lowerIdea.includes("chatbot") ||
            lowerIdea.includes("prediction")
        ) {

            difficulty =
                "Intermediate";

            difficultyText =
                "The project has an intermediate level of complexity because AI-related functionality may require API integration, prompt design, response handling and testing.";

        }


        /* =================================================
           ORIGINALITY
        ================================================== */

        if (
            lowerIdea.includes("unique") ||
            lowerIdea.includes("innovative") ||
            lowerIdea.includes("personalized")
        ) {

            originalityScore =
                "High";

            originalityText =
                "The idea contains potentially differentiating characteristics. Its originality can be strengthened further by defining a specific target problem and adding features that provide clear value to users.";

        }


        /* =================================================
           AI FEASIBILITY
        ================================================== */

        if (
            lowerIdea.includes("ai") ||
            lowerIdea.includes("artificial intelligence") ||
            lowerIdea.includes("chatbot") ||
            lowerIdea.includes("recommendation") ||
            lowerIdea.includes("assistant") ||
            lowerIdea.includes("prediction")
        ) {

            aiFeasibility =
                "High";

            feasibilityText =
                "The project appears suitable for AI integration. An LLM or other AI service can be considered where the system requires intelligent responses, recommendations, analysis or personalized assistance.";

        }


        /* =================================================
           TECHNOLOGIES
        ================================================== */

        const technologies = [

            "HTML",

            "CSS",

            "JavaScript",

            "Python",

            "Flask",

            "MySQL"

        ];


        if (
            lowerIdea.includes("ai") ||
            lowerIdea.includes("artificial intelligence") ||
            lowerIdea.includes("chatbot") ||
            lowerIdea.includes("assistant") ||
            lowerIdea.includes("recommendation")
        ) {

            technologies.push(
                "Large Language Model",
                "OpenAI API"
            );

        }


        /* =================================================
           PROJECT MODULES
        ================================================== */

        const modules = [

            "User Registration and Profile Management",

            "Project Idea / Main Application Module",

            "Dashboard and User Interface",

            "Database Management",

            "Project Progress Tracking",

            "Documentation and Reporting"

        ];


        if (
            lowerIdea.includes("ai") ||
            lowerIdea.includes("artificial intelligence") ||
            lowerIdea.includes("chatbot") ||
            lowerIdea.includes("assistant")
        ) {

            modules.push(
                "AI Processing and Response Module"
            );

        }


        /* =================================================
           IMPROVEMENTS
        ================================================== */

        const improvements = [

            "Clearly define the problem that the project solves.",

            "Identify the target users and their requirements.",

            "Divide the project into smaller and manageable modules.",

            "Define the database requirements before implementation.",

            "Keep the project scope suitable for the available development time.",

            "Add measurable features that demonstrate the project's usefulness."

        ];


        if (
            lowerIdea.includes("ai") ||
            lowerIdea.includes("artificial intelligence")
        ) {

            improvements.push(
                "Clearly define where AI is used and what functionality is handled by the AI component."
            );

        }


        return {

            originality_score:
                originalityScore,

            difficulty:
                difficulty,

            ai_feasibility:
                aiFeasibility,

            bca_suitability:
                bcaScore,

            originality_text:
                originalityText,

            difficulty_text:
                difficultyText,

            feasibility_text:
                feasibilityText,

            bca_text:
                bcaText,

            technologies:
                technologies,

            modules:
                modules,

            improvements:
                improvements

        };

    }


    /* =====================================================
       BUILD EVALUATION TEXT
    ===================================================== */

    function buildEvaluationText(evaluation) {

        return [

            evaluation.originality_text,

            evaluation.difficulty_text,

            evaluation.feasibility_text,

            evaluation.bca_text,

            ...(evaluation.technologies || []),

            ...(evaluation.modules || []),

            ...(evaluation.improvements || [])

        ].join(" ");

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement("div");

        div.textContent =
            text;

        return div.innerHTML;
    }


    /* =====================================================
       WORD COUNT
    ===================================================== */

    function updateWordCount(text) {

        const cleanText =
            text.trim();


        if (!cleanText) {

            resultWordCount.textContent =
                "0 words";

            return;
        }


        const words =
            cleanText.split(/\s+/).length;


        resultWordCount.textContent =
            `${words} words`;
    }


    /* =====================================================
       CRITERIA CARDS
    ===================================================== */

    const criteriaCards =
        document.querySelectorAll(
            ".criteria-card"
        );


    criteriaCards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const focus =
                        card.dataset.focus;


                    let message = "";


                    if (focus === "originality") {

                        message =
                            "Originality evaluates how unique and innovative your project idea is.";

                    } else if (
                        focus === "difficulty"
                    ) {

                        message =
                            "Difficulty estimates the development effort and technical complexity of your project.";

                    } else if (
                        focus === "technology"
                    ) {

                        message =
                            "The evaluator identifies suitable technologies and frameworks for your project.";

                    } else if (
                        focus === "ai"
                    ) {

                        message =
                            "AI feasibility checks whether artificial intelligence can be practically integrated into the project.";

                    } else if (
                        focus === "bca"
                    ) {

                        message =
                            "BCA suitability checks whether the project has an appropriate academic and technical scope.";

                    } else if (
                        focus === "modules"
                    ) {

                        message =
                            "The evaluator suggests suitable modules that can organize your project implementation.";

                    }


                    showNotification(message);


                    document.querySelector(
                        ".idea-card"
                    ).scrollIntoView({

                        behavior: "smooth",

                        block: "start"

                    });

                }
            );

        }
    );


    /* =====================================================
       SAMPLE IDEA
    ===================================================== */

    if (sampleIdeaButton) {

        sampleIdeaButton.addEventListener(
            "click",
            function () {

                projectTitle.value =
                    "AI Student Study Assistant";

                projectCategory.value =
                    "ai";

                ideaInput.value =
                    "An AI-powered web application that helps BCA students ask project-related questions, understand technical concepts, receive personalized explanations and prepare for project development and viva examinations.";

                skillLevel.value =
                    "intermediate";

                projectDuration.value =
                    "3-4";


                characterCount.textContent =
                    `${ideaInput.value.length} characters`;


                ideaInput.focus();


                document.querySelector(
                    ".idea-card"
                ).scrollIntoView({

                    behavior: "smooth",

                    block: "start"

                });


                showNotification(
                    "Sample project idea loaded."
                );

            }
        );
    }


    /* =====================================================
       COPY RESULT
    ===================================================== */

    if (copyResultBtn) {

        copyResultBtn.addEventListener(
            "click",
            async function () {

                const text =
                    generatedResult.innerText.trim();


                if (
                    !text ||
                    generatedResult.style.display === "none"
                ) {

                    showNotification(
                        "There is no evaluation to copy."
                    );

                    return;
                }


                try {

                    await navigator.clipboard.writeText(
                        text
                    );

                    showNotification(
                        "Evaluation copied successfully."
                    );

                } catch (error) {

                    showNotification(
                        "Unable to copy the evaluation."
                    );

                }

            }
        );
    }


    /* =====================================================
       CLEAR RESULT
    ===================================================== */

    if (clearResultBtn) {

        clearResultBtn.addEventListener(
            "click",
            function () {

                generatedResult.style.display =
                    "none";

                emptyState.style.display =
                    "flex";


                resultTitle.textContent =
                    "Project Evaluation";


                originalityScore.textContent =
                    "—";

                difficultyScore.textContent =
                    "—";

                feasibilityScore.textContent =
                    "—";

                bcaScore.textContent =
                    "—";


                originalityText.textContent =
                    "";

                difficultyText.textContent =
                    "";

                feasibilityText.textContent =
                    "";

                bcaText.textContent =
                    "";


                technologyList.innerHTML =
                    "";

                moduleList.innerHTML =
                    "";

                improvementList.innerHTML =
                    "";


                resultWordCount.textContent =
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


        setTimeout(
            function () {

                notificationPopup.classList.remove(
                    "show"
                );

            },
            3000
        );
    }


    /* =====================================================
       ENTER / CTRL + ENTER SUPPORT
    ===================================================== */

    if (ideaInput) {

        ideaInput.addEventListener(
            "keydown",
            function (event) {

                if (
                    event.key === "Enter" &&
                    event.ctrlKey
                ) {

                    event.preventDefault();

                    evaluateBtn.click();

                }

            }
        );
    }

});