# 🔐 JssConnect — Authentication Architecture Flow

> A complete visual reference for all authentication paths in the system.

---

## 📋 Overview

JssConnect has **three distinct authentication tiers**:

| Tier | Actor | Method | Token Role |
|---|---|---|---|
| **1** | Student / User | Email + Password + OTP | `user` / `faculty` |
| **2** | Google OAuth | Google Sign-In | `user` (auto-verified) |
| **3** | Supreme Developer | Master Creds + Email OTP + WebAuthn Biometric | `supreme_developer` |

---

## 🗂️ Flow 1 — Standard Registration & Email Verification

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend
    participant BE as Backend (Express)
    participant DB as MongoDB
    participant Mail as Mail Service

    U->>FE: Fill registration form<br/>(username, email, password, role)
    FE->>BE: POST /api/auth/register
    BE->>DB: Check if email/username exists
    DB-->>BE: Exists? → 400 Error
    DB-->>BE: Not found → proceed

    BE->>BE: bcrypt.hash(password, 10)
    BE->>DB: userModel.create({ username, email, hashedPassword, role })
    BE->>BE: Generate 6-digit OTP
    BE->>DB: otpModel.create({ email, otp, type: 'email_verification' })
    BE->>Mail: sendEmail(OTP verification email)
    Mail-->>U: 📧 Email with OTP code

    BE-->>FE: 201 { message: "Registered. Verify your email." }

    U->>FE: Enter OTP from email
    FE->>BE: POST /api/auth/verify-otp { email, otp }
    BE->>DB: otpModel.findOne({ email, type: 'email_verification' })
    DB-->>BE: OTP doc found?

    alt OTP not found or expired
        BE-->>FE: 400 "OTP expired or not found"
    else OTP mismatch
        BE-->>FE: 401 "Invalid OTP"
    else OTP valid ✅
        BE->>DB: user.verified = true → save()
        BE->>DB: otpModel.deleteMany({ email, type: 'email_verification' })
        BE-->>FE: 200 "Email verified successfully"
        FE->>U: ✅ Redirect to Login
    end
```

---

## 🗂️ Flow 2 — Standard Login

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend
    participant BE as Backend (Express)
    participant DB as MongoDB

    U->>FE: Enter email + password
    FE->>BE: POST /api/auth/login { email, password }

    BE->>DB: userModel.findOne({ email })
    DB-->>BE: User not found? → 409 Error
    DB-->>BE: User found → proceed

    BE->>BE: Check user.verified
    alt Not verified
        BE-->>FE: 403 "Please verify your email first"
    end

    BE->>BE: Check user.password exists
    alt No password (Google-only user)
        BE-->>FE: 403 "Log in with Google or set a password"
    end

    BE->>BE: bcrypt.compare(password, user.password)
    alt Wrong password
        BE-->>FE: 409 "Wrong password"
    else Password correct ✅
        BE->>BE: jwt.sign({ id, email }, JWT_SECRET, { expiresIn: '7d' })
        BE->>FE: Set-Cookie: token=JWT (httpOnly, SameSite=lax)
        BE-->>FE: 200 "User logged in successfully"
        FE->>U: ✅ Access granted → Dashboard
    end
```

---

## 🗂️ Flow 3 — Google OAuth Login

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend
    participant BE as Backend (Express)
    participant G as Google OAuth
    participant DB as MongoDB

    U->>FE: Click "Sign in with Google"
    FE->>BE: GET /api/auth/google
    BE->>G: Redirect to Google consent screen
    G-->>U: Google Login UI
    U->>G: Authorize
    G->>BE: Callback → GET /api/auth/google/callback<br/>with user profile { email, id, displayName, photo }

    BE->>DB: userModel.findOne({ email })

    alt New User (first time Google login)
        BE->>DB: userModel.create({<br/>  username, email, googleId,<br/>  profilePicture, verified: true<br/>})
        BE->>BE: jwt.sign({ id, email }, JWT_SECRET, '7d')
        BE->>FE: Set-Cookie: token=JWT
        BE->>FE: Redirect → /set-password?id=<userId>
        FE->>U: 🔑 Prompt to set a password (optional)
    else Existing User (email match, no googleId)
        BE->>DB: alreadyUser.googleId = Google_id<br/>alreadyUser.verified = true → save()
        BE->>BE: jwt.sign({ id, email }, JWT_SECRET, '7d')
        BE->>FE: Set-Cookie: token=JWT (7-day expiry)
        BE->>FE: Redirect → / (home)
        FE->>U: ✅ Access granted
    else Returning Google User
        BE->>BE: jwt.sign({ id, email }, JWT_SECRET, '7d')
        BE->>FE: Set-Cookie: token=JWT (7-day expiry)
        BE->>FE: Redirect → / (home)
        FE->>U: ✅ Access granted
    end
