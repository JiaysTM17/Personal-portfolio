const API_URL = "https://portfolio-assistant-api.vercel.app/api/chat";

const chatbotToggle = document.getElementById("chatbotToggle");
const chatbotWindow = document.getElementById("chatbotWindow");
const chatbotClose = document.getElementById("chatbotClose");

const chatbotForm = document.getElementById("chatbotForm");
const chatbotInput = document.getElementById("chatbotInput");
const chatbotMessages = document.getElementById("chatbotMessages");

let conversationHistory = [];

// Mở chatbot
chatbotToggle.addEventListener("click", () => {
    chatbotWindow.style.display = "flex";
    chatbotInput.focus();
});

// Đóng chatbot
chatbotClose.addEventListener("click", () => {
    chatbotWindow.style.display = "none";
});

// Thêm tin nhắn vào giao diện
function addMessage(content, role) {
    const messageElement = document.createElement("div");

    messageElement.className = `chat-message ${role}`;
    messageElement.textContent = content;

    chatbotMessages.appendChild(messageElement);

    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;

    return messageElement;
}

// Gửi câu hỏi
chatbotForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const message = chatbotInput.value.trim();

    if (!message) {
        return;
    }

    // Hiển thị câu hỏi của người dùng
    addMessage(message, "user");

    chatbotInput.value = "";
    chatbotInput.disabled = true;

    // Hiển thị trạng thái đang trả lời
    const loadingMessage = addMessage("Kiệt Assistant đang suy nghĩ...", "assistant");

    try {
        const response = await fetch(API_URL, {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message,
                history: conversationHistory
            })
        });

        const data = await response.json();

        // Xóa trạng thái loading
        loadingMessage.remove();

        if (!response.ok) {
            throw new Error(data.error || "API request failed.");
        }

        const answer = data.answer || "Xin lỗi, mình chưa thể trả lời câu hỏi này.";

        // Hiển thị câu trả lời
        addMessage(answer, "assistant");

        // Lưu lịch sử hội thoại
        conversationHistory.push(
            {
                role: "user",
                content: message
            },
            {
                role: "assistant",
                content: answer
            }
        );

        // Chỉ giữ 6 tin nhắn gần nhất
        if (conversationHistory.length > 6) {
            conversationHistory = conversationHistory.slice(-6);
        }

    } catch (error) {
        console.error("Chatbot Error:", error);

        loadingMessage.remove();

        addMessage(
            "Xin lỗi, hiện tại mình không thể kết nối với AI. Bạn thử lại sau nhé.",
            "assistant"
        );
    }

    chatbotInput.disabled = false;
    chatbotInput.focus();
});
