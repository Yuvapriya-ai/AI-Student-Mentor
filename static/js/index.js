document.addEventListener("DOMContentLoaded", () => {

function getInitial(name) {

    if (!name || name.trim() === "") {
        return "Y";
    }

    return name.trim().charAt(0).toUpperCase();
}


function loadStudentProfile() {

    const savedProfile =
        JSON.parse(
            localStorage.getItem("studentProfile")
        );

    const name =
        savedProfile &&
        savedProfile.name &&
        savedProfile.name.trim()
            ? savedProfile.name.trim()
            : "Student";


    const initial = getInitial(name);


    /* =================================================
       TOP-RIGHT AVATAR
    ================================================= */

    const topAvatar =
        document.querySelector(".top-avatar");

    if (topAvatar) {
        topAvatar.textContent = initial;
    }


    /* =================================================
       TOP-RIGHT STUDENT NAME
    ================================================= */

    const topProfileName =
        document.querySelector(
            ".top-profile strong"
        );

    if (topProfileName) {
        topProfileName.textContent = name;
    }


    /* =================================================
       SIDEBAR AVATAR
    ================================================= */

    const sidebarAvatar =
        document.querySelector(".user-avatar");

    if (sidebarAvatar) {
        sidebarAvatar.textContent = initial;
    }


    /* =================================================
       SIDEBAR STUDENT NAME
    ================================================= */

    const sidebarName =
        document.querySelector(
            ".user-details strong"
        );

    if (sidebarName) {
        sidebarName.textContent = name;
    }


    /* =================================================
       WELCOME MESSAGE
    ================================================= */

    const welcomeName =
        document.querySelector(
            ".welcome-text h1 span"
        );

    if (welcomeName) {
        welcomeName.textContent = name + "!";
    }

}


/* =====================================================
   NOTIFICATION
====================================================== */

const notificationBtn =
    document.getElementById(
        "notificationBtn"
    );

const notificationPopup =
    document.getElementById(
        "notificationPopup"
    );


if (
    notificationBtn &&
    notificationPopup
) {

    notificationBtn.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            notificationPopup.classList.toggle(
                "show"
            );

        }
    );


    document.addEventListener(
        "click",
        event => {

            if (
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

}


/* =====================================================
   DASHBOARD TASKS
====================================================== */

const taskButtons =
    document.querySelectorAll(
        ".task-check"
    );


function loadCompletedTasks() {

    const completedTasks =
        JSON.parse(
            localStorage.getItem(
                "completedDashboardTasks"
            )
        ) || [];


    taskButtons.forEach(button => {

        const taskId =
            button.dataset.task;

        if (
            completedTasks.includes(taskId)
        ) {

            button.classList.add(
                "completed"
            );

        }

    });


    updateTaskCount();

}


function updateTaskCount() {

    const completedTasks =
        JSON.parse(
            localStorage.getItem(
                "completedDashboardTasks"
            )
        ) || [];


    const tasksCompleted =
        document.getElementById(
            "tasksCompleted"
        );


    if (tasksCompleted) {

        const currentCompleted =
            completedTasks.length;

        /*
         * Dashboard originally starts
         * with 18 completed tasks.
         */

        const totalCompleted =
            Math.min(
                25,
                18 + currentCompleted
            );

        tasksCompleted.textContent =
            totalCompleted;

    }

}


taskButtons.forEach(button => {

    button.addEventListener(
        "click",
        () => {

            const taskId =
                button.dataset.task;


            let completedTasks =
                JSON.parse(
                    localStorage.getItem(
                        "completedDashboardTasks"
                    )
                ) || [];


            if (
                completedTasks.includes(
                    taskId
                )
            ) {

                completedTasks =
                    completedTasks.filter(
                        id => id !== taskId
                    );

                button.classList.remove(
                    "completed"
                );

            } else {

                completedTasks.push(
                    taskId
                );

                button.classList.add(
                    "completed"
                );

            }


            localStorage.setItem(
                "completedDashboardTasks",
                JSON.stringify(
                    completedTasks
                )
            );


            updateTaskCount();

        }
    );

});


/* =====================================================
   PROFILE UPDATE LISTENER
   
   This allows the dashboard to refresh its
   avatar/name when profile information changes
   in another page/tab.
====================================================== */

window.addEventListener(
    "storage",
    event => {

        if (
            event.key === "studentProfile"
        ) {

            loadStudentProfile();

        }

    }
);


/* =====================================================
   INITIALIZE DASHBOARD
====================================================== */

loadStudentProfile();

loadCompletedTasks();


console.log(
    "AI Student Mentor - Dashboard loaded."
);


});
