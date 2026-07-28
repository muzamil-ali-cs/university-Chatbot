import os
from dotenv import load_dotenv
import string
import json
import re
import difflib
import requests
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

load_dotenv()

app = Flask(__name__)
app.config['SECRET_KEY'] = os.environ.get('FLASK_SECRET_KEY', 'your_strong_and_unique_secret_key')

socketio = SocketIO(app,async_mode='threading')

GEMINI_API_KEY = os.environ.get('GEMINI_API_KEY')
GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent"

STOP_WORDS = ["a", "an", "the", "what", "is", "are", "do", "i", "want", "to", "know", "about", "can", "my", "how"]

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_PATH = os.path.join(BASE_DIR, 'data.json')

with open(DATA_PATH, 'r', encoding='utf-8') as f:
    DATA_KB = json.load(f)

KWT = DATA_KB["keywords_to_topic"] 
ANSWERS = DATA_KB["answers"]         


def call_ai_fallback(user_message):
    """Jab JSON mein koi topic match na ho, to ye function Gemini API se jawab leta hai."""
    if not GEMINI_API_KEY:
        return "Sorry, general questions ke liye AI abhi configure nahi hai. Sirf university-related sawal poochein."

    try:
        headers = {"Content-Type": "application/json"}
        payload = {
            "contents": [{
                "parts": [{"text": user_message}]
            }]
        }
        response = requests.post(
            f"{GEMINI_URL}?key={GEMINI_API_KEY}",
            headers=headers,
            json=payload,
            timeout=15
        )
        response.raise_for_status()
        result = response.json()
        ai_text = result["candidates"][0]["content"]["parts"][0]["text"]
        return ai_text.strip()

    except Exception as e:
        print("AI fallback error:", e)
        return "Sorry, abhi AI se jawab lene mein masla aa raha hai. Thodi dair baad try karein."


def preprocess(text):
    """Lowercase, remove punctuation, collapse extra whitespace."""
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\s+', ' ', text).strip()
    return text


MULTI_WORD_KEYWORDS = {k: v for k, v in KWT.items() if ' ' in k}
SINGLE_WORD_KEYWORDS = {k: v for k, v in KWT.items() if ' ' not in k}


def simple_stem(word):
    """Crude suffix stripper (no external NLTK data needed) so plural/verb
    forms not explicitly listed in data.json still match, e.g. 'attending'
    -> 'attend', 'grades' -> 'grade'."""
    for suffix in ("ing", "edly", "ed", "es", "s"):
        if word.endswith(suffix) and len(word) - len(suffix) >= 3:
            return word[: -len(suffix)]
    return word


STEMMED_KEYWORDS = {}
for kw, topic in SINGLE_WORD_KEYWORDS.items():
    STEMMED_KEYWORDS.setdefault(simple_stem(kw), topic)


def _strip_markup(text):
    text = re.sub(r'<[^>]+>', ' ', text)          
    text = re.sub(r'[^\x00-\x7F]+', ' ', text)     
    return text

_TOPIC_LIST = list(ANSWERS.keys())
_topic_keywords = {t: [] for t in _TOPIC_LIST}
for kw, topic in KWT.items():
    if topic in _topic_keywords:
        _topic_keywords[topic].append(kw)

_TOPIC_CORPUS = [
    (" ".join(_topic_keywords[t]) + " ") * 3 + _strip_markup(ANSWERS[t])
    for t in _TOPIC_LIST
]

_tfidf_vectorizer = TfidfVectorizer(stop_words=STOP_WORDS)
_topic_matrix = _tfidf_vectorizer.fit_transform(_TOPIC_CORPUS)

TFIDF_THRESHOLD = 0.15  


def tfidf_match(cleaned_message):
    """Return the best-matching topic by cosine similarity, or None."""
    message_vec = _tfidf_vectorizer.transform([cleaned_message])
    similarities = cosine_similarity(message_vec, _topic_matrix)[0]
    best_idx = similarities.argmax()
    if similarities[best_idx] >= TFIDF_THRESHOLD:
        return _TOPIC_LIST[best_idx]
    return None


def find_topics(cleaned_message):
    """Find matching topics using phrase match, exact word match, stemmed
    word match, and fuzzy match (in that order of confidence)."""
    found_topics = set()

    for phrase, topic in MULTI_WORD_KEYWORDS.items():
        if phrase in cleaned_message:
            found_topics.add(topic)

    words = cleaned_message.split()
    keywords_in_message = [w for w in words if w not in STOP_WORDS]

    unmatched_words = []
    for word in keywords_in_message:
        if word in SINGLE_WORD_KEYWORDS:
            found_topics.add(SINGLE_WORD_KEYWORDS[word])
        else:
            unmatched_words.append(word)

    if not found_topics:
        for word in unmatched_words:
            stemmed = simple_stem(word)
            if stemmed in STEMMED_KEYWORDS:
                found_topics.add(STEMMED_KEYWORDS[stemmed])

   
    if not found_topics:
        for word in unmatched_words:
            close = difflib.get_close_matches(word, SINGLE_WORD_KEYWORDS.keys(), n=1, cutoff=0.8)
            if close:
                found_topics.add(SINGLE_WORD_KEYWORDS[close[0]])

    return found_topics


def get_bot_response(user_message):

    original_message = user_message
    cleaned_message = preprocess(user_message)

    found_topics = find_topics(cleaned_message)

    if not found_topics:
        
        tfidf_topic = tfidf_match(cleaned_message)
        if tfidf_topic:
            return ANSWERS.get(tfidf_topic, "Sorry, is topic ki details abhi available nahi hain. Please contact Registrar's Office.")
        return call_ai_fallback(original_message)

    elif len(found_topics) == 1:
        topic = list(found_topics)[0]
        return ANSWERS.get(topic, "Sorry, is topic ki details abhi available nahi hain. Please contact Registrar's Office.")

    else:
        topic_names = ", ".join([t.replace('_', ' ').capitalize() for t in found_topics])
        return (f"I found information regarding multiple topics: {topic_names}. "
                "Which specific topic would you like me to focus on first?")

 
@socketio.on('message')
def handle_message(data):
    print('Received message from client:', data)

    response_text = get_bot_response(data)
    
    emit('response', {'message': response_text})


@app.route('/')
def home():
    return render_template('modern-chat.html')


if __name__ == '__main__':
    port = int(os.environ.get('PORT',5000))
    socketio.run(app, host='0.0.0.0', port=port)