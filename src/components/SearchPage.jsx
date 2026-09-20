import { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import BackButton from "./BackButton";
export default function SearchPage() {
  const [query, setQuery] = useState("");

  return (
    <div className="max-w-2xl mx-auto px-6 py-24">
        <BackButton />
      <h1 className="font-display text-2xl font-semibold mb-6 text-center">Search products</h1>

      <div className="relative">
        <SearchIcon
          size={18}
          className="absolute left-4 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for frames, sunglasses..."
          autoFocus
          className="w-full border border-gray-200 rounded-full py-3 pl-11 pr-4 text-sm focus:outline-none focus:border-gray-400"
        />
      </div>

      {query && (
        <p className="mt-6 text-sm text-muted text-center">
          No results found for "{query}" yet — search will connect to the backend soon.
        </p>
      )}
    </div>
  );
}