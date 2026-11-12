# BookNook (Client)

BookNook is a small online library. Readers can add books, borrow books from other readers, and return them after reading.

This repository is the **client** (Next.js). The API server is in a separate repository: [booknook-server](https://github.com/hridi61/booknook-server).

## Live links

| | Link |
|---|---|
| Live site | https://booknook-client-lake.vercel.app |
| API server | https://booknook-server-n74t.onrender.com |
| Client repository | https://github.com/hridi61/booknook-client |
| Server repository | https://github.com/hridi61/booknook-server |

> The API runs on a free Render plan and goes to sleep when idle. The first request can take up to a minute while it wakes up.

## Demo account

| | |
|---|---|
| Email | `demo@booknook.com` |
| Password | `Demo@1234` |

You can also create your own account on the Register page, or use Google login.

## Features

- **Home page** with a Swiper hero carousel (autoplay, swipe, dots), the six newest books, a "How borrowing works" section, top categories and a footer.
- **All Books** with cover images, author, available copies and a category filter (`/books?category=Fiction`).
- **Book Details** (login required) with cover, author, description and copies. The **Borrow** button opens a confirmation modal that shows the return date. When no copies are left the button shows **Not Available**.
- **Add Book** with cover image upload (imgbb), description and total copies.
- **My Books** table with View, Edit and Delete (custom delete modal).
- **Edit Book** for title, author, category, description and cover image.
- **My Borrows** table with borrowed date, return date, an Overdue or On time status, and a Return button with a confirmation modal.
- **Profile** page with name, email and avatar.
- **Authentication** with email and password and **Google login** (Better Auth). Private pages redirect logged-out users to Login and send them back after login.
- Toast messages for every action, a custom **404 page**, and a layout that works on mobile.

Only the owner of a book can edit or delete it. Owners cannot borrow their own books, and a user cannot borrow the same book twice.

## Tech stack

- Next.js 16 (App Router), React 19, TypeScript
- Tailwind CSS 4 and daisyUI 5
- Better Auth with the JWT plugin and the MongoDB adapter
- Swiper (hero carousel)
- react-hot-toast
- imgbb (image hosting)
- Server: Express, MongoDB, `jose` (JWT verification)

## Run it locally

Requirements: Node.js 20 or newer and a MongoDB database.

```bash
git clone https://github.com/hridi61/booknook-client.git
cd booknook-client
npm install
```

Create a `.env.local` file in the project root:

```env
BETTER_AUTH_SECRET=<a long random string>
BETTER_AUTH_URL=http://localhost:3000
MONGODB_URI=<your MongoDB connection string>
NEXT_PUBLIC_IMGBB_KEY=<your imgbb API key>
GOOGLE_CLIENT_ID=<your Google OAuth client id>
GOOGLE_CLIENT_SECRET=<your Google OAuth client secret>
```

Then start the app:

```bash
npm run dev
```

Open http://localhost:3000.

To check that a production build works:

```bash
npm run build
```

## Environment variables

| Name | What it is for |
|---|---|
| `BETTER_AUTH_SECRET` | Secret used by Better Auth. Keep the same value everywhere the app uses the same database, because it encrypts the JWT signing keys. |
| `BETTER_AUTH_URL` | The public URL of this app (no trailing slash). |
| `MONGODB_URI` | MongoDB connection string. |
| `NEXT_PUBLIC_IMGBB_KEY` | imgbb API key used for cover image uploads. It is visible in the browser. |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID for Google login. |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret. Keep it private. |

## How the client and the server work together

1. The user logs in through Better Auth on this app.
2. For private requests the client asks Better Auth for a JWT (`authClient.token()`) and sends it as `Authorization: Bearer <token>`.
3. The Express server checks the token against this app's public keys at `/api/auth/jwks` and then reads or writes MongoDB.

## Main routes

| Route | Page | Login needed |
|---|---|---|
| `/` | Home | No |
| `/books` | All Books | No |
| `/books/[id]` | Book Details | Yes |
| `/books/[id]/edit` | Edit Book | Yes |
| `/add-book` | Add Book | Yes |
| `/my-books` | My Books | Yes |
| `/my-borrows` | My Borrows | Yes |
| `/profile` | Profile | Yes |
| `/login`, `/register` | Authentication | No |

## Deployment

- Client: Vercel. Set the six environment variables above (`BETTER_AUTH_URL` must be the Vercel URL).
- Server: Render. Set `AUTH_JWKS_URL` to `<client URL>/api/auth/jwks`.
- Database: MongoDB Atlas, with network access that allows the hosts above.