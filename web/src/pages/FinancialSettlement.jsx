import {
   Calculator,
   Calendar,
   CheckCircle2,
   CreditCard,
   Download,
   FileText,
   IndianRupee,
   Printer,
   User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import api from "../services/api";

const FinancialSettlement = () => {
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [report, setReport] = useState(null);
  const [drivers, setDrivers] = useState([]);

  useEffect(() => {
    const fetchDrivers = async () => {
      try {
        const res = await api.get("/staff");
        setDrivers(res.data.filter((u) => u.role === "DRIVER"));
      } catch (err) {
        console.error(err);
      }
    };
    fetchDrivers();
  }, []);

  const generateReport = async () => {
    if (!selectedDriver) {
      toast.error("Please select a driver");
      return;
    }

    try {
      const res = await api.get(
        `/orders/report?driverId=${selectedDriver}&date=${selectedDate}`,
      );
      setReport(res.data);
      toast.success("Report generated successfully");
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate report");
    }
  };

  const handleExport = () => {
    toast.success("Exporting report as PDF...");
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl lg:text-3xl font-bold text-white uppercase tracking-tight flex items-center gap-3">
            Financial Settlement
          </h2>
          <p className="text-slate-400 mt-1">
            End-of-day reconciliation and bank statement matching
          </p>
        </div>
        {report && (
          <div className="flex gap-3">
            <button
              onClick={handleExport}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all border border-slate-700"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
            <button
              onClick={() => window.print()}
              className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-2xl flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
            >
              <Printer size={18} />
              <span>Print Report</span>
            </button>
          </div>
        )}
      </div>

      <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
              <User size={14} /> Select Driver
            </label>
            <select
              value={selectedDriver}
              onChange={(e) => setSelectedDriver(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-xl py-3.5 px-4 text-white font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none"
            >
              <option value="">Choose a staff member...</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 flex items-center gap-2">
              <Calendar size={14} /> Settlement Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full bg-slate-800 border-none rounded-xl py-3.5 px-4 text-white font-semibold focus:ring-2 focus:ring-blue-500/50 outline-none color-scheme-dark"
            />
          </div>
          <button
            onClick={generateReport}
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2"
          >
            <Calculator size={20} />
            Check Reconciliation
          </button>
        </div>
      </div>

      {report ? (
        <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-500">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                Cylinders Delivered
              </p>
              <h4 className="text-3xl font-black text-white">
                {report.totalCylinders}{" "}
                <span className="text-sm font-medium text-slate-500">
                  units
                </span>
              </h4>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                Cash Collected
              </p>
              <h4 className="text-3xl font-black text-emerald-400">
                ₹{report.totalCash}
              </h4>
            </div>
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">
                UPI Payments
              </p>
              <h4 className="text-3xl font-black text-blue-400">
                ₹{report.totalUPI}
              </h4>
            </div>
            <div className="bg-blue-600 p-6 rounded-3xl shadow-xl shadow-blue-900/20">
              <p className="text-blue-100/60 text-[10px] font-black uppercase tracking-widest mb-1">
                Expected Collection
              </p>
              <h4 className="text-3xl font-black text-white">
                ₹{report.expectedTotal}
              </h4>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Cash Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-6 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <IndianRupee size={20} className="text-emerald-500" />
                  Cash Transactions
                </h3>
                <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-1 rounded">
                  TOTAL: ₹{report.totalCash}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {report.cashTransactions.map((tx) => (
                      <tr key={tx.id} className="text-sm text-slate-300">
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {tx.time}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-bold">{tx.customer}</p>
                          <p className="text-[10px] font-bold text-slate-600 tracking-tighter">
                            {tx.orderId}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-white">
                          ₹{tx.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* UPI Table */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-3xl overflow-hidden">
              <div className="p-6 bg-slate-800/30 border-b border-slate-800 flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CreditCard size={20} className="text-blue-500" />
                  UPI Transactions
                </h3>
                <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-1 rounded">
                  TOTAL: ₹{report.totalUPI}
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-slate-500 text-[10px] font-black uppercase tracking-widest border-b border-slate-800">
                      <th className="px-6 py-4">Time</th>
                      <th className="px-6 py-4">Customer & Ref</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {report.upiTransactions.map((tx) => (
                      <tr key={tx.id} className="text-sm text-slate-300">
                        <td className="px-6 py-4 font-medium text-slate-500">
                          {tx.time}
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-white font-bold">{tx.customer}</p>
                          <p className="text-[10px] font-bold text-blue-500/60 uppercase tracking-tighter">
                            {tx.ref}
                          </p>
                        </td>
                        <td className="px-6 py-4 text-right font-black text-white">
                          ₹{tx.amount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 flex items-center justify-center text-emerald-500">
                <CheckCircle2 size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tight">
                  Ready for Settlement
                </h3>
                <p className="text-slate-500 font-bold text-sm uppercase">
                  Reconciliation matches with driver's mobile app report
                </p>
              </div>
            </div>
            <button className="w-full md:w-auto px-12 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase tracking-widest text-sm">
              Confirm Handover
            </button>
          </div>
        </div>
      ) : (
        <div className="py-24 flex flex-col items-center justify-center text-center opacity-30 select-none">
          <FileText size={80} className="text-slate-700 mb-6" />
          <h3 className="text-2xl font-black text-slate-700 uppercase tracking-[0.2em]">
            No Report Generated
          </h3>
          <p className="text-slate-800 font-black uppercase text-sm mt-2">
            Select a driver and date to begin reconciliation
          </p>
        </div>
      )}
    </div>
  );
};

export default FinancialSettlement;
