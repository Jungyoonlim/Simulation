/*
TypeScript Migration for Dashboard.js 
*/
import { useState, useEffect, FormEvent } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
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

    useEffect(() => {
        const checkAuth = async (): Promise<void> => {
            const dummyUser: User = {
                email: 'dummy@example.com',
                user_metadata: { organization_id: 'demo-org' },
            };
            setUser(dummyUser);
            const _orgId = dummyUser.user_metadata.organization_id;
            setOrgId(_orgId);
            await loadProjects(_orgId);
            await loadTeamMembers(_orgId);
            setLoading(false);
        };

        checkAuth();
    }, []);


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

    const loadTeamMembers = async (orgId: string): Promise<void> => {
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
                    <h1 className="dashboard-logo">🤖 RoboMap Validator</h1>
                    <nav className="header-nav">
                        <a href="#projects" className="nav-link active">Projects</a>
                        <a href="#team" className="nav-link">Team</a>
                        <a href="#analytics" className="nav-link">Analytics</a>
                        <a href="#settings" className="nav-link">Settings</a>
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
                        <div className="stat-icon">📁</div>
                        <div className="stat-content">
                            <h3>{projectList.length}</h3>
                            <p>Active Projects</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>{teamMembers.length}</h3>
                            <p>Team Members</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📍</div>
                        <div className="stat-content">
                            <h3>342</h3>
                            <p>Total Annotations</p>
                        </div>
                    </div>
                </div>

                {/* Projects Section */}
                <section className="projects-section" id="projects">
                    <div className="section-header">
                        <h2>Projects</h2>
                        <button className="create-project-btn" onClick={() => setShowNewProjectModal(true)}>
                            + New Project
                        </button>
                    </div>

                    <div className="projects-grid">
                        {projectList.map((project) => (
                            <div
                                key={project.id}
                                className="project-card"
                                onClick={() => navigate(`/project/${project.id}`)}
                                role="button"
                                tabIndex={0}
                                onKeyDown={(e) => (e.key === 'Enter' ? navigate(`/project/${project.id}`) : null)}
                            >
                                <div className="project-thumbnail">
                                    <div className="thumbnail-placeholder">
                                        <span>🗺️</span>
                                    </div>
                                </div>
                                <div className="project-info">
                                    <h3>{project.name}</h3>
                                    <p>{project.description || 'No description'}</p>
                                    <div className="project-meta">
                                        <span className="meta-item">
                                            <span className="meta-icon">📍</span>
                                            {project.annotations?.length || 0} annotations
                                        </span>
                                        <span className="meta-item">
                                            <span className="meta-icon">📅</span>
                                            {new Date(project.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {projectList.length === 0 && (
                            <div className="empty-state">
                                <h3>No projects yet</h3>
                                <p>Create your first project to start annotating SLAM meshes</p>
                                <button className="create-project-btn" onClick={() => setShowNewProjectModal(true)}>
                                    Create First Project
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* Team Section Preview */}
                <section className="team-section" id="team">
                    <div className="section-header">
                        <h2>Team Activity</h2>
                        <button className="invite-btn">Invite Members</button>
                    </div>
                    <div className="team-activity">
                        {teamMembers.slice(0, 5).map((member) => (
                            <div key={member.user_id} className="activity-item">
                                <div className="activity-avatar">
                                    {member.user?.email?.[0]?.toUpperCase() || '?'}
                                </div>
                                <div className="activity-content">
                                    <p>
                                        <strong>{member.user?.email || 'Unknown'}</strong>
                                        <span className="activity-role">{member.role}</span>
                                    </p>
                                    <p className="activity-time">Joined {new Date(member.joined_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            {showNewProjectModal && (
                <NewProjectModal onClose={() => setShowNewProjectModal(false)} onCreate={handleCreateProject} />
            )}
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

    const handleSubmit = (e: FormEvent<HTMLFormElement>): void => {
        e.preventDefault(); 
        onCreate(formData);
    };

    return ( 
        <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <h2>Create New Project</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>
                            Project Name
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Warehouse Navigation Map"
                                required
                            />
                        </label>
                    </div>
                    <div className="form-group">
                        <label>
                            Description
                            <textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="SLAM mesh for autonomous warehouse robot navigation"
                                rows={3}
                            />
                        </label>
                    </div>
                    <div className="form-actions">
                        <button type="button" onClick={onClose} className="btn-secondary">
                            Cancel
                        </button>
                        <button type="submit" className="btn-primary">
                            Create Project
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
