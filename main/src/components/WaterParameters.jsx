// WaterParameters.jsx
import React, { useState, useMemo, useRef, useEffect } from "react";
import useChart from "./useChart.jsx";
import { useOutletContext } from "react-router-dom";
import {
  getDatabase,
  ref,
  onValue,
  set,
  child,
  get,
  update,
} from "firebase/database";
import { app } from "../firebase.js";
import {
  Droplet,
  TestTube,
  Thermometer,
  Wind,
  BarChart3,
  FileSpreadsheet,
} from "lucide-react";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

// ---------- Helper random functions ----------
const randFloat = (min, max, decimals = 2) =>
  parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

const TIME_LABELS = ["7AM", "9AM", "11AM", "1PM", "3PM", "5PM"];
const WEEK_LABELS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const formatDateKey = (date) =>
  date.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

// Create inclusive date array from start -> end
const dateRange = (start, end) => {
  const arr = [];
  const dt = new Date(start);
  while (dt <= end) {
    arr.push(new Date(dt));
    dt.setDate(dt.getDate() + 1);
  }
  return arr;
};

// ---------- Mock generation rules (as requested) ----------
// - Dates: Oct 29, 2025 -> Nov 12, 2025
// - Time slots: 7AM,9AM,11AM,1PM,3PM,5PM
// - Sensors: temperature, pH, ammonia, dissolvedOxygen, surfaceRespiration
// - surfaceRespiration: ONLY at 9AM and 3PM -> random 10..25; otherwise 0
// - Afternoon (1PM,3PM,5PM): user asked "numbers random from 10 to 25 in the afternoon".
//   I applied that 10..25 range to dissolvedOxygen in the afternoon to match your explicit request.
//   Temperature/pH/ammonia use realistic ranges (temp ~22-29, pH ~6.8-7.8, ammonia ~0-0.06).

async function ensureMockDataInFirebase(db) {
  const start = new Date(2025, 9, 29); // Oct is month 9 (0-based)
  const end = new Date(2025, 10, 12); // Nov 12, 2025
  const dates = dateRange(start, end).map(formatDateKey);

  const baseRef = ref(db, "sensors/analytics");

  // Read existing analytics
  const snap = await get(baseRef);
  const existing = snap.exists() ? snap.val() : {};

  const updates = {}; // collect updates to run as a single update()

  for (const dateKey of dates) {
    // If date exists, skip generating for that date to avoid overwriting
    if (existing && existing[dateKey]) continue;

    // Build day object
    const dayObj = {};
    for (const time of TIME_LABELS) {
      // surfaceRespiration rules
      const surfaceRespiration =
        time === "9AM" || time === "3PM" ? randInt(10, 25) : 0;

      // afternoon dissolvedOxygen per your 10..25 requirement
      const isAfternoon = ["1PM", "3PM", "5PM"].includes(time);

      const temperature = isAfternoon
        ? randFloat(24, 28, 1)
        : randFloat(22, 26, 1); // °C
      const pH = isAfternoon ? randFloat(7.0, 7.8, 2) : randFloat(6.8, 7.6, 2);
      const ammonia = randFloat(0, 0.06, 3); // mg/L
      const dissolvedOxygen = isAfternoon
        ? randInt(10, 25) // following your "10-25 in afternoon" instruction
        : randFloat(4, 8, 2); // otherwise reasonable DO value

      dayObj[time] = {
        temperature,
        pH,
        ammonia,
        dissolvedOxygen,
        surfaceRespiration,
      };
    }

    updates[`${dateKey}`] = dayObj;
  }

  if (Object.keys(updates).length) {
    // Use update to write only missing dates
    await update(baseRef, updates);
    console.log(
      "✅ Mock analytics written for missing dates:",
      Object.keys(updates)
    );
  } else {
    console.log("ℹ️ Mock analytics already present for all dates.");
  }
}

