
/* =========================================================
   AI STUDENT MENTOR — PERSONALIZED LEARNING ROADMAP
   Uses MySQL-backed /api/roadmap-data
========================================================= */

let roadmapData = null;
let roadmapId = null;
let currentCareerGoal = "";
let completedTopicKeys = new Set();
let activeFilter = "all";
let roadmapLoading = false;

/* =========================================================
   HELPERS
========================================================= */

function getInitial(name) {
    return name && name.trim()
        ? name.trim().charAt(0).toUpperCase()
        : "Y";
}

function escapeHtml(value) {
    const div = document.createElement("div");
    div.textContent = String(value ?? "");
    return div.innerHTML;
}

function topicKey(moduleNumber, topicName) {
    return `${moduleNumber}::${topicName.trim().toLowerCase()}`;
}

function getAllModules() {
    return roadmapData && Array.isArray(roadmapData.modules)
        ? roadmapData.modules
        : [];
}

function getTopics(module) {
    return Array.isArray(module.topics) ? module.topics : [];
}

function getTopicName(topic) {
    return typeof topic === "string"
        ? topic.trim()
        : String(topic?.name || topic?.topic_name || "").trim();
}

function getModuleNumber(module, index) {
    return Number(module.module_number || index + 1);
}

function showNotification(message) {
    const notification = document.createElement("div");
    notification.className = "roadmap-toast";
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => notification.classList.add("show"), 50);

    setTimeout(() => {
        notification.classList.remove("show");
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

/* =========================================================
   LESSON NAVIGATION
========================================================= */

function openLesson(moduleNumber, topicName) {
    if (!roadmapId) {
        showNotification("Please wait for your roadmap to load.");
        return;
    }

    if (!topicName || !String(topicName).trim()) {
        showNotification("No lesson is available for this module.");
        return;
    }

    const params = new URLSearchParams({
        roadmap_id: String(roadmapId),
        module: String(moduleNumber),
        topic: String(topicName).trim()
    });

    window.location.href = `/lesson?${params.toString()}`;
}

/* =========================================================
   STUDENT PROFILE
========================================================= */

async function loadStudentProfile() {
    try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (!response.ok || !data.success || !data.profile) {
            console.error("Could not load student profile.");
            return;
        }

        const profile = data.profile;
        const name = profile.name?.trim() || "Student";
        const initial = getInitial(name);

        const topAvatar = document.querySelector(".top-avatar");
        const topName = document.querySelector(".top-profile strong");
        const topCourse = document.querySelector(".top-profile span");
        const sideAvatar = document.querySelector(".user-avatar");
        const sideName = document.querySelector(".user-details strong");

        if (topAvatar) topAvatar.textContent = initial;
        if (topName) topName.textContent = name;
        if (sideAvatar) sideAvatar.textContent = initial;
        if (sideName) sideName.textContent = name;

        const course = (profile.course || "").trim();

if (topCourse) {
    topCourse.textContent = course
        ? `${course} Student`
        : "Student";
}

    } catch (error) {
        console.error("Profile loading error:", error);
    }
}

/* =========================================================
   ROADMAP LOADING
========================================================= */

async function loadPersonalizedRoadmap() {
    if (roadmapLoading) return;

    roadmapLoading = true;

    const container = document.querySelector(".roadmap-container");

    if (container) {
        container.innerHTML = `
            <div class="module-card">
                <h3>Preparing your learning roadmap...</h3>
                <p>Your personalized learning path is being loaded.</p>
            </div>`;
    }

    try {
        const response = await fetch("/api/roadmap-data");
        const data = await response.json();

        if (data.needs_goal) {
            roadmapData = null;
            roadmapId = null;
            completedTopicKeys.clear();

            showCareerGoalPrompt(data.message);
            return;
        }

        if (!response.ok || !data.success || !data.roadmap) {
            throw new Error(
                data.error ||
                data.message ||
                "Could not load your personalized roadmap."
            );
        }

        roadmapData = data.roadmap;
        roadmapId = data.roadmap_id;
        currentCareerGoal = data.career_goal || "";

        completedTopicKeys.clear();

        (data.completed_topics || []).forEach(topic => {
            if (
                Number(topic.completed) === 1 ||
                topic.completed === true
            ) {
                completedTopicKeys.add(
                    topicKey(
                        topic.module_number,
                        topic.topic_name
                    )
                );
            }
        });

        updateRoadmapHeadings();
        renderRoadmap();
        updateRoadmapProgress();

        console.log("Personalized roadmap loaded:", {
            careerGoal: currentCareerGoal,
            roadmapId: roadmapId,
            moduleCount: getAllModules().length
        });

    } catch (error) {
        console.error("Roadmap loading error:", error);

        if (container) {
            container.innerHTML = `
                <div class="module-card">
                    <h3>Unable to load your roadmap</h3>
                    <p>${escapeHtml(error.message)}</p>
                    <button
                        type="button"
                        class="module-btn"
                        id="retryRoadmapBtn">
                        Try Again
                    </button>
                </div>`;
        }

        document.getElementById("retryRoadmapBtn")
            ?.addEventListener("click", loadPersonalizedRoadmap);

    } finally {
        roadmapLoading = false;
    }
}

/* =========================================================
   CAREER GOAL REQUIRED
========================================================= */

function showCareerGoalPrompt(message) {
    const container = document.querySelector(".roadmap-container");

    if (container) {
        container.innerHTML = `
            <div class="module-card">
                <div class="module-heading">
                    <span class="module-number">
                        PERSONALIZE YOUR JOURNEY
                    </span>

                    <h3>Set your career goal first</h3>

                    <p>
                        ${escapeHtml(
                            message ||
                            "Add your career goal in Student Profile to generate your roadmap."
                        )}
                    </p>
                </div>

                <div class="module-footer">
                    <div class="topic-list">
                        <span>Choose your goal</span>
                        <span>Generate your roadmap</span>
                        <span>Track your progress</span>
                    </div>

                    <a class="module-btn primary-btn" href="/profile">
                        Open Student Profile
                    </a>
                </div>
            </div>`;
    }

    const title = document.querySelector(".roadmap-controls h2");

    if (title) {
        title.textContent = "Your Personalized Learning Path";
    }

    const overall = document.getElementById("overallPercent");
    if (overall) overall.textContent = "0%";

    const bar = document.getElementById("overallProgressBar");
    if (bar) bar.style.width = "0%";

    const completed = document.getElementById("completedModules");
    if (completed) completed.textContent = "0";

    const nextTitle = document.querySelector(".next-step-text h3");
    const nextDescription = document.querySelector(".next-step-text p");

    if (nextTitle) {
        nextTitle.textContent = "Set your career goal";
    }

    if (nextDescription) {
        nextDescription.textContent =
            "Open Student Profile to choose the career you want to work toward.";
    }
}

/* =========================================================
   UPDATE PAGE HEADINGS
========================================================= */

function updateRoadmapHeadings() {
    const title = document.querySelector(".roadmap-controls h2");

    if (title) {
        title.textContent =
            roadmapData.title ||
            `${currentCareerGoal} Learning Roadmap`;
    }

    const description = document.querySelector(".page-header p");

    if (description) {
        description.textContent =
            roadmapData.description ||
            `Follow your personalized learning path toward ${currentCareerGoal}.`;
    }

    const summaryDescription =
        document.querySelector(".summary-main p");

    if (summaryDescription) {
        summaryDescription.textContent =
            `Your learning journey toward ${currentCareerGoal}.`;
    }

    const goalLabel = document.querySelector(".summary-label");

    if (goalLabel) {
        goalLabel.textContent =
            `ROADMAP FOR ${currentCareerGoal.toUpperCase()}`;
    }
}

/* =========================================================
   RENDER PERSONALIZED MODULES
========================================================= */

function renderRoadmap() {
    const container = document.querySelector(".roadmap-container");

    if (!container) return;

    const modules = getAllModules();

    if (!modules.length) {
        container.innerHTML = `
            <div class="module-card">
                <h3>No learning modules found</h3>
                <p>
                    Your roadmap did not contain any modules.
                    Please try again.
                </p>
            </div>`;
        return;
    }

    const states = modules.map((module, index) => {
        const number = getModuleNumber(module, index);
        const topics = getTopics(module);

        const done = topics.filter(topic =>
            completedTopicKeys.has(
                topicKey(number, getTopicName(topic))
            )
        ).length;

        const percentage = topics.length
            ? Math.round((done / topics.length) * 100)
            : 0;

        return {
            module,
            number,
            topics,
            done,
            percentage,
            completed: topics.length > 0 &&
                done === topics.length
        };
    });

    const firstIncompleteIndex = states.findIndex(
        state => !state.completed
    );

    const currentIndex = firstIncompleteIndex === -1
        ? -1
        : firstIncompleteIndex;

    container.innerHTML = `
        <div class="timeline-line"></div>

        ${states.map((state, index) => {
            const status = state.completed
                ? "completed"
                : index === currentIndex
                    ? "current"
                    : "upcoming";

            const moduleClass = status === "completed"
                ? "completed-module"
                : status === "current"
                    ? "current-module"
                    : "upcoming-module";

            const statusText = status === "completed"
                ? "COMPLETED"
                : status === "current"
                    ? "IN PROGRESS"
                    : "UPCOMING";

            const statusClass = status === "completed"
                ? "completed-status"
                : status === "current"
                    ? "current-status"
                    : "upcoming-status";

            const moduleTitle = state.module.title ||
                `Module ${state.number}`;

            const moduleDescription =
                state.module.description || "";

            const topicPreview = state.topics
                .slice(0, 4)
                .map(topic =>
                    `<span>${escapeHtml(getTopicName(topic))}</span>`
                )
                .join("");

            const topicRows = state.topics.map(topic => {
                const name = getTopicName(topic);

                const done = completedTopicKeys.has(
                    topicKey(state.number, name)
                );

                const topicDescription =
                    typeof topic === "object"
                        ? topic.description || ""
                        : "";

                return `
                    <div class="topic-row">
                        <button
                            type="button"
                            class="topic-check ${done ? "done" : ""}"
                            data-module="${state.number}"
                            data-topic="${escapeHtml(name)}"
                            aria-label="${done ? "Mark incomplete" : "Mark complete"}: ${escapeHtml(name)}"
                            aria-pressed="${done}">
                            ${done ? "✓" : "○"}
                        </button>

                        <div class="topic-text">
                            <span>${escapeHtml(name)}</span>

                            ${topicDescription
                                ? `<p>${escapeHtml(topicDescription)}</p>`
                                : ""}
                        </div>
                    </div>`;
            }).join("");

            return `
                <div
                    class="roadmap-module ${moduleClass}"
                    data-status="${status}"
                    data-module-number="${state.number}">

                    <div class="timeline-marker ${status}">
                        ${status === "completed" ? "✓" : state.number}
                    </div>

                    <div class="module-card ${status === "current" ? "current-card" : ""}">

                        ${status === "current"
                            ? '<div class="current-ribbon">CURRENT FOCUS</div>'
                            : ""}

                        <div class="module-top">
                            <div class="module-heading">
                                <span class="module-number">
                                    MODULE ${String(state.number).padStart(2, "0")}
                                </span>

                                <h3>${escapeHtml(moduleTitle)}</h3>

                                <p>${escapeHtml(moduleDescription)}</p>
                            </div>

                            <span class="status ${statusClass}">
                                ${statusText}
                            </span>
                        </div>

                        <div class="module-progress">
                            <div class="progress-info">
                                <span>Progress</span>
                                <strong>${state.percentage}%</strong>
                            </div>

                            <div class="progress-track">
                                <div
                                    class="progress-bar"
                                    style="width:${state.percentage}%">
                                </div>
                            </div>
                        </div>

                        <div class="module-footer">
                            <div class="topic-list">
                                ${topicPreview}
                            </div>

                            <button
                                type="button"
                                class="module-btn ${status === "current" ? "primary-btn" : ""}"
                                data-action="continue"
                                data-module="${state.number}">
                                ${state.completed
                                    ? "Review"
                                    : status === "current"
                                        ? "Continue"
                                        : "Start"}
                            </button>
                        </div>

                        <div class="current-topics">
                            <div class="topic-heading">
                                <strong>Module Topics</strong>

                                <span>
                                    ${state.done} / ${state.topics.length} completed
                                </span>
                            </div>

                            ${topicRows ||
                                "<p>No topics are available for this module.</p>"}
                        </div>
                    </div>
                </div>`;
        }).join("")}
    `;

    applyRoadmapFilter();
    updateNextStep();
}

/* =========================================================
   SAVE TOPIC PROGRESS — MYSQL API
========================================================= */

async function saveTopicProgress(button) {
    const moduleNumber = Number(button.dataset.module);
    const topicName = button.dataset.topic;

    if (!topicName || !roadmapId) {
        showNotification("Roadmap data is not ready. Please try again.");
        return;
    }

    const key = topicKey(moduleNumber, topicName);
    const wasCompleted = completedTopicKeys.has(key);
    const newCompletedState = !wasCompleted;

    button.disabled = true;

    try {
        const response = await fetch("/api/roadmap-data", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                roadmap_id: roadmapId,
                module_number: moduleNumber,
                topic_name: topicName,
                completed: newCompletedState
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.error ||
                data.message ||
                "Could not save topic progress."
            );
        }

        if (newCompletedState) {
            completedTopicKeys.add(key);
        } else {
            completedTopicKeys.delete(key);
        }

        renderRoadmap();
        updateRoadmapProgress();

        showNotification(
            newCompletedState
                ? "Topic completed and progress saved!"
                : "Topic marked incomplete and progress saved."
        );

    } catch (error) {
        console.error("Topic progress save error:", error);

        showNotification(
            error.message || "Could not save progress."
        );

    } finally {
        button.disabled = false;
    }
}

