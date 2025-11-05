require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const { initializeDatabase } = require('./src/database');
const { getActiveSpaces, getAllSpaces, createSpace, deactivateOldSpaces } = require('./src/emailSpaces');
const { saveEmail, getEmailsBySpace } = require('./src/emails');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// API Routes

// Get all active email spaces
app.get('/api/spaces', async (req, res) => {
    try {
        const spaces = await getActiveSpaces();
        const formattedSpaces = spaces.map(space => ({
            email: space.email,
            active: space.is_active,
            isInitial: space.email === 'start@honeypoty.de',
            createdAt: space.created_at,
            lastActivity: space.last_activity
        }));
        res.json(formattedSpaces);
    } catch (error) {
        console.error('Error fetching spaces:', error);
        res.status(500).json({ error: 'Failed to fetch spaces' });
    }
});

// Get all spaces (including inactive)
app.get('/api/spaces/all', async (req, res) => {
    try {
        const spaces = await getAllSpaces();
        res.json(spaces);
    } catch (error) {
        console.error('Error fetching all spaces:', error);
        res.status(500).json({ error: 'Failed to fetch all spaces' });
    }
});

// Create a new email space
app.post('/api/spaces', async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        
        const space = await createSpace(email);
        res.status(201).json({
            email: space.email,
            active: space.is_active,
            createdAt: space.created_at
        });
    } catch (error) {
        console.error('Error creating space:', error);
        res.status(500).json({ error: 'Failed to create space' });
    }
});

// Receive incoming email (webhook endpoint)
app.post('/api/emails/incoming', async (req, res) => {
    try {
        const { sender, recipient, subject, body } = req.body;
        
        if (!sender || !recipient) {
            return res.status(400).json({ error: 'Sender and recipient are required' });
        }
        
        const email = await saveEmail(sender, recipient, subject, body);
        res.status(201).json({
            message: 'Email saved successfully',
            email
        });
    } catch (error) {
        console.error('Error saving email:', error);
        res.status(500).json({ error: 'Failed to save email' });
    }
});

// Get emails for a specific space
app.get('/api/spaces/:email/emails', async (req, res) => {
    try {
        const { email } = req.params;
        const { getSpaceByEmail } = require('./src/emailSpaces');
        
        const space = await getSpaceByEmail(email);
        if (!space) {
            return res.status(404).json({ error: 'Space not found' });
        }
        
        const emails = await getEmailsBySpace(space.id);
        res.json(emails);
    } catch (error) {
        console.error('Error fetching emails:', error);
        res.status(500).json({ error: 'Failed to fetch emails' });
    }
});

// Cleanup endpoint - deactivate old spaces
app.post('/api/cleanup', async (req, res) => {
    try {
        const deactivated = await deactivateOldSpaces();
        res.json({
            message: 'Cleanup completed',
            deactivatedCount: deactivated
        });
    } catch (error) {
        console.error('Error during cleanup:', error);
        res.status(500).json({ error: 'Failed to perform cleanup' });
    }
});

// Serve index.html for root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Initialize database and start server
async function startServer() {
    try {
        await initializeDatabase();
        console.log('Database initialized successfully');
        
        app.listen(PORT, () => {
            console.log(`Honeypoty server running on port ${PORT}`);
            console.log(`Visit http://localhost:${PORT} to view the application`);
        });
        
        // Run cleanup task every hour
        setInterval(async () => {
            try {
                const deactivated = await deactivateOldSpaces();
                if (deactivated > 0) {
                    console.log(`Deactivated ${deactivated} old spaces`);
                }
            } catch (error) {
                console.error('Error during scheduled cleanup:', error);
            }
        }, 60 * 60 * 1000); // 1 hour
        
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();
