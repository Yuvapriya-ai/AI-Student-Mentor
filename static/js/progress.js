
/* =========================================================
   AI STUDENT MENTOR
   PROJECT PROGRESS TRACKER JAVASCRIPT
========================================================= */


/* =========================================================
   GLOBAL VARIABLES
========================================================= */

let tasks = [];
let currentFilter = "all";
let savedProgressProjects = [];

let selectedProject = {
    type: "main",
    id: null,
    title: "AI Student Mentor",
    description:
        "Monitor milestones, tasks, pending work and overall project completion from one place."
};

const addTaskBtn = document.getElementById("addTaskBtn");
const taskList = document.getElementById("taskList");
const emptyTaskState = document.getElementById("emptyTaskState");
const clearCompletedBtn = document.getElementById("clearCompletedBtn");
const progressProjectSelect =
    document.getElementById("progressProjectSelect");


/* =========================================================
   INITIALIZE
========================================================= */

document.addEventListener("DOMContentLoaded", function () {
    loadStudentProfile();

    setupTaskForm();
    setupFilters();
    setupClearCompleted();
    setupNotification();

    initializeProgressTracker();
});


/* =========================================================
   LOAD LOGGED-IN STUDENT PROFILE
========================================================= */

function getInitial(name) {
    if (!name || name.trim() === "") {
        return "Y";
    }

    return name.trim().charAt(0).toUpperCase();
}


async function loadStudentProfile() {
    try {
        const response = await fetch("/api/profile");
        const data = await response.json();

        if (!response.ok || !data.success || !data.profile) {
            console.error("Could not load student profile.");
            return;
        }

        const profile = data.profile;

        const name =
            profile.name && profile.name.trim()
                ? profile.name.trim()
                : "Student";

        const initial = getInitial(name);

        const topAvatar = document.querySelector(".top-avatar");

        if (topAvatar) {
            topAvatar.textContent = initial;
        }

        const topProfileName =
            document.querySelector(".top-profile strong");

        const topProfileCourse =
            document.querySelector(".top-profile span");

        if (topProfileName) {
            topProfileName.textContent = name;
        }

        const course = String(profile.course || "").trim();

        if (topProfileCourse) {
            topProfileCourse.textContent = course
                ? `${course} Student`
                : "Student";
        }

        const sidebarAvatar =
            document.querySelector(".user-avatar");

        if (sidebarAvatar) {
            sidebarAvatar.textContent = initial;
        }

        const sidebarName =
            document.querySelector(".user-details strong");

        if (sidebarName) {
            sidebarName.textContent = name;
        }

        console.log(
            "Progress Tracker profile loaded from MySQL:",
            profile
        );

    } catch (error) {
        console.error(
            "Progress Tracker profile loading error:",
            error
        );
    }
}


/* =========================================================
   LOAD SAVED PROJECTS
========================================================= */

async function loadProgressProjects() {
    if (!progressProjectSelect) {
        console.warn(
            "Project selector not found. Check progress.html."
        );
        return;
    }

    try {
        const response = await fetch("/api/project-ideas");
        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(
                data.message || "Could not load saved projects."
            );
        }

        savedProgressProjects = Array.isArray(data.ideas)
            ? data.ideas
            : [];

        progressProjectSelect.innerHTML = "";

        const mainOption = document.createElement("option");
        mainOption.value = "main";
        mainOption.textContent =
            "AI Student Mentor — Main Project";

        progressProjectSelect.appendChild(mainOption);

        savedProgressProjects.forEach(function (project) {
            const option = document.createElement("option");

            option.value = `saved:${project.id}`;
            option.textContent =
                project.title || "Untitled Project";

            progressProjectSelect.appendChild(option);
        });

        progressProjectSelect.value = "main";

        selectedProject = {
            type: "main",
            id: null,
            title: "AI Student Mentor",
            description:
                "Monitor milestones, tasks, pending work and overall project completion from one place."
        };

        updateProgressProjectBanner();

    } catch (error) {
        console.error("Error loading saved projects:", error);
        showNotification("Could not load saved projects.");
    }
}


/* =========================================================
   PROJECT SELECTOR
========================================================= */

function getSelectedProjectPayload() {
    return {
        project_type: selectedProject.type,
        project_id:
            selectedProject.type === "saved"
                ? selectedProject.id
                : null
    };
}