```

---

## 🗂️ Flow 4 — Forgot Password / Reset

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend
    participant BE as Backend (Express)
    participant DB as MongoDB
    participant Mail as Mail Service

    U->>FE: Click "Forgot Password", enter email
    FE->>BE: POST /api/auth/forgot-password { email }

    BE->>DB: userModel.findOne({ email })
    alt User not found
        BE-->>FE: 404 "No account with this email"
    else Email not verified
        BE-->>FE: 403 "Verify email before resetting"
    else User valid ✅
        BE->>BE: Generate 6-digit OTP
        BE->>DB: otpModel.deleteMany({ email, type: 'password_reset' })
        BE->>DB: otpModel.create({ email, otp, type: 'password_reset' })
        BE->>Mail: sendEmail(password reset OTP + reset link)
        Mail-->>U: 📧 Email with OTP + reset link
        BE-->>FE: 200 "Reset OTP sent"
    end

    U->>FE: Enter OTP + new password
    FE->>BE: POST /api/auth/reset-password { email, otp, password }
    BE->>DB: otpModel.findOne({ email, type: 'password_reset' })

    alt OTP invalid or expired
        BE-->>FE: 400 "Invalid or expired OTP"
    else Same as old password
        BE-->>FE: 400 "New password cannot be same as old"
    else All valid ✅
        BE->>BE: bcrypt.hash(newPassword, 10)
        BE->>DB: user.password = hashedPassword → save()
        BE->>DB: otpModel.deleteMany({ email, type: 'password_reset' })
        BE-->>FE: 200 "Password reset successfully"
        FE->>U: ✅ Redirect to Login
    end
```

---

## 🗂️ Flow 5 — Auth Middleware (Protected Routes)

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend
    participant MW as authMiddleware
    participant DB as MongoDB
    participant C as Protected Controller

    U->>FE: Request protected resource
    FE->>MW: HTTP Request (with cookie: token=JWT)

    MW->>MW: Extract token from req.cookies.token

    alt No token
        MW-->>FE: 401 "Unauthorized. Please log in."
    else Token found
        MW->>DB: blacklistModel.findOne({ token })
        alt Token is blacklisted (logged out)
            MW-->>FE: 401 "Session expired. Please log in again."
        else Not blacklisted
            MW->>MW: jwt.verify(token, JWT_SECRET)
            alt TokenExpiredError
                MW-->>FE: 401 "Session expired. Please log in again."
            else Invalid token
                MW-->>FE: 401 "Invalid token. Please log in."
            else Valid Token ✅
                MW->>MW: req.user = decoded { id, email, role }
                MW->>C: next() → pass to controller
                C-->>FE: 200 Protected data
                FE->>U: ✅ Resource delivered
            end
        end
    end
```

---

## 🗂️ Flow 6 — Logout

```mermaid
sequenceDiagram
    actor U as User (Browser)
    participant FE as Frontend
    participant BE as Backend (Express)
    participant DB as MongoDB

    U->>FE: Click Logout
    FE->>BE: POST /api/auth/logout (with cookie: token=JWT)

    BE->>BE: Extract token = req.cookies.token
    alt No token
        BE-->>FE: 400 "No active session found"
    else Token exists
        BE->>DB: blacklistModel.create({ token })
        BE->>FE: clearCookie("token")
        BE-->>FE: 200 "Logout successful"
        FE->>U: ✅ Redirected to Login
    end
