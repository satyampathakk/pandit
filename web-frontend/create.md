# Create Data For The Web Frontend

This project has no admin UI, so the fastest way to see the web UI fully working is to create data through a small backend-driven flow.

## Requirements

- Backend API running at the URL defined in `web-frontend/src/api/config.js`.
- At least one admin account created via `backend/create_admin.py`.

## Create The Minimum Demo Data

1. Create an admin account (backend only).

```powershell
cd backend
python create_admin.py
```

2. Register a pandit (web UI).

- Open the web UI and use the Pandit Registration form on the login page or the `/pandit-onboard` route.
- After registration, the pandit is **not verified** and will not show up in user searches.

3. Verify the pandit (backend API).

- Log in as admin to get a token.
- Approve the new pandit using the admin endpoint.

```bash
# Admin login
curl -X POST http://localhost:8000/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"<admin_username>","password":"<admin_password>"}'

# List pending pandits (use the token returned above)
curl -X GET http://localhost:8000/admin/pandits/pending \
  -H "Authorization: Bearer <admin_token>"

# Approve a pandit by id
curl -X PUT http://localhost:8000/admin/pandits/<pandit_id>/approve \
  -H "Authorization: Bearer <admin_token>"
```

4. Create services (web UI).

- Log in as the verified pandit.
- Go to `Manage Services` and add services using the form or the quick-add buttons.

5. Create a booking (web UI).

- Log in as a user.
- Go to `Services`, pick a service, choose a date, and submit the booking.
- The booking will appear on the `Bookings` page.

## Notes

- Users can only book **verified** pandits.
- Pandits can only manage services after logging in.
- The frontend stores `token` and `user_type` in local storage on login.
