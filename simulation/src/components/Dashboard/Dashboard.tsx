/*

*/
import { useState, useEffect } from 'react'; 
import { Navigate, useNavigate } from 'react-router-dom'; 
import './Dashboard.css';

type User = { 
    email: string; 
    user_metadata: { organization_id: string };
};




export default function Dashboard() {
    const navigate = useNavigate(); 

    const [user, setUser] = useState<User | null>(null);
    


}