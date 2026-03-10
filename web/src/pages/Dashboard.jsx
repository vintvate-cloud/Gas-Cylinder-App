import {
  ArrowUpRight,
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
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import api from "../services/api";

const DashboardCard = ({ title, value, icon: Icon, color, trend }) => (
  <div className="bg-slate-900/50 border border-slate-800 p-4 lg:p-5 rounded-2xl hover:border-slate-700 transition-all group">
    <div className="flex justify-between items-start mb-3">
      <div
        className={`p-2.5 rounded-xl bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}
      >
        <Icon size={20} />
      </div>
      {trend && (
        <span
          className={`text-xs font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${trend > 0 ? "bg-emerald-500/10 text-emerald-400" : "bg-rose-500/10 text-rose-400"}`}
        >
          <ArrowUpRight size={14} />
          {trend}%
        </span>
      )}
    </div>
    <p className="text-slate-400 text-sm font-medium">{title}</p>
    <h3 className="text-xl font-bold text-white mt-1">{value}</h3>
  </div>
);

const Dashboard = () => {
  const [stats, setStats] = useState({
    activeDrivers: 0,
    deliveriesAssigned: 0,
    cylindersDelivered: 0,
    pendingDeliveries: 0,
    cashCollected: 0,
    upiPayments: 0,
  });

  const [chartData, setChartData] = useState([]);

  const paymentData = [
    { name: "Cash", val: stats.cashCollected },
    { name: "UPI", val: stats.upiPayments },
  ];

  const COLORS = ["#3b82f6", "#06b6d4"];

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get("/dashboard/stats");
        const data = res.data.metrics;
        setStats({
          activeDrivers: data.activeDrivers,
          deliveriesAssigned: data.pendingOrders + data.deliveredToday,
          cylindersDelivered: data.deliveredToday,
          pendingDeliveries: data.pendingOrders,
          cashCollected: data.cashCollection,
          upiPayments: data.upiCollection,
        });
        setChartData(data.hourlyStats || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white">
            Dashboard Overview
          </h2>
          <p className="text-slate-400 mt-1 text-sm lg:text-base">
            Real-time status of your delivery operations
          </p>
        </div>
        <div className="px-3 lg:px-4 py-2 bg-slate-800 border border-slate-700 rounded-xl flex items-center gap-2 lg:gap-3 w-fit">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
          <span className="text-xs lg:text-sm font-semibold text-slate-300">
            Live Updates
          </span>
        </div>
      </div>

      {/* Stats Grid - Responsive */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
        <DashboardCard
          title="Active Drivers"
          value={stats.activeDrivers}
          icon={Users}
          color="blue"
          trend={12}
        />
        <DashboardCard
          title="Assigned"
          value={stats.deliveriesAssigned}
          icon={Truck}
          color="indigo"
        />
        <DashboardCard
          title="Delivered"
          value={stats.cylindersDelivered}
          icon={PackageCheck}
          color="emerald"
          trend={8}
        />
        <DashboardCard
          title="Pending"
          value={stats.pendingDeliveries}
          icon={Clock}
          color="orange"
        />
        <DashboardCard
          title="Cash"
          value={`₹${stats.cashCollected}`}
          icon={IndianRupee}
          color="cyan"
          trend={5}
        />
        <DashboardCard
          title="UPI"
          value={`₹${stats.upiPayments}`}
          icon={CreditCard}
          color="purple"
          trend={15}
        />
      </div>

      {/* Charts Section - Responsive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Delivery Velocity Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 p-4 lg:p-6 rounded-2xl">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-4">
            <h3 className="text-base lg:text-lg font-bold text-white flex items-center gap-2">
              <TrendingUp className="text-blue-500" size={18} />
              Delivery Velocity (Today)
            </h3>
            <select className="bg-slate-800 border border-slate-700 text-slate-300 text-xs font-bold rounded-lg px-3 py-2 focus:outline-none w-fit">
              <option>Last 24 Hours</option>
              <option>Yesterday</option>
            </select>
          </div>
          <div className="h-[200px] lg:h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorDel" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#1e293b"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 11 }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                    fontSize: "12px",
                  }}
                  itemStyle={{ color: "#fff" }}
                />
                <Area
                  type="monotone"
                  dataKey="deliveries"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  lg:strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorDel)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Split Chart */}
        <div className="bg-slate-900/50 border border-slate-800 p-4 lg:p-6 rounded-2xl">
          <h3 className="text-base lg:text-lg font-bold text-white mb-4">
            Payment Split
          </h3>
          <div className="h-[150px] lg:h-[180px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentData} layout="vertical">
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#1e293b"
                />
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#f8fafc", fontWeight: "bold" }}
                  width={50}
                />
                <Tooltip
                  cursor={{ fill: "transparent" }}
                  contentStyle={{
                    backgroundColor: "#0f172a",
                    border: "1px solid #1e293b",
                    borderRadius: "12px",
                  }}
                />
                <Bar dataKey="val" radius={[0, 8, 8, 0]} barSize={30}>
                  {paymentData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-3 lg:space-y-4 mt-4 lg:mt-6">
            <div className="flex justify-between items-center p-3 bg-slate-800/30 rounded-xl border border-slate-800">
              <span className="text-xs lg:text-sm font-medium text-slate-400">
                Total Collection
              </span>
              <span className="text-base lg:text-lg font-bold text-white">
                ₹{stats.cashCollected + stats.upiPayments}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
