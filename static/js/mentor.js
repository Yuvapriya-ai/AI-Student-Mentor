
/* ==========================================================
   AI STUDENT MENTOR
   Saved Project Selection + Profile Integration + Gemini AI
   File: static/js/mentor.js
========================================================== */

"use strict";

/* ----------------------------------------------------------
   1. API ENDPOINTS
---------------------------------------------------------- */

const MENTOR_API = {
    profile: "/api/profile",
    projectIdeas: "/api/project-ideas",
    activeProject: "/api/project-ideas/active",
    mentor: "/api/mentor"
};

/* ----------------------------------------------------------
   2. APPLICATION STATE
---------------------------------------------------------- */

const MentorApp = {
    student: null,
    savedProjects: [],
    activeProjectId: null,
    activeProjectTitle: "",
    activeProjectDescription: "",
    activeProjectMode: "default",
    selectedTool: null,
    isGenerating: false,
    conversationStarted: false,
    conversationHistory: [],
    searchIndex: -1
};

const MENTOR_TOOLS = {
    idea: {
        task: "ideas",
        title: "Project Ideas",
        description: "Generate suitable academic project ideas based on your profile."
    },
    objectives: {
        task: "objectives",
        title: "Project Objectives",
        description: "Generate objectives and expected outcomes for your project."
    },
    technology: {
        task: "technology",
        title: "Technology Recommendations",
        description: "Recommend suitable technologies and frameworks."
    },
    structure: {
        task: "structure",
        title: "Project Folder Structure",
        description: "Generate a clear project folder and file structure."
    },
    database: {
        task: "database",
        title: "Database Requirements",
        description: "Recommend database tables, fields, relationships and keys."
    },
    modules: {
        task: "modules",
        title: "Project Modules",
        description: "Break the project into practical functional modules."
    },
    development: {
        task: "steps",
        title: "Development Guidance",
        description: "Generate step-by-step implementation guidance."
    },
    timeline: {
        task: "timeline",
        title: "Development Timeline",
        description: "Create a weekly project development plan."
    },
    fullPlan: {
        task: "fullPlan",
        title: "Complete Project Blueprint",
        description: "Generate a complete project blueprint."
    }
};

/* ----------------------------------------------------------
   3. DOM HELPERS
---------------------------------------------------------- */

function mentorElement(id) {
    return document.getElementById(id);
}

function mentorText(id, value) {
    const element = mentorElement(id);

    if (element) {
        element.textContent = value ?? "";
    }
}

function mentorValue(id, value) {
    const element = mentorElement(id);

    if (element) {
        element.value = value ?? "";
    }
}

function mentorGetValue(id) {
    const element = mentorElement(id);

    return element ? element.value.trim() : "";
}

function mentorShow(element) {
    if (element) {
        element.hidden = false;
        element.classList.remove("hidden");
        element.style.display = "";

        if (element.id === "projectDropdownList") {
            const input = document.getElementById("projectSearchInput");
            if (input) {
                input.setAttribute("aria-expanded", "true");
            }
        }
    }
}

function mentorHide(element) {
    if (element) {
        element.hidden = true;
        element.classList.add("hidden");
        element.style.display = "none";

        if (element.id === "projectDropdownList") {
            const input = document.getElementById("projectSearchInput");
            if (input) {
                input.setAttribute("aria-expanded", "false");
            }
        }
    }
}

function mentorEscapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, character => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#039;"
    })[character]);
}


/* ----------------------------------------------------------
   4. NOTIFICATIONS
---------------------------------------------------------- */

function mentorNotify(message, type = "info") {
    let notification = mentorElement("mentorNotification");

    if (!notification) {
        notification = document.createElement("div");
        notification.id = "mentorNotification";

        Object.assign(notification.style, {
            position: "fixed",
            top: "20px",
            right: "20px",
            maxWidth: "360px",
            padding: "13px 18px",
            borderRadius: "10px",
            background: "#2563eb",
            color: "#ffffff",
            fontSize: "14px",
            lineHeight: "1.5",
            zIndex: "10000",
            boxShadow: "0 8px 24px rgba(37, 99, 235, 0.3)",
            border: "1px solid rgba(147, 197, 253, 0.4)"
        });

        document.body.appendChild(notification);
    }

    const colors = {
        success: "#172b63",
        error: "#991b1b",
        warning: "#92400e",
        info: "#172b63"
    };

    notification.style.background = colors[type] || colors.info;
    notification.style.boxShadow =
        type === "success"
            ? "0 8px 24px rgba(37, 99, 235, 0.3)"
            : "0 8px 24px rgba(0, 0, 0, 0.25)";

    notification.textContent = message;
    notification.style.display = "block";

    if (notification._hideTimer) {
        clearTimeout(notification._hideTimer);
    }

    notification._hideTimer = setTimeout(() => {
        notification.style.display = "none";
    }, 3500);
}

/* ----------------------------------------------------------
   5. API REQUEST HELPER
---------------------------------------------------------- */

async function mentorRequest(url, options = {}) {
    const response = await fetch(url, {
        credentials: "same-origin",
        ...options,
        headers: {
            ...(options.body ? { "Content-Type": "application/json" } : {}),
            ...(options.headers || {})
        }
    });

    const text = await response.text();
    let data = {};

    try {
        data = text ? JSON.parse(text) : {};
    } catch {
        throw new Error("The server returned an invalid response.");
    }

    if (!response.ok) {
        throw new Error(
            data.message ||
            data.error ||
            `Request failed (${response.status}).`
        );
    }

    if (data.success === false) {
        throw new Error(data.message || data.error || "The request failed.");
    }

    return data;
}

