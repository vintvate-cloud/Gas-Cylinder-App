import {
  Clock,
  CreditCard,
  IndianRupee,
  PackageCheck,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "../components/StatCard";
import TimeFilter from "../components/TimeFilter";
import api from "../services/api";

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY VELOCITY — helpers
// ─────────────────────────────────────────────────────────────────────────────

const VELOCITY_RANGES = [
  { label: "24 Hours", value: "24hr"  },
  { label: "1 Week",   value: "week"  },
  { label: "1 Month",  value: "month" },
  { label: "1 Year",   value: "year"  },
];

const VELOCITY_LABELS = {
  "24hr":  "24 Hours",
  week:    "1 Week",
  month:   "1 Month",
  year:    "1 Year",
};

/** Build chart buckets for each range */
const buildVelocityData = (orders, range) => {
  const delivered = orders.filter((o) => o.status === "DELIVERED");

  if (range === "24hr") {
    return Array.from({ length: 24 }, (_, i) => {
      const h = new Date(); h.setMinutes(0, 0, 0);
      h.setHours(h.getHours() - (23 - i));
      const label    = h.toLocaleString("en-IN", { hour: "numeric", hour12: true }).replace(" ", ""); // 2PM
      const fullDate = h.toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", hour12: true });
      const count    = delivered.filter((o) => {
        const t = new Date(o.updatedAt); t.setMinutes(0, 0, 0);
        return t.getTime() === h.getTime();
      }).length;
      return { label, fullDate, deliveries: count };
    });
  }

  if (range === "week") {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i)); d.setHours(0, 0, 0, 0);
      const label    = d.toLocaleDateString("en-IN", { weekday: "short" }); // Mon
      const fullDate = d.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" });
      const count    = delivered.filter((o) => {
        const od = new Date(o.updatedAt); od.setHours(0, 0, 0, 0);
        return od.getTime() === d.getTime();
      }).length;
      return { label, fullDate, deliveries: count };
    });
  }

  if (range === "month") {
    return Array.from({ length: 30 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (29 - i)); d.setHours(0, 0, 0, 0);
      const label    = String(d.getDate()); // "1", "5", "10"
      const fullDate = d.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
      const count    = delivered.filter((o) => {
        const od = new Date(o.updatedAt); od.setHours(0, 0, 0, 0);
        return od.getTime() === d.getTime();
      }).length;
      return { label, fullDate, deliveries: count };
    });
  }

  // year — 12 monthly buckets
  return Array.from({ length: 12 }, (_, i) => {
    const d = new Date();
    d.setDate(1); d.setHours(0, 0, 0, 0);
    d.setMonth(d.getMonth() - (11 - i));
    const label    = d.toLocaleDateString("en-IN", { month: "short" }); // Jan
    const fullDate = d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
    const count    = delivered.filter((o) => {
      const od = new Date(o.updatedAt);
      return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
    }).length;
    return { label, fullDate, deliveries: count };
  });
};

/** How many px per data point & interval for each range */
const RANGE_CONFIG = {
  "24hr":  { pxPerPoint: 64, interval: 1  }, // every 2nd hour label, more breathing room
  week:    { pxPerPoint: 80, interval: 0  }, // all 7 days
  month:   { pxPerPoint: 38, interval: 4  }, // every 5th day
  year:    { pxPerPoint: 80, interval: 0  }, // all 12 months
};

// ─────────────────────────────────────────────────────────────────────────────
// DELIVERY VELOCITY COMPONENT (fully self-contained)
// ─────────────────────────────────────────────────────────────────────────────

const VelocityTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { fullDate, deliveries } = payload[0].payload;
  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl px-4 py-3 shadow-lg">
      <p className="text-[11px] font-semibold text-gray-400 mb-1">{fullDate}</p>
      <p className="text-[15px] font-bold text-[#00C853]">
        {deliveries} <span className="text-[#1F2933]">Deliveries</span>
      </p>
    </div>
  );
};

