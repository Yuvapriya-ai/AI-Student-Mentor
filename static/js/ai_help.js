document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       AI HELP CHAT ELEMENTS
    ====================================================== */

    const helpCard =
        document.querySelector(".help-card");

    const aiHelpChat =
        document.getElementById("aiHelpChat");

    const closeAiHelp =
        document.getElementById("closeAiHelp");

    const aiHelpInput =
        document.getElementById("aiHelpInput");

    const sendAiHelp =
        document.getElementById("sendAiHelp");

    const aiHelpMessages =
        document.getElementById("aiHelpMessages");


    /* =====================================================
       OPEN AI CHAT
    ====================================================== */

    if (helpCard && aiHelpChat) {

        helpCard.addEventListener("click", () => {

            aiHelpChat.classList.add("show");

            if (aiHelpInput) {
                aiHelpInput.focus();
            }

        });

    }


    /* =====================================================
       CLOSE AI CHAT
    ====================================================== */

    if (closeAiHelp && aiHelpChat) {

        closeAiHelp.addEventListener("click", () => {

            aiHelpChat.classList.remove("show");

        });

    }


    /* =====================================================
       SEND MESSAGE
    ====================================================== */

    async function sendMessage() {

        if (!aiHelpInput || !aiHelpMessages) {
            return;
        }


        const message =
            aiHelpInput.value.trim();


        if (!message) {
            return;
        }


        /* USER MESSAGE */

        const userMessage =
            document.createElement("div");

        userMessage.className =
            "user-message";

        userMessage.textContent =
            message;

        aiHelpMessages.appendChild(
            userMessage
        );


        aiHelpInput.value = "";


        /* SCROLL TO BOTTOM */

        aiHelpMessages.scrollTop =
            aiHelpMessages.scrollHeight;


        /* DISABLE SEND */

        if (sendAiHelp) {
            sendAiHelp.disabled = true;
        }


        /* AI LOADING MESSAGE */

        const loadingMessage =
            document.createElement("div");

        loadingMessage.className =
            "ai-message";

        loadingMessage.textContent =
            "Thinking...";

        aiHelpMessages.appendChild(
            loadingMessage
        );


        aiHelpMessages.scrollTop =
            aiHelpMessages.scrollHeight;


        try {

            const response =
                await fetch(
                    "/api/mentor",
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            message: message
                        })
                    }
                );


            const data =
                await response.json();


            /* REMOVE LOADING */

            loadingMessage.remove();


            /* AI RESPONSE */

            const aiMessage =
                document.createElement("div");

            aiMessage.className =
                "ai-message";


            if (
                response.ok &&
                data.response
            ) {

                aiMessage.textContent =
                    data.response;

            } else {

                aiMessage.textContent =
                    data.error ||
                    "Sorry, I couldn't process your question.";

            }


            aiHelpMessages.appendChild(
                aiMessage
            );


        } catch (error) {

            console.error(
                "AI Help Error:",
                error
            );


            loadingMessage.remove();


            const errorMessage =
                document.createElement("div");

            errorMessage.className =
                "ai-message";

            errorMessage.textContent =
                "Unable to connect to the AI Mentor right now.";

            aiHelpMessages.appendChild(
                errorMessage
            );

        }


        /* ENABLE SEND */

        if (sendAiHelp) {
            sendAiHelp.disabled = false;
        }


        /* FINAL SCROLL */

        aiHelpMessages.scrollTop =
            aiHelpMessages.scrollHeight;

    }


    /* =====================================================
       SEND BUTTON
    ====================================================== */

    if (sendAiHelp) {

        sendAiHelp.addEventListener(
            "click",
            sendMessage
        );

    }


    /* =====================================================
       ENTER KEY
    ====================================================== */

    if (aiHelpInput) {

        aiHelpInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendMessage();

                }

            }
        );

    }


    console.log(
        "AI Help Chat initialized."
    );

});