/* ----------------------------------------------------------
   6. PROFILE INTEGRATION
   Course, semester and skills come from /api/profile.
   They are not required as manual form fields.
---------------------------------------------------------- */

function mentorGetProfileObject(data) {
    if (!data || typeof data !== "object") {
        return {};
    }

    return data.profile ||
        data.student ||
        data.user ||
        data.data?.profile ||
        data;
}

function mentorGetProfileName(profile) {
    return profile.name ||
        profile.student_name ||
        profile.full_name ||
        "Student";
}

function mentorGetProfileCourse(profile) {
    return profile.course ||
        profile.program ||
        profile.degree ||
        "BCA Student";
}

function mentorGetProfileSemester(profile) {
    return profile.semester ||
        profile.current_semester ||
        profile.sem ||
        "";
}

function mentorGetProfileSkills(profile) {
    const skills = profile.skills ||
        profile.technical_skills ||
        profile.student_skills ||
        "";

    return Array.isArray(skills) ? skills.join(", ") : String(skills);
}

function mentorUpdateProfileUI(profile) {
    const name = mentorGetProfileName(profile);
    const course = mentorGetProfileCourse(profile);
    const semester = mentorGetProfileSemester(profile);
    const avatarLetter = name.trim().charAt(0).toUpperCase() || "S";

    // Support profile elements used by the current page and sidebar.
    [
        "sidebarStudentName",
        "topbarStudentName"
    ].forEach(id => mentorText(id, name));

    [
        "sidebarStudentCourse",
        "topbarStudentCourse"
    ].forEach(id => mentorText(id, course));

    [
        "sidebarAvatar",
        "topbarAvatar"
    ].forEach(id => mentorText(id, avatarLetter));

    document.querySelectorAll(".top-profile strong, .user-details strong")
        .forEach(element => {
            element.textContent = name;
        });

    document.querySelectorAll(".top-profile span, .user-details span")
        .forEach(element => {
            element.textContent = course;
        });

    document.querySelectorAll(".top-avatar, .user-avatar")
        .forEach(element => {
            element.textContent = avatarLetter;
        });

    /*
      Keep profile details in application state.
      These values will be sent to Gemini as context.
      No course/semester/skills fields need to be displayed
      in the Mentor form.
    */
    MentorApp.student = {
        ...profile,
        name,
        course,
        semester,
        skills: mentorGetProfileSkills(profile),
        email: profile.email || profile.student_email || ""
    };
}

async function mentorLoadProfile() {
    try {
        const data = await mentorRequest(MENTOR_API.profile);
        const profile = mentorGetProfileObject(data);

        mentorUpdateProfileUI(profile);
        return profile;
    } catch (error) {
        console.error("Could not load student profile:", error);
        MentorApp.student = MentorApp.student || {};
        return MentorApp.student;
    }
}

function mentorBuildStudentContext() {
    const student = MentorApp.student || {};

    return {
        name: student.name || "",
        course: student.course || "",
        semester: student.semester || "",
        skills: student.skills || "",
        career_goal: student.career_goal || student.careerGoal || "",
        email: student.email || ""
    };
}

/* ----------------------------------------------------------
   7. SAVED PROJECT HELPERS
---------------------------------------------------------- */

function mentorNormalizeProjects(data) {
    let projects = [];

    if (Array.isArray(data)) {
        projects = data;
    } else if (Array.isArray(data?.ideas)) {
        projects = data.ideas;
    } else if (Array.isArray(data?.projects)) {
        projects = data.projects;
    } else if (Array.isArray(data?.project_ideas)) {
        projects = data.project_ideas;
    } else if (Array.isArray(data?.data?.ideas)) {
        projects = data.data.ideas;
    } else if (Array.isArray(data?.data?.projects)) {
        projects = data.data.projects;
    }

    return projects.filter(project =>
        project &&
        (project.id !== undefined || project.project_id !== undefined) &&
        (project.title || project.project_title)
    );
}

function mentorProjectId(project) {
    return String(project.id ?? project.project_id ?? "");
}

function mentorProjectTitle(project) {
    return String(
        project.title ||
        project.project_title ||
        project.name ||
        "Untitled Project"
    );
}

function mentorProjectDescription(project) {
    return String(
        project.idea_description ||
        project.description ||
        project.project_description ||
        project.problem_statement ||
        project.summary ||
        project.idea ||
        ""
    );
}

function mentorProjectCategory(project) {
    return String(
        project.category ||
        project.domain ||
        project.project_type ||
        project.technology ||
        "Academic Project"
    );
}

async function mentorLoadSavedProjects() {
    try {
        const data = await mentorRequest(MENTOR_API.projectIdeas);

        MentorApp.savedProjects = mentorNormalizeProjects(data);

        mentorPopulateProjectSelect();
        mentorRenderProjectDropdown(mentorGetValue("projectSearchInput"));

        const status = mentorElement("projectIdeaStatus");

        if (status) {
            status.textContent = MentorApp.savedProjects.length
                ? `${MentorApp.savedProjects.length} saved project idea(s) available.`
                : "No saved project ideas found. You can enter a project manually.";
        }

        return MentorApp.savedProjects;
    } catch (error) {
        console.error("Could not load saved project ideas:", error);

        const status = mentorElement("projectIdeaStatus");

        if (status) {
            status.textContent = "Could not load saved ideas. You can enter a project manually.";
        }

        return [];
    }
}

