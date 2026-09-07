const API_URL =
    "https://portfolio-assistant-api.vercel.app/api/chat";

/* =========================================
   GITHUB PROJECTS
========================================= */

const GITHUB_USERNAME = "JiaysTM17";

const GITHUB_REPOS_URL =
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=updated&direction=desc`;

const PROJECT_CACHE_KEY =
    "jiays-portfolio-projects-v1";

const PROJECT_CACHE_TTL =
    30 * 60 * 1000;

const EXCLUDED_REPOSITORIES =
    new Set([
        "JiaysTM17"
    ]);

const projectGrid =
    document.getElementById("projectGrid");


/* =========================================
   PROJECT CACHE
========================================= */

function getCachedProjects() {

    try {

        const rawCache =
            localStorage.getItem(
                PROJECT_CACHE_KEY
            );

        if (!rawCache) {
            return null;
        }

        const cache =
            JSON.parse(rawCache);

        if (
            !cache ||
            !Array.isArray(cache.repositories) ||
            typeof cache.timestamp !== "number"
        ) {
            return null;
        }

        return cache;

    } catch (error) {

        console.warn(
            "Could not read project cache:",
            error
        );

        return null;

    }

}


function saveProjectsToCache(
    repositories
) {

    try {

        localStorage.setItem(
            PROJECT_CACHE_KEY,
            JSON.stringify({
                timestamp: Date.now(),
                repositories
            })
        );

    } catch (error) {

        console.warn(
            "Could not save project cache:",
            error
        );

    }

}


/* =========================================
   PROJECT HELPERS
========================================= */

function isSafeHttpUrl(value) {

    if (!value) {
        return false;
    }

    try {

        const url =
            new URL(value);

        return (
            url.protocol === "http:" ||
            url.protocol === "https:"
        );

    } catch {

        return false;

    }

}


function filterRepositories(
    repositories
) {

    return repositories
        .filter(
            (repository) =>
                !repository.private &&
                !repository.fork &&
                !repository.archived &&
                !repository.disabled &&
                !EXCLUDED_REPOSITORIES.has(
                    repository.name
                )
        )
        .sort(
            (a, b) =>
                new Date(
                    b.updated_at
                ) -
                new Date(
                    a.updated_at
                )
        );

}


function getProjectStatus(
    repository
) {

    if (
        isSafeHttpUrl(
            repository.homepage
        )
    ) {

        return {
            label: "Live",
            className: "complete"
        };

    }

    return {
        label: "Repository",
        className: "planned"
    };

}


function getProjectTechnologies(
    repository
) {

    const technologies = [];

    if (repository.language) {

        technologies.push(
            repository.language
        );

    }


    if (
        Array.isArray(
            repository.topics
        )
    ) {

        repository.topics
            .slice(0, 2)
            .forEach(
                (topic) => {

                    const alreadyExists =
                        technologies.some(
                            (technology) =>
                                technology
                                    .toLowerCase() ===
                                topic
                                    .toLowerCase()
                        );

                    if (!alreadyExists) {

                        technologies.push(
                            topic
                        );

                    }

                }
            );

    }


    if (
        isSafeHttpUrl(
            repository.homepage
        ) &&
        repository.homepage.includes(
            "github.io"
        )
    ) {

        const alreadyHasPages =
            technologies.some(
                (technology) =>
                    technology ===
                    "GitHub Pages"
            );

        if (!alreadyHasPages) {

            technologies.push(
                "GitHub Pages"
            );

        }

    }


    if (
        technologies.length === 0
    ) {

        technologies.push(
            "GitHub"
        );

    }


    return technologies.slice(
        0,
        3
    );

}


/* =========================================
   CREATE PROJECT CARD
========================================= */

function createProjectCard(
    repository,
    index
) {

    const article =
        document.createElement(
            "article"
        );

    article.className =
        index === 0
            ? "project-card project-card-featured"
            : "project-card";


    /* PROJECT TOP */

    const projectTop =
        document.createElement(
            "div"
        );

    projectTop.className =
        "project-top";


    const projectNumber =
        document.createElement(
            "p"
        );

    projectNumber.className =
        "project-number";

    projectNumber.textContent =
        String(index + 1)
            .padStart(
                2,
                "0"
            );


    const status =
        getProjectStatus(
            repository
        );


    const statusElement =
        document.createElement(
            "span"
        );

    statusElement.className =
        `project-status ${status.className}`;

    statusElement.textContent =
        status.label;


    projectTop.appendChild(
        projectNumber
    );

    projectTop.appendChild(
        statusElement
    );


    /* PROJECT TITLE */

    const title =
        document.createElement(
            "h3"
        );

    title.textContent =
        repository.name;


    /* DESCRIPTION */

    const description =
        document.createElement(
            "p"
        );

    description.textContent =
        repository.description ||
        "A public project documented on GitHub.";


    /* TECHNOLOGIES */

    const technologyList =
        document.createElement(
            "div"
        );

    technologyList.className =
        "tech-list";


    const technologies =
        getProjectTechnologies(
            repository
        );


    technologies.forEach(
        (technology) => {

            const technologyTag =
                document.createElement(
                    "span"
                );

            technologyTag.textContent =
                technology;

            technologyList.appendChild(
                technologyTag
            );

        }
    );


    /* LINKS */

    const projectLinks =
        document.createElement(
            "div"
        );

    projectLinks.className =
        "project-links";


    if (
        isSafeHttpUrl(
            repository.homepage
        )
    ) {

        const liveLink =
            document.createElement(
                "a"
            );

        liveLink.href =
            repository.homepage;

        liveLink.target =
            "_blank";

        liveLink.rel =
            "noopener noreferrer";

        liveLink.textContent =
            "Live demo ↗";

        projectLinks.appendChild(
            liveLink
        );

    }


    const sourceLink =
        document.createElement(
            "a"
        );

    sourceLink.href =
        repository.html_url;

    sourceLink.target =
        "_blank";

    sourceLink.rel =
        "noopener noreferrer";

    sourceLink.textContent =
        "Source code ↗";


    projectLinks.appendChild(
        sourceLink
    );


    /* ASSEMBLE CARD */

    article.appendChild(
        projectTop
    );

    article.appendChild(
        title
    );

    article.appendChild(
        description
    );

    article.appendChild(
        technologyList
    );

    article.appendChild(
        projectLinks
    );


    return article;

}


/* =========================================
   RENDER PROJECTS
========================================= */

function renderProjects(
    repositories
) {

    if (!projectGrid) {
        return;
    }


    projectGrid.innerHTML = "";


    repositories.forEach(
        (
            repository,
            index
        ) => {

            const projectCard =
                createProjectCard(
                    repository,
                    index
                );

            projectGrid.appendChild(
                projectCard
            );

        }
    );

}


/* =========================================
   PROJECT ERROR
========================================= */

function renderProjectsError() {

    if (!projectGrid) {
        return;
    }


    projectGrid.innerHTML = "";


    const article =
        document.createElement(
            "article"
        );

    article.className =
        "project-card project-card-muted";


    const projectTop =
        document.createElement(
            "div"
        );

    projectTop.className =
        "project-top";


    const projectNumber =
        document.createElement(
            "p"
        );

    projectNumber.className =
        "project-number";

    projectNumber.textContent =
        "--";


    const status =
        document.createElement(
            "span"
        );

    status.className =
        "project-status planned";

    status.textContent =
        "GitHub";


    projectTop.appendChild(
        projectNumber
    );

    projectTop.appendChild(
        status
    );


    const title =
        document.createElement(
            "h3"
        );

    title.textContent =
        "Projects are temporarily unavailable.";


    const description =
        document.createElement(
            "p"
        );

    description.textContent =
        "You can still view all public repositories directly on GitHub.";


    const projectLinks =
        document.createElement(
            "div"
        );

    projectLinks.className =
        "project-links";


    const githubLink =
        document.createElement(
            "a"
        );

    githubLink.href =
        `https://github.com/${GITHUB_USERNAME}?tab=repositories`;

    githubLink.target =
        "_blank";

    githubLink.rel =
        "noopener noreferrer";

    githubLink.textContent =
        "View GitHub ↗";


    projectLinks.appendChild(
        githubLink
    );


    article.appendChild(
        projectTop
    );

    article.appendChild(
        title
    );

    article.appendChild(
        description
    );

    article.appendChild(
        projectLinks
    );


    projectGrid.appendChild(
        article
    );

}


