/* =========================================================
   AI STUDENT MENTOR - PERSONALIZED LESSON
   Quiz pass requirement: minimum 2/3
   MySQL-backed progress + dynamic next lesson navigation
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    const params = new URLSearchParams(window.location.search);

    const topic = params.get("topic") || "";
    const moduleNumber = Number(params.get("module"));
    const roadmapId = Number(params.get("roadmap_id"));

    const title = document.getElementById("lessonTitle");
    const overview = document.getElementById("lessonOverview");
    const content = document.getElementById("lessonContent");
    const examples = document.getElementById("lessonExamples");
    const exercises = document.getElementById("lessonExercises");
    const quiz = document.getElementById("lessonQuiz");
    const message = document.getElementById("lessonMessage");

    const completeButton = document.getElementById("completeLessonBtn");
    const nextLessonButton = document.getElementById("nextLessonBtn");
    const backToRoadmapButton = document.getElementById("backToRoadmapBtn");

    let lessonLoaded = false;
    let lessonCompleted = false;
    let quizPassed = false;
    let lastSubmittedAnswers = null;
    let nextTopic = null;
    let roadmapModules = [];
    let completedTopicKeys = new Set();

    // Completion must remain locked until a quiz pass.
    completeButton.disabled = true;

    /* =====================================================
       HELPERS
    ===================================================== */

    function decodeEntities(value) {
        const text = String(value ?? "");

        return text
            .replace(/&#x([0-9a-f]+);?/gi, (match, code) => {
                const number = parseInt(code, 16);

                return Number.isFinite(number) && number <= 0x10FFFF
                    ? String.fromCodePoint(number)
                    : match;
            })
            .replace(/&#([0-9]+);?/g, (match, code) => {
                const number = parseInt(code, 10);

                return Number.isFinite(number) && number <= 0x10FFFF
                    ? String.fromCodePoint(number)
                    : match;
            })
            .replace(/&nbsp;/gi, "\u00A0")
            .replace(/&amp;/gi, "&")
            .replace(/&lt;/gi, "<")
            .replace(/&gt;/gi, ">")
            .replace(/&quot;/gi, '"')
            .replace(/&#39;|&apos;/gi, "'");
    }

    function showMessage(text, isError = false) {
        message.textContent = decodeEntities(text);
        message.style.color = isError ? "#fca5a5" : "#93c5fd";
    }

    function addTextElement(parent, tag, text, className = "") {
        const element = document.createElement(tag);

        element.textContent = decodeEntities(text);

        if (className) {
            element.className = className;
        }

        parent.appendChild(element);

        return element;
    }

    function topicKey(number, name) {
        return `${number}::${String(name || "").trim().toLowerCase()}`;
    }

    function getModuleNumber(module, index) {
        return Number(module.module_number || index + 1);
    }

    function getTopics(module) {
        return Array.isArray(module.topics) ? module.topics : [];
    }

    function getTopicName(item) {
        return typeof item === "string"
            ? item.trim()
            : String(item?.name || item?.topic_name || "").trim();
    }

    function isTopicCompleted(number, name) {
        return completedTopicKeys.has(topicKey(number, name));
    }

    /* =====================================================
       FORMATTED LESSON CONTENT
    ===================================================== */

    function renderFormattedText(parent, rawText) {
        const text = decodeEntities(rawText);
        const codePattern = /```([a-zA-Z0-9_+-]*)\s*\n?([\s\S]*?)```/g;

        let lastIndex = 0;
        let match;

        while ((match = codePattern.exec(text)) !== null) {
            const beforeCode = text.slice(lastIndex, match.index);

            if (beforeCode.trim()) {
                const paragraph = document.createElement("p");

                paragraph.className = "lesson-text";
                paragraph.style.whiteSpace = "pre-wrap";
                paragraph.textContent = beforeCode.trim();

                parent.appendChild(paragraph);
            }

            const pre = document.createElement("pre");
            pre.className = "lesson-code";

            const code = document.createElement("code");
            code.textContent = match[2].trim();

            pre.appendChild(code);
            parent.appendChild(pre);

            lastIndex = codePattern.lastIndex;
        }

        const remaining = text.slice(lastIndex);

        if (remaining.trim()) {
            const paragraph = document.createElement("p");

            paragraph.className = "lesson-text";
            paragraph.style.whiteSpace = "pre-wrap";
            paragraph.textContent = remaining.trim();

            parent.appendChild(paragraph);
        }

        if (!text.trim()) {
            addTextElement(parent, "p", "No content available.");
        }
    }

    function renderSections(parent, items, type) {
        parent.replaceChildren();

        if (!Array.isArray(items) || items.length === 0) {
            addTextElement(
                parent,
                "p",
                "No content is available for this section yet."
            );

            return;
        }

        items.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "lesson-section";

            if (type === "explanation") {
                addTextElement(
                    card,
                    "h3",
                    item.heading || `Concept ${index + 1}`
                );

                renderFormattedText(card, item.content || "");
            } else if (type === "examples") {
                addTextElement(
                    card,
                    "h3",
                    item.title || `Example ${index + 1}`
                );

                renderFormattedText(card, item.content || "");
            } else if (type === "exercises") {
                addTextElement(card, "h3", `Exercise ${index + 1}`);

                renderFormattedText(card, item.question || "");

                const hint = document.createElement("p");
                hint.className = "lesson-hint";
                hint.style.whiteSpace = "pre-wrap";

                hint.textContent =
                    "Hint: " +
                    decodeEntities(
                        item.hint || "Review the lesson concepts."
                    );

                card.appendChild(hint);
            }

            parent.appendChild(card);
        });
    }

    /* =====================================================
       QUIZ AND PASS VALIDATION
    ===================================================== */

    function resetQuizEligibility() {
        quizPassed = false;
        lastSubmittedAnswers = null;
        completeButton.disabled = true;
    }

    function renderQuiz(questions) {
        quiz.replaceChildren();
        resetQuizEligibility();

        if (!Array.isArray(questions) || questions.length !== 3) {
            addTextElement(
                quiz,
                "p",
                "The quiz must contain exactly three questions. Please reload the lesson."
            );

            return;
        }

        const form = document.createElement("form");
        form.id = "lessonQuizForm";

        questions.forEach((question, questionIndex) => {
            const group = document.createElement("div");
            group.className = "quiz-question";

            addTextElement(
                group,
                "h3",
                `${questionIndex + 1}. ${question.question || "Question"}`,
                "quiz-question-title"
            );

            const options = Array.isArray(question.options)
                ? question.options
                : [];

            if (options.length !== 4) {
                throw new Error(
                    `Quiz question ${questionIndex + 1} must have four options.`
                );
            }

            options.forEach((option, optionIndex) => {
                const label = document.createElement("label");

                label.style.display = "flex";
                label.style.alignItems = "flex-start";
                label.style.gap = "10px";
                label.style.marginBottom = "10px";
                label.style.lineHeight = "1.6";
                label.style.cursor = "pointer";

                const radio = document.createElement("input");

                radio.type = "radio";
                radio.name = `question-${questionIndex}`;
                radio.value = String(optionIndex);
                radio.required = true;
                radio.style.flexShrink = "0";
                radio.style.marginTop = "5px";

                const optionText = document.createElement("span");
                optionText.textContent = decodeEntities(option);

                label.appendChild(radio);
                label.appendChild(optionText);

                group.appendChild(label);
            });

            form.appendChild(group);
        });

        const submit = document.createElement("button");

        submit.type = "submit";
        submit.className = "quiz-submit";
        submit.textContent = "Check My Answers";

        form.appendChild(submit);

        const results = document.createElement("div");
        results.id = "quizResults";
        results.setAttribute("role", "status");
        results.setAttribute("aria-live", "polite");

        quiz.appendChild(form);
        quiz.appendChild(results);

        /*
         * Changing any answer invalidates the previous attempt.
         * The student must check the updated answers again.
         */
        form.addEventListener("change", () => {
            if (quizPassed || lastSubmittedAnswers !== null) {
                resetQuizEligibility();

                showMessage(
                    "Your answers changed. Check your answers again to unlock completion."
                );

                results.replaceChildren();
            }
        });

        form.addEventListener("submit", event => {
            event.preventDefault();

            resetQuizEligibility();
            results.replaceChildren();

            const answers = [];

            for (let index = 0; index < 3; index++) {
                const selected = form.querySelector(
                    `input[name="question-${index}"]:checked`
                );

                if (!selected) {
                    showMessage(
                        "Please answer all three questions first.",
                        true
                    );
                    return;
                }

                answers.push(Number(selected.value));
            }

            let score = 0;

            questions.forEach((question, index) => {
                const isCorrect =
                    answers[index] === Number(question.answer);

                if (isCorrect) {
                    score++;
                }

                addTextElement(
                    results,
                    "p",
                    `${index + 1}. ${isCorrect ? "Correct!" : "Incorrect."} ${
                        question.explanation || ""
                    }`
                );
            });

            addTextElement(
                results,
                "h3",
                `Your score: ${score}/3`
            );

            if (score >= 2) {
                quizPassed = true;
                lastSubmittedAnswers = [...answers];
                completeButton.disabled = false;

                showMessage(
                    `You passed with ${score}/3! You can now complete this lesson.`
                );
            } else {
                resetQuizEligibility();

                showMessage(
                    `You scored ${score}/3. You need at least 2/3 to complete this lesson. Review the explanations and try again.`,
                    true
                );
            }
        });
    }

    /* =====================================================
       LOAD ROADMAP AND FIND NEXT UNFINISHED TOPIC
    ===================================================== */

    async function loadNextTopic() {
        const response = await fetch("/api/roadmap-data");
        const data = await response.json();

        if (!response.ok || !data.success || !data.roadmap) {
            throw new Error(
                data.error ||
                data.message ||
                "Could not retrieve your roadmap."
            );
        }

        if (
            data.roadmap_id &&
            Number(data.roadmap_id) !== roadmapId
        ) {
            throw new Error("The loaded roadmap does not match this lesson.");
        }

        roadmapModules = Array.isArray(data.roadmap.modules)
            ? data.roadmap.modules
            : [];

        completedTopicKeys.clear();

        (data.completed_topics || []).forEach(item => {
            if (
                Number(item.completed) === 1 ||
                item.completed === true
            ) {
                completedTopicKeys.add(
                    topicKey(item.module_number, item.topic_name)
                );
            }
        });

        nextTopic = null;
        let currentTopicFound = false;

        for (const [index, module] of roadmapModules.entries()) {
            const number = getModuleNumber(module, index);

            for (const item of getTopics(module)) {
                const name = getTopicName(item);

                if (!name) continue;

                if (!currentTopicFound) {
                    if (
                        number === moduleNumber &&
                        name.toLowerCase() === topic.trim().toLowerCase()
                    ) {
                        currentTopicFound = true;
                    }

                    continue;
                }

                if (!isTopicCompleted(number, name)) {
                    nextTopic = {
                        moduleNumber: number,
                        topicName: name
                    };

                    return nextTopic;
                }
            }
        }

        if (!currentTopicFound) {
            for (const [index, module] of roadmapModules.entries()) {
                const number = getModuleNumber(module, index);

                for (const item of getTopics(module)) {
                    const name = getTopicName(item);

                    if (name && !isTopicCompleted(number, name)) {
                        nextTopic = {
                            moduleNumber: number,
                            topicName: name
                        };

                        return nextTopic;
                    }
                }
            }
        }

        return null;
    }

    function showCompletionActions() {
        completeButton.hidden = true;
        nextLessonButton.hidden = true;
        backToRoadmapButton.hidden = true;

        if (nextTopic) {
            nextLessonButton.textContent =
                `Next Lesson: ${nextTopic.topicName} →`;

            nextLessonButton.hidden = false;
        } else {
            backToRoadmapButton.hidden = false;
        }
    }

    /* =====================================================
       LOAD PERSONALIZED LESSON CONTENT
    ===================================================== */

    async function loadLesson() {
        if (
            !topic.trim() ||
            !Number.isInteger(moduleNumber) ||
            moduleNumber < 1 ||
            !Number.isInteger(roadmapId) ||
            roadmapId < 1
        ) {
            showMessage(
                "Lesson details are missing. Please return to your roadmap.",
                true
            );

            completeButton.disabled = true;
            return;
        }

        title.textContent = topic;
        overview.textContent = "Generating your personalized lesson...";

        content.replaceChildren();
        examples.replaceChildren();
        exercises.replaceChildren();
        quiz.replaceChildren();

        lessonLoaded = false;
        lessonCompleted = false;
        resetQuizEligibility();

        completeButton.hidden = false;
        completeButton.textContent = "Mark Lesson as Complete ✓";

        nextLessonButton.hidden = true;
        backToRoadmapButton.hidden = true;

        try {
            const response = await fetch("/api/lesson-content", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    roadmap_id: roadmapId,
                    module_number: moduleNumber,
                    topic_name: topic
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Unable to load the lesson."
                );
            }

            const lesson = data.lesson;

            if (!lesson || typeof lesson !== "object") {
                throw new Error("The lesson content was empty.");
            }

            renderSections(content, lesson.explanation, "explanation");
            renderSections(examples, lesson.examples, "examples");
            renderSections(exercises, lesson.exercises, "exercises");
            renderQuiz(lesson.quiz);

            overview.textContent =
                "Study the concepts, explore the examples, complete the exercises, and test your understanding.";

            lessonLoaded = true;

            // Intentionally do not enable completion here.
            // Only a passing quiz attempt can enable the button.
            completeButton.disabled = !quizPassed;

            showMessage(
                "Your personalized lesson is ready! Pass the quiz with at least 2/3 to complete it."
            );

        } catch (error) {
            console.error("LESSON LOAD ERROR:", error);

            overview.textContent = "Your lesson could not be loaded.";

            completeButton.disabled = true;

            showMessage(
                error.message || "Unable to load the lesson.",
                true
            );
        }
    }

    /* =====================================================
       SAVE LESSON COMPLETION
    ===================================================== */

    completeButton.addEventListener("click", async () => {
        if (
            !lessonLoaded ||
            lessonCompleted ||
            !quizPassed ||
            !Array.isArray(lastSubmittedAnswers) ||
            lastSubmittedAnswers.length !== 3
        ) {
            completeButton.disabled = true;

            showMessage(
                "Pass the quiz with at least 2/3 before completing this lesson.",
                true
            );

            return;
        }

        completeButton.disabled = true;
        showMessage("Verifying your quiz and saving your progress...");

        try {
            const response = await fetch("/api/roadmap-data", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    roadmap_id: roadmapId,
                    module_number: moduleNumber,
                    topic_name: topic,
                    completed: true,
                    answers: [...lastSubmittedAnswers]
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    data.error ||
                    "Could not save lesson progress."
                );
            }

            lessonCompleted = true;

            try {
                await loadNextTopic();
            } catch (roadmapError) {
                console.error(
                    "NEXT LESSON LOOKUP ERROR:",
                    roadmapError
                );

                nextTopic = null;
            }

            showMessage(
                "Lesson completed! Your roadmap progress is saved. 🎉"
            );

            showCompletionActions();

        } catch (error) {
            console.error("LESSON PROGRESS ERROR:", error);

            showMessage(
                error.message || "Could not save lesson progress.",
                true
            );

            // Allow another save attempt only if the quiz is still passed.
            completeButton.disabled = !quizPassed;
        }
    });

    /* =====================================================
       OPEN THE NEXT UNFINISHED LESSON
    ===================================================== */

    nextLessonButton.addEventListener("click", () => {
        if (!lessonCompleted || !nextTopic) return;

        const nextParams = new URLSearchParams({
            roadmap_id: String(roadmapId),
            module: String(nextTopic.moduleNumber),
            topic: nextTopic.topicName
        });

        window.location.href = `/lesson?${nextParams.toString()}`;
    });

    loadLesson();
});
