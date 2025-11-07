import React, { useState, useEffect, useRef } from "react";
// Charts
import {
  Chart,
  LineController,
  BarController,
  PieController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

Chart.register(
  LineController,
  BarController,
  PieController,
  LineElement,
  BarElement,
  ArcElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Title,
  Tooltip,
  Legend
);
function useChart(data, options, type = "line") {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!chartRef.current) return;

    // Destroy old chart if exists
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Don't create chart if data is invalid
    if (!data || !data.labels || !data.labels.length) return;

    chartInstance.current = new Chart(chartRef.current, {
      type,
      data,
      options,
    });

    return () => {
      chartInstance.current?.destroy();
      chartInstance.current = null;
    };
  }, [type, data]); // <= IMPORTANT!

  // Update data & options only
  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.data = data;
      chartInstance.current.options = options;
      chartInstance.current.update();
    }
  }, [data, options]);

  return chartRef;
}

export default useChart;