// ---------- Main component ----------
function WaterParameters() {
  const [chartType, setChartType] = useState("line");
  const [chart, setChart] = useState("temperature");
  const [chartPeriod, setChartPeriod] = useState("daily");
  const chartFocus = useRef();
  const { readings } = useOutletContext();
  const [analytics, setAnalytics] = useState(null);
  const [loadedDateKeys, setLoadedDateKeys] = useState([]);

  useEffect(() => {
    const db = getDatabase(app);

    // Ensure mock data exists (will not overwrite existing dates)
    ensureMockDataInFirebase(db).catch((err) =>
      console.error("Mock data generation error:", err)
    );

    // Listen to all sensors/analytics and filter client-side to our date range
    const dbRef = ref(db, "/sensors/analytics");

    const unsubscribe = onValue(
      dbRef,
      (snapshot) => {
        const val = snapshot.exists() ? snapshot.val() : null;
        if (!val) {
          setAnalytics(null);
          setLoadedDateKeys([]);
          return;
        }

        // Filter keys to the date range Oct 29 -> Nov 12, 2025
        const start = new Date(2025, 9, 29);
        const end = new Date(2025, 10, 12);

        const filtered = {};
        const keptKeys = [];

        Object.keys(val).forEach((dateKey) => {
          // Try to parse dateKey using Date constructor with locale format
          // Our date keys are like "October 29, 2025"
          const parsed = new Date(dateKey);
          if (isNaN(parsed)) return; // skip malformed keys

          if (parsed >= start && parsed <= end) {
            filtered[dateKey] = val[dateKey];
            keptKeys.push(dateKey);
          }
        });

        // Sort keptKeys chronologically
        keptKeys.sort((a, b) => new Date(a) - new Date(b));

        if (keptKeys.length === 0) {
          setAnalytics(null);
          setLoadedDateKeys([]);
        } else {
          setAnalytics(filtered);
          setLoadedDateKeys(keptKeys);
        }
      },
      (error) => {
        console.error("Firebase read error:", error);
        setAnalytics(null);
        setLoadedDateKeys([]);
      }
    );

    return () => unsubscribe();
  }, []);

  // ---------- Chart helpers ----------
  // Choose labels based on period
  const timeLabels = TIME_LABELS;
  const weekLabels = WEEK_LABELS;

  // Determine daily date key to show: pick the latest available date in range
  const latestDateKey = useMemo(() => {
    if (!loadedDateKeys || loadedDateKeys.length === 0) return null;
    return loadedDateKeys[loadedDateKeys.length - 1];
  }, [loadedDateKeys]);

  // Build chart data (daily uses latestDateKey; weekly aggregates by weekday)
  const sensorData = useMemo(() => {
    const labels = chartPeriod === "daily" ? timeLabels : weekLabels;

    if (!analytics || !loadedDateKeys || loadedDateKeys.length === 0) {
      return {
        temperature: { labels, datasets: [] },
        pH: { labels, datasets: [] },
        ammonia: { labels, datasets: [] },
        dissolvedOxygen: { labels, datasets: [] },
        surfaceRespiration: { labels, datasets: [] },
      };
    }

    // DAILY getter: take values from latestDateKey (or fallback first key)
    const dailyKey = latestDateKey || loadedDateKeys[0];
    const daily = analytics?.[dailyKey] || {};

    const getDailyData = (sensor) =>
      labels.map((time) => {
        // For daily we expect timeLabels; for weekly this won't be called
        return daily?.[time]?.[sensor] ?? 0;
      });

    // WEEKLY getter: for each weekday label compute average across all dates that match that weekday
    const getWeeklyData = (sensor) =>
      labels.map((weekday) => {
        // Collect values from analytics for dates whose weekday matches
        const values = [];
        for (const dateKey of Object.keys(analytics)) {
          const d = new Date(dateKey);
          const dayName = d.toLocaleDateString("en-US", { weekday: "long" });
          if (dayName !== weekday) continue;
          const dayObj = analytics[dateKey];
          if (!dayObj) continue;
          // For weekly aggregation we average across all time slots in that day
          // But we want a single value per weekday consistent with your previous logic.
          // We'll average across all time slots for the chosen sensor on that date.
          const times = Object.values(dayObj);
          for (const t of times) {
            if (t && typeof t[sensor] !== "undefined")
              values.push(Number(t[sensor]));
          }
        }
        const valid = values.filter(
          (v) => !isNaN(v) && v !== null && v !== undefined
        );
        if (valid.length === 0) return 0;
        const avg = valid.reduce((a, b) => a + b, 0) / valid.length;
        return parseFloat(avg.toFixed(sensor === "ammonia" ? 3 : 2));
      });

    const getter = chartPeriod === "daily" ? getDailyData : getWeeklyData;

    return {
      temperature: {
        labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: getter("temperature"),
            backgroundColor: "rgba(255, 200, 0, 0.2)",
            borderColor: "rgba(204, 153, 0, 1)",
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.4,
          },
        ],
      },
      pH: {
        labels,
        datasets: [
          {
            label: "pH Level",
            data: getter("pH"),
            backgroundColor: "rgba(200, 230, 255, 0.2)",
            borderColor: "rgba(0, 102, 204, 1)",
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.4,
          },
        ],
      },
      ammonia: {
        labels,
        datasets: [
          {
            label: "Ammonia (mg/L)",
            data: getter("ammonia"),
            backgroundColor: "rgba(255, 150, 150, 0.2)",
            borderColor: "rgba(204, 0, 0, 1)",
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.4,
          },
        ],
      },
      dissolvedOxygen: {
        labels,
        datasets: [
          {
            label: "Dissolved Oxygen (units)",
            data: getter("dissolvedOxygen"),
            backgroundColor: "rgba(180, 255, 180, 0.2)",
            borderColor: "rgba(0, 153, 51, 1)",
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.4,
          },
        ],
      },
      surfaceRespiration: {
        labels,
        datasets: [
          {
            label: "Surface Respiration (detections/min)",
            data: getter("surfaceRespiration"),
            backgroundColor: "rgba(200,200,255,0.2)",
            borderColor: "rgba(51,51,204,1)",
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.4,
          },
        ],
      },
    };
  }, [chartPeriod, analytics, loadedDateKeys, latestDateKey]);

  // ---------- Excel export ----------
  const exportToExcel = () => {
    if (!analytics) return alert("No analytics data to export!");
    const rows = [];
    for (const [day, times] of Object.entries(analytics)) {
      for (const [time, values] of Object.entries(times)) {
        rows.push({
          Day: day,
          Time: time,
          Temperature: values.temperature ?? "-",
          pH: values.pH ?? "-",
          Ammonia: values.ammonia ?? "-",
          DissolvedOxygen: values.dissolvedOxygen ?? "-",
          SurfaceRespiration: values.surfaceRespiration ?? "-",
        });
      }
    }

    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Water Analytics");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(
      blob,
      `Water_Analytics_${new Date().toISOString().split("T")[0]}.xlsx`
    );
  };

  // ---------- Chart hook ----------
  const chartKey = chart === "fishBehavior" ? "surfaceRespiration" : chart;
  const chartRef = useChart(
    sensorData[chartKey],
    { responsive: true, maintainAspectRatio: false },
    chartType
  );

  // ---------- Render ----------
  return (
    <div className="w-full min-h-[clamp(600px,90vh,750px)] flex flex-col lg:flex-row overflow-x-auto gap-4 p-4">
      {/* SENSOR CARDS */}
      <section className="flex-1 flex flex-col gap-4 lg:ml-4 min-w-[280px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["ammonia", "pH", "temperature", "fishBehavior"].map((param) => (
            <div
              key={param}
              onClick={() => {
                setChart(
                  param === "fishBehavior" ? "surfaceRespiration" : param
                );
                chartFocus.current?.scrollIntoView({ behavior: "smooth" });
              }}
              className="flex flex-col items-center justify-between bg-[#edeae468] p-4 rounded-xl shadow-md cursor-pointer hover:bg-[#c9ced06d] transition h-[200px]"
            >
              <section className="flex justify-between items-center w-full">
                <h2 className="flex items-center text-[clamp(0.9rem,1vw,1.1rem)] font-semibold">
                  {param === "ammonia" && (
                    <Droplet className="h-6 w-6 mr-2 text-[#002033]" />
                  )}
                  {param === "pH" && (
                    <TestTube className="h-6 w-6 mr-2 text-[#002033]" />
                  )}
                  {param === "temperature" && (
                    <Thermometer className="h-6 w-6 mr-2 text-[#002033]" />
                  )}
                  {param === "fishBehavior" && (
                    <Wind className="h-6 w-6 mr-2 text-[#002033]" />
                  )}
                  {param === "ammonia"
                    ? "Ammonia Level"
                    : param === "pH"
                    ? "pH Level"
                    : param === "temperature"
                    ? "Temperature"
                    : "Dissolved Oxygen"}
                </h2>
                <h3
                  style={colorCode(
                    param === "fishBehavior" ? "surfaceRespiration" : param,
                    readings?.[param]?.current
                  )}
                  className="px-3 py-1 rounded-lg text-white text-[clamp(0.7rem,0.9vw,0.9rem)]"
                >
                  {statusText(
                    param === "fishBehavior" ? "surfaceRespiration" : param,
                    readings?.[param]?.current
                  )}
                </h3>
              </section>

              <p
                className="text-center font-bold text-[clamp(35px,2.5vw,340px)] flex items-center justify-center flex-1"
                style={colorCode(
                  param === "fishBehavior" ? "surfaceRespiration" : param,
                  readings?.[param]?.current,
                  1
                )}
              >
                {param === "fishBehavior"
                  ? readings?.fishBehavior?.current?.minute_total_detections <=
                    3
                    ? "Normal"
                    : "Above Normal"
                  : readings?.[param]?.current || "—"}{" "}
                {param === "temperature"
                  ? "°C"
                  : param === "ammonia"
                  ? "mg/L"
                  : param === "pH"
                  ? ""
                  : ""}
              </p>
              <h3 className="text-[clamp(15px,1vw,20px)] text-center font-medium">
                {param === "ammonia" && "Optimal Range: 0 - 0.02 mg/L"}
                {param === "pH" && "Optimal Range: 7.0 - 7.5"}
                {param === "temperature" && "Optimal Range: 24 - 27°C"}
                {param === "fishBehavior" &&
                  `${readings?.fishBehavior?.current?.minute_total_detections} detections/min of Surface Respiration`}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* ANALYTICS SECTION */}
      <section
        className="flex-1 flex flex-col items-center justify-between w-full lg:w-[60%] bg-[#edeae49f] rounded-xl shadow-md p-4 h-[clamp(500px,80vh,800px)] mb-10"
        ref={chartFocus}
      >
        <div className="flex justify-between items-center w-full mb-2">
          <h1 className="flex items-center text-[clamp(0.9rem,1.2vw,1.1rem)] font-medium">
            <BarChart3 className="h-6 w-6 mr-2 text-[#002033]" /> Sensor
            Analytics
          </h1>
          <button
            onClick={exportToExcel}
            className="flex items-center gap-2 px-3 py-2 bg-[#0a4668] text-white rounded-lg hover:bg-[#0e638d] transition"
          >
            <FileSpreadsheet className="w-5 h-5" /> Export Excel
          </button>
        </div>

        <div className="chart-container flex-1 w-full min-h-[250px]">
          {analytics ? (
            <canvas className="w-full h-full" ref={chartRef}></canvas>
          ) : (
            <p className="text-gray-600 text-center mt-10">
              No data available yet for this date range.
            </p>
          )}
        </div>

        <div className="chart-descriptions mt-4 flex flex-col items-start w-full">
          <div className="period-toggle-container flex gap-4 bg-gray-200 p-3 rounded-lg text-gray-800 font-medium text-[clamp(0.7rem,0.9vw,0.9rem)]">
            {["daily", "weekly"].map((period) => (
              <label key={period} className="flex items-center gap-1">
                <input
                  type="radio"
                  name="period"
                  value={period}
                  checked={chartPeriod === period}
                  onChange={() => setChartPeriod(period)}
                />
                {period.charAt(0).toUpperCase() + period.slice(1)}
              </label>
            ))}
          </div>

          <div className="mt-2 text-sm text-gray-700">
            <p>
              Showing data for dates:{" "}
              {loadedDateKeys.length
                ? `${loadedDateKeys[0]} → ${
                    loadedDateKeys[loadedDateKeys.length - 1]
                  }`
                : "—"}
            </p>
            <p>Daily view shows the latest date in range by default.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default WaterParameters;

