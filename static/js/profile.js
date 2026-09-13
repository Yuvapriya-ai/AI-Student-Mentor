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
    ====================================================== */

    const defaultProfile = {

        name: "Student Name",

        email: "student@example.com",

        phone: "+91 XXXXX XXXXX",

        location: "Bengaluru, India",

        course: "Bachelor of Computer Applications",

        semester: 6,

        skills:
            "Python, HTML, CSS, JavaScript, SQL, Machine Learning",

        career_goal: "AI Engineer"

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
       LOAD PROFILE
    ====================================================== */

    function getSavedProfile() {

        const savedProfile =
            localStorage.getItem("studentProfile");


        if (!savedProfile) {

            return {
                ...defaultProfile
            };

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


            return {
                ...defaultProfile
            };

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


        /* PERSONAL INFORMATION */

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


        /* ACADEMIC INFORMATION */

        const courseDisplay =
            document.querySelector(
                '[data-field="course"]'
            );

        const semesterDisplay =
            document.querySelector(
                '[data-field="semester"]'
            );


        /* CAREER GOAL */

        const careerGoalDisplay =
            document.querySelector(
                '[data-field="career_goal"]'
            );


        if (nameDisplay) {

            nameDisplay.textContent =
                profile.name ||
                defaultProfile.name;

        }


        if (emailDisplay) {

            emailDisplay.textContent =
                profile.email ||
                defaultProfile.email;

        }


        if (phoneDisplay) {

            phoneDisplay.textContent =
                profile.phone ||
                defaultProfile.phone;

        }


        if (locationDisplay) {

            locationDisplay.textContent =
                profile.location ||
                defaultProfile.location;

        }


        if (courseDisplay) {

            courseDisplay.textContent =
                profile.course ||
                defaultProfile.course;

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
                defaultProfile.career_goal;

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

            return;

        }


        const skillArray =
            skills
                .split(",")
                .map(skill => skill.trim())
                .filter(skill => skill !== "");


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
                String(field).trim() !== "" &&
                !String(field).includes("XXXXX") &&
                !String(field).includes("example.com")

            ) {

                completed++;

            }

        });


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
       LOCAL STORAGE + MYSQL
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
           SAVE TO LOCAL STORAGE
        ================================================== */

        localStorage.setItem(

            "studentProfile",

            JSON.stringify(profile)

        );


        /* =================================================
           SAVE TO MYSQL
        ================================================== */

        try {


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


            if (!response.ok) {

                throw new Error(
                    "Server returned an error: " +
                    response.status
                );

            }


            const data =
                await response.json();


            if (data.success) {


                updateProfileDisplay(
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


                console.log(
                    "Profile successfully saved to MySQL."
                );


            } else {


                console.error(
                    "Profile was not saved."
                );


                if (saveMessage) {

                    saveMessage.textContent =
                        "✗ Profile could not be saved.";

                    saveMessage.style.color =
                        "#fca5a5";

                }

            }


        } catch (error) {


            console.error(
                "Error saving profile to MySQL:",
                error
            );


            if (saveMessage) {

                saveMessage.textContent =
                    "✗ Error saving profile to MySQL.";

                saveMessage.style.color =
                    "#fca5a5";

            }

        }

    }


    /* =====================================================
       OPEN EDIT PROFILE
    ====================================================== */

    if (editProfileBtn) {

        editProfileBtn.addEventListener(

            "click",

            () => {


                const profile =
                    getSavedProfile();


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
       SAVE PROFILE FROM MODAL
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
       INITIALIZE
    ====================================================== */

    const currentProfile =
        getSavedProfile();


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