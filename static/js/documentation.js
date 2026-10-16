
/* =========================================================
   AI STUDENT MENTOR — DOCUMENTATION ASSISTANT
   documentation.js
========================================================= */

document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    const $ = (id) => document.getElementById(id);

    /* =====================================================
       HTML ELEMENTS
    ===================================================== */

    const documentType = $("documentType");
    const projectInput = $("projectInput");
    const writingStyle = $("writingStyle");
    const documentLength = $("documentLength");

    const generateBtn = $("generateBtn");
    const characterCount = $("characterCount");
    const generationStatus = $("generationStatus");

    const emptyState = $("emptyState");
    const generatedDocument = $("generatedDocument");
    const generatedTitle = $("generatedTitle");
    const generatedContent = $("generatedContent");

    const wordCount = $("wordCount");
    const sectionCount = $("sectionCount");
    const figureCount = $("figureCount");

    const documentFigures = $("documentFigures");
    const uploadedImagesList = $("uploadedImagesList");

    const copyBtn = $("copyBtn");
    const downloadBtn = $("downloadBtn");
    const tipButton = $("tipButton");

    const documentationProjectSelect =
        $("documentationProjectSelect");
    const documentationProjectTitle =
        $("documentationProjectTitle");
    const documentationProjectDescription =
        $("documentationProjectDescription");

    const diagramType = $("diagramType");
    const diagramDescription = $("diagramDescription");
    const diagramCaption = $("diagramCaption");
    const generateDiagramBtn = $("generateDiagramBtn");
    const diagramStatus = $("diagramStatus");

    const imageUpload = $("imageUpload");
    const imageUploadStatus = $("imageUploadStatus");

    const notificationBtn = $("notificationBtn");
    const notificationPopup = $("notificationPopup");
    const closeNotificationBtn = $("closeNotificationBtn");

    const MAIN_DOCUMENTATION_PROJECT = {
        type: "main",
        id: null,
        title: "AI Student Mentor",
        description:
            "An AI-powered learning and project guidance system for BCA students.",
        info: `Project Title: AI Student Mentor: An Intelligent Learning and Project Guidance System

Project Domain: AI-powered educational web application.

Purpose: Help BCA students with learning, project development, documentation, progress tracking, project idea evaluation and viva preparation.

Technology Stack:
- Frontend: HTML, CSS and JavaScript
- Backend: Python with Flask
- Database: MySQL
- AI integration: Gemini API
- SDLC methodology: Waterfall

Eight Core Modules:
1. Student Profile Management
2. Learning Roadmap
3. AI Project Mentor
4. Documentation Assistant
5. Project Viva Assistant
6. AI Study Assistant
7. Project Progress Tracker
8. AI Project Idea Evaluator`
    };

    let documentationSavedProjects = [];
    let selectedDocumentationProject = MAIN_DOCUMENTATION_PROJECT;

    let currentDocument = null;
    let figures = [];
    let nextFigureId = 1;

    /* =====================================================
       GENERAL HELPERS
    ===================================================== */

    function getValue(id, fallback = "") {
        const element = $(id);
        return element ? element.value : fallback;
    }

    function getNumber(id, fallback) {
        const value = Number(getValue(id, fallback));
        return Number.isFinite(value) ? value : fallback;
    }

    function setStatus(element, message, type = "") {
        if (!element) return;

        element.textContent = message;
        element.classList.remove("success", "error", "warning");

        if (type) element.classList.add(type);
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[character]);
    }

    function escapeXML(value) {
        return String(value ?? "").replace(/[&<>"']/g, (character) => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&apos;"
        })[character]);
    }

    function getInitial(name) {
        return name?.trim()?.charAt(0)?.toUpperCase() || "S";
    }

    function safeFilename(value) {
        return String(value || "AI_Student_Mentor_Document")
            .replace(/[\\/:*?"<>|]+/g, "")
            .trim()
            .replace(/\s+/g, "_")
            .slice(0, 100) || "AI_Student_Mentor_Document";
    }

    /* =====================================================
       STUDENT PROFILE
    ===================================================== */

    async function loadStudentProfile() {
        try {
            const response = await fetch("/api/profile");
            const data = await response.json();

            if (!response.ok || !data.success || !data.profile) {
                return;
            }

            const name = data.profile.name?.trim() || "Student";
            const initial = getInitial(name);
            const course = String(data.profile.course || "").trim();

            const topAvatar = document.querySelector(".top-avatar");
            const topName = document.querySelector(".top-profile strong");
            const topCourse = document.querySelector(".top-profile span");
            const sideAvatar = document.querySelector(".user-avatar");
            const sideName = document.querySelector(".user-details strong");

            if (topAvatar) topAvatar.textContent = initial;
            if (topName) topName.textContent = name;

            if (topCourse) {
                topCourse.textContent = course
                    ? `${course} Student`
                    : "Student";
            }

            if (sideAvatar) sideAvatar.textContent = initial;
            if (sideName) sideName.textContent = name;

        } catch (error) {
            console.error("Documentation profile loading error:", error);
        }
    }

    /* =====================================================
       CHARACTER COUNTER — FIXED
    ===================================================== */

    function updateCharacterCount() {
        if (!characterCount || !projectInput) return;

        characterCount.textContent =
            `${projectInput.value.length} characters`;
    }

    projectInput?.addEventListener("input", updateCharacterCount);

    /* =====================================================
       DOCUMENTATION PROJECT SELECTOR
    ===================================================== */

    function getSavedIdeaDescription(idea) {
        if (!idea || typeof idea !== "object") return "";

        let evaluation =
            idea.evaluation_result ?? idea.evaluation_data;

        if (typeof evaluation === "string") {
            try {
                evaluation = JSON.parse(evaluation);
            } catch (_) {
                evaluation = null;
            }
        }

        const candidates = [
            idea.idea_description,
            idea.description,
            idea.project_description,
            idea.projectDescription,
            idea.ideaDescription,
            idea.idea,
            evaluation?.idea_description,
            evaluation?.description,
            evaluation?.project_description,
            evaluation?.ideaDescription,
            evaluation?.projectDescription,
            evaluation?.idea,
            evaluation?.project_idea
        ];

        for (const value of candidates) {
            if (typeof value === "string" && value.trim()) {
                return value.trim();
            }
        }

        return "";
    }

    function updateDocumentationProjectBanner(project) {
        if (documentationProjectTitle) {
            documentationProjectTitle.textContent = project.title;
        }

        if (documentationProjectDescription) {
            documentationProjectDescription.textContent =
                project.description ||
                "Enter the selected project's details to generate documentation.";
        }
    }

    function selectDocumentationProject(project) {
        selectedDocumentationProject = project;

        updateDocumentationProjectBanner(project);

        if (projectInput) {
            projectInput.value = project.info || "";
            updateCharacterCount();
        }
    }

    async function loadDocumentationProjects() {
        if (!documentationProjectSelect) return;

        try {
            const response = await fetch("/api/project-ideas");
            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(
                    data.error || "Could not load saved project ideas."
                );
            }

            documentationSavedProjects = (
                Array.isArray(data.ideas) ? data.ideas : []
            )
                .filter((idea) => idea && idea.id != null)
                .map((idea) => ({
                    id: idea.id,
                    title: String(
                        idea.title || "Untitled Project"
                    ).trim(),
                    description: getSavedIdeaDescription(idea)
                }));

            documentationProjectSelect.replaceChildren();

            const mainOption = document.createElement("option");
            mainOption.value = "main";
            mainOption.textContent =
                "AI Student Mentor — Main Project";
            documentationProjectSelect.appendChild(mainOption);

            documentationSavedProjects.forEach((project) => {
                const option = document.createElement("option");
                option.value = `idea:${project.id}`;
                option.textContent = project.title;
                documentationProjectSelect.appendChild(option);
            });

            documentationProjectSelect.value = "main";
            selectDocumentationProject(MAIN_DOCUMENTATION_PROJECT);

            console.log(
                "Documentation saved projects loaded:",
                documentationSavedProjects.length
            );

        } catch (error) {
            console.error("Documentation project loading error:", error);

            setStatus(
                generationStatus,
                "Saved projects could not be loaded. You can still use the main project.",
                "warning"
            );

            documentationProjectSelect.replaceChildren();

            const option = document.createElement("option");
            option.value = "main";
            option.textContent =
                "AI Student Mentor — Main Project";
            documentationProjectSelect.appendChild(option);

            documentationProjectSelect.value = "main";
            selectDocumentationProject(MAIN_DOCUMENTATION_PROJECT);
        }
    }

    documentationProjectSelect?.addEventListener("change", () => {
        const value = documentationProjectSelect.value;

        if (value === "main") {
            selectDocumentationProject(MAIN_DOCUMENTATION_PROJECT);
            return;
        }

        if (value.startsWith("idea:")) {
            const id = value.slice(5);

            const idea = documentationSavedProjects.find(
                (project) => String(project.id) === id
            );

            if (!idea) return;

            const description = idea.description ||
                "No saved description was found. Please enter the project details.";

            selectDocumentationProject({
                type: "saved",
                id: idea.id,
                title: idea.title,
                description,
                info:
                    `Project Title: ${idea.title}\n\n` +
                    `Project Description:\n${description}`
            });
        }
    });

    /* =====================================================
       QUICK TEMPLATES
    ===================================================== */

    const templateData = {
        synopsis: {
            type: "synopsis",
            text:
                "AI Student Mentor is an intelligent academic support " +
                "system designed to help students manage their learning " +
                "and project development journey. The system combines " +
                "multiple AI-powered features into a single platform."
        },

        methodology: {
            type: "methodology",
            text:
                "The system follows a modular architecture. The frontend " +
                "provides an interactive interface, while the Flask backend " +
                "manages application logic and communication with MySQL " +
                "and AI services."
        },

        modules: {
            type: "modules",
            text:
                "The project consists of Student Profile Management, " +
                "Learning Roadmap, AI Project Mentor, Documentation " +
                "Assistant, Project Viva Assistant, AI Study Assistant, " +
                "Project Progress Tracker and AI Project Idea Evaluator."
        },

        future: {
            type: "future",
            text:
                "Future enhancements can include improved personalization, " +
                "additional AI capabilities, analytics dashboards, stronger " +
                "project recommendations and integration with additional " +
                "academic resources."
        }
    };

    document.querySelectorAll(".template-card").forEach((card) => {
        card.addEventListener("click", () => {
            const template = templateData[card.dataset.template];

            if (!template || !projectInput || !documentType) return;

            documentType.value = template.type;
            projectInput.value = template.text;

            updateCharacterCount();
            projectInput.focus();

            projectInput.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });
        });
    });

    /* =====================================================
       FORMATTING SETTINGS
    ===================================================== */

    function getFormattingSettings() {
        return {
            output_format: getValue("outputFormat", "docx"),
            font_family: getValue("fontFamily", "Times New Roman"),

            body_font_size: getNumber("bodyFontSize", 12),
            heading_font_size: getNumber("headingFontSize", 14),
            title_font_size: getNumber("titleFontSize", 18),

            page_size: getValue("pageSize", "A4"),
            orientation: getValue("pageOrientation", "portrait"),

            margin_top: getNumber("marginTop", 1),
            margin_bottom: getNumber("marginBottom", 1),
            margin_left: getNumber("marginLeft", 1),
            margin_right: getNumber("marginRight", 1),

            alignment: getValue("textAlignment", "justify"),
            line_spacing: getNumber("lineSpacing", 1.5),
            paragraph_spacing: getNumber("paragraphSpacing", 6),

            page_border: getValue("pageBorder", "none"),
            border_width: getNumber("borderWidth", 1),

            page_number_position:
                getValue("pageNumberPosition", "bottom-center"),

            page_number_start: getNumber("pageNumberStart", 1),

            college_requirements:
                getValue("collegeRequirements", "").trim()
        };
    }

    function validateFormatting(settings) {
        const margins = [
            settings.margin_top,
            settings.margin_bottom,
            settings.margin_left,
            settings.margin_right
        ];

        if (
            margins.some((value) =>
                !Number.isFinite(value) || value < 0 || value > 3
            )
        ) {
            alert("Please enter margins between 0 and 3 inches.");
            return false;
        }

        if (
            !Number.isInteger(settings.page_number_start) ||
            settings.page_number_start < 1 ||
            settings.page_number_start > 999
        ) {
            alert("Page numbering must start from 1 to 999.");
            return false;
        }

        if (
            settings.body_font_size < 6 ||
            settings.body_font_size > 30 ||
            settings.heading_font_size < 8 ||
            settings.heading_font_size > 40 ||
            settings.title_font_size < 10 ||
            settings.title_font_size > 50
        ) {
            alert("Please enter valid font sizes.");
            return false;
        }

        if (
            settings.line_spacing < 1 ||
            settings.line_spacing > 3
        ) {
            alert("Line spacing must be between 1 and 3.");
            return false;
        }

        if (
            settings.paragraph_spacing < 0 ||
            settings.paragraph_spacing > 50
        ) {
            alert("Paragraph spacing must be between 0 and 50.");
            return false;
        }

        if (
            !Number.isFinite(settings.border_width) ||
            settings.border_width < 0.25 ||
            settings.border_width > 5
        ) {
            alert("Border width must be between 0.25 and 5.");
            return false;
        }

        return true;
    }

    /* =====================================================
       MARKDOWN TO SAFE HTML
    ===================================================== */

    function markdownToHTML(markdown) {
        const lines = String(markdown || "")
            .replace(/\r/g, "")
            .split("\n");

        const result = [];
        let inList = false;
        let inOrderedList = false;

        function closeList() {
            if (!inList) return;

            result.push(inOrderedList ? "</ol>" : "</ul>");
            inList = false;
            inOrderedList = false;
        }

        function inlineFormatting(text) {
            return escapeHTML(text)
                .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
                .replace(/\*(.+?)\*/g, "<em>$1</em>")
                .replace(/`([^`]+)`/g, "<code>$1</code>");
        }

        for (const rawLine of lines) {
            const line = rawLine.trim();

            if (!line) {
                closeList();
                continue;
            }

            if (/^###\s+/.test(line)) {
                closeList();
                result.push(
                    `<h4>${inlineFormatting(line.replace(/^###\s+/, ""))}</h4>`
                );
            } else if (/^##\s+/.test(line)) {
                closeList();
                result.push(
                    `<h3>${inlineFormatting(line.replace(/^##\s+/, ""))}</h3>`
                );
            } else if (/^#\s+/.test(line)) {
                closeList();
                result.push(
                    `<h2>${inlineFormatting(line.replace(/^#\s+/, ""))}</h2>`
                );
            } else if (/^[-*]\s+/.test(line)) {
                if (!inList || inOrderedList) {
                    closeList();
                    result.push("<ul>");
                    inList = true;
                    inOrderedList = false;
                }

                result.push(
                    `<li>${inlineFormatting(line.replace(/^[-*]\s+/, ""))}</li>`
                );
            } else if (/^\d+[.)]\s+/.test(line)) {
                if (!inList || !inOrderedList) {
                    closeList();
                    result.push("<ol>");
                    inList = true;
                    inOrderedList = true;
                }

                result.push(
                    `<li>${inlineFormatting(line.replace(/^\d+[.)]\s+/, ""))}</li>`
                );
            } else if (/^---+$/.test(line)) {
                closeList();
                result.push("<hr>");
            } else {
                closeList();
                result.push(`<p>${inlineFormatting(line)}</p>`);
            }
        }

        closeList();
        return result.join("\n");
    }

    /* =====================================================
       FIGURE PLACEMENT HELPERS
    ===================================================== */

    function countMarkdownBlocks(markdown) {
        return String(markdown || "")
            .replace(/\r/g, "")
            .split("\n")
            .filter((line) => line.trim().length > 0)
            .length;
    }

    function getContentBlocks() {
        if (!generatedContent) return [];

        return Array.from(
            generatedContent.querySelectorAll("h2, h3, h4, p, li, hr")
        );
    }

    function getPlacementIndex(figure) {
        const total = currentDocument
            ? countMarkdownBlocks(currentDocument.markdown)
            : 0;

        if (
            figure.insertAfter === undefined ||
            figure.insertAfter === null
        ) {
            return total;
        }

        const value = Number(figure.insertAfter);

        if (!Number.isInteger(value)) return total;

        return Math.max(0, Math.min(total, value));
    }

    function getFigureCaption(figure, index) {
        const number = index + 1;
        const label = figure.kind === "diagram" ? "Diagram" : "Image";

        let caption = String(figure.caption || "").trim();

        caption = caption.replace(
            /^(?:figure|diagram|image)\s*\d+\s*[:.)-]\s*/i,
            ""
        ).trim();

        return {
            number,
            label,
            text: caption || `${label} ${number}`
        };
    }

    /* =====================================================
       INSERT FIGURES INTO DOCUMENT PREVIEW
    ===================================================== */

    function renderInlineFigures() {
        if (!generatedContent) return;

        generatedContent
            .querySelectorAll(".inline-document-figure")
            .forEach((element) => element.remove());

        const blocks = getContentBlocks();

        const ordered = figures
            .map((figure, index) => ({
                figure,
                index,
                placement: getPlacementIndex(figure)
            }))
            .sort((a, b) => {
                if (a.placement !== b.placement) {
                    return b.placement - a.placement;
                }

                return b.index - a.index;
            });

        ordered.forEach(({ figure, index, placement }) => {
            const captionInfo = getFigureCaption(figure, index);

            const wrapper = document.createElement("figure");
            wrapper.className = "inline-document-figure";

            if (figure.dataUrl) {
                const image = document.createElement("img");
                image.src = figure.dataUrl;
                image.alt = captionInfo.text;
                image.style.maxWidth = "100%";
                image.style.height = "auto";
                wrapper.appendChild(image);
            }

            const caption = document.createElement("figcaption");
            caption.textContent =
                `Figure ${captionInfo.number}. ${captionInfo.text}`;

            wrapper.appendChild(caption);

            if (placement <= 0) {
                generatedContent.prepend(wrapper);
                return;
            }

            if (blocks.length && placement <= blocks.length) {
                const target = blocks[placement - 1];

                if (target?.parentElement) {
                    if (
                        target.tagName === "LI" &&
                        ["UL", "OL"].includes(target.parentElement.tagName)
                    ) {
                        target.parentElement.after(wrapper);
                    } else {
                        target.after(wrapper);
                    }

                    return;
                }
            }

            generatedContent.appendChild(wrapper);
        });
    }

    function updateFigureCount() {
        if (figureCount) {
            figureCount.textContent = String(figures.length);
        }
    }

    function addFigure(figure) {
        figure.id = nextFigureId++;

        if (figure.insertAfter === undefined) {
            figure.insertAfter = currentDocument
                ? countMarkdownBlocks(currentDocument.markdown)
                : 0;
        }

        figures.push(figure);

        renderFigures();
        renderUploadedImages();
        renderInlineFigures();
        updateFigureCount();

        return figure;
    }

    /* =====================================================
       DIAGRAM GENERATOR
    ===================================================== */

    function getDiagramSteps(description) {
        const cleaned = String(description || "").trim();

        if (!cleaned) return [];

        let steps = cleaned
            .split(/\n|;|→|->|➜/g)
            .map((item) => item.trim())
            .filter(Boolean);

        if (steps.length === 1) {
            steps = cleaned
                .split(/,\s*(?=[A-Z0-9])/)
                .map((item) => item.trim())
                .filter(Boolean);
        }

        if (steps.length === 1) {
            steps = ["Start", cleaned, "Process", "Result"];
        }

        return steps.slice(0, 6);
    }

    function createDiagramSVG(type, description) {
        const steps = getDiagramSteps(description);

        if (!steps.length) {
            throw new Error("Enter a diagram description first.");
        }

        const boxWidth = 210;
        const boxHeight = 58;
        const gap = 34;
        const left = 35;
        const top = 30;
        const width = 390;

        const height =
            top * 2 +
            steps.length * boxHeight +
            (steps.length - 1) * gap;

        const colors = [
            "#dbeafe",
            "#e0e7ff",
            "#dcfce7",
            "#fef3c7",
            "#fce7f3",
            "#e0f2fe"
        ];

        function wrapText(text, maxLength = 27) {
            const words = String(text).split(/\s+/);
            const lines = [];
            let current = "";

            for (const word of words) {
                const next = current ? `${current} ${word}` : word;

                if (next.length > maxLength && current) {
                    lines.push(current);
                    current = word;
                } else {
                    current = next;
                }
            }

            if (current) lines.push(current);
            return lines.slice(0, 2);
        }

        let shapes = "";

        steps.forEach((step, index) => {
            const y = top + index * (boxHeight + gap);
            const fill = colors[index % colors.length];

            if (index > 0) {
                const previousBottom =
                    top + (index - 1) * (boxHeight + gap) + boxHeight;

                const arrowX = left + boxWidth / 2;
                const arrowEndY = y - 5;

                shapes += `
                    <line x1="${arrowX}" y1="${previousBottom}"
                          x2="${arrowX}" y2="${arrowEndY}"
                          stroke="#64748b" stroke-width="2"/>
                    <polygon
                        points="${arrowX - 5},${arrowEndY - 6}
                                ${arrowX + 5},${arrowEndY - 6}
                                ${arrowX},${arrowEndY}"
                        fill="#64748b"/>
                `;
            }

            const lines = wrapText(step);
            const textY =
                y + boxHeight / 2 - ((lines.length - 1) * 7);

            const textLines = lines.map((line, lineIndex) => `
                <text
                    x="${left + boxWidth / 2}"
                    y="${textY + lineIndex * 16}"
                    text-anchor="middle"
                    font-family="Arial, sans-serif"
                    font-size="12"
                    font-weight="600"
                    fill="#1e293b"
                >${escapeXML(line)}</text>
            `).join("");

            const radius = type === "usecase" ? 27 : 8;

            shapes += `
                <rect x="${left}" y="${y}" width="${boxWidth}"
                      height="${boxHeight}" rx="${radius}"
                      fill="${fill}" stroke="#64748b" stroke-width="1.3"/>
                ${textLines}
            `;
        });

        const titles = {
            er: "Entity Relationship Diagram",
            flowchart: "Flowchart",
            architecture: "System Architecture",
            usecase: "Use Case Diagram",
            class: "Class Diagram",
            sequence: "Sequence Diagram",
            activity: "Activity Diagram"
        };

        const title = titles[type] || "Project Diagram";

        return `
            <svg xmlns="http://www.w3.org/2000/svg"
                 width="${width}" height="${height + 35}"
                 viewBox="0 0 ${width} ${height + 35}"
                 role="img" aria-label="${escapeXML(title)}">
                <rect width="100%" height="100%" fill="#ffffff" rx="8"/>
                <text x="${width / 2}" y="19"
                      text-anchor="middle"
                      font-family="Arial, sans-serif"
                      font-size="13" font-weight="700"
                      fill="#1e293b">${escapeXML(title)}</text>
                ${shapes}
            </svg>
        `;
    }

    async function generateDiagram() {
        if (!diagramDescription || !generateDiagramBtn) return;

        const description = diagramDescription.value.trim();

        if (!description) {
            setStatus(
                diagramStatus,
                "Please describe the diagram first.",
                "warning"
            );
            diagramDescription.focus();
            return;
        }

        generateDiagramBtn.disabled = true;
        setStatus(diagramStatus, "Creating diagram...");

        let objectURL = null;

        try {
            const type = getValue("diagramType", "flowchart");
            const svg = createDiagramSVG(type, description);

            const blob = new Blob([svg], {
                type: "image/svg+xml;charset=utf-8"
            });

            objectURL = URL.createObjectURL(blob);

            const image = new Image();

            const pngDataURL = await new Promise((resolve, reject) => {
                image.onload = () => {
                    try {
                        const canvas = document.createElement("canvas");
                        canvas.width = image.naturalWidth * 2;
                        canvas.height = image.naturalHeight * 2;

                        const context = canvas.getContext("2d");

                        if (!context) {
                            throw new Error("Canvas is unavailable.");
                        }

                        context.fillStyle = "#ffffff";
                        context.fillRect(0, 0, canvas.width, canvas.height);

                        context.drawImage(
                            image,
                            0,
                            0,
                            canvas.width,
                            canvas.height
                        );

                        const png = canvas.toDataURL("image/png");

                        if (!png.startsWith("data:image/png;base64,")) {
                            throw new Error("Could not create PNG image data.");
                        }

                        resolve(png);
                    } catch (error) {
                        reject(error);
                    }
                };

                image.onerror = () => {
                    reject(new Error("Could not convert diagram to PNG."));
                };

                image.src = objectURL;
            });

            const caption =
                getValue("diagramCaption").trim() ||
                `${type.charAt(0).toUpperCase() + type.slice(1)} diagram`;

            addFigure({
                kind: "diagram",
                type,
                caption,
                svg: "",
                dataUrl: pngDataURL,
                mimeType: "image/png",
                filename: `${type}_diagram.png`
            });

            setStatus(
                diagramStatus,
                "Diagram added successfully.",
                "success"
            );

        } catch (error) {
            console.error("Diagram generation error:", error);

            setStatus(
                diagramStatus,
                error.message || "Could not create the diagram.",
                "error"
            );

        } finally {
            if (objectURL) URL.revokeObjectURL(objectURL);
            generateDiagramBtn.disabled = false;
        }
    }

    generateDiagramBtn?.addEventListener("click", generateDiagram);

    /* =====================================================
       IMAGE UPLOAD
    ===================================================== */

    const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

    const ALLOWED_IMAGE_TYPES = [
        "image/png",
        "image/jpeg",
        "image/webp"
    ];

    function readImageFile(file) {
        return new Promise((resolve, reject) => {
            if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
                reject(
                    new Error(
                        `${file.name}: use PNG, JPG/JPEG or WEBP images.`
                    )
                );
                return;
            }

            if (file.size > MAX_IMAGE_SIZE) {
                reject(
                    new Error(
                        `${file.name}: image size must be 8 MB or less.`
                    )
                );
                return;
            }

            const reader = new FileReader();

            reader.onload = () => {
                if (typeof reader.result !== "string") {
                    reject(new Error(`Could not read ${file.name}.`));
                    return;
                }

                resolve(reader.result);
            };

            reader.onerror = () => {
                reject(new Error(`Could not read ${file.name}.`));
            };

            reader.readAsDataURL(file);
        });
    }

    async function handleImageUpload(event) {
        const files = Array.from(event.target.files || []);

        if (!files.length) return;

        let added = 0;
        const errors = [];

        setStatus(imageUploadStatus, "Reading selected images...");

        for (const file of files) {
            try {
                const dataUrl = await readImageFile(file);

                addFigure({
                    kind: "image",
                    filename: file.name,
                    caption: file.name.replace(/\.[^.]+$/, ""),
                    dataUrl,
                    svg: "",
                    mimeType: file.type
                });

                added++;
            } catch (error) {
                errors.push(error.message);
            }
        }

        if (errors.length) {
            setStatus(
                imageUploadStatus,
                `${added} image(s) added. ${errors.join(" ")}`,
                added ? "warning" : "error"
            );
        } else {
            setStatus(
                imageUploadStatus,
                `${added} image(s) added successfully.`,
                "success"
            );
        }

        imageUpload.value = "";
    }

    imageUpload?.addEventListener("change", handleImageUpload);

    /* =====================================================
       FIGURE PREVIEW, PLACEMENT AND CAPTIONS
    ===================================================== */

    function renderFigures() {
        if (!documentFigures) return;

        documentFigures.replaceChildren();

        figures.forEach((figure, index) => {
            const captionInfo = getFigureCaption(figure, index);
            const figureElement = document.createElement("figure");

            figureElement.className = "document-figure";
            figureElement.dataset.figureId = String(figure.id);

            if (figure.dataUrl) {
                const image = document.createElement("img");

                image.src = figure.dataUrl;
                image.alt =
                    figure.caption ||
                    figure.filename ||
                    "Documentation figure";
                image.loading = "lazy";

                figureElement.appendChild(image);
            } else if (figure.kind === "diagram" && figure.svg) {
                const preview = document.createElement("div");

                preview.className = "diagram-preview";
                preview.innerHTML = figure.svg;

                figureElement.appendChild(preview);
            }

            const caption = document.createElement("figcaption");
            caption.className = "figure-caption";

            const number = document.createElement("strong");
            number.className = "figure-number";
            number.textContent = `Figure ${captionInfo.number}. `;

            const captionText = document.createElement("span");
            captionText.textContent = captionInfo.text;

            caption.append(number, captionText);
            figureElement.appendChild(caption);

            /* Placement dropdown */

            const placementLabel = document.createElement("label");
            placementLabel.className = "figure-placement-control";
            placementLabel.textContent = "Place figure after";

            const placementSelect = document.createElement("select");
            placementSelect.className = "figure-placement-select";
            placementSelect.setAttribute(
                "aria-label",
                `Placement for figure ${captionInfo.number}`
            );

            const totalBlocks = currentDocument
                ? countMarkdownBlocks(currentDocument.markdown)
                : 0;

            const blocks = getContentBlocks();

            const placementOptions = [
                {
                    value: "0",
                    label: "Beginning of document"
                }
            ];

            for (let i = 0; i < totalBlocks; i++) {
                const block = blocks[i];

                let description = block
                    ? block.textContent.trim().replace(/\s+/g, " ")
                    : `Content block ${i + 1}`;

                if (!description) {
                    description = `Content block ${i + 1}`;
                }

                if (description.length > 45) {
                    description = `${description.slice(0, 42)}...`;
                }

                placementOptions.push({
                    value: String(i + 1),
                    label: `After ${i + 1}: ${description}`
                });
            }

            placementOptions.push({
                value: String(totalBlocks),
                label: "End of document"
            });

            const uniqueOptions = new Map();

            placementOptions.forEach((option) => {
                uniqueOptions.set(option.value, option);
            });

            uniqueOptions.forEach((option) => {
                const optionElement = document.createElement("option");

                optionElement.value = option.value;
                optionElement.textContent = option.label;

                placementSelect.appendChild(optionElement);
            });

            placementSelect.value = String(getPlacementIndex(figure));

            placementSelect.addEventListener("change", () => {
                figure.insertAfter = Number(placementSelect.value);

                renderFigures();
                renderInlineFigures();
            });

            placementLabel.appendChild(placementSelect);
            figureElement.appendChild(placementLabel);

            /* Editable caption */

            const editLabel = document.createElement("label");
            editLabel.className = "figure-caption-input";
            editLabel.textContent = "Edit caption";

            const captionInput = document.createElement("input");
            captionInput.type = "text";
            captionInput.value = figure.caption || "";
            captionInput.maxLength = 250;
            captionInput.placeholder = "Enter a caption";

            captionInput.setAttribute(
                "aria-label",
                `Caption for figure ${captionInfo.number}`
            );

            captionInput.addEventListener("input", () => {
                figure.caption = captionInput.value;

                captionText.textContent =
                    figure.caption.trim() ||
                    `${captionInfo.label} ${captionInfo.number}`;

                renderUploadedImageCaption(figure.id);
                renderInlineFigures();
            });

            editLabel.appendChild(captionInput);
            figureElement.appendChild(editLabel);

            /* Remove figure */

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-image-btn";
            removeButton.textContent = "Remove figure";

            removeButton.addEventListener("click", () => {
                removeFigure(figure.id);
            });

            figureElement.appendChild(removeButton);
            documentFigures.appendChild(figureElement);
        });

        updateFigureCount();
    }

    function renderUploadedImageCaption(figureId) {
        const item = uploadedImagesList?.querySelector(
            `[data-figure-id="${figureId}"]`
        );

        if (!item) return;

        const figure = figures.find((entry) => entry.id === figureId);
        const input = item.querySelector(".image-caption-input");

        if (figure && input && input.value !== figure.caption) {
            input.value = figure.caption;
        }
    }

    function removeFigure(figureId) {
        figures = figures.filter((figure) => figure.id !== figureId);

        renderFigures();
        renderUploadedImages();
        renderInlineFigures();
        updateFigureCount();
    }

    /* =====================================================
       UPLOADED IMAGE LIST
    ===================================================== */

    function renderUploadedImages() {
        if (!uploadedImagesList) return;

        uploadedImagesList.replaceChildren();

        const images = figures.filter(
            (figure) => figure.kind === "image"
        );

        if (!images.length) {
            const empty = document.createElement("div");

            empty.className = "uploaded-images-empty";
            empty.textContent =
                "No images uploaded yet. Select an image to preview it here.";

            uploadedImagesList.appendChild(empty);
            return;
        }

        images.forEach((figure) => {
            const item = document.createElement("div");

            item.className = "uploaded-image-item";
            item.dataset.figureId = String(figure.id);

            const image = document.createElement("img");
            image.src = figure.dataUrl;
            image.alt =
                figure.caption || figure.filename || "Uploaded image";

            const filename = document.createElement("span");
            filename.className = "image-name";
            filename.textContent = figure.filename || "Uploaded image";

            const captionInput = document.createElement("input");
            captionInput.type = "text";
            captionInput.className = "image-caption-input";
            captionInput.value = figure.caption || "";
            captionInput.maxLength = 250;
            captionInput.placeholder = "Enter image caption";
            captionInput.setAttribute("aria-label", "Image caption");

            captionInput.addEventListener("input", () => {
                figure.caption = captionInput.value;

                const preview = documentFigures?.querySelector(
                    `.document-figure[data-figure-id="${figure.id}"]`
                );

                if (preview) {
                    const captionText = preview.querySelector(
                        ".figure-caption span"
                    );

                    if (captionText) {
                        const index = figures.findIndex(
                            (entry) => entry.id === figure.id
                        );

                        captionText.textContent =
                            figure.caption.trim() ||
                            `Image ${index + 1}`;
                    }

                    const previewInput = preview.querySelector(
                        ".figure-caption-input input"
                    );

                    if (previewInput && previewInput !== captionInput) {
                        previewInput.value = figure.caption;
                    }
                }

                renderInlineFigures();
            });

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-image-btn";
            removeButton.textContent = "Remove image";

            removeButton.addEventListener("click", () => {
                removeFigure(figure.id);
            });

            item.append(
                image,
                filename,
                captionInput,
                removeButton
            );

            uploadedImagesList.appendChild(item);
        });
    }

    /* =====================================================
       GENERATE DOCUMENT WITH AI
    ===================================================== */

    generateBtn?.addEventListener("click", generateDocument);

    async function generateDocument() {
        const description = projectInput?.value.trim();

        if (!description) {
            setStatus(
                generationStatus,
                "Enter your project information before generating documentation.",
                "warning"
            );

            projectInput?.focus();
            return;
        }

        const originalHTML = generateBtn.innerHTML;

        generateBtn.disabled = true;
        generateBtn.classList.add("loading");
        generateBtn.textContent = "Generating...";

        setStatus(generationStatus, "Generating your documentation...");

        try {
            const response = await fetch("/api/documentation", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    type: getValue("documentType", "synopsis"),
                    description,
                    style: getValue("writingStyle", "academic"),
                    length: getValue("documentLength", "medium"),
                    project_title: selectedDocumentationProject.title,
                    project_type: selectedDocumentationProject.type,
                    project_id: selectedDocumentationProject.id
                })
            });

            const data = await response.json();

            if (!response.ok || !data.success || !data.response) {
                throw new Error(
                    data.error || "Documentation generation failed."
                );
            }

            const title = documentType
                ? documentType.options[documentType.selectedIndex]?.text ||
                  "Project Documentation"
                : "Project Documentation";

            currentDocument = {
                title,
                markdown: data.response,
                html: markdownToHTML(data.response),
                settings: getFormattingSettings()
            };

            const blockCount = countMarkdownBlocks(
                currentDocument.markdown
            );

            figures.forEach((figure) => {
                figure.insertAfter = Math.min(
                    getPlacementIndex(figure),
                    blockCount
                );
            });

            showDocument(currentDocument);

            if (copyBtn) copyBtn.disabled = false;
            if (downloadBtn) downloadBtn.disabled = false;

            setStatus(
                generationStatus,
                "Documentation generated successfully.",
                "success"
            );

        } catch (error) {
            console.error("Documentation generation error:", error);

            setStatus(
                generationStatus,
                error.message ||
                    "Unable to generate documentation. Please try again.",
                "error"
            );

        } finally {
            generateBtn.disabled = false;
            generateBtn.classList.remove("loading");
            generateBtn.innerHTML = originalHTML;
        }
    }

    /* =====================================================
       DISPLAY DOCUMENT PREVIEW
    ===================================================== */

    function showDocument(documentData) {
        if (emptyState) emptyState.hidden = true;

        if (generatedDocument) {
            generatedDocument.hidden = false;
            generatedDocument.classList.add("show");
        }

        if (generatedTitle) {
            generatedTitle.textContent = documentData.title;
        }

        if (generatedContent) {
            generatedContent.innerHTML = documentData.html;
        }

        updateDocumentCounts();
        renderFigures();
        renderInlineFigures();

        generatedDocument?.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    function updateDocumentCounts() {
        const text = generatedContent
            ? generatedContent.innerText.trim()
            : "";

        const words = text ? text.split(/\s+/).length : 0;

        if (wordCount) {
            wordCount.textContent = `${words} words`;
        }

        if (sectionCount) {
            sectionCount.textContent = String(
                generatedContent
                    ? generatedContent.querySelectorAll("h2, h3, h4").length
                    : 0
            );
        }

        updateFigureCount();
    }

    /* =====================================================
       COPY DOCUMENT
    ===================================================== */

    copyBtn?.addEventListener("click", async () => {
        if (!currentDocument) {
            setStatus(
                generationStatus,
                "Generate documentation before copying.",
                "warning"
            );
            return;
        }

        const blocks = getContentBlocks();
        const figureText = [];

        figures.forEach((figure, index) => {
            const caption = getFigureCaption(figure, index);

            figureText.push({
                placement: getPlacementIndex(figure),
                index,
                text: `Figure ${caption.number}. ${caption.text}`
            });
        });

        const lines = [];
        const figuresAt = new Map();

        figureText.forEach((entry) => {
            if (!figuresAt.has(entry.placement)) {
                figuresAt.set(entry.placement, []);
            }

            figuresAt.get(entry.placement).push(entry);
        });

        function appendCaptions(position) {
            const entries = figuresAt.get(position) || [];

            entries.forEach((entry) => lines.push(entry.text));
        }

        appendCaptions(0);

        blocks.forEach((block, index) => {
            lines.push(block.innerText.trim());
            appendCaptions(index + 1);
        });

        const textToCopy = [
            currentDocument.title,
            "",
            lines.join("\n")
        ].join("\n");

        try {
            await navigator.clipboard.writeText(textToCopy);
            showTemporaryMessage(copyBtn, "✓ Copied");
        } catch (error) {
            console.error("Copy failed:", error);

            setStatus(
                generationStatus,
                "Could not copy the document. Try using the page over localhost or HTTPS.",
                "error"
            );
        }
    });

    /* =====================================================
       EXPORT WORD / PDF
    ===================================================== */

    downloadBtn?.addEventListener("click", downloadDocument);

    async function downloadDocument() {
        if (!currentDocument) {
            setStatus(
                generationStatus,
                "Generate documentation before downloading.",
                "warning"
            );
            return;
        }

        const settings = getFormattingSettings();

        if (!validateFormatting(settings)) return;

        const originalHTML = downloadBtn.innerHTML;

        downloadBtn.disabled = true;
        downloadBtn.textContent = "Preparing download...";

        try {
            const exportFigures = figures.map((figure, index) => {
                const caption = getFigureCaption(figure, index);

                if (
                    !figure.dataUrl ||
                    !figure.dataUrl.startsWith("data:image/")
                ) {
                    throw new Error(
                        `Figure ${index + 1} has no valid image data. ` +
                        "Please remove it and add the figure again."
                    );
                }

                return {
                    figure_number: caption.number,
                    kind: figure.kind,
                    type: figure.type || "",
                    caption: caption.text,
                    filename: figure.filename || "",
                    mime_type: figure.mimeType || "",
                    data_url: figure.dataUrl,
                    insert_after: getPlacementIndex(figure),
                    svg: ""
                };
            });

            const response = await fetch("/api/documentation/export", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    title: currentDocument.title,
                    content: currentDocument.markdown,
                    settings,
                    figures: exportFigures
                })
            });

            if (!response.ok) {
                let message = "Could not export the document.";

                try {
                    const errorData = await response.json();
                    message = errorData.error || message;
                } catch (_) {
                    // Use the default error message.
                }

                throw new Error(message);
            }

            const blob = await response.blob();

            if (!blob.size) {
                throw new Error("The server returned an empty document.");
            }

            const format = settings.output_format.toLowerCase();
            const extension = format === "pdf" ? "pdf" : "docx";

            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");

            link.href = url;
            link.download =
                `${safeFilename(currentDocument.title)}.${extension}`;

            document.body.appendChild(link);
            link.click();
            link.remove();

            window.setTimeout(() => {
                URL.revokeObjectURL(url);
            }, 1500);

            setStatus(
                generationStatus,
                `${extension.toUpperCase()} document downloaded.`,
                "success"
            );

        } catch (error) {
            console.error("Document export error:", error);

            setStatus(
                generationStatus,
                error.message || "Download failed. Please try again.",
                "error"
            );

        } finally {
            downloadBtn.disabled = false;
            downloadBtn.innerHTML = originalHTML;
        }
    }

    /* =====================================================
       USE MY PROJECT DETAILS
    ===================================================== */

    tipButton?.addEventListener("click", () => {
        if (!documentType || !projectInput) return;

        documentType.value = "synopsis";
        projectInput.value = selectedDocumentationProject.info || "";

        updateCharacterCount();
        projectInput.focus();

        projectInput.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        setStatus(
            generationStatus,
            "Your project details have been added. Review them before generating.",
            "success"
        );
    });

    /* =====================================================
       TEMPORARY BUTTON FEEDBACK
    ===================================================== */

    function showTemporaryMessage(button, message) {
        const original = button.innerHTML;

        button.textContent = message;
        button.disabled = true;

        window.setTimeout(() => {
            button.innerHTML = original;
            button.disabled = !currentDocument;
        }, 1200);
    }

    /* =====================================================
       NOTIFICATIONS
    ===================================================== */

    function closeNotifications() {
        if (!notificationPopup) return;

        notificationPopup.hidden = true;
        notificationPopup.classList.remove("show");
    }

    notificationBtn?.addEventListener("click", (event) => {
        event.stopPropagation();

        if (!notificationPopup) return;

        const opening = notificationPopup.hidden;

        notificationPopup.hidden = !opening;
        notificationPopup.classList.toggle("show", opening);
    });

    closeNotificationBtn?.addEventListener(
        "click",
        closeNotifications
    );

    document.addEventListener("click", (event) => {
        if (
            notificationPopup &&
            !notificationPopup.contains(event.target) &&
            !notificationBtn?.contains(event.target)
        ) {
            closeNotifications();
        }
    });

    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeNotifications();
        }
    });

    /* =====================================================
       AI HELP CARD ACCESSIBILITY
    ===================================================== */

    const aiHelpTrigger = $("aiHelpTrigger");

    if (aiHelpTrigger) {
        aiHelpTrigger.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                aiHelpTrigger.click();
            }
        });
    }

    /* =====================================================
       INITIALIZE
    ===================================================== */

    if (copyBtn) copyBtn.disabled = true;
    if (downloadBtn) downloadBtn.disabled = true;

    loadStudentProfile();
    updateCharacterCount();
    renderFigures();
    renderUploadedImages();
    loadDocumentationProjects();

    console.log("Documentation Assistant loaded successfully.");
});
