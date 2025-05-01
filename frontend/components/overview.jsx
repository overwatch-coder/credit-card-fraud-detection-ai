"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { API_URL } from "@/lib/constants";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function Overview() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [monthlyData, setMonthlyData] = useState({
    months: [],
    legit: [],
    fraud: [],
  });

  useEffect(() => {
    setMounted(true);

    fetch(`${API_URL}/monthly-overview`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setMonthlyData(json.data);
        }
      })
      .catch((err) => console.error("Failed to fetch overview data:", err));
  }, []);

  if (!mounted) {
    return (
      <div className="h-[300px] bg-muted/20 animate-pulse rounded-md"></div>
    );
  }

  const isDark = theme === "dark";

  const data = {
    labels: monthlyData.months,
    datasets: [
      {
        label: "Legitimate Transactions",
        data: monthlyData.legit,
        backgroundColor: isDark
          ? "rgba(52, 211, 153, 0.8)"
          : "rgba(16, 185, 129, 0.8)",
        borderColor: isDark ? "rgba(52, 211, 153, 1)" : "rgba(16, 185, 129, 1)",
        borderWidth: 1,
      },
      {
        label: "Fraudulent Transactions",
        data: monthlyData.fraud,
        backgroundColor: isDark
          ? "rgba(248, 113, 113, 0.8)"
          : "rgba(239, 68, 68, 0.8)",
        borderColor: isDark ? "rgba(248, 113, 113, 1)" : "rgba(239, 68, 68, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: {
          display: false,
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
      },
      y: {
        grid: {
          color: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        },
        ticks: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
      },
    },
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        },
      },
      tooltip: {
        backgroundColor: isDark
          ? "rgba(0, 0, 0, 0.8)"
          : "rgba(255, 255, 255, 0.8)",
        titleColor: isDark ? "rgba(255, 255, 255, 0.9)" : "rgba(0, 0, 0, 0.9)",
        bodyColor: isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.7)",
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
        borderWidth: 1,
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Bar data={data} options={options} />
    </div>
  );
}