function updateProgressProjectBanner() {
    const titleElement =
        document.getElementById("progressProjectTitle");

    const descriptionElement =
        document.getElementById("progressProjectDescription");

    if (titleElement) {
        titleElement.textContent = selectedProject.title;
    }

    if (descriptionElement) {
        descriptionElement.textContent =
            selectedProject.description;
    }
}


function setupProgressProjectSelector() {
    if (!progressProjectSelect) {
        return;
    }

    progressProjectSelect.addEventListener(
        "change",
        async function () {
            const value = progressProjectSelect.value;

            if (value === "main") {
                selectedProject = {
                    type: "main",
                    id: null,
                    title: "AI Student Mentor",
                    description:
                        "Monitor milestones, tasks, pending work and overall project completion from one place."
                };

            } else if (value.startsWith("saved:")) {
                const projectId = value.substring("saved:".length);

                const project = savedProgressProjects.find(
                    function (item) {
                        return String(item.id) === String(projectId);
                    }
                );

                if (!project) {
                    showNotification(
                        "Could not find the selected project."
                    );

                    progressProjectSelect.value =
                        selectedProject.type === "main"
                            ? "main"
                            : `saved:${selectedProject.id}`;

                    return;
                }

                selectedProject = {
                    type: "saved",
                    id: project.id,
                    title: project.title || "Untitled Project",
                    description:
                        project.idea_description ||
                        project.description ||
                        "Track tasks and progress for this saved project."
                };

            } else {
                showNotification("Invalid project selection.");
                return;
            }

            updateProgressProjectBanner();

            const loaded = await loadTasks();

            if (loaded) {
                renderEverything();
            }
        }
    );
}


/* =========================================================
   LOAD TASKS FROM MYSQL FOR SELECTED PROJECT
========================================================= */

async function loadTasks() {
    try {
        const params = new URLSearchParams({
            project_type: selectedProject.type,
            project_id:
                selectedProject.type === "saved"
                    ? String(selectedProject.id)
                    : ""
        });

        const response = await fetch(
            `/api/progress?${params.toString()}`
        );

        if (!response.ok) {
            throw new Error(
                `Server returned ${response.status}`
            );
        }

        const data = await response.json();

        if (!data.success) {
            showNotification(
                data.message || "Could not load tasks."
            );

            return false;
        }

        tasks = Array.isArray(data.tasks)
            ? data.tasks
            : [];

        return true;

    } catch (error) {
        console.error("Error loading tasks:", error);

        showNotification("Could not load project tasks.");

        return false;
    }
}


/* =========================================================
   ADD TASK
========================================================= */

function setupTaskForm() {
    const addTaskButton =
        document.getElementById("addTaskBtn");

    if (!addTaskButton) {
        console.error("Add Task button not found.");
        return;
    }

    addTaskButton.addEventListener(
        "click",
        async function () {
            const taskNameInput =
                document.getElementById("taskName");

            const milestoneInput =
                document.getElementById("taskMilestone");

            const priorityInput =
                document.getElementById("taskPriority");

            const dateInput =
                document.getElementById("taskDate");

            const taskName = taskNameInput
                ? taskNameInput.value.trim()
                : "";

            const milestone = milestoneInput
                ? milestoneInput.value
                : "";

            const priority = priorityInput
                ? priorityInput.value
                : "";

            const dueDate = dateInput
                ? dateInput.value
                : "";

            if (!taskName || !milestone || !priority) {
                showNotification(
                    "Please fill all required fields."
                );
                return;
            }

            addTaskButton.disabled = true;

            try {
                const response = await fetch(
                    "/api/progress",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify({
                            task_name: taskName,
                            milestone: milestone,
                            priority: priority,
                            due_date: dueDate || null,
                            ...getSelectedProjectPayload()
                        })
                    }
                );

                const data = await response.json();

                if (!response.ok || !data.success) {
                    showNotification(
                        data.message || "Could not add task."
                    );
                    return;
                }

                const loaded = await loadTasks();

                if (loaded) {
                    renderEverything();
                }

                if (taskNameInput) {
                    taskNameInput.value = "";
                }

                if (dateInput) {
                    dateInput.value = "";
                }

                showNotification("Task added successfully!");

            } catch (error) {
                console.error("Error adding task:", error);

                showNotification(
                    "Could not connect to server."
                );

            } finally {
                addTaskButton.disabled = false;
            }
        }
    );
}


