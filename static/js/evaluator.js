// =========================================================
// AI STUDENT MENTOR
// PROJECT IDEA EVALUATOR
// evaluator.js
// =========================================================


document.addEventListener("DOMContentLoaded", () => {


    // =====================================================
    // DOM ELEMENTS
    // =====================================================

    const projectTitle =
        document.getElementById("projectTitle");

    const projectCategory =
        document.getElementById("projectCategory");

    const ideaInput =
        document.getElementById("ideaInput");

    const characterCount =
        document.getElementById("characterCount");

    const skillLevel =
        document.getElementById("skillLevel");

    const projectDuration =
        document.getElementById("projectDuration");

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

    const sampleIdeaButton =
        document.getElementById("sampleIdeaButton");

    const notificationBtn =
        document.getElementById("notificationBtn");

    const notificationPopup =
        document.getElementById("notificationPopup");

    const notificationClose =
        document.getElementById("notificationClose");

    const notificationTitle =
        document.getElementById("notificationTitle");

    const notificationMessage =
        document.getElementById("notificationMessage");


    // =====================================================
    // EVALUATION COUNT
    // =====================================================

    let totalEvaluations = 0;
    async function loadEvaluationCount() {
    try {
        const response = await fetch("/api/evaluator");
        const data = await response.json();

        if (response.ok && data.success) {
            totalEvaluations = Number(data.total_evaluations) || 0;

            const counter = document.getElementById("evaluationCount");

            if (counter) {
                counter.textContent = totalEvaluations;
            }
        }
    } catch (error) {
        console.error("Could not load evaluation count:", error);
    }
}


    // =====================================================
    // LOAD STUDENT PROFILE
    // =====================================================

    async function loadStudentProfile() {

        try {

            const response =
                await fetch(
                    "/api/profile",
                    {
                        method: "GET",
                        credentials: "same-origin"
                    }
                );


            if (!response.ok) {
                return;
            }


            const data =
                await response.json();


            if (
                !data.success ||
                !data.profile
            ) {
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
                name
                    .charAt(0)
                    .toUpperCase();


            document
                .querySelectorAll(
                    ".top-avatar, .user-avatar"
                )
                .forEach(
                    element => {

                        element.textContent =
                            initial;

                    }
                );


          document
    .querySelectorAll(
        ".top-profile-info strong, .user-details strong"
    )
    .forEach(element => {
        element.textContent = name;
    });

// Update course label from the saved student profile
const topProfileCourse = document.querySelector(
    ".top-profile-info span"
);

const course = String(profile.course || "").trim();

if (topProfileCourse) {
    topProfileCourse.textContent = course
        ? `${course} Student`
        : "Student";
}
        }

        catch (error) {

            console.error(
                "Unable to load student profile:",
                error
            );

        }

    }


    // =====================================================
    // CHARACTER COUNTER
    // =====================================================

    function updateCharacterCount() {

        if (
            !ideaInput ||
            !characterCount
        ) {
            return;
        }


        const currentLength =
            ideaInput.value.length;


        characterCount.textContent =
            `${currentLength} / 2000`;

    }


    if (ideaInput) {

        ideaInput.addEventListener(
            "input",
            updateCharacterCount
        );

    }


    updateCharacterCount();


    // =====================================================
    // NORMALIZE ARRAY
    // =====================================================

    function normalizeArray(value) {

        if (Array.isArray(value)) {

            return value
                .map(
                    item =>
                        String(item).trim()
                )
                .filter(Boolean);

        }


        if (typeof value === "string") {

            return value
                .split(/\n|,/)
                .map(
                    item =>
                        item.trim()
                )
                .filter(Boolean);

        }


        return [];

    }


    // =====================================================
    // SHOW NOTIFICATION
    // =====================================================

    let notificationTimer = null;


    function showNotification(
        title,
        message
    ) {

        if (
            !notificationPopup ||
            !notificationTitle ||
            !notificationMessage
        ) {

            console.error(
                "Notification elements not found."
            );

            return;

        }


        notificationTitle.textContent =
            title;


        notificationMessage.textContent =
            message;


        notificationPopup.classList.add(
            "show"
        );


        clearTimeout(
            notificationTimer
        );


        notificationTimer =
            setTimeout(
                () => {

                    notificationPopup.classList.remove(
                        "show"
                    );

                },
                4000
            );

    }


    // =====================================================
    // CLOSE NOTIFICATION
    // =====================================================

    if (notificationClose) {

        notificationClose.addEventListener(
            "click",
            () => {

                if (notificationPopup) {

                    notificationPopup.classList.remove(
                        "show"
                    );

                }

            }
        );

    }


    // =====================================================
    // NOTIFICATION BUTTON
    // =====================================================

    if (notificationBtn) {

        notificationBtn.addEventListener(
            "click",
            event => {

                event.stopPropagation();


                if (!notificationPopup) {
                    return;
                }


                notificationPopup.classList.toggle(
                    "show"
                );

            }
        );

    }


    
document.addEventListener("click", event => {
    if (
        notificationPopup &&
        notificationBtn &&
        !notificationPopup.contains(event.target) &&
        !notificationBtn.contains(event.target) &&
        !event.target.closest(
            "#evaluateBtn, #sampleIdeaButton, #clearResultBtn, #copyResultBtn, .criteria-card"
        )
    ) {
        notificationPopup.classList.remove("show");
    }
});


    // =====================================================
    // SET LOADING STATE
    // =====================================================

    function setLoading(isLoading) {

        if (!evaluateBtn) {
            return;
        }


        const buttonText =
            evaluateBtn.querySelector(
                ".btn-text"
            );


        if (isLoading) {

            evaluateBtn.disabled =
                true;


            evaluateBtn.classList.add(
                "loading"
            );


            if (buttonText) {

                buttonText.textContent =
                    "Analysing Your Idea...";

            }

        }

        else {

            evaluateBtn.disabled =
                false;


            evaluateBtn.classList.remove(
                "loading"
            );


            if (buttonText) {

                buttonText.textContent =
                    "Evaluate Project Idea";

            }

        }

    }


    // =====================================================
    // VALIDATE INPUT
    // =====================================================

    function validateInput() {

        const title =
            projectTitle
                ? projectTitle.value.trim()
                : "";


        const idea =
            ideaInput
                ? ideaInput.value.trim()
                : "";


        const category =
            projectCategory
                ? projectCategory.value
                : "";


        // -------------------------------------------------
        // TITLE
        // -------------------------------------------------

        if (!title) {

            showNotification(
                "Project Title Required",
                "Please enter a title for your project idea."
            );


            if (projectTitle) {

                projectTitle.focus();

            }


            return false;

        }


        // -------------------------------------------------
        // CATEGORY
        // -------------------------------------------------

        if (!category) {

            showNotification(
                "Category Required",
                "Please select a project category."
            );


            if (projectCategory) {

                projectCategory.focus();

            }


            return false;

        }


        // -------------------------------------------------
        // IDEA
        // -------------------------------------------------

        if (!idea) {

            showNotification(
                "Project Idea Required",
                "Please describe your project idea before evaluating it."
            );


            if (ideaInput) {

                ideaInput.focus();

            }


            return false;

        }


        // -------------------------------------------------
        // MINIMUM IDEA LENGTH
        // -------------------------------------------------

        if (idea.length < 20) {

            showNotification(
                "More Details Needed",
                "Please provide a little more information about your project idea."
            );


            if (ideaInput) {

                ideaInput.focus();

            }


            return false;

        }


        return true;

    }


    // =====================================================
    // EVALUATE PROJECT
    // =====================================================

    async function evaluateProject() {

        // -------------------------------------------------
        // VALIDATION
        // -------------------------------------------------

        if (!validateInput()) {

            return;

        }


        // -------------------------------------------------
        // PAYLOAD
        // -------------------------------------------------

        const payload = {

            title:
                projectTitle.value.trim(),

            idea:
                ideaInput.value.trim(),

            category:
                projectCategory.value,

            skill_level:
                skillLevel
                    ? skillLevel.value
                    : "intermediate",

            duration:
                projectDuration
                    ? projectDuration.value
                    : "3-4"

        };


        // -------------------------------------------------
        // LOADING
        // -------------------------------------------------

        setLoading(true);


        try {

            const response =
                await fetch(
                    "/api/evaluator",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        credentials:
                            "same-origin",

                        body:
                            JSON.stringify(
                                payload
                            )
                    }
                );


            let data = null;


            try {

                data =
                    await response.json();

            }

            catch {

                data = null;

            }


            if (
                !response.ok ||
                !data
            ) {

                throw new Error(
                    data?.error ||
                    "Unable to connect to the AI evaluator."
                );

            }


            if (!data.success) {

                throw new Error(
                    data.error ||
                    data.message ||
                    "The AI evaluator could not analyse this idea."
                );

            }


            // -------------------------------------------------
            // DISPLAY RESULT
            // -------------------------------------------------

            displayEvaluation(
                data.evaluation || data
            );


            totalEvaluations = Number(data.total_evaluations) || totalEvaluations;


            if (evaluationCount) {

                evaluationCount.textContent =
                    totalEvaluations;

            }


            showNotification(
                "Evaluation Complete",
                "Your project idea has been analysed successfully."
            );

        }

        catch (error) {

            console.error(
                "Evaluator error:",
                error
            );


            showNotification(
                "Evaluation Failed",
                error.message ||
                "Something went wrong while evaluating your project idea."
            );

        }

        finally {

            setLoading(false);

        }

    }


    // =====================================================
    // GLOBAL EVALUATE BUTTON FUNCTION
    // =====================================================

    window.evaluateProjectFromButton =
        function () {

            evaluateProject();

        };


    // =====================================================
    // DISPLAY EVALUATION
    // =====================================================

    function displayEvaluation(result) {

        if (!result) {
            return;
        }


        // -------------------------------------------------
        // TITLE
        // -------------------------------------------------

        const title =
            result.title ||
            (
                projectTitle
                    ? projectTitle.value.trim()
                    : ""
            ) ||
            "Project Evaluation";


        if (resultTitle) {

            resultTitle.textContent =
                title;

        }


        // -------------------------------------------------
        // SCORES
        // -------------------------------------------------

        if (originalityScore) {

            originalityScore.textContent =
                result.originality_score ||
                result.originality ||
                "—";

        }


        if (difficultyScore) {

            difficultyScore.textContent =
                result.difficulty_score ||
                result.difficulty ||
                "—";

        }


        if (feasibilityScore) {

            feasibilityScore.textContent =
                result.feasibility_score ||
                result.ai_feasibility ||
                result.feasibility ||
                "—";

        }


        if (bcaScore) {

            bcaScore.textContent =
                result.bca_score ||
                result.bca_suitability ||
                "—";

        }


        // -------------------------------------------------
        // ANALYSIS TEXT
        // -------------------------------------------------

        if (originalityText) {

            originalityText.textContent =
                result.originality_text ||
                result.originality_analysis ||
                "No originality analysis was provided.";

        }


        if (difficultyText) {

            difficultyText.textContent =
                result.difficulty_text ||
                result.difficulty_analysis ||
                "No difficulty analysis was provided.";

        }


        if (feasibilityText) {

            feasibilityText.textContent =
                result.feasibility_text ||
                result.feasibility_analysis ||
                "No feasibility analysis was provided.";

        }


        if (bcaText) {

            bcaText.textContent =
                result.bca_text ||
                result.bca_analysis ||
                "No BCA suitability analysis was provided.";

        }


        // -------------------------------------------------
        // TECHNOLOGIES
        // -------------------------------------------------

        const technologies =
            normalizeArray(
                result.technologies
            );


        if (technologyList) {

            technologyList.innerHTML =
                "";


            if (
                technologies.length === 0
            ) {

                technologyList.innerHTML =
                    `<span class="technology-tag">
                        No specific technologies suggested
                    </span>`;

            }

            else {

                technologies.forEach(
                    technology => {

                        const tag =
                            document.createElement(
                                "span"
                            );


                        tag.className =
                            "technology-tag";


                        tag.textContent =
                            technology;


                        technologyList.appendChild(
                            tag
                        );

                    }
                );

            }

        }


        // -------------------------------------------------
        // MODULES
        // -------------------------------------------------

        const modules =
            normalizeArray(
                result.modules
            );


        if (moduleList) {

            moduleList.innerHTML =
                "";


            if (
                modules.length === 0
            ) {

                const item =
                    document.createElement(
                        "li"
                    );


                item.textContent =
                    "No specific modules suggested.";


                moduleList.appendChild(
                    item
                );

            }

            else {

                modules.forEach(
                    module => {

                        const item =
                            document.createElement(
                                "li"
                            );


                        item.textContent =
                            module;


                        moduleList.appendChild(
                            item
                        );

                    }
                );

            }

        }


        // -------------------------------------------------
        // IMPROVEMENTS
        // -------------------------------------------------

        const improvements =
            normalizeArray(
                result.improvements
            );


        if (improvementList) {

            improvementList.innerHTML =
                "";


            if (
                improvements.length === 0
            ) {

                const item =
                    document.createElement(
                        "li"
                    );


                item.textContent =
                    "No additional improvements suggested.";


                improvementList.appendChild(
                    item
                );

            }

            else {

                improvements.forEach(
                    improvement => {

                        const item =
                            document.createElement(
                                "li"
                            );


                        item.textContent =
                            improvement;


                        improvementList.appendChild(
                            item
                        );

                    }
                );

            }

        }


        // -------------------------------------------------
        // SHOW RESULT
        // -------------------------------------------------

        if (emptyState) {

            emptyState.style.display =
                "none";

        }


        if (generatedResult) {

            generatedResult.hidden =
                false;


            generatedResult.style.display =
                "block";

        }


        // -------------------------------------------------
        // WORD COUNT
        // -------------------------------------------------

        updateResultWordCount();


        // -------------------------------------------------
        // SCROLL RESULT
        // -------------------------------------------------

        const resultPreview =
            document.getElementById(
                "resultPreview"
            );


        if (resultPreview) {

            resultPreview.scrollTop =
                0;

        }

    }


    // =====================================================
    // RESULT WORD COUNT
    // =====================================================

    function updateResultWordCount() {

        if (
            !resultWordCount ||
            !generatedResult
        ) {

            return;

        }


        const text =
            generatedResult.innerText
                .replace(/\s+/g, " ")
                .trim();


        const words =
            text
                ? text.split(" ").length
                : 0;


        resultWordCount.textContent =
            `${words} words`;

    }


    // =====================================================
    // COPY RESULT
    // =====================================================

    if (copyResultBtn) {

        copyResultBtn.addEventListener(
            "click",
            async () => {

                if (
                    !generatedResult ||
                    generatedResult.hidden
                ) {

                    showNotification(
                        "Nothing to Copy",
                        "Evaluate a project idea first."
                    );

                    return;

                }


                const text =
                    generatedResult.innerText.trim();


                if (!text) {

                    showNotification(
                        "Nothing to Copy",
                        "There is no evaluation result to copy."
                    );

                    return;

                }


                try {

                    await navigator.clipboard.writeText(
                        text
                    );


                    showNotification(
                        "Result Copied",
                        "The evaluation result has been copied."
                    );

                }

                catch (error) {

                    console.error(
                        "Copy failed:",
                        error
                    );


                    showNotification(
                        "Copy Failed",
                        "The result could not be copied automatically."
                    );

                }

            }
        );

    }


    // =====================================================
    // CLEAR RESULT
    // =====================================================

    function clearResult() {

        if (generatedResult) {

            generatedResult.hidden =
                true;


            generatedResult.style.display =
                "none";

        }


        if (emptyState) {

            emptyState.style.display =
                "flex";

        }


        if (resultTitle) {

            resultTitle.textContent =
                "Project Evaluation";

        }


        if (originalityScore) {

            originalityScore.textContent =
                "—";

        }


        if (difficultyScore) {

            difficultyScore.textContent =
                "—";

        }


        if (feasibilityScore) {

            feasibilityScore.textContent =
                "—";

        }


        if (bcaScore) {

            bcaScore.textContent =
                "—";

        }


        if (originalityText) {

            originalityText.textContent =
                "—";

        }


        if (difficultyText) {

            difficultyText.textContent =
                "—";

        }


        if (feasibilityText) {

            feasibilityText.textContent =
                "—";

        }


        if (bcaText) {

            bcaText.textContent =
                "—";

        }


        if (technologyList) {

            technologyList.innerHTML =
                "";

        }


        if (moduleList) {

            moduleList.innerHTML =
                "";

        }


        if (improvementList) {

            improvementList.innerHTML =
                "";

        }


        if (resultWordCount) {

            resultWordCount.textContent =
                "0 words";

        }

    }


    if (clearResultBtn) {

        clearResultBtn.addEventListener(
            "click",
            () => {

                clearResult();


                showNotification(
                    "Result Cleared",
                    "The evaluation result has been cleared."
                );

            }
        );

    }


    // =====================================================
    // SAMPLE PROJECT IDEA
    // =====================================================

    if (sampleIdeaButton) {

        sampleIdeaButton.addEventListener(
            "click",
            () => {


                if (projectTitle) {

                    projectTitle.value =
                        "AI Student Study Assistant";

                }


                if (projectCategory) {

                    projectCategory.value =
                        "ai";

                }


                if (ideaInput) {

                    ideaInput.value =
                        "An AI-powered web application that helps BCA students ask project-related questions, understand technical concepts, receive personalized explanations and prepare for project development and viva examinations.";

                }


                if (skillLevel) {

                    skillLevel.value =
                        "intermediate";

                }


                if (projectDuration) {

                    projectDuration.value =
                        "3-4";

                }


                updateCharacterCount();


                clearResult();


                showNotification(
                    "Sample Idea Loaded",
                    "Review the sample and click Evaluate Project Idea."
                );


                if (projectTitle) {

                    projectTitle.focus();

                }


                document
                    .querySelector(
                        ".idea-card"
                    )
                    ?.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });

            }
        );

    }


    // =====================================================
    // CRITERIA CARDS
    // =====================================================

    document
        .querySelectorAll(
            ".criteria-card"
        )
        .forEach(
            card => {

                card.addEventListener(
                    "click",
                    () => {

                        const focus =
                            card.dataset.focus;


                        const messages = {

                            originality:
                                "The AI checks the conceptual originality of your idea and suggests ways to make it more distinctive.",

                            difficulty:
                                "The AI estimates the technical difficulty based on your project scope and selected skill level.",

                            technology:
                                "The AI recommends technologies that are appropriate for the proposed project.",

                            ai:
                                "The AI checks whether artificial intelligence is actually useful and feasible for the proposed idea.",

                            bca:
                                "The AI checks whether the project scope is reasonable and suitable for a BCA academic project.",

                            modules:
                                "The AI suggests logical modules that can help structure the proposed project."

                        };


                        showNotification(
                            "Evaluation Criterion",
                            messages[focus] ||
                            "This criterion will be considered during project evaluation."
                        );


                        document
                            .querySelector(
                                ".idea-card"
                            )
                            ?.scrollIntoView({
                                behavior: "smooth",
                                block: "start"
                            });

                    }
                );

            }
        );


    // =====================================================
    // CTRL + ENTER
    // =====================================================

    if (ideaInput) {

        ideaInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.ctrlKey &&
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    evaluateProject();

                }

            }
        );

    }


    // =====================================================
    // INITIALIZATION
    // =====================================================

    loadStudentProfile();
    loadEvaluationCount();
    updateCharacterCount();

});