/* ----------------------------------------------------------
   8. PROJECT SELECT CONTROL
---------------------------------------------------------- */

function mentorPopulateProjectSelect() {
    const select = mentorElement("projectIdeaSelect");

    if (!select) {
        return;
    }

    select.replaceChildren();

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a saved project";
    select.appendChild(placeholder);

    MentorApp.savedProjects.forEach(project => {
        const option = document.createElement("option");

        option.value = mentorProjectId(project);
        option.textContent = mentorProjectTitle(project);

        select.appendChild(option);
    });

    if (MentorApp.activeProjectId !== null) {
        select.value = String(MentorApp.activeProjectId);
    }
}

function mentorRenderProjectDropdown(searchText = "") {
    const list = mentorElement("projectDropdownList");

    if (!list) {
        return;
    }

    list.replaceChildren();
    MentorApp.searchIndex = -1;

    const query = String(searchText).trim().toLowerCase();

    const matches = MentorApp.savedProjects.filter(project => {
        const title = mentorProjectTitle(project).toLowerCase();
        const description = mentorProjectDescription(project).toLowerCase();

        return !query ||
            title.includes(query) ||
            description.includes(query);
    });

    if (!matches.length) {
        const item = document.createElement("li");
        item.textContent = MentorApp.savedProjects.length
            ? "No matching project ideas found."
            : "No saved project ideas available.";

        item.setAttribute("role", "option");
        item.setAttribute("aria-disabled", "true");
        item.className = "project-dropdown-empty";

        list.appendChild(item);
        mentorShow(list);
        return;
    }

    matches.forEach(project => {
        const item = document.createElement("li");

        item.setAttribute("role", "option");
        item.setAttribute("tabindex", "0");
        item.dataset.projectId = mentorProjectId(project);
        item.className = "project-dropdown-item";

        const title = document.createElement("div");
        title.className = "project-option-title";
        title.textContent = mentorProjectTitle(project);

        const description = document.createElement("div");
        description.className = "project-option-description";

        const projectDescription = mentorProjectDescription(project);
        description.textContent = projectDescription
            ? projectDescription.slice(0, 140) +
              (projectDescription.length > 140 ? "…" : "")
            : "No description available.";

        item.append(title, description);

        item.addEventListener("click", () => {
            mentorSelectProject(mentorProjectId(project));
        });

        item.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                mentorSelectProject(mentorProjectId(project));
            }
        });

        list.appendChild(item);
    });

    mentorShow(list);
}

function mentorHideProjectDropdown() {
    mentorHide(mentorElement("projectDropdownList"));
}

function mentorFindProject(id) {
    return MentorApp.savedProjects.find(project =>
        mentorProjectId(project) === String(id)
    );
}

/* ----------------------------------------------------------
   9. SELECT PROJECT
   Clicking a saved idea fills the title and description.
---------------------------------------------------------- */

async function mentorSelectProject(id, options = {}) {
    const project = mentorFindProject(id);

    if (!project) {
        mentorNotify("That saved project could not be found.", "warning");
        return;
    }

    MentorApp.activeProjectId = mentorProjectId(project);
    MentorApp.activeProjectTitle = mentorProjectTitle(project);
    MentorApp.activeProjectDescription = mentorProjectDescription(project);
    MentorApp.activeProjectMode = "saved";

    // Search input displays the selected project title.
    mentorValue("projectSearchInput", MentorApp.activeProjectTitle);

    // The hidden select stays in sync.
    const select = mentorElement("projectIdeaSelect");

    if (select) {
        select.value = MentorApp.activeProjectId;
    }

    // Automatically fill the project's description.
    mentorValue("mentorProjectDescription", MentorApp.activeProjectDescription);

    // Update the selected-project summary.
    mentorText("selectedProjectTitle", MentorApp.activeProjectTitle);

    mentorText(
        "selectedProjectDescription",
        MentorApp.activeProjectDescription || "No description has been saved for this idea."
    );

    const status = mentorElement("projectIdeaStatus");

    if (status) {
        status.textContent = "Project selected. Its title and description have been filled automatically.";
    }

    mentorHideProjectDropdown();

    // Hide onboarding once a saved project is selected.
    if (options.closeOnboarding !== false) {
        mentorHide(mentorElement("mentorOnboardingOverlay"));
    }

    // Set this saved idea as the active project for other mentor pages.
    try {
        await mentorRequest(MENTOR_API.activeProject, {
            method: "POST",
            body: JSON.stringify({
                idea_id: MentorApp.activeProjectId,
                project_id: MentorApp.activeProjectId,
                id: MentorApp.activeProjectId
            })
        });
    } catch (error) {
        // Local selection remains usable even if saving active state fails.
        console.warn("Could not save active project selection:", error);
    }

    mentorNotify("Project selected. You can now ask Gemini for project guidance.", "success");
}

/* ----------------------------------------------------------
   10. MANUAL PROJECT / SAMPLE / GENERAL MODE
---------------------------------------------------------- */

