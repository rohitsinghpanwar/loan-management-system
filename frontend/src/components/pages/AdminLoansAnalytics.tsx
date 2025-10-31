import { useEffect, useState } from "react";
import axios from "axios";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Loader2, Download } from "lucide-react";
import { format, subDays, startOfYear } from "date-fns";

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

interface LoanData {
  loanType: string;
  interestRate: number;
  repaymentTenure: number; // in months
}

interface AnalyticsData {
  loanTypes: { [key: string]: number };
  interestRates: { [key: string]: number };
  repaymentTenures: { [key: string]: number };
}

export default function AdminLoansAnalytics() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        let query = "";
        const today = format(new Date(), "yyyy-MM-dd");

        if (filter === "7days") {
          query = `?start_date=${format(subDays(new Date(), 7), "yyyy-MM-dd")}&end_date=${today}`;
        } else if (filter === "30days") {
          query = `?start_date=${format(subDays(new Date(), 30), "yyyy-MM-dd")}&end_date=${today}`;
        } else if (filter === "year") {
          query = `?start_date=${format(startOfYear(new Date()), "yyyy-MM-dd")}&end_date=${today}`;
        } else if (filter === "custom" && startDate && endDate) {
          query = `?start_date=${startDate}&end_date=${endDate}`;
        }

        const res = await axios.get(
          `${import.meta.env.VITE_GO_URI}admin/analytics${query}`,
          {
            headers: { "x-api-key": import.meta.env.VITE_ADMIN_SECRET_KEY },
          }
        );
        setAnalytics(res.data.analytics);
      } catch (err: any) {
        setError(err.response?.data?.message || "Failed to fetch analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [filter, startDate, endDate]);

  const handleExportCSV = () => {
    if (!analytics) return;

    const headers = ["Category,Count"];
    const loanTypeRows = Object.entries(analytics.loanTypes).map(
      ([type, count]) => `Loan Type: ${type},${count}`
    );
    const interestRateRows = Object.entries(analytics.interestRates).map(
      ([rate, count]) => `Interest Rate: ${rate}%,${count}`
    );
    const tenureRows = Object.entries(analytics.repaymentTenures).map(
      ([tenure, count]) => `Repayment Tenure: ${tenure} months,${count}`
    );

    const csvContent = [
      headers,
      ...loanTypeRows,
      ...interestRateRows,
      ...tenureRows,
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `loan_analytics_${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
  };

  if (loading)
    return (
      <div className="flex justify-center items-center min-h-[60vh] bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );

  if (error)
    return (
      <div className="text-center text-red-600 font-medium mt-12 bg-red-50 p-4 rounded-lg max-w-md mx-auto">
        {error}
      </div>
    );

  if (!analytics) return null;

  // Chart Data Configurations
  const loanTypeData = {
    labels: Object.keys(analytics.loanTypes),
    datasets: [
      {
        label: "Loan Applications by Type",
        data: Object.values(analytics.loanTypes),
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        borderColor: ["#1e40af", "#047857", "#b45309", "#991b1b"],
        borderWidth: 1,
      },
    ],
  };

  const interestRateData = {
    labels: Object.keys(analytics.interestRates).map((rate) => `${rate}%`),
    datasets: [
      {
        label: "Loan Applications by Interest Rate",
        data: Object.values(analytics.interestRates),
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
        borderColor: ["#1e40af", "#047857", "#b45309", "#991b1b"],
        borderWidth: 1,
      },
    ],
  };

  const tenureData = {
    labels: Object.keys(analytics.repaymentTenures).map((tenure) => `${tenure} months`),
    datasets: [
      {
        label: "Loan Applications by Repayment Tenure",
        data: Object.values(analytics.repaymentTenures),
        backgroundColor: ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"],
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" as const },
      tooltip: { backgroundColor: "#1f2937", titleColor: "#fff", bodyColor: "#fff" },
    },
  };

  return (
    <div className=" bg-gray-50 flex items-center justify-center p-4 sm:p-6 font-robbert">
      <div className="w-full bg-white rounded-2xl shadow-lg border border-gray-100 transition-all duration-300 hover:shadow-xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-blue-900">
            Loan Analytics Overview
          </h1>
          <div className="flex flex-col sm:flex-row gap-4 mt-4 sm:mt-0">
            <select
              className="border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">All Time</option>
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="year">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
            {filter === "custom" && (
              <div className="flex gap-2">
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
                <input
                  type="date"
                  className="border border-gray-300 rounded-lg p-2 text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            )}
            <button
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              onClick={handleExportCSV}
            >
              <Download className="w-5 h-5" />
              Export CSV
            </button>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Loan Type Chart */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Loan Types</h2>
            <div className="h-80">
              <Bar data={loanTypeData} options={chartOptions} />
            </div>
          </div>

          {/* Interest Rate Chart */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Interest Rates</h2>
            <div className="h-80">
              <Bar data={interestRateData} options={chartOptions} />
            </div>
          </div>

          {/* Repayment Tenure Chart */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Repayment Tenures</h2>
            <div className="h-80">
              <Pie data={tenureData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}