/* =========================================================
   DYNAMIC PROGRESS
========================================================= */

function updateRoadmapProgress() {
    const modules = getAllModules();

    let totalTopics = 0;
    let completedTopics = 0;
    let completedModules = 0;

    modules.forEach((module, index) => {
        const number = getModuleNumber(module, index);
        const topics = getTopics(module);

        totalTopics += topics.length;

        const done = topics.filter(topic =>
            completedTopicKeys.has(
                topicKey(number, getTopicName(topic))
            )
        ).length;

        completedTopics += done;

        if (topics.length > 0 && done === topics.length) {
            completedModules++;
        }
    });

    const overallPercentage = totalTopics
        ? Math.round((completedTopics / totalTopics) * 100)
        : 0;

    const overallText = document.getElementById("overallPercent");
    const overallBar = document.getElementById("overallProgressBar");
    const completedText = document.getElementById("completedModules");

    if (overallText) {
        overallText.textContent = `${overallPercentage}%`;
    }

    if (overallBar) {
        overallBar.style.width = `${overallPercentage}%`;
    }

    if (completedText) {
        completedText.textContent = completedModules;
    }

    const stats = document.querySelectorAll(
        ".summary-stats > div strong"
    );

    if (stats[1]) {
        stats[1].textContent = overallPercentage === 100
            ? "0"
            : "1";
    }

    if (stats[2]) {
        stats[2].textContent = Math.max(
            modules.length -
                completedModules -
                (overallPercentage === 100 ? 0 : 1),
            0
        );
    }

    updateNextStep();
}

