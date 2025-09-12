/*

*/
import { useState, useEffect } from 'react'; 
import { Navigate, useNavigate } from 'react-router-dom'; 
import './Dashboard.css';

type User = { 
    email: string; 
    user_metadata: { organization_id: string };
};

type Project = {
    id: string; 
    name: string; 
    description?: string; 
    annotations: unknown[];
    created_at: string; 
};

type TeamMember = { 
    user_id: string; 
    user?: { email?: string };
    role: 'Admin' | 'Member' | string; 
    joined_at: string; 
}




export default function Dashboard() {
    const navigate = useNavigate(); 

    const [user, setUser] = useState<User | null>(null);
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true); 
    const [showNewProjectModal, setShowNewProjectModal] = useState(false); 
    const [orgId, setOrgId] = useState<string | null>(null); 

    


}