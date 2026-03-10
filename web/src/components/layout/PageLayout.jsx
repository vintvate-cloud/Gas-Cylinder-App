import { ArrowUpRight } from "lucide-react";

const PageLayout = ({
  title,
  subtitle,
  children,
  showLiveBadge = false,
  stats = [],
  actions,
}) => {
  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">{title}</h2>
          {subtitle && (
            <p className="text-slate-400 mt-1 text-sm lg:text-base">
              {subtitle}
            </p>
          )}
        </div>
        <div className="flex items-center gap-3">
          {showLiveBadge && (
            <div className="px-3 lg:px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-2 lg:gap-3 w-fit">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-xs lg:text-sm font-semibold text-slate-300">
                Live Updates
              </span>
            </div>
          )}
          {actions}
        </div>
      </div>

      {/* Stats Grid - Only render if stats are provided */}
      {stats.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-slate-900/50 border border-slate-800 p-4 lg:p-5 rounded-2xl hover:border-slate-700 transition-all group"
            >
              <div className="flex justify-between items-start mb-2 lg:mb-3">
                <div className={`p-2 rounded-xl ${stat.colorClass}`}>
                  <stat.icon size={18} className={stat.iconColor} />
                </div>
                {stat.trend !== undefined && (
                  <span
                    className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                      stat.trend > 0
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
                    }`}
                  >
                    <ArrowUpRight
                      size={12}
                      className={stat.trend < 0 ? "rotate-90" : ""}
                    />
                    {Math.abs(stat.trend)}%
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs lg:text-sm font-medium">
                {stat.label}
              </p>
              <h3 className="text-lg lg:text-xl font-bold text-white mt-1">
                {stat.value}
              </h3>
            </div>
          ))}
        </div>
      )}

      {/* Main Content */}
      <div className="space-y-4">{children}</div>
    </div>
  );
};

export default PageLayout;
