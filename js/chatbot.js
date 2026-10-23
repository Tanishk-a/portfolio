(function () {
  "use strict";

  var MAX_MESSAGE_LENGTH = 500;
  var STARTERS = [
    "What projects has Tanishka built?",
    "Tell me about the Quiz application.",
    "What technologies and skills does she use?",
  ];

  var waiting = false;
  var lastFocus = null;

  var launcher;
  var panel;
  var messagesEl;
  var inputEl;
  var sendBtn;
  var closeBtn;

  // Knowledge base for fake AI responses
  var KNOWLEDGE = [
    {
      patterns: ["project", "work", "portfolio", "built", "show me", "repos"],
      response:
        "Tanishka has built several key projects featured here:\n1. Factorial Calculator (Python algorithms & CLI)\n2. Fibonacci Series Generator (Python algorithms & CLI)\n3. Struct to Dict Converter (Python data structures & f-strings)\n4. Buggy Code Debugging & Refactoring (RED->FIX->GREEN testing with Cursor AI)\n5. Interactive Quiz Application (dynamic JavaScript web app)\n\nYou can click on any GitHub button in the Projects section to view the repositories!",
    },
    {
      patterns: ["quiz", "game", "interactive web"],
      response:
        "The Interactive Quiz Application is a dynamic web app built with vanilla HTML5, CSS3, and JavaScript. It features timer-based challenges, real-time score calculation, and dynamic question rendering. You can check it out on GitHub: https://github.com/Tanishk-a/quiz",
    },
    {
      patterns: ["bug", "debug", "refactor", "cursor", "red", "green"],
      response:
        "The Buggy Code project demonstrates a disciplined RED -> FIX -> GREEN unit test development cycle using Cursor AI to diagnose logic flaws, boundary errors, and write robust unit tests in Python (https://github.com/Tanishk-a/buggy-code.git).",
    },
    {
      patterns: ["python", "factorial", "fibonacci", "struct", "dict", "algorithm"],
      response:
        "Tanishka's Python repositories showcase foundational algorithmic design and clean coding:\n• Factorial Calculator (https://github.com/Tanishk-a/factorial.git)\n• Fibonacci Series (https://github.com/Tanishk-a/fibonacci-pe)\n• Struct-to-Dict converter (https://github.com/Tanishk-a/struct-to-dict.git)",
    },
    {
      patterns: ["skill", "stack", "tech", "language", "tool", "framework"],
      response:
        "Tanishka's technical stack includes:\n• Languages: Python, JavaScript, HTML5, CSS3, C, C++, Java, SQL\n• Databases: MySQL, MongoDB\n• Tools & Workflows: Git, GitHub, Vercel, VS Code, Cursor AI, Antigravity AI\n• Core Competencies: Responsive Web Design, Unit Testing, and AI-assisted engineering.",
    },
    {
      patterns: ["about", "who is", "education", "college", "degree", "university", "jecrc"],
      response:
        "Tanishka Minghlani is a 2nd Year Computer Science and Engineering student pursuing her B.Tech at JECRC University, Jaipur (Graduation: 2028). She is passionate about modern web technologies, algorithms, and AI engineering.",
    },
    {
      patterns: ["contact", "email", "reach", "hire", "linkedin", "github"],
      response:
        "You can connect with Tanishka via:\n• GitHub: https://github.com/Tanishk-a\n• LinkedIn: https://www.linkedin.com/in/tanishka-minghlani/\n• Or send a message using the Contact form below!",
    },
    {
      patterns: ["hi", "hello", "hey", "greetings"],
      response:
        "Hello! 👋 I'm Tanishka's Portfolio AI Assistant. Ask me anything about her projects, skills, education, or GitHub repositories!",
    },
  ];

  init();

  function init() {
    mountWidget();
    var heroOpen = document.getElementById("open-chatbot");
    if (heroOpen) {
      heroOpen.addEventListener("click", openPanel);
    }
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel && !panel.hidden) {
        closePanel();
      }
    });
  }

  function mountWidget() {
    launcher = document.createElement("button");
    launcher.type = "button";
    launcher.className = "chat-launcher";
    launcher.setAttribute("aria-label", "Open AI assistant");
    var icon = document.createElement("span");
    icon.setAttribute("aria-hidden", "true");
    icon.textContent = "💬";
    var badge = document.createElement("span");
    badge.textContent = "Ask AI";
    launcher.append(icon, badge);
    launcher.addEventListener("click", openPanel);

    panel = document.createElement("div");
    panel.className = "chat-panel";
    panel.hidden = true;
    panel.setAttribute("role", "dialog");
    panel.setAttribute("aria-modal", "true");
    panel.setAttribute("aria-labelledby", "chat-title");

    panel.append(buildHeader(), buildBody(), buildFooter());
    document.body.append(launcher, panel);

    messagesEl = panel.querySelector(".chat-messages");
    inputEl = panel.querySelector(".chat-input");
    sendBtn = panel.querySelector(".chat-send");
    closeBtn = panel.querySelector(".chat-close");

    closeBtn.addEventListener("click", closePanel);
    sendBtn.addEventListener("click", submitMessage);
    inputEl.addEventListener("keydown", function (event) {
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        submitMessage();
      }
    });

    showWelcome();
  }

  function buildHeader() {
    var header = document.createElement("div");
    header.className = "chat-header";

    var avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.setAttribute("aria-hidden", "true");
    avatar.textContent = "🤖";

    var meta = document.createElement("div");
    var title = document.createElement("h2");
    title.id = "chat-title";
    title.textContent = "Portfolio Assistant";
    var status = document.createElement("p");
    status.className = "chat-status";
    var dot = document.createElement("span");
    dot.className = "status-dot";
    dot.setAttribute("aria-hidden", "true");
    status.append(dot, document.createTextNode("Active (Client AI)"));
    meta.append(title, status);

    closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "chat-close";
    closeBtn.setAttribute("aria-label", "Close assistant");
    closeBtn.textContent = "✕";

    header.append(avatar, meta, closeBtn);
    return header;
  }

  function buildBody() {
    var body = document.createElement("div");
    body.className = "chat-messages";
    return body;
  }

  function buildFooter() {
    var footer = document.createElement("div");
    footer.className = "chat-footer";

    var compose = document.createElement("div");
    compose.className = "chat-compose";

    inputEl = document.createElement("input");
    inputEl.className = "chat-input";
    inputEl.type = "text";
    inputEl.maxLength = MAX_MESSAGE_LENGTH;
    inputEl.setAttribute("aria-label", "Message the portfolio assistant");
    inputEl.placeholder = "Ask about projects or skills…";

    sendBtn = document.createElement("button");
    sendBtn.type = "button";
    sendBtn.className = "chat-send";
    sendBtn.setAttribute("aria-label", "Send message");
    sendBtn.textContent = "➤";

    compose.append(inputEl, sendBtn);

    var attr = document.createElement("p");
    attr.className = "chat-attr";
    attr.textContent = "Instant responses powered by Portfolio Intelligence";

    footer.append(compose, attr);
    return footer;
  }

  function showWelcome() {
    appendBubble(
      "assistant",
      "Hi! I'm Tanishka's portfolio assistant. I can answer questions about her projects, skills, education, and GitHub code. Ask me anything or select a prompt below!"
    );
    var wrap = document.createElement("div");
    wrap.className = "starter-prompts";
    STARTERS.forEach(function (text) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.textContent = text;
      btn.addEventListener("click", function () {
        sendPrompt(text);
      });
      wrap.appendChild(btn);
    });
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function openPanel() {
    lastFocus = document.activeElement;
    panel.hidden = false;
    launcher.hidden = true;
    inputEl.focus();
  }

  function closePanel() {
    panel.hidden = true;
    launcher.hidden = false;
    if (lastFocus && typeof lastFocus.focus === "function") {
      lastFocus.focus();
    } else {
      launcher.focus();
    }
  }

  function submitMessage() {
    sendPrompt(inputEl.value);
  }

  function generateFakeAiResponse(query) {
    var lower = query.toLowerCase();
    for (var i = 0; i < KNOWLEDGE.length; i++) {
      var item = KNOWLEDGE[i];
      for (var j = 0; j < item.patterns.length; j++) {
        if (lower.indexOf(item.patterns[j]) !== -1) {
          return item.response;
        }
      }
    }
    return (
      "I'm specialized in Tanishka's background and projects. You can ask about her repositories (Factorial, Fibonacci, Struct-to-Dict, Buggy Code, Quiz App), technical skills, or education at JECRC University!"
    );
  }

  function sendPrompt(raw) {
    var message = String(raw || "").trim();
    if (waiting) return;
    if (!message) return;
    if (message.length > MAX_MESSAGE_LENGTH) {
      appendBubble("error", "Please keep questions under 500 characters.");
      return;
    }

    inputEl.value = "";
    appendBubble("user", message);

    waiting = true;
    inputEl.disabled = true;
    sendBtn.disabled = true;

    var typing = appendTyping();

    // Simulate smart thinking delay (400ms - 800ms)
    var delay = 450 + Math.floor(Math.random() * 300);
    setTimeout(function () {
      typing.remove();
      var reply = generateFakeAiResponse(message);
      appendBubble("assistant", reply);

      waiting = false;
      inputEl.disabled = false;
      sendBtn.disabled = false;
      inputEl.focus();
    }, delay);
  }

  function appendBubble(kind, text) {
    var bubble = document.createElement("div");
    bubble.className = "chat-bubble " + kind;
    bubble.style.whiteSpace = "pre-line";
    bubble.textContent = text;
    messagesEl.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  function appendTyping() {
    var bubble = document.createElement("div");
    bubble.className = "chat-bubble assistant typing-indicator";
    bubble.setAttribute("aria-label", "Assistant is typing");
    for (var i = 0; i < 3; i += 1) {
      bubble.appendChild(document.createElement("span"));
    }
    messagesEl.appendChild(bubble);
    scrollToBottom();
    return bubble;
  }

  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }
})();
