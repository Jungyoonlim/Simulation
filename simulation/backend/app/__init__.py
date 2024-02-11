from flask import Flask, request, jsonify 
from flask_cors import CORS 

app = Flask(__name__)
CORS(app)

@app.route('/')
def intro():
    return "This is RothkoAI."

@app.route('/annotations', methods=['POST'])
def add_annotation():
    data = request.get_json()
    print("Received annotation data:", data)

    return jsonify(data), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)

