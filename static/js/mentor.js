

/* =========================================================
   AI STUDENT MENTOR
   AI PROJECT MENTOR JAVASCRIPT
   Saved Ideas + First-Time Onboarding
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =====================================================
       HELPERS
    ===================================================== */

    const $ = (id) => document.getElementById(id);

    function getInitial(name) {
        return String(name || "Student").trim().charAt(0).toUpperCase() || "S";
    }

    function setText(element, value) {
        if (element) element.textContent = value;
    }

    function escapeHTML(text) {
        const element = document.createElement("div");
        element.textContent = String(text ?? "");
        return element.innerHTML;
    }

    /* =====================================================
       PROJECT MODE
    ===================================================== */

    let projectMode = "default";
    let temporaryProjectTitle = "";
    let temporaryProjectDescription = "";

    const SAMPLE_PROJECT = {
        title: "Library Management System",
        description:
            "A Library Management System for managing books, student/member records, book issue and return transactions, due dates, and library records. Use this sample project to explore project planning, database design, architecture, implementation, and debugging."
    };

    const onboardingOverlay = $("mentorOnboardingOverlay");
    const onboardingStatus = $("mentorOnboardingStatus");
    const manualFields = $("mentorManualProjectFields");
    const manualTitleInput = $("mentorOnboardingProjectTitle");
    const manualDescriptionInput = $("mentorOnboardingProjectDescription");
    const startOwnProjectBtn = $("mentorStartOwnProject");

    /* =====================================================
       ONBOARDING STYLES
    ===================================================== */

    if (onboardingOverlay) {
        const style = document.createElement("style");

        style.textContent = `
            .mentor-onboarding-overlay {
                position: fixed;
                inset: 0;
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
                overflow-y: auto;
                background: rgba(4, 10, 30, .88);
                backdrop-filter: blur(8px);
            }

            .mentor-onboarding-card {
                width: 100%;
                max-width: 650px;
                max-height: calc(100vh - 48px);
                overflow-y: auto;
                padding: 32px;
                border: 1px solid rgba(130, 150, 220, .25);
                border-radius: 22px;
                background: #101b3d;
                color: #f5f7ff;
                box-shadow: 0 24px 80px rgba(0, 0, 0, .4);
            }

            .mentor-onboarding-heading { margin-bottom: 24px; }

            .mentor-onboarding-heading .eyebrow {
                color: #a5b4fc;
                font-size: 11px;
                font-weight: 800;
                letter-spacing: 1.5px;
            }

            .mentor-onboarding-heading h2 {
                margin: 12px 0;
                font-size: clamp(23px, 4vw, 30px);
                line-height: 1.3;
                color: #fff;
            }

            .mentor-onboarding-heading p {
                color: #bdc8e7;
                font-size: 14px;
                line-height: 1.7;
            }

            .mentor-onboarding-options {
                display: grid;
                gap: 12px;
            }

            .mentor-onboarding-option {
                display: grid;
                grid-template-columns: 46px minmax(0, 1fr) 18px;
                align-items: center;
                gap: 14px;
                width: 100%;
                padding: 17px;
                text-align: left;
                color: #f5f7ff;
                background: #17254c;
                border: 1px solid #2a3a68;
                border-radius: 14px;
                cursor: pointer;
                transition: border-color .2s, background .2s, transform .2s;
            }

            .mentor-onboarding-option:hover {
                background: #1d2e5d;
                border-color: #8999ff;
                transform: translateY(-1px);
            }

            .mentor-onboarding-option:focus-visible {
                outline: 2px solid #a5b4fc;
                outline-offset: 3px;
            }

            .onboarding-option-icon {
                display: flex;
                align-items: center;
                justify-content: center;
                width: 44px;
                height: 44px;
                border-radius: 12px;
                color: #c4b5fd;
                background: #2b2c65;
                font-size: 21px;
            }

            .mentor-onboarding-option strong,
            .mentor-onboarding-option small { display: block; }

            .mentor-onboarding-option strong {
                margin-bottom: 5px;
                font-size: 14px;
                font-weight: 700;
            }

            .mentor-onboarding-option small {
                color: #bdc8e7;
                font-size: 12px;
                line-height: 1.6;
            }

            .onboarding-option-arrow {
                color: #a5b4fc;
                font-size: 24px;
            }

            .mentor-manual-project-fields {
                margin-top: 22px;
                padding: 20px;
                border: 1px solid #354574;
                border-radius: 14px;
                background: #0c1635;
            }

            .mentor-manual-project-fields label {
                display: block;
                margin: 14px 0 7px;
                color: #e3e9ff;
                font-size: 13px;
                font-weight: 600;
            }

            .mentor-manual-project-fields label:first-child { margin-top: 0; }

            .mentor-manual-project-fields input,
            .mentor-manual-project-fields textarea {
                display: block;
                width: 100%;
                padding: 12px 13px;
                border: 1px solid #394a78;
                border-radius: 9px;
                outline: none;
                color: #fff;
                background: #152347;
                font: inherit;
                font-size: 13px;
                box-sizing: border-box;
            }

            .mentor-manual-project-fields input:focus,
            .mentor-manual-project-fields textarea:focus {
                border-color: #9ba8ff;
            }

            .mentor-manual-project-fields textarea {
                resize: vertical;
                min-height: 95px;
            }

            .mentor-onboarding-note {
                margin: 12px 0;
                color: #b9c5e4;
                font-size: 12px;
                line-height: 1.6;
            }

            .mentor-onboarding-continue {
                width: 100%;
                padding: 13px 18px;
                border: none;
                border-radius: 10px;
                color: #fff;
                background: #5865e8;
                font-weight: 700;
                cursor: pointer;
            }

            .mentor-onboarding-continue:hover { background: #6d78f4; }

            .mentor-onboarding-continue:disabled {
                opacity: .6;
                cursor: wait;
            }

            .mentor-onboarding-status {
                margin-top: 14px;
                color: #c7d2fe;
                font-size: 13px;
                line-height: 1.6;
            }

            @media (max-width: 520px) {
                .mentor-onboarding-overlay { padding: 12px; }

                .mentor-onboarding-card {
                    padding: 21px;
                    max-height: calc(100vh - 24px);
                }

                .mentor-onboarding-option {
                    grid-template-columns: 38px minmax(0, 1fr) 12px;
                    gap: 10px;
                    padding: 13px;
                }

                .onboarding-option-icon {
                    width: 38px;
                    height: 38px;
                }
            }
        `;

        document.head.appendChild(style);
    }

    /* =====================================================
       STUDENT IDENTITY
    ===================================================== */

    async function loadStudentProfile() {
        try {
            const response = await fetch("/api/profile");
            const data = await response.json();

            if (!response.ok || !data.success || !data.profile) {
                console.error("Could not load student profile.");
                return;
            }

            const profile = data.profile;
            const name = String(profile.name || "").trim() || "Student";
            const initial = getInitial(name);
            const course = String(profile.course || "").trim();

            setText(document.querySelector(".top-avatar"), initial);
            setText(document.querySelector(".top-profile strong"), name);
            setText(
                document.querySelector(".top-profile span"),
                course ? `${course} Student` : "Student"
            );
            setText(document.querySelector(".user-avatar"), initial);
            setText(document.querySelector(".user-details strong"), name);

            console.log("Mentor profile loaded from MySQL.");
        } catch (error) {
            console.error("Mentor profile loading error:", error);
        }
    }

    /* =====================================================
       PROJECT IDEA ELEMENTS
    ===================================================== */

    const projectCombobox = $("projectCombobox");
    const projectSearchInput = $("projectSearchInput");
    const projectDropdownList = $("projectDropdownList");
    const projectIdeaSelect = $("projectIdeaSelect");
    const selectedProjectTitle = $("selectedProjectTitle");
    const selectedProjectDescription = $("selectedProjectDescription");
    const projectIdeaStatus = $("projectIdeaStatus");

    let projectIdeas = [];
    let selectedProjectIdeaId = null;

    /* =====================================================
       SAVED IDEA DATA HELPERS
    ===================================================== */

    function parseEvaluationResult(idea) {
        let evaluation = idea?.evaluation_result ?? idea?.evaluation_data;

        if (typeof evaluation === "string") {
            try {
                evaluation = JSON.parse(evaluation);
            } catch (error) {
                evaluation = null;
            }
        }

        return evaluation && typeof evaluation === "object"
            ? evaluation
            : {};
    }

    function getProjectDescription(idea) {
        if (!idea || typeof idea !== "object") return "";

        const evaluation = parseEvaluationResult(idea);

        const candidates = [
            idea.idea_description,
            idea.description,
            idea.project_description,
            idea.projectDescription,
            idea.ideaDescription,
            idea.idea,
            evaluation.idea_description,
            evaluation.description,
            evaluation.project_description,
            evaluation.projectDescription,
            evaluation.ideaDescription,
            evaluation.idea,
            evaluation.project_idea,
            evaluation.projectIdea
        ];

        for (const value of candidates) {
            if (typeof value === "string" && value.trim()) {
                return value.trim();
            }
        }

        return "";
    }

    function normalizeProjectIdea(idea) {
        return {
            ...idea,
            id: idea.id,
            title: String(idea.title || "Untitled Project").trim(),
            description: getProjectDescription(idea)
        };
    }

    /* =====================================================
       PROJECT DISPLAY
    ===================================================== */

    function updateProjectIdeaDisplay(idea) {
        if (idea) {
            setText(
                selectedProjectTitle,
                idea.title || "Untitled Project"
            );

            setText(
                selectedProjectDescription,
                getProjectDescription(idea) ||
                    "No saved description found. You can still ask your mentor questions about this project."
            );

            setText(
                projectIdeaStatus,
                `Selected project: ${idea.title || "Untitled Project"}`
            );

            return;
        }

        setText(selectedProjectTitle, "No project selected");
        setText(
            selectedProjectDescription,
            "Choose a saved project idea to give your AI Mentor the right context."
        );

        setText(
            projectIdeaStatus,
            projectIdeas.length
                ? "Select a project idea to begin."
                : "You have no saved project ideas yet. You can still use a sample project or ask general questions."
        );
    }

    function displayTemporaryProject(title, description, status) {
        setText(selectedProjectTitle, title);
        setText(selectedProjectDescription, description);
        setText(projectIdeaStatus, status);

        if (projectSearchInput) projectSearchInput.value = "";
        if (projectIdeaSelect) projectIdeaSelect.value = "";

        closeProjectDropdown();
    }

    /* =====================================================
       SAVED PROJECT DROPDOWN
    ===================================================== */

    function openProjectDropdown() {
        if (
            !projectDropdownList ||
            !projectSearchInput ||
            projectSearchInput.disabled
        ) {
            return;
        }

        projectDropdownList.classList.remove("hidden");
        projectCombobox?.classList.add("open");

        // FIX: Show every saved idea when opening the dropdown.
        // Typing into the input will filter the list separately.
        filterProjectIdeas("");
    }

    function closeProjectDropdown() {
        projectDropdownList?.classList.add("hidden");
        projectCombobox?.classList.remove("open");
    }

    function filterProjectIdeas(searchText = "") {
        if (!projectDropdownList) return;

        const filter = String(searchText).trim().toLowerCase();

        const items = projectDropdownList.querySelectorAll(
            ".combobox-item:not(.no-result)"
        );

        let matches = 0;

        items.forEach((item) => {
            const title = item.textContent.trim().toLowerCase();
            const visible = !filter || title.includes(filter);

            item.style.display = visible ? "" : "none";

            if (visible) matches++;
        });

        let noResult = projectDropdownList.querySelector(".no-result");

        if (matches === 0) {
            if (!noResult) {
                noResult = document.createElement("li");
                noResult.className = "combobox-item no-result";
                projectDropdownList.appendChild(noResult);
            }

            noResult.textContent = projectIdeas.length
                ? "No project ideas found"
                : "No saved ideas available";

            noResult.style.display = "block";
        } else if (noResult) {
            noResult.style.display = "none";
        }
    }

    function renderProjectIdeas() {
        if (!projectDropdownList) return;

        projectDropdownList.replaceChildren();

        if (projectIdeaSelect) {
            projectIdeaSelect.replaceChildren();

            const placeholder = document.createElement("option");
            placeholder.value = "";
            placeholder.textContent = projectIdeas.length
                ? "Choose a project idea"
                : "No saved project ideas";

            projectIdeaSelect.appendChild(placeholder);
        }

        if (!projectIdeas.length) {
            const empty = document.createElement("li");
            empty.className = "combobox-item no-result";
            empty.textContent = "No saved ideas available";
            projectDropdownList.appendChild(empty);
            return;
        }

        projectIdeas.forEach((idea) => {
            const item = document.createElement("li");
            item.className = "combobox-item";
            item.dataset.value = String(idea.id);
            item.setAttribute("role", "option");
            item.textContent = idea.title;
            projectDropdownList.appendChild(item);

            if (projectIdeaSelect) {
                const option = document.createElement("option");
                option.value = String(idea.id);
                option.textContent = idea.title;
                projectIdeaSelect.appendChild(option);
            }
        });
    }

    /* =====================================================
       LOAD SAVED IDEAS FROM MYSQL API
    ===================================================== */

    async function loadProjectIdeas() {
        if (!projectSearchInput || !projectDropdownList) {
            console.warn("Project selector elements were not found.");
            return;
        }

        projectSearchInput.disabled = true;
        projectSearchInput.placeholder = "Loading saved ideas...";

        try {
            const response = await fetch("/api/project-ideas", {
                method: "GET",
                headers: {
                    "Accept": "application/json"
                },
                cache: "no-store"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Could not load saved project ideas."
                );
            }

            const incomingIdeas = Array.isArray(data.ideas)
                ? data.ideas
                : [];

            // Keep every saved idea. Do not deduplicate by project title.
            projectIdeas = incomingIdeas
                .filter((idea) => idea && idea.id != null)
                .map(normalizeProjectIdea);

            console.log("API ideas returned:", incomingIdeas.length);
            console.log("Ideas displayed in dropdown:", projectIdeas.length);

            console.table(
                projectIdeas.map((idea) => ({
                    id: idea.id,
                    title: idea.title
                }))
            );

            renderProjectIdeas();

            projectSearchInput.disabled = projectIdeas.length === 0;
            projectSearchInput.placeholder = projectIdeas.length
                ? "Search or select a project idea..."
                : "No saved project ideas";

            const activeIdea = data.active_idea_id != null
                ? projectIdeas.find(
                    (idea) =>
                        String(idea.id) === String(data.active_idea_id)
                )
                : null;

            selectedProjectIdeaId = activeIdea ? activeIdea.id : null;

            if (activeIdea) {
                projectSearchInput.value = activeIdea.title;

                if (projectIdeaSelect) {
                    projectIdeaSelect.value = String(activeIdea.id);
                }

                if (projectMode === "default") {
                    updateProjectIdeaDisplay(activeIdea);
                }
            } else {
                projectSearchInput.value = "";

                if (projectIdeaSelect) {
                    projectIdeaSelect.value = "";
                }

                if (projectMode === "default") {
                    updateProjectIdeaDisplay(null);
                }
            }

            closeProjectDropdown();

        } catch (error) {
            console.error("Project idea loading error:", error);

            projectIdeas = [];
            renderProjectIdeas();

            projectSearchInput.disabled = true;
            projectSearchInput.placeholder = "Unable to load saved ideas";

            setText(
                projectIdeaStatus,
                "Could not load your saved ideas. Refresh the page and try again."
            );
        }
    }

    /* =====================================================
       SELECT AND SAVE ACTIVE PROJECT
    ===================================================== */

    async function saveActiveProjectSelection(chosenId, chosenIdea) {
        if (!chosenIdea || chosenId == null) return false;

        const previousId = selectedProjectIdeaId;

        const previousIdea = projectIdeas.find(
            (idea) => String(idea.id) === String(previousId)
        );

        if (projectSearchInput) projectSearchInput.disabled = true;

        setText(projectIdeaStatus, "Saving your project selection...");

        try {
            const response = await fetch("/api/project-ideas/active", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    idea_id: chosenId
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Could not save the project selection."
                );
            }

            selectedProjectIdeaId = chosenIdea.id;
            projectMode = "default";
            temporaryProjectTitle = "";
            temporaryProjectDescription = "";

            if (projectSearchInput) {
                projectSearchInput.value = chosenIdea.title;
            }

            if (projectIdeaSelect) {
                projectIdeaSelect.value = String(chosenIdea.id);
            }

            updateProjectIdeaDisplay(chosenIdea);
            return true;

        } catch (error) {
            console.error("Saving project selection failed:", error);

            selectedProjectIdeaId = previousId;

            if (projectSearchInput) {
                projectSearchInput.value = previousIdea?.title || "";
            }

            if (projectIdeaSelect) {
                projectIdeaSelect.value = previousId != null
                    ? String(previousId)
                    : "";
            }

            setText(
                projectIdeaStatus,
                "Could not save your selection. Please try again."
            );

            return false;

        } finally {
            if (projectSearchInput) {
                projectSearchInput.disabled = projectIdeas.length === 0;
            }
        }
    }

    /* =====================================================
       SELECTOR EVENTS
    ===================================================== */

    projectSearchInput?.addEventListener("focus", openProjectDropdown);
    projectSearchInput?.addEventListener("click", openProjectDropdown);

    // Filter only when the user changes the search text.
    projectSearchInput?.addEventListener("input", () => {
        filterProjectIdeas(projectSearchInput.value);

        projectDropdownList?.classList.remove("hidden");
        projectCombobox?.classList.add("open");
    });

    projectDropdownList?.addEventListener("click", async (event) => {
        const item = event.target.closest(".combobox-item");

        if (
            !item ||
            item.classList.contains("no-result") ||
            item.style.display === "none"
        ) {
            return;
        }

        const chosenIdea = projectIdeas.find(
            (idea) => String(idea.id) === String(item.dataset.value)
        );

        if (!chosenIdea) return;

        const success = await saveActiveProjectSelection(
            chosenIdea.id,
            chosenIdea
        );

        if (success) closeProjectDropdown();
    });

    projectIdeaSelect?.addEventListener("change", async () => {
        const chosenIdea = projectIdeas.find(
            (idea) => String(idea.id) === String(projectIdeaSelect.value)
        );

        if (!chosenIdea) return;

        await saveActiveProjectSelection(chosenIdea.id, chosenIdea);
    });

    document.addEventListener("click", (event) => {
        if (
            projectCombobox &&
            !projectCombobox.contains(event.target)
        ) {
            closeProjectDropdown();
        }
    });

    projectSearchInput?.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeProjectDropdown();

        if (
            event.key === "ArrowDown" &&
            projectDropdownList?.classList.contains("hidden")
        ) {
            event.preventDefault();
            openProjectDropdown();
        }
    });

    /* =====================================================
       ONBOARDING HELPERS
    ===================================================== */

    function setOnboardingStatus(message) {
        setText(onboardingStatus, message || "");
    }

    function setOnboardingBusy(busy) {
        onboardingOverlay
            ?.querySelectorAll("[data-onboarding-choice]")
            .forEach((button) => {
                button.disabled = busy;
            });

        if (startOwnProjectBtn) {
            startOwnProjectBtn.disabled = busy;
        }
    }

    async function completeOnboarding() {
        if (!onboardingOverlay) return true;

        setOnboardingBusy(true);
        setOnboardingStatus("Saving your choice...");

        try {
            const response = await fetch(
                "/api/mentor/onboarding-complete",
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({})
                }
            );

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Could not save your onboarding choice."
                );
            }

            onboardingOverlay.remove();
            return true;

        } catch (error) {
            console.error("Onboarding completion error:", error);

            setOnboardingStatus(
                "Your choice could not be saved. Please check your connection and try again."
            );

            return false;

        } finally {
            setOnboardingBusy(false);
        }
    }

    /* =====================================================
       ONBOARDING CHOICES
    ===================================================== */

    async function chooseSavedIdeas() {
        if (!projectIdeas.length) {
            setOnboardingStatus(
                "You don't have saved ideas yet. Save one through Idea Evaluator, or choose another option."
            );
            return;
        }

        const idea = projectIdeas.find(
            (entry) =>
                selectedProjectIdeaId != null &&
                String(entry.id) === String(selectedProjectIdeaId)
        ) || projectIdeas[0];

        const success = await saveActiveProjectSelection(idea.id, idea);

        if (!success) {
            setOnboardingStatus(
                "We couldn't select that saved idea. Please try again."
            );
            return;
        }

        await completeOnboarding();
    }

    async function chooseSampleProject() {
        projectMode = "sample";
        selectedProjectIdeaId = null;

        temporaryProjectTitle = SAMPLE_PROJECT.title;
        temporaryProjectDescription = SAMPLE_PROJECT.description;

        displayTemporaryProject(
            SAMPLE_PROJECT.title,
            SAMPLE_PROJECT.description,
            "Using the sample project for this session only. It will not be saved as your idea."
        );

        await completeOnboarding();
    }

    async function chooseGeneralQuestions() {
        projectMode = "general";
        selectedProjectIdeaId = null;
        temporaryProjectTitle = "";
        temporaryProjectDescription = "";

        displayTemporaryProject(
            "General Questions",
            "Ask programming, database, AI, debugging, or project-development questions without selecting a project.",
            "General question mode is active. No saved project is selected."
        );

        await completeOnboarding();
    }

    function showManualProjectFields() {
        if (!manualFields) return;

        manualFields.hidden = false;

        setOnboardingStatus(
            "Enter a title and description. These details are only used for your current mentoring session."
        );

        manualTitleInput?.focus();
    }

    async function startManualProject() {
        const title = manualTitleInput?.value.trim() || "";
        const description = manualDescriptionInput?.value.trim() || "";

        if (!title) {
            setOnboardingStatus("Please enter your project title.");
            manualTitleInput?.focus();
            return;
        }

        if (title.length > 200) {
            setOnboardingStatus(
                "Your project title must be 200 characters or fewer."
            );
            manualTitleInput?.focus();
            return;
        }

        if (!description) {
            setOnboardingStatus("Please enter your project description.");
            manualDescriptionInput?.focus();
            return;
        }

        if (description.length > 10000) {
            setOnboardingStatus(
                "Your project description must be 10,000 characters or fewer."
            );
            manualDescriptionInput?.focus();
            return;
        }

        projectMode = "manual";
        selectedProjectIdeaId = null;
        temporaryProjectTitle = title;
        temporaryProjectDescription = description;

        displayTemporaryProject(
            title,
            description,
            "Using your project details for this session only. They have not been saved as a project idea."
        );

        await completeOnboarding();
    }

    onboardingOverlay
        ?.querySelectorAll("[data-onboarding-choice]")
        .forEach((button) => {
            button.addEventListener("click", async () => {
                const choice = button.dataset.onboardingChoice;

                if (choice === "saved") {
                    await chooseSavedIdeas();
                } else if (choice === "sample") {
                    await chooseSampleProject();
                } else if (choice === "manual") {
                    showManualProjectFields();
                } else if (choice === "general") {
                    await chooseGeneralQuestions();
                }
            });
        });

    startOwnProjectBtn?.addEventListener("click", startManualProject);

    manualDescriptionInput?.addEventListener("keydown", (event) => {
        if (
            event.key === "Enter" &&
            (event.ctrlKey || event.metaKey)
        ) {
            event.preventDefault();
            startManualProject();
        }
    });

    /* =====================================================
       CHAT ELEMENTS
    ===================================================== */

    const chatBody = $("chatBody");
    const chatInput = $("chatInput");
    const sendBtn = $("sendBtn");
    const clearChatBtn = $("clearChatBtn");

    function scrollChatToBottom() {
        if (!chatBody) return;

        chatBody.scrollTo({
            top: chatBody.scrollHeight,
            behavior: "smooth"
        });
    }

    function addUserMessage(message) {
        if (!chatBody) return;

        const wrapper = document.createElement("div");
        wrapper.className = "message user-message";

        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.textContent = getInitial(
            document.querySelector(".user-details strong")?.textContent || "Y"
        );

        const content = document.createElement("div");
        content.className = "message-content";

        const name = document.createElement("span");
        name.className = "message-name";
        name.textContent = "You";

        const bubble = document.createElement("div");
        bubble.className = "message-bubble";
        bubble.textContent = message;

        content.append(name, bubble);
        wrapper.append(avatar, content);
        chatBody.appendChild(wrapper);

        scrollChatToBottom();
    }

    function cleanAIResponse(text) {
        let cleaned = String(text || "").trim();

        cleaned = cleaned.replace(/\r\n?/g, "\n");
        cleaned = cleaned.replace(/\\n/g, "\n");
        cleaned = cleaned.replace(/\\+[ \t]*(?=\n|$)/g, "");
        cleaned = cleaned.replace(/\\+([#*_\-`])/g, "$1");
        cleaned = cleaned.replace(/\\+([.,!?])/g, "$1");

        const escaped = escapeHTML(cleaned);

        return escaped
            .replace(/^###\s+(.+)$/gm, "<strong>$1</strong>")
            .replace(/^##\s+(.+)$/gm, "<strong>$1</strong>")
            .replace(/^#\s+(.+)$/gm, "<strong>$1</strong>")
            .replace(/\*\*(.*?)\*\*/gs, "<strong>$1</strong>")
            .replace(/\*([^*\n]+)\*/g, "<em>$1</em>")
            .replace(/`([^`]+)`/g, "<code>$1</code>")
            .replace(/^\s*[-*]\s+/gm, "• ")
            .replace(/\n/g, "<br>");
    }

    function addAIMessage(message) {
        if (!chatBody) return;

        const wrapper = document.createElement("div");
        wrapper.className = "message ai-message";

        const avatar = document.createElement("div");
        avatar.className = "message-avatar";
        avatar.textContent = "✦";

        const content = document.createElement("div");
        content.className = "message-content";

        const name = document.createElement("span");
        name.className = "message-name";
        name.textContent = "AI Mentor";

        const bubble = document.createElement("div");
        bubble.className = "message-bubble";
        bubble.innerHTML = message;

        content.append(name, bubble);
        wrapper.append(avatar, content);
        chatBody.appendChild(wrapper);

        scrollChatToBottom();
    }

    /* =====================================================
       SEND MESSAGE TO MENTOR API
    ===================================================== */

    async function sendMessage(message) {
        message = String(message || "").trim();

        if (!message || !chatBody || !chatInput) return;

        addUserMessage(message);
        chatInput.value = "";
        resizeTextarea();

        if (sendBtn) sendBtn.disabled = true;

        try {
            const payload = {
                message,
                project_mode: projectMode
            };

            if (projectMode === "manual") {
                payload.project_title = temporaryProjectTitle;
                payload.project_description = temporaryProjectDescription;
                payload.idea_id = null;
            } else if (projectMode === "sample") {
                payload.project_title = SAMPLE_PROJECT.title;
                payload.project_description = SAMPLE_PROJECT.description;
                payload.idea_id = null;
            } else if (projectMode === "general") {
                payload.idea_id = null;
            } else {
                payload.idea_id = selectedProjectIdeaId;
            }

            const response = await fetch("/api/mentor", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.error || "Something went wrong.");
            }

            addAIMessage(cleanAIResponse(data.response || ""));

        } catch (error) {
            console.error("Mentor API error:", error);

            addAIMessage(
                "Sorry, I couldn't connect to the AI Mentor right now." +
                "<br><br>Please try again in a moment."
            );

        } finally {
            if (sendBtn) sendBtn.disabled = false;
            chatInput.focus();
        }
    }

    /* =====================================================
       QUICK QUESTIONS
    ===================================================== */

    function connectQuickQuestions(container) {
        if (!container) return;

        container.querySelectorAll(".quick-questions button").forEach((button) => {
            if (button.dataset.mentorConnected === "true") return;

            button.dataset.mentorConnected = "true";

            button.addEventListener("click", () => {
                const question = button.dataset.question;
                if (question) sendMessage(question);
            });
        });
    }

    connectQuickQuestions(document);

    sendBtn?.addEventListener("click", () => {
        sendMessage(chatInput?.value || "");
    });

    chatInput?.addEventListener("keydown", (event) => {
        if (event.key === "Enter" && !event.shiftKey) {
            event.preventDefault();
            sendMessage(chatInput.value);
        }
    });

    function resizeTextarea() {
        if (!chatInput) return;

        chatInput.style.height = "auto";
        chatInput.style.height =
            Math.min(chatInput.scrollHeight, 100) + "px";
    }

    chatInput?.addEventListener("input", resizeTextarea);

    /* =====================================================
       CLEAR CHAT
    ===================================================== */

    clearChatBtn?.addEventListener("click", () => {
        if (!chatBody) return;

        chatBody.replaceChildren();

        const wrapper = document.createElement("div");
        wrapper.className = "message ai-message";

        wrapper.innerHTML = `
            <div class="message-avatar">✦</div>
            <div class="message-content">
                <span class="message-name">AI Mentor</span>
                <div class="message-bubble">
                    Hello! I'm your AI Project Mentor.
                    <br><br>
                    What would you like to work on today?
                </div>
            </div>
        `;

        const quickQuestions = document.createElement("div");
        quickQuestions.className = "quick-questions";

        const label = document.createElement("span");
        label.textContent = "Try asking";
        quickQuestions.appendChild(label);

        [
            ["Project structure", "How should I structure my project?"],
            ["Technologies", "Which technologies should I use?"],
            ["Improve project", "How can I improve my project?"],
            ["Implementation steps", "Give me project implementation steps"]
        ].forEach(([text, question]) => {
            const button = document.createElement("button");
            button.type = "button";
            button.textContent = text;
            button.dataset.question = question;
            quickQuestions.appendChild(button);
        });

        chatBody.append(wrapper, quickQuestions);
        connectQuickQuestions(chatBody);
        scrollChatToBottom();
    });

    /* =====================================================
       PROJECT TOOLS
    ===================================================== */

    const toolItems = document.querySelectorAll(".tool-item");
    const toolModal = $("toolModal");
    const closeToolModal = $("closeToolModal");
    const modalTitle = $("modalTitle");
    const modalDescription = $("modalDescription");
    const modalInput = $("modalInput");
    const modalActionBtn = $("modalActionBtn");

    const toolData = {
        idea: {
            title: "Project Ideas",
            description:
                "Tell me about your interests, skills or preferred domain and I will help you explore suitable project ideas."
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

    function getPlaceholder(type) {
        const placeholders = {
            idea: "Example: I want to build an AI project for college students...",
            architecture: "Describe your project and its main features...",
            technology: "Example: I want to build a Flask-based AI application...",
            debug: "Paste the error message or describe the problem..."
        };

        return placeholders[type] || "Tell me what you need help with...";
    }

    toolItems.forEach((tool) => {
        tool.addEventListener("click", () => {
            const data = toolData[tool.dataset.tool];

            if (!data || !toolModal) return;

            setText(modalTitle, data.title);
            setText(modalDescription, data.description);

            if (modalInput) {
                modalInput.value = "";
                modalInput.placeholder = getPlaceholder(tool.dataset.tool);
            }

            toolModal.classList.add("show");
            setTimeout(() => modalInput?.focus(), 100);
        });
    });

    modalActionBtn?.addEventListener("click", () => {
        const input = modalInput?.value.trim() || "";

        if (!input) {
            modalInput?.focus();
            return;
        }

        toolModal?.classList.remove("show");
        sendMessage(input);
        chatInput?.focus();
    });

    closeToolModal?.addEventListener("click", () => {
        toolModal?.classList.remove("show");
    });

    toolModal?.addEventListener("click", (event) => {
        if (event.target === toolModal) {
            toolModal.classList.remove("show");
        }
    });

    /* =====================================================
       ROADMAP BUTTON
    ===================================================== */

    $("viewRoadmapBtn")?.addEventListener("click", () => {
        window.location.href = "/roadmap";
    });

    /* =====================================================
       AI SUGGESTION
    ===================================================== */

    $("suggestionBtn")?.addEventListener("click", () => {
        sendMessage(
            "Review my current project architecture and tell me what I should improve."
        );
    });

    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    const notificationBtn = $("notificationBtn");
    const notificationPopup = $("notificationPopup");

    notificationBtn?.addEventListener("click", (event) => {
        event.stopPropagation();
        notificationPopup?.classList.toggle("show");
    });

    document.addEventListener("click", (event) => {
        if (
            notificationPopup &&
            notificationBtn &&
            !notificationPopup.contains(event.target) &&
            !notificationBtn.contains(event.target)
        ) {
            notificationPopup.classList.remove("show");
        }
    });

    /* =====================================================
       INITIAL LOAD
    ===================================================== */

    loadStudentProfile();
    loadProjectIdeas();

    console.log("AI Student Mentor - Project Mentor loaded.");
});
