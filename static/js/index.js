document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    /* =====================================================
       STUDENT PROFILE
    ====================================================== */

    function getInitial(name) {
        return name && name.trim()
            ? name.trim().charAt(0).toUpperCase()
            : "Y";
    }

    async function loadStudentProfile() {
        try {
            const response = await fetch("/api/profile", {
                headers: { Accept: "application/json" },
                cache: "no-store"
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.profile) {
                throw new Error(data.message || "Could not load profile.");
            }

            const profile = data.profile;
            const name = profile.name?.trim() || "Student";
            const initial = getInitial(name);

            const topAvatar = document.querySelector(".top-avatar");
            const topName = document.querySelector(".top-profile strong");
            const topCourse = document.querySelector(".top-profile span");
            const sidebarAvatar = document.querySelector(".user-avatar");
            const sidebarName = document.querySelector(".user-details strong");
            const welcomeName = document.querySelector(".welcome-text h1 span");

            const course = (profile.course || "").trim();

            if (topCourse) {
                topCourse.textContent = course
                    ? `${course} Student`
                    : "Student";
            }

            if (topAvatar) topAvatar.textContent = initial;
            if (topName) topName.textContent = name;
            if (sidebarAvatar) sidebarAvatar.textContent = initial;
            if (sidebarName) sidebarName.textContent = name;
            if (welcomeName) welcomeName.textContent = `${name}!`;

        } catch (error) {
            console.error("Profile loading error:", error);
        }
    }

    /* =====================================================
       NOTIFICATIONS
    ====================================================== */

    
    /* =====================================================
       NOTIFICATIONS — REAL STUDENT TASKS
    ====================================================== */

    const notificationBtn = document.querySelector(".notification-btn");
    const notificationPanel = document.querySelector("#notificationPopup");

    if (notificationBtn && notificationPanel) {
        notificationBtn.setAttribute("aria-controls", "notificationPopup");
        notificationBtn.setAttribute("aria-expanded", "false");

        function renderTaskNotifications(tasks) {
            notificationPanel.replaceChildren();

            const heading = document.createElement("strong");
            heading.textContent = "Your Notifications";
            notificationPanel.appendChild(heading);

            const pendingTasks = tasks
                .filter(task =>
                    !(
                        task.completed === 1 ||
                        task.completed === true ||
                        task.completed === "1"
                    )
                )
                .sort((a, b) =>
                    new Date(b.created_at || 0) -
                    new Date(a.created_at || 0)
                );

            if (pendingTasks.length === 0) {
                const empty = document.createElement("p");
                empty.textContent = "You're all caught up! No pending tasks.";
                notificationPanel.appendChild(empty);
                return;
            }

            const resumeTitle = document.createElement("p");
            resumeTitle.textContent = "Where you stopped";
            resumeTitle.style.fontWeight = "700";
            notificationPanel.appendChild(resumeTitle);

            
const resumeTask = document.createElement("p");
resumeTask.textContent = pendingTasks[0].task_name || "Untitled task";
notificationPanel.appendChild(resumeTask);

const continueButton = document.createElement("button");
continueButton.type = "button";
continueButton.textContent = "Continue Task →";
continueButton.className = "notification-continue-btn";

continueButton.addEventListener("click", () => {
    window.location.href = "/progress";
});

notificationPanel.appendChild(continueButton);


            const pendingTitle = document.createElement("p");
            pendingTitle.textContent = `Tasks to complete (${pendingTasks.length})`;
            pendingTitle.style.fontWeight = "700";
            notificationPanel.appendChild(pendingTitle);

            pendingTasks.forEach(task => {
                const item = document.createElement("div");
                item.className = "notification-task";

                const name = document.createElement("p");
                name.textContent = task.task_name || "Untitled task";
                name.style.fontWeight = "600";

                const details = document.createElement("p");
                details.textContent =
                    `Milestone: ${task.milestone || "General"} · ` +
                    `Priority: ${task.priority || "Not specified"}`;

                item.append(name, details);

                if (task.due_date) {
                    const dueDate = new Date(task.due_date);
                    const due = document.createElement("p");

                    if (!Number.isNaN(dueDate.getTime())) {
                        due.textContent =
                            `Due: ${dueDate.toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                            })}`;

                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        dueDate.setHours(0, 0, 0, 0);

                        if (dueDate < today) {
                            due.textContent += " — OVERDUE";
                            due.style.color = "#dc2626";
                            due.style.fontWeight = "700";
                        }

                        item.appendChild(due);
                    }
                }

                notificationPanel.appendChild(item);
            });
        }

        async function loadTaskNotifications() {
            notificationPanel.replaceChildren();

            const loading = document.createElement("p");
            loading.textContent = "Loading your tasks...";
            notificationPanel.appendChild(loading);

            try {
                const response = await fetch("/api/progress", {
                    credentials: "same-origin",
                    headers: { Accept: "application/json" },
                    cache: "no-store"
                });

                const data = await response.json();

                if (!response.ok || !data.success ||
                    !Array.isArray(data.tasks)) {
                    throw new Error("Unable to retrieve your tasks.");
                }

                renderTaskNotifications(data.tasks);
            } catch (error) {
                console.error("Notification loading error:", error);
                notificationPanel.replaceChildren();

                const message = document.createElement("p");
                message.textContent =
                    "Could not load notifications. Please try again.";
                notificationPanel.appendChild(message);
            }
        }

        notificationBtn.addEventListener("click", event => {
            event.stopPropagation();

            const isOpen = notificationPanel.classList.toggle("show");
            notificationBtn.setAttribute("aria-expanded", String(isOpen));

            if (isOpen) {
                loadTaskNotifications();
            }
        });

        notificationPanel.addEventListener("click", event => {
            event.stopPropagation();
        });

        document.addEventListener("click", event => {
            if (
                !notificationPanel.contains(event.target) &&
                !notificationBtn.contains(event.target)
            ) {
                notificationPanel.classList.remove("show");
                notificationBtn.setAttribute("aria-expanded", "false");
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape") {
                notificationPanel.classList.remove("show");
                notificationBtn.setAttribute("aria-expanded", "false");
            }
        });
    }

    /* =====================================================
       DASHBOARD STATISTICS FROM MYSQL
    ====================================================== */

    function setText(selector, value) {
        const element = document.querySelector(selector);
        if (element) element.textContent = value;
    }

    /* =====================================================
       WEEKLY WEBSITE ACTIVITY CHART
       Uses website activity returned by Flask.
    ====================================================== */

    
function renderWeeklyActivity(data) {
    const days = Array.isArray(data.weekly_activity)
        ? data.weekly_activity
        : [];

    const total = Number(data.weekly_total) || 0;
    const ACTIVITY_SCALE = 10;

    const countByDay = new Map(
        days.map(day => [
            Number(day.day_index),
            Math.max(0, Number(day.count) || 0)
        ])
    );

    document.querySelectorAll("[data-activity-day]").forEach(wrapper => {
        const index = Number(wrapper.dataset.activityDay);
        const count = countByDay.get(index) || 0;
        const bar = wrapper.querySelector("[data-activity-bar]");

        if (bar) {
            const height = Math.min(
                100,
                (count / ACTIVITY_SCALE) * 100
            );

            bar.style.height = `${height}%`;
            bar.style.minHeight = count > 0 ? "4px" : "0";
            bar.style.transition = "height 0.3s ease";
            bar.setAttribute("title", `${count} website activities`);
            bar.setAttribute(
                "aria-label",
                `${days[index]?.day || "Day"}: ${count} website activities`
            );
        }
    });

    document.querySelectorAll(".chart-tick").forEach(tick => {
        const level = Number(tick.dataset.tickLevel) || 0;
        tick.textContent = String(Math.round(ACTIVITY_SCALE * level / 4));
    });

    setText(
        "#weeklyActivityMessage",
        total === 0
            ? "No website activity recorded this week yet."
            : `You recorded ${total} website ${total === 1 ? "activity" : "activities"} this week.`
    );
}

    /* =====================================================
       DASHBOARD PROGRESS STATISTICS
    ====================================================== */

    function renderDashboardStats(stats) {
        const completed = Number(stats.completed_tasks) || 0;
        const total = Number(stats.total_tasks) || 0;
        const percent = Number(stats.progress_percent) || 0;
        const remaining = Math.max(0, total - completed);

        setText("#overallProgress", `${percent}%`);
        setText("#tasksCompleted", String(completed));
        setText("#tasksTotal", String(total));

        setText(
            "#tasksRemainingText",
            total === 0
                ? "Add tasks in Project Progress Tracker"
                : `${remaining} ${remaining === 1 ? "task" : "tasks"} remaining`
        );

        
        setText("#currentStreak", String(Number(stats.current_streak) || 0));

        // AI Project Mentor session statistics
        const mentorSessionsElement = document.querySelector("#mentorSessions");
        const mentorSessionsMessage = document.querySelector("#mentorSessionsMessage");

        const mentorSessionsValue = Number(stats.mentor_sessions);

        if (
            stats.mentor_sessions !== undefined &&
            stats.mentor_sessions !== null &&
            stats.mentor_sessions !== "" &&
            Number.isFinite(mentorSessionsValue) &&
            mentorSessionsValue >= 0
        ) {
            setText("#mentorSessions", String(mentorSessionsValue));

            setText(
                "#mentorSessionsMessage",
                mentorSessionsValue === 1
                    ? "Successful AI response generated"
                    : "Successful AI responses generated"
            );
        } else {
            setText("#mentorSessions", "—");
            setText(
                "#mentorSessionsMessage",
                "Session statistics unavailable"
            );
        }


        const roadmapPercent = Number(stats.roadmap_percent) || 0;
        const roadmapCompleted = Number(stats.roadmap_completed) || 0;
        const roadmapRemaining = Number(stats.roadmap_remaining) || 0;

        setText("#roadmapProgressPercent", `${roadmapPercent}%`);
        setText("#roadmapCompletedCount", `✓ ${roadmapCompleted} completed`);
        setText("#roadmapRemainingCount", `◷ ${roadmapRemaining} remaining`);

        const progressFill = document.querySelector(".progress-fill");

        if (progressFill) {
            progressFill.style.width =
                `${Math.min(100, Math.max(0, percent))}%`;

            progressFill.setAttribute("aria-valuenow", String(percent));
        }
    }

    /* =====================================================
       LOAD DASHBOARD ACTIVITY
    ====================================================== */

    async function loadDashboardActivity() {
        try {
            const response = await fetch("/api/dashboard-activity", {
                headers: { Accept: "application/json" },
                cache: "no-store"
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Could not load dashboard activity."
                );
            }

            renderDashboardStats(data.stats || {});
            renderWeeklyActivity(data);

        } catch (error) {
            console.error("Dashboard activity loading error:", error);

            setText("#overallProgress", "—");
            setText("#tasksCompleted", "—");
            setText("#tasksTotal", "—");
            setText("#tasksRemainingText", "Activity unavailable");
            setText("#currentStreak", "—");
            setText("#roadmapProgressPercent", "—");
            setText("#roadmapCompletedCount", "Progress unavailable");
            setText("#roadmapRemainingCount", "");

            setText(
                "#weeklyActivityMessage",
                "Could not load activity. Please refresh the page."
            );
        }
    }

    /* =====================================================
       INITIALIZE DASHBOARD
    ====================================================== */

    loadStudentProfile();
    loadDashboardActivity();
});


