import React, { useEffect, useState } from "react";
import FeedingSchedule from "./FeedingSchedule.jsx";
import { useOutletContext } from "react-router-dom";
import "../index.css";
import {
  Gauge,
  Clock,
  PlusCircle,
  ListChecks,
  AlertTriangle,
  Info,
  CheckCircle,
  Edit3,
  Save,
  Lightbulb,
} from "lucide-react";
import {
  useReadDatabase,
  useAddSchedule,
  useUpdateSchedule,
  useSoftDeleteSchedule,
  useDeleteSchedule,
  useUpdateOperationDetails,
  usedeleteOperationDetails,
  useSaveOperationDetails,
  useUpdateAllSchedule,
} from "./utils.jsx";
import FeedingAerationSettings from "./FeedingAerationSettings.jsx";
import { getDatabase } from "firebase/database";

function FeedingManagement() {
  const { readings } = useOutletContext();
  const [defaultFeedingSchedule, setDefaultFeedSched] = useState([
    { schedId: 1, time: "7:30", amount: 0.5 },
    { schedId: 2, time: "16:30", amount: 0.5 },
  ]);
  const feedingSchedules = useReadDatabase(
    "/machines/machine0/feedingSched/custom"
  );
  const defaultFeedingScheduleDB = useReadDatabase(
    "/machines/machine0/feedingSched/default"
  );

  const operationDetailsDB = useReadDatabase(
    "/machines/machine0/operationDetails"
  );
  console.log(operationDetailsDB);
  console.log(feedingSchedules);
  const { addSchedule } = useAddSchedule("machine0");
  const { updateSchedule } = useUpdateSchedule("machine0");
  const { softDeleteSchedule } = useSoftDeleteSchedule("machine0");
  const { deleteSchedule } = useDeleteSchedule("machine0");
  const { updateOperationDetails } = useUpdateOperationDetails("machine0");
  const { deleteOperationDetails } = usedeleteOperationDetails("machine0");
  const { saveOperationDetails } = useSaveOperationDetails("machine0");
  const { updateAllSchedule } = useUpdateAllSchedule("machine0");

  const [feedSched, setFeedSched] = useState({
    feedSched: "",
    feedAmount: "",
  });
  const [operationDetails, setOperationDetails] = useState({
    numberOfFish: "",
    fishWeight: "",
    fishStage: "",
    feedPerDay: "",
    feedSize: "",
    feedShape: "",
    totalFeedUsed: "",
    stockingWeight: "",
    harvestWeight: "",
    fcr: "",
    pondLength: "",
    pondWidth: "",
    pondDepth: "",
    aerationDuration: "",
  });
  console.log(operationDetails);

  const [showAdvanced, setShowAdvanced] = useState(false);
  const [schedArr, setSchedArr] = useState([]);
  const [count, setCount] = useState({ activeCount: 0, deletedCount: 0 });
  // Local mirror for smooth typing experience

  const [localReadings, setLocalReadings] = useState({});

  // Sync from DB whenever Firebase data changes
  useEffect(() => {
    if (operationDetailsDB?.readings) {
      setLocalReadings(operationDetailsDB.readings);
    }
  }, [operationDetailsDB?.readings]);

  // Auto-calc FCR: Total Feed Used / (Harvest Weight - Stocking Weight)
  useEffect(() => {
    const totalFeed = parseFloat(operationDetailsDB?.readings?.totalFeedUsed);
    const harvest = parseFloat(operationDetailsDB?.readings?.harvestWeight);
    const stock = parseFloat(operationDetailsDB?.readings?.stockingWeight);
    if (totalFeed > 0 && harvest > stock) {
      const calc = (totalFeed / (harvest - stock)).toFixed(2);
      setOperationDetails((prev) => ({ ...prev, fcr: calc }));
      updateOperationDetails({ fcr: calc });
      console.log(calc);
    } else {
      setOperationDetails((prev) => ({ ...prev, fcr: "" }));
      updateOperationDetails({ fcr: "" });
    }
  }, [
    operationDetailsDB?.readings?.totalFeedUsed,
    operationDetailsDB?.readings?.harvestWeight,
    operationDetailsDB?.readings?.stockingWeight,
  ]);

  // Auto-calc Aeration Duration based on Pond Volume (m³)
  useEffect(() => {
    const L = parseFloat(operationDetailsDB?.readings?.pondLength);
    const W = parseFloat(operationDetailsDB?.readings?.pondWidth);
    const D = parseFloat(operationDetailsDB?.readings?.pondDepth);
    if (L > 0 && W > 0 && D > 0) {
      const volume = L * W * D;
      const duration = Math.max(2, Math.min((volume / 50).toFixed(1), 12));
      setOperationDetails((prev) => ({ ...prev, aerationDuration: duration }));
    } else {
      setOperationDetails((prev) => ({ ...prev, aerationDuration: "" }));
    }
  }, [
    operationDetailsDB?.readings?.pondLength,
    operationDetailsDB?.readings?.pondWidth,
    operationDetailsDB?.readings?.pondDepth,
  ]);

  // Auto-calc feed per day
  const [feedRate, setFeedRate] = useState("");
  useEffect(() => {
    // Function to determine feed rate (% of body weight per day)
    const getFeedingRate = (stage) => {
      switch (stage) {
        case "Fry":
          return 25; // 20–30% of body weight/day
        case "Fingerling":
          return 5; // 3–7%
        case "Juvenile":
          return 4.5; // 3–6%
        case "Adult":
          return 2.75; // 1.5–4%
        default:
          return 0;
      }
    };

    // Extract inputs
    const numFish = Number(operationDetailsDB?.readings?.numberOfFish) || 0;
    const avgWeight = Number(operationDetailsDB?.readings?.fishWeight) || 0;
    const fishStage = operationDetailsDB?.readings?.fishStage;

    // Get feed rate based on fish stage
    const feedRate = getFeedingRate(fishStage);
    setFeedRate(feedRate);

    // Calculate Feed Per Day (kg)
    // Formula: feedPerDay = (number × weight × feedRate) / 100
    const feedPerDay =
      numFish > 0 && avgWeight > 0 && feedRate > 0
        ? ((numFish * avgWeight * feedRate) / 100).toFixed(2)
        : "";

    // Update state and database
    setOperationDetails((prev) => ({ ...prev, feedPerDay: feedPerDay }));
    updateOperationDetails({ feedPerDay: feedPerDay });
    updateOperationDetails({ feedRate: feedRate });

    console.log("Feed per day (kg):", feedPerDay);
  }, [
    operationDetailsDB?.readings?.numberOfFish,
    operationDetailsDB?.readings?.fishWeight,
    operationDetailsDB?.readings?.fishStage,
  ]);

  useEffect(() => {
    if (defaultFeedingScheduleDB.readings) {
      setDefaultFeedSched(Object.values(defaultFeedingScheduleDB.readings));
    }
  }, [defaultFeedingScheduleDB.readings]);

  const handleAddSchedule = (e) => {
    e.preventDefault();
    const { feedSched: time, feedAmount } = feedSched;
    if (!time || !feedAmount || feedAmount <= 0 || feedAmount >= 1)
      return alert("Please enter a valid feed amount between 0.01 and 0.99 kg");

    addSchedule(time, feedAmount);
    setFeedSched({ feedSched: "", feedAmount: "" });
  };

  // clear all operation details in firebase database
  const handleClearAll = () =>
    updateOperationDetails({
      numberOfFish: "",
      fishWeight: "",
      fishStage: "",
      feedPerDay: "",
      feedRate: "",
      feedSize: "",
      feedShape: "",
      totalFeedUsed: "",
      stockingWeight: "",
      harvestWeight: "",
      fcr: "",
      pondLength: "",
      pondWidth: "",
      pondDepth: "",
      aerationDuration: "",
    });

  useEffect(() => {
    if (feedingSchedules.readings)
      setSchedArr(Object.values(feedingSchedules.readings));
  }, [feedingSchedules.readings]);

  useEffect(() => {
    let active = 0,
      deleted = 0;
    schedArr.forEach((s) => {
      if (s.isDeleted) deleted++;
      if (s.isActive) active++;
    });
    setCount({ activeCount: active, deletedCount: deleted });
  }, [schedArr]);

  const hasAdvanced =
    operationDetailsDB?.readings?.numberOfFish ||
    operationDetailsDB?.readings?.fishWeight ||
    operationDetailsDB?.readings?.fishStage ||
    operationDetailsDB?.readings?.feedSize ||
    operationDetailsDB?.readings?.feedShape ||
    operationDetailsDB?.readings?.harvestWeight ||
    operationDetailsDB?.readings?.stockingWeight ||
    operationDetailsDB?.readings?.totalFeedUsed ||
    operationDetailsDB?.readings?.pondLength ||
    operationDetailsDB?.readings?.pondWidth ||
    operationDetailsDB?.readings?.pondDepth;
  const summaryMessage = hasAdvanced ? (
    <div className="space-y-1 text-sm">
      {/* Fish Information */}
      <p>
        <strong>Fish Count:</strong>{" "}
        {operationDetailsDB?.readings?.numberOfFish || "--"}
      </p>
      <p>
        <strong>Average Fish Weight:</strong>{" "}
        {operationDetailsDB?.readings?.fishWeight
          ? `${operationDetailsDB?.readings?.fishWeight} kg`
          : "--"}
      </p>
      <p>
        <strong>Growth Stage:</strong>{" "}
        {operationDetailsDB?.readings?.fishStage || "N/A"}
      </p>

      {/* Feed Calculation Section */}
      <p>
        <strong>Feed Required (per day):</strong>{" "}
        {`${operationDetailsDB?.readings?.feedPerDay || "0.00"} kg/day`}
      </p>

      {/* FCR Section */}
      <div className="mt-3">
        <p>
          <strong>FCR:</strong> {operationDetailsDB?.readings?.fcr || "--"}
        </p>
      </div>

      {/* Recommendations */}
      <h1 className="reccomendations-fcr text-[2vh] flex flex-col items-start mt-2">
        <span className="flex items-center mb-2 text-[#002033]">
          <Lightbulb className="h-[3vh] w-[3vh] mr-2 text-cyan-600" />
          <span className="font-semibold">Recommendations</span>
        </span>

        {operationDetailsDB?.readings?.feedPerDay
          ? `Based on your fish's current growth stage and total biomass, the recommended daily feed is approximately ${operationDetailsDB?.readings?.feedPerDay} kg to support optimal growth and efficient feeding performance.`
          : "Please input the number of fish, the average fish weight, and the growth stage."}

        <br />
        <br />

        {operationDetailsDB?.readings?.fcr
          ? `Your Feed Conversion Ratio (FCR) is ${
              operationDetailsDB?.readings?.fcr >= 1.5 &&
              operationDetailsDB?.readings?.fcr <= 2.0
                ? "within the ideal range"
                : "not within the ideal range"
            }. The optimal FCR is between 1.5 and 2.0. ${
              operationDetailsDB?.readings?.fcr < 1.5
                ? "This indicates very efficient feed utilization — great job!"
                : operationDetailsDB?.readings?.fcr > 2.0
                ? "Consider adjusting your feeding practices to improve efficiency."
                : ""
            }`
          : "Please enter your FCR value to see feed efficiency recommendations."}
      </h1>
    </div>
  ) : (
    "Please include other details for more advanced operations such as FCR and aeration calculations."
  );

  // handle save and delete operation details
  return (
    <>
      {!readings && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-xl">
          <section className="flex gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100" />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200" />
          </section>
        </div>
      )}

      <div className="w-full h-full overflow-x-auto">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_1.5fr_2fr] overflow-y-hidden rounded-xl p-4 items-stretch">
          {/* LEFT SIDE */}
          <div className="grid grid-rows-2 gap-3 h-full">
            <FeedLevel readings={readings} />
            <FeedStatus
              schedArr={schedArr}
              defaultFeedingSchedule={defaultFeedingSchedule}
            />
          </div>

          {/* MIDDLE FORM */}
          <form
            onSubmit={handleAddSchedule}
            className="flex flex-col items-center rounded-xl bg-[#edeae46e] shadow-md p-3 h-[clamp(600px,55vh,800px)] overflow-y-auto"
          >
            <h2 className="flex items-center self-start text-title font-semibold mb-3">
              <PlusCircle className="mr-2 h-5 w-[] text-cyan-700" />
              Feed & Aeration Input
            </h2>

            {/* Toggle Advanced */}
            <div className="flex items-center gap-3 mb-3">
              {/* Edit Details Button */}
              {!showAdvanced && (
                <button
                  type="button"
                  onClick={() => setShowAdvanced(true)} // open advanced
                  className="flex items-center gap-2 text-[#002033] hover:text-cyan-700"
                >
                  <Edit3 className="h-[clamp(10px,5vw,15px)] w-[clamp(10px,5vw,15px)]" />
                  Edit Details
                </button>
              )}

              {/* Save Details Button */}
              {showAdvanced && (
                <button
                  type="button"
                  onClick={async () => {
                    // Get total feed per day
                    const totalFeed = parseFloat(localReadings.feedPerDay) || 0;
                    if (!totalFeed || totalFeed <= 0) {
                      alert("Please enter valid feed details first.");
                      return;
                    }

                    // Calculate per-schedule amount (split evenly)
                    const perFeedAmount = parseFloat(
                      (totalFeed / defaultFeedingSchedule.length).toFixed(2)
                    );
                    setDefaultFeedSched([
                      { schedId: 1, time: "7:30", amount: perFeedAmount },
                      { schedId: 2, time: "16:30", amount: perFeedAmount },
                    ]);

                    updateOperationDetails(localReadings);
                    updateAllSchedule(perFeedAmount);
                    setShowAdvanced(false);
                  }}
                  className="flex items-center gap-2 text-[#002033] hover:text-green-700"
                >
                  <Save className="h-[clamp(10px,5vw,15px)] w-[clamp(10px,5vw,15px)]" />
                  Save Details
                </button>
              )}
            </div>

            {/* Summary */}
            {!showAdvanced && (
              <div className="w-[100%] bg-white/60 border border-gray-300 rounded-lg p-3 mb-3 text-sm text-[#002033] h-[clamp(100px,60vh,250px)] overflow-y-auto">
                {summaryMessage}
              </div>
            )}

            {/* Advanced Section */}
            {showAdvanced && (
              <FeedingAerationSettings
                operationDetails={localReadings}
                setOperationDetails={setOperationDetails}
                handleClearAll={handleClearAll}
                onHardDeleteDetails={deleteOperationDetails}
                onShowAdvanced={setShowAdvanced}
                showAdvanced={showAdvanced}
                operationDetailsDb={operationDetailsDB}
                updateOperationDetails={updateOperationDetails}
                setLocalReadings={setLocalReadings}
              />
            )}

            {/* Input Time and Feed Amount */}
            <label className="text-[clamp(14px,1vw,20px)] mb-2 text-center">
              Input Time and Feed Amount (kg)
            </label>
            <input
              type="time"
              className="my-2 w-[80%] h-[70px] text-[clamp(1.5rem,3vw,2rem)] text-[#002033] rounded-lg border-2 border-[#002033] bg-[#7f81825b] px-3 cursor-pointer"
              value={feedSched.feedSched || ""}
              onChange={(e) =>
                setFeedSched({ ...feedSched, feedSched: e.target.value })
              }
              required
            />
            <div className="flex flex-row justify-between items-center w-[80%]">
              <input
                type="number"
                placeholder="Feed Amount (kg)"
                step="0.01"
                className="my-3 text-[clamp(10px,2.3vh,20px)] w-[50%] h-[70px] text-center text-[#002033] rounded-lg border-2 border-[#002033] bg-[#7f81825b]"
                value={feedSched.feedAmount || ""}
                onChange={(e) => {
                  let val = parseFloat(e.target.value);
                  if (isNaN(val) || val <= 0) val = "";
                  else if (val > 0.99) val = 0.99;
                  else val = Math.floor(val * 100) / 100;
                  setFeedSched({ ...feedSched, feedAmount: val });
                }}
                required
              />
              <input
                id="feeding-submit-btn"
                type="submit"
                value="Submit"
                className="h-[60px] w-[45%] text-white text-[clamp(10px,2.3vh,20px)] font-medium rounded-lg bg-[#002033] cursor-pointer hover:bg-[#0b66b1] active:opacity-70"
              />
            </div>
          </form>

          {/* RIGHT SIDE */}
          <div className="feed-schedule-list flex flex-col w-full rounded-xl bg-[#edeae47c] shadow-md p-4 h-[clamp(300px,100vh,600px)] mb-10">
            <div className="flex flex-row justify-between items-center">
              <h1 className="flex items-center text-title font-medium">
                <ListChecks className="h-6 mr-2" />
                Feeding Schedule
              </h1>
              <h1 className="rounded-lg bg-cyan-600 px-3 py-1 text-xs font-medium text-white">
                {count.activeCount < 2
                  ? "Default Schedule"
                  : "Customized Schedule"}
              </h1>
            </div>

            <div className="feeding-schedule-scrollable flex items-center flex-col w-full overflow-y-auto overflow-x-hidden border-y border-[#15314730] flex-1">
              {feedingSchedules.loading && <p>Loading schedules...</p>}
              {!feedingSchedules.loading ? (
                feedingSchedules && schedArr.length > 0 ? (
                  schedArr.map(
                    (sched) =>
                      !sched.isDeleted && (
                        <FeedingSchedule
                          key={sched.schedId}
                          id={sched.schedId}
                          sched={sched}
                          onToggle={updateSchedule}
                          onSoftDelete={softDeleteSchedule}
                          onHardDelete={deleteSchedule}
                        />
                      )
                  )
                ) : (
                  <h1 className="no-schedule-text items-center mt-[50%]">
                    There are no schedules yet
                  </h1>
                )
              ) : (
                <h1>Still loading...</h1>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FeedingManagement;

/* ------------ Subcomponents ------------ */
const FeedLevel = ({ readings }) => (
  <div className="feedlevel-container flex flex-col items-center justify-center rounded-xl bg-[#edeae47b] shadow-md p-4 h-[clamp(270px,49vh,300px)]">
    <h2 className="flex items-center w-full px-2 text-title font-medium">
      <Gauge className="mr-2 h-5 w-5" /> Feed Level
    </h2>
    <p
      className="flex-1 flex items-center justify-center text-[clamp(50px,4vw,60px)] font-extrabold"
      style={colorCode(readings?.feedLevel.current)}
    >
      {readings?.feedLevel.current}%
    </p>
    <p className="text-center text-[clamp(15px,1vw,20px)]">
      {refillMessage(readings?.feedLevel.current)}
    </p>
  </div>
);

const FeedStatus = ({ schedArr, defaultFeedingSchedule }) => {
  const activeScheds = schedArr
    .filter((s) => !s.isDeleted && s.isActive)
    .sort((a, b) => a.time.localeCompare(b.time));

  const currentSched = activeScheds[0] || defaultFeedingSchedule[0];
  const nextSched = activeScheds[1] || defaultFeedingSchedule[1];

  return (
    <div className="next-feed-schedule-container flex flex-col rounded-xl bg-[#edeae47b] shadow-md p-4 h-[clamp(270px,49vh,300px)]">
      <h2 className="flex items-center text-title font-medium mb-2">
        <Clock className="mr-2 h-5 w-5" />
        Feed Schedule Status
      </h2>
      <div className="flex flex-col gap-2 flex-1">
        <div className="bg-white rounded-lg px-3 py-2">
          Current: {currentSched.time}
          <p className="mt-1 rounded-lg bg-cyan-600 px-3 py-1 text-xs font-medium text-white w-[70%]">
            {currentSched.amount}kg
          </p>
        </div>
        <div className="opacity-50 bg-white rounded-lg px-3 py-2">
          Next: {nextSched.time}
          <p className="mt-1 rounded-lg bg-cyan-600 px-3 py-1 text-xs font-medium text-white w-[70%]">
            {nextSched.amount}kg
          </p>
        </div>
      </div>
    </div>
  );
};

/* ------------ Helpers ------------ */
const colorCode = (level) => {
  if (level === undefined || level === null) return { color: "#D3D3D3" };
  if (level < 50) return { color: "#de2e2eff" };
  if (level >= 50 && level <= 70) return { color: "#8a9406ff" };
  return { color: "#3bcb3bff" };
};

const refillMessage = (feedLevel) => {
  if (feedLevel === undefined || feedLevel === null)
    return (
      <span className="flex items-center gap-2 text-gray-500">
        <Info className="w-5 h-5" /> No data
      </span>
    );
  if (feedLevel < 50)
    return (
      <span className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="w-5 h-5" /> Refill now!
      </span>
    );
  if (feedLevel >= 50 && feedLevel <= 70)
    return (
      <span className="flex items-center gap-2 text-yellow-600">
        <Info className="w-5 h-5" /> Monitor level
      </span>
    );
  return (
    <span className="flex items-center gap-2 text-green-600">
      <CheckCircle className="w-5 h-5" /> Sufficient
    </span>
  );
};
