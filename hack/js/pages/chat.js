// Smart Bharat – AI Chat Page
SB.pages.chat = SB.pages.chat || {};

SB.pages.chat = {
  history: [],
  isTyping: false,
  recognition: null,

  render() {
    const t = (k) => SB.i18n.t(k);
    return `
<div class="chat-page">
  <!-- Sidebar -->
  <div class="chat-sidebar">
    <div class="chat-sidebar-header">
      <h3>💬 Conversations</h3>
      <button class="btn btn-primary btn-sm btn-block" onclick="SB.pages.chat.newChat()">
        <i class="fa fa-plus"></i> New Chat
      </button>
    </div>
    <div class="chat-history-list" id="chat-history-list">
      ${this.renderHistory()}
    </div>
    <div style="padding:12px 16px;border-top:1px solid var(--border)">
      <div style="font-size:0.75rem;color:var(--text-muted);text-align:center">
        <i class="fa fa-shield"></i> AI responses are for guidance only.<br>Always verify from official portals.
      </div>
    </div>
  </div>

  <!-- Main Chat -->
  <div class="chat-main">
    <div class="chat-header">
      <div class="chat-bot-info">
        <div class="chat-bot-avatar">🤖</div>
        <div>
          <div class="chat-bot-name">Smart Bharat AI</div>
          <div class="chat-bot-status">Online · Powered by Gemini</div>
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="chat-action-btn" title="Clear chat" onclick="SB.pages.chat.clearChat()"><i class="fa fa-trash"></i></button>
        <button class="chat-action-btn" title="Share" onclick="SB.ui.toast('Share feature coming soon!','info')"><i class="fa fa-share"></i></button>
      </div>
    </div>

    <div class="chat-messages" id="chat-messages">
      <!-- Welcome message -->
      <div class="msg msg-ai animate-fadeUp">
        <div class="msg-avatar">🤖</div>
        <div>
          <div class="msg-bubble">${SB.ui.renderMarkdown(`## Namaste! 🙏 I'm Smart Bharat AI

I'm your personal civic assistant for all Indian government services. I can help you with:

- 🌾 **Government Schemes** – PM Kisan, Ayushman Bharat, PMAY and 1000+ more
- 🪪 **Documents** – Passport, Aadhaar, PAN, Voter ID, Driving License
- 💰 **Tax & Finance** – ITR filing, GST, TDS queries
- 📋 **Complaints** – File and track civic grievances
- 🎓 **Education** – Scholarships and education schemes

**How can I help you today?**`)}</div>
          <div class="msg-time">${SB.ui.formatTime()}</div>
        </div>
      </div>
    </div>

    <!-- Suggested Questions -->
    <div class="suggested-questions" id="suggested-questions">
      <p><i class="fa fa-lightbulb-o"></i> Suggested questions:</p>
      <div class="sq-chips">
        ${SB.suggestedQuestions.slice(0, 5).map(q =>
          `<button class="sq-chip" onclick="SB.pages.chat.sendMessage('${q.replace(/'/g,"\\'")}')">${q}</button>`
        ).join('')}
      </div>
    </div>

    <!-- Input Area -->
    <div class="chat-input-area">
      <div style="display:flex;gap:8px;align-items:flex-start">
        <!-- File upload button -->
        <input type="file" id="chat-file-input" style="display:none" accept="image/*,.pdf,.doc,.docx" onchange="SB.pages.chat.handleFileUpload(this)">
        <div class="chat-input-row" style="flex:1">
          <textarea
            class="chat-input"
            id="chat-input"
            placeholder="${t('chat_placeholder')}"
            rows="1"
            onkeydown="SB.pages.chat.handleKey(event)"
            oninput="SB.pages.chat.autoResize(this)"
          ></textarea>
          <div class="chat-input-actions">
            <button class="chat-action-btn" title="Upload file" onclick="document.getElementById('chat-file-input').click()">
              <i class="fa fa-paperclip"></i>
            </button>
            <button class="chat-action-btn" title="Voice input" id="voice-btn" onclick="SB.pages.chat.toggleVoice()">
              <i class="fa fa-microphone"></i>
            </button>
            <button class="chat-send-btn" id="send-btn" onclick="SB.pages.chat.sendFromInput()" title="Send">
              <i class="fa fa-paper-plane"></i>
            </button>
          </div>
        </div>
      </div>
      <div style="text-align:center;margin-top:8px;font-size:0.72rem;color:var(--text-muted)">
        Smart Bharat AI can make mistakes. Verify important information from official government portals.
      </div>
    </div>
  </div>
