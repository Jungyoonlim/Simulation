import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Database schema for robotics annotation SaaS
 * 
 * Tables:
 * - organizations (multi-tenant)
 * - users
 * - projects (SLAM maps)
 * - annotations
 * - annotation_history
 * - team_members
 * - subscription_plans
 */

// Auth helpers
export const auth = {
  signUp: async (email, password, organizationName) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          organization_name: organizationName,
          role: 'owner'
        }
      }
    });
    
    if (!error && data.user) {
      // Create organization
      await createOrganization(data.user.id, organizationName);
    }
    
    return { data, error };
  },
  
  signIn: async (email, password) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },
  
  signOut: async () => {
    return await supabase.auth.signOut();
  },
  
  getUser: () => {
    return supabase.auth.getUser();
  }
};

// Organization management
export const createOrganization = async (userId, name) => {
  const { data, error } = await supabase
    .from('organizations')
    .insert({
      name,
      owner_id: userId,
      plan: 'free',
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (!error) {
    // Add owner as team member
    await supabase.from('team_members').insert({
      organization_id: data.id,
      user_id: userId,
      role: 'owner',
      joined_at: new Date().toISOString()
    });
  }
  
  return { data, error };
};

// Project (SLAM map) management
export const projects = {
  create: async (organizationId, projectData) => {
    return await supabase
      .from('projects')
      .insert({
        organization_id: organizationId,
        name: projectData.name,
        description: projectData.description,
        model_url: projectData.modelUrl,
        model_type: 'slam_mesh',
        metadata: projectData.metadata || {},
        created_at: new Date().toISOString()
      })
      .select()
      .single();
  },
  
  list: async (organizationId) => {
    return await supabase
      .from('projects')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });
  },
  
  get: async (projectId) => {
    return await supabase
      .from('projects')
      .select(`
        *,
        annotations (*)
      `)
      .eq('id', projectId)
      .single();
  },
  
  update: async (projectId, updates) => {
    return await supabase
      .from('projects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();
  }
};

// Annotation management with real-time sync
export const annotations = {
  create: async (projectId, annotationData) => {
    const { data: userData } = await supabase.auth.getUser();
    
    return await supabase
      .from('annotations')
      .insert({
        project_id: projectId,
        user_id: userData.user.id,
        name: annotationData.name,
        type: annotationData.type || 'general',
        position: annotationData.position,
        metadata: annotationData.metadata || {},
        ai_confidence: annotationData.aiConfidence,
        ai_suggestion: annotationData.aiSuggestion,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
  },
  
  list: async (projectId) => {
    return await supabase
      .from('annotations')
      .select(`
        *,
        user:users (email, full_name)
      `)
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });
  },
  
  update: async (annotationId, updates) => {
    const { data: userData } = await supabase.auth.getUser();
    
    // Log to history
    await supabase.from('annotation_history').insert({
      annotation_id: annotationId,
      user_id: userData.user.id,
      action: 'update',
      changes: updates,
      timestamp: new Date().toISOString()
    });
    
    return await supabase
      .from('annotations')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', annotationId)
      .select()
      .single();
  },
  
  delete: async (annotationId) => {
    const { data: userData } = await supabase.auth.getUser();
    
    // Log to history
    await supabase.from('annotation_history').insert({
      annotation_id: annotationId,
      user_id: userData.user.id,
      action: 'delete',
      timestamp: new Date().toISOString()
    });
    
    return await supabase
      .from('annotations')
      .delete()
      .eq('id', annotationId);
  },
  
  // Real-time subscription
  subscribe: (projectId, callback) => {
    return supabase
      .channel(`annotations:${projectId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'annotations',
          filter: `project_id=eq.${projectId}`
        },
        callback
      )
      .subscribe();
  }
};

// File storage for SLAM meshes
export const storage = {
  uploadModel: async (file, projectId) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${projectId}/${Date.now()}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from('models')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });
    
    if (!error) {
      const { data: urlData } = supabase.storage
        .from('models')
        .getPublicUrl(fileName);
      
      return { url: urlData.publicUrl, path: fileName };
    }
    
    return { data, error };
  },
  
  deleteModel: async (path) => {
    return await supabase.storage
      .from('models')
      .remove([path]);
  }
};

// Team collaboration
export const teams = {
  invite: async (organizationId, email, role = 'member') => {
    // Send invitation logic
    return await supabase
      .from('invitations')
      .insert({
        organization_id: organizationId,
        email,
        role,
        token: crypto.randomUUID(),
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single();
  },
  
  listMembers: async (organizationId) => {
    return await supabase
      .from('team_members')
      .select(`
        *,
        user:users (email, full_name)
      `)
      .eq('organization_id', organizationId);
  }
};

// Usage analytics
export const analytics = {
  trackEvent: async (eventName, properties = {}) => {
    const { data: userData } = await supabase.auth.getUser();
    
    return await supabase
      .from('analytics_events')
      .insert({
        user_id: userData?.user?.id,
        event_name: eventName,
        properties,
        timestamp: new Date().toISOString()
      });
  },
  
  getUsageStats: async (organizationId, startDate, endDate) => {
    return await supabase
      .from('usage_stats')
      .select('*')
      .eq('organization_id', organizationId)
      .gte('date', startDate)
      .lte('date', endDate);
  }
}; 