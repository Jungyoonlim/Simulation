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
                const { data, error } = await auth.signUp(
                    formData.email, 
                    formData.password, 
                    formData.orgName
                );  

                if (error) {
                    setError(error.message);
                } else if (data?.user) { 
                    analytics?.trackEvent('user_signup', { 
                        method: 'email',
                        plan: formData.plan,
                    });

                    alert();
                    navigate('/login');
                } else { 
                    setError('Sign up succeeded, but no user was returned.');
                }
            } catch {
                setError('An unexpected error occurred');
            } finally {
                setLoading(false);
            }
            },
            [
                formData.email, 
                formData.password,
                formData.orgName, 
                formData.plan, 
                navigate, 
            ]
        ); 
    return (
        <div className="auth-container">
            <div className="auth-background">
                <div className="auth-gradient" />
                <div className="auth-pattern" />
            </div>
        



        </div>
    )
}