
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

// Get the saved course from the student's profile
const course = (profile.course || "").trim();

// Update the course label dynamically

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

    const notificationBtn = document.querySelector(".notification-btn");
    const notificationPanel = document.querySelector(".notification-panel");

    if (notificationBtn && notificationPanel) {
        notificationBtn.addEventListener("click", event => {
            event.stopPropagation();
            notificationPanel.classList.toggle("show");
        });

        document.addEventListener("click", event => {
            if (
                !notificationPanel.contains(event.target) &&
                !notificationBtn.contains(event.target)
            ) {
                notificationPanel.classList.remove("show");
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

    function renderWeeklyActivity(data) {
        const days = Array.isArray(data.weekly_activity)
            ? data.weekly_activity
            : [];

        const countByDay = new Map(
            days.map(day => [
                Number(day.day_index),
                Number(day.count) || 0
            ])
        );

        const maxCount = Math.max(
            0,
            ...days.map(day => Number(day.count) || 0)
        );

        document.querySelectorAll("[data-activity-day]").forEach(wrapper => {
            const index = Number(wrapper.dataset.activityDay);
            const count = countByDay.get(index) || 0;
            const bar = wrapper.querySelector("[data-activity-bar]");

            if (bar) {
                const height = maxCount > 0
                    ? (count / maxCount) * 100
                    : 0;

                bar.style.height = `${height}%`;
                bar.title = `${count} completed ${count === 1 ? "task" : "tasks"}`;
                bar.setAttribute(
                    "aria-label",
                    `${count} completed ${count === 1 ? "task" : "tasks"}`
                );
            }
        });

        document.querySelectorAll(".chart-tick").forEach(tick => {
            const level = Number(tick.dataset.tickLevel) || 0;
            tick.textContent = maxCount > 0
                ? String(Math.ceil(maxCount * level / 4))
                : "0";
        });

        const total = Number(data.weekly_total) || 0;

        setText(
            "#weeklyActivityMessage",
            total === 0
                ? "No completed tasks recorded this week yet."
                : `You completed ${total} ${total === 1 ? "task" : "tasks"} this week.`
        );
    }

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
       INITIALIZE
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
            headers: { "Accept": "application/json" }
        });

        if (!response.ok) {
            throw new Error("Could not load saved tasks.");
        }

        const data = await response.json();

        if (!data.success || !Array.isArray(data.tasks)) {
            throw new Error("Invalid task data.");
        }

        const tasks = data.tasks;

        // Remove the four hardcoded sample tasks.
        taskList.replaceChildren();

        if (tasks.length === 0) {
            taskList.innerHTML = `
                <div class="task-item">
                    <div class="task-info">
                        <strong>No tasks yet</strong>
                        <span>Add tasks in Progress Tracker to see them here.</span>
                    </div>
                </div>
            `;
            return;
        }

        // Show real tasks, with pending tasks first.
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
                task.due_date ? `Due: ${String(task.due_date).slice(0, 10)}` : "No due date"
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
