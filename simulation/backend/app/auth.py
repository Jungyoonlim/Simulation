from .database import db 
from flask import Blueprint

# User Model 
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(120), nullable=False)

# Create a Blueprint for authentication 
auth_blueprint = Blueprint('auth', __name__)

# Define routes for the blueprint
@auth_blueprint.route('/auth/register', methods=['GET'])
def login():
    return "Login Page"