# linkedin-bot

Multi-account LinkedIn automation server. Runs on EC2, called by n8n to execute the outreach campaign sequence.

## Files

| File | Purpose |
|------|---------|
| `server.js` | Express + Playwright server — the LinkedIn automation engine |
| `deploy.sh` | One-shot EC2 setup script |
| `linkedin-campaign-workflow.json` | n8n workflow — import this |
| `package.json` | Node dependencies |
| `.env.example` | Environment variable template |

---

## Setup on EC2

### 1. Copy files to EC2
```bash
scp -r ./linkedin-bot ubuntu@YOUR_EC2_IP:~/
```

### 2. SSH and deploy
```bash
ssh ubuntu@YOUR_EC2_IP
cd ~/linkedin-bot
bash deploy.sh
```

### 3. Login both LinkedIn accounts (one-time)
```bash
# Account 1
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"acc1@email.com","password":"pass1","account":"account1"}'

# Account 2
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"acc2@email.com","password":"pass2","account":"account2"}'
```

Sessions saved to `session_account1.json` and `session_account2.json`. Valid ~30 days.

### 4. Verify
```bash
curl http://localhost:3000/health
curl http://localhost:3000/accounts
```

---

## API Reference

All endpoints accept POST with JSON body. Every request requires an `account` field.

### POST /login
```json
{ "email": "...", "password": "...", "account": "account1" }
```

### POST /view-profile
```json
{ "profileUrl": "https://linkedin.com/in/username/", "account": "account1" }
```
Returns: `{ connectionStatus: "not_connected|connected|pending", name: "..." }`

### POST /connect
```json
{ "profileUrl": "...", "note": "Optional 200 char note", "account": "account1" }
```

### POST /message
```json
{ "profileUrl": "...", "message": "Your message", "account": "account1" }
```

### POST /check-reply
```json
{ "profileUrl": "...", "account": "account1" }
```
Returns: `{ replied: true|false }`

### GET /health
Returns all active browser sessions.

### GET /accounts
Lists all saved session files on disk.

---

## n8n Setup

### Import workflow
n8n → Workflows → Import from file → `linkedin-campaign-workflow.json`

### Required changes after import
1. Replace `YOUR_GOOGLE_SHEET_ID` in both Google Sheets nodes
2. Add `ANTHROPIC_API_KEY` to n8n environment variables (Settings → Environment Variables)
3. Connect Google Sheets OAuth credential

### Add new leads
POST to your n8n webhook: `https://YOUR_N8N_URL/webhook/new-lead`

```json
{
  "linkedin_url": "https://linkedin.com/in/username/",
  "name": "Rahul Sharma",
  "headline": "F&O Trader | Nifty Options",
  "company": "Self Employed",
  "account": "account1"
}
```

Claude generates all 5 messages automatically and saves to sheet.

---

## Google Sheet Schema

Create a sheet named `Leads` with these exact column headers:

```
linkedin_url | name | headline | company | account | current_step | status | last_action_at | connect_note | msg_1 | msg_2 | msg_3 | msg_4 | msg_5
```

### Status values
| Status | Meaning |
|--------|---------|
| `active` | In sequence, being processed |
| `replied` | They replied — sequence stopped |
| `ended` | Sequence completed, no reply |
| `failed` | Action failed (check logs) |
| `pending` | Connection request sent, awaiting acceptance |

### Account assignment
- Split leads: `account1` to first half, `account2` to second half
- Each lead stays with same account for entire sequence

---

## Daily Limits

| Action | Per account | Both accounts |
|--------|------------|---------------|
| Connection requests | 20/day | 40/day |
| Messages | 40/day | 80/day |
| Profile views | 80/day | 160/day |

Campaign runs **9am–6pm IST, weekdays only** (built into cron).

---

## PM2 Commands

```bash
pm2 status              # check if running
pm2 logs linkedin-bot   # view logs
pm2 restart linkedin-bot
pm2 stop linkedin-bot
```
