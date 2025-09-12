/**
 * 
 * Refactored & migrated to typescript 
 */

import React, { useState, useCallback } from 'react'; 
import { useNavigate, Link } from 'react-router-dom'; 
import './Auth.css'; 

type Plan = 'free' | 'pro'; 

type FormData = { 
    email: string, 
    password: string, 
    orgName: string, 
    plan: Plan, 
};

declare const auth: { 
    signUp(
        email: string, 
        password: string, 
        orgName: string 
    ): Promise<{
        data: { user?: unknown } | null;
        error?: { message: string };
    }>;
};

declare const analytics: 
    | { trackEvent: (event: string, props?: Record<string, unknown>) => void }
    | undefined; 

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
        
        
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            setError(null); 
            setLoading(true); 

            try {
                const { data, error: signUpError } = await auth.signUp(
                    formData.email, 
                    formData.password, 
                    formData.orgName
                );  

                if (error) {
                    setError(error.message);
                }


            } catch (err) {
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
            };

    return (

    )
}