from .database import db 
from flask import Blueprint, request, jsonify 
from werkzeug.security import generate_password_hash, check_password_hash
from .models import User, db 

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

    if not username or not password:
        return jsonify({'error': 'Both username and password are required'}), 400
    
    # Check if user already exists
    existing_user = User.query.filter_by(username=username).first()
    if existing_user:
        return jsonify({'message': 'User already exists'}), 400
    
    # Hash password and create new user 
    hashed_password = generate_password_hash(password)
    user = User(username=username, password_hash=hashed_password)

    # Add user to database 
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'User registered successfully'}), 201

@auth_blueprint.route('/auth/login', methods=['POST'])
def login():
    username = request.json.get('username')
    password = request.json.get('password')

    if not username or not password:
        return jsonify({'error': 'Both username and password are required'}), 400
    
    user = User.query.filter_by(username=username).first()
    if user and check_password_hash(user.password_hash, password):
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'error': 'Invalid username or password'}), 401