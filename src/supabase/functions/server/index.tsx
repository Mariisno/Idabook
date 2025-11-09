import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import { createClient } from "npm:@supabase/supabase-js@2";
import * as kv from "./kv_store.tsx";

const app = new Hono();

// Create Supabase client
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
);

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Middleware to verify authentication
async function verifyAuth(authHeader: string | null) {
  if (!authHeader) {
    return null;
  }
  
  const token = authHeader.split(' ')[1];
  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    console.log('Authentication error:', error?.message);
    return null;
  }
  
  return user.id;
}

// Health check endpoint
app.get("/make-server-8b6272cb/health", (c) => {
  return c.json({ status: "ok" });
});

// Sign up endpoint
app.post("/make-server-8b6272cb/signup", async (c) => {
  try {
    const { email, password, name } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'Email and password are required' }, 400);
    }
    
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      // Automatically confirm the user's email since an email server hasn't been configured.
      email_confirm: true
    });
    
    if (error) {
      console.log('Sign up error:', error.message);
      return c.json({ error: error.message }, 400);
    }
    
    return c.json({ user: data.user });
  } catch (error) {
    console.log('Sign up error:', error);
    return c.json({ error: 'Failed to sign up' }, 500);
  }
});

// Password reset endpoint
app.post("/make-server-8b6272cb/reset-password", async (c) => {
  try {
    const { email } = await c.req.json();
    
    if (!email) {
      return c.json({ error: 'Email is required' }, 400);
    }
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${c.req.header('origin') || 'http://localhost:3000'}/reset-password`,
    });
    
    if (error) {
      console.log('Password reset error:', error.message);
      return c.json({ error: error.message }, 400);
    }
    
    // Note: Always return success even if email doesn't exist (security best practice)
    return c.json({ success: true });
  } catch (error) {
    console.log('Password reset error:', error);
    return c.json({ error: 'Failed to send reset email' }, 500);
  }
});

// Get ideas endpoint (requires auth)
app.get("/make-server-8b6272cb/ideas", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get current user info
    const { data: { user } } = await supabase.auth.getUser(c.req.header('Authorization')?.split(' ')[1] || '');
    const userName = user?.user_metadata?.name || user?.email || 'Unknown';
    
    // Get user's own ideas
    const userIdeasKey = `ideas:user:${userId}`;
    let userIdeas = await kv.get(userIdeasKey) || [];
    
    // Ensure all user ideas have owner info
    userIdeas = userIdeas.map((idea: any) => ({
      ...idea,
      ownerId: idea.ownerId || userId,
      ownerName: idea.ownerName || userName,
      collaborators: idea.collaborators || [],
    }));
    
    // Get shared ideas from all users
    let sharedIdeas: any[] = [];
    try {
      const allKeys = await kv.getByPrefix('ideas:user:');
      sharedIdeas = allKeys
        .filter(item => item.key !== userIdeasKey)
        .flatMap(item => {
          const ideas = item.value as any[];
          // Ensure ideas is an array before filtering
          return Array.isArray(ideas) ? ideas.filter(idea => idea && idea.isShared) : [];
        });
    } catch (prefixError) {
      console.log('Error getting shared ideas (non-fatal):', prefixError);
      // Continue without shared ideas if there's an error
    }
    
    return c.json({ 
      userIdeas,
      sharedIdeas
    });
  } catch (error) {
    console.log('Get ideas error:', error);
    return c.json({ error: 'Failed to get ideas' }, 500);
  }
});

// Save ideas endpoint (requires auth)
app.post("/make-server-8b6272cb/ideas", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { ideas } = await c.req.json();
    const key = `ideas:user:${userId}`;
    
    console.log(`Saving ${ideas.length} ideas for user ${userId}`);
    console.log('Shared ideas:', ideas.filter((i: any) => i.isShared).map((i: any) => ({ id: i.id, title: i.title, isShared: i.isShared })));
    
    await kv.set(key, ideas);
    
    console.log('Ideas saved successfully to KV store');
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Save ideas error:', error);
    return c.json({ error: 'Failed to save ideas' }, 500);
  }
});

// Search users endpoint - public endpoint, no auth required
app.get("/make-server-8b6272cb/users/search", async (c) => {
  try {
    // Optional auth - if user is logged in, exclude them from results
    const userId = await verifyAuth(c.req.header('Authorization'));
    
    const query = c.req.query('q')?.toLowerCase() || '';
    
    // Get all users from auth
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('Search users error:', error);
      return c.json({ error: 'Failed to search users' }, 500);
    }
    
    // Filter by query and exclude current user if logged in
    const filteredUsers = users
      .filter(u => userId ? u.id !== userId : true)
      .filter(u => {
        const name = u.user_metadata?.name?.toLowerCase() || '';
        const email = u.email?.toLowerCase() || '';
        return name.includes(query) || email.includes(query);
      })
      .map(u => ({
        id: u.id,
        name: u.user_metadata?.name || u.email,
        email: u.email,
      }))
      .slice(0, 10);
    
    return c.json({ users: filteredUsers });
  } catch (error) {
    console.log('Search users error:', error);
    return c.json({ error: 'Failed to search users' }, 500);
  }
});

// Follow user endpoint
app.post("/make-server-8b6272cb/follow", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { targetUserId } = await c.req.json();
    
    if (!targetUserId || targetUserId === userId) {
      return c.json({ error: 'Invalid target user' }, 400);
    }
    
    // Get current follows
    const followsKey = `follows:${userId}`;
    const follows = await kv.get(followsKey) || [];
    
    // Add follow if not already following
    if (!follows.includes(targetUserId)) {
      follows.push(targetUserId);
      await kv.set(followsKey, follows);
    }
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Follow user error:', error);
    return c.json({ error: 'Failed to follow user' }, 500);
  }
});

// Unfollow user endpoint
app.post("/make-server-8b6272cb/unfollow", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const { targetUserId } = await c.req.json();
    
    // Get current follows
    const followsKey = `follows:${userId}`;
    const follows = await kv.get(followsKey) || [];
    
    // Remove follow
    const updatedFollows = follows.filter(id => id !== targetUserId);
    await kv.set(followsKey, updatedFollows);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Unfollow user error:', error);
    return c.json({ error: 'Failed to unfollow user' }, 500);
  }
});

// Get following list endpoint
app.get("/make-server-8b6272cb/following", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const followsKey = `follows:${userId}`;
    const follows = await kv.get(followsKey) || [];
    
    return c.json({ following: follows });
  } catch (error) {
    console.log('Get following error:', error);
    return c.json({ error: 'Failed to get following' }, 500);
  }
});

// Get following users with details endpoint
app.get("/make-server-8b6272cb/following/details", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const followsKey = `follows:${userId}`;
    const followingIds = await kv.get(followsKey) || [];
    
    // Get details for each followed user
    const followingUsers = [];
    for (const followedUserId of followingIds) {
      try {
        // Get user info from auth
        const { data: { user }, error } = await supabase.auth.admin.getUserById(followedUserId);
        
        if (user) {
          // Get user's profile (bio)
          const profileKey = `profile:${followedUserId}`;
          const profile = await kv.get(profileKey) || {};
          
          // Get count of public ideas
          const ideasKey = `ideas:user:${followedUserId}`;
          const ideas = await kv.get(ideasKey) || [];
          const publicIdeasCount = Array.isArray(ideas) 
            ? ideas.filter(idea => idea && idea.isShared).length 
            : 0;
          
          followingUsers.push({
            id: user.id,
            name: user.user_metadata?.name || user.email,
            email: user.email,
            bio: profile.bio || '',
            publicIdeasCount,
          });
        }
      } catch (userError) {
        console.log(`Error getting details for user ${followedUserId}:`, userError);
        // Continue with other users
      }
    }
    
    return c.json({ users: followingUsers });
  } catch (error) {
    console.log('Get following details error:', error);
    return c.json({ error: 'Failed to get following details' }, 500);
  }
});

// Get feed of followed users' shared ideas
app.get("/make-server-8b6272cb/feed/following", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get list of users being followed
    const followsKey = `follows:${userId}`;
    const following = await kv.get(followsKey) || [];
    
    // Get ideas from followed users
    const feedIdeas: any[] = [];
    for (const followedUserId of following) {
      const ideasKey = `ideas:user:${followedUserId}`;
      const ideas = await kv.get(ideasKey) || [];
      
      // Only include shared ideas
      const sharedIdeas = Array.isArray(ideas) 
        ? ideas.filter(idea => idea && idea.isShared)
        : [];
      
      feedIdeas.push(...sharedIdeas);
    }
    
    // Sort by updated date
    feedIdeas.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    return c.json({ ideas: feedIdeas });
  } catch (error) {
    console.log('Get following feed error:', error);
    return c.json({ error: 'Failed to get feed' }, 500);
  }
});

// Debug endpoint to check KV store
app.get("/make-server-8b6272cb/debug/kv", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    console.log('=== DEBUG KV STORE ===');
    
    // Get all keys with prefix
    const allKeys = await kv.getByPrefix('ideas:user:');
    console.log(`Found ${allKeys.length} keys`);
    
    const debug = allKeys.map(item => {
      const ideas = item.value as any[];
      const sharedCount = Array.isArray(ideas) ? ideas.filter(i => i?.isShared).length : 0;
      return {
        key: item.key,
        totalIdeas: Array.isArray(ideas) ? ideas.length : 0,
        sharedIdeas: sharedCount,
        ideas: Array.isArray(ideas) ? ideas.map(i => ({ 
          id: i.id, 
          title: i.title, 
          isShared: i.isShared,
          ownerId: i.ownerId 
        })) : []
      };
    });
    
    console.log('Debug info:', JSON.stringify(debug, null, 2));
    
    return c.json({ debug });
  } catch (error) {
    console.log('Debug error:', error);
    return c.json({ error: String(error) }, 500);
  }
});

// Get public feed (all shared ideas) - public endpoint, no auth required
app.get("/make-server-8b6272cb/feed/public", async (c) => {
  try {
    console.log('=== LOADING PUBLIC FEED ===');
    
    let publicIdeas: any[] = [];
    try {
      const allKeys = await kv.getByPrefix('ideas:user:');
      console.log(`Found ${allKeys.length} user keys in KV store`);
      
      publicIdeas = allKeys
        .flatMap(item => {
          const ideas = item.value as any[];
          const sharedIdeas = Array.isArray(ideas) ? ideas.filter(idea => idea && idea.isShared) : [];
          console.log(`Key ${item.key}: ${ideas?.length || 0} total ideas, ${sharedIdeas.length} shared`);
          return sharedIdeas;
        });
      
      console.log(`Total public ideas found: ${publicIdeas.length}`);
      console.log('Public ideas:', publicIdeas.map(i => ({ id: i.id, title: i.title, isShared: i.isShared })));
      
      // Sort by updated date
      publicIdeas.sort((a, b) => 
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
    } catch (prefixError) {
      console.log('Error getting public feed (non-fatal):', prefixError);
    }
    
    return c.json({ ideas: publicIdeas });
  } catch (error) {
    console.log('Get public feed error:', error);
    return c.json({ error: 'Failed to get public feed' }, 500);
  }
});

// Add collaborator to idea
app.post("/make-server-8b6272cb/ideas/:ideaId/collaborators", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const ideaId = c.req.param('ideaId');
    const { collaboratorId, collaboratorName } = await c.req.json();
    
    // Get user's ideas
    const ideasKey = `ideas:user:${userId}`;
    const ideas = await kv.get(ideasKey) || [];
    
    // Find and update the idea
    const updatedIdeas = ideas.map(idea => {
      if (idea.id === ideaId && idea.ownerId === userId) {
        const collaborators = idea.collaborators || [];
        if (!collaborators.find(c => c.id === collaboratorId)) {
          collaborators.push({ id: collaboratorId, name: collaboratorName });
        }
        return { ...idea, collaborators };
      }
      return idea;
    });
    
    await kv.set(ideasKey, updatedIdeas);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Add collaborator error:', error);
    return c.json({ error: 'Failed to add collaborator' }, 500);
  }
});

// Remove collaborator from idea
app.delete("/make-server-8b6272cb/ideas/:ideaId/collaborators/:collaboratorId", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const ideaId = c.req.param('ideaId');
    const collaboratorId = c.req.param('collaboratorId');
    
    // Get user's ideas
    const ideasKey = `ideas:user:${userId}`;
    const ideas = await kv.get(ideasKey) || [];
    
    // Find and update the idea
    const updatedIdeas = ideas.map(idea => {
      if (idea.id === ideaId && idea.ownerId === userId) {
        const collaborators = (idea.collaborators || []).filter(c => c.id !== collaboratorId);
        return { ...idea, collaborators };
      }
      return idea;
    });
    
    await kv.set(ideasKey, updatedIdeas);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Remove collaborator error:', error);
    return c.json({ error: 'Failed to remove collaborator' }, 500);
  }
});

// Get user's public ideas - public endpoint
app.get("/make-server-8b6272cb/users/:userId/ideas", async (c) => {
  try {
    const userId = c.req.param('userId');
    
    // Get user's ideas
    const ideasKey = `ideas:user:${userId}`;
    const ideas = await kv.get(ideasKey) || [];
    
    // Filter only shared/public ideas
    const publicIdeas = Array.isArray(ideas) 
      ? ideas.filter(idea => idea && idea.isShared)
      : [];
    
    // Sort by updated date
    publicIdeas.sort((a, b) => 
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
    
    return c.json({ ideas: publicIdeas });
  } catch (error) {
    console.log('Get user ideas error:', error);
    return c.json({ error: 'Failed to get user ideas' }, 500);
  }
});

// Bug tracking endpoints

// Create bug report - public endpoint
app.post("/make-server-8b6272cb/bugs", async (c) => {
  try {
    // Optional auth - bugs can be created by guests or logged in users
    const userId = await verifyAuth(c.req.header('Authorization'));
    
    const { title, description, userInfo } = await c.req.json();
    
    if (!title || !description) {
      return c.json({ error: 'Title and description are required' }, 400);
    }
    
    // Generate bug ID
    const bugId = `bug_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const bug = {
      id: bugId,
      title,
      description,
      status: 'open',
      reportedBy: userId || 'guest',
      reporterName: userInfo?.name || 'Anonymous',
      reporterEmail: userInfo?.email || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // Get all bugs
    const bugsKey = 'bugs:all';
    const bugs = await kv.get(bugsKey) || [];
    bugs.unshift(bug); // Add to beginning
    await kv.set(bugsKey, bugs);
    
    console.log('Bug created:', bugId);
    
    return c.json({ bug });
  } catch (error) {
    console.log('Create bug error:', error);
    return c.json({ error: 'Failed to create bug report' }, 500);
  }
});

// Get all bugs - public endpoint
app.get("/make-server-8b6272cb/bugs", async (c) => {
  try {
    const bugsKey = 'bugs:all';
    const bugs = await kv.get(bugsKey) || [];
    
    return c.json({ bugs });
  } catch (error) {
    console.log('Get bugs error:', error);
    return c.json({ error: 'Failed to get bugs' }, 500);
  }
});

// Add comment to bug - public endpoint
app.post("/make-server-8b6272cb/bugs/:bugId/comments", async (c) => {
  try {
    // Optional auth - comments can be added by guests or logged in users
    const userId = await verifyAuth(c.req.header('Authorization'));
    
    const bugId = c.req.param('bugId');
    const { text, userInfo } = await c.req.json();
    
    if (!text) {
      return c.json({ error: 'Comment text is required' }, 400);
    }
    
    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const comment = {
      id: commentId,
      bugId,
      text,
      userId: userId || 'guest',
      userName: userInfo?.name || 'Anonymous',
      userEmail: userInfo?.email || null,
      createdAt: new Date().toISOString(),
    };
    
    // Get comments for this bug
    const commentsKey = `comments:bug:${bugId}`;
    const comments = await kv.get(commentsKey) || [];
    comments.push(comment);
    await kv.set(commentsKey, comments);
    
    console.log('Comment added to bug:', bugId);
    
    return c.json({ comment });
  } catch (error) {
    console.log('Add comment error:', error);
    return c.json({ error: 'Failed to add comment' }, 500);
  }
});

// Get comments for a bug - public endpoint
app.get("/make-server-8b6272cb/bugs/:bugId/comments", async (c) => {
  try {
    const bugId = c.req.param('bugId');
    const commentsKey = `comments:bug:${bugId}`;
    const comments = await kv.get(commentsKey) || [];
    
    return c.json({ comments });
  } catch (error) {
    console.log('Get comments error:', error);
    return c.json({ error: 'Failed to get comments' }, 500);
  }
});

// Update bug status - requires auth
app.patch("/make-server-8b6272cb/bugs/:bugId/status", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    const bugId = c.req.param('bugId');
    const { status } = await c.req.json();
    
    if (!['open', 'closed', 'in-progress'].includes(status)) {
      return c.json({ error: 'Invalid status' }, 400);
    }
    
    // Get all bugs
    const bugsKey = 'bugs:all';
    const bugs = await kv.get(bugsKey) || [];
    
    // Update bug status
    const updatedBugs = bugs.map(bug => {
      if (bug.id === bugId) {
        return { ...bug, status, updatedAt: new Date().toISOString() };
      }
      return bug;
    });
    
    await kv.set(bugsKey, updatedBugs);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Update bug status error:', error);
    return c.json({ error: 'Failed to update bug status' }, 500);
  }
});

Deno.serve(app.fetch);