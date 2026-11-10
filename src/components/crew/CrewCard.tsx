import { Fragment, useId, useState } from "react";
import "./CrewCard.css";

export type CrewCardProps = {
  name: string;
  role: string;
  image?: string;                 // absolute photo URL from the API
  project?: "aethon" | "ebaja" | "team";   // kept for future per-project styling
  cutout?: boolean;               // true = transparent PNG/WebP of the person
};

// shrink text that would overflow: base size scales down past `limit` characters
const fit = (text: string, base: number, limit: number) =>
  `calc(var(--u) * ${(base * Math.min(1, limit / Math.max(text.length, 1))).toFixed(1)})`;

// long roles wrap onto two balanced lines; "&" stays on the first line
function roleLines(role: string): string[] {
  if (role.length <= 15) return [role];
  const tokens: string[] = [];
  role.split(/\s+/).forEach((w) => {
    if (w === "&" && tokens.length) tokens[tokens.length - 1] += " &";
    else tokens.push(w);
  });
  if (tokens.length < 2) return [role];
  let best: { m: number; lines: string[] } | null = null;
  for (let i = 1; i < tokens.length; i++) {
    const a = tokens.slice(0, i).join(" ");
    const b = tokens.slice(i).join(" ");
    const m = Math.max(a.length, b.length);
    if (!best || m < best.m) best = { m, lines: [a, b] };
  }
  return best!.lines;
}

// one line if it fits, otherwise two lines split where the lengths are most even
function nameLines(full: string): string[] {
  if (full.length <= 15) return [full];
  const w = full.split(" ");
  if (w.length < 2) return [full];
  let best = { m: Infinity, lines: [full] as string[] };
  for (let i = 1; i < w.length; i++) {
    const a = w.slice(0, i).join(" ");
    const b = w.slice(i).join(" ");
    const m = Math.max(a.length, b.length);
    if (m < best.m) best = { m, lines: [a, b] };
  }
  return best.lines;
}

export default function CrewCard({ name, role, image, project = "aethon", cutout = false }: CrewCardProps) {
  const gid = useId().replace(/:/g, "");
  const [broken, setBroken] = useState(false);
  const nLines = nameLines(name.trim().toUpperCase().replace(/\s+/g, " "));
  const roleText = role.trim().toUpperCase();
  const lines = roleLines(roleText);
  const longest = lines.reduce((a, b) => (a.length >= b.length ? a : b));
  const showPhoto = !!image && !broken;

  return (
    <div className="cc-wrap">
      <div className="cc-card" data-project={project} role="img" aria-label={`${name}, ${role}`}>
        <svg className="cc-base" viewBox="0 0 735 900" aria-hidden="true">
          <path d="M44 118 C44 92 58 81 86 81 L206 81 L282 21 L616 21 L687 99 L687 717 L536 869 L78 869 C52 869 44 858 44 835 Z" fill="#0c0c13" />
        </svg>

        <div className="cc-layer cc-name-panel" />

        <div className="cc-layer cc-photo">
          <div className={`cc-pbox${showPhoto ? " cc-has" : ""}${cutout ? " cc-cutout" : ""}`}>
            {showPhoto && <img src={image} alt="" onError={() => setBroken(true)} />}
            <div className="cc-pp-box">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="1.6" /><path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
            <div className="cc-pp-text">PHOTO PENDING</div>
          </div>
        </div>

        <div className="cc-layer cc-stat-panel" />

        <div className="cc-mits">MITS MOTORSPORTS</div>
        <div className="cc-flag" />
        {nLines.length === 1 ? (
          <div className="cc-nm cc-f0" style={{ fontSize: fit(nLines[0], 54, 15) }}>{nLines[0]}</div>
        ) : (
          <>
            <div className="cc-nm cc-f1" style={{ fontSize: fit(nLines[0], 54, 15) }}>{nLines[0]}</div>
            <div className="cc-nm cc-f2" style={{ fontSize: fit(nLines[1], 54, 15) }}>{nLines[1]}</div>
          </>
        )}

        <div className="cc-role-tag">ROLE</div>
        <div className="cc-role-value" style={{ fontSize: fit(longest, 40, 15), lineHeight: lines.length > 1 ? 1.15 : 1 }}>
          {lines.map((l, i) => (
            <Fragment key={i}>{i > 0 && <br />}{l}</Fragment>
          ))}
        </div>

        <svg className="cc-overlay" viewBox="0 0 735 900" aria-hidden="true">
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" style={{ stopColor: "var(--accent)" }} />
              <stop offset="1" style={{ stopColor: "var(--accent2)" }} />
            </linearGradient>
          </defs>
          <line x1="625" y1="24" x2="625" y2="386" stroke="#fff" strokeOpacity=".5" strokeWidth="1.6" />
          <path d="M60 641 L644 641 Q652 641 652 649 L652 706 L517 834 L78 834 L60 818 Z" fill="none" stroke="#000" strokeWidth="1.5" strokeOpacity=".35" />
          <path d="M62 132 C62 108 74 99 98 99 L196 99 L268 39 L604 39 L669 112 L669 700 L530 851 L90 851 C70 851 62 840 62 822 Z" fill="none" stroke="#000" strokeWidth="2" strokeOpacity=".45" />
          <path d="M44 118 C44 92 58 81 86 81 L206 81 L282 21 L616 21 L687 99 L687 717 L536 869 L78 869 C52 869 44 858 44 835 Z" fill="none" stroke={`url(#${gid})`} strokeWidth="11" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