function mentorSetManualProject(title, description, mode = "manual") {
    MentorApp.activeProjectId = null;
    MentorApp.activeProjectTitle = String(title || "").trim();
    MentorApp.activeProjectDescription = String(description || "").trim();
    MentorApp.activeProjectMode = mode;

    mentorValue("projectSearchInput", MentorApp.activeProjectTitle);
    mentorValue("mentorProjectDescription", MentorApp.activeProjectDescription);

    mentorText(
        "selectedProjectTitle",
        MentorApp.activeProjectTitle || "No project selected"
    );

    mentorText(
        "selectedProjectDescription",
        MentorApp.activeProjectDescription || "Enter a project description or ask Gemini to suggest ideas."
    );

    const status = mentorElement("projectIdeaStatus");

    if (status) {
        status.textContent = mode === "general"
            ? "General project idea generation selected."
            : "Your project details are ready.";
    }

    mentorHideProjectDropdown();
}

function mentorHandleOnboardingChoice(choice) {
    if (choice === "saved") {
        mentorShow(mentorElement("projectSearchInput"));
        mentorRenderProjectDropdown("");

        const input = mentorElement("projectSearchInput");

        if (input) {
            input.focus();
        }

        if (!MentorApp.savedProjects.length) {
            mentorNotify("No saved ideas were found. Choose manual entry or general idea generation.", "warning");
        }

        return;
    }

    if (choice === "manual") {
        mentorShow(mentorElement("mentorManualProjectFields"));

        const title = mentorElement("mentorOnboardingProjectTitle");

        if (title) {
            title.focus();
        }

        return;
    }

    if (choice === "sample") {
        const sampleTitle = "AI Student Learning Assistant";
        const sampleDescription =
            "A web application that helps students understand academic topics, " +
            "plan learning activities, and receive AI-powered study and project guidance.";

        mentorSetManualProject(sampleTitle, sampleDescription, "sample");
        mentorHide(mentorElement("mentorOnboardingOverlay"));

        return;
    }

    if (choice === "general") {
        mentorSetManualProject("", "", "general");
        mentorHide(mentorElement("mentorOnboardingOverlay"));

        return;
    }
}

function mentorStartManualProject() {
    const title = mentorGetValue("mentorOnboardingProjectTitle");
    const description = mentorGetValue("mentorOnboardingProjectDescription");
    const status = mentorElement("mentorOnboardingStatus");

    if (!title && !description) {
        if (status) {
            status.textContent = "Enter a project title or description first.";
        }

        mentorNotify("Enter a project title or description first.", "warning");
        return;
    }

    mentorSetManualProject(title, description, "manual");
    mentorHide(mentorElement("mentorOnboardingOverlay"));
    mentorHide(mentorElement("mentorManualProjectFields"));

    mentorNotify("Your project details are ready.", "success");
}

/* ----------------------------------------------------------
   11. CURRENT PROJECT CONTEXT
---------------------------------------------------------- */

function mentorGetCurrentProject() {
    const title = mentorGetValue("projectSearchInput") ||
        MentorApp.activeProjectTitle;

    const description = mentorGetValue("mentorProjectDescription") ||
        MentorApp.activeProjectDescription;

    const selectedProject = MentorApp.activeProjectId !== null
        ? mentorFindProject(MentorApp.activeProjectId)
        : null;

    return {
        title: title.trim(),
        description: description.trim(),
        category: selectedProject
            ? mentorProjectCategory(selectedProject)
            : "Academic Project",
        idea_id: MentorApp.activeProjectMode === "saved"
            ? MentorApp.activeProjectId
            : null,
        project_mode: MentorApp.activeProjectMode
    };
}

function mentorBuildRequestContext() {
    const project = mentorGetCurrentProject();

    return {
        project,
        student: mentorBuildStudentContext(),
        difficulty: mentorGetValue("mentorDifficulty") || "Intermediate",
        deadline: mentorGetValue("mentorDeadline"),
        weeks: mentorGetValue("mentorWeeks")
    };
}

/* ----------------------------------------------------------
   12. GEMINI TASK PROMPTS
---------------------------------------------------------- */

