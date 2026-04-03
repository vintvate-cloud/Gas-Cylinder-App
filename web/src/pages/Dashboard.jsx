import {
  Clock,
  CreditCard,
  IndianRupee,
  PackageCheck,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import StatCard from "../components/StatCard";
import api from "../services/api";

// ── helpers ──────────────────────────────────────────────────────────────────

/** Build last-7-days daily delivery chart from all orders */
const buildDailyChart = (orders) => {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    return {
      name: d.toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
      date: d,
      deliveries: 0,
    };
  });
  orders.forEach((o) => {
    if (o.status !== "DELIVERED") return;
    const d = new Date(o.updatedAt);
    d.setHours(0, 0, 0, 0);
    const slot = days.find((s) => s.date.getTime() === d.getTime());
    if (slot) slot.deliveries++;
  });
  return days.map(({ name, deliveries }) => ({ name, deliveries }));
};

// ── custom pie label ──────────────────────────────────────────────────────────
const PieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const RADIAN = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
      style={{ fontSize: 11, fontWeight: 700 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

// ── tooltip ───────────────────────────────────────────────────────────────────
const tooltipStyle = {
  backgroundColor: "#fff",
  border: "1px solid #E5E7EB",
  borderRadius: 12,
  fontSize: 13,
  fontWeight: 600,
  color: "#1F2933",
  boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)",
};

// ── Dashboard ─────────────────────────────────────────────────────────────────
const Dashboard = () => {
  const [activeDrivers, setActiveDrivers] = useState(0);
  const [orders, setOrders]               = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // ── fetch active driver count only (still needs /dashboard/stats) ─────────
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        setActiveDrivers(res.data.metrics?.activeDrivers ?? 0);
      } catch (err) { console.error("stats:", err); }
    };
    fetchStats();
    const id = setInterval(fetchStats, 30000);
    return () => clearInterval(id);
  }, []);

  // ── fetch all orders for charts (client-side derived) ─────────────────────
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await api.get("/orders");
        setOrders(Array.isArray(res.data) ? res.data : []);
      } catch (err) { console.error("orders:", err); }
      finally { setLoadingOrders(false); }
    };
    fetchOrders();
    const id = setInterval(fetchOrders, 30000);
    return () => clearInterval(id);
  }, []);

  // ── all-time stats derived from orders ────────────────────────────────────
  const delivered    = orders.filter((o) => o.status === "DELIVERED");
  const pending      = orders.filter((o) => o.status === "PENDING");
  const assigned     = orders.filter((o) =>
    ["PENDING","OUT_FOR_DELIVERY"].includes(o.status) && o.assignedStaffId
  );
  let totalCash = 0, totalUpi = 0;
  orders.forEach((o) =>
    (o.transactions ?? []).forEach((t) => {
      if (t.paymentType === "CASH") totalCash += t.amount;
      else totalUpi += t.amount;
    })
  );

  // ── derived chart data ─────────────────────────────────────────────────────
  const dailyData = buildDailyChart(orders);

  const paymentPieData = (() => {
    if (!totalCash && !totalUpi) return [];
    return [
      { name: "Cash", value: Math.round(totalCash) },
      { name: "UPI",  value: Math.round(totalUpi)  },
    ];
  })();

  const statusPieData = (() => {
    const counts = {};
    orders.forEach((o) => { counts[o.status] = (counts[o.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name: name.replace(/_/g," "), value }));
  })();

  const cylinderPieData = (() => {
    const counts = {};
    orders.forEach((o) => { counts[o.cylinderType] = (counts[o.cylinderType] || 0) + (o.quantity || 1); });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  })();

  const STATUS_COLORS  = ["#00C853","#3B82F6","#F59E0B","#EF4444","#8B5CF6"];
  const PAYMENT_COLORS = ["#00C853","#6366F1"];
  const CYLINDER_COLORS= ["#0EA5E9","#F97316","#A855F7","#EC4899","#14B8A6"];

  // ── pie card wrapper ───────────────────────────────────────────────────────
  const PieCard = ({ title, data, colors, emptyMsg }) => (
    <div className="bg-white border border-[#E5E7EB] p-5 lg:p-6 rounded-[20px]"
      style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
      <h3 className="text-[16px] font-bold text-[#1F2933] mb-4">{title}</h3>
      {!data.length ? (
        <div className="h-[180px] flex items-center justify-center text-gray-400 text-[13px] font-medium">
          {loadingOrders ? "Loading..." : emptyMsg}
        </div>
      ) : (
        <>
          <div className="h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={data} cx="50%" cy="50%" outerRadius={75}
                  dataKey="value" labelLine={false} label={PieLabel}>
                  {data.map((_, i) => (
                    <Cell key={i} fill={colors[i % colors.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle}
                  formatter={(v, n) => [`${n === "value" ? v : v}`, ""]} />
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

      {/* Stat Cards — all-time counts from /orders */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 lg:gap-5">
        <StatCard title="Active Drivers"  value={activeDrivers}                  icon={Users}        color="blue"    to="/dashboard/drivers"   />
        <StatCard title="Assigned"        value={assigned.length}                icon={Truck}        color="indigo"  to="/dashboard/assigned"  />
        <StatCard title="Delivered"       value={delivered.length}               icon={PackageCheck} color="emerald" to="/dashboard/delivered" />
        <StatCard title="Pending"         value={pending.length}                 icon={Clock}        color="orange"  to="/dashboard/pending"   />
        <StatCard title="Cash"            value={`₹${Math.round(totalCash)}`}    icon={IndianRupee}  color="cyan"    to="/dashboard/cash"      />
        <StatCard title="UPI"             value={`₹${Math.round(totalUpi)}`}     icon={CreditCard}   color="purple"  to="/dashboard/upi"       />
      </div>

      {/* Row 1 — Delivery Velocity + Payment Split Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

        {/* Delivery Velocity — built client-side from /orders */}
        <div className="lg:col-span-2 bg-white border border-[#E5E7EB] p-5 lg:p-7 rounded-[20px]"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-6">
            <h3 className="text-[18px] font-bold text-[#1F2933] flex items-center gap-2">
              <TrendingUp size={20} />
              Delivery Velocity (Last 7 Days)
            </h3>
            <div className="flex items-center gap-2 text-[13px] text-gray-400 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-[#00C853]" />
              Deliveries per day
            </div>
          </div>

          {loadingOrders ? (
            <div className="h-[280px] flex items-center justify-center text-gray-400 text-[13px]">
              Loading chart...
            </div>
          ) : dailyData.every((s) => s.deliveries === 0) ? (
            <div className="h-[280px] flex flex-col items-center justify-center gap-2 text-gray-400">
              <TrendingUp size={32} className="opacity-30" />
              <p className="text-[14px] font-semibold">No deliveries in the last 7 days</p>
            </div>
          ) : (
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorDel" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor="#00C853" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#00C853" stopOpacity={0}    />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false}
                    tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }} dy={10} />
                  <YAxis axisLine={false} tickLine={false} allowDecimals={false}
                    tick={{ fill: "#9CA3AF", fontSize: 11, fontWeight: 500 }} />
                  <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#00C853", fontWeight: 700 }}
                    formatter={(v) => [v, "Deliveries"]} />
                  <Area type="monotone" dataKey="deliveries" stroke="#00C853" strokeWidth={3}
                    fillOpacity={1} fill="url(#colorDel)"
                    activeDot={{ r: 6, fill: "#00C853", stroke: "#fff", strokeWidth: 2 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Payment Split Pie */}
        <div className="bg-white border border-[#E5E7EB] p-5 lg:p-7 rounded-[20px]"
          style={{ boxShadow: "0 2px 10px rgba(0,0,0,0.02)" }}>
          <h3 className="text-[18px] font-bold text-[#1F2933] mb-1">Payment Split</h3>
          <p className="text-[12px] text-gray-400 font-medium mb-4">All-time collection breakdown</p>

          {!paymentPieData.length ? (
            <div className="h-[200px] flex items-center justify-center text-gray-400 text-[13px] font-medium">
              {loadingOrders ? "Loading..." : "No payments today"}
            </div>
          ) : (
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={paymentPieData} cx="50%" cy="50%"
                    innerRadius={50} outerRadius={80}
                    dataKey="value" labelLine={false} label={PieLabel}>
                    {paymentPieData.map((_, i) => (
                      <Cell key={i} fill={PAYMENT_COLORS[i % PAYMENT_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle}
                    formatter={(v) => [`₹${v}`, ""]} />
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
            <div className="flex justify-between items-center px-3 py-2 bg-[#F0FDF4] rounded-xl border border-green-100">
              <span className="text-[13px] font-bold text-gray-500">Total</span>
              <span className="text-[16px] font-black text-[#00C853]">
                ₹{Math.round(totalCash + totalUpi)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2 — Order Status Pie + Cylinder Type Pie */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <PieCard
          title="Order Status Breakdown"
          data={statusPieData}
          colors={STATUS_COLORS}
          emptyMsg="No orders found"
        />
        <PieCard
          title="Cylinder Type Distribution"
          data={cylinderPieData}
          colors={CYLINDER_COLORS}
          emptyMsg="No orders found"
        />
      </div>

    </div>
  );
};

export default Dashboard;
