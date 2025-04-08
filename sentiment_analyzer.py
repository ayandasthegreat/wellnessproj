from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

analyzer = SentimentIntensityAnalyzer()

mood_colors = {
    "Happy": "#FFD700",         # yellow
    "Content": "#98FB98",       # green
    "Anxious": "#FF6347",       # red
    "Tired": "#D3D3D3",         # grey
    "Sad": "#062f57",           # dark blue
    "Angry": "#FF4500",         # orange
    "Very Negative": "#696969"  # gray
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

