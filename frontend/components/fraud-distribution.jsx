"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { API_URL } from "@/lib/constants";

ChartJS.register(ArcElement, Tooltip, Legend);

export function FraudDistribution() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [binData, setBinData] = useState([0, 0, 0, 0]);

  useEffect(() => {
    setMounted(true);

    fetch(`${API_URL}/fraud-distribution`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const bins = json.data.bins;
          setBinData([
            bins["$0-$10"] || 0,
            bins["$10-$100"] || 0,
            bins["$100-$1000"] || 0,
            bins["$1000+"] || 0,
          ]);
        }
      })
      .catch((err) => console.error("Error loading fraud distribution:", err));
  }, []);

  if (!mounted) {
    return (
      <div className="h-[250px] bg-muted/20 animate-pulse rounded-md"></div>
    );
  }

  const isDark = theme === "dark";

  const data = {
    labels: ["$0-$10", "$10-$100", "$100-$1000", "$1000+"],
    datasets: [
      {
        label: "Fraud Distribution",
        data: binData,
        backgroundColor: [
          isDark ? "rgba(96, 165, 250, 0.8)" : "rgba(59, 130, 246, 0.8)",
          isDark ? "rgba(52, 211, 153, 0.8)" : "rgba(16, 185, 129, 0.8)",
          isDark ? "rgba(248, 113, 113, 0.8)" : "rgba(239, 68, 68, 0.8)",
          isDark ? "rgba(251, 191, 36, 0.8)" : "rgba(245, 158, 11, 0.8)",
        ],
        borderColor: [
          isDark ? "rgba(96, 165, 250, 1)" : "rgba(59, 130, 246, 1)",
          isDark ? "rgba(52, 211, 153, 1)" : "rgba(16, 185, 129, 1)",
          isDark ? "rgba(248, 113, 113, 1)" : "rgba(239, 68, 68, 1)",
          isDark ? "rgba(251, 191, 36, 1)" : "rgba(245, 158, 11, 1)",
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "right",
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
    <div className="h-[250px]">
      <Doughnut data={data} options={options} />
    </div>
  );
}
