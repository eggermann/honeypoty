// Honeycomb configuration
const INITIAL_EMAIL = 'start@honeypoty.de';
const API_URL = '/api';

// Store email spaces data
let emailSpaces = [];

// Initialize the honeycomb
async function initializeHoneycomb() {
    try {
        // Fetch existing email spaces from backend
        const response = await fetch(`${API_URL}/spaces`);
        if (response.ok) {
            emailSpaces = await response.json();
        }
    } catch (error) {
        console.error('Error fetching spaces:', error);
        // Initialize with default space if API fails
        emailSpaces = [];
    }
    
    // Ensure we always have at least the initial cell
    if (emailSpaces.length === 0) {
        emailSpaces.push({
            email: INITIAL_EMAIL,
            active: true,
            isInitial: true
        });
    }
    
    renderHoneycomb();
}

// Create a hexagon cell
function createHexagonCell(email, isActive, isInitial = false) {
    const hexagon = document.createElement('div');
    hexagon.className = `hexagon ${isActive ? 'active' : 'inactive'}`;
    
    const hexagonInner = document.createElement('div');
    hexagonInner.className = 'hexagon-inner';
    
    const hexagonContent = document.createElement('div');
    hexagonContent.className = 'hexagon-content';
    
    const emailText = document.createElement('div');
    emailText.className = 'email-text';
    emailText.textContent = email;
    
    hexagonContent.appendChild(emailText);
    hexagonInner.appendChild(hexagonContent);
    hexagon.appendChild(hexagonInner);
    
    // Add click handler
    if (isActive) {
        hexagon.addEventListener('click', () => {
            openEmailClient(email);
        });
    }
    
    return hexagon;
}

// Open email client with mailto link
function openEmailClient(email) {
    const mailtoLink = `mailto:${email}`;
    window.location.href = mailtoLink;
}

// Render the honeycomb structure
function renderHoneycomb() {
    const container = document.getElementById('honeycombContainer');
    container.innerHTML = '';
    
    emailSpaces.forEach(space => {
        const cell = createHexagonCell(space.email, space.active, space.isInitial);
        container.appendChild(cell);
    });
}

// Add a new email space (called by backend when new email detected)
async function addEmailSpace(email) {
    try {
        const response = await fetch(`${API_URL}/spaces`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });
        
        if (response.ok) {
            const newSpace = await response.json();
            emailSpaces.push(newSpace);
            renderHoneycomb();
        }
    } catch (error) {
        console.error('Error adding email space:', error);
    }
}

// Poll for updates (check for new spaces)
async function pollForUpdates() {
    try {
        const response = await fetch(`${API_URL}/spaces`);
        if (response.ok) {
            const updatedSpaces = await response.json();
            if (JSON.stringify(updatedSpaces) !== JSON.stringify(emailSpaces)) {
                emailSpaces = updatedSpaces;
                renderHoneycomb();
            }
        }
    } catch (error) {
        console.error('Error polling for updates:', error);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeHoneycomb();
    
    // Poll for updates every 30 seconds
    setInterval(pollForUpdates, 30000);
});
