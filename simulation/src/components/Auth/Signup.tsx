import React, { useState, useCallback } from 'react'; 
import { useNavigate, Link } from 'react-router-dom'; 
import './Auth.css'; 

type FormData = { 
    email: string, 
    password: string, 
    orgName: string, 
    plan: 'free' | 'premium', 
};

export default function Signup(){
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        email: "", 
        password: "",
        orgName: "",
        plan: "free"
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); 

    const handleChange = 
        useCallback(<K extends keyof FormData>(key: K) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(p => ({ ...p, [key]: }))
        }, []);
        
        
    const handleSubmit = useCallback(async (e: ))
}