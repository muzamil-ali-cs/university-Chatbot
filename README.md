<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:001f6e,100:003da5&height=200&section=header&text=University%20Guide%20Chatbot&fontSize=42&fontColor=ffffff&animation=fadeIn&fontAlignY=35&desc=A%20Smart%20AI-Powered%20University%20Assistant&descAlignY=55&descSize=18" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=3000&pause=1000&color=4F46E5&center=true&vCenter=true&width=600&lines=Flask+%2B+Socket.IO+Real-Time+Chat;TF-IDF+%2B+Keyword+Matching+Engine;Gemini+AI+Fallback+for+Unknown+Queries;My+First+Semester+University+Project+%F0%9F%8E%93" alt="Typing SVG" />

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-010101?style=for-the-badge&logo=socketdotio&logoColor=white)](https://socket.io/)
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?style=for-the-badge&logo=scikitlearn&logoColor=white)](https://scikit-learn.org/)
[![Gemini API](https://img.shields.io/badge/Google%20Gemini-8E75B2?style=for-the-badge&logo=google-gemini&logoColor=white)](https://ai.google.dev/)

</div>

---

## 🎓 About The Project

**University Guide Chatbot** is a real-time, AI-powered web assistant built to answer common university-related questions — admissions, fees, scholarships, attendance, academics, and more — instantly, 24/7.

> 📌 **This was my First Semester project at university**, built while learning Python, Flask, and the fundamentals of NLP-based chatbot design. It represents my first step into full-stack development and applied AI.

The bot uses a **hybrid response engine**:
1. 🔑 **Keyword Matching** — instantly detects known topics from user input.
2. 🧠 **Stemming + Fuzzy Matching** — catches variations of words (e.g. "attending" → "attend") and typos.
3. 📊 **TF-IDF + Cosine Similarity** — matches semantically similar questions using scikit-learn.
4. 🤖 **Gemini AI Fallback** — if nothing matches locally, the query is passed to Google's Gemini API for a general-purpose answer.

---

## ✨ Features

- 💬 Real-time chat powered by **Flask-SocketIO** (no page reloads)
- 🎨 Modern, responsive **dark/light theme** UI built with Tailwind CSS
- 🔊 Sound toggle & smooth message animations
- 🧩 Smart topic detection engine (keywords → stemming → fuzzy match → TF-IDF → AI fallback)
- 🤝 Handles multiple-topic queries by asking clarifying questions
- 📚 Easily extensible knowledge base via a single `data.json` file
- 🚀 Production-ready with **Gunicorn** support

---

## 🖼️ Preview

<div align="center">
<img src="https://img.shields.io/badge/UI-Modern%20Dark%20Chat%20Interface-1e293b?style=for-the-badge" />
</div>

*(Add a screenshot or GIF of your chatbot here — e.g. `docs/preview.gif` — for extra visual appeal!)*

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Python, Flask, Flask-SocketIO |
| NLP / Matching | scikit-learn (TF-IDF, Cosine Similarity), difflib |
| AI Fallback | Google Gemini API |
| Frontend | HTML5, Tailwind CSS, Vanilla JS, Socket.IO Client |
| Config | python-dotenv |
| Deployment | Gunicorn (WSGI server) |

---

## 📂 Project Structure

```
university_chatbot_improved/
├── app.py                     # Flask app, Socket.IO events, matching engine
├── data.json                  # Knowledge base (keywords → topics → answers)
├── requirements.txt           # Python dependencies
├── templates/
│   ├── index.html             # Basic chat UI
│   └── modern-chat.html        # Modern Tailwind-based chat UI (main route)
└── static/
    ├── css/modern-chat.css    # Styling & animations
    └── js/modern-chat.js      # Socket.IO client logic, UI interactions
```

---

## ⚙️ Installation & Setup

### 1. Clone the Repository
```bash
git clone https://github.com/muzamil-ali-cs/university-chatbot.git
cd university-chatbot
```

### 2. Create a Virtual Environment (recommended)
```bash
python -m venv venv

# Activate it:
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

### 3. Install Dependencies
```bash
pip install -r requirements.txt
```

### 4. Configure Environment Variables
Create a `.env` file in the project root:
```env
FLASK_SECRET_KEY=your_strong_and_unique_secret_key
GEMINI_API_KEY=your_google_gemini_api_key
PORT=5000
```
> Get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey). The AI fallback works even without it — it just falls back to a default message.

### 5. Run the App
```bash
python app.py
```
Then open **http://localhost:5000** in your browser. 🎉

### 6. (Optional) Run in Production with Gunicorn
```bash
gunicorn --worker-class eventlet -w 1 app:app
```

---

## 🧠 How the Matching Engine Works

```text
User Message
     │
     ▼
Preprocess (lowercase, remove punctuation)
     │
     ▼
Keyword Match (single + multi-word) ──► Found? ──► Return Answer
     │ No
     ▼
Stemmed Keyword Match ──► Found? ──► Return Answer
     │ No
     ▼
Fuzzy Match (difflib, 80% similarity) ──► Found? ──► Return Answer
     │ No
     ▼
TF-IDF + Cosine Similarity ──► Found? ──► Return Answer
     │ No
     ▼
Gemini AI Fallback ──► Return AI-Generated Answer
```

---

## 📝 Customizing the Knowledge Base

Add new topics easily by editing `data.json`:
```json
{
  "keywords_to_topic": {
    "hostel": "accommodation"
  },
  "answers": {
    "accommodation": "The university offers on-campus hostel facilities for both boys and girls..."
  }
}
```
No code changes needed — just update the JSON and restart the server.

---

## 🚀 Future Improvements

- [ ] Add persistent chat history (database integration)
- [ ] Multi-language support
- [ ] Admin dashboard to manage `data.json` visually
- [ ] Voice input/output
- [ ] Deploy live demo link

---

## 👨‍💻 Author

**Muzamil Ali**
🎓 BS Computer Science, Sukkur IBA University
🔗 [LinkedIn](https://linkedin.com/in/muzamil-ishaque) • [GitHub](https://github.com/muzamil-ali-cs)

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

<div align="center">

⭐ If you found this project helpful, consider giving it a star!

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:003da5,100:001f6e&height=100&section=footer" width="100%"/>

</div>