function mentorBuildTaskPrompt(taskKey, context, extraInstructions = "") {
    const project = context.project;
    const student = context.student;

    const title = project.title || "Suggest a suitable academic project";
    const description = project.description || "No project description provided.";
    const skills = student.skills || "Use the student's available profile information.";
    const course = student.course || "Student's course";
    const semester = student.semester || "Not specified";
    const careerGoal = student.career_goal || "Not specified";

    const commonContext = `
STUDENT PROFILE
- Course: ${course}
- Semester: ${semester}
- Skills: ${skills}
- Career goal: ${careerGoal}

SELECTED PROJECT
- Title: ${title}
- Description: ${description}
- Category: ${project.category}
- Project mode: ${project.project_mode}

ADDITIONAL PLANNING DETAILS
- Difficulty: ${context.difficulty}
- Target deadline: ${context.deadline || "Not specified"}
- Available weeks: ${context.weeks || "Not specified"}

INSTRUCTIONS
1. Use the selected project as the main context.
2. Tailor recommendations to the student's course, semester, skills and career goal.
3. Keep the answer practical, clear and suitable for a BCA academic project when the profile indicates BCA.
4. Do not invent details about the student's profile.
5. If a detail is missing, state a reasonable assumption instead of claiming it is known.
6. Do not replace the selected project with an unrelated sample project.
`;

    const taskInstructions = {
        ideas: `
Generate 5 suitable academic project ideas based on the student's profile and career goal.
For each idea include:
- Project title
- Problem statement
- Proposed solution
- Main features
- Suggested technologies
- Difficulty level
Keep the ideas distinct and realistic for the student's current level.
`,

        fullPlan: `
Create a COMPLETE PROJECT BLUEPRINT with the following sections:

1. Project title and overview
2. Problem statement
3. Proposed solution
4. Project objectives
5. Scope and expected outcomes
6. Functional and non-functional requirements
7. Main features
8. Recommended technology stack with reasons
9. Project folder structure
10. Database tables, fields, primary keys and foreign keys
11. Functional modules and their responsibilities
12. Step-by-step development procedure
13. Weekly development timeline
14. Testing plan
15. Expected output
16. Possible future enhancements

Make the plan consistent throughout. Do not recommend conflicting technologies or database designs.
`,

        objectives: `
Generate the following for the selected project:
1. Project aim
2. One clear problem statement
3. 5 to 8 specific project objectives
4. Scope of the project
5. Expected outcomes
6. Functional requirements
7. Non-functional requirements
Make each objective measurable and relevant to the selected project.
`,

        technology: `
Recommend an appropriate technology stack for the selected project.
Include:
1. Frontend technologies
2. Backend framework
3. Database
4. AI/API requirements, if relevant
5. Supporting libraries and tools
6. Why each technology is suitable
7. Alternatives where useful
8. Installation requirements
9. Compatibility considerations
Avoid unnecessary technologies and explain which choices are essential.
`,

        structure: `
Generate a realistic project directory structure for the selected project.
Include:
1. Main project folder
2. Application entry point
3. Routes or controllers
4. Templates and static assets
5. Database connection and schema files
6. AI/service integration files, if needed
7. Configuration and environment files
8. Testing files
9. Requirements/dependency file
10. A brief explanation of the important files and folders
Make the structure consistent with the recommended technology stack.
Do not claim that these files already exist.
`,

        database: `
Design the database for the selected project.
Include:
1. Recommended database system
2. Table names and purposes
3. Columns and suitable data types
4. Primary keys and foreign keys
5. Relationships and cardinality
6. Important constraints and indexes
7. Sample records where useful
8. A simple explanation of the ER relationships
9. Security and data-validation considerations
Keep the schema appropriate to the actual project requirements.
`,

        modules: `
Break the selected project into logical functional modules.
For each module explain:
1. Module name
2. Purpose
3. Main features
4. Input and output
5. Database/API dependency
6. Implementation priority
Also identify the core modules that must be completed first.
`,

        steps: `
Provide a step-by-step development guide for the selected project.
Organize the steps in implementation order:
1. Requirements and planning
2. Environment setup
3. Database design and setup
4. Backend implementation
5. Frontend implementation
6. AI/API integration where applicable
7. Integration
8. Validation and error handling
9. Testing and debugging
10. Final demonstration preparation

For each step explain what to do, which files or components may be needed, and how to verify completion.
Do not skip important dependencies between steps.
`,

        timeline: `
Create a practical weekly development timeline for the selected project.
Use ${context.weeks || "6"} weeks as the planning target when possible.
Include:
1. Week number
2. Main tasks
3. Deliverables
4. Testing or review activities
5. Completion criteria
Prioritize a working minimum version before optional enhancements.
Include time for integration, debugging, documentation and demonstration.
`
    };

    const instructions = taskInstructions[taskKey] || taskInstructions.fullPlan;

    return `
You are the AI Project Mentor in an academic learning platform.

${commonContext}

REQUESTED TASK
${instructions}

${extraInstructions ? `ADDITIONAL STUDENT INSTRUCTIONS\n${extraInstructions}\n` : ""}

Return a well-organized response with descriptive headings and readable lists.
Keep the advice specific to the selected project.
`;
}

/* ----------------------------------------------------------
   13. CHAT MESSAGE RENDERING
---------------------------------------------------------- */