```

---

## 🗂️ Flow 7 — Supreme Developer Auth (WebAuthn Biometric)

> This is the highest-privilege authentication tier. It uses a 3-factor flow:
> **Master Credentials → Email OTP → Hardware Biometric (WebAuthn)**

### Phase A — Developer Registration (One-time Passkey Enrollment)

```mermaid
sequenceDiagram
    actor D as Developer (Browser)
    participant FE as Frontend (/system-override)
    participant BE as Backend (Express)
    participant DB as MongoDB
    participant Mail as Mail Service
    participant WA as WebAuthn API (Browser)

    D->>FE: Enter devId + devPassword + email
    FE->>BE: POST /dev/send-otp { email, devId, devPassword }
    BE->>BE: Validate Master Credentials<br/>(MASTER_DEV_ID + MASTER_DEV_PASSWORD)
    alt Invalid credentials
        BE-->>FE: 403 "Invalid master credentials. Registration blocked."
    else Valid ✅
        BE->>BE: Generate 6-digit OTP
        BE->>DB: otpModel.create({ email, otp, type: 'developer_registration' })
        BE->>Mail: sendEmail(Developer OTP)
        Mail-->>D: 📧 Developer Verification OTP
        BE-->>FE: 200 "Verification OTP sent"
    end

    D->>FE: Enter OTP received
    FE->>BE: POST /dev/register/generate { email, devId, devPassword, otp }
    BE->>BE: Re-validate Master Credentials
    BE->>DB: otpModel.findOne({ email, type: 'developer_registration' })
    alt OTP invalid
        BE-->>FE: 401 "Invalid or expired Verification Code"
    else Valid ✅
        BE->>DB: developerModel.findOrCreate({ email })
        BE->>BE: generateRegistrationOptions({<br/>  rpID: 'localhost',<br/>  authenticatorAttachment: 'platform'<br/>})
        BE->>DB: developer.currentChallenge = challenge → save()
        BE->>DB: otpModel.deleteMany({ email, type: 'developer_registration' })
        BE-->>FE: WebAuthn Registration Options (challenge)
    end

    FE->>WA: navigator.credentials.create(options)
    WA->>D: 🖐️ Prompt biometric (Touch ID / Face ID)
    D->>WA: Authenticate on device
    WA-->>FE: Signed credential response

    FE->>BE: POST /dev/register/verify { email, data: credentialResponse }
    BE->>DB: developerModel.findOne({ email })
    BE->>BE: verifyRegistrationResponse({<br/>  response, expectedChallenge,<br/>  expectedOrigin, expectedRPID<br/>})

    alt Verification failed
        BE-->>FE: 400 "WebAuthn verification error"
    else Verified ✅
        BE->>DB: developer.passkeys.push({<br/>  credentialID, credentialPublicKey,<br/>  counter, transports<br/>})
        BE->>DB: developer.currentChallenge = null → save()
        BE-->>FE: 200 { verified: true }
        FE->>D: ✅ Biometric passkey registered!
    end
```

### Phase B — Developer Login (Biometric Authentication)

```mermaid
sequenceDiagram
    actor D as Developer (Browser)
    participant FE as Frontend (/system-override)
    participant BE as Backend (Express)
    participant DB as MongoDB
    participant WA as WebAuthn API (Browser)

    D->>FE: Enter developer email
    FE->>BE: GET /dev/auth/generate?email=<email>
    BE->>DB: developerModel.findOne({ email })
    alt No passkeys registered
        BE-->>FE: 400 "User has no passkeys"
    else Passkeys found ✅
        BE->>BE: generateAuthenticationOptions({<br/>  rpID, allowCredentials: passkeys<br/>})
        BE->>DB: developer.currentChallenge = challenge → save()
        BE-->>FE: WebAuthn Authentication Options
    end

    FE->>WA: navigator.credentials.get(options)
    WA->>D: 🖐️ Prompt biometric (Touch ID / Face ID)
    D->>WA: Authenticate on device
    WA-->>FE: Signed assertion response

    FE->>BE: POST /dev/auth/verify { email, data: assertionResponse }
    BE->>DB: developerModel.findOne({ email })
    BE->>DB: Find matching passkey by credentialID
    BE->>BE: verifyAuthenticationResponse({<br/>  response, expectedChallenge,<br/>  credentialPublicKey, counter<br/>})

    alt Signature invalid
        BE-->>FE: 401 "Cryptographic signature validation failed. Access Denied."
    else Verified ✅
        BE->>DB: passkey.counter = newCounter → save()<br/>(Prevents replay attacks)
        BE->>DB: developer.currentChallenge = null → save()
        BE->>BE: jwt.sign({<br/>  id, email,<br/>  role: 'supreme_developer'<br/>}, JWT_SECRET, '7d')
        BE->>FE: Set-Cookie: token=JWT (httpOnly, 7d)
        BE-->>FE: 200 "Supreme Power Context established."
        FE->>D: ✅ Supreme Developer Dashboard
    end
