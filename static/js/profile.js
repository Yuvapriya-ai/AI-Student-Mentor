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
       INPUTS
    ====================================================== */

    const nameInput =
        document.getElementById("nameInput");

    const emailInput =
        document.getElementById("emailInput");

    const phoneInput =
        document.getElementById("phoneInput");

    const locationInput =
        document.getElementById("locationInput");

    const courseInput =
        document.getElementById("courseInput");

    const semesterInput =
        document.getElementById("semesterInput");

    const skillsInput =
        document.getElementById("skillsInput");

    const careerGoalInput =
        document.getElementById("careerGoalInput");


    /* =====================================================
       DISPLAY ELEMENTS
    ====================================================== */

    const profileAvatar =
        document.getElementById("profileAvatar");

    const profileName =
        document.getElementById("profileName");

    const profileCourse =
        document.getElementById("profileCourse");

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

    const skillsList =
        document.getElementById("skillsList");


    /* =====================================================
       DEFAULT PROFILE
       Used only when MySQL has no profile yet.
    ====================================================== */

    const defaultProfile = {

        name: "",

        email: "",

        phone: "",

        location: "",

        course: "",

        semester: "",

        skills: "",

        career_goal: ""

    };


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
       LOAD PROFILE FROM MYSQL
    ====================================================== */

    async function loadProfile() {

        try {

            const response =
                await fetch("/api/profile");

            if (!response.ok) {

                throw new Error(
                    "Server returned " +
                    response.status
                );

            }


            const data =
                await response.json();


            if (!data.success) {

                throw new Error(
                    data.message ||
                    "Could not load profile."
                );

            }


            /*
             * MySQL is now the source of truth.
             *
             * If the student has no profile yet,
             * use an empty profile.
             */

            const profile =
                data.profile
                    ? {
                        ...defaultProfile,
                        ...data.profile
                    }
                    : {
                        ...defaultProfile
                    };


            updateProfileDisplay(
                profile
            );

            updateForm(
                profile
            );

            calculateCompletion(
                profile
            );


            console.log(
                "Profile loaded from MySQL:",
                profile
            );


            return profile;


        } catch (error) {

            console.error(
                "Error loading profile:",
                error
            );


            if (saveMessage) {

                saveMessage.textContent =
                    "✗ Could not load profile information.";

                saveMessage.style.color =
                    "#fca5a5";

            }


            /*
             * Do not load old localStorage data.
             * This prevents another student's
             * profile from appearing.
             */

            const emptyProfile =
                {
                    ...defaultProfile
                };


            updateProfileDisplay(
                emptyProfile
            );

            updateForm(
                emptyProfile
            );

            calculateCompletion(
                emptyProfile
            );


            return emptyProfile;

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


        /* PROFILE AVATAR */

        if (profileAvatar) {

            profileAvatar.textContent =
                initial;

        }


        /* PROFILE NAME */

        if (profileName) {

            profileName.textContent =
                name;

        }


        /* PROFILE COURSE */

        if (profileCourse) {

            profileCourse.textContent =
                profile.course
                    ? profile.course
                    : "BCA Student";

        }


        /* TOP AVATAR */

        if (topAvatar) {

            topAvatar.textContent =
                initial;

        }


        /* TOP NAME */

        if (topProfileName) {

            topProfileName.textContent =
                name;

        }


        /* SIDEBAR AVATAR */

        if (sidebarAvatar) {

            sidebarAvatar.textContent =
                initial;

        }


        /* SIDEBAR NAME */

        if (sidebarName) {

            sidebarName.textContent =
                name;

        }


        /* =================================================
           PERSONAL INFORMATION
        ================================================== */

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


        /* =================================================
           ACADEMIC INFORMATION
        ================================================== */

        const courseDisplay =
            document.querySelector(
                '[data-field="course"]'
            );

        const semesterDisplay =
            document.querySelector(
                '[data-field="semester"]'
            );


        /* =================================================
           CAREER GOAL
        ================================================== */

        const careerGoalDisplay =
            document.querySelector(
                '[data-field="career_goal"]'
            );

        const skillsDisplay =
             document.querySelector(
                '[data-field="skills"]'
            );  

        if (nameDisplay) {

            nameDisplay.textContent =
                profile.name || "Not specified";

        }


        if (emailDisplay) {

            emailDisplay.textContent =
                profile.email || "Not specified";

        }


        if (phoneDisplay) {

            phoneDisplay.textContent =
                profile.phone || "Not specified";

        }


        if (locationDisplay) {

            locationDisplay.textContent =
                profile.location || "Not specified";

        }


        if (courseDisplay) {

            courseDisplay.textContent =
                profile.course || "Not specified";

        }


        if (semesterDisplay) {

            const semester =
                Number(profile.semester);


            if (semester) {

                semesterDisplay.textContent =
                    semester + "th Semester";

            } else {

                semesterDisplay.textContent =
                    "Not specified";

            }

        }


        if (careerGoalDisplay) {

            careerGoalDisplay.textContent =
                profile.career_goal ||
                "Not specified";

        }

        if (skillsDisplay) {

            skillsDisplay.textContent =
                profile.skills ||
                "Not specified";

        }


        /* UPDATE SKILLS */

        updateSkillsDisplay(
            profile.skills
        );

    }


    /* =====================================================
       UPDATE SKILLS DISPLAY
    ====================================================== */

    function updateSkillsDisplay(skills) {

        if (!skillsList) {

            return;

        }


        skillsList.innerHTML = "";


        if (!skills || skills.trim() === "") {

            const emptySkill =
                document.createElement("span");

            emptySkill.textContent =
                "No skills added";

            skillsList.appendChild(
                emptySkill
            );

            return;

        }


        const skillArray =
            skills
                .split(",")
                .map(
                    skill => skill.trim()
                )
                .filter(
                    skill => skill !== ""
                );


        skillArray.forEach(skill => {

            const skillElement =
                document.createElement("span");


            skillElement.textContent =
                skill;


            skillsList.appendChild(
                skillElement
            );

        });

    }


    /* =====================================================
       UPDATE FORM
    ====================================================== */

    function updateForm(profile) {

        if (nameInput) {

            nameInput.value =
                profile.name || "";

        }


        if (emailInput) {

            emailInput.value =
                profile.email || "";

            /*
             * Email belongs to the logged-in account.
             * It should not be changed through the
             * profile form.
             */

            emailInput.readOnly = true;

        }


        if (phoneInput) {

            phoneInput.value =
                profile.phone || "";

        }


        if (locationInput) {

            locationInput.value =
                profile.location || "";

        }


        if (courseInput) {

            courseInput.value =
                profile.course || "";

        }


        if (semesterInput) {

            semesterInput.value =
                profile.semester || "";

        }


        if (skillsInput) {

            skillsInput.value =
                profile.skills || "";

        }


        if (careerGoalInput) {

            careerGoalInput.value =
                profile.career_goal || "";

        }

    }


    /* =====================================================
       PROFILE COMPLETION
    ====================================================== */

    function calculateCompletion(profile) {

        const fields = [

            profile.name,

            profile.email,

            profile.phone,

            profile.location,

            profile.course,

            profile.semester,

            profile.skills,

            profile.career_goal

        ];


        let completed = 0;


        fields.forEach(field => {

            if (

                field !== null &&
                field !== undefined &&
                String(field).trim() !== ""

            ) {

                completed++;

            }

        });


        const percentage =
            Math.round(
                (completed / fields.length) * 100
            );


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
       SAVE PROFILE TO MYSQL
    ====================================================== */

    async function saveProfile() {

        const semesterValue =
            semesterInput
                ? semesterInput.value.trim()
                : "";


        const profile = {

            name:
                nameInput
                    ? nameInput.value.trim()
                    : "",

            /*
             * Email is taken from the current
             * logged-in account by the backend.
             *
             * We still send the displayed value,
             * but the backend does not use it
             * to identify the student.
             */

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
                    : "",

            course:
                courseInput
                    ? courseInput.value.trim()
                    : "",

            semester:
                semesterValue
                    ? parseInt(
                        semesterValue,
                        10
                    )
                    : null,

            skills:
                skillsInput
                    ? skillsInput.value.trim()
                    : "",

            career_goal:
                careerGoalInput
                    ? careerGoalInput.value.trim()
                    : ""

        };


        /* =================================================
           SAVE TO MYSQL
        ================================================== */

        try {

            if (saveProfileBtn) {

                saveProfileBtn.disabled = true;

            }


            const response =
                await fetch(
                    "/api/profile",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(profile)

                    }
                );


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Profile could not be saved."
                );

            }


            /*
             * Only update the page after
             * MySQL confirms the save.
             */

            updateProfileDisplay(
                profile
            );

            updateForm(
                profile
            );

            calculateCompletion(
                profile
            );


            if (saveMessage) {

                saveMessage.textContent =
                    "✓ Your profile information has been saved successfully.";

                saveMessage.style.color =
                    "#a7f3d0";

            }


            showNotification(
                "Profile saved successfully!"
            );


            console.log(
                "Profile successfully saved to MySQL."
            );


        } catch (error) {

            console.error(
                "Error saving profile:",
                error
            );


            if (saveMessage) {

                saveMessage.textContent =
                    "✗ Profile could not be saved.";

                saveMessage.style.color =
                    "#fca5a5";

            }


            showNotification(
                "Could not save profile."
            );

        } finally {

            if (saveProfileBtn) {

                saveProfileBtn.disabled = false;

            }

        }

    }


    /* =====================================================
       OPEN EDIT PROFILE
    ====================================================== */

    if (editProfileBtn) {

        editProfileBtn.addEventListener(
            "click",
            async () => {

                /*
                 * Always get the latest data
                 * from MySQL before opening edit.
                 */

                const profile =
                    await loadProfile();


                updateForm(
                    profile
                );


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
                    event.target ===
                    profileModal
                ) {

                    closeProfileModal();

                }

            }
        );

    }


    /* =====================================================
       SAVE PROFILE FROM FORM
    ====================================================== */

    if (profileForm) {
    profileForm.addEventListener(
        "submit",
        async event => {
            event.preventDefault();

            await saveProfile();

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
            async () => {

                await saveProfile();

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


                const currentSkills =
                    skillsInput
                        ? skillsInput.value.trim()
                        : "";


                if (skillsInput) {

                    if (currentSkills === "") {

                        skillsInput.value =
                            skill.trim();

                    } else {

                        skillsInput.value =
                            currentSkills +
                            ", " +
                            skill.trim();

                    }


                    updateSkillsDisplay(
                        skillsInput.value
                    );

                }

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
   SAVE NOTIFICATION
====================================================== */

function showNotification(message) {

    if (!notificationPopup) {
        return;
    }

    notificationPopup.textContent = message;

    notificationPopup.classList.add("show");

    setTimeout(() => {

        notificationPopup.classList.remove("show");

    }, 3000);

}

    /* =====================================================
       LEARNING PREFERENCE DROPDOWNS
    ====================================================== */

    const primaryGoal =
        document.getElementById("primaryGoal");

    const skillLevel =
        document.getElementById("skillLevel");

    const learningStyle =
        document.getElementById("learningStyle");

    const studyTime =
        document.getElementById("studyTime");


    /* DEFAULT VALUES */

    if (primaryGoal) {
        primaryGoal.value = "AI Engineer";
    }

    if (skillLevel) {
        skillLevel.value = "Intermediate";
    }

    if (learningStyle) {
        learningStyle.value = "Practical Learning";
    }

    if (studyTime) {
        studyTime.value = "2 - 3 Hours";
    }
    
    /* =====================================================
       INITIALIZE PROFILE
    ====================================================== */

    loadProfile();


    console.log(
        "AI Student Mentor - Profile initialized."
    );

});