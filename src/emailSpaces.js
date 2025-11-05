const { getPool } = require('./database');

// Get all active email spaces (not older than 180 days without activity)
async function getActiveSpaces() {
    const pool = getPool();
    const [rows] = await pool.query(`
        SELECT id, email, created_at, last_activity, is_active
        FROM email_spaces
        WHERE is_active = TRUE 
        AND last_activity >= DATE_SUB(NOW(), INTERVAL 180 DAY)
        ORDER BY created_at ASC
    `);
    return rows;
}

// Get all spaces (including inactive ones for admin purposes)
async function getAllSpaces() {
    const pool = getPool();
    const [rows] = await pool.query(`
        SELECT id, email, created_at, last_activity, is_active
        FROM email_spaces
        ORDER BY created_at ASC
    `);
    return rows;
}

// Get space by email
async function getSpaceByEmail(email) {
    const pool = getPool();
    const [rows] = await pool.query(
        'SELECT id, email, created_at, last_activity, is_active FROM email_spaces WHERE email = ?',
        [email]
    );
    return rows[0] || null;
}

// Create a new email space
async function createSpace(email) {
    const pool = getPool();
    try {
        const [result] = await pool.query(
            'INSERT INTO email_spaces (email, is_active) VALUES (?, TRUE)',
            [email]
        );
        return getSpaceById(result.insertId);
    } catch (error) {
        if (error.code === 'ER_DUP_ENTRY') {
            // Space already exists, return it
            return getSpaceByEmail(email);
        }
        throw error;
    }
}

// Get space by ID
async function getSpaceById(id) {
    const pool = getPool();
    const [rows] = await pool.query(
        'SELECT id, email, created_at, last_activity, is_active FROM email_spaces WHERE id = ?',
        [id]
    );
    return rows[0] || null;
}

// Update space activity timestamp
async function updateSpaceActivity(spaceId) {
    const pool = getPool();
    await pool.query(
        'UPDATE email_spaces SET last_activity = NOW() WHERE id = ?',
        [spaceId]
    );
}

// Deactivate spaces older than 180 days
async function deactivateOldSpaces() {
    const pool = getPool();
    const [result] = await pool.query(`
        UPDATE email_spaces 
        SET is_active = FALSE 
        WHERE last_activity < DATE_SUB(NOW(), INTERVAL 180 DAY) 
        AND is_active = TRUE
    `);
    return result.affectedRows;
}

module.exports = {
    getActiveSpaces,
    getAllSpaces,
    getSpaceByEmail,
    createSpace,
    getSpaceById,
    updateSpaceActivity,
    deactivateOldSpaces
};