function mentorFormatText(text) {
    let safe = mentorEscapeHTML(text);

    // Basic Markdown support.
    safe = safe.replace(/^### (.+)$/gm, "<h4>$1</h4>");
    safe = safe.replace(/^## (.+)$/gm, "<h3>$1</h3>");
    safe = safe.replace(/^# (.+)$/gm, "<h2>$1</h2>");
    safe = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    safe = safe.replace(/\*(.+?)\*/g, "<em>$1</em>");
    safe = safe.replace(/`([^`]+)`/g, "<code>$1</code>");

    const lines = safe.split("\n");
    let html = "";
    let inList = false;

    lines.forEach(line => {
        const trimmed = line.trim();
        const isListItem = /^[-*•]\s+/.test(trimmed);
        const isNumbered = /^\d+[.)]\s+/.test(trimmed);

        if (isListItem || isNumbered) {
            if (!inList) {
                html += "<ul>";
                inList = true;
            }

            html += `<li>${trimmed.replace(/^([-*•]|\d+[.)])\s+/, "")}</li>`;
            return;
        }

        if (inList) {
            html += "</ul>";
            inList = false;
        }

        if (!trimmed) {
            html += "<br>";
        } else if (/^<h[234]>/.test(trimmed)) {
            html += trimmed;
        } else {
            html += `<p>${trimmed}</p>`;
        }
    });

    if (inList) {
        html += "</ul>";
    }

    return html;
}

function mentorAddMessage(role, message, options = {}) {
    const chatBody = mentorElement("chatBody");

    if (!chatBody) {
        console.warn("The chatBody element was not found.");
        return null;
    }

    const wrapper = document.createElement("div");

    wrapper.className = role === "user"
        ? "message user-message"
        : "message ai-message";

    const avatar = document.createElement("div");
    avatar.className = "message-avatar";
    avatar.textContent = role === "user" ? "Y" : "✦";

    const content = document.createElement("div");
    content.className = "message-content";

    if (role !== "user") {
        const name = document.createElement("span");
        name.className = "message-name";
        name.textContent = role === "system"
            ? "System"
            : "Gemini Project Mentor";

        content.appendChild(name);
    }

    const bubble = document.createElement("div");
    bubble.className = "message-bubble";

    if (options.loading) {
        bubble.textContent = message;
        wrapper.dataset.loading = "true";
    } else if (role === "user") {
        bubble.textContent = message;
    } else {
        bubble.innerHTML = mentorFormatText(message);
    }

    content.appendChild(bubble);
    wrapper.append(avatar, content);
   
chatBody.appendChild(wrapper);

// Scroll the messages inside the chat box to the latest message.
chatBody.scrollTop = chatBody.scrollHeight;

// Bring the chat box into view on the page.
requestAnimationFrame(() => {
    const chatSection = document.getElementById("chatBody");

    if (chatSection) {
        chatSection.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
    }
});

return wrapper;

}

function mentorClearChat() {
    const chatBody = mentorElement("chatBody");

    if (chatBody) {
        chatBody.replaceChildren();
    }

    MentorApp.conversationHistory = [];
    MentorApp.conversationStarted = false;

    mentorAddMessage(
        "assistant",
        "Hello! Select a saved project idea or enter your own project details. I can help with objectives, technologies, database design, modules, development steps and timelines."
    );

    mentorNotify("Conversation cleared.", "success");
}

/* ----------------------------------------------------------
   14. RESPONSE EXTRACTION
---------------------------------------------------------- */

function mentorExtractResponse(data) {
    if (typeof data === "string") {
        return data;
    }

    return data.response ||
        data.reply ||
        data.answer ||
        data.message ||
        data.output ||
        data.result ||
        data.text ||
        data.data?.response ||
        data.data?.reply ||
        data.data?.answer ||
        "The mentor did not return a response. Please try again.";
}

/* ----------------------------------------------------------
   15. GENERATE A TOOL RESPONSE
---------------------------------------------------------- */

async function mentorGenerate(taskKey, extraInstructions = "") {
    if (MentorApp.isGenerating) {
        return;
    }

    if (!MENTOR_TOOLS[taskKey]) {
        mentorNotify("This mentor tool is not available.", "warning");
        return;
    }

    const context = mentorBuildRequestContext();
    const tool = MENTOR_TOOLS[taskKey];

    /*
      Idea generation can work without an existing project.
      Other tools can work with either a selected project or
      manually entered project details.
    */
    if (
        taskKey !== "idea" &&
        taskKey !== "fullPlan" &&
        !context.project.title &&
        !context.project.description
    ) {
        mentorNotify(
            "Select a saved project or enter a project title and description first.",
            "warning"
        );

        const searchInput = mentorElement("projectSearchInput");

        if (searchInput) {
            searchInput.focus();
        }

        return;
    }

    const prompt = mentorBuildTaskPrompt(taskKey, context, extraInstructions);

    await mentorSendToGemini({
        message: prompt,
        task: tool.task,
        context,
        resultTitle: tool.title,
        resultDescription: tool.description
    });
}

/* ----------------------------------------------------------
   16. CHAT / GEMINI REQUEST
---------------------------------------------------------- */

async function mentorSendToGemini({
    message,
    task = "chat",
    context = mentorBuildRequestContext(),
    resultTitle = "AI Project Mentor",
    resultDescription = "Personalized guidance for your project."
}) {
    if (MentorApp.isGenerating) {
        return;
    }

    MentorApp.isGenerating = true;

    const sendButton = mentorElement("sendBtn");
    const generateButton = mentorElement("generateBlueprintBtn");
    const blueprintButton = mentorElement("blueprintActionBtn");

    if (sendButton) {
        sendButton.disabled = true;
    }

    if (generateButton) {
        generateButton.disabled = true;
    }

    if (blueprintButton) {
        blueprintButton.disabled = true;
    }

    const resultsSection = mentorElement("mentorResultsSection");

    mentorShow(resultsSection);
    mentorText("mentorResultsTitle", resultTitle);
    mentorText("mentorResultsDescription", resultDescription);

    const loadingMessage = mentorAddMessage(
        "assistant",
        "Thinking about your project...",
        { loading: true }
    );

    try {
        const project = context.project || mentorGetCurrentProject();
        const studentContext = context.student || mentorBuildStudentContext();

        /*
          Include project context in the actual message as well
          as the payload. This makes follow-up questions retain
          context even if the backend does not use every field.
        */
        const contextualMessage = `
${message}

CURRENT PROJECT CONTEXT
Project title: ${project.title || "Not specified"}
Project description: ${project.description || "Not specified"}
Project category: ${project.category || "Academic Project"}
Project mode: ${project.project_mode || "default"}

STUDENT PROFILE CONTEXT
Course: ${studentContext.course || "Not specified"}
Semester: ${studentContext.semester || "Not specified"}
Skills: ${studentContext.skills || "Not specified"}
Career goal: ${studentContext.career_goal || "Not specified"}

Difficulty: ${context.difficulty || "Intermediate"}
Deadline: ${context.deadline || "Not specified"}
Available weeks: ${context.weeks || "Not specified"}
`;

        const payload = {
            message: contextualMessage,
            idea_id: project.idea_id || null,
            project_id: project.idea_id || null,
            project_mode: project.project_mode || "default",
            task,
            project_title: project.title || "",
            category: project.category || "Academic Project",
            complexity: context.difficulty || "Intermediate",
            description: project.description || "",
            student_context: studentContext
        };

        const data = await mentorRequest(MENTOR_API.mentor, {
            method: "POST",
            body: JSON.stringify(payload)
        });

        const response = mentorExtractResponse(data);

        if (loadingMessage) {
            loadingMessage.remove();
        }

        mentorAddMessage("assistant", response);

        MentorApp.conversationHistory.push(
            { role: "user", content: message },
            { role: "assistant", content: response }
        );

        MentorApp.conversationStarted = true;

    } catch (error) {
        console.error("AI Project Mentor request failed:", error);

        if (loadingMessage) {
            loadingMessage.remove();
        }

        mentorAddMessage(
            "assistant",
            `I couldn't generate the response. ${error.message || "Please try again."}`
        );

        mentorNotify("Could not generate a response. Check the server and try again.", "error");

    } finally {
        MentorApp.isGenerating = false;

        if (sendButton) {
            sendButton.disabled = false;
        }

        if (generateButton) {
            generateButton.disabled = false;
        }

        if (blueprintButton) {
            blueprintButton.disabled = false;
        }
    }
}

