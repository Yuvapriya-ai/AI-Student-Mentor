/* =========================================================
   AI STUDENT MENTOR
   DOCUMENTATION ASSISTANT JAVASCRIPT
========================================================= */

document.addEventListener("DOMContentLoaded", () => {


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
        document.querySelectorAll(
            ".template-card"
        );

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

        const response = await fetch(
            "/api/documentation",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    type: type,
                    description: description,
                    style: style,
                    length: length
                })
            }
        );


        const data =
            await response.json();


        if (!response.ok) {
            throw new Error(
                data.error || "Failed to generate documentation."
            );
        }


        const document = {

            title:
                type.charAt(0).toUpperCase() +
                type.slice(1),

            content:
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
        .replace(/\n/g, "<br>"),
        
            style:
                style,

            length:
                length
        };


        showDocument(document);


    } catch (error) {

        console.error(
            "Documentation generation error:",
            error
        );

        alert(
            "Unable to generate documentation. Please try again."
        );


    } finally {

        generateBtn.classList.remove("loading");

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
       CREATE DOCUMENT
    ====================================================== */

    function createDocument(
        type,
        description,
        style,
        length
    ) {

        const titles = {

            synopsis:
                "Project Synopsis",

            introduction:
                "Introduction",

            problem:
                "Problem Statement",

            objectives:
                "Project Objectives",

            methodology:
                "Project Methodology",

            modules:
                "Project Modules",

            technology:
                "Technology Stack",

            future:
                "Future Enhancements",

            conclusion:
                "Conclusion",

            custom:
                "Project Documentation"

        };


        let content = "";


        switch (type) {


            case "synopsis":

                content = `

                    <h3>1. Overview</h3>

                    <p>
                        ${description}
                    </p>

                    <h3>2. Purpose</h3>

                    <p>
                        The purpose of this project is to provide
                        students with a centralized platform that
                        supports academic learning and project
                        development through intelligent assistance.
                    </p>

                    <h3>3. Key Features</h3>

                    <ul>
                        <li>Personalized student profile management</li>
                        <li>AI-assisted learning roadmap</li>
                        <li>Project development guidance</li>
                        <li>Automated documentation assistance</li>
                        <li>Project viva preparation</li>
                        <li>Study question and answer support</li>
                        <li>Project progress monitoring</li>
                        <li>AI project idea evaluation</li>
                    </ul>

                `;

                break;


            case "introduction":

                content = `

                    <h3>1. Introduction</h3>

                    <p>
                        ${description}
                    </p>

                    <p>
                        The system is designed as an AI-powered
                        academic companion that helps students
                        organize their learning, understand
                        project requirements and receive
                        intelligent guidance throughout their
                        academic journey.
                    </p>

                    <h3>2. Need for the System</h3>

                    <p>
                        Students often use multiple tools for
                        learning, project planning, documentation
                        and preparation. This project brings
                        these capabilities together into a
                        unified platform.
                    </p>

                `;

                break;


            case "problem":

                content = `

                    <h3>1. Problem Statement</h3>

                    <p>
                        ${description}
                    </p>

                    <p>
                        Students may face difficulties in
                        selecting project ideas, planning their
                        learning, understanding technical
                        concepts, preparing documentation and
                        tracking project progress.
                    </p>

                    <h3>2. Proposed Solution</h3>

                    <p>
                        The proposed system uses AI-based
                        assistance to provide personalized
                        guidance and organize these academic
                        activities within a single application.
                    </p>

                `;

                break;


            case "objectives":

                content = `

                    <h3>1. Main Objective</h3>

                    <p>
                        ${description}
                    </p>

                    <h3>2. Specific Objectives</h3>

                    <ul>
                        <li>Provide personalized academic guidance.</li>
                        <li>Create structured learning roadmaps.</li>
                        <li>Support project development.</li>
                        <li>Assist with academic documentation.</li>
                        <li>Help students prepare for project viva.</li>
                        <li>Track project development progress.</li>
                        <li>Evaluate project ideas using AI.</li>
                    </ul>

                `;

                break;


            case "methodology":

                content = `

                    <h3>1. System Methodology</h3>

                    <p>
                        ${description}
                    </p>

                    <h3>2. Workflow</h3>

                    <p>
                        Student Input → Flask Backend →
                        Application Logic → AI Services /
                        MySQL Database → Personalized Output
                    </p>

                    <h3>3. Modular Development</h3>

                    <p>
                        The system is divided into independent
                        modules so that each feature can be
                        developed, tested and maintained
                        separately.
                    </p>

                `;

                break;


            case "modules":

                content = `

                    <h3>1. Student Profile Management</h3>

                    <p>
                        Stores and manages relevant student
                        learning information.
                    </p>

                    <h3>2. Learning Roadmap</h3>

                    <p>
                        Provides a structured learning path
                        based on student goals.
                    </p>

                    <h3>3. AI Project Mentor</h3>

                    <p>
                        Provides AI-based guidance for project
                        planning and development.
                    </p>

                    <h3>4. Documentation Assistant</h3>

                    <p>
                        Helps generate structured project
                        documentation.
                    </p>

                    <h3>5. Project Viva Assistant</h3>

                    <p>
                        Helps students prepare for project
                        viva questions.
                    </p>

                    <h3>6. AI Study Assistant</h3>

                    <p>
                        Provides question-and-answer based
                        academic assistance.
                    </p>

                    <h3>7. Project Progress Tracker</h3>

                    <p>
                        Tracks milestones, completed tasks and
                        overall project progress.
                    </p>

                    <h3>8. AI Project Idea Evaluator</h3>

                    <p>
                        Evaluates project ideas based on
                        originality, complexity, technologies
                        and feasibility.
                    </p>

                `;

                break;


            case "technology":

                content = `

                    <h3>1. Frontend Technologies</h3>

                    <p>
                        ${description}
                    </p>

                    <ul>
                        <li>HTML5</li>
                        <li>CSS3</li>
                        <li>JavaScript</li>
                    </ul>

                    <h3>2. Backend</h3>

                    <p>
                        Python with Flask is used to manage
                        application routes and backend logic.
                    </p>

                    <h3>3. Database</h3>

                    <p>
                        MySQL is used for structured storage
                        of student, project and progress data.
                    </p>

                    <h3>4. Artificial Intelligence</h3>

                    <p>
                        An LLM / OpenAI API can be integrated
                        to provide intelligent project and
                        academic assistance.
                    </p>

                `;

                break;


            case "future":

                content = `

                    <h3>1. Future Enhancements</h3>

                    <p>
                        ${description}
                    </p>

                    <ul>
                        <li>More personalized AI recommendations</li>
                        <li>Advanced learning analytics</li>
                        <li>Improved project evaluation</li>
                        <li>Voice-based AI interaction</li>
                        <li>Enhanced academic resource integration</li>
                        <li>Advanced progress visualization</li>
                    </ul>

                `;

                break;


            case "conclusion":

                content = `

                    <h3>1. Conclusion</h3>

                    <p>
                        ${description}
                    </p>

                    <p>
                        AI Student Mentor provides a centralized
                        environment for academic assistance and
                        project development. By combining learning
                        guidance, project support, documentation,
                        viva preparation and progress tracking,
                        the system aims to make the student's
                        project journey more organized and
                        productive.
                    </p>

                `;

                break;


            default:

                content = `

                    <h3>Project Documentation</h3>

                    <p>
                        ${description}
                    </p>

                    <p>
                        This section has been structured in an
                        academic format and can be customized
                        according to your project's requirements.
                    </p>

                `;

        }


        return {

            title:
                titles[type],

            content:
                content,

            style:
                style,

            length:
                length

        };

    }


    /* =====================================================
       SHOW DOCUMENT
    ====================================================== */

    function showDocument(document) {

    emptyState.style.display = "none";

    generatedDocument.classList.add("show");

    generatedTitle.textContent = document.title;

    generatedContent.innerHTML = document.content;

    const text = generatedContent.textContent;

    const words =
        text.trim()
            .split(/\s+/)
            .filter(Boolean)
            .length;

    wordCount.textContent = `${words} words`;

    sectionCount.textContent =
        (text.match(/^#{1,3}\s/gm) || []).length;
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


            link.href = url;

            link.download =
                `${title.replace(
                    /\s+/g,
                    "_"
                )}.txt`;


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


    /* =====================================================
       INITIALIZATION
    ====================================================== */

    updateCharacterCount();


    console.log(
        "AI Student Mentor - Documentation Assistant loaded."
    );

});
