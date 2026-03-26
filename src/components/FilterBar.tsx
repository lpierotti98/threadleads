'use client';

import { Filter } from 'lucide-react';

interface Props {
  source: string;
  setSource: (v: string) => void;
  minScore: number;
  setMinScore: (v: number) => void;
  keyword: string;
  setKeyword: (v: string) => void;
}

export default function FilterBar({
  source,
  setSource,
  minScore,
  setMinScore,
  keyword,
  setKeyword,
}: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center shadow-sm">
      <div className="flex items-center gap-2 text-gray-400">
        <Filter size={15} />
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
          Source
        </label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        >
          <option value="all">All</option>
          <option value="reddit">Reddit</option>
          <option value="hn">Hacker News</option>
        </select>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap">
          Score {minScore}+
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="w-28 accent-indigo-600"
        />
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Search threads..."
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