/* ==========================================
   DASHBOARD: LOAD REAL PROJECT TASKS
========================================== */

async function loadDashboardTasks() {
    const taskList = document.querySelector(".tasks-card .task-list");

    if (!taskList) return;

    try {
        const response = await fetch("/api/progress", {
            method: "GET",
            credentials: "same-origin",
            headers: { Accept: "application/json" },
            cache: "no-store"
        });

        if (!response.ok) {
            throw new Error("Could not load saved tasks.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.tasks)) {
            throw new Error("Invalid task data.");
        }

        const tasks = data.tasks;

        taskList.replaceChildren();

        if (tasks.length === 0) {
            const emptyItem = document.createElement("div");
            emptyItem.className = "task-item";

            const info = document.createElement("div");
            info.className = "task-info";

            const title = document.createElement("strong");
            title.textContent = "No tasks yet";

            const message = document.createElement("span");
            message.textContent =
                "Add tasks in Progress Tracker to see them here.";

            info.append(title, message);
            emptyItem.appendChild(info);
            taskList.appendChild(emptyItem);
            return;
        }

        tasks.sort((a, b) =>
            Number(Boolean(a.completed)) - Number(Boolean(b.completed))
        );

        tasks.forEach(task => {
            const completed =
                task.completed === 1 ||
                task.completed === true ||
                task.completed === "1";

            const item = document.createElement("div");
            item.className = "task-item";

            const check = document.createElement("span");
            check.className = "task-check";
            check.textContent = completed ? "✓" : "○";
            check.setAttribute(
                "aria-label",
                completed ? "Completed" : "Pending"
            );

            const info = document.createElement("div");
            info.className = "task-info";

            const title = document.createElement("strong");
            title.textContent = task.task_name || "Untitled task";

            const details = document.createElement("span");

            const parts = [
                task.milestone || "General",
                task.priority || "Medium",
                task.due_date
                    ? `Due: ${String(task.due_date).slice(0, 10)}`
                    : "No due date"
            ];

            details.textContent = parts.join(" · ");

            const status = document.createElement("span");
            status.className = "task-status";
            status.textContent = completed ? "Completed" : "Pending";

            info.append(title, details);
            item.append(check, info, status);
            taskList.appendChild(item);
        });

    } catch (error) {
        console.error("Dashboard tasks error:", error);

        taskList.innerHTML = `
            <div class="task-item">
                <div class="task-info">
                    <strong>Tasks could not be loaded</strong>
                    <span>Please open Progress Tracker to check your saved tasks.</span>
                </div>
            </div>
        `;
    }
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", loadDashboardTasks);
} else {
    loadDashboardTasks();
}