/* ----------------------------------------------------------
   17. FOLLOW-UP QUESTIONS
---------------------------------------------------------- */

async function mentorSendFollowUp() {
    const input = mentorElement("chatInput");

    if (!input) {
        return;
    }

    const question = input.value.trim();

    if (!question) {
        return;
    }

    if (MentorApp.isGenerating) {
        return;
    }

    input.value = "";
    mentorAddMessage("user", question);

    const context = mentorBuildRequestContext();
    const project = context.project;

    const followUpPrompt = `
The student is asking a follow-up question about the current project.

CURRENT PROJECT
Title: ${project.title || "No project selected"}
Description: ${project.description || "Not provided"}

STUDENT QUESTION
${question}

Use the current project and student profile as context.
Answer the question directly. Do not switch to an unrelated project.
If the question requests a change to the previous recommendation, explain the updated recommendation.
`;

    await mentorSendToGemini({
        message: followUpPrompt,
        task: "chat",
        context,
        resultTitle: project.title
            ? `Mentor Chat: ${project.title}`
            : "AI Mentor Chat",
        resultDescription: "Ask follow-up questions about your project."
    });
}

/* ----------------------------------------------------------
   18. TOOL BUTTONS
---------------------------------------------------------- */

function mentorHandleToolClick(button) {
    const toolKey = button.dataset.tool;

    if (!toolKey || !MENTOR_TOOLS[toolKey]) {
        return;
    }

    MentorApp.selectedTool = toolKey;

    mentorGenerate(toolKey);
}

/* ----------------------------------------------------------
   19. OPTIONAL TOOL MODAL
---------------------------------------------------------- */

function mentorOpenToolModal(toolKey) {
    const tool = MENTOR_TOOLS[toolKey];

    if (!tool) {
        return;
    }

    MentorApp.selectedTool = toolKey;

    mentorText("modalTitle", tool.title);
    mentorText("modalDescription", tool.description);

    const modal = mentorElement("toolModal");

    if (modal) {
        mentorShow(modal);
    }
}

function mentorCloseToolModal() {
    mentorHide(mentorElement("toolModal"));
}

async function mentorRunModalTool() {
    const taskKey = MentorApp.selectedTool;

    if (!taskKey || !MENTOR_TOOLS[taskKey]) {
        mentorCloseToolModal();
        return;
    }

    const extraInstructions = mentorGetValue("modalInput");

    mentorCloseToolModal();
    await mentorGenerate(taskKey, extraInstructions);
}

/* ----------------------------------------------------------
   20. ROADMAP NAVIGATION
---------------------------------------------------------- */

function mentorOpenRoadmap() {
    window.location.href = "/roadmap";
}

/* ----------------------------------------------------------
   21. EVENT LISTENERS
---------------------------------------------------------- */

