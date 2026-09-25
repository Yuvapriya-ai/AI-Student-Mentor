document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       STUDENT IDENTITY
    ====================================================== */

    function getInitial(name) {

        if (!name || name.trim() === "") {
            return "Y";
        }

        return name.trim().charAt(0).toUpperCase();
    }


    /* =====================================================
       LOAD STUDENT PROFILE FROM MYSQL
    ====================================================== */

    async function loadStudentProfile() {

        try {

            const response = await fetch("/api/profile");

            const data = await response.json();

            if (!response.ok || !data.success || !data.profile) {

                console.error(
                    "Could not load student profile."
                );

                return;
            }

            const profile = data.profile;

            const name =
                profile.name &&
                profile.name.trim()
                    ? profile.name.trim()
                    : "Student";

            const initial = getInitial(name);


            /* -------------------------------------------------
               TOP RIGHT PROFILE
            ------------------------------------------------- */

            const topAvatar =
                document.querySelector(".top-avatar");

            if (topAvatar) {
                topAvatar.textContent = initial;
            }


            const topProfileName =
                document.querySelector(
                    ".top-profile strong"
                );

            if (topProfileName) {
                topProfileName.textContent = name;
            }


            /* -------------------------------------------------
               SIDEBAR PROFILE
            ------------------------------------------------- */

            const sidebarAvatar =
                document.querySelector(".user-avatar");

            if (sidebarAvatar) {
                sidebarAvatar.textContent = initial;
            }


            const sidebarName =
                document.querySelector(
                    ".user-details strong"
                );

            if (sidebarName) {
                sidebarName.textContent = name;
            }


            /* -------------------------------------------------
               WELCOME MESSAGE
            ------------------------------------------------- */

            const welcomeName =
                document.querySelector(
                    ".welcome-text h1 span"
                );

            if (welcomeName) {
                welcomeName.textContent = name + "!";
            }


            console.log(
                "Dashboard profile loaded from MySQL:",
                profile
            );

        } catch (error) {

            console.error(
                "Dashboard profile loading error:",
                error
            );

        }
    }


    /* =====================================================
       NOTIFICATIONS
    ====================================================== */

    const notificationBtn =
        document.querySelector(".notification-btn");

    const notificationPanel =
        document.querySelector(".notification-panel");

    if (notificationBtn && notificationPanel) {

        notificationBtn.addEventListener("click", (event) => {

            event.stopPropagation();

            notificationPanel.classList.toggle("show");

        });


        document.addEventListener("click", (event) => {

            if (
                !notificationPanel.contains(event.target) &&
                !notificationBtn.contains(event.target)
            ) {

                notificationPanel.classList.remove("show");

            }

        });

    }


    /* =====================================================
       DASHBOARD TASKS
    ====================================================== */

    const taskItems =
        document.querySelectorAll(".task-item");

    const STORAGE_KEY =
        "completedDashboardTasks";


    function loadCompletedTasks() {

        const completedTasks =
            JSON.parse(
                localStorage.getItem(STORAGE_KEY)
            ) || [];


        taskItems.forEach((task, index) => {

            if (completedTasks.includes(index)) {

                task.classList.add("completed");

            }

        });

    }


    taskItems.forEach((task, index) => {

        task.addEventListener("click", () => {

            task.classList.toggle("completed");


            let completedTasks =
                JSON.parse(
                    localStorage.getItem(STORAGE_KEY)
                ) || [];


            if (task.classList.contains("completed")) {

                if (!completedTasks.includes(index)) {

                    completedTasks.push(index);

                }

            } else {

                completedTasks =
                    completedTasks.filter(
                        item => item !== index
                    );

            }


            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(completedTasks)
            );

        });

    });


    /* =====================================================
       PROFILE UPDATE LISTENER
    ====================================================== */

    window.addEventListener("storage", event => {

        if (event.key === "studentProfile") {

            loadStudentProfile();

        }

    });


    /* =====================================================
       INITIALIZE DASHBOARD
    ====================================================== */

    loadStudentProfile();

    loadCompletedTasks();


    console.log(
        "AI Student Mentor - Dashboard loaded."
    );

});