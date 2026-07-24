# LegalLink Pakistan - API & WebSocket System Documentation

Welcome to the API Documentation for the LegalLink Pakistan FYP. This document details all available HTTP endpoints, middleware protection, and Socket.io events for real-time communication.

---

## 1. Authentication & Profile Routes (`/api/auth`)

These routes handle user registration, logins, OTP management, and profile updates.

### POST `/api/auth/register`
- **Description**: Registers a new user (Client or Lawyer). Supporting profile pictures or licenses.
- **Content-Type**: `multipart/form-data`
- **Fields**:
  - `name`: string
  - `email`: string
  - `phone`: string
  - `password`: string
  - `role`: `'Client'` or `'Lawyer'`
  - `profilePic` *(Optional)*: File (Image)
  - `licensePic` *(Optional)*: File (Image - required for Lawyers)
- **Response**: `201 Created`

### POST `/api/auth/login`
- **Description**: Authenticates a Client or Lawyer.
- **Fields**: `email`, `password`
- **Response**: `200 OK` with token and user profile object.

### GET `/api/auth/lawyers`
- **Description**: Returns all approved lawyers in the database.
- **Response**: `200 OK` (Array of lawyers).

### PUT `/api/auth/profile/update` *(Protected)*
- **Description**: Updates fields in the active user's profile.
- **Headers**: `Authorization: Bearer <token>`
- **Response**: `200 OK`

### PUT `/api/auth/profile/update-password` *(Protected)*
- **Description**: Changes the active user's password.
- **Headers**: `Authorization: Bearer <token>`
- **Fields**: `oldPassword`, `newPassword`
- **Response**: `200 OK`

---

## 2. Booking & Payment Routes (`/api/bookings`)

These endpoints manage client bookings, payment intents via Stripe, status transitions, and reviews.

### POST `/api/bookings/create` *(Protected)*
- **Description**: Initiates a scheduled booking request from Client to Lawyer.
- **Headers**: `Authorization: Bearer <token>`
- **Fields**: `lawyerId`, `date`, `timeSlot`, `consultationFee`
- **Response**: `201 Created`

### POST `/api/bookings/create-instant-chat` *(Protected)*
- **Description**: Requests an instant chat booking with a Lawyer.
- **Headers**: `Authorization: Bearer <token>`
- **Fields**: `lawyerId`
- **Response**: `201 Created`

### GET `/api/bookings/my-bookings` *(Protected)*
- **Description**: Returns bookings associated with the current Client.
- **Response**: `200 OK` (Array of bookings).

### GET `/api/bookings/status/:bookingId` *(Protected)*
- **Description**: Fetches the status of a specific booking with full detail mapping.
- **Response**: `200 OK`

### PUT `/api/bookings/lawyer/update-status/:bookingId` *(Protected)*
- **Description**: Updates the booking status (e.g. `'accepted'`, `'rejected'`).
- **Fields**: `status`
- **Response**: `200 OK`

### POST `/api/bookings/payment/intent` *(Protected)*
- **Description**: Generates a Stripe Payment Intent client secret for Stripe payment.
- **Fields**: `amount` *(in cents)*, `bookingId`
- **Response**: `200 OK` with `{ clientSecret }`

### PUT `/api/bookings/confirm-payment/:bookingId` *(Protected)*
- **Description**: Confirms that Stripe payment succeeded and updates booking status to `'confirmed'`.
- **Response**: `200 OK`

---

## 3. Admin Routes (`/api/admin`)

Used for administration panel controls, metrics, and listing pending lawyers.

### POST `/api/admin/login`
- **Description**: Triggers Admin login process and dispatches OTP code.
- **Fields**: `email`, `adminKey`
- **Response**: `200 OK`

### POST `/api/admin/verify-otp`
- **Description**: Verifies Admin OTP to issue JWT.
- **Fields**: `email`, `otp`
- **Response**: `200 OK` (Admin token)

### GET `/api/admin/stats` *(Protected)*
- **Description**: Returns platform stats (Total Users, Earnings, and Complaints).
- **Response**: `200 OK`

### GET `/api/admin/pending-lawyers` *(Protected)*
- **Description**: Retrieves lawyers awaiting approval.
- **Response**: `200 OK`

### POST `/api/admin/update-status` *(Protected)*
- **Description**: Approves or rejects a lawyer license.
- **Fields**: `lawyerId`, `status` (`'approved'` or `'rejected'`)
- **Response**: `200 OK`

---

## 4. AI Legal Assistant Routes (`/api/ai`)

Provides interactive legal chatbot and image generation workflows powered by Google Gemini & OpenAI.

### POST `/api/ai/ask` *(Protected)*
- **Description**: Sends a query to the Legal AI assistant.
- **Fields**: `message`
- **Response**: `200 OK` with AI answer text.

### POST `/api/ai/generate-image` *(Protected)*
- **Description**: Generates legal or user-defined images.
- **Fields**: `prompt`
- **Response**: `200 OK`

---

## 5. Complaint Management Routes (`/api/complaints`)

Users can submit evidence files against fraudulent conduct, which admins review.

### POST `/api/complaints/submit` *(Protected)*
- **Description**: File a complaint against another party.
- **Content-Type**: `multipart/form-data`
- **Fields**: `targetId`, `reason`, `description`, `evidence` *(File, max 5MB)*
- **Response**: `201 Created`

### GET `/api/complaints/my-complaints` *(Protected)*
- **Description**: Retrieves complaints filed by the active user.
- **Response**: `200 OK`

---

## 6. Real-time WebSockets (Socket.io)

Socket.io enables real-time messaging, WebRTC calling (video/voice), and instant notification broadcasts.

### Events Triggered by Client
- **`registerUser(userId)`**: Registers user socket binding.
- **`joinRoom(bookingId)`**: Joins chatroom for a specific appointment session.
- **`sendMessage(data)`**: Dispatches new text, attachment or voice notes.
  - Payload: `{ bookingId, sender, text, type, fileName, replyTo }`
- **`callUser(data)`**: Initiates real-time WebRTC calling.
  - Payload: `{ userToCall, signalData, from, isVideo, callerName, callerPic, bookingId }`
- **`acceptCall(data)`**: Relays WebRTC signaling acceptance payload.
  - Payload: `{ to, signal }`
- **`ice-candidate(data)`**: Passes ice candidate exchange parameters.
  - Payload: `{ to, candidate }`
- **`callLog(data)`**: Dispatches a call metadata log to write as a system message.

### Events Listened by Client
- **`receiveMessage`**: Receives incoming chat message object.
- **`incomingCall`**: Receives incoming call notification stream.
- **`callAccepted`**: Triggered when the remote party accepts the call.
- **`messageDeleted`**: Syncs live deletion of a chat message.
- **`newNotification`**: Pushes notification indicators instantly.
