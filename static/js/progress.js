/* =========================================================
   AI STUDENT MENTOR
   PROJECT PROGRESS TRACKER JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", function () {


    /* =====================================================
       ELEMENTS
    ===================================================== */

    const taskName =
        document.getElementById("taskName");

    const taskMilestone =
        document.getElementById("taskMilestone");

    const taskPriority =
        document.getElementById("taskPriority");

    const taskDate =
        document.getElementById("taskDate");

    const addTaskBtn =
        document.getElementById("addTaskBtn");

    const taskList =
        document.getElementById("taskList");

    const emptyTaskState =
        document.getElementById("emptyTaskState");

    const clearCompletedBtn =
        document.getElementById("clearCompletedBtn");

    const filterButtons =
        document.querySelectorAll(".filter-btn");

    const notificationBtn =
        document.getElementById("notificationBtn");

    const notificationPopup =
        document.getElementById("notificationPopup");


    /* =====================================================
       OVERVIEW ELEMENTS
    ===================================================== */

    const overallPercentage =
        document.getElementById("overallPercentage");

    const completedTasks =
        document.getElementById("completedTasks");

    const pendingTasks =
        document.getElementById("pendingTasks");

    const milestoneCount =
        document.getElementById("milestoneCount");

    const bannerCompletion =
        document.getElementById("bannerCompletion");

    const bannerTasks =
        document.getElementById("bannerTasks");


    /* =====================================================
       PROGRESS ELEMENTS
    ===================================================== */

    const progressCircle =
        document.getElementById("progressCircle");

    const circlePercentage =
        document.getElementById("circlePercentage");

    const progressFill =
        document.getElementById("progressFill");

    const progressBarPercentage =
        document.getElementById("progressBarPercentage");

    const summaryCompleted =
        document.getElementById("summaryCompleted");

    const summaryPending =
        document.getElementById("summaryPending");

    const summaryTotal =
        document.getElementById("summaryTotal");


    /* =====================================================
       WEEKLY ELEMENTS
    ===================================================== */

    const weeklyCompleted =
        document.getElementById("weeklyCompleted");

    const weeklyPercentage =
        document.getElementById("weeklyPercentage");


    /* =====================================================
       STATE
    ===================================================== */

    let currentFilter = "all";

    let tasks = [];


    /* =====================================================
       DEFAULT PROJECT TASKS
    ===================================================== */

    const defaultTasks = [

        {
            id: 1,
            name: "Finalize project requirements",
            milestone: "Planning",
            priority: "High",
            date: "",
            completed: true
        },

        {
            id: 2,
            name: "Design dashboard interface",
            milestone: "Design",
            priority: "High",
            date: "",
            completed: true
        },

        {
            id: 3,
            name: "Create Student Profile module",
            milestone: "Development",
            priority: "Medium",
            date: "",
            completed: true
        },

        {
            id: 4,
            name: "Implement Learning Roadmap",
            milestone: "Development",
            priority: "Medium",
            date: "",
            completed: true
        },

        {
            id: 5,
            name: "Develop AI Project Mentor",
            milestone: "Development",
            priority: "High",
            date: "",
            completed: false
        },

        {
            id: 6,
            name: "Connect MySQL database",
            milestone: "Database",
            priority: "High",
            date: "",
            completed: false
        },

        {
            id: 7,
            name: "Integrate OpenAI API",
            milestone: "AI Integration",
            priority: "High",
            date: "",
            completed: false
        },

        {
            id: 8,
            name: "Test project modules",
            milestone: "Testing",
            priority: "Medium",
            date: "",
            completed: false
        },

        {
            id: 9,
            name: "Prepare project documentation",
            milestone: "Documentation",
            priority: "Medium",
            date: "",
            completed: false
        },

        {
            id: 10,
            name: "Prepare final viva presentation",
            milestone: "Final Presentation",
            priority: "Low",
            date: "",
            completed: false
        }

    ];


    /* =====================================================
       LOAD TASKS
    ===================================================== */

    function loadTasks() {

        const savedTasks =
            localStorage.getItem(
                "aiStudentMentorProgress"
            );

        if (savedTasks) {

            try {

                tasks =
                    JSON.parse(savedTasks);

            } catch (error) {

                tasks =
                    defaultTasks;

            }

        } else {

            tasks =
                defaultTasks;

            saveTasks();

        }

    }


    /* =====================================================
       SAVE TASKS
    ===================================================== */

    function saveTasks() {

        localStorage.setItem(
            "aiStudentMentorProgress",
            JSON.stringify(tasks)
        );

    }


    /* =====================================================
       CALCULATE PROGRESS
    ===================================================== */

    function calculateProgress() {

        const total =
            tasks.length;

        const completed =
            tasks.filter(function (task) {

                return task.completed;

            }).length;

        const pending =
            total - completed;

        let percentage = 0;

        if (total > 0) {

            percentage =
                Math.round(
                    (completed / total) * 100
                );

        }

        return {
            total: total,
            completed: completed,
            pending: pending,
            percentage: percentage
        };

    }


    /* =====================================================
       UPDATE PROGRESS
    ===================================================== */

    function updateProgress() {

        const progress =
            calculateProgress();


        /* Overview */

        overallPercentage.textContent =
            `${progress.percentage}%`;

        completedTasks.textContent =
            progress.completed;

        pendingTasks.textContent =
            progress.pending;

        bannerCompletion.textContent =
            `${progress.percentage}%`;

        bannerTasks.textContent =
            progress.total;


        /* Main circle */

        circlePercentage.textContent =
            `${progress.percentage}%`;


        /* Progress bar */

        progressBarPercentage.textContent =
            `${progress.percentage}%`;

        progressFill.style.width =
            `${progress.percentage}%`;


        /* Circle */

        const degrees =
            progress.percentage * 3.6;

        progressCircle.style.background =
            `conic-gradient(
                #3b82f6 0deg,
                #4f46e5 ${degrees}deg,
                rgba(255,255,255,0.08)
                ${degrees}deg
            )`;


        /* Summary */

        summaryCompleted.textContent =
            progress.completed;

        summaryPending.textContent =
            progress.pending;

        summaryTotal.textContent =
            progress.total;


        /* Milestone count */

        const milestones =
            new Set(
                tasks.map(function (task) {

                    return task.milestone;

                })
            );

        milestoneCount.textContent =
            milestones.size;


        updateWeeklyProgress();

    }


    /* =====================================================
       RENDER TASKS
    ===================================================== */

    function renderTasks() {

        taskList.innerHTML = "";

        let filteredTasks = tasks;


        if (currentFilter === "pending") {

            filteredTasks =
                tasks.filter(function (task) {

                    return !task.completed;

                });

        }


        if (currentFilter === "completed") {

            filteredTasks =
                tasks.filter(function (task) {

                    return task.completed;

                });

        }


        if (filteredTasks.length === 0) {

            emptyTaskState.style.display =
                "flex";

            return;

        }


        emptyTaskState.style.display =
            "none";


        filteredTasks.forEach(function (task) {

            const taskItem =
                document.createElement("div");

            taskItem.className =
                "task-item";


            if (task.completed) {

                taskItem.classList.add(
                    "completed"
                );

            }


            const dateText =
                task.date
                    ? formatDate(task.date)
                    : "No due date";


            taskItem.innerHTML = `

                <button
                    class="task-check"
                    data-id="${task.id}"
                    title="Mark task complete">

                    ${task.completed ? "✓" : ""}

                </button>


                <div class="task-info">

                    <div class="task-name">
                        ${escapeHTML(task.name)}
                    </div>

                    <div class="task-meta">

                        <span class="milestone">
                            ${escapeHTML(task.milestone)}
                        </span>

                        <span>
                            ${dateText}
                        </span>

                        <span class="priority ${task.priority.toLowerCase()}">
                            ${escapeHTML(task.priority)}
                        </span>

                    </div>

                </div>


                <button
                    class="delete-task"
                    data-id="${task.id}"
                    title="Delete task">

                    ×

                </button>

            `;


            taskList.appendChild(
                taskItem
            );

        });


        attachTaskEvents();

    }


    /* =====================================================
       TASK EVENTS
    ===================================================== */

    function attachTaskEvents() {

        const checkButtons =
            document.querySelectorAll(
                ".task-check"
            );


        checkButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    toggleTask(id);

                }
            );

        });


        const deleteButtons =
            document.querySelectorAll(
                ".delete-task"
            );


        deleteButtons.forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const id =
                        Number(
                            button.dataset.id
                        );

                    deleteTask(id);

                }
            );

        });

    }


    /* =====================================================
       TOGGLE TASK
    ===================================================== */

    function toggleTask(id) {

        const task =
            tasks.find(function (item) {

                return item.id === id;

            });


        if (!task) {
            return;
        }


        task.completed =
            !task.completed;


        saveTasks();

        renderTasks();

        updateProgress();


        if (task.completed) {

            showNotification(
                "Task marked as completed."
            );

        } else {

            showNotification(
                "Task moved back to pending."
            );

        }

    }


    /* =====================================================
       DELETE TASK
    ===================================================== */

    function deleteTask(id) {

        const confirmed =
            confirm(
                "Delete this task?"
            );


        if (!confirmed) {
            return;
        }


        tasks =
            tasks.filter(function (task) {

                return task.id !== id;

            });


        saveTasks();

        renderTasks();

        updateProgress();


        showNotification(
            "Task deleted successfully."
        );

    }


    /* =====================================================
       ADD TASK
    ===================================================== */

    if (addTaskBtn) {

        addTaskBtn.addEventListener(
            "click",
            function () {

                const name =
                    taskName.value.trim();


                if (!name) {

                    showNotification(
                        "Please enter a task name."
                    );

                    taskName.focus();

                    return;

                }


                const newTask = {

                    id:
                        Date.now(),

                    name:
                        name,

                    milestone:
                        taskMilestone.value,

                    priority:
                        taskPriority.value,

                    date:
                        taskDate.value,

                    completed:
                        false

                };


                tasks.push(
                    newTask
                );


                saveTasks();

                renderTasks();

                updateProgress();


                taskName.value = "";

                taskDate.value = "";


                showNotification(
                    "New project task added."
                );

            }
        );

    }


    /* =====================================================
       FILTER BUTTONS
    ===================================================== */

    filterButtons.forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    filterButtons.forEach(
                        function (btn) {

                            btn.classList.remove(
                                "active"
                            );

                        }
                    );


                    button.classList.add(
                        "active"
                    );


                    currentFilter =
                        button.dataset.filter;


                    renderTasks();

                }
            );

        }
    );


    /* =====================================================
       CLEAR COMPLETED
    ===================================================== */

    if (clearCompletedBtn) {

        clearCompletedBtn.addEventListener(
            "click",
            function () {

                const completedCount =
                    tasks.filter(
                        function (task) {

                            return task.completed;

                        }
                    ).length;


                if (completedCount === 0) {

                    showNotification(
                        "There are no completed tasks to clear."
                    );

                    return;

                }


                const confirmed =
                    confirm(
                        "Remove all completed tasks?"
                    );


                if (!confirmed) {
                    return;
                }


                tasks =
                    tasks.filter(
                        function (task) {

                            return !task.completed;

                        }
                    );


                saveTasks();

                renderTasks();

                updateProgress();


                showNotification(
                    "Completed tasks cleared."
                );

            }
        );

    }


    /* =====================================================
       MILESTONES
    ===================================================== */

    function renderMilestones() {

        const milestoneGrid =
            document.getElementById(
                "milestoneGrid"
            );


        if (!milestoneGrid) {
            return;
        }


        milestoneGrid.innerHTML = "";


        const milestoneNames = [

            {
                name: "Planning",
                description:
                    "Requirements, objectives and project planning."
            },

            {
                name: "Design",
                description:
                    "Interface design and system structure."
            },

            {
                name: "Development",
                description:
                    "Development of the project modules."
            },

            {
                name: "AI Integration",
                description:
                    "LLM and OpenAI API integration."
            },

            {
                name: "Database",
                description:
                    "MySQL database setup and integration."
            },

            {
                name: "Testing",
                description:
                    "Testing modules and fixing implementation issues."
            },

            {
                name: "Documentation",
                description:
                    "Synopsis, documentation and project report."
            },

            {
                name: "Final Presentation",
                description:
                    "Viva preparation and final project presentation."
            }

        ];


        milestoneNames.forEach(
            function (milestone, index) {

                const milestoneTasks =
                    tasks.filter(
                        function (task) {

                            return (
                                task.milestone ===
                                milestone.name
                            );

                        }
                    );


                const total =
                    milestoneTasks.length;


                const completed =
                    milestoneTasks.filter(
                        function (task) {

                            return task.completed;

                        }
                    ).length;


                let percentage = 0;


                if (total > 0) {

                    percentage =
                        Math.round(
                            (completed / total) * 100
                        );

                }


                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "milestone-card";


                let status =
                    "Not Started";


                if (percentage === 100) {

                    status =
                        "Completed";

                } else if (percentage > 0) {

                    status =
                        "In Progress";

                }


                card.innerHTML = `

                    <div class="milestone-top">

                        <div class="milestone-number">
                            ${index + 1}
                        </div>

                        <span class="milestone-status">
                            ${status}
                        </span>

                    </div>


                    <h3>
                        ${milestone.name}
                    </h3>


                    <p>
                        ${milestone.description}
                    </p>


                    <div class="milestone-progress">

                        <div class="milestone-progress-label">

                            <span>
                                ${completed}/${total || 0} tasks
                            </span>

                            <strong>
                                ${percentage}%
                            </strong>

                        </div>


                        <div class="milestone-progress-track">

                            <div
                                class="milestone-progress-fill"
                                style="width:${percentage}%">
                            </div>

                        </div>

                    </div>

                `;


                milestoneGrid.appendChild(
                    card
                );

            }
        );

    }


    /* =====================================================
       PENDING TASKS
    ===================================================== */

    function renderPendingTasks() {

        const pendingGrid =
            document.getElementById(
                "pendingGrid"
            );


        if (!pendingGrid) {
            return;
        }


        pendingGrid.innerHTML = "";


        const pending =
            tasks.filter(
                function (task) {

                    return !task.completed;

                }
            );


        if (pending.length === 0) {

            pendingGrid.innerHTML = `

                <div class="pending-card">

                    <strong>
                        All tasks completed
                    </strong>

                    <p>
                        Excellent work! There are no
                        pending project tasks.
                    </p>

                </div>

            `;

            return;

        }


        pending.slice(0, 6).forEach(
            function (task) {

                const card =
                    document.createElement(
                        "div"
                    );


                card.className =
                    "pending-card";


                card.innerHTML = `

                    <strong>
                        ${escapeHTML(task.name)}
                    </strong>

                    <p>
                        ${escapeHTML(task.milestone)}
                        •
                        ${escapeHTML(task.priority)} priority
                    </p>

                    <button
                        data-id="${task.id}"
                        class="complete-pending-btn">

                        Mark Complete

                    </button>

                `;


                pendingGrid.appendChild(
                    card
                );

            }
        );


        const completeButtons =
            document.querySelectorAll(
                ".complete-pending-btn"
            );


        completeButtons.forEach(
            function (button) {

                button.addEventListener(
                    "click",
                    function () {

                        const id =
                            Number(
                                button.dataset.id
                            );

                        toggleTask(id);

                        renderMilestones();

                        renderPendingTasks();

                    }
                );

            }
        );

    }


    /* =====================================================
       WEEKLY PROGRESS
    ===================================================== */

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


        const completed =
            tasks.filter(
                function (task) {

                    return task.completed;

                }
            );


        const weeklyCount =
            Math.min(
                completed.length,
                7
            );


        const values =
            calculateWeeklyValues(
                weeklyCount
            );


        let weeklyTotal = 0;


        days.forEach(
            function (day, index) {

                const value =
                    values[index];


                weeklyTotal += value;


                const valueElement =
                    document.getElementById(
                        `${day}Value`
                    );


                const barElement =
                    document.getElementById(
                        `${day}Bar`
                    );


                if (valueElement) {

                    valueElement.textContent =
                        value;

                }


                if (barElement) {

                    const height =
                        Math.min(
                            value * 30,
                            100
                        );


                    barElement.style.height =
                        `${height}%`;

                }

            }
        );


        const totalTasks =
            tasks.length;


        let percentage = 0;


        if (totalTasks > 0) {

            percentage =
                Math.round(
                    (weeklyTotal / totalTasks) *
                    100
                );

        }


        weeklyCompleted.textContent =
            weeklyTotal;


        weeklyPercentage.textContent =
            `${percentage}%`;

    }


    /* =====================================================
       WEEKLY VALUES
    ===================================================== */

    function calculateWeeklyValues(count) {

        const values =
            [0, 0, 0, 0, 0, 0, 0];


        for (
            let i = 0;
            i < count;
            i++
        ) {

            values[i] = 1;

        }


        return values;

    }


    /* =====================================================
       DATE FORMAT
    ===================================================== */

    function formatDate(dateString) {

        if (!dateString) {
            return "No due date";
        }


        const date =
            new Date(
                dateString + "T00:00:00"
            );


        return date.toLocaleDateString(
            "en-IN",
            {
                day: "2-digit",
                month: "short",
                year: "numeric"
            }
        );

    }


    /* =====================================================
       ESCAPE HTML
    ===================================================== */

    function escapeHTML(text) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            text;


        return div.innerHTML;

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
            notificationPopup.querySelector(
                "p"
            );


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
       INITIALIZE
    ===================================================== */

    loadTasks();

    renderTasks();

    updateProgress();

    renderMilestones();

    renderPendingTasks();


});