/* =========================================================
   RENDER EVERYTHING
========================================================= */

function renderEverything() {
    renderTasks();
    updateOverallProgress();
    updateOverviewCards();
    updateProjectCompletion();
    updateWeeklyProgress();
    renderMilestones();
    renderPendingTasks();
}


/* =========================================================
   RENDER TASK LIST
========================================================= */

function renderTasks() {
    if (!taskList) {
        return;
    }

    taskList.innerHTML = "";

    let filteredTasks = [];

    if (currentFilter === "pending") {
        filteredTasks = tasks.filter(function (task) {
            return !Boolean(task.completed);
        });

    } else if (currentFilter === "completed") {
        filteredTasks = tasks.filter(function (task) {
            return Boolean(task.completed);
        });

    } else {
        filteredTasks = [...tasks];
    }

    if (filteredTasks.length === 0) {
        if (emptyTaskState) {
            emptyTaskState.style.display = "flex";
        }
        return;
    }

    if (emptyTaskState) {
        emptyTaskState.style.display = "none";
    }

    filteredTasks.forEach(function (task) {
        const taskElement = document.createElement("div");
        taskElement.className = "task-item";

        const isCompleted = Boolean(task.completed);

        if (isCompleted) {
            taskElement.classList.add("completed");
        }

        const taskName =
            task.task_name || task.name || "Untitled Task";

        const milestone = task.milestone || "General";
        const priority = task.priority || "Medium";
        const dueDate = task.due_date || task.date || "";

        const checkButton = document.createElement("button");
        checkButton.type = "button";
        checkButton.className = "task-check";
        checkButton.innerHTML = isCompleted ? "✓" : "";
        checkButton.title = isCompleted
            ? "Mark as pending"
            : "Mark as completed";

        checkButton.addEventListener("click", function () {
            toggleTask(task.id);
        });

        const taskInfo = document.createElement("div");
        taskInfo.className = "task-info";

        const taskTitle = document.createElement("div");
        taskTitle.className = "task-name";
        taskTitle.textContent = taskName;

        const taskMeta = document.createElement("div");
        taskMeta.className = "task-meta";

        const milestoneText = document.createElement("span");
        milestoneText.className = "milestone";
        milestoneText.textContent = milestone;

        const dateText = document.createElement("span");
        dateText.textContent = formatDate(dueDate);

        taskMeta.appendChild(milestoneText);
        taskMeta.appendChild(dateText);

        taskInfo.appendChild(taskTitle);
        taskInfo.appendChild(taskMeta);

        const priorityBadge = document.createElement("span");
        priorityBadge.className =
            `priority ${String(priority).toLowerCase()}`;
        priorityBadge.textContent = priority;

        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.className = "delete-task";
        deleteButton.innerHTML = "×";
        deleteButton.title = "Delete task";

        deleteButton.addEventListener("click", function () {
            deleteTask(task.id);
        });

        taskElement.appendChild(checkButton);
        taskElement.appendChild(taskInfo);
        taskElement.appendChild(priorityBadge);
        taskElement.appendChild(deleteButton);

        taskList.appendChild(taskElement);
    });
}


/* =========================================================
   FORMAT DATE
========================================================= */

function formatDate(dateString) {
    if (!dateString) {
        return "No due date";
    }

    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
        return "No due date";
    }

    return date.toLocaleDateString(
        "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    );
}


/* =========================================================
   TOGGLE TASK COMPLETION
========================================================= */

async function toggleTask(id) {
    const task = tasks.find(function (item) {
        return Number(item.id) === Number(id);
    });

    if (!task) {
        return;
    }

    const newCompletedStatus = !Boolean(task.completed);

    try {
        const response = await fetch(
            "/api/progress",
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    completed: newCompletedStatus,
                    ...getSelectedProjectPayload()
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            showNotification(
                data.message || "Could not update task."
            );
            return;
        }

        const loaded = await loadTasks();

        if (loaded) {
            renderEverything();
        }

        showNotification(
            newCompletedStatus
                ? "Task marked as completed."
                : "Task moved back to pending."
        );

    } catch (error) {
        console.error("Error updating task:", error);

        showNotification("Could not connect to server.");
    }
}


/* =========================================================
   DELETE TASK
========================================================= */

