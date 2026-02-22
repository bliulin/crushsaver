import { useFetcher } from "react-router";
import { useEffect, useRef, useState } from "react";
import type { Suggestion } from "../lib/db.server";

interface Props {
  suggestion: Suggestion | null;
  onClose: () => void;
}

export function EditSuggestionModal({ suggestion, onClose }: Props) {
  const fetcher = useFetcher<{ error?: string }>();
  const inputRef = useRef<HTMLInputElement>(null);
  const isSubmitting = fetcher.state !== "idle";
  const didSubmitRef = useRef(false);

  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [picture, setPicture] = useState("");
  const [rating, setRating] = useState(0);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  // Populate fields when suggestion changes (modal opens)
  useEffect(() => {
    if (suggestion) {
      setName(suggestion.name);
      setUrl(suggestion.facebook_url);
      setPicture(suggestion.profile_picture ?? "");
      setRating(suggestion.rating ?? 0);
      setTags(suggestion.tags ? JSON.parse(suggestion.tags) : []);
      setTagInput("");
      didSubmitRef.current = false;
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [suggestion]);

  useEffect(() => {
    if (fetcher.state === "submitting") didSubmitRef.current = true;
  }, [fetcher.state]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data && !fetcher.data.error && didSubmitRef.current) {
      didSubmitRef.current = false;
      onClose();
    }
  }, [fetcher.state, fetcher.data, onClose]);

  function addTag() {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
    }
    setTagInput("");
  }

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags(tags.slice(0, -1));
    }
  }

  if (!suggestion) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Edit Profile</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1" aria-label="Close">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <fetcher.Form
          method="post"
          action={`/suggestions/${suggestion.id}/edit`}
          className="space-y-3"
        >
          <input type="hidden" name="rating" value={rating} />
          <input type="hidden" name="tags" value={JSON.stringify(tags)} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facebook Profile URL <span className="text-red-500">*</span>
            </label>
            <input
              name="url"
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              ref={inputRef}
              name="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
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
              value={picture}
              onChange={(e) => setPicture(e.target.value)}
              placeholder="https://..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating
            </label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setRating(i === rating ? 0 : i)}
                  className={`text-2xl leading-none transition-colors ${
                    i <= rating ? "text-yellow-400" : "text-gray-300"
                  } hover:text-yellow-400`}
                  aria-label={`${i} star${i !== 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tags
            </label>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-0.5"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => setTags(tags.filter((t) => t !== tag))}
                      className="hover:text-red-500 leading-none"
                      aria-label={`Remove tag ${tag}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              onBlur={addTag}
              placeholder="Add tag, press Enter"
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
              {isSubmitting ? "Saving…" : "Save"}
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
