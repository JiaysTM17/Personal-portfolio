const API_URL =
    "https://portfolio-assistant-api.vercel.app/api/chat";


/* =========================================
   ELEMENTS
========================================= */

const chatbot =
    document.getElementById("chatbot");

const chatbotToggle =
    document.getElementById("chatbotToggle");

const chatbotWindow =
    document.getElementById("chatbotWindow");

const chatbotForm =
    document.getElementById("chatbotForm");

const chatbotInput =
    document.getElementById("chatbotInput");

const chatbotSend =
    document.getElementById("chatbotSend");

const chatbotMessages =
    document.getElementById("chatbotMessages");

const chatbotSuggestions =
    document.getElementById("chatbotSuggestions");

const welcomeText =
    document.getElementById("welcomeText");

const suggestionTitle =
    document.getElementById("suggestionTitle");

const footerText =
    document.getElementById("footerText");

const languageButtons =
    document.querySelectorAll(".language-btn");

const suggestionButtons =
    document.querySelectorAll(".suggestion-btn");


/* =========================================
   STATE
========================================= */

let conversationHistory = [];

let currentLanguage = "vi";

let isLoading = false;


/* =========================================
   TRANSLATIONS
========================================= */

const translations = {

    vi: {
        welcome:
            "Chào bạn 👋 Mình là Kiệt Assistant. Mình có thể giúp bạn tìm hiểu về Kiệt, quá trình học tập và các dự án công khai trên GitHub.",

        suggestionTitle:
            "Bạn có thể hỏi:",

        placeholder:
            "Hỏi về Kiệt...",

        footer:
            "Powered by Gemini · Public GitHub data",

        typing:
            "Kiệt Assistant đang suy nghĩ...",

        error:
            "Xin lỗi, hiện tại mình không thể kết nối với AI. Bạn thử lại sau nhé."
    },

    en: {
        welcome:
            "Hi there 👋 I'm Kiệt Assistant. I can help you learn about Kiệt, his learning journey, and his public projects on GitHub.",

        suggestionTitle:
            "You can ask:",

        placeholder:
            "Ask about Kiệt...",

        footer:
            "Powered by Gemini · Public GitHub data",

        typing:
            "Kiệt Assistant is thinking...",

        error:
            "Sorry, I can't connect to the AI right now. Please try again later."
    }

};


/* =========================================
   OPEN / CLOSE CHAT
========================================= */

function openChat() {

    chatbot.classList.add("is-open");

    chatbotToggle.setAttribute(
        "aria-expanded",
        "true"
    );

    chatbotWindow.setAttribute(
        "aria-hidden",
        "false"
    );

    setTimeout(() => {
        chatbotInput.focus();
    }, 150);
}


function closeChat() {

    chatbot.classList.remove("is-open");

    chatbotToggle.setAttribute(
        "aria-expanded",
        "false"
    );

    chatbotWindow.setAttribute(
        "aria-hidden",
        "true"
    );
}


chatbotToggle.addEventListener(
    "click",
    () => {

        const isOpen =
            chatbot.classList.contains(
                "is-open"
            );

        if (isOpen) {
            closeChat();
        } else {
            openChat();
        }

    }
);


/* =========================================
   LANGUAGE
========================================= */

function updateLanguage(language) {

    currentLanguage = language;

    const texts =
        translations[language];

    welcomeText.textContent =
        texts.welcome;

    suggestionTitle.textContent =
        texts.suggestionTitle;

    chatbotInput.placeholder =
        texts.placeholder;

    footerText.textContent =
        texts.footer;


    languageButtons.forEach(
        (button) => {

            button.classList.toggle(
                "active",
                button.dataset.lang === language
            );

        }
    );


    suggestionButtons.forEach(
        (button) => {

            const question =
                button.dataset[
                    `question${language === "vi" ? "Vi" : "En"}`
                ];

            button.textContent =
                question;

        }
    );
}


languageButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                updateLanguage(
                    button.dataset.lang
                );

            }
        );

    }
);


/* =========================================
   SAFE TEXT + LINKS
========================================= */

function appendTextWithLinks(
    container,
    text
) {

    /*
     * Chỉ nhận diện URL.
     * Không cho AI chèn HTML trực tiếp.
     */

    const urlRegex =
        /(https?:\/\/[^\s<]+)/g;

    const parts =
        text.split(urlRegex);

    parts.forEach(
        (part) => {

            if (
                part.startsWith("http://") ||
                part.startsWith("https://")
            ) {

                /*
                 * Loại bỏ dấu câu nằm cuối URL
                 */
                let url = part;

                let trailing =
                    "";

                while (
                    /[.,!?;:)\]}]$/.test(url)
                ) {

                    trailing =
                        url.slice(-1) +
                        trailing;

                    url =
                        url.slice(0, -1);
                }


                const link =
                    document.createElement("a");

                link.href = url;

                link.target = "_blank";

                link.rel =
                    "noopener noreferrer";

                link.textContent =
                    "🔗 Mở project";

                link.title =
                    url;

                container.appendChild(
                    link
                );


                if (trailing) {

                    container.appendChild(
                        document.createTextNode(
                            trailing
                        )
                    );

                }

            } else {

                /*
                 * Giữ xuống dòng
                 */
                const lines =
                    part.split("\n");

                lines.forEach(
                    (line, index) => {

                        container.appendChild(
                            document.createTextNode(
                                line
                            )
                        );

                        if (
                            index <
                            lines.length - 1
                        ) {

                            container.appendChild(
                                document.createElement("br")
                            );

                        }

                    }
                );

            }

        }
    );
}


