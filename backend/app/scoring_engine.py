from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


ROLE_TEMPLATES = {
"backend": "python java api database backend",
"frontend": "html css javascript react ui",
"fullstack": "frontend backend api database"
}


PRIORITY_WEIGHT = {"high": 30, "medium": 20, "low": 10}


def role_score(resume_text, role):
    corpus = [resume_text, ROLE_TEMPLATES[role]]
    tfidf = TfidfVectorizer().fit_transform(corpus)
    return int(cosine_similarity(tfidf[0:1], tfidf[1:2])[0][0] * 100)




def final_score(role_match, priorities):
    return int(role_match * 0.6 + sum(priorities) * 0.4)