export const metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <h1 className="text-3xl font-bold mb-6">BookNook Privacy Policy</h1>

      <p className="mb-4">
        BookNook is a small online library. This page explains what information
        we collect and how we use it.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Information we collect</h2>
      <p className="mb-4">
        When you register or sign in with Google, we store your name, email
        address and profile photo. We also store the books you add and the
        books you borrow.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">How we use it</h2>
      <p className="mb-4">
        We use this information only to run the website: to sign you in, to show
        who added a book, and to manage your borrowed books.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Sharing</h2>
      <p className="mb-4">
        We do not sell or share your personal information with third parties.
      </p>

      <h2 className="text-xl font-semibold mt-6 mb-2">Contact</h2>
      <p>If you have any question, email us at hridi042@gmail.com.</p>
    </main>
  );
}