# Honeypoty

A mix between social media and spam folder. Honeypoty creates a honeycomb of email spaces, where each cell represents a unique email address space that appears when new emails are detected.

## Features

- **Honeycomb UI**: Visual honeycomb layout where each cell represents an email space
- **Email Spaces**: Each new email address creates a new cell in the honeycomb
- **Auto-expiration**: Spaces automatically deactivate after 180 days of inactivity
- **Email Integration**: Click on cells to open your email client with the address
- **MySQL Backend**: Stores all incoming emails organized by email address

## Setup

### Prerequisites

- Node.js (v14 or higher)
- MySQL (v5.7 or higher)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/eggermann/honeypoty.git
cd honeypoty
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:

Create a MySQL database and run the schema:
```bash
mysql -u root -p < database/schema.sql
```

4. Configure environment variables:

Copy the example environment file and update with your database credentials:
```bash
cp .env.example .env
```

Edit `.env` and set your database configuration:
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=honeypoty
PORT=3000
```

### Running the Application

Start the server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

## Usage

### Frontend

- Visit `http://localhost:3000` to see the honeycomb interface
- The first cell shows `start@honeypoty.de` (the initial email space)
- Click on any active cell to open your email client with that address
- New cells appear automatically when new email addresses are detected

### API Endpoints

#### Get Active Spaces
```
GET /api/spaces
```
Returns all active email spaces (not older than 180 days).

#### Create a Space
```
POST /api/spaces
Content-Type: application/json

{
  "email": "example@honeypoty.de"
}
```

#### Receive Incoming Email
```
POST /api/emails/incoming
Content-Type: application/json

{
  "sender": "sender@example.com",
  "recipient": "space@honeypoty.de",
  "subject": "Email Subject",
  "body": "Email Body"
}
```

#### Get Emails for a Space
```
GET /api/spaces/:email/emails
```

#### Cleanup Old Spaces
```
POST /api/cleanup
```
Deactivates spaces older than 180 days.

## Testing

You can test the API endpoints using curl:

```bash
# Get all active spaces
curl http://localhost:3000/api/spaces

# Send a test email to create a new space
curl -X POST http://localhost:3000/api/emails/incoming \
  -H "Content-Type: application/json" \
  -d '{
    "sender": "test@example.com",
    "recipient": "newspace@honeypoty.de",
    "subject": "Test Email",
    "body": "This is a test"
  }'

# Get emails for a space
curl http://localhost:3000/api/spaces/newspace@honeypoty.de/emails
```

## Architecture

### Frontend
- **HTML/CSS/JS**: Pure vanilla JavaScript for the honeycomb interface
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Updates**: Polls for new spaces every 30 seconds
- **Hexagonal Layout**: CSS clip-path for true honeycomb cells

### Backend
- **Express.js**: REST API server
- **MySQL**: Database for storing emails and spaces
- **Auto-cleanup**: Hourly job to deactivate old spaces
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Security**: Environment-based configuration, prepared statements

### Database Schema

**email_spaces**
- `id`: Primary key
- `email`: Unique email address
- `created_at`: When the space was created
- `last_activity`: Last time an email was received
- `is_active`: Whether the space is currently active

**emails**
- `id`: Primary key
- `space_id`: Foreign key to email_spaces
- `sender_email`: Email address of the sender
- `subject`: Email subject
- `body`: Email body
- `received_at`: When the email was received

## How It Works

1. **Initial State**: Application starts with one honeycomb cell showing "start@honeypoty.de"
2. **Email Reception**: When an email is sent to the `/api/emails/incoming` endpoint with a new recipient address, a new space is created
3. **Space Creation**: Each new email address gets its own cell in the honeycomb
4. **Visual Feedback**: Active cells are highlighted and clickable
5. **Email Client**: Clicking a cell opens your default email client with a mailto: link
6. **Auto-expiration**: Spaces without activity for 180 days are automatically deactivated
7. **Cleanup**: Hourly background job removes old spaces from the active honeycomb

## Integration

To integrate Honeypoty with an email server, configure your mail server to forward incoming emails to the API endpoint:

```bash
POST http://your-server:3000/api/emails/incoming
Content-Type: application/json

{
  "sender": "sender@example.com",
  "recipient": "space@honeypoty.de",
  "subject": "Email Subject",
  "body": "Email Body"
}
```

## License

ISC
