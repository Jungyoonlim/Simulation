/* eslint-disable no-undef, no-unused-vars */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import './Dashboard.css';

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [projectList, setProjectList] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [organizationId, setOrganizationId] = useState(null);

  useEffect(() => {
    checkAuth();
  }, []);

  // Dummy authentication simulation
  const checkAuth = async () => {
    const dummyUser = { 
      email: 'dummy@example.com', 
      user_metadata: { organization_id: 'demo-org' } 
    };
    setUser(dummyUser);
    const orgId = dummyUser.user_metadata.organization_id;
    setOrganizationId(orgId);
    await loadProjects(orgId);
    await loadTeamMembers(orgId);
    setLoading(false);
  };

  // Dummy projects loader
  const loadProjects = async (orgId) => {
    const dummyProjects = [
      { id: '1', name: 'Demo Project', description: 'A demo project', annotations: [], created_at: new Date().toISOString() }
    ];
    setProjectList(dummyProjects);
  };

  // Dummy team members loader
  const loadTeamMembers = async (orgId) => {
    const dummyMembers = [
      { user_id: '1', user: { email: 'team@example.com' }, role: 'Admin', joined_at: new Date().toISOString() }
    ];
    setTeamMembers(dummyMembers);
  };

  // Dummy project creation
  const handleCreateProject = async (projectData) => {
    console.log('Dummy create project:', projectData);
    const newProject = {
      id: (projectList.length + 1).toString(),
      name: projectData.name,
      description: projectData.description,
      annotations: [],
      created_at: new Date().toISOString()
    };
    setProjectList([...projectList, newProject]);
    setShowNewProjectModal(false);
  };

  // Dummy sign out
  const handleSignOut = async () => {
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner" />
        <p>Loading workspace...</p>
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
            <button onClick={handleSignOut} className="sign-out-btn">
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
          <div className="stat-card">
            <div className="stat-icon">🤖</div>
            <div className="stat-content">
              <h3>89%</h3>
              <p>AI Accuracy</p>
            </div>
          </div>
        </div>

        {/* Projects Section */}
        <section className="projects-section">
          <div className="section-header">
            <h2>Projects</h2>
            <button 
              className="create-project-btn"
              onClick={() => setShowNewProjectModal(true)}
            >
              + New Project
            </button>
          </div>

          <div className="projects-grid">
            {projectList.map(project => (
              <div 
                key={project.id} 
                className="project-card"
                onClick={() => navigate(`/project/${project.id}`)}
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

            {/* Empty State */}
            {projectList.length === 0 && (
              <div className="empty-state">
                <h3>No projects yet</h3>
                <p>Create your first project to start annotating SLAM meshes</p>
                <button 
                  className="create-project-btn"
                  onClick={() => setShowNewProjectModal(true)}
                >
                  Create First Project
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Team Section Preview */}
        <section className="team-section">
          <div className="section-header">
            <h2>Team Activity</h2>
            <button className="invite-btn">Invite Members</button>
          </div>
          <div className="team-activity">
            {teamMembers.slice(0, 5).map(member => (
              <div key={member.user_id} className="activity-item">
                <div className="activity-avatar">
                  {member.user?.email?.[0].toUpperCase() || '?'}
                </div>
                <div className="activity-content">
                  <p>
                    <strong>{member.user?.email || 'Unknown'}</strong>
                    <span className="activity-role">{member.role}</span>
                  </p>
                  <p className="activity-time">
                    Joined {new Date(member.joined_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <NewProjectModal 
          onClose={() => setShowNewProjectModal(false)}
          onCreate={handleCreateProject}
        />
      )}
    </div>
  );
}

// New Project Modal Component
function NewProjectModal({ onClose, onCreate }) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    modelUrl: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <h2>Create New Project</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Project Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Warehouse Navigation Map"
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              placeholder="SLAM mesh for autonomous warehouse robot navigation"
              rows={3}
            />
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

NewProjectModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired
}; 