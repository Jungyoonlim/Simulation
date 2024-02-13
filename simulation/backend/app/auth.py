from .database import db 
from flask import Blueprint, request, jsonify 
from werkzeug.security import generate_password_hash
from .models import User 

# User Model 
class User(db.Model):
    __tablename__ = 'user'
    __table_args__ = {'extend_existing': True}
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)


# Create a Blueprint for authentication 
auth_blueprint = Blueprint('auth', __name__)

# Define routes for the blueprint
@auth_blueprint.route('/auth/register', methods=['POST'])
def register():
    username = request.json.get('username')
    password = request.json.get('password')

    # Hash password and create new user 
    hashed_password = generate_password_hash(password)
    user = User(username=username, password_hash=hashed_password)

    # Add user to database 
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_blueprint.route('/auth/login', methods=['POST'])
def login():
    return "Login Successful."