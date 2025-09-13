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

type newProjectData = { 
    name: string; 
    description: string; 
    modelUrl?: string; 
}

export default function Dashboard() {
    const navigate = useNavigate(); 

    const [user, setUser] = useState<User | null>(null);
    const [projectList, setProjectList] = useState<Project[]>([]);
    const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
    const [loading, setLoading] = useState(true); 
    const [showNewProjectModal, setShowNewProjectModal] = useState(false); 
    const [orgId, setOrgId] = useState<string | null>(null); 


    const loadProjects = async(_orgId: string): Promise<void> => {
        const dummyProjects: Project[] = [
            { 
                id: '1',
                name: 'Demo Project',
                description: 'A demo project', 
                annotations: [], 
                created_at: new Date().toISOString(),
            },
        ];
        setProjectList(dummyProjects);
    };

    const loadTeamMembers = async (orgId): Promise<void> => {
        const dummyMembers: TeamMember[] = [
            {
                user_id: '1', 
                user: { email: 'team@example.com' },
                role: 'Admin', 
                joined_at: new Date().toISOString(), 
            },
        ];
        setTeamMembers(dummyMembers);
    };

    const handleCreateProject = async (projectData: newProjectData): Promise<void> => {
        const newProject: Project = { 
            id: (projectList.length + 1).toString(),
            name: projectData.name,
            description: projectData.description, 
            annotations: [],
            created_at: new Date().toISOString(), 
        };
        setProjectList((prev) => [...prev, newProject]); 
        setShowNewProjectModal(false); 
    }   

    const handleSignout = async (): Promise<void> => {
        navigate('/login');
    };

    if (loading) {
        return ( 
            <div className="dashboard-loading">
                <div />
            </div>
        )
    }

    return (

    )

}