/* =========================================
   LOAD PROJECTS
========================================= */

async function fetchGitHubProjects() {

    const response =
        await fetch(
            GITHUB_REPOS_URL,
            {
                headers: {
                    Accept:
                        "application/vnd.github+json"
                }
            }
        );


    if (!response.ok) {

        throw new Error(
            `GitHub API error: ${response.status}`
        );

    }


    const repositories =
        await response.json();


    return filterRepositories(
        repositories
    );

}


async function loadProjects() {

    if (!projectGrid) {
        return;
    }


    const cached =
        getCachedProjects();


    /*
     * Nếu từng tải GitHub thành công,
     * hiển thị cache ngay để trang không bị chờ.
     */
    if (
        cached &&
        cached.repositories.length
    ) {

        renderProjects(
            cached.repositories
        );

    }


    /*
     * Cache còn mới thì không cần gọi GitHub.
     */
    if (
        cached &&
        Date.now() -
            cached.timestamp <
            PROJECT_CACHE_TTL
    ) {

        return;

    }


    try {

        const repositories =
            await fetchGitHubProjects();


        if (
            repositories.length === 0
        ) {

            throw new Error(
                "No project repositories found."
            );

        }


        saveProjectsToCache(
            repositories
        );


        renderProjects(
            repositories
        );

    } catch (error) {

        console.error(
            "Unable to load GitHub projects:",
            error
        );


        /*
         * Nếu đã có cache cũ thì tiếp tục dùng cache.
         */
        if (
            !cached ||
            !cached.repositories.length
        ) {

            renderProjectsError();

        }

    }

}


