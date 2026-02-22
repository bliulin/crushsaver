import { useFetcher } from "react-router";
import { useEffect, useRef, useState } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

function nameFromUrl(rawUrl: string): string {
  try {
    const { pathname, searchParams } = new URL(rawUrl);
    // profile.php?id=123 — no name to derive
    if (pathname === "/profile.php" || searchParams.has("id")) return "";
    const segments = pathname.split("/").filter(Boolean);
    if (!segments.length) return "";
    // /people/Firstname-Lastname/id/ → use the name segment
    const slug = segments[0] === "people" && segments[1] ? segments[1] : segments[0];
    return slug
      .split(/[.\-_]+/)
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
      .join(" ");
  } catch {
    return "";
  }
}

export function AddSuggestionModal({ isOpen, onClose }: Props) {
  const fetcher = useFetcher<{ error?: string }>();
  const urlInputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = fetcher.state !== "idle";
  const didSubmitRef = useRef(false);
  const [name, setName] = useState("");
  const nameEditedRef = useRef(false);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      didSubmitRef.current = false;
      nameEditedRef.current = false;
      setName("");
      setTimeout(() => urlInputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    if (fetcher.state === "submitting") didSubmitRef.current = true;
  }, [fetcher.state]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.error && didSubmitRef.current) {
      didSubmitRef.current = false;
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose]);

  function handleUrlChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (!nameEditedRef.current) {
      setName(nameFromUrl(e.target.value));
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Add Facebook Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <fetcher.Form method="post" action="/suggestions/add" className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook Profile URL <span className="text-red-500">*</span>
            </label>
            <input
              ref={urlInputRef}
              name="url"
              type="url"
              placeholder="https://www.facebook.com/username"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
              onChange={handleUrlChange}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              name="name"
              type="text"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => {
                nameEditedRef.current = true;
                setName(e.target.value);
              }}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Profile Picture URL <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              name="picture"
              type="url"
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {fetcher.data?.error && (
            <p className="text-sm text-red-600">{fetcher.data.error}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
            >
              {isSubmitting ? "Saving…" : "Add Profile"}
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
