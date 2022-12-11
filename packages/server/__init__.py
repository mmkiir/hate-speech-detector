from sklearn.tree import DecisionTreeClassifier
from sklearn.feature_extraction.text import CountVectorizer
from flask import Flask, request, jsonify
import pandas
import re
import string
import nltk
from flask_cors import CORS

data = pandas.read_csv("data.csv")
nltk.download('stopwords')


def clean(text):
    # lowercase
    text = text.lower()
    # remove tickers
    text = re.sub(r'\$\w*', '', text)
    # remove hyperlinks
    text = re.sub(r'https?:\/\/.*\/\w*', '', text)
    # remove HTML tags
    text = re.sub(r'<.*?>', '', text)
    # remove punctuation
    text = ''.join([char for char in text if char not in string.punctuation])
    # remove new line characters
    text = re.sub(r'\r?\n|\r', '', text)
    # remove words with numbers
    text = re.sub(r'\w*\d\w*', '', text)
    # remove stopwords
    stopwords = nltk.corpus.stopwords.words('english')
    text = ' '.join(word for word in text.split() if word not in stopwords)
    # stemming
    ps = nltk.PorterStemmer()
    text = ' '.join(ps.stem(word) for word in text.split())
    return text


clean_data = pandas.DataFrame(data['tweet'].apply(clean))
cv = CountVectorizer()
x = cv.fit_transform(clean_data['tweet'])
y = data['class']
dt = DecisionTreeClassifier()
dt.fit(x, y)
dt.score(x, y)


app = Flask(__name__)
CORS(app)


@app.route('/tweet', methods=["POST"])
def index():
    data = request.get_json()
    return jsonify({
        "class": int(dt.predict(cv.transform([clean(data['tweet'])]))[0])
    })


if __name__ == '__main__':
    app.run()
