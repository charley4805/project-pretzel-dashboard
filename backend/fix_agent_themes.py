import os
import re
from pathlib import Path

TARGET_DIR = Path(__file__).resolve().parents[1] / "frontend" / "app" / "admin" / "agents"

REPLACEMENTS = [
    # Backgrounds
    ("bg-[#1c2658]", "bg-slate-900/40"),
    ("bg-[#141B41]", "bg-[#0a0a0a]"),
    ("bg-[#0c1130]", "bg-slate-800/50"),
    ("bg-[#f5f3ff]", "bg-slate-800/50"),
    ("bg-[#ddd6fe]", "bg-slate-800"),
    ("bg-[#452103]", "bg-slate-800"),
    ("bg-[#d1fae5]", "bg-emerald-500/10"),
    ("bg-[#e0f2fe]", "bg-sky-500/10"),
    ("bg-[#fffbeb]", "bg-amber-500/10"),
    ("bg-[#f0f9ff]", "bg-sky-500/10"),
    ("bg-[#fdf2f8]", "bg-pink-500/10"),
    ("bg-[#fee2e2]", "bg-red-500/10"),
    ("bg-[#fef3c7]", "bg-amber-500/10"),
    ("bg-white", "bg-slate-900"),
    ("bg-slate-50", "bg-slate-800/50"),
    ("bg-violet-50", "bg-violet-500/10"),
    ("bg-emerald-50", "bg-emerald-500/10"),
    ("bg-amber-50", "bg-amber-500/10"),
    ("bg-red-50", "bg-red-500/10"),
    ("bg-sky-50", "bg-sky-500/10"),
    ("bg-blue-50", "bg-blue-500/10"),
    ("bg-purple-50", "bg-purple-500/10"),
    ("bg-pink-50", "bg-pink-500/10"),
    ("bg-indigo-50", "bg-indigo-500/10"),
    ("bg-rose-50", "bg-rose-500/10"),
    ("bg-cyan-50", "bg-cyan-500/10"),
    ("bg-teal-50", "bg-teal-500/10"),
    ("bg-orange-50", "bg-orange-500/10"),
    ("bg-lime-50", "bg-lime-500/10"),
    ("bg-fuchsia-50", "bg-fuchsia-500/10"),
    ("bg-gray-50", "bg-gray-800/50"),
    ("bg-neutral-50", "bg-neutral-800/50"),
    ("bg-zinc-50", "bg-zinc-800/50"),
    ("bg-stone-50", "bg-stone-800/50"),
    ("bg-[#f8fafc]", "bg-slate-900"),
    ("bg-[#ffffff]", "bg-slate-900"),

    # Text colors
    ("text-[#141B41]", "text-slate-100"),
    ("text-slate-700", "text-slate-300"),
    ("text-slate-600", "text-slate-400"),
    ("text-slate-800", "text-slate-200"),
    ("text-slate-900", "text-slate-100"),
    ("text-black", "text-white"),
    ("text-[#177E89]", "text-emerald-400"),
    ("text-[#1a919d]", "text-emerald-400"),
    ("text-[#FFC857]", "text-amber-400"),
    ("text-[#0ea5e9]", "text-sky-400"),
    ("text-[#065f46]", "text-emerald-400"),
    ("text-[#64748b]", "text-slate-400"),
    ("text-[#94a3b8]", "text-slate-400"),
    ("text-[#5b21b6]", "text-violet-400"),
    ("text-[#FC814A]", "text-orange-400"),
    ("text-emerald-700", "text-emerald-400"),
    ("text-amber-700", "text-amber-400"),
    ("text-red-700", "text-red-400"),
    ("text-sky-700", "text-sky-400"),
    ("text-violet-700", "text-violet-400"),
    ("text-blue-700", "text-blue-400"),
    ("text-purple-700", "text-purple-400"),
    ("text-pink-700", "text-pink-400"),
    ("text-indigo-700", "text-indigo-400"),
    ("text-rose-700", "text-rose-400"),
    ("text-cyan-700", "text-cyan-400"),
    ("text-teal-700", "text-teal-400"),
    ("text-orange-700", "text-orange-400"),
    ("text-lime-700", "text-lime-400"),
    ("text-fuchsia-700", "text-fuchsia-400"),
    ("text-gray-700", "text-gray-400"),
    ("text-neutral-700", "text-neutral-400"),
    ("text-zinc-700", "text-zinc-400"),
    ("text-stone-700", "text-stone-400"),
    ("text-[#78350f]", "text-amber-400"),
    ("text-[#451a03]", "text-amber-400"),
    ("text-[#b45309]", "text-amber-400"),
    ("text-[#78350f]", "text-amber-400"),

    # Hover text
    ("hover:text-slate-800", "hover:text-slate-200"),
    ("hover:text-slate-700", "hover:text-slate-300"),
    ("hover:text-slate-600", "hover:text-slate-300"),
    ("hover:text-[#141B41]", "hover:text-slate-100"),

    # Borders
    ("border-slate-200", "border-slate-800"),
    ("border-slate-100", "border-slate-800"),
    ("border-[#177E89]", "border-emerald-500"),
    ("border-[#452103]", "border-slate-700"),

    # Hover backgrounds
    ("hover:bg-[#0c1130]", "hover:bg-slate-800/50"),
    ("hover:bg-[#f5f3ff]", "hover:bg-slate-800/50"),
    ("hover:bg-slate-50", "hover:bg-slate-800/50"),
    ("hover:bg-[#141B41]", "hover:bg-slate-900"),
    ("hover:bg-[#1c2658]", "hover:bg-slate-900/40"),
    ("hover:bg-[#177E89]", "hover:bg-emerald-500"),
    ("hover:bg-[#ddd6fe]", "hover:bg-slate-800"),
    ("hover:bg-[#e0f2fe]", "hover:bg-sky-500/10"),
    ("hover:bg-[#d1fae5]", "hover:bg-emerald-500/10"),
    ("hover:bg-[#fffbeb]", "hover:bg-amber-500/10"),
    ("hover:bg-[#fef3c7]", "hover:bg-amber-500/10"),

    # Focus states
    ("focus:ring-[#ddd6fe]", "focus:ring-slate-600"),
    ("focus:border-[#177E89]", "focus:border-emerald-500"),
    ("focus:ring-[#177E89]", "focus:ring-emerald-500"),
    ("focus:ring-sky-400", "focus:ring-sky-500"),
    ("focus:ring-emerald-400", "focus:ring-emerald-500"),
    ("focus:ring-violet-400", "focus:ring-violet-500"),

    # Rings
    ("ring-[#ddd6fe]", "ring-slate-600"),

    # Special button/text combos
    ("bg-[#177E89] text-white", "bg-emerald-600 text-white"),
    ("bg-[#177E89] hover:bg-[#1a919d]", "bg-emerald-600 hover:bg-emerald-500"),
    ("text-[#177E89] hover:text-[#1a919d]", "text-emerald-400 hover:text-emerald-300"),
    ("bg-[#177E89]", "bg-emerald-600"),
    ("bg-[#FFC857]", "bg-amber-500"),
    ("text-[#FFC857]", "text-amber-400"),
    ("bg-[#0ea5e9]", "bg-sky-500"),

    # Gradient fix
    ("bg-gradient-to-b from-slate-50 to-white", "bg-[#0a0a0a]"),
    ("bg-gradient-to-br from-violet-500 to-purple-600", "bg-gradient-to-br from-violet-600 to-purple-700"),

    # Chart tooltip styles
    ("background: 'white'", "background: '#0f172a'"),
    ("background: \"white\"", "background: \"#0f172a\""),
    ("color: '#64748b'", "color: '#94a3b8'"),
    ("color: \"#64748b\"", "color: \"#94a3b8\""),

    # Inline styles
    ("backgroundColor: '#1c2658'", "backgroundColor: '#111827'"),
    ("backgroundColor: '#0c1130'", "backgroundColor: '#1f293b'"),
    ("backgroundColor: '#141B41'", "backgroundColor: '#0a0a0a'"),
    ("backgroundColor: '#ddd6fe'", "backgroundColor: '#334155'"),
    ("backgroundColor: '#f5f3ff'", "backgroundColor: '#1e293b'"),
    ("backgroundColor: '#d1fae5'", "backgroundColor: '#064e3b'"),
    ("backgroundColor: '#e0f2fe'", "backgroundColor: '#0c4a6e'"),
    ("backgroundColor: '#fffbeb'", "backgroundColor: '#78350f'"),
    ("backgroundColor: '#f0f9ff'", "backgroundColor: '#0c4a6e'"),
    ("backgroundColor: '#fdf2f8'", "backgroundColor: '#831843'"),
    ("backgroundColor: '#fee2e2'", "backgroundColor: '#7f1d1d'"),
    ("backgroundColor: '#fef3c7'", "backgroundColor: '#78350f'"),
    ("backgroundColor: 'white'", "backgroundColor: '#0f172a'"),
    ("color: '#141B41'", "color: '#f1f5f9'"),
    ("color: '#177E89'", "color: '#34d399'"),
    ("color: '#1a919d'", "color: '#34d399'"),
    ("color: '#0ea5e9'", "color: '#38bdf8'"),
    ("color: '#FFC857'", "color: '#fbbf24'"),
    ("color: '#94a3b8'", "color: '#94a3b8'"),
    ("color: '#64748b'", "color: '#94a3b8'"),
    ("color: '#5b21b6'", "color: '#a78bfa'"),
    ("color: '#FC814A'", "color: '#fb923c'"),
    ("color: '#065f46'", "color: '#34d399'"),
    ("borderColor: '#177E89'", "borderColor: '#10b981'"),
    ("borderColor: '#452103'", "borderColor: '#334155'"),
    ("borderColor: '#ddd6fe'", "borderColor: '#475569'"),
    ("borderColor: '#bae6fd'", "borderColor: '#0ea5e9'"),
    ("borderColor: 'transparent'", "borderColor: 'transparent'"),
    ("borderColor: '#FFC857'", "borderColor: '#fbbf24'"),
    ("borderColor: 'white'", "borderColor: '#1e293b'"),
    ("borderTop: `2px`,", "borderTop: `2px`,"),
    ("borderTop: `2px solid`", "borderTop: `2px solid`"),
    ("borderTop: `2px dashed`", "borderTop: `2px dashed`"),
    ("borderTop: `2px dotted`", "borderTop: `2px dotted`"),
    ("border: '1px solid #452103'", "border: '1px solid #334155'"),
    ("border: '1px solid #1c2658'", "border: '1px solid #1e293b'"),
    ("border: '1px solid #452103'", "border: '1px solid #334155'"),
    ("border: '1px solid #ddd6fe'", "border: '1px solid #475569'"),
    ("border: '1px solid #bae6fd'", "border: '1px solid #0ea5e9'"),
    ("fill: '#1c2658'", "fill: '#1e293b'"),
    ("fill: 'transparent'", "fill: 'transparent'"),
    ("stroke: '#1c2658'", "stroke: '#1e293b'"),
    ("stroke: '#452103'", "stroke: '#334155'"),
    ("stroke: '#ddd6fe'", "stroke: '#475569'"),
    ("stroke: '#bae6fd'", "stroke: '#0ea5e9'"),
    ("stopColor: '#1c2658'", "stopColor: '#1e293b'"),
    ("stopColor: '#452103'", "stopColor: '#334155'"),
    ("stopColor: '#ddd6fe'", "stopColor: '#475569'"),
    ("stopColor: '#bae6fd'", "stopColor: '#0ea5e9'"),
]


def main():
    files = list(TARGET_DIR.rglob("*.tsx"))
    print(f"Found {len(files)} files to process")

    for fp in files:
        content = fp.read_text(encoding="utf-8")
        original = content
        for old, new in REPLACEMENTS:
            content = content.replace(old, new)
        if content != original:
            fp.write_text(content, encoding="utf-8")
            print(f"Updated {fp.relative_to(TARGET_DIR.parent)}")
        else:
            print(f"Skipped {fp.relative_to(TARGET_DIR.parent)}")

    print("Done")


if __name__ == "__main__":
    main()