async function deleteTask(id) {
    const confirmed = confirm("Delete this task?");

    if (!confirmed) {
        return;
    }

    try {
        const response = await fetch(
            "/api/progress",
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    id: id,
                    ...getSelectedProjectPayload()
                })
            }
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
            showNotification(
                data.message || "Could not delete task."
            );
            return;
        }

        const loaded = await loadTasks();

        if (loaded) {
            renderEverything();
        }

        showNotification("Task deleted successfully.");

    } catch (error) {
        console.error("Error deleting task:", error);

        showNotification("Could not connect to server.");
    }
}


/* =========================================================
   OVERALL PROGRESS CALCULATION
========================================================= */

function calculateProgress() {
    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(function (task) {
        return Boolean(task.completed);
    }).length;

    const percentage = totalTasks > 0
        ? Math.round((completedTasks / totalTasks) * 100)
        : 0;

    return {
        total: totalTasks,
        completed: completedTasks,
        pending: totalTasks - completedTasks,
        percentage: percentage
    };
}


/* =========================================================
   UPDATE OVERALL PROGRESS
========================================================= */

function updateOverallProgress() {
    const progress = calculateProgress();

    const progressPercentage =
        document.getElementById("progressPercentage");

    const progressBar =
        document.getElementById("progressBar");

    if (progressPercentage) {
        progressPercentage.textContent =
            `${progress.percentage}%`;
    }

    if (progressBar) {
        progressBar.style.width =
            `${progress.percentage}%`;
    }
}


/* =========================================================
   UPDATE OVERVIEW CARDS
========================================================= */

function updateOverviewCards() {
    const progress = calculateProgress();

    const bannerCompletion =
        document.getElementById("bannerCompletion");

    const bannerTasks =
        document.getElementById("bannerTasks");

    const overallPercentage =
        document.getElementById("overallPercentage");

    const completedTasks =
        document.getElementById("completedTasks");

    const pendingTasks =
        document.getElementById("pendingTasks");

    const milestoneCount =
        document.getElementById("milestoneCount");

    if (bannerCompletion) {
        bannerCompletion.textContent =
            `${progress.percentage}%`;
    }

    if (bannerTasks) {
        bannerTasks.textContent = progress.total;
    }

    if (overallPercentage) {
        overallPercentage.textContent =
            `${progress.percentage}%`;
    }

    if (completedTasks) {
        completedTasks.textContent = progress.completed;
    }

    if (pendingTasks) {
        pendingTasks.textContent = progress.pending;
    }

    if (milestoneCount) {
        const milestones = new Set(
            tasks
                .map(function (task) {
                    return task.milestone;
                })
                .filter(Boolean)
        );

        milestoneCount.textContent = milestones.size;
    }
}


/* =========================================================
   PROJECT COMPLETION SECTION
========================================================= */

function updateProjectCompletion() {
    const progress = calculateProgress();

    const circlePercentage =
        document.getElementById("circlePercentage");

    const progressBarPercentage =
        document.getElementById("progressBarPercentage");

    const progressFill =
        document.getElementById("progressFill");

    const summaryCompleted =
        document.getElementById("summaryCompleted");

    const summaryPending =
        document.getElementById("summaryPending");

    const summaryTotal =
        document.getElementById("summaryTotal");

    const progressCircle =
        document.getElementById("progressCircle");

    if (circlePercentage) {
        circlePercentage.textContent =
            `${progress.percentage}%`;
    }

    if (progressBarPercentage) {
        progressBarPercentage.textContent =
            `${progress.percentage}%`;
    }

    if (progressFill) {
        progressFill.style.width =
            `${progress.percentage}%`;
    }

    if (summaryCompleted) {
        summaryCompleted.textContent = progress.completed;
    }

    if (summaryPending) {
        summaryPending.textContent = progress.pending;
    }

    if (summaryTotal) {
        summaryTotal.textContent = progress.total;
    }

    if (progressCircle) {
        const degrees = (progress.percentage / 100) * 360;

        progressCircle.style.background =
            `conic-gradient(
                #3b82f6 0deg,
                #4f46e5 ${degrees}deg,
                rgba(255, 255, 255, 0.08) ${degrees}deg,
                rgba(255, 255, 255, 0.08) 360deg
            )`;
    }
}


/* =========================================================
   WEEKLY PROGRESS
========================================================= */

