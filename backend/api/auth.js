// api/auth.js
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs/promises';

const router = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Authentication endpoints
router.post('/callback/credentials', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Read users from JSON file
    const usersPath = join(__dirname, '..', 'json-files', 'users.json');
    const usersData = await fs.readFile(usersPath, 'utf8');
    const users = JSON.parse(usersData);
    
    // Find user
    const user = users.find(u => 
      u.username === username && 
      u.password === password
    );
    
    if (user) {
      // Create a session (simple implementation)
      req.session = req.session || {};
      req.session.user = {
        id: user.id,
        name: user.name,
        username: user.username,
        userType: user.userType
      };
      
      // Store in session
      res.cookie('user', JSON.stringify(req.session.user), { 
        maxAge: 24 * 60 * 60 * 1000, // 1 day
        httpOnly: false // Make it accessible to client JS
      });
      
      return res.status(200).json({ 
        user: req.session.user
      });
    }
    
    return res.status(401).json({ error: 'Invalid credentials' });
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
});

// Get session info
router.get('/session', (req, res) => {
  // Get the user from cookie
  const userCookie = req.cookies?.user;
  
  if (userCookie) {
    try {
      const user = JSON.parse(userCookie);
      return res.status(200).json({ user });
    } catch (e) {
      console.error('Error parsing user cookie:', e);
    }
  }
  
  return res.status(401).json({ error: 'No active session' });
});

export default router;