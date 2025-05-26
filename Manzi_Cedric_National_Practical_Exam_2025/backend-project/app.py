from flask import Flask, request, jsonify
from flask_cors import CORS
import json

app = Flask(__name__)
CORS(app)

# Simple in-memory user storage
users = [
    {"id": 1, "username": "admin", "password": "admin123"}
]

@app.route('/test', methods=['GET'])
def test():
    print("Test endpoint called")
    return jsonify({"message": "Backend is working!", "status": "success"})

@app.route('/api/login', methods=['POST'])
def login():
    data = request.get_json()
    print(f"Login attempt: {data}")
    
    username = data.get('username')
    password = data.get('password')
    
    # Check credentials
    user = next((u for u in users if u['username'] == username and u['password'] == password), None)
    
    if user:
        print(f"Login successful for: {username}")
        return jsonify({"message": "Login successful", "success": True, "user": {"id": user["id"], "username": user["username"]}})
    else:
        print(f"Login failed for: {username}")
        return jsonify({"message": "Invalid credentials", "success": False}), 401

@app.route('/api/register', methods=['POST'])
def register():
    data = request.get_json()
    print(f"Registration attempt: {data}")
    
    username = data.get('username')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')
    
    # Validation
    if not username or not password or not confirm_password:
        return jsonify({"message": "All fields are required", "success": False}), 400
    
    if password != confirm_password:
        return jsonify({"message": "Passwords do not match", "success": False}), 400
    
    if len(password) < 6:
        return jsonify({"message": "Password must be at least 6 characters", "success": False}), 400
    
    # Check if username exists
    if any(u['username'] == username for u in users):
        return jsonify({"message": "Username already exists", "success": False}), 400
    
    # Add new user
    new_user = {"id": len(users) + 1, "username": username, "password": password}
    users.append(new_user)
    
    print(f"User registered: {username}")
    return jsonify({"message": "Registration successful", "success": True})

if __name__ == '__main__':
    print("Starting Flask backend server...")
    print("Available endpoints:")
    print("  GET /test")
    print("  POST /api/login")
    print("  POST /api/register")
    app.run(debug=True, host='localhost', port=5002)