function updateWeeklyProgress() {
    const days = [
        "monday",
        "tuesday",
        "wednesday",
        "thursday",
        "friday",
        "saturday",
        "sunday"
    ];

    const values = [0, 0, 0, 0, 0, 0, 0];

    tasks.forEach(function (task) {
        if (!Boolean(task.completed) || !task.completed_at) {
            return;
        }

        const completedDate = new Date(task.completed_at);

        if (isNaN(completedDate.getTime())) {
            return;
        }

        const javascriptDay = completedDate.getUTCDay();

        const arrayIndex = javascriptDay === 0
            ? 6
            : javascriptDay - 1;

        values[arrayIndex]++;
    });

    let weeklyTotal = 0;

    days.forEach(function (day, index) {
        const value = values[index];
        weeklyTotal += value;

        const valueElement =
            document.getElementById(`${day}Value`);

        const barElement =
            document.getElementById(`${day}Bar`);

        if (valueElement) {
            valueElement.textContent = value;
        }

        if (barElement) {
            const height = value === 0
                ? 0
                : Math.min(value * 30, 100);

            barElement.style.height = `${height}%`;
        }
    });

    const totalTasks = tasks.length;

    const percentage = totalTasks > 0
        ? Math.round((weeklyTotal / totalTasks) * 100)
        : 0;

    const weeklyCompleted =
        document.getElementById("weeklyCompleted");

    const weeklyPercentage =
        document.getElementById("weeklyPercentage");

    if (weeklyCompleted) {
        weeklyCompleted.textContent = weeklyTotal;
    }

    if (weeklyPercentage) {
        weeklyPercentage.textContent = `${percentage}%`;
    }
}


/* =========================================================
   FILTER BUTTONS
========================================================= */

function setupFilters() {
    const filterButtons =
        document.querySelectorAll(".filter-btn");

    filterButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            filterButtons.forEach(function (btn) {
                btn.classList.remove("active");
            });

            button.classList.add("active");

            currentFilter =
                button.dataset.filter || "all";

            renderTasks();
        });
    });
}


/* =========================================================
   MILESTONES
========================================================= */

function renderMilestones() {
    const milestoneGrid =
        document.getElementById("milestoneGrid");

    if (!milestoneGrid) {
        return;
    }

    milestoneGrid.innerHTML = "";

    const milestoneMap = new Map();

    tasks.forEach(function (task) {
        const milestoneName = task.milestone || "General";

        if (!milestoneMap.has(milestoneName)) {
            milestoneMap.set(milestoneName, []);
        }

        milestoneMap.get(milestoneName).push(task);
    });

    if (milestoneMap.size === 0) {
        milestoneGrid.innerHTML = `
            <div class="empty-task-state"
                 style="display:flex; grid-column:1/-1;">
                <div class="empty-task-icon">◈</div>
                <h3>No milestones yet</h3>
                <p>
                    Add a task with a milestone to begin tracking project stages.
                </p>
            </div>
        `;
        return;
    }

    let milestoneNumber = 1;

    milestoneMap.forEach(function (milestoneTasks, milestoneName) {
        const completedCount = milestoneTasks.filter(
            function (task) {
                return Boolean(task.completed);
            }
        ).length;

        const totalCount = milestoneTasks.length;

        const percentage = totalCount > 0
            ? Math.round((completedCount / totalCount) * 100)
            : 0;

        let status = "Not Started";

        if (percentage === 100) {
            status = "Completed";
        } else if (percentage > 0) {
            status = "In Progress";
        }

        const card = document.createElement("div");
        card.className = "milestone-card";

        card.innerHTML = `
            <div class="milestone-top">
                <div class="milestone-number">
                    ${milestoneNumber}
                </div>
                <span class="milestone-status">
                    ${status}
                </span>
            </div>

            <h3>${escapeHTML(milestoneName)}</h3>

            <p>
                ${completedCount} of ${totalCount}
                task${totalCount === 1 ? "" : "s"} completed
            </p>

            <div class="milestone-progress">
                <div class="milestone-progress-label">
                    <span>Progress</span>
                    <strong>${percentage}%</strong>
                </div>

                <div class="milestone-progress-track">
                    <div
                        class="milestone-progress-fill"
                        style="width:${percentage}%">
                    </div>
                </div>
            </div>
        `;

        milestoneGrid.appendChild(card);
        milestoneNumber++;
    });
}


/* =========================================================
   PENDING TASKS
========================================================= */