const VelocityDropdown = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const selected = VELOCITY_RANGES.find((r) => r.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 border border-[#E5E7EB] rounded-xl text-[12px] font-bold text-[#1F2933] hover:bg-gray-100 transition-colors"
      >
        {selected?.label}
        <svg width="10" height="6" viewBox="0 0 10 6" fill="none"
          className={`transition-transform duration-200 ${open ? "rotate-180" : ""}`}>
          <path d="M1 1l4 4 4-4" stroke="#9CA3AF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className={`absolute right-0 mt-1.5 w-32 bg-white border border-[#E5E7EB] rounded-2xl shadow-xl z-50 overflow-hidden
        transition-all duration-200 origin-top-right
        ${open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none"}`}>
        {VELOCITY_RANGES.map((r) => (
          <button key={r.value} onClick={() => { onChange(r.value); setOpen(false); }}
            className={`w-full text-left px-4 py-2.5 text-[12px] font-semibold transition-colors
              ${r.value === value ? "bg-[#F0FDF4] text-[#00C853]" : "text-[#1F2933] hover:bg-gray-50"}`}>
            <span className="flex items-center justify-between">
              {r.label}
              {r.value === value && <span className="w-1.5 h-1.5 rounded-full bg-[#00C853]" />}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

const DeliveryVelocity = ({ allOrders, loading }) => {
  const [range, setRange] = useState("month");

  const data = useMemo(() => {
    const start = (() => {
      const d = new Date();
      if (range === "24hr")  { d.setHours(d.getHours() - 24); return d; }
      if (range === "week")  { d.setDate(d.getDate() - 7);    return d; }
      if (range === "month") { d.setMonth(d.getMonth() - 1);  return d; }
      if (range === "year")  { d.setFullYear(d.getFullYear() - 1); return d; }
      return null;
    })();
    const filtered = start ? allOrders.filter((o) => new Date(o.createdAt) >= start) : allOrders;
    return buildVelocityData(filtered, range);
  }, [allOrders, range]);

  const cfg       = RANGE_CONFIG[range];
  const chartW    = Math.max(600, data.length * cfg.pxPerPoint);
  const isEmpty   = data.every((d) => d.deliveries === 0);
  const maxVal    = Math.max(...data.map((d) => d.deliveries), 1);

  return (
    <div className="lg:col-span-2 bg-white border border-[#E5E7EB] rounded-[20px] p-5 lg:p-6"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>

      {/* ── Card header ── */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#F0FDF4]">
            <TrendingUp size={18} className="text-[#00C853]" />
          </div>
          <div>
            <h3 className="text-[16px] font-bold text-[#1F2933] leading-tight">
              Delivery Velocity
            </h3>
            <p className="text-[12px] text-gray-400 font-medium">
              {VELOCITY_LABELS[range]}
            </p>
          </div>
        </div>
        <VelocityDropdown value={range} onChange={setRange} />
      </div>

      {/* ── Chart area ── */}
      {loading ? (
        /* skeleton */
        <div className="h-[260px] flex items-end gap-2 px-2 pb-6 animate-pulse">
          {[45, 70, 35, 85, 55, 65, 40, 75, 50, 80, 45, 60].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-100 rounded-t-lg" style={{ height: `${h}%` }} />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="h-[260px] flex flex-col items-center justify-center gap-2 text-gray-300">
          <TrendingUp size={36} strokeWidth={1.5} />
          <p className="text-[13px] font-semibold text-gray-400">No deliveries in this period</p>
        </div>
      ) : (
        /* scrollable chart */
        <div
          className="overflow-x-auto pb-1"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          <div style={{ width: chartW, height: 280 }}>
            <LineChart
              width={chartW}
              height={280}
              data={data}
              margin={{ top: 8, right: 20, left: -18, bottom: 36 }}
            >
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"   stopColor="#00C853" stopOpacity={0.12} />
                  <stop offset="100%" stopColor="#00C853" stopOpacity={0}    />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="4 4"
                vertical={false}
                stroke="#F3F4F6"
              />

              <XAxis
                dataKey="label"
                axisLine={false}
                tickLine={false}
                interval={cfg.interval}
                height={48}
                tick={({ x, y, payload }) => (
                  <g transform={`translate(${x},${y})`}>
                    <text
                      x={0} y={0} dy={14}
                      textAnchor="end"
                      transform="rotate(-40)"
                      fill="#9CA3AF"
                      fontSize={11}
                      fontWeight={500}
                    >
                      {payload.value}
                    </text>
                  </g>
                )}
              />

              <YAxis
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                domain={[0, maxVal + 1]}
                tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }}
                width={32}
              />

              <Tooltip
                content={<VelocityTooltip />}
                cursor={{ stroke: "#E5E7EB", strokeWidth: 1, strokeDasharray: "4 4" }}
              />

              <Line
                type="monotone"
                dataKey="deliveries"
                stroke="#00C853"
                strokeWidth={2.5}
                dot={false}
                activeDot={{ r: 5, fill: "#00C853", stroke: "#fff", strokeWidth: 2 }}
                isAnimationActive
                animationDuration={500}
                animationEasing="ease-out"
              />
            </LineChart>
          </div>
        </div>
      )}

      {/* ── Legend ── */}
      {!loading && !isEmpty && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-50">
          <span className="w-6 h-0.5 bg-[#00C853] rounded-full inline-block" />
          <span className="text-[12px] font-semibold text-gray-400">Deliveries per {range === "year" ? "month" : range === "24hr" ? "hour" : "day"}</span>
          <span className="ml-auto text-[12px] font-bold text-[#1F2933]">
            Peak: {maxVal}
          </span>
        </div>
      )}
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// PIE HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const R = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  return (
    <text x={cx + r * Math.cos(-midAngle * R)} y={cy + r * Math.sin(-midAngle * R)}
      fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const tooltipStyle = {
  backgroundColor: "#fff", border: "1px solid #E5E7EB", borderRadius: 12,
  fontSize: 13, fontWeight: 600, color: "#1F2933",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
};

const STATUS_COLORS   = ["#00C853", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];
const PAYMENT_COLORS  = ["#00C853", "#6366F1"];
const CYLINDER_COLORS = ["#0EA5E9", "#F97316", "#A855F7", "#EC4899", "#14B8A6"];

// ─────────────────────────────────────────────────────────────────────────────
// DASHBOARD
// ─────────────────────────────────────────────────────────────────────────────

const Dashboard = () => {
  const [activeDrivers, setActiveDrivers]   = useState(0);
  const [loadingDrivers, setLoadingDrivers] = useState(true);
  const [allOrders, setAllOrders]           = useState([]);
  const [loadingOrders, setLoadingOrders]   = useState(true);

  // firstLoad: true until BOTH initial fetches complete — never re-triggers on 30s polls
  const [firstLoad, setFirstLoad] = useState(true);
  const driversReady = useRef(false);
  const ordersReady  = useRef(false);

  const markReady = () => {
    if (driversReady.current && ordersReady.current) setFirstLoad(false);
  };

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        setActiveDrivers(res.data.metrics?.activeDrivers ?? 0);
      } catch (e) { console.error(e); }
      finally {
        setLoadingDrivers(false);
        driversReady.current = true;
        markReady();
      }
    };
    run();
    const id = setInterval(run, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await api.get("/orders");
        setAllOrders(Array.isArray(res.data) ? res.data : []);
      } catch (e) { console.error(e); }
      finally {
        setLoadingOrders(false);
        ordersReady.current = true;
        markReady();
      }
    };
    run();
    const id = setInterval(run, 30000);
    return () => clearInterval(id);
  }, []);

  // stats — always all-time
  const delivered = allOrders.filter((o) => o.status === "DELIVERED");
  const pending   = allOrders.filter((o) => o.status === "PENDING");
  const assigned  = allOrders.filter(
    (o) => ["PENDING", "OUT_FOR_DELIVERY"].includes(o.status) && o.assignedStaffId
  );
  let totalCash = 0, totalUpi = 0;
  allOrders.forEach((o) =>
    (o.transactions ?? []).forEach((t) => {
      if (t.paymentType === "CASH") totalCash += t.amount;
      else totalUpi += t.amount;
    })
  );

  const paymentPieData = useMemo(() => {
    if (!totalCash && !totalUpi) return [];
    return [
      { name: "Cash", value: Math.round(totalCash) },
      { name: "UPI",  value: Math.round(totalUpi)  },
    ];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalCash, totalUpi]);

  const statusPieData = useMemo(() => {
    const counts = {};
    allOrders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g, " "), value }));
  }, [allOrders]);

  const cylinderPieData = useMemo(() => {
    const counts = {};
    allOrders.forEach((o) => { counts[o.cylinderType] = (counts[o.cylinderType] || 0) + (o.quantity || 1); });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [allOrders]);

  const PieCard = ({ title, data, colors, emptyMsg }) => (
    <div className="bg-white border border-[#E5E7EB] p-5 lg:p-6 rounded-[20px]"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
      <h3 className="text-[16px] font-bold text-[#1F2933] mb-4">{title}</h3>
      {loadingOrders ? (
        <div className="h-[180px] flex flex-col gap-3 justify-center px-4">
          {[65, 45, 80, 35].map((w, i) => (
            <div key={i} className="h-3 rounded-full bg-gray-100 animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      ) : !data.length ? (
        <div className="h-[180px] flex items-center justify-center text-gray-400 text-[13px] font-medium">
          {emptyMsg}
        </div>
      ) : (
        <>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" outerRadius={75}
                  dataKey="value" labelLine={false} label={PieLabel}
                  isAnimationActive animationBegin={0} animationDuration={500}>
                  {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-3">
            {data.map((entry, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: colors[i % colors.length] }} />
                <span className="text-[12px] font-semibold text-gray-500">
                  {entry.name} <span className="text-[#1F2933]">({entry.value})</span>
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 p-2 lg:p-4">

      {/* ── SKELETON LOADING — mirrors exact dashboard layout ── */}
      {firstLoad ? (
        <>
          {/* Header skeleton */}
          <div className="flex justify-between items-start mb-2">
            <div className="space-y-2">
              <div className="h-8 w-56 bg-gray-100 rounded-xl animate-pulse" />
              <div className="h-4 w-72 bg-gray-100 rounded-lg animate-pulse" />
            </div>
            <div className="h-8 w-28 bg-gray-100 rounded-full animate-pulse" />
          </div>

          {/* Stat cards skeleton */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] p-5 rounded-[20px] space-y-3"
                style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="h-3 w-20 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-8 w-14 bg-gray-100 rounded-xl animate-pulse" />
                  </div>
                  <div className="w-10 h-10 rounded-2xl bg-gray-100 animate-pulse" />
                </div>
                <div className="h-3 w-12 bg-gray-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>

          {/* Chart row skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Velocity chart */}
            <div className="lg:col-span-2 bg-white border border-[#E5E7EB] p-5 lg:p-6 rounded-[20px]"
              style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div className="flex justify-between items-center mb-5">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-36 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-3 w-20 bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                </div>
                <div className="h-7 w-24 bg-gray-100 rounded-xl animate-pulse" />
              </div>
              <div className="h-[260px] flex items-end gap-2 px-2 pb-6">
                {[45, 70, 35, 85, 55, 65, 40, 75, 50, 80, 45, 60].map((h, i) => (
                  <div key={i} className="flex-1 bg-gray-100 rounded-t-lg animate-pulse" style={{ height: `${h}%` }} />
                ))}
              </div>
            </div>

            {/* Payment split skeleton */}
            <div className="bg-white border border-[#E5E7EB] p-5 lg:p-7 rounded-[20px]"
              style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <div className="h-5 w-32 bg-gray-100 rounded-lg animate-pulse mb-2" />
              <div className="h-3 w-44 bg-gray-100 rounded-lg animate-pulse mb-5" />
              <div className="flex items-center justify-center h-[200px]">
                <div className="w-32 h-32 rounded-full border-[12px] border-gray-100 animate-pulse" />
              </div>
              <div className="space-y-2 mt-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-xl">
                    <div className="h-3 w-16 bg-gray-100 rounded-lg animate-pulse" />
                    <div className="h-4 w-12 bg-gray-100 rounded-lg animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pie cards row skeleton */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[0, 1].map((i) => (
              <div key={i} className="bg-white border border-[#E5E7EB] p-5 lg:p-6 rounded-[20px]"
                style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
                <div className="h-4 w-40 bg-gray-100 rounded-lg animate-pulse mb-5" />
                <div className="flex items-center justify-center h-[180px]">
                  <div className="w-28 h-28 rounded-full border-[10px] border-gray-100 animate-pulse" />
                </div>
                <div className="flex gap-4 mt-3">
                  {[60, 45, 70].map((w, j) => (
                    <div key={j} className="h-3 bg-gray-100 rounded-lg animate-pulse" style={{ width: `${w}px` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-2">
            <div>
              <h2 className="text-[26px] lg:text-[28px] font-bold text-[#1F2933]">
                Dashboard Overview
              </h2>
              <p className="text-[#6B7280] mt-1 text-[15px] font-medium">
                Real-time status of your delivery operations
              </p>
            </div>
            <div className="px-4 py-2 bg-white border border-gray-100 rounded-full flex items-center gap-2 shadow-sm shrink-0">
              <div className="w-2 h-2 bg-[#00C853] rounded-full animate-pulse shadow-[0_0_8px_rgba(0,200,83,0.6)]" />
              <span className="text-[13px] font-bold text-gray-500 tracking-wide uppercase">Live Updates</span>
            </div>
          </div>

          {/* Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5">
            <StatCard title="Active Drivers" value={activeDrivers}               icon={Users}        color="blue"    to="/dashboard/drivers"   loading={loadingDrivers} />
            <StatCard title="Assigned"       value={assigned.length}             icon={Truck}        color="indigo"  to="/dashboard/assigned"  loading={loadingOrders} />
            <StatCard title="Delivered"      value={delivered.length}            icon={PackageCheck} color="emerald" to="/dashboard/delivered" loading={loadingOrders} />
            <StatCard title="Pending"        value={pending.length}              icon={Clock}        color="orange"  to="/dashboard/pending"   loading={loadingOrders} />
            <StatCard title="Cash"           value={`₹${Math.round(totalCash)}`} icon={IndianRupee}  color="cyan"    to="/dashboard/cash"      loading={loadingOrders} />
            <StatCard title="UPI"            value={`₹${Math.round(totalUpi)}`}  icon={CreditCard}   color="purple"  to="/dashboard/upi"       loading={loadingOrders} />
          </div>

          {/* Row 1 — Delivery Velocity + Payment Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <DeliveryVelocity allOrders={allOrders} loading={loadingOrders} />

            {/* Payment Split */}
            <div className="bg-white border border-[#E5E7EB] p-5 lg:p-7 rounded-[20px]"
              style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
              <h3 className="text-[18px] font-bold text-[#1F2933] mb-1">Payment Split</h3>
              <p className="text-[12px] text-gray-400 font-medium mb-4">All-time collection breakdown</p>
              {loadingOrders ? (
                <div className="h-[200px] flex items-center justify-center">
                  <div className="w-28 h-28 rounded-full border-[10px] border-gray-100 animate-pulse" />
                </div>
              ) : !paymentPieData.length ? (
                <div className="h-[200px] flex items-center justify-center text-gray-400 text-[13px] font-medium">
                  No payments recorded
                </div>
              ) : (
                <div className="h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={paymentPieData} cx="50%" cy="50%"
                        innerRadius={50} outerRadius={80}
                        dataKey="value" labelLine={false} label={PieLabel}
                        isAnimationActive animationDuration={500}>
                        {paymentPieData.map((_, i) => (
                          <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`₹${v}`, ""]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              )}
              <div className="space-y-2 mt-4">
                {paymentPieData.map((entry, i) => (
                  <div key={i} className="flex justify-between items-center px-3 py-2 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PAYMENT_COLORS[i] }} />
                      <span className="text-[13px] font-semibold text-gray-500">{entry.name}</span>
                    </div>
                    <span className="text-[14px] font-bold text-[#1F2933]">₹{entry.value}</span>
                  </div>
                ))}
                {(totalCash > 0 || totalUpi > 0) && (
                  <div className="flex justify-between items-center px-3 py-2 bg-[#F0FDF4] rounded-xl border border-green-100">
                    <span className="text-[13px] font-bold text-gray-500">Total</span>
                    <span className="text-[16px] font-black text-[#00C853]">₹{Math.round(totalCash + totalUpi)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2 — Order Status + Cylinder Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <PieCard title="Order Status Breakdown"     data={statusPieData}   colors={STATUS_COLORS}   emptyMsg="No orders found" />
            <PieCard title="Cylinder Type Distribution" data={cylinderPieData} colors={CYLINDER_COLORS} emptyMsg="No orders found" />
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
