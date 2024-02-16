from flask import Flask, request, jsonify 
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_login import LoginManager 
from .auth import auth_blueprint 
from .database import db 
from .models import User

# Create a flask application
app = Flask(__name__)

app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///db.sqlite3"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

# TODO: Update this line with your PostgreSQL connection details
# app.config["SQLALCHEMY_DATABASE_URI"] = "postgresql://username:password@localhost/yourdatabase"
# Enter a secret key for session management.
db = SQLAlchemy(app)

# db.init_app(app)

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

    new_annotation = User(modelName=data['modelName'], position_x=data['position_x'], position_y=data['position_y'], position_z=data['position_z'], text=data['text'])
    db.session.add(new_annotation)
    db.session.commit()
    return jsonify(data), 201

if __name__ == '__main__':
    app.run(debug=True, port=5000)
