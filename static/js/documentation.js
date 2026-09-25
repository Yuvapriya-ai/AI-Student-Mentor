/* =========================================================
   AI STUDENT MENTOR
   DOCUMENTATION ASSISTANT JAVASCRIPT
========================================================= */

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

            const response =
                await fetch("/api/profile");

            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success ||
                !data.profile
            ) {

                console.error(
                    "Could not load student profile."
                );

                return;
            }


            const profile =
                data.profile;


            const name =
                profile.name &&
                profile.name.trim()
                    ? profile.name.trim()
                    : "Student";


            const initial =
                getInitial(name);


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


            console.log(
                "Documentation profile loaded from MySQL:",
                profile
            );

        } catch (error) {

            console.error(
                "Documentation profile loading error:",
                error
            );

        }
    }


    /* =====================================================
       ELEMENTS
    ====================================================== */

    const documentType =
        document.getElementById("documentType");

    const projectInput =
        document.getElementById("projectInput");

    const writingStyle =
        document.getElementById("writingStyle");

    const documentLength =
        document.getElementById("documentLength");

    const generateBtn =
        document.getElementById("generateBtn");

    const characterCount =
        document.getElementById("characterCount");

    const emptyState =
        document.getElementById("emptyState");

    const generatedDocument =
        document.getElementById("generatedDocument");

    const generatedTitle =
        document.getElementById("generatedTitle");

    const generatedContent =
        document.getElementById("generatedContent");

    const wordCount =
        document.getElementById("wordCount");

    const sectionCount =
        document.getElementById("sectionCount");

    const copyBtn =
        document.getElementById("copyBtn");

    const downloadBtn =
        document.getElementById("downloadBtn");

    const templateCards =
        document.querySelectorAll(".template-card");

    const tipButton =
        document.getElementById("tipButton");


    /* =====================================================
       CHARACTER COUNTER
    ====================================================== */

    projectInput.addEventListener(
        "input",
        () => {

            const count =
                projectInput.value.length;

            characterCount.textContent =
                `${count} characters`;

        }
    );


    /* =====================================================
       DOCUMENT TEMPLATES
    ====================================================== */

    const templateData = {

        synopsis: {

            type: "synopsis",

            text:
                `AI Student Mentor is an intelligent academic support system designed to help students manage their learning and project development journey. The system combines multiple AI-powered features into a single platform.`

        },

        methodology: {

            type: "methodology",

            text:
                `The system follows a modular architecture. The frontend provides an interactive interface, while the Flask backend manages application logic and communication with the database and AI services. MySQL is used for persistent data storage.`

        },

        modules: {

            type: "modules",

            text:
                `The project consists of Student Profile Management, Learning Roadmap, AI Project Mentor, Documentation Assistant, Project Viva Assistant, AI Study Assistant, Project Progress Tracker and AI Project Idea Evaluator.`

        },

        future: {

            type: "future",

            text:
                `Future enhancements can include improved personalization, additional AI capabilities, analytics dashboards, stronger project recommendations and integration with additional academic resources.`

        }

    };


    /* =====================================================
       TEMPLATE CLICK
    ====================================================== */

    templateCards.forEach(card => {

        card.addEventListener(
            "click",
            () => {

                const template =
                    card.dataset.template;

                const data =
                    templateData[template];


                if (!data) {
                    return;
                }


                documentType.value =
                    data.type;

                projectInput.value =
                    data.text;


                updateCharacterCount();


                projectInput.focus();


                projectInput.scrollIntoView({

                    behavior: "smooth",

                    block: "center"

                });

            }
        );

    });


    /* =====================================================
       UPDATE CHARACTER COUNT
    ====================================================== */

    function updateCharacterCount() {

        characterCount.textContent =
            `${projectInput.value.length} characters`;

    }


    /* =====================================================
       GENERATE DOCUMENT
    ====================================================== */

    generateBtn.addEventListener(
        "click",
        generateDocument
    );


    async function generateDocument() {

        const type =
            documentType.value;

        const description =
            projectInput.value.trim();

        const style =
            writingStyle.value;

        const length =
            documentLength.value;


        if (description === "") {

            projectInput.focus();

            projectInput.style.borderColor =
                "#e58a98";


            setTimeout(() => {

                projectInput.style.borderColor =
                    "";

            }, 1500);

            return;

        }


        generateBtn.classList.add("loading");


        generateBtn.innerHTML = `
            <span class="generate-icon">
                ✦
            </span>
            Generating...
        `;


        try {

            const response =
                await fetch(
                    "/api/documentation",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({

                            type: type,

                            description:
                                description,

                            style: style,

                            length: length

                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                throw new Error(
                    data.error ||
                    "Failed to generate documentation."
                );

            }


            const content =
                data.response
                    .replace(/<h1[^>]*>/gi, "<h2>")
                    .replace(/<\/h1>/gi, "</h2>")
                    .replace(/<h2[^>]*>/gi, "<h2>")
                    .replace(/<\/h2>/gi, "</h2>")
                    .replace(/<h3[^>]*>/gi, "<h3>")
                    .replace(/<\/h3>/gi, "</h3>")
                    .replace(/<h4[^>]*>/gi, "<h4>")
                    .replace(/<\/h4>/gi, "</h4>")
                    .replace(/<p[^>]*>/gi, "<p>")
                    .replace(/<\/p>/gi, "</p>")
                    .replace(/<strong[^>]*>/gi, "<strong>")
                    .replace(/<\/strong>/gi, "</strong>")
                    .replace(/<br\s*\/?>/gi, "<br>")
                    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                    .replace(/^### (.*)$/gm, "<h4>$1</h4>")
                    .replace(/^## (.*)$/gm, "<h3>$1</h3>")
                    .replace(/^# (.*)$/gm, "<h2>$1</h2>")
                    .replace(/\n/g, "<br>");


            const generatedData = {

                title:
                    type.charAt(0).toUpperCase() +
                    type.slice(1),

                content:
                    content,

                style:
                    style,

                length:
                    length

            };


            showDocument(generatedData);


        } catch (error) {

            console.error(
                "Documentation generation error:",
                error
            );


            alert(
                "Unable to generate documentation. Please try again."
            );

        } finally {

            generateBtn.classList.remove(
                "loading"
            );


            generateBtn.innerHTML = `
                <span class="generate-icon">
                    ✦
                </span>

                Generate Documentation

                <span class="arrow">
                    →
                </span>
            `;

        }

    }


    /* =====================================================
       SHOW DOCUMENT
    ====================================================== */

    function showDocument(documentData) {

        emptyState.style.display =
            "none";


        generatedDocument.classList.add(
            "show"
        );


        generatedTitle.textContent =
            documentData.title;


        generatedContent.innerHTML =
            documentData.content;


        const text =
            generatedContent.textContent;


        const words =
            text.trim()
                .split(/\s+/)
                .filter(Boolean)
                .length;


        wordCount.textContent =
            `${words} words`;


        sectionCount.textContent =
            (
                text.match(
                    /^#{1,3}\s/gm
                ) || []
            ).length;

    }


    /* =====================================================
       COPY DOCUMENT
    ====================================================== */

    copyBtn.addEventListener(
        "click",
        async () => {

            if (
                !generatedDocument.classList.contains(
                    "show"
                )
            ) {

                return;

            }


            const text =
                generatedDocument.innerText;


            try {

                await navigator.clipboard.writeText(
                    text
                );


                showTemporaryMessage(
                    copyBtn,
                    "✓"
                );


            } catch (error) {

                console.log(
                    "Copy failed:",
                    error
                );

            }

        }
    );


    /* =====================================================
       DOWNLOAD DOCUMENT
    ====================================================== */

    downloadBtn.addEventListener(
        "click",
        () => {

            if (
                !generatedDocument.classList.contains(
                    "show"
                )
            ) {

                return;

            }


            const title =
                generatedTitle.textContent;


            const content =
                generatedDocument.innerText;


            const blob =
                new Blob(
                    [content],
                    {
                        type:
                            "text/plain"
                    }
                );


            const url =
                URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement("a");


            link.href =
                url;


            link.download =
                `${title.replace(/\s+/g, "_")}.txt`;


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            URL.revokeObjectURL(
                url
            );

        }
    );


    /* =====================================================
       AI TIP BUTTON
    ====================================================== */

    tipButton.addEventListener(
        "click",
        () => {

            documentType.value =
                "synopsis";


            projectInput.value =
                `AI Student Mentor is an AI-powered academic companion for students. It includes Student Profile Management, Learning Roadmap, AI Project Mentor, Documentation Assistant, Project Viva Assistant, AI Study Assistant, Project Progress Tracker and AI Project Idea Evaluator. The system uses HTML, CSS, JavaScript, Python Flask, MySQL and an LLM/API for intelligent assistance.`;


            updateCharacterCount();


            projectInput.focus();


            projectInput.scrollIntoView({

                behavior: "smooth",

                block: "center"

            });

        }
    );


    /* =====================================================
       TEMPORARY BUTTON FEEDBACK
    ====================================================== */

    function showTemporaryMessage(
        button,
        message
    ) {

        const original =
            button.innerHTML;


        button.innerHTML =
            message;


        setTimeout(() => {

            button.innerHTML =
                original;

        }, 1200);

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
       INITIALIZATION
    ====================================================== */

    loadStudentProfile();


    updateCharacterCount();


    console.log(
        "AI Student Mentor - Documentation Assistant loaded."
    );

});