</div>`;
  },

  renderHistory() {
    const chats = JSON.parse(localStorage.getItem('sb_chats') || '[]');
    if (!chats.length) return '<div style="padding:20px;text-align:center;color:var(--text-muted);font-size:0.82rem">No conversations yet</div>';
    return chats.slice(-10).reverse().map((c, i) => `
      <div class="chat-history-item ${i===0?'active':''}" onclick="SB.pages.chat.loadChat(${i})">
        <i class="fa fa-comment-o" style="margin-right:6px"></i>
        ${c.title || 'Conversation ' + (chats.length - i)}
      </div>
    `).join('');
  },

  init() {
    this.history = [];
    document.getElementById('chat-input')?.focus();
  },

  handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      this.sendFromInput();
    }
  },

  autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  },

  sendFromInput() {
    const input = document.getElementById('chat-input');
    const msg = input.value.trim();
    if (!msg || this.isTyping) return;
    input.value = '';
    input.style.height = 'auto';
    this.sendMessage(msg);
  },

  async sendMessage(text) {
    if (!text || this.isTyping) return;

    // Hide suggestions after first message
    const sq = document.getElementById('suggested-questions');
    if (sq) sq.style.display = 'none';

    // Add user message
    this.addMessage('user', text);
    this.history.push({ role: 'user', content: text });
    this.isTyping = true;

    // Show typing indicator
    this.showTyping();

    try {
      const response = await SB.api.chat(text, this.history);
      this.removeTyping();
      this.addMessage('ai', response);
      this.history.push({ role: 'ai', content: response });
      this.saveChat(text);
    } catch(err) {
      this.removeTyping();
      this.addMessage('ai', '⚠️ Sorry, I encountered an error. Please check your API key or try again.\n\n' + err.message);
    }
    this.isTyping = false;
  },

  addMessage(role, content) {
    const msgs = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = `msg msg-${role} animate-fadeUp`;
    const avatar = role === 'user' ? (SB.auth.currentUser?.name?.charAt(0) || '👤') : '🤖';
    div.innerHTML = `
      <div class="msg-avatar">${avatar}</div>
      <div>
        <div class="msg-bubble">${role === 'ai' ? SB.ui.renderMarkdown(content) : this.escapeHtml(content)}</div>
        <div class="msg-time">${SB.ui.formatTime()}</div>
      </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  },

  showTyping() {
    const msgs = document.getElementById('chat-messages');
    const div = document.createElement('div');
    div.className = 'msg msg-ai';
    div.id = 'typing-indicator';
    div.innerHTML = `<div class="msg-avatar">🤖</div><div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  },

  removeTyping() {
    document.getElementById('typing-indicator')?.remove();
  },

  clearChat() {
    this.history = [];
    const msgs = document.getElementById('chat-messages');
    msgs.innerHTML = `<div class="msg msg-ai animate-fadeUp"><div class="msg-avatar">🤖</div><div><div class="msg-bubble">Chat cleared! How can I help you?</div><div class="msg-time">${SB.ui.formatTime()}</div></div></div>`;
    const sq = document.getElementById('suggested-questions');
    if (sq) sq.style.display = 'block';
    this.isTyping = false;
    SB.ui.toast('Chat cleared', 'info');
  },

  newChat() {
    this.clearChat();
  },

  saveChat(firstMessage) {
    const chats = JSON.parse(localStorage.getItem('sb_chats') || '[]');
    if (chats.length === 0 || chats[chats.length-1].title !== firstMessage.slice(0,40)) {
      chats.push({ title: firstMessage.slice(0, 40) + '...', time: new Date().toISOString() });
      localStorage.setItem('sb_chats', JSON.stringify(chats.slice(-20)));
    }
  },

  loadChat(index) {
    SB.ui.toast('Previous chats are stored locally', 'info');
  },

  handleFileUpload(input) {
    const file = input.files[0];
    if (file) {
      SB.ui.toast(`File "${file.name}" attached (${(file.size/1024).toFixed(1)}KB)`, 'success');
      this.sendMessage(`I've uploaded a file: ${file.name}. Please help me with any document-related queries.`);
    }
  },

  toggleVoice() {
    const btn = document.getElementById('voice-btn');
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      SB.ui.toast('Voice input not supported in this browser', 'warning');
      return;
    }
    if (this.recognition) {
      this.recognition.stop();
      this.recognition = null;
      btn.style.color = '';
      btn.style.background = '';
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    this.recognition = new SR();
    this.recognition.lang = SB.i18n.currentLang === 'hi' ? 'hi-IN' : 'en-IN';
    this.recognition.continuous = false;
    this.recognition.interimResults = false;
    btn.style.color = '#EF4444';
    btn.style.background = 'rgba(239,68,68,0.1)';
    this.recognition.onresult = (e) => {
      const text = e.results[0][0].transcript;
      document.getElementById('chat-input').value = text;
      SB.ui.toast('Voice captured: "' + text + '"', 'success');
    };
    this.recognition.onend = () => {
      btn.style.color = '';
      btn.style.background = '';
      this.recognition = null;
    };
    this.recognition.start();
    SB.ui.toast('Listening... Speak now', 'info');
  },

  escapeHtml(s) {
    return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  }
};
