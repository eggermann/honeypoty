const { getPool } = require('./database');
const { getSpaceByEmail, createSpace, updateSpaceActivity } = require('./emailSpaces');

// Save an incoming email
async function saveEmail(senderEmail, recipientEmail, subject = '', body = '') {
    const pool = getPool();
    
    // Get or create space for the recipient email
    let space = await getSpaceByEmail(recipientEmail);
    if (!space) {
        space = await createSpace(recipientEmail);
    }
    
    // Update activity timestamp
    await updateSpaceActivity(space.id);
    
    // Save the email
    const [result] = await pool.query(
        'INSERT INTO emails (space_id, sender_email, subject, body) VALUES (?, ?, ?, ?)',
        [space.id, senderEmail, subject, body]
    );
    
    return {
        id: result.insertId,
        spaceId: space.id,
        senderEmail,
        subject,
        body
    };
}

// Get emails for a specific space
async function getEmailsBySpace(spaceId) {
    const pool = getPool();
    const [rows] = await pool.query(
        'SELECT id, sender_email, subject, body, received_at FROM emails WHERE space_id = ? ORDER BY received_at DESC',
        [spaceId]
    );
    return rows;
}

// Get emails by sender
async function getEmailsBySender(senderEmail) {
    const pool = getPool();
    const [rows] = await pool.query(
        'SELECT id, space_id, subject, body, received_at FROM emails WHERE sender_email = ? ORDER BY received_at DESC',
        [senderEmail]
    );
    return rows;
}

module.exports = {
    saveEmail,
    getEmailsBySpace,
    getEmailsBySender
};
