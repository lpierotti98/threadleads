'use client';

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
    <div className="bg-white rounded-xl border border-gray-200 p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-gray-600">Source</label>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm bg-white"
        >
          <option value="all">All</option>
          <option value="reddit">Reddit</option>
          <option value="hn">Hacker News</option>
        </select>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <label className="text-sm font-medium text-gray-600 whitespace-nowrap">
          Min score: {minScore}
        </label>
        <input
          type="range"
          min={0}
          max={100}
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="w-32 accent-indigo-600"
        />
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <label className="text-sm font-medium text-gray-600">Keyword</label>
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="Filter by topic..."
          className="border border-gray-300 rounded-lg px-3 py-1.5 text-sm w-full max-w-xs"
        />
      </div>
    </div>
  );
}
