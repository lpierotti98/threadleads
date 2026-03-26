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
    <div
      className="flex flex-col sm:flex-row gap-4 items-start sm:items-center p-4 border"
      style={{ background: 'var(--surface)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: 'var(--text-secondary)' }}>
          src
        </span>
        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="font-mono text-xs px-2 py-1.5 border"
          style={{
            background: 'var(--surface-el)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        >
          <option value="all">all</option>
          <option value="reddit">reddit</option>
          <option value="hn">hn</option>
        </select>
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-widest whitespace-nowrap" style={{ color: 'var(--text-secondary)' }}>
          score &ge;{minScore}
        </span>
        <input
          type="range"
          min={0}
          max={100}
          value={minScore}
          onChange={(e) => setMinScore(Number(e.target.value))}
          className="w-24"
          style={{ accentColor: 'var(--accent)' }}
        />
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        <input
          type="text"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="filter..."
          className="font-mono text-xs px-3 py-1.5 border w-full max-w-[200px]"
          style={{
            background: 'var(--surface-el)',
            borderColor: 'var(--border)',
            color: 'var(--text-primary)',
          }}
        />
      </div>
    </div>
  );
}
