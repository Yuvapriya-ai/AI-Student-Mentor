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

    const addSkillBtn =
        document.getElementById("addSkillBtn");

    const notificationBtn =
        document.getElementById("notificationBtn");

    const notificationPopup =
        document.getElementById("notificationPopup");


    /* =====================================================
       PROFILE INPUTS
    ====================================================== */

    const nameInput =
        document.getElementById("nameInput");

    const emailInput =
        document.getElementById("emailInput");

    const phoneInput =
        document.getElementById("phoneInput");

    const locationInput =
        document.getElementById("locationInput");


    /* =====================================================
       PROFILE DISPLAY ELEMENTS
    ====================================================== */

    const profileAvatar =
        document.getElementById("profileAvatar");

    const profileName =
        document.getElementById("profileName");

    const completionPercent =
        document.getElementById("completionPercent");

    const completionFill =
        document.getElementById("completionFill");

    const topAvatar =
        document.querySelector(".top-avatar");

    const topProfileName =
        document.querySelector(".top-profile strong");

    const sidebarAvatar =
        document.querySelector(".user-avatar");

    const sidebarName =
        document.querySelector(".user-details strong");


    /* =====================================================
       GET INITIAL
    ====================================================== */

    function getInitial(name) {

        if (!name || name.trim() === "") {
            return "Y";
        }

        return name.trim()
                   .charAt(0)
                   .toUpperCase();
    }


    /* =====================================================
       DEFAULT PROFILE
    ====================================================== */

    const defaultProfile = {

        name: "Student Name",

        email: "student@example.com",

        phone: "+91 XXXXX XXXXX",

        location: "Bengaluru, India"

    };


    /* =====================================================
       LOAD PROFILE FROM LOCAL STORAGE
    ====================================================== */

    function getSavedProfile() {

        const savedProfile =
            localStorage.getItem("studentProfile");

        if (!savedProfile) {
            return defaultProfile;
        }

        try {

            const profile =
                JSON.parse(savedProfile);

            return {
                ...defaultProfile,
                ...profile
            };

        } catch (error) {

            console.error(
                "Error reading student profile:",
                error
            );

            return defaultProfile;
        }

    }


    /* =====================================================
       UPDATE PROFILE DISPLAY
    ====================================================== */

    function updateProfileDisplay(profile) {

        const name =
            profile.name &&
            profile.name.trim()
                ? profile.name.trim()
                : "Student Name";

        const initial =
            getInitial(name);


        /* ================================================
           LARGE PROFILE AVATAR
        ================================================ */

        if (profileAvatar) {
            profileAvatar.textContent = initial;
        }


        /* ================================================
           PROFILE NAME
        ================================================ */

        if (profileName) {
            profileName.textContent = name;
        }


        /* ================================================
           TOP-RIGHT AVATAR
        ================================================ */

        if (topAvatar) {
            topAvatar.textContent = initial;
        }


        /* ================================================
           TOP-RIGHT NAME
        ================================================ */

        if (topProfileName) {
            topProfileName.textContent = name;
        }


        /* ================================================
           SIDEBAR AVATAR
        ================================================ */

        if (sidebarAvatar) {
            sidebarAvatar.textContent = initial;
        }


        /* ================================================
           SIDEBAR NAME
        ================================================ */

        if (sidebarName) {
            sidebarName.textContent = name;
        }


        /* ================================================
           PERSONAL INFORMATION
        ================================================ */

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


        if (nameDisplay) {
            nameDisplay.textContent =
                profile.name || defaultProfile.name;
        }

        if (emailDisplay) {
            emailDisplay.textContent =
                profile.email || defaultProfile.email;
        }

        if (phoneDisplay) {
            phoneDisplay.textContent =
                profile.phone || defaultProfile.phone;
        }

        if (locationDisplay) {
            locationDisplay.textContent =
                profile.location || defaultProfile.location;
        }

    }


    /* =====================================================
       UPDATE FORM VALUES
    ====================================================== */

    function updateForm(profile) {

        if (nameInput) {
            nameInput.value =
                profile.name || "";
        }

        if (emailInput) {
            emailInput.value =
                profile.email || "";
        }

        if (phoneInput) {
            phoneInput.value =
                profile.phone || "";
        }

        if (locationInput) {
            locationInput.value =
                profile.location || "";
        }

    }


    /* =====================================================
       CALCULATE PROFILE COMPLETION
    ====================================================== */

    function calculateCompletion(profile) {

        const fields = [

            profile.name,

            profile.email,

            profile.phone,

            profile.location

        ];


        let completed = 0;


        fields.forEach(field => {

            if (
                field &&
                field.trim() !== "" &&
                !field.includes("XXXXX") &&
                !field.includes("example.com")
            ) {

                completed++;

            }

        });


        /*
         * Four basic personal-information fields.
         * Minimum profile completion is 75% because
         * the page originally starts at 75%.
         */

        let percentage =
            Math.round(
                (completed / fields.length) * 100
            );


        if (percentage < 75) {
            percentage = 75;
        }


        if (completionPercent) {

            completionPercent.textContent =
                percentage + "%";

        }


        if (completionFill) {

            completionFill.style.width =
                percentage + "%";

        }

    }


    /* =====================================================
       SAVE PROFILE
    ====================================================== */

    function saveProfile() {

        const profile = {

            name:
                nameInput
                    ? nameInput.value.trim()
                    : "",

            email:
                emailInput
                    ? emailInput.value.trim()
                    : "",

            phone:
                phoneInput
                    ? phoneInput.value.trim()
                    : "",

            location:
                locationInput
                    ? locationInput.value.trim()
                    : ""

        };


        /* ================================================
           SAVE TO LOCAL STORAGE
        ================================================ */

        localStorage.setItem(
            "studentProfile",
            JSON.stringify(profile)
        );


        /* ================================================
           UPDATE PAGE
        ================================================ */

        updateProfileDisplay(profile);

        calculateCompletion(profile);


        /* ================================================
           SUCCESS MESSAGE
        ================================================ */

        if (saveMessage) {

            saveMessage.textContent =
                "✓ Your profile information has been saved successfully.";

            saveMessage.style.color =
                "#a7f3d0";

        }

    }


    /* =====================================================
       OPEN EDIT PROFILE MODAL
    ====================================================== */

    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            () => {

                const profile =
                    getSavedProfile();

                updateForm(profile);

                if (profileModal) {

                    profileModal.classList.add(
                        "show"
                    );

                }

            }
        );

    }


    /* =====================================================
       CLOSE MODAL
    ====================================================== */

    function closeProfileModal() {

        if (profileModal) {

            profileModal.classList.remove(
                "show"
            );

        }

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


    /* =====================================================
       CLICK OUTSIDE MODAL
    ====================================================== */

    if (profileModal) {

        profileModal.addEventListener(
            "click",
            event => {

                if (
                    event.target === profileModal
                ) {

                    closeProfileModal();

                }

            }
        );

    }


    /* =====================================================
       SAVE PROFILE FROM MODAL
    ====================================================== */

    if (profileForm) {

        profileForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();

                saveProfile();

                closeProfileModal();

            }
        );

    }


    /* =====================================================
       SAVE CHANGES BUTTON
    ====================================================== */

    if (saveProfileBtn) {

        saveProfileBtn.addEventListener(
            "click",
            () => {

                const profile =
                    getSavedProfile();

                updateForm(profile);

                saveProfile();

            }
        );

    }


    /* =====================================================
       ADD SKILL
    ====================================================== */

    if (addSkillBtn) {

        addSkillBtn.addEventListener(
            "click",
            () => {

                const skill =
                    prompt(
                        "Enter the skill you want to add:"
                    );


                if (
                    !skill ||
                    skill.trim() === ""
                ) {
                    return;
                }


                const skillsList =
                    document.querySelector(
                        ".skills-list"
                    );


                if (!skillsList) {
                    return;
                }


                const newSkill =
                    document.createElement("span");


                newSkill.textContent =
                    skill.trim();


                skillsList.appendChild(
                    newSkill
                );

            }
        );

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
       UPDATE WHEN STORAGE CHANGES
    ====================================================== */

    window.addEventListener(
        "storage",
        event => {

            if (
                event.key === "studentProfile"
            ) {

                const profile =
                    getSavedProfile();

                updateProfileDisplay(
                    profile
                );

                updateForm(profile);

                calculateCompletion(
                    profile
                );

            }

        }
    );


    /* =====================================================
       INITIALIZE PROFILE PAGE
    ====================================================== */

    const currentProfile =
        getSavedProfile();


    /*
     * Create the localStorage entry only
     * if it doesn't already exist.
     */

    if (
        !localStorage.getItem(
            "studentProfile"
        )
    ) {

        localStorage.setItem(
            "studentProfile",
            JSON.stringify(
                currentProfile
            )
        );

    }


    updateProfileDisplay(
        currentProfile
    );

    updateForm(
        currentProfile
    );

    calculateCompletion(
        currentProfile
    );


    console.log(
        "AI Student Mentor - Profile loaded."
    );

});

