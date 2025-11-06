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

// Get ideas endpoint (requires auth)
app.get("/make-server-8b6272cb/ideas", async (c) => {
  try {
    const userId = await verifyAuth(c.req.header('Authorization'));
    if (!userId) {
      return c.json({ error: 'Unauthorized' }, 401);
    }
    
    // Get user's own ideas
    const userIdeasKey = `ideas:user:${userId}`;
    const userIdeas = await kv.get(userIdeasKey) || [];
    
    // Get shared ideas from all users
    const allKeys = await kv.getByPrefix('ideas:user:');
    const sharedIdeas = allKeys
      .filter(item => item.key !== userIdeasKey)
      .flatMap(item => (item.value as any[]).filter(idea => idea.isShared));
    
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
    
    await kv.set(key, ideas);
    
    return c.json({ success: true });
  } catch (error) {
    console.log('Save ideas error:', error);
    return c.json({ error: 'Failed to save ideas' }, 500);
  }
});

Deno.serve(app.fetch);