function mentorBindEvents() {
    const searchInput = mentorElement("projectSearchInput");

    if (searchInput) {
        searchInput.addEventListener("focus", () => {
            mentorRenderProjectDropdown(searchInput.value);
        });

        searchInput.addEventListener("input", () => {
            /*
              Typing a different title must not accidentally
              keep the previously selected saved idea ID.
            */
            const selectedTitle = MentorApp.activeProjectTitle;

            if (
                MentorApp.activeProjectMode === "saved" &&
                searchInput.value.trim() !== selectedTitle
            ) {
                MentorApp.activeProjectId = null;
                MentorApp.activeProjectTitle = "";
                MentorApp.activeProjectDescription = "";
                MentorApp.activeProjectMode = "manual";

                const select = mentorElement("projectIdeaSelect");

                if (select) {
                    select.value = "";
                }
            }

            mentorRenderProjectDropdown(searchInput.value);
        });

        searchInput.addEventListener("keydown", event => {
            const list = mentorElement("projectDropdownList");

            if (!list) {
                return;
            }

            const options = Array.from(
                list.querySelectorAll('[role="option"]:not([aria-disabled="true"])')
            );

            if (!options.length) {
                if (event.key === "Escape") {
                    mentorHideProjectDropdown();
                }
                return;
            }

            if (event.key === "ArrowDown") {
                event.preventDefault();

                MentorApp.searchIndex = Math.min(
                    MentorApp.searchIndex + 1,
                    options.length - 1
                );

                options[MentorApp.searchIndex].focus();

            } else if (event.key === "Escape") {
                mentorHideProjectDropdown();
            } else if (event.key === "Enter") {
                const exactMatch = MentorApp.savedProjects.find(project =>
                    mentorProjectTitle(project).toLowerCase() ===
                    searchInput.value.trim().toLowerCase()
                );

                if (exactMatch) {
                    event.preventDefault();
                    mentorSelectProject(mentorProjectId(exactMatch));
                }
            }
        });
    }

    document.addEventListener("click", event => {
        const dropdown = mentorElement("projectDropdownList");
        const input = mentorElement("projectSearchInput");

        if (
            dropdown &&
            input &&
            !dropdown.contains(event.target) &&
            !input.contains(event.target)
        ) {
            mentorHideProjectDropdown();
        }
    });

    const projectSelect = mentorElement("projectIdeaSelect");

    if (projectSelect) {
        projectSelect.addEventListener("change", () => {
            if (projectSelect.value) {
                mentorSelectProject(projectSelect.value);
            }
        });
    }

    // Complete project blueprint.
    ["generateBlueprintBtn", "blueprintActionBtn"].forEach(id => {
        const button = mentorElement(id);

        if (button) {
            button.addEventListener("click", () => {
                mentorGenerate("fullPlan");
            });
        }
    });

    // Eight planning tools.
    document.querySelectorAll(".tool-item[data-tool]").forEach(button => {
        button.addEventListener("click", () => {
            mentorHandleToolClick(button);
        });
    });

    // Follow-up chat.
    const sendButton = mentorElement("sendBtn");

    if (sendButton) {
        sendButton.addEventListener("click", mentorSendFollowUp);
    }

    const chatInput = mentorElement("chatInput");

    if (chatInput) {
        chatInput.addEventListener("keydown", event => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                mentorSendFollowUp();
            }
        });
    }

    // Clear conversation.
    const clearButton = mentorElement("clearChatBtn");

    if (clearButton) {
        clearButton.addEventListener("click", mentorClearChat);
    }

    // Open the full blueprint from a suggestion CTA, if present.
    const suggestionButton = mentorElement("suggestionBtn");

    if (suggestionButton) {
        suggestionButton.addEventListener("click", () => {
            mentorGenerate("fullPlan");
        });
    }

    const roadmapButton = mentorElement("viewRoadmapBtn");

    if (roadmapButton) {
        roadmapButton.addEventListener("click", mentorOpenRoadmap);
    }

    // Onboarding selection choices.
    document.querySelectorAll("[data-onboarding-choice]").forEach(button => {
        button.addEventListener("click", () => {
            mentorHandleOnboardingChoice(button.dataset.onboardingChoice);
        });
    });

    const manualStartButton = mentorElement("mentorStartOwnProject");

    if (manualStartButton) {
        manualStartButton.addEventListener("click", mentorStartManualProject);
    }

    // Close and run modal.
    const closeModalButton = mentorElement("closeToolModal");

    if (closeModalButton) {
        closeModalButton.addEventListener("click", mentorCloseToolModal);
    }

    const modalActionButton = mentorElement("modalActionBtn");

    if (modalActionButton) {
        modalActionButton.addEventListener("click", mentorRunModalTool);
    }

    // Escape closes optional modal and project dropdown.
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") {
            mentorCloseToolModal();
            mentorHideProjectDropdown();
        }
    });
}

/* ----------------------------------------------------------
   22. INITIALIZATION
---------------------------------------------------------- */

async function mentorInitialize() {
    mentorBindEvents();

    // Load profile and saved ideas from the existing backend.
    await Promise.all([
        mentorLoadProfile(),
        mentorLoadSavedProjects()
    ]);

    // Initial chat greeting.
    const chatBody = mentorElement("chatBody");

    if (chatBody && !chatBody.children.length) {
        mentorAddMessage(
            "assistant",
            "Welcome to AI Project Mentor! Select one of your saved project ideas to automatically fill in its title and description. Then choose a tool to generate project guidance."
        );
    }

    /*
      Keep onboarding visible only if it is present and has not
      already been dismissed by the page. No localStorage is used.
    */
    const onboarding = mentorElement("mentorOnboardingOverlay");

    if (onboarding && !onboarding.dataset.skipInitialDisplay) {
        mentorShow(onboarding);
    }

    console.log("AI Project Mentor initialized.");
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mentorInitialize);
} else {
    mentorInitialize();
}