function renderPendingTasks() {
    const pendingGrid =
        document.getElementById("pendingGrid");

    if (!pendingGrid) {
        return;
    }

    pendingGrid.innerHTML = "";

    const pendingTasks = tasks.filter(function (task) {
        return !Boolean(task.completed);
    });

    if (pendingTasks.length === 0) {
        pendingGrid.innerHTML = `
            <div class="pending-card">
                <strong>No pending tasks</strong>
                <p>All current project tasks are completed.</p>
            </div>
        `;
        return;
    }

    pendingTasks.forEach(function (task) {
        const card = document.createElement("div");
        card.className = "pending-card";

        const taskName =
            task.task_name || task.name || "Untitled Task";

        const milestone = task.milestone || "General";
        const dueDate = task.due_date || task.date || "";

        card.innerHTML = `
            <strong>${escapeHTML(taskName)}</strong>
            <p>
                ${escapeHTML(milestone)}
                ·
                ${escapeHTML(formatDate(dueDate))}
            </p>
            <button type="button">Mark Complete</button>
        `;

        const button = card.querySelector("button");

        if (button) {
            button.addEventListener("click", function () {
                toggleTask(task.id);
            });
        }

        pendingGrid.appendChild(card);
    });
}


/* =========================================================
   CLEAR COMPLETED TASKS
========================================================= */

function setupClearCompleted() {
    if (!clearCompletedBtn) {
        return;
    }

    clearCompletedBtn.addEventListener(
        "click",
        async function () {
            const completedTasks = tasks.filter(
                function (task) {
                    return Boolean(task.completed);
                }
            );

            if (completedTasks.length === 0) {
                showNotification(
                    "There are no completed tasks to clear."
                );
                return;
            }

            const confirmed = confirm(
                "Clear all completed tasks for this project?"
            );

            if (!confirmed) {
                return;
            }

            clearCompletedBtn.disabled = true;

            try {
                for (const task of completedTasks) {
                    const response = await fetch(
                        "/api/progress",
                        {
                            method: "DELETE",
                            headers: {
                                "Content-Type": "application/json"
                            },
                            body: JSON.stringify({
                                id: task.id,
                                ...getSelectedProjectPayload()
                            })
                        }
                    );

                    const data = await response.json();

                    if (!response.ok || !data.success) {
                        throw new Error(
                            data.message ||
                            "Could not delete completed task."
                        );
                    }
                }

                const loaded = await loadTasks();

                if (loaded) {
                    renderEverything();
                }

                showNotification("Completed tasks cleared.");

            } catch (error) {
                console.error(
                    "Error clearing completed tasks:",
                    error
                );

                await loadTasks();
                renderEverything();

                showNotification(
                    "Could not clear all completed tasks."
                );

            } finally {
                clearCompletedBtn.disabled = false;
            }
        }
    );
}


/* =========================================================
   NOTIFICATION
========================================================= */

function showNotification(message) {
    const notificationPopup =
        document.getElementById("notificationPopup");

    if (notificationPopup) {
        const paragraph = notificationPopup.querySelector("p");

        if (paragraph) {
            paragraph.textContent = message;
        }

        notificationPopup.classList.add("show");

        setTimeout(function () {
            notificationPopup.classList.remove("show");
        }, 2500);

        return;
    }

    const notification = document.createElement("div");
    notification.className = "progress-notification";
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(function () {
        notification.remove();
    }, 2500);
}


/* =========================================================
   NOTIFICATION BUTTON
========================================================= */

function setupNotification() {
    const notificationBtn =
        document.getElementById("notificationBtn");

    const notificationPopup =
        document.getElementById("notificationPopup");

    if (!notificationBtn || !notificationPopup) {
        return;
    }

    notificationBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        notificationPopup.classList.toggle("show");
    });

    document.addEventListener("click", function (event) {
        if (
            !notificationPopup.contains(event.target) &&
            event.target !== notificationBtn
        ) {
            notificationPopup.classList.remove("show");
        }
    });
}


/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {
    const div = document.createElement("div");

    div.textContent = value == null ? "" : String(value);

    return div.innerHTML;
}


/* =========================================================
   INITIALIZE PROGRESS TRACKER
========================================================= */

async function initializeProgressTracker() {
    await loadProgressProjects();

    setupProgressProjectSelector();

    const loaded = await loadTasks();

    if (!loaded) {
        tasks = [];
    }

    renderEverything();
}
