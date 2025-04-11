from flask import Flask, request, jsonify
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

analyzer = SentimentIntensityAnalyzer()


mood_colors = {
    "Happy": "#FFF9DB",
    "Content": "#DFF5E3",
    "Anxious": "#FFE5E0",
    "Tired": "#E6E2F0",
    "Sad": "#D0DEEF",
    "Angry": " #FAD4C0",
    "Very Negative": "#C0C0C0",
    "Neutral": "#EFEFEF"
}


def analyze_sentiment(text):
    if not text.strip():
        return {
            "text": text,
            "score": 0,
            "mood": "Neutral",
            "color": "#808080",
            "details": {}
        }

    scores = analyzer.polarity_scores(text)
    compound = scores['compound']

    if compound >= 0.5:
        mood = "Happy"
    elif compound >= 0.2:
        mood = "Content"
    elif compound <= -0.5:
        mood = "Very Negative"
    elif compound <= -0.2:
        mood = "Anxious"
    elif compound <= -0.05:
        mood = "Tired"
    else:
        mood = "Neutral"

    if any(keyword in text.lower() for keyword in ["burnt out", "exhausted", "tired", "done"]):
        mood = "Tired"
    elif any(keyword in text.lower() for keyword in ["nervous", "anxious", "worried", "stressed"]):
        mood = "Anxious"
    elif any(keyword in text.lower() for keyword in ["excited", "eager", "pumped", "happy", "great"]):
        mood = "Happy"
    elif any(keyword in text.lower() for keyword in ["sad", "down", "depressed", "blue"]):
        mood = "Sad"
    elif any(keyword in text.lower() for keyword in ["angry", "frustrated", "upset", "mad"]):
        mood = "Angry"

    color = mood_colors.get(mood, "#808080")

    return {
        "text": text,
        "score": compound,
        "mood": mood,
        "color": color,
        "details": scores
    }


@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "")
    result = analyze_sentiment(text)
    return jsonify(result)


if __name__ == "__main__":
    app.run(port=5001, debug=True)