loadProjects();

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

function appendTextWithLinks(container, text) {

    // Chuẩn hóa các ký tự escape Markdown
    text = text
        .replace(/\\\*/g, "*")
        .replace(/\\_/g, "_")
        .replace(/\\\[/g, "[")
        .replace(/\\\]/g, "]")
        .replace(/\\\(/g, "(")
        .replace(/\\\)/g, ")");


    /*
     * Tìm URL GitHub.
     *
     * URL chỉ kết thúc ở khoảng trắng hoặc
     * một số ký tự Markdown / dấu câu.
     */
    const urlRegex =
        /https?:\/\/github\.com\/[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+/g;


    let lastIndex = 0;
    let match;


    while (
        (match = urlRegex.exec(text)) !== null
    ) {

        /*
         * Phần text trước URL
         */
        const before =
            text.slice(
                lastIndex,
                match.index
            );

        appendFormattedText(
            container,
            before
        );


        /*
         * URL sạch
         */
        const url =
            match[0];


        /*
         * Tạo link
         */
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

        link.className =
            "chat-project-link";


        container.appendChild(link);


        /*
         * Bỏ qua phần URL đã xử lý
         */
        lastIndex =
            urlRegex.lastIndex;
    }


    /*
     * Phần text còn lại
     */
    appendFormattedText(
        container,
        text.slice(lastIndex)
    );
}


/*
 * Hiển thị text thường.
 *
 * Đồng thời làm sạch Markdown dư thừa
 * mà Gemini đôi khi sinh ra.
 */
function appendFormattedText(
    container,
    text
) {

    /*
     * Xử lý xuống dòng
     */
    const lines =
        text.split("\n");


    lines.forEach(
        (line, index) => {

            /*
             * Loại bỏ các ký tự Markdown
             * bị dư quanh link.
             *
             * Không ảnh hưởng đến URL vì
             * URL đã được xử lý riêng.
             */
            line =
                line
                    .replace(
                        /\[\*\*🔗 Mở project\*\*\]/g,
                        ""
                    )
                    .replace(
                        /\[\*\*/g,
                        ""
                    )
                    .replace(
                        /\*\*\]/g,
                        ""
                    )
                    .replace(
                        /\]\(/g,
                        ""
                    );


            /*
             * Chuyển **text** thành text
             * bình thường.
             */
            line =
                line.replace(
                    /\*\*(.*?)\*\*/g,
                    "$1"
                );


            /*
             * Xóa Markdown link còn sót lại
             */
            line =
                line.replace(
                    /\[([^\]]+)\]\(/g,
                    "$1"
                );


            line =
                line.replace(
                    /\)\*\*/g,
                    ""
                );


            container.appendChild(
                document.createTextNode(line)
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