/* =========================================================
   DYNAMIC RECOMMENDED NEXT STEP
========================================================= */

function updateNextStep() {
    const title = document.querySelector(".next-step-text h3");
    const description = document.querySelector(".next-step-text p");
    const button = document.getElementById("nextStepBtn");

    if (!title || !description || !button) {
        console.warn(
            "Recommended Next Step elements are missing."
        );
        return;
    }

    delete button.dataset.module;
    delete button.dataset.topic;

    let nextTopic = null;

    for (const [index, module] of getAllModules().entries()) {
        const moduleNumber = getModuleNumber(module, index);
        const topics = getTopics(module);

        const unfinishedTopic = topics.find(topic => {
            const name = getTopicName(topic);

            return name &&
                !completedTopicKeys.has(
                    topicKey(moduleNumber, name)
                );
        });

        if (unfinishedTopic) {
            nextTopic = {
                moduleNumber,
                topicName: getTopicName(unfinishedTopic),
                moduleTitle: module.title ||
                    `Module ${moduleNumber}`
            };

            break;
        }
    }

    if (!nextTopic) {
        title.textContent = "Congratulations! Roadmap completed";

        description.textContent =
            "You've completed every topic in this career roadmap.";

        button.textContent = "Completed";
        button.disabled = true;

        return;
    }

    title.textContent = nextTopic.topicName;

    description.textContent =
        `Continue Module ${nextTopic.moduleNumber}: ` +
        `${nextTopic.moduleTitle}.`;

    button.textContent = "Start Learning";
    button.disabled = false;

    button.dataset.module = String(nextTopic.moduleNumber);
    button.dataset.topic = nextTopic.topicName;

    console.log("Recommended next lesson:", nextTopic);
}

