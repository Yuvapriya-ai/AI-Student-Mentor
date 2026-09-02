/* =========================================================
   AI STUDENT MENTOR
   STUDENT PROFILE JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       ELEMENTS
    ====================================================== */

    const editProfileBtn =
        document.getElementById("editProfileBtn");

    const profileModal =
        document.getElementById("profileModal");

    const closeModal =
        document.getElementById("closeModal");

    const cancelBtn =
        document.getElementById("cancelBtn");

    const profileForm =
        document.getElementById("profileForm");

    const saveProfileBtn =
        document.getElementById("saveProfileBtn");

    const saveMessage =
        document.getElementById("saveMessage");

    const notificationBtn =
        document.getElementById("notificationBtn");

    const notificationPopup =
        document.getElementById("notificationPopup");


    /* =====================================================
       LOAD SAVED PROFILE
    ====================================================== */

    function loadProfile() {

        const savedProfile =
            JSON.parse(
                localStorage.getItem("studentProfile")
            );

        if (!savedProfile) {
            return;
        }

        const name =
            savedProfile.name || "Student Name";

        const email =
            savedProfile.email || "student@example.com";

        const phone =
            savedProfile.phone || "+91 XXXXX XXXXX";

        const location =
            savedProfile.location || "Bengaluru, India";


        /* Display values */

        const nameDisplay =
            document.querySelector(
                '[data-field="name"]'
            );

        const emailDisplay =
            document.querySelector(
                '[data-field="email"]'
            );

        const phoneDisplay =
            document.querySelector(
                '[data-field="phone"]'
            );

        const locationDisplay =
            document.querySelector(
                '[data-field="location"]'
            );


        if (nameDisplay)
            nameDisplay.textContent = name;

        if (emailDisplay)
            emailDisplay.textContent = email;

        if (phoneDisplay)
            phoneDisplay.textContent = phone;

        if (locationDisplay)
            locationDisplay.textContent = location;


        /* Hero name */

        const profileName =
            document.getElementById("profileName");

        if (profileName)
            profileName.textContent = name;


        /* Avatar */

        const profileAvatar =
            document.getElementById("profileAvatar");

        if (profileAvatar) {

            profileAvatar.textContent =
                getInitial(name);

        }


        /* Form */

        document.getElementById("nameInput").value =
            name;

        document.getElementById("emailInput").value =
            email;

        document.getElementById("phoneInput").value =
            phone;

        document.getElementById("locationInput").value =
            location;

    }


    /* =====================================================
       GET INITIAL
    ====================================================== */

    function getInitial(name) {

        if (!name || name.trim() === "") {
            return "Y";
        }

        return name
            .trim()
            .charAt(0)
            .toUpperCase();

    }


    /* =====================================================
       OPEN MODAL
    ====================================================== */

    if (editProfileBtn) {

        editProfileBtn.addEventListener("click", () => {

            profileModal.classList.add("show");

        });

    }


    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    function closeProfileModal() {

        profileModal.classList.remove("show");

    }


    if (closeModal) {

        closeModal.addEventListener(
            "click",
            closeProfileModal
        );

    }


    if (cancelBtn) {

        cancelBtn.addEventListener(
            "click",
            closeProfileModal
        );

    }


    /* Close when clicking outside */

    if (profileModal) {

        profileModal.addEventListener("click", event => {

            if (event.target === profileModal) {
                closeProfileModal();
            }

        });

    }


    /* =====================================================
       SAVE PROFILE FROM MODAL
    ====================================================== */

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const profile = {

                    name:
                        document.getElementById(
                            "nameInput"
                        ).value.trim(),

                    email:
                        document.getElementById(
                            "emailInput"
                        ).value.trim(),

                    phone:
                        document.getElementById(
                            "phoneInput"
                        ).value.trim(),

                    location:
                        document.getElementById(
                            "locationInput"
                        ).value.trim()

                };


                localStorage.setItem(
                    "studentProfile",
                    JSON.stringify(profile)
                );


                loadProfile();

                updateCompletion();

                closeProfileModal();

                showSaveMessage(
                    "Profile updated successfully."
                );

            }
        );

    }


    /* =====================================================
       SAVE BUTTON
    ====================================================== */

    if (saveProfileBtn) {

        saveProfileBtn.addEventListener(
            "click",
            () => {

                const profile = {

                    name:
                        document.querySelector(
                            '[data-field="name"]'
                        ).textContent,

                    email:
                        document.querySelector(
                            '[data-field="email"]'
                        ).textContent,

                    phone:
                        document.querySelector(
                            '[data-field="phone"]'
                        ).textContent,

                    location:
                        document.querySelector(
                            '[data-field="location"]'
                        ).textContent

                };


                localStorage.setItem(
                    "studentProfile",
                    JSON.stringify(profile)
                );


                showSaveMessage(
                    "Changes saved successfully."
                );

            }
        );

    }


    /* =====================================================
       PROFILE COMPLETION
    ====================================================== */

    function updateCompletion() {

        const savedProfile =
            JSON.parse(
                localStorage.getItem("studentProfile")
            );

        let completed = 0;

        const total = 4;


        if (
            savedProfile &&
            savedProfile.name &&
            savedProfile.name !== "Student Name"
        ) {
            completed++;
        }

        if (
            savedProfile &&
            savedProfile.email &&
            savedProfile.email !== "student@example.com"
        ) {
            completed++;
        }

        if (
            savedProfile &&
            savedProfile.phone &&
            savedProfile.phone !== "+91 XXXXX XXXXX"
        ) {
            completed++;
        }

        if (
            savedProfile &&
            savedProfile.location &&
            savedProfile.location !== "Bengaluru, India"
        ) {
            completed++;
        }


        let percentage;

        if (completed === 0) {
            percentage = 75;
        } else {
            percentage =
                Math.min(
                    100,
                    75 + completed * 6
                );
        }


        const percent =
            document.getElementById(
                "completionPercent"
            );

        const fill =
            document.getElementById(
                "completionFill"
            );


        if (percent)
            percent.textContent =
                percentage + "%";

        if (fill)
            fill.style.width =
                percentage + "%";

    }


    /* =====================================================
       SAVE MESSAGE
    ====================================================== */

    function showSaveMessage(message) {

        if (!saveMessage) {
            return;
        }

        saveMessage.textContent = message;

        saveMessage.style.color =
            "#35a878";

        setTimeout(() => {

            saveMessage.textContent =
                "Your profile information is saved locally.";

            saveMessage.style.color =
                "";

        }, 3000);

    }


    /* =====================================================
       NOTIFICATION
    ====================================================== */

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
       ADD SKILL
    ====================================================== */

    const addSkillBtn =
        document.getElementById("addSkillBtn");

    if (addSkillBtn) {

        addSkillBtn.addEventListener(
            "click",
            () => {

                const skill =
                    prompt(
                        "Enter a skill you want to add:"
                    );


                if (
                    skill &&
                    skill.trim() !== ""
                ) {

                    const skillsList =
                        document.querySelector(
                            ".skills-list"
                        );

                    const newSkill =
                        document.createElement(
                            "span"
                        );

                    newSkill.textContent =
                        skill.trim();

                    skillsList.appendChild(
                        newSkill
                    );

                    showSaveMessage(
                        "New skill added."
                    );

                }

            }
        );

    }


    /* =====================================================
       KEYBOARD ESCAPE
    ====================================================== */

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                profileModal.classList.contains(
                    "show"
                )
            ) {

                closeProfileModal();

            }

        }
    );


    /* =====================================================
       INITIALIZE
    ====================================================== */

    loadProfile();

    updateCompletion();


    console.log(
        "AI Student Mentor - Student Profile loaded."
    );

});