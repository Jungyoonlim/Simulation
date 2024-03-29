import './Login.css'; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = (event) => {
        event.preventDefault(); 
        if (!username || !password) {
            alert("Please enter both username and password.");
        } else {
            // Here you would typically handle the login logic, possibly sending the username and password
            // to a backend server for verification. For demonstration purposes, we'll just log a success message.
            console.log("Login successful with username: " + username + " and password: " + password);
            // Redirect to another page or change the state to indicate a successful login.
            // For example, using React Router to navigate to a different component:
            // navigate('/home'); 
        }
        console.log(username, password);    
    };

    return (
        <div className="model-app-container">
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>
                        Username:
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <label>
                        Password:
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                    </label>
                </div>
                <div>
                    <button type="submit">Login</button>
                </div>
            </form>
        </div>
    );
};

export default Login; 

/**
 * TODO: Modify HandleSubmit fn to send the username and password to a backend server. 
 * 
 * const handleSubmit = async (event) => {
    event.preventDefault();
    try {
        const response = await fetch('/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });
        if (response.ok) {
            const data = await response.json();
            console.log(data.message); // Or handle login success (e.g., redirect)
        } else {
            console.error('Login failed');
            // Handle login failure (e.g., show error message)
        }
    } catch (error) {
        console.error('Error:', error);
    }
};
 */