import { useState } from "react";
import { Form } from "react-router";
import { SuggestionCard } from "../components/SuggestionCard";
import { AddSuggestionModal } from "../components/AddSuggestionModal";
import { getAllSuggestions } from "../lib/db.server";
import { requireAccessToken } from "../lib/session.server";
import type { Route } from "./+types/_index";

export async function loader({ request }: Route.LoaderArgs) {
  await requireAccessToken(request);
  const suggestions = getAllSuggestions();
  return { suggestions };
}

export default function Index({ loaderData }: Route.ComponentProps) {
  const { suggestions } = loaderData;
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-lg font-bold text-gray-900">
            <span className="text-blue-600">Crush</span>Saver
          </h1>
          <Form method="post" action="/auth/logout">
            <button
              type="submit"
              className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
            >
              Log out
            </button>
          </Form>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-xl mx-auto px-4 py-6">
        {suggestions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">💝</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Your list is empty
            </h2>
            <p className="text-gray-400 text-sm">
              Save Facebook profiles you want to remember.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {suggestions.map((s) => (
              <SuggestionCard key={s.id} suggestion={s} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Add button */}
      <button
        onClick={() => setModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 text-white rounded-full px-5 py-3 shadow-lg hover:bg-blue-700 active:scale-95 transition-all flex items-center gap-2 text-sm font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Facebook profile
      </button>

      {/* Modal */}
      <AddSuggestionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </div>
  );
}