/* =========================================================
   FILTER MODULES
========================================================= */

function applyRoadmapFilter() {
    document.querySelectorAll(".roadmap-module").forEach(module => {
        const status = module.dataset.status;

        module.classList.toggle(
            "hidden",
            activeFilter !== "all" &&
            activeFilter !== status
        );
    });

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.classList.toggle(
            "active",
            button.dataset.filter === activeFilter
        );
    });
}

/* =========================================================
   AI RESPONSE FORMATTING
========================================================= */

function formatInlineMarkdown(text) {
    let safe = escapeHtml(text);

    safe = safe.replace(
        /\*\*\*(.+?)\*\*\*/g,
        "<strong><em>$1</em></strong>"
    );

    safe = safe.replace(
        /\*\*(.+?)\*\*/g,
        "<strong>$1</strong>"
    );

    safe = safe.replace(
        /__(.+?)__/g,
        "<strong>$1</strong>"
    );

    safe = safe.replace(
        /\*([^*]+)\*/g,
        "<em>$1</em>"
    );

    safe = safe.replace(
        /`([^`]+)`/g,
        "<code>$1</code>"
    );

    return safe;
}

function formatAiResponse(markdown) {
    if (!markdown) return "";

    return String(markdown)
        .split(/\r?\n/)
        .map(line => {
            const text = line.trim();

            if (!text) return "";

            if (/^#{1,6}\s+/.test(text)) {
                return `<h4>${formatInlineMarkdown(
                    text.replace(/^#{1,6}\s+/, "")
                )}</h4>`;
            }

            if (/^[-*+]\s+/.test(text)) {
                return `<p class="ai-paragraph">• ${formatInlineMarkdown(
                    text.replace(/^[-*+]\s+/, "")
                )}</p>`;
            }

            if (/^\d+\.\s+/.test(text)) {
                return `<p class="ai-paragraph">${formatInlineMarkdown(
                    text
                )}</p>`;
            }

            return `<p class="ai-paragraph">${formatInlineMarkdown(
                text
            )}</p>`;
        })
        .join("");
}

function showAiThinking(element) {
    if (!element) return;

    element.classList.add("ai-thinking");
    element.textContent = "Thinking...";
}

function showAiResponse(element, response) {
    if (!element) return;

    element.classList.remove("ai-thinking");
    element.innerHTML = formatAiResponse(response);
    element.scrollTop = 0;
}

function showAiError(element, message) {
    if (!element) return;

    element.classList.remove("ai-thinking");
    element.textContent = message;
}

/* =========================================================
   FIND THE ACTUAL NEXT UNFINISHED TOPIC
========================================================= */

function getNextUncompletedTopic() {
    for (const [index, module] of getAllModules().entries()) {
        const moduleNumber = getModuleNumber(module, index);

        const unfinishedTopic = getTopics(module).find(topic => {
            const name = getTopicName(topic);

            return name &&
                !completedTopicKeys.has(
                    topicKey(moduleNumber, name)
                );
        });

        if (unfinishedTopic) {
            return {
                moduleNumber,
                moduleTitle: module.title ||
                    `Module ${moduleNumber}`,
                topicName: getTopicName(unfinishedTopic)
            };
        }
    }

    return null;
}

/* =========================================================
   AI MODULE REVIEW — GENERATE A PROGRESS-AWARE RECAP
========================================================= */

async function generateModuleReview(module, moduleNumber) {
    const aiModal = document.getElementById("aiModal");
    const output = document.getElementById("aiRoadmapResponseContent");
    const responseArea = document.getElementById("aiRoadmapResponse");

    if (!output || !responseArea) {
        showNotification("AI review area was not found on this page.");
        console.error("Missing AI review elements:", {
            outputFound: Boolean(output),
            responseAreaFound: Boolean(responseArea)
        });
        return;
    }

    const topics = getTopics(module)
        .map(topic => getTopicName(topic))
        .filter(Boolean);

    if (!topics.length) {
        showNotification("This module has no topics to review.");
        return;
    }

    /* Calculate this module's actual saved progress. */
    const completedTopics = topics.filter(topic =>
        completedTopicKeys.has(topicKey(moduleNumber, topic))
    );

    const completedCount = completedTopics.length;
    const totalCount = topics.length;
    const completionPercentage = Math.round(
        (completedCount / totalCount) * 100
    );

    const moduleCompleted = completedCount === totalCount;

    /* Find the real next unfinished topic across the roadmap. */
    const nextTopic = getNextUncompletedTopic();

    const nextTopicText = nextTopic
        ? `${nextTopic.topicName} (Module ${nextTopic.moduleNumber}: ${nextTopic.moduleTitle})`
        : "No next topic — every roadmap topic is complete.";

    const moduleTitle = module.title ||
        `Module ${moduleNumber}`;

    const prompt = `
You are the AI Student Mentor for a personalized learning roadmap.

Generate a revision recap for the module selected by the student.

STUDENT AND ROADMAP CONTEXT
Career goal: ${currentCareerGoal || "Not specified"}
Roadmap title: ${roadmapData?.title || "Personalized Learning Roadmap"}

SELECTED MODULE
Module number: ${moduleNumber}
Module title: ${moduleTitle}
Description: ${module.description || "Not specified"}

VERIFIED MODULE PROGRESS FROM THE APPLICATION
Completed topics: ${completedCount} out of ${totalCount}
Module completion: ${completionPercentage}%
Is this module completed? ${moduleCompleted ? "YES" : "NO"}

Topics saved as completed:
${completedTopics.length
    ? completedTopics.map((topic, index) => `${index + 1}. ${topic}`).join("\n")
    : "No topics are marked complete."}

All topics belonging to this module:
${topics.map((topic, index) => `${index + 1}. ${topic}`).join("\n")}

ACTUAL NEXT LEARNING STEP FROM THE APPLICATION
${nextTopicText}

IMPORTANT INSTRUCTIONS
1. Acknowledge the selected module's verified progress accurately.
2. ${moduleCompleted
    ? "This module IS COMPLETE. Do not say the student has not completed any modules or that this module is unfinished."
    : "This module is not yet complete. Do not claim that it is fully completed."}
3. Recommend the exact next learning step stated above. Do not invent a different next topic or skip ahead to a later module.
4. If every roadmap topic is complete, congratulate the student instead of recommending another topic.
5. Only discuss the selected module's topics in the recap. Do not add unrelated topics.
6. Do not contradict the verified progress information, even if other context suggests otherwise.

RECAP FORMAT
1. Module Summary — a short, clear explanation.
2. Key Concepts Explained Simply — cover the listed topics.
3. Practical Example — provide one relevant example, where appropriate.
4. Common Mistakes to Avoid — list useful mistakes and corrections.
5. Five Revision Questions and Answers — include exactly five.
6. What to Learn Next — use the actual next learning step provided above.

Use beginner-friendly language and clear headings.
Make the response practical, accurate, and suitable for a student revising this module.
`;

    aiModal?.classList.add("show");
    responseArea.classList.add("show");
    showAiThinking(output);

    try {
        const response = await fetch("/api/roadmap-ai", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                message: prompt,
                career_goal: currentCareerGoal,
                roadmap_title: roadmapData?.title || "",
                next_topic: nextTopic?.topicName || "",
                module_number: moduleNumber,
                module_title: moduleTitle,
                completed_topics: completedTopics,
                total_topics: totalCount,
                completed_count: completedCount,
                completion_percentage: completionPercentage,
                module_completed: moduleCompleted
            })
        });

        const data = await response.json();

        if (!response.ok || !data.success || !data.response) {
            throw new Error(
                data.error ||
                data.message ||
                "Unable to generate the module recap."
            );
        }

        showAiResponse(output, data.response);

    } catch (error) {
        console.error("Module review error:", error);

        showAiError(
            output,
            error.message || "Unable to connect to the AI Mentor."
        );
    }
}

/* =========================================================
   INITIALIZATION
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* Load student profile and saved roadmap */
    loadStudentProfile();
    loadPersonalizedRoadmap();

    /* =====================================================
       ROADMAP FILTERS
    ===================================================== */

    document.querySelectorAll(".filter-btn").forEach(button => {
        button.addEventListener("click", () => {
            activeFilter = button.dataset.filter || "all";
            applyRoadmapFilter();
        });
    });

    /* =====================================================
       TOPIC COMPLETION + MODULE BUTTONS
    ===================================================== */

    document.querySelector(".roadmap-container")
        ?.addEventListener("click", event => {

            /* Mark a topic complete or incomplete */
            const topicButton = event.target.closest(".topic-check");

            if (topicButton) {
                saveTopicProgress(topicButton);
                return;
            }

            /* Continue, Start, or Review a module */
            const moduleButton = event.target.closest(
                'button[data-action="continue"]'
            );

            if (!moduleButton) return;

            const number = Number(moduleButton.dataset.module);

            const module = getAllModules().find(
                (item, index) =>
                    getModuleNumber(item, index) === number
            );

            if (!module) {
                showNotification(
                    "Could not find this roadmap module."
                );
                return;
            }

            const topics = getTopics(module);

            const unfinishedTopic = topics.find(topic => {
                const name = getTopicName(topic);

                return name &&
                    !completedTopicKeys.has(topicKey(number, name));
            });

            /*
             * A fully completed module opens its AI revision recap.
             */
            if (topics.length > 0 && !unfinishedTopic) {
                generateModuleReview(module, number);
                return;
            }

            /*
             * An incomplete module opens its next unfinished lesson.
             */
            const selectedTopic = unfinishedTopic || topics[0];

            if (!selectedTopic) {
                showNotification(
                    "No lessons are available in this module."
                );
                return;
            }

            openLesson(number, getTopicName(selectedTopic));
        });

    /* =====================================================
       RECOMMENDED NEXT STEP — OPEN PERSONALIZED LESSON
    ===================================================== */

    document.getElementById("nextStepBtn")
        ?.addEventListener("click", () => {

            const button = document.getElementById("nextStepBtn");

            const number = button?.dataset.module;
            const topic = button?.dataset.topic;

            if (!number || !topic) {
                showNotification("Your roadmap is complete!");
                return;
            }

            openLesson(Number(number), topic);
        });

    /* =====================================================
       AI MENTOR MODAL
    ===================================================== */

    const aiButton = document.getElementById("aiRoadmapBtn");
    const aiModal = document.getElementById("aiModal");
    const closeModal = document.getElementById("closeAiModal");

    aiButton?.addEventListener("click", () => {
        aiModal?.classList.add("show");
    });

    closeModal?.addEventListener("click", () => {
        aiModal?.classList.remove("show");
    });

    aiModal?.addEventListener("click", event => {
        if (event.target === aiModal) {
            aiModal.classList.remove("show");
        }
    });

    /* =====================================================
       AI ROADMAP SUGGESTIONS
    ===================================================== */

    const aiOptions = document.querySelectorAll(
        ".ai-options button"
    );

    aiOptions.forEach(option => {
        option.addEventListener("click", async () => {

            const output = document.getElementById(
                "aiRoadmapResponseContent"
            );

            const responseArea = document.getElementById(
                "aiRoadmapResponse"
            );

            const message = option.textContent.trim();

            aiModal?.classList.add("show");
            responseArea?.classList.add("show");

            showAiThinking(output);

            aiOptions.forEach(button => {
                button.disabled = true;
            });

            try {
                const response = await fetch("/api/roadmap-ai", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        message: message,
                        career_goal: currentCareerGoal,
                        roadmap_title: roadmapData?.title || "",
                        next_topic: getNextUncompletedTopic()?.topicName || ""
                    })
                });

                const data = await response.json();

                if (
                    !response.ok ||
                    !data.success ||
                    !data.response
                ) {
                    throw new Error(
                        data.error ||
                        "Unable to get AI roadmap guidance."
                    );
                }

                showAiResponse(output, data.response);

            } catch (error) {
                console.error("Roadmap AI error:", error);

                showAiError(
                    output,
                    error.message ||
                    "Unable to connect to the AI Mentor."
                );

            } finally {
                aiOptions.forEach(button => {
                    button.disabled = false;
                });
            }
        });
    });

    /* =====================================================
       NOTIFICATIONS POPUP
    ===================================================== */

    const notificationButton =
        document.getElementById("notificationBtn");

    const notificationPopup =
        document.getElementById("notificationPopup");

    notificationButton?.addEventListener("click", event => {
        event.stopPropagation();
        notificationPopup?.classList.toggle("show");
    });

    document.addEventListener("click", event => {
        if (
            notificationPopup &&
            !notificationPopup.contains(event.target) &&
            !notificationButton?.contains(event.target)
        ) {
            notificationPopup.classList.remove("show");
        }
    });

    console.log(
        "AI Student Mentor — personalized roadmap initialized."
    );
});
