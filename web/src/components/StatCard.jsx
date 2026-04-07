import { ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const colorMap = {
  blue:    "bg-blue-50 text-blue-500",
  indigo:  "bg-indigo-50 text-indigo-500",
  emerald: "bg-[#E8F5E9] text-[#00C853]",
  orange:  "bg-orange-50 text-orange-500",
  cyan:    "bg-cyan-50 text-cyan-500",
  purple:  "bg-purple-50 text-purple-500",
};

const Sk = ({ w = "w-20", h = "h-8" }) => (
  <div className={`${w} ${h} rounded-lg bg-gray-200 animate-pulse`} />
);

const StatCard = ({ title, value, icon: Icon, color, trend, to, loading }) => {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => !loading && to && navigate(to)}
      role={to ? "button" : undefined}
      tabIndex={to ? 0 : undefined}
      onKeyDown={(e) => e.key === "Enter" && !loading && to && navigate(to)}
      className={`bg-white border md:min-h-[148px] border-[#E5E7EB] p-5 lg:p-6 rounded-[20px] flex flex-col justify-between
        transition-all duration-200 group
        ${to && !loading ? "cursor-pointer hover:border-[#00C853] hover:shadow-[0_4px_20px_rgba(0,200,83,0.12)] hover:-translate-y-0.5 active:scale-[0.98]" : "hover:border-[#D1D5DB]"}
      `}
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col gap-2">
          <p className="text-[#6B7280] text-[15px] font-medium tracking-wide">{title}</p>
          {loading
            ? <Sk w="w-16" h="h-9" />
            : <h3 className="text-3xl lg:text-[32px] font-bold text-[#1F2933] animate-in fade-in duration-300">{value}</h3>
          }
        </div>
        <div className={`p-3 rounded-2xl ${colorMap[color] || colorMap.blue} transition-transform group-hover:scale-110 shrink-0`}>
          <Icon size={24} strokeWidth={2} />
        </div>
      </div>
      <div className="flex items-center gap-1.5 mt-2">
        {!loading && trend != null && (
          <span className={`text-[13px] font-bold flex items-center gap-0.5 ${trend > 0 ? "text-[#00C853]" : "text-red-500"}`}>
            <ArrowUpRight size={16} className={trend < 0 ? "rotate-90" : ""} strokeWidth={2.5} />
            {Math.abs(trend)}%
          </span>
        )}
        {!loading && to && (
          <span className="ml-auto text-[12px] font-semibold text-gray-400 group-hover:text-[#00C853] transition-colors">
            View all →
          </span>
        )}
        {loading && <Sk w="w-12" h="h-3" />}
      </div>
    </div>
  );
};

export default StatCard;
