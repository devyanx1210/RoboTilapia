import React, { useState, useMemo, useEffect, useRef } from "react";
import useChart from "./useChart.jsx";
import { useOutletContext } from "react-router-dom";

// Assets
import ammoniaIcon from "/src/assets/monitoring-icons/ammonia.png";
import tempIcon from "/src/assets/monitoring-icons/temperature.png";
import pHIcon from "/src/assets/monitoring-icons/pH.png";
import DOIcon from "/src/assets/monitoring-icons/dissolved-oxygen.png";
import analyticsIcon from "/src/assets/monitoring-icons/analytics.png";
import { Droplet, TestTube, Thermometer, Wind, BarChart3 } from "lucide-react";

function WaterParameters() {
  // Sample data for chart for hourly readings
  const [chartType, setChartType] = useState("line");
  const [chart, setChart] = useState("ammonia");
  const chartFocus = useRef();
  const [chartPeriod, setChartPeriod] = useState("daily"); // "daily" or "weekly"
  const { tmpReadings, readings, schedArr } = useOutletContext();

  // create
  const temperatureReading = useMemo(
    () => ({
      labels: ["7:00AM", "9:00AM", "11:00AM", "1:00PM", "3:00PM", "5:00PM"],
      datasets: [
        {
          label: "Temperature (°C)",
          data: [25, 25, 27, 28, 27, 27],
          backgroundColor: "rgba(0, 255, 255, 0.2)", // translucent fill
          borderColor: "rgba(0, 157, 255, 1)", // vibrant line
          borderWidth: 3, // slightly thicker line
          pointBackgroundColor: "rgba(0, 255, 255, 1)",
          pointBorderColor: "#fff",
          pointRadius: 5,
          tension: 0.4, // smooth curves
          yAxisID: "y",
        },
      ],
    }),
    []
  );

  const sensorData1 = useMemo(() => {
    // Labels based on daily or weekly toggle
    const labels =
      chartPeriod === "daily"
        ? ["7:00AM", "9:00AM", "11:00AM", "1:00PM", "3:00PM", "5:00PM"]
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return {
      temperature: {
        labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data:
              chartPeriod === "daily"
                ? [25, 25, 27, 28, 27, 27]
                : [26, 27, 26, 28, 27, 26, 27], // weekly sample
            backgroundColor: "rgba(0, 255, 255, 0.2)", // neon fill
            borderColor: "rgba(0, 157, 255, 1)", // vibrant line
            borderWidth: 3,
            pointBackgroundColor: "rgba(0, 255, 255, 1)",
            pointBorderColor: "#fff",
            pointRadius: 5,
            tension: 0.4,
            yAxisID: "y",
          },
        ],
      },
      pH: {
        labels,
        datasets: [
          {
            label: "pH Level",
            data:
              chartPeriod === "daily"
                ? [7.0, 7.2, 7.1, 8.2, 8.1, 8.5]
                : [7.1, 7.2, 7.3, 7.4, 7.2, 7.3, 7.1],
            backgroundColor: "rgba(144, 238, 144, 0.2)", // translucent green
            borderColor: "rgba(67, 213, 67, 1)", // vibrant green line
            borderWidth: 3,
            pointBackgroundColor: "rgba(144, 238, 144, 1)",
            pointBorderColor: "#fff",
            pointRadius: 5,
            tension: 0.4,
            yAxisID: "y1",
          },
        ],
      },
      ammonia: {
        labels,
        datasets: [
          {
            label: "Ammonia (ppm)",
            data:
              chartPeriod === "daily"
                ? [0.2, 0.0, 0.5, 0.3, 0.1, 0.5]
                : [0.3, 0.2, 0.5, 0.4, 0.3, 0.2, 0.1],
            backgroundColor: "rgba(255, 105, 180, 0.2)", // pinkish translucent
            borderColor: "rgba(255, 105, 180, 1)", // vibrant pink line
            borderWidth: 3,
            pointBackgroundColor: "rgba(255, 105, 180, 1)",
            pointBorderColor: "#fff",
            pointRadius: 5,
            tension: 0.4,
            yAxisID: "y2",
          },
        ],
      },
    };
  }, [chartPeriod]); // update when chartPeriod changes

  const sensorData = useMemo(() => {
    const labels =
      chartPeriod === "daily"
        ? ["7:00AM", "9:00AM", "11:00AM", "1:00PM", "3:00PM", "5:00PM"]
        : ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    const dailyReadings = readings?.sensors?.daily?.[todayDate] || {};
    const weeklyReadings = readings?.sensors?.weekly?.[thisWeek] || {};

    return {
      temperature: {
        labels,
        datasets: [
          {
            label: "Temperature (°C)",
            data:
              chartPeriod === "daily"
                ? labels.map((l) => dailyReadings[l]?.temperature || 0)
                : labels.map((d) => weeklyReadings[d]?.avgTemperature || 0),
            backgroundColor: "rgba(0, 255, 255, 0.2)",
            borderColor: "rgba(0, 157, 255, 1)",
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.4,
            yAxisID: "y",
          },
        ],
      },
      pH: {
        labels,
        datasets: [
          {
            label: "pH Level",
            data:
              chartPeriod === "daily"
                ? labels.map((l) => dailyReadings[l]?.pH || 0)
                : labels.map((d) => weeklyReadings[d]?.avgPH || 0),
            backgroundColor: "rgba(144, 238, 144, 0.2)",
            borderColor: "rgba(67, 213, 67, 1)",
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.4,
            yAxisID: "y1",
          },
        ],
      },
      ammonia: {
        labels,
        datasets: [
          {
            label: "Ammonia (ppm)",
            data:
              chartPeriod === "daily"
                ? labels.map((l) => dailyReadings[l]?.ammonia || 0)
                : labels.map((d) => weeklyReadings[d]?.avgAmmonia || 0),
            backgroundColor: "rgba(255, 105, 180, 0.2)",
            borderColor: "rgba(255, 105, 180, 1)",
            borderWidth: 3,
            pointRadius: 5,
            tension: 0.4,
            yAxisID: "y2",
          },
        ],
      },
    };
  }, [chartPeriod, readings]);

  // Focus to chart and set chart
  const activateChart = (e) => {
    const readings = e.target.className;
    console.log(readings);
    setChart(readings);

    // Scroll to the chart section
    if (chartRef.current) {
      chartRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  const sensorOptions = useMemo(() => ({}), []);
  const options = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          type: "linear",
          position: "left",
          title: { display: true, text: "Temperature (°C)" },
        },
        // y1: {
        //   type: "linear",
        //   position: "right",
        //   grid: { drawOnChartArea: false },
        //   title: { display: true, text: "pH" },
        // },
        // y2: {
        //   type: "linear",
        //   position: "right",
        //   grid: { drawOnChartArea: false },
        //   title: { display: true, text: "Ammonia (ppm)" },
        //   offset: true,
        // },
      },
    }),
    []
  );
  const chartRef = useChart(
    sensorData[chart],
    {
      responsive: true, // automatically resizes chart on window resize
      maintainAspectRatio: false, // allows chart to fill parent container
    },
    chartType
  );
  return (
    <div className="w-full min-h-[clamp(600px,90vh,750px)]   sm:[@media(min-width:800px)]:h-[2000px] md:h-[2000px] md:min-h-[400px] flex flex-col lg:flex-row overflow-x-auto lg:overflow-auto lg:overflow-x-hidden gap-4 p-4 scrollbar-thin scrollbar-thumb-slate-400 scrollbar-track-transparent">
      {/* Sensor Data Section */}
      <section className="flex-1 flex flex-col gap-4 lg:ml-4 min-w-[280px] lg:min-w-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Sensor Cards */}
          {["ammonia", "pH", "temperature", "fishBehavior"].map((param) => (
            <div
              key={param}
              onClick={() => {
                setChart(param); // update chart
                // scroll to chart section
                chartFocus.current?.scrollIntoView({
                  behavior: "smooth",
                  block: "start",
                });
              }}
              className={`flex flex-col items-center justify-between bg-[#edeae468] p-4 rounded-xl shadow-md cursor-pointer hover:bg-[#c9ced06d] transition h-[200px] sm:h-auto sm:min-h-[240px] w-full`}
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
                  style={colorCode(param, readings?.[param].current)}
                  className="px-3 py-1 rounded-lg text-white text-[clamp(0.7rem,0.9vw,0.9rem)]"
                >
                  {statusText(param, readings?.[param].current)}
                </h3>
              </section>
              <p
                className="text-center font-bold text-[clamp(35px,2.5vw,340px)] flex items-center justify-center flex-1"
                style={colorCode(param, readings?.[param].current, 1)}
              >
                {param === "fishBehavior"
                  ? readings?.fishBehavior <= 3
                    ? "Normal"
                    : "Above Normal"
                  : readings?.[param].current}{" "}
                {param === "temperature"
                  ? "°C"
                  : param === "ammonia"
                  ? "ppm"
                  : param === "pH"}
              </p>
              <h3 className="text-[clamp(15px,1vw,20px)] text-center font-medium">
                {param === "ammonia" && "Optimal Range: 0ppm"}
                {param === "pH" && "Optimal Range: 7.0 - 7.5"}
                {param === "temperature" && "Optimal Range: 24 - 27°C"}
                {param === "fishBehavior" &&
                  `${readings?.fishBehavior} detections/min of Surface Respiration`}
              </h3>
            </div>
          ))}
        </div>
      </section>

      {/* Sensor Analytics Section */}
      <section
        className="flex-1 flex flex-col items-center justify-between w-full lg:w-[60%] min-w-[280px] min-h-[400px] overflow-hidden lg:min-w-0 bg-[#edeae49f] rounded-xl shadow-md p-4 h-[clamp(500px,80vh,800px)] lg:mb-0 mb-10"
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

// Function for styles (color code)
// Function for styles (color code)
const colorCode = (sensor, readings, val) => {
  if (readings === undefined) {
    return val === 1 ? { color: "#D3D3D3" } : { backgroundColor: "#D3D3D3" };
  }

  let styleColor = "#D3D3D3"; // fallback

  switch (sensor) {
    case "temperature": {
      if (readings >= 24 && readings <= 27) {
        styleColor = "#118711ff"; // green
      } else if (
        (readings > 27 && readings <= 28) ||
        (readings < 24 && readings >= 22)
      ) {
        styleColor = "#E6C200"; // medium golden yellow
      } else {
        styleColor = "#de2e2e"; // red
      }
      break;
    }

    case "ammonia": {
      if (readings === 0) {
        styleColor = "#118711ff"; // green
      } else if (readings > 0 && readings <= 0.02) {
        styleColor = "#E6C200"; // medium golden yellow
      } else {
        styleColor = "#de2e2e"; // red
      }
      break;
    }

    case "pH": {
      if (readings >= 7.0 && readings <= 7.5) {
        styleColor = "#118711ff"; // green
      } else if (
        (readings >= 6.8 && readings < 7.0) ||
        (readings > 7.5 && readings <= 7.7)
      ) {
        styleColor = "#E6C200"; // medium golden yellow
      } else {
        styleColor = "#de2e2e"; // red
      }
      break;
    }

    case "fishBehavior": {
      if (readings >= 0 && readings <= 3) {
        styleColor = "#118711ff"; // green
      } else {
        styleColor = "#de2e2e"; // red
      }
      break;
    }

    default:
      styleColor = "#D3D3D3";
  }

  return val === 1 ? { color: styleColor } : { backgroundColor: styleColor };
};

// Status Text
// Function for status text
const statusText = (sensor, readings) => {
  if (readings === undefined) return "No Data";

  switch (sensor) {
    case "temperature": {
      // Optimal: 24–27 °C
      if (readings >= 24 && readings <= 27) {
        return "Good";
      } else if (
        (readings > 27 && readings <= 28) ||
        (readings < 24 && readings >= 22)
      ) {
        return "Moderate";
      } else {
        return "Bad";
      }
    }

    case "ammonia": {
      // Optimal: 0 ppm
      if (readings === 0) {
        return "Good";
      } else if (readings > 0 && readings <= 0.02) {
        return "Moderate";
      } else {
        return "Bad";
      }
    }

    case "pH": {
      // Optimal: 7.0–7.5
      if (readings >= 7.0 && readings <= 7.5) {
        return "Good";
      } else if (
        (readings >= 6.8 && readings < 7.0) ||
        (readings > 7.5 && readings <= 7.7)
      ) {
        return "Moderate";
      } else {
        return "Bad";
      }
    }

    case "fishBehavior": {
      // Optimal: 0–3 detections/min
      if (readings >= 0 && readings <= 3) {
        return "Good";
      } else {
        return "Bad";
      }
    }

    default:
      return "Unknown";
  }
};
