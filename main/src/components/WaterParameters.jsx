import React, { useState, useMemo, useRef, useEffect } from "react";
import useChart from "./useChart.jsx";
import { useOutletContext } from "react-router-dom";
import { getDatabase, ref, onValue } from "firebase/database";
import { app } from "../firebase.js";
import { Droplet, TestTube, Thermometer, Wind, BarChart3 } from "lucide-react";

// ------------------ MAIN COMPONENT ------------------
function WaterParameters() {
  const [chartType, setChartType] = useState("line");
  const [chart, setChart] = useState("temperature");
  const [chartPeriod, setChartPeriod] = useState("daily"); // "daily" or "weekly"
  const chartFocus = useRef();
  const { readings } = useOutletContext();
  // ------------------ Firebase Listener ------------------
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    const db = getDatabase(app);
    const now = new Date();
    const year = now.getFullYear();
    const weekNumber = Math.ceil(
      ((now - new Date(year, 0, 1)) / 86400000 +
        new Date(year, 0, 1).getDay() +
        1) /
        7
    );

    const dbRef = ref(db, `/analytics/week-${year}-${weekNumber}`);
    const unsubscribe = onValue(dbRef, (snapshot) => {
      setAnalytics(snapshot.val());
    });

    return () => unsubscribe();
  }, []);

  // ------------------ Helpers ------------------
  const todayName = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const timeLabels = ["7AM", "9AM", "11AM", "1PM", "3PM", "5PM"];
  const weekLabels = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // ------------------ Build Chart Data ------------------
  const sensorData = useMemo(() => {
    const labels = chartPeriod === "daily" ? timeLabels : weekLabels;
    const daily = analytics?.[todayName] || {};
    const weekly = analytics || {};

    const getDailyData = (sensor) =>
      labels.map((time) => daily?.[time]?.[sensor] ?? 0);

    const getWeeklyData = (sensor) =>
      labels.map((day) => {
        const dayData = weekly?.[day];
        if (!dayData) return 0;
        const values = Object.values(dayData).map((v) => v[sensor] ?? 0);
        const valid = values.filter((v) => v > 0);
        const avg = valid.length
          ? valid.reduce((a, b) => a + b, 0) / valid.length
          : 0;
        return parseFloat(avg.toFixed(2));
      });

    const activeGetter = chartPeriod === "daily" ? getDailyData : getWeeklyData;

    return {
      temperature: {
        labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data: activeGetter("temperature"),
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
            data: activeGetter("pH"),
            backgroundColor: "rgba(255, 200, 0, 0.2)",
            borderColor: "rgba(204, 153, 0, 1)",
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
            label: "Ammonia (ppm)",
            data: activeGetter("ammonia"),
            backgroundColor: "rgba(255, 200, 0, 0.2)",
            borderColor: "rgba(204, 153, 0, 1)",
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.4,
          },
        ],
      },
    };
  }, [chartPeriod, analytics]);

  // ------------------ Chart Hook ------------------
  const chartRef = useChart(
    sensorData[chart],
    {
      responsive: true,
      maintainAspectRatio: false,
    },
    chartType
  );

  // ------------------ Component Return ------------------
  return (
    <div className="w-full min-h-[clamp(600px,90vh,750px)] flex flex-col lg:flex-row overflow-x-auto gap-4 p-4">
      {/* SENSOR DATA CARDS */}
      <section className="flex-1 flex flex-col gap-4 lg:ml-4 min-w-[280px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {["ammonia", "pH", "temperature", "fishBehavior"].map((param) => (
            <div
              key={param}
              onClick={() => {
                setChart(param);
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
                  style={colorCode(param, readings?.[param]?.current)}
                  className="px-3 py-1 rounded-lg text-white text-[clamp(0.7rem,0.9vw,0.9rem)]"
                >
                  {statusText(param, readings?.[param]?.current)}
                </h3>
              </section>
              <p
                className="text-center font-bold text-[clamp(35px,2.5vw,340px)] flex items-center justify-center flex-1"
                style={colorCode(param, readings?.[param]?.current, 1)}
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

      {/* SENSOR ANALYTICS SECTION */}
      <section
        className="flex-1 flex flex-col items-center justify-between w-full lg:w-[60%] bg-[#edeae49f] rounded-xl shadow-md p-4 h-[clamp(500px,80vh,800px)] mb-10"
        ref={chartFocus}
      >
        <h1 className="flex items-center w-full text-[clamp(0.9rem,1.2vw,1.1rem)] font-medium mb-2">
          <BarChart3 className="h-6 w-6 mr-2 text-[#002033]" /> Sensor Analytics
        </h1>

        <div className="chart-container flex-1 w-full min-h-[250px]">
          <canvas className="w-full h-full" ref={chartRef}></canvas>
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
        </div>
      </section>
    </div>
  );
}

export default WaterParameters;

const colorCode = (sensor, readings, val) => {
  if (readings === undefined)
    return val === 1 ? { color: "#D3D3D3" } : { backgroundColor: "#D3D3D3" };

  let styleColor = "#D3D3D3";
  const darkMustard = "#008000"; // dark mustard for optimal/good
  const midMustard = "#CC9900"; // slightly lighter mustard for moderate

  switch (sensor) {
    case "temperature":
      styleColor =
        readings >= 24 && readings <= 27
          ? darkMustard
          : readings > 27 && readings <= 28
          ? midMustard
          : readings < 24 && readings >= 22
          ? midMustard
          : "#de2e2e";
      break;
    case "ammonia":
      styleColor =
        readings > 0 && readings <= 0.02
          ? "#008000"
          : readings > 0.02 && readings <= 0.05
          ? midMustard
          : "#de2e2e";
      break;
    case "pH":
      styleColor =
        readings >= 7.0 && readings <= 7.5
          ? darkMustard
          : (readings >= 6.8 && readings < 7.0) ||
            (readings > 7.5 && readings <= 7.7)
          ? midMustard
          : "#de2e2e";
      break;
    case "fishBehavior":
      styleColor =
        readings?.fishBehavior?.current?.minute_total_detections <= 3
          ? "#008000"
          : "#008000";
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
        : readings > 0.05
        ? "Bad"
        : "none";
    case "pH":
      return readings >= 7.0 && readings <= 7.5
        ? "Good"
        : (readings >= 6.8 && readings < 7.0) ||
          (readings > 7.5 && readings <= 7.7)
        ? "Moderate"
        : "Bad";
    case "fishBehavior":
      return readings?.fishBehavior?.current?.minute_total_detections <= 3
        ? "Bad"
        : "Good";
    default:
      return "Unknown";
  }
};