/* =========================================
   ADD MESSAGE
========================================= */

function addMessage(
    content,
    role
) {

    const messageElement =
        document.createElement("div");

    messageElement.className =
        `chat-message ${role}`;


    if (role === "assistant") {

        const avatar =
            document.createElement("div");

        avatar.className =
            "message-avatar";

        avatar.textContent =
            "✦";


        const contentWrapper =
            document.createElement("div");

        contentWrapper.className =
            "message-content";


        const bubble =
            document.createElement("div");

        bubble.className =
            "message-bubble";


        appendTextWithLinks(
            bubble,
            content
        );


        contentWrapper.appendChild(
            bubble
        );

        messageElement.appendChild(
            avatar
        );

        messageElement.appendChild(
            contentWrapper
        );

    } else {

        appendTextWithLinks(
            messageElement,
            content
        );

    }


    chatbotMessages.appendChild(
        messageElement
    );

    chatbotMessages.scrollTop =
        chatbotMessages.scrollHeight;


    return messageElement;
}


/* =========================================
   TYPING INDICATOR
========================================= */

function showTyping() {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "chat-message assistant";

    wrapper.id =
        "chatbotTypingMessage";


    const avatar =
        document.createElement("div");

    avatar.className =
        "message-avatar";

    avatar.textContent =
        "✦";


    const typing =
        document.createElement("div");

    typing.className =
        "typing-message";


    for (let i = 0; i < 3; i++) {

        const dot =
            document.createElement("span");

        dot.className =
            "typing-dot";

        typing.appendChild(dot);

    }


    wrapper.appendChild(
        avatar
    );

    wrapper.appendChild(
        typing
    );


    chatbotMessages.appendChild(
        wrapper
    );

    chatbotMessages.scrollTop =
        chatbotMessages.scrollHeight;


    return wrapper;
}


/* =========================================
   SEND MESSAGE
========================================= */

async function sendMessage(message) {

    if (
        isLoading ||
        !message.trim()
    ) {
        return;
    }


    const cleanMessage =
        message.trim();


    /* Hide suggestions */
    chatbotSuggestions.style.display =
        "none";


    /* User message */
    addMessage(
        cleanMessage,
        "user"
    );


    chatbotInput.value = "";

    isLoading = true;

    chatbotInput.disabled = true;

    chatbotSend.disabled = true;


    /* Typing */
    const typingMessage =
        showTyping();


    try {

        const response =
            await fetch(
                API_URL,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        message:
                            cleanMessage,

                        history:
                            conversationHistory
                    })
                }
            );


        const data =
            await response.json();


        typingMessage.remove();


        if (!response.ok) {

            throw new Error(
                data.error ||
                "API request failed."
            );

        }


        const answer =
            data.answer ||
            (
                currentLanguage === "vi"
                    ? "Xin lỗi, mình chưa thể trả lời câu hỏi này."
                    : "Sorry, I couldn't answer that question."
            );


        /* Assistant message */
        addMessage(
            answer,
            "assistant"
        );


        /* History */
        conversationHistory.push(
            {
                role: "user",
                content: cleanMessage
            },
            {
                role: "assistant",
                content: answer
            }
        );


        /* Keep recent messages */
        if (
            conversationHistory.length >
            6
        ) {

            conversationHistory =
                conversationHistory.slice(
                    -6
                );

        }

    } catch (error) {

        console.error(
            "Chatbot Error:",
            error
        );


        typingMessage.remove();


        addMessage(
            translations[
                currentLanguage
            ].error,
            "assistant"
        );

    }


    isLoading = false;

    chatbotInput.disabled = false;

    chatbotSend.disabled = false;

    chatbotInput.focus();
}


/* =========================================
   FORM SUBMIT
========================================= */

chatbotForm.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();

        sendMessage(
            chatbotInput.value
        );

    }
);


/* =========================================
   SUGGESTED QUESTIONS
========================================= */

suggestionButtons.forEach(
    (button) => {

        button.addEventListener(
            "click",
            () => {

                const key =
                    currentLanguage === "vi"
                        ? "questionVi"
                        : "questionEn";

                const question =
                    button.dataset[key];


                sendMessage(
                    question
                );

            }
        );

    }
);


/* =========================================
   INITIAL LANGUAGE
========================================= */

updateLanguage("vi");