// ------------------ COLOR & STATUS FUNCTIONS ------------------
const colorCode = (sensor, readings, val) => {
  if (readings === undefined)
    return val === 1 ? { color: "#D3D3D3" } : { backgroundColor: "#D3D3D3" };

  let styleColor = "#D3D3D3";
  const darkGreen = "#008000";
  const midYellow = "#CC9900";

  switch (sensor) {
    case "temperature":
      styleColor =
        readings >= 24 && readings <= 27
          ? darkGreen
          : readings > 27 && readings <= 28
          ? midYellow
          : readings < 24 && readings >= 22
          ? midYellow
          : "#de2e2e";
      break;
    case "ammonia":
      styleColor =
        readings > 0 && readings <= 0.02
          ? darkGreen
          : readings > 0.02 && readings <= 0.05
          ? midYellow
          : "#de2e2e";
      break;
    case "pH":
      styleColor =
        readings >= 7.0 && readings <= 7.5
          ? darkGreen
          : (readings >= 6.8 && readings < 7.0) ||
            (readings > 7.5 && readings <= 7.7)
          ? midYellow
          : "#de2e2e";
      break;
    case "surfaceRespiration":
      styleColor = readings <= 3 ? darkGreen : "#de2e2e";
      break;
    default:
      styleColor = "#D3D3D3";
  }
  return val === 1 ? { color: styleColor } : { backgroundColor: styleColor };
};

const statusText = (sensor, readings) => {
  if (readings === undefined) return "No Data";
  switch (sensor) {
    case "temperature":
      return readings >= 24 && readings <= 27
        ? "Good"
        : readings > 27 && readings <= 28
        ? "Moderate"
        : readings < 24 && readings >= 22
        ? "Moderate"
        : "Bad";
    case "ammonia":
      return readings > 0 && readings <= 0.02
        ? "Good"
        : readings > 0.02 && readings <= 0.05
        ? "Moderate"
        : "Bad";
    case "pH":
      return readings >= 7.0 && readings <= 7.5
        ? "Good"
        : (readings >= 6.8 && readings < 7.0) ||
          (readings > 7.5 && readings <= 7.7)
        ? "Moderate"
        : "Bad";
    case "surfaceRespiration":
      return readings <= 3 ? "Good" : "Bad";
    default:
      return "Unknown";
  }
};
