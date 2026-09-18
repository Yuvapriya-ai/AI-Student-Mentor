document.addEventListener("DOMContentLoaded", function () {

    const questionCategory = document.getElementById("questionCategory");
    const difficultyLevel = document.getElementById("difficultyLevel");
    const questionNumber = document.getElementById("questionNumber");
    const projectInput = document.getElementById("projectInput");

    const generateBtn = document.getElementById("generateBtn");

    const documentPreview = document.getElementById("documentPreview");
    const emptyState = document.getElementById("emptyState");
    const generatedDocument = document.getElementById("generatedDocument");

    const generatedTitle = document.getElementById("generatedTitle");
    const generatedContent = document.getElementById("generatedContent");

    const copyBtn = document.getElementById("copyBtn");
    const downloadBtn = document.getElementById("downloadBtn");

    const wordCount = document.getElementById("wordCount");
    const characterCount = document.getElementById("characterCount");

    const tipButton = document.getElementById("tipButton");

    // --------------------------------------------------
    // Character Counter
    // --------------------------------------------------

    if (projectInput && characterCount) {
        projectInput.addEventListener("input", function () {
            characterCount.textContent = projectInput.value.length;
        });
    }


    // --------------------------------------------------
    // Generate Viva Questions
    // --------------------------------------------------

    if (generateBtn) {
        generateBtn.addEventListener("click", async function () {

            const category = questionCategory.value;
            const difficulty = difficultyLevel.value;
            const count = questionNumber.value;
            const projectInfo = projectInput.value.trim();

            if (!projectInfo) {
                showNotification("Please enter your project information first.");
                projectInput.focus();
                return;
            }

            generateBtn.disabled = true;
            generateBtn.textContent = "Generating...";

            try {

                const response = await fetch("/api/viva", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        category: category,
                        difficulty: difficulty,
                        count: count,
                        project_info: projectInfo
                    })
                });

                const data = await response.json();

                if (!response.ok || !data.success) {
                    throw new Error(data.error || "Unable to generate viva questions.");
                }

                displayQuestions(data.questions);

                showNotification("Viva questions generated successfully!");

            } catch (error) {

                console.error("Viva generation error:", error);

                showNotification(
                    error.message || "Something went wrong while generating questions."
                );

            } finally {

                generateBtn.disabled = false;
                generateBtn.textContent = "Generate Questions";
            }
        });
    }


    // --------------------------------------------------
    // Display Generated Questions
    // --------------------------------------------------

    function displayQuestions(questions) {

        if (!questions || questions.length === 0) {
            showNotification("No questions were generated.");
            return;
        }

        emptyState.style.display = "none";
        generatedDocument.style.display = "block";

        generatedTitle.textContent = "AI Generated Viva Questions";

        let html = "";

        questions.forEach((item, index) => {

            html += `
                <div class="viva-question">
                    <h3>Question ${index + 1}</h3>

                    <p class="question-text">
                        ${escapeHTML(item.question)}
                    </p>

                    <div class="answer-section">
                        <strong>Model Answer:</strong>
                        <p>
                            ${escapeHTML(item.answer)}
                        </p>
                    </div>
                </div>
            `;
        });

        generatedContent.innerHTML = html;

        updateWordCount();

        if (documentPreview) {
            documentPreview.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        }
    }


    // --------------------------------------------------
    // Copy Questions
    // --------------------------------------------------

    if (copyBtn) {
        copyBtn.addEventListener("click", async function () {

            const text = generatedContent.innerText.trim();

            if (!text) {
                showNotification("Nothing to copy.");
                return;
            }

            try {

                await navigator.clipboard.writeText(text);

                showNotification("Viva questions copied!");

            } catch (error) {

                console.error("Copy error:", error);
                showNotification("Unable to copy the questions.");
            }
        });
    }


    // --------------------------------------------------
    // Download Questions
    // --------------------------------------------------

    if (downloadBtn) {
        downloadBtn.addEventListener("click", function () {

            const text = generatedContent.innerText.trim();

            if (!text) {
                showNotification("Nothing to download.");
                return;
            }

            const blob = new Blob([text], {
                type: "text/plain"
            });

            const url = URL.createObjectURL(blob);

            const link = document.createElement("a");

            link.href = url;
            link.download = "AI_Viva_Questions.txt";

            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);

            URL.revokeObjectURL(url);

            showNotification("Viva questions downloaded!");
        });
    }


    // --------------------------------------------------
    // Word Count
    // --------------------------------------------------

    function updateWordCount() {

        if (!wordCount) {
            return;
        }

        const text = generatedContent.innerText.trim();

        if (!text) {
            wordCount.textContent = "0 words";
            return;
        }

        const words = text.split(/\s+/).filter(Boolean);

        wordCount.textContent = `${words.length} words`;
    }


    // --------------------------------------------------
    // AI Tip
    // --------------------------------------------------

    if (tipButton) {
        tipButton.addEventListener("click", function () {

            showNotification(
                "Viva Tip: Understand your project clearly instead of memorizing answers. Be ready to explain what you built, why you chose it, and how each module works."
            );
        });
    }


    // --------------------------------------------------
    // Notification
    // --------------------------------------------------

    function showNotification(message) {

        const existingNotification =
            document.querySelector(".notification-popup");

        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement("div");

        notification.className = "notification-popup";
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(function () {
            notification.classList.add("show");
        }, 10);

        setTimeout(function () {

            notification.classList.remove("show");

            setTimeout(function () {
                notification.remove();
            }, 300);

        }, 3500);
    }


    // --------------------------------------------------
    // Basic HTML Escape
    // --------------------------------------------------

    function escapeHTML(text) {

        if (text === null || text === undefined) {
            return "";
        }

        return String(text)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

});