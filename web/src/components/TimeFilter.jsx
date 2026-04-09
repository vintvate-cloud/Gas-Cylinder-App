import { ChevronDown, Clock } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const RANGES = [
  { label: "24 Hours", value: "24hr"  },
  { label: "1 Week",   value: "week"  },
  { label: "1 Month",  value: "month" },
  { label: "All Time", value: "all"   },
];

const TimeFilter = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = RANGES.find((r) => r.value === value) ?? RANGES[3];

  const handleSelect = (val) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={ref} className="relative shrink-0">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3.5 py-2 bg-white border border-[#E5E7EB] rounded-xl text-[13px] font-semibold text-[#1F2933] hover:border-gray-300 hover:bg-gray-50 transition-all duration-150 shadow-sm"
      >
        <Clock size={14} className="text-gray-400 shrink-0" />
        <span className="whitespace-nowrap">{selected.label}</span>
        <ChevronDown
          size={14}
          className={`text-gray-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown */}
      <div
        className={`absolute right-0 mt-2 w-36 bg-white border border-[#E5E7EB] rounded-2xl shadow-lg overflow-hidden z-50
          transition-all duration-200 origin-top-right
          ${open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-1 pointer-events-none"}`}
      >
        {RANGES.map((r) => {
          const active = r.value === value;
          return (
            <button
              key={r.value}
              onClick={() => handleSelect(r.value)}
              className={`w-full text-left px-4 py-2.5 text-[13px] font-semibold transition-colors duration-100
                ${active
                  ? "bg-[#F0FDF4] text-[#00C853]"
                  : "text-[#1F2933] hover:bg-gray-50"
                }`}
            >
              <span className="flex items-center justify-between">
                {r.label}
                {active && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00C853] shrink-0" />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default TimeFilter;
