/*
TypeScript Migration for Dashboard.js 
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
                <div className="loading-spinner" />
                <p>Loading Workspace...</p>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-left">
                    <h1 className="dashboard-logo">3D platform</h1>
                    <nav className="header-nav">
                        <a href="#projects" className="nav-link active">
                            Projects
                        </a>
                        <a href="#team" className="nav-link">
                            Analytics
                        </a>
                        <a href="#settings" className="nav-link">
                            Settings
                        </a>
                    </nav>
                </div>
                <div className="header-right">
                    <div className="user-menu">
                        <span className="user-email">{user?.email}</span>
                        <button onClick={handleSignout} className="sign-out-btn">
                            Sign Out 
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                {/* Stats Overview */}
                <div className="stats-section">
                    <div className="stat-card">
                        <div className="stat-content">
                            <h3>{projectList.length}</h3>
                            <p>Active Projects</p>
                        </div>
                    </div>

                    <div>

                    </div>
                    
                </div>
            </main>



        </div>
    )

}

// New Project Modal 
type NewProjectModalProps = { 
    onClose: () => void; 
    onCreate: (data: newProjectData) => void; 
}

function NewProjectModal({ onClose, onCreate }: NewProjectModalProps){ 
    const [formData, setFormData] = useState<newProjectData>({ 
        name: '',
        description: '',
        modelUrl: '',
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
        e.preventDefault(); 
        onCreate(formData);
    };

    return ( 
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                
            </div>
        </div>
    );
}