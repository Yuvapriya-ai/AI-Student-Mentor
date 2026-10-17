
document.addEventListener("DOMContentLoaded", function () {

    // ==================================================
    // PROJECT CONFIGURATION
    // ==================================================

    const MAIN_PROJECT = {
        title: "AI Student Mentor",
        description:
            "An AI-powered learning and project guidance system for BCA students.",
        info: `Project Title: AI Student Mentor: An Intelligent Learning and Project Guidance System

Project Domain: AI-powered educational web application.

Purpose: Help BCA students with learning, project development, documentation, progress tracking, project idea evaluation and viva preparation.

Technology Stack:
- Frontend: HTML, CSS and JavaScript
- Backend: Python with Flask
- Database: MySQL
- AI integration: Gemini API
- SDLC methodology: Waterfall

Eight Core Modules:
1. Student Profile Management
2. Learning Roadmap
3. AI Project Mentor
4. Documentation Assistant
5. Project Viva Assistant
6. AI Study Assistant
7. Project Progress Tracker
8. AI Project Idea Evaluator

Flask handles backend routes and API requests. MySQL stores application data. Gemini API generates AI responses. Do not assume unconfirmed database tables, security mechanisms, algorithms or implementation details.`
    };

    let savedProjects = [];

    let selectedProject = {
        type: "main",
        id: null,
        title: MAIN_PROJECT.title,
        description: MAIN_PROJECT.description,
        info: MAIN_PROJECT.info
    };


    // ==================================================
    // ELEMENTS
    // ==================================================

    const questionCategory =
        document.getElementById("questionCategory");

    const difficultyLevel =
        document.getElementById("difficultyLevel");

    const questionNumber =
        document.getElementById("questionNumber");

    const projectInput =
        document.getElementById("projectInput");

    const projectSelect =
        document.getElementById("vivaProjectSelect");

    const projectTitle =
        document.getElementById("vivaProjectTitle");

    const projectDescription =
        document.getElementById("vivaProjectDescription");

    const questionCount =
        document.getElementById("questionCount");

    const generateBtn =
        document.getElementById("generateBtn");

    const documentPreview =
        document.getElementById("documentPreview");

    const emptyState =
        document.getElementById("emptyState");

    const generatedDocument =
        document.getElementById("generatedDocument");

    const generatedTitle =
        document.getElementById("generatedTitle");

    const generatedContent =
        document.getElementById("generatedContent");

    const copyBtn =
        document.getElementById("copyBtn");

    const downloadBtn =
        document.getElementById("downloadBtn");

    const wordCount =
        document.getElementById("wordCount");

    const characterCount =
        document.getElementById("characterCount");

    const tipButton =
        document.getElementById("tipButton");


    // ==================================================
    // STUDENT PROFILE
    // ==================================================

    function getInitial(name) {
        const value = String(name || "").trim();
        return value ? value.charAt(0).toUpperCase() : "Y";
    }

    async function loadStudentProfile() {
        try {
            const response = await fetch("/api/profile");
            const data = await response.json();

            if (!response.ok || !data.success || !data.profile) {
                return;
            }

            const profile = data.profile;
            const name = String(profile.name || "Student").trim();
            const initial = getInitial(name);
            const course = String(profile.course || "").trim();

            const topAvatar = document.querySelector(".top-avatar");
            const topName = document.querySelector(".top-profile strong");
            const topCourse = document.querySelector(".top-profile span");
            const sidebarAvatar = document.querySelector(".user-avatar");
            const sidebarName = document.querySelector(".user-details strong");

            if (topAvatar) topAvatar.textContent = initial;
            if (topName) topName.textContent = name;

            if (topCourse) {
                topCourse.textContent = course
                    ? `${course} Student`
                    : "Student";
            }

            if (sidebarAvatar) sidebarAvatar.textContent = initial;
            if (sidebarName) sidebarName.textContent = name;

        } catch (error) {
            console.error("Viva profile loading error:", error);
        }
    }


    // ==================================================
    // PROJECT DESCRIPTION HELPERS
    // ==================================================

    function getProjectDescription(idea) {
        if (!idea || typeof idea !== "object") {
            return "";
        }

        const values = [
            idea.idea_description,
            idea.description,
            idea.project_description,
            idea.projectDescription,
            idea.ideaDescription,
            idea.evaluation_data?.idea_description,
            idea.evaluation_data?.description,
            idea.evaluation_data?.project_description
        ];

        for (const value of values) {
            if (typeof value === "string" && value.trim()) {
                return value.trim();
            }
        }

        return "";
    }


    function updateCharacterCount() {
        if (projectInput && characterCount) {
            characterCount.textContent =
                `${projectInput.value.length} characters`;
        }
    }


    function updateProjectBanner(project) {
        if (projectTitle) {
            projectTitle.textContent = project.title;
        }

        if (projectDescription) {
            projectDescription.textContent =
                project.description ||
                "Generate viva questions based on the selected project's information.";
        }
    }


    function setSelectedProject(project) {
        selectedProject = project;

        updateProjectBanner(project);

        if (projectInput) {
            projectInput.value = project.info || "";
            updateCharacterCount();
        }
    }


    // ==================================================
    // VIVA REVISION CHECKLIST
    // Saved separately for each logged-in student.
    // ==================================================

    const checklistItems = Array.from(
        document.querySelectorAll(".checklist-card .check-item")
    );

    const checklistCounter =
        document.querySelector(".checklist-card .completion");

    const checklistState = {};
    const savingChecklistItems = new Set();

    // Preserve the current HTML state until MySQL data loads.
    checklistItems.forEach((item, index) => {
        const itemNumber = index + 1;

        checklistState[itemNumber] =
            item.classList.contains("completed");

        // Add keyboard accessibility without requiring HTML changes.
        item.setAttribute("role", "checkbox");
        item.setAttribute("tabindex", "0");
        item.setAttribute(
            "aria-checked",
            String(checklistState[itemNumber])
        );

        item.style.cursor = "pointer";
        item.dataset.checklistItem = String(itemNumber);

        updateChecklistItem(itemNumber);
    });


    function updateChecklistItem(itemNumber) {
        const item = checklistItems[itemNumber - 1];

        if (!item) {
            return;
        }

        const completed = Boolean(checklistState[itemNumber]);
        const checkMark = item.querySelector(".check");

        item.classList.toggle("completed", completed);
        item.setAttribute("aria-checked", String(completed));
        item.setAttribute(
            "aria-label",
            `Revision item ${itemNumber}: ${
                item.innerText.trim()
            }`
        );

        if (checkMark) {
            checkMark.textContent = completed
                ? "✓"
                : String(itemNumber);
        }

        item.style.opacity =
            savingChecklistItems.has(itemNumber) ? "0.65" : "1";

        item.setAttribute(
            "aria-busy",
            String(savingChecklistItems.has(itemNumber))
        );
    }


    function updateChecklistCounter() {
        if (!checklistCounter) {
            return;
        }

        const completedCount = Object.values(checklistState)
            .filter(Boolean)
            .length;

        checklistCounter.textContent =
            `${completedCount} / ${checklistItems.length}`;
    }


    async function loadVivaChecklist() {
        if (checklistItems.length === 0) {
            console.warn(
                "Viva checklist items were not found in the HTML."
            );
            return;
        }

        try {
            const response = await fetch("/api/viva-checklist");
            const data = await response.json();

            if (!response.ok || !data.success || !data.checklist) {
                throw new Error(
                    data.message ||
                    "Unable to load the saved revision checklist."
                );
            }

            checklistItems.forEach((item, index) => {
                const itemNumber = index + 1;
                const savedValue = data.checklist[`item_${itemNumber}`];

                if (typeof savedValue === "boolean") {
                    checklistState[itemNumber] = savedValue;
                } else if (savedValue === 0 || savedValue === 1) {
                    checklistState[itemNumber] = savedValue === 1;
                }

                updateChecklistItem(itemNumber);
            });

            updateChecklistCounter();

        } catch (error) {
            console.error("Viva checklist loading error:", error);

            showNotification(
                "Couldn't load saved checklist progress. Please refresh and try again."
            );
        }
    }


    async function saveChecklistItem(itemNumber, completed) {
        const item = checklistItems[itemNumber - 1];

        if (!item || savingChecklistItems.has(itemNumber)) {
            return;
        }

        const previousValue = Boolean(checklistState[itemNumber]);

        // Update immediately so the checklist feels responsive.
        checklistState[itemNumber] = completed;
        savingChecklistItems.add(itemNumber);

        updateChecklistItem(itemNumber);
        updateChecklistCounter();

        try {
            const response = await fetch("/api/viva-checklist", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    item_number: itemNumber,
                    completed: completed
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.message ||
                    "Unable to save this checklist item."
                );
            }

        } catch (error) {
            // Restore the previous state if MySQL saving fails.
            checklistState[itemNumber] = previousValue;

            console.error("Viva checklist saving error:", error);

            showNotification(
                "Couldn't save this item. Please try again."
            );

        } finally {
            savingChecklistItems.delete(itemNumber);
            updateChecklistItem(itemNumber);
            updateChecklistCounter();
        }
    }


    checklistItems.forEach((item, index) => {
        const itemNumber = index + 1;

        item.addEventListener("click", function () {
            if (savingChecklistItems.has(itemNumber)) {
                return;
            }

            saveChecklistItem(
                itemNumber,
                !checklistState[itemNumber]
            );
        });

        item.addEventListener("keydown", function (event) {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();

            if (savingChecklistItems.has(itemNumber)) {
                return;
            }

            saveChecklistItem(
                itemNumber,
                !checklistState[itemNumber]
            );
        });
    });


    // ==================================================
    // LOAD SAVED PROJECT IDEAS
    // Uses the same API as AI Project Mentor.
    // ==================================================

    async function loadSavedProjects() {
        if (!projectSelect) {
            console.warn("Viva project selector was not found.");
            return;
        }

        try {
            const response = await fetch("/api/project-ideas");
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Could not load saved project ideas."
                );
            }

            const ideas = Array.isArray(data.ideas) ? data.ideas : [];
            const uniqueIdeas = new Map();

            ideas.forEach(idea => {
                if (!idea || idea.id == null) {
                    return;
                }

                const title = String(
                    idea.title || "Untitled Project"
                ).trim();

                const key = title.toLowerCase();
                const description = getProjectDescription(idea);
                const existing = uniqueIdeas.get(key);

                if (!existing || (!existing.description && description)) {
                    uniqueIdeas.set(key, {
                        id: idea.id,
                        title,
                        description
                    });
                }
            });

            savedProjects = Array.from(uniqueIdeas.values());

            projectSelect.innerHTML = "";

            const mainOption = document.createElement("option");
            mainOption.value = "main";
            mainOption.textContent =
                "AI Student Mentor — Main Project";

            projectSelect.appendChild(mainOption);

            savedProjects.forEach(project => {
                const option = document.createElement("option");
                option.value = `idea:${project.id}`;
                option.textContent = project.title;
                projectSelect.appendChild(option);
            });

            projectSelect.value = "main";

            console.log(
                "Viva saved projects loaded:",
                savedProjects.length
            );

        } catch (error) {
            console.error("Viva saved-project loading error:", error);

            if (projectSelect) {
                projectSelect.innerHTML =
                    '<option value="main">AI Student Mentor — Main Project</option>';
            }
        }
    }


    // ==================================================
    // SELECT A PROJECT
    // ==================================================

    if (projectSelect) {
        projectSelect.addEventListener("change", function () {
            const value = projectSelect.value;

            if (value === "main") {
                setSelectedProject({
                    type: "main",
                    id: null,
                    title: MAIN_PROJECT.title,
                    description: MAIN_PROJECT.description,
                    info: MAIN_PROJECT.info
                });

                return;
            }

            if (value.startsWith("idea:")) {
                const id = value.slice(5);

                const idea = savedProjects.find(
                    project => String(project.id) === String(id)
                );

                if (!idea) {
                    return;
                }

                const description = idea.description ||
                    "No saved description is available for this project.";

                setSelectedProject({
                    type: "saved",
                    id: idea.id,
                    title: idea.title,
                    description,
                    info:
                        `Project Title: ${idea.title}\n\n` +
                        `Project Description:\n${description}`
                });
            }
        });
    }


    // ==================================================
    // CHARACTER COUNTER
    // ==================================================

    if (projectInput) {
        projectInput.addEventListener(
            "input",
            updateCharacterCount
        );
    }


    // ==================================================
    // GENERATE VIVA QUESTIONS
    // ==================================================

    if (generateBtn) {
        generateBtn.addEventListener("click", async function () {
            const category = questionCategory
                ? questionCategory.value
                : "mixed";

            const difficulty = difficultyLevel
                ? difficultyLevel.value
                : "intermediate";

            const count = questionNumber
                ? questionNumber.value
                : 5;

            const projectInfo = projectInput
                ? projectInput.value.trim()
                : "";

            if (!projectInfo) {
                showNotification(
                    "Please enter your project information first."
                );

                projectInput?.focus();
                return;
            }

            generateBtn.disabled = true;
            generateBtn.textContent = "Generating...";

            try {
                const response = await fetch("/api/viva", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        category,
                        difficulty,
                        count,
                        project_info: projectInfo,
                        project_title: selectedProject.title,
                        project_type: selectedProject.type
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(
                        data.error ||
                        "Unable to generate viva questions."
                    );
                }

                displayQuestions(
                    data.questions,
                    selectedProject.title
                );

                showNotification(
                    "Viva questions generated successfully!"
                );

            } catch (error) {
                console.error("Viva generation error:", error);

                showNotification(
                    error.message ||
                    "Something went wrong while generating questions."
                );

            } finally {
                generateBtn.disabled = false;
                generateBtn.textContent = "Generate Questions";
            }
        });
    }


    // ==================================================
    // DISPLAY GENERATED QUESTIONS
    // ==================================================

    function displayQuestions(questions, title) {
        if (!Array.isArray(questions) || questions.length === 0) {
            showNotification("No questions were generated.");
            return;
        }

        if (emptyState) emptyState.style.display = "none";

        if (generatedDocument) {
            generatedDocument.style.display = "block";
        }

        if (generatedTitle) {
            generatedTitle.textContent =
                `Viva Questions — ${title || "Selected Project"}`;
        }

        if (generatedContent) {
            generatedContent.innerHTML = questions.map(
                (item, index) => `
                    <div class="viva-question">
                        <h3>Question ${index + 1}</h3>
                        <p class="question-text">
                            ${escapeHTML(item.question)}
                        </p>
                        <div class="answer-section">
                            <strong>Model Answer:</strong>
                            <p>${escapeHTML(item.answer)}</p>
                        </div>
                    </div>
                `
            ).join("");
        }

       // Update the number of successfully generated questions.
if (questionCount) {
    questionCount.textContent = questions.length;
}

updateWordCount();
    }


    // ==================================================
    // COPY QUESTIONS
    // ==================================================

    if (copyBtn) {
        copyBtn.addEventListener("click", async function () {
            const text = generatedContent
                ? generatedContent.innerText.trim()
                : "";

            if (!text) {
                showNotification("Nothing to copy.");
                return;
            }

            try {
                await navigator.clipboard.writeText(text);
                showNotification("Viva questions copied!");

            } catch (error) {
                console.error("Copy error:", error);
                showNotification("Unable to copy the questions.");
            }
        });
    }


    // ==================================================
    // DOWNLOAD QUESTIONS
    // ==================================================

    if (downloadBtn) {
        downloadBtn.addEventListener("click", function () {
            const text = generatedContent
                ? generatedContent.innerText.trim()
                : "";

            if (!text) {
                showNotification("Nothing to download.");
                return;
            }

            const safeTitle = (
                selectedProject.title || "Project"
            )
                .replace(/[^a-z0-9_-]+/gi, "_")
                .replace(/^_+|_+$/g, "");

            const blob = new Blob([text], {
                type: "text/plain;charset=utf-8"
            });

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download =
                `${safeTitle || "Project"}_Viva_Questions.txt`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            URL.revokeObjectURL(url);

            showNotification("Viva questions downloaded!");
        });
    }


    // ==================================================
    // WORD COUNT
    // ==================================================

    function updateWordCount() {
        if (!wordCount || !generatedContent) {
            return;
        }

        const text = generatedContent.innerText.trim();

        wordCount.textContent = text
            ? `${text.split(/\s+/).filter(Boolean).length} words`
            : "0 words";
    }


    // ==================================================
    // AI TIP
    // ==================================================

    if (tipButton) {
        tipButton.addEventListener("click", function () {
            showNotification(
                "Viva Tip: Understand your project instead of memorizing answers. Be ready to explain what you built, why you chose it, and how each module works."
            );
        });
    }


    // ==================================================
    // NOTIFICATION
    // ==================================================

    function showNotification(message) {
        const existing =
            document.querySelector(".notification-popup");

        if (existing) {
            existing.remove();
        }

        const notification = document.createElement("div");
        notification.className = "notification-popup";
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(
            () => notification.classList.add("show"),
            10
        );

        setTimeout(() => {
            notification.classList.remove("show");

            setTimeout(
                () => notification.remove(),
                300
            );
        }, 3500);
    }


    // ==================================================
    // HTML ESCAPING
    // ==================================================

    function escapeHTML(text) {
        const div = document.createElement("div");
        div.textContent = String(text ?? "");
        return div.innerHTML;
    }


    // ==================================================
    // INITIALIZE
    // ==================================================

    setSelectedProject({
        type: "main",
        id: null,
        title: MAIN_PROJECT.title,
        description: MAIN_PROJECT.description,
        info: MAIN_PROJECT.info
    });

    updateChecklistCounter();

    loadStudentProfile();
    loadSavedProjects();
    loadVivaChecklist();

});
