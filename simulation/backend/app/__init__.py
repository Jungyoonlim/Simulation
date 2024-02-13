from flask import Flask, request, jsonify 
from flask_cors import CORS
from flask_login import LoginManager 
from .auth import auth_blueprint 
# from .models import Annotation
from .database import db 

# Create a flask application
app = Flask(__name__)
CORS(app)

# TODO: Update this line with your PostgreSQL connection details
app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://username:password@localhost/yourdatabase"
# Enter a secret key for session management.
app.config["SECRET_KEY"] = "mysecretkey"

db.init_app(app)

# LoginMananger initialization
login_manager = LoginManager()
login_manager.init_app(app)

# Register the auth blueprint
app.register_blueprint(auth_blueprint, url_prefix='/auth')

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

