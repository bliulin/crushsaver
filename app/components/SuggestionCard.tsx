import { useEffect, useRef } from "react";
import { Form } from "react-router";
import type { Suggestion } from "../lib/db.server";

interface Props {
  suggestion: Suggestion;
  onEdit: (suggestion: Suggestion) => void;
}

export function SuggestionCard({ suggestion, onEdit }: Props) {
  const linkRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!linkRef.current || !suggestion.facebook_id) return;
    const ua = navigator.userAgent;
    const id = suggestion.facebook_id;

    if (/android/i.test(ua)) {
      linkRef.current.href = `intent://www.facebook.com/${id}#Intent;scheme=https;package=com.facebook.katana;end`;
    } else if (/iphone|ipad|ipod/i.test(ua)) {
      linkRef.current.href = `fb://profile/${id}`;
    } else {
      linkRef.current.href = suggestion.facebook_url;
    }
  }, [suggestion.facebook_id, suggestion.facebook_url]);

  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
      <a
        ref={linkRef}
        href={suggestion.facebook_url}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0"
      >
        {suggestion.profile_picture ? (
          <img
            src={suggestion.profile_picture}
            alt={suggestion.name}
            className="w-14 h-14 rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-blue-100 flex items-center justify-center text-blue-500 text-xl font-bold">
            {suggestion.name.charAt(0).toUpperCase()}
          </div>
        )}
      </a>

      <div className="flex-1 min-w-0">
        <a
          href={suggestion.facebook_url}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-gray-900 hover:text-blue-600 truncate block"
        >
          {suggestion.name}
        </a>
        <p className="text-sm text-gray-400 truncate">{suggestion.facebook_url}</p>
        {(suggestion.rating ?? 0) > 0 && (
          <div className="flex gap-0.5 mt-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`text-sm leading-none ${i <= (suggestion.rating ?? 0) ? "text-yellow-400" : "text-gray-200"}`}
              >
                ★
              </span>
            ))}
          </div>
        )}
        {(() => {
          const tags: string[] = suggestion.tags ? JSON.parse(suggestion.tags) : [];
          return tags.length > 0 ? (
            <div className="flex flex-wrap gap-1 mt-1">
              {tags.map((tag) => (
                <span key={tag} className="text-xs bg-blue-50 text-blue-600 rounded-full px-2 py-0.5">
                  {tag}
                </span>
              ))}
            </div>
          ) : null;
        })()}
      </div>

      <button
        onClick={() => onEdit(suggestion)}
        className="shrink-0 text-gray-400 hover:text-blue-500 transition-colors p-1"
        aria-label="Edit"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>

      <Form method="post" action={`/suggestions/${suggestion.id}/delete`}>
        <button
          type="submit"
          className="shrink-0 text-gray-400 hover:text-red-500 transition-colors p-1"
          aria-label="Delete"
          onClick={(e) => {
            if (!confirm(`Remove ${suggestion.name} from your list?`)) {
              e.preventDefault();
            }
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </button>
      </Form>
    </div>
  );
}