```

---

## 🗂️ Flow 8 — Developer Creates Faculty / Admin Account

```mermaid
sequenceDiagram
    actor D as Developer (Browser)
    participant FE as Frontend
    participant BE as Backend (Express)
    participant DB as MongoDB
    participant WA as WebAuthn API (Browser)

    Note over D,BE: Developer must re-authenticate<br/>biometrically to create staff accounts

    D->>FE: Fill new faculty details + trigger biometric re-auth
    FE->>BE: GET /dev/auth/generate?email=<devEmail>
    BE-->>FE: WebAuthn challenge options

    FE->>WA: navigator.credentials.get(options)
    WA->>D: 🖐️ Biometric prompt
    D->>WA: Authenticate
    WA-->>FE: Signed assertion

    FE->>BE: POST /dev/faculty/register {<br/>  email: devEmail,<br/>  data: assertionResponse,<br/>  newFacultyData: { role, fullname, newEmail, contact, password }<br/>}

    BE->>DB: developerModel.findOne({ email })
    BE->>BE: verifyAuthenticationResponse(...)

    alt Biometric invalid
        BE-->>FE: 401 "Cryptographic signature validation failed"
    else Verified ✅
        BE->>DB: passkey.counter updated (anti-replay)
        BE->>DB: userModel.findOne({ email: newEmail })
        alt Email already registered
            BE-->>FE: 400 "Email already registered"
        else New email ✅
            BE->>BE: bcrypt.hash(password, 10)
            BE->>DB: userModel.create({<br/>  username, email, hashedPassword,<br/>  role, verified: true ← bypasses OTP<br/>})
            BE-->>FE: 200 "Faculty/Admin account created"
            FE->>D: ✅ Staff account created!
        end
    end
```

---

## 🏗️ System Architecture Overview

```mermaid
graph TB
    subgraph Client["🖥️ Client Layer"]
        Browser["Browser / Frontend (React)"]
    end

    subgraph Auth["🔐 Auth Gateway"]
        direction TB
        MW["authMiddleware\nJWT Verify + Blacklist Check"]
    end

    subgraph Controllers["⚙️ Controllers"]
        AC["auth.controller.js\n(Register, Login, OTP, Google, Logout,\nForgot/Reset Password, GetMe)"]
        DC["developer.controller.js\n(Master Auth, WebAuthn Register/Login,\nFaculty Create)"]
    end

    subgraph Services["🛠️ Services"]
        Mail["mail.service.js\n(Nodemailer / SMTP)"]
        WebAuthn["@simplewebauthn/server\n(Passkey Verify)"]
        Google["Passport.js\nGoogle OAuth 2.0"]
        BCrypt["bcryptjs\n(Password Hashing)"]
        JWT["jsonwebtoken\n(Token Sign/Verify)"]
    end

    subgraph Database["🗄️ MongoDB (Mongoose)"]
        UserM["user.model.js\n{ username, email, password, googleId,\nverified, role, profilePicture }"]
        DevM["developer.model.js\n{ email, passkeys[], currentChallenge }"]
        OtpM["otp.model.js\n{ email, otp, type, expiresAt }"]
        BlackM["blacklist.model.js\n{ token, createdAt }"]
    end

    Browser -->|"HTTP + Cookie"| MW
    MW -->|"Valid token → next()"| Controllers
    MW -->|"Check blacklist"| BlackM

    AC --> Mail
    AC --> BCrypt
    AC --> JWT
    AC --> Google
    AC --> UserM
    AC --> OtpM
    AC --> BlackM

    DC --> WebAuthn
    DC --> JWT
    DC --> Mail
    DC --> DevM
    DC --> OtpM
    DC --> UserM
```

---

## 🔑 Key Security Properties

| Property | Mechanism |
|---|---|
| **Password Storage** | `bcrypt` with salt rounds = 10 |
| **Session Tokens** | HTTP-only, Secure, SameSite=lax cookies |
| **Token Revocation** | Blacklist model (invalidates JWTs on logout) |
| **Email Verification** | 6-digit OTP with 5-min TTL, max 3 resends |
| **Password Reset** | Separate OTP type (`password_reset`) |
| **Developer Identity** | 3-factor: Master Creds + Email OTP + WebAuthn |
| **Biometric Replay Attack Prevention** | WebAuthn counter incremented on every auth |
| **Passkey Storage** | `credentialPublicKey` stored as base64url in DB |
| **Faculty Provisioning** | Requires live biometric re-verification, bypasses OTP |
