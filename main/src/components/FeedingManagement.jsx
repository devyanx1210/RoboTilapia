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
} from "./utils.jsx";
import FeedingAerationSettings from "./FeedingAerationSettings.jsx";

function FeedingManagement() {
  const { readings } = useOutletContext();

  const defaultFeedingSchedule = [
    { schedId: 1, time: "7:30", amount: 0.5 },
    { schedId: 2, time: "16:30", amount: 0.5 },
  ];

  const feedingSchedules = useReadDatabase(
    "/machines/machine0/feedingSched/custom"
  );
  console.log(feedingSchedules);
  const { addSchedule } = useAddSchedule("machine0");
  const { updateSchedule } = useUpdateSchedule("machine0");
  const { softDeleteSchedule } = useSoftDeleteSchedule("machine0");
  const { deleteSchedule } = useDeleteSchedule("machine0");
  const { updateOperationDetails } = useUpdateOperationDetails("machine0");
  const { deleteOperationDetails } = usedeleteOperationDetails("machine0");
  const { saveOperationDetails } = useSaveOperationDetails("machine0");

  const [feedSched, setFeedSched] = useState({
    feedSched: "",
    feedAmount: "",
  });
  const [operationDetails, setOperationDetails] = useState({
    numberOfFish: "",
    fishStage: "",
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

  // Auto-calc FCR: Total Feed Used / (Harvest Weight - Stocking Weight)
  useEffect(() => {
    const totalFeed = parseFloat(operationDetails.totalFeedUsed);
    const harvest = parseFloat(operationDetails.harvestWeight);
    const stock = parseFloat(operationDetails.stockingWeight);
    if (totalFeed > 0 && harvest > stock) {
      const calc = (totalFeed / (harvest - stock)).toFixed(2);
      setOperationDetails((prev) => ({ ...prev, fcr: calc }));
    } else {
      setOperationDetails((prev) => ({ ...prev, fcr: "" }));
    }
  }, [
    operationDetails.totalFeedUsed,
    operationDetails.harvestWeight,
    operationDetails.stockingWeight,
  ]);

  // Auto-calc Aeration Duration based on Pond Volume (m³)
  useEffect(() => {
    const L = parseFloat(operationDetails.pondLength);
    const W = parseFloat(operationDetails.pondWidth);
    const D = parseFloat(operationDetails.pondDepth);
    if (L > 0 && W > 0 && D > 0) {
      const volume = L * W * D;
      const duration = Math.max(2, Math.min((volume / 50).toFixed(1), 12));
      setOperationDetails((prev) => ({ ...prev, aerationDuration: duration }));
    } else {
      setOperationDetails((prev) => ({ ...prev, aerationDuration: "" }));
    }
  }, [
    operationDetails.pondLength,
    operationDetails.pondWidth,
    operationDetails.pondDepth,
  ]);

  const handleAddSchedule = (e) => {
    e.preventDefault();
    const { feedSched: time, feedAmount } = feedSched;
    if (!time || !feedAmount || feedAmount <= 0 || feedAmount >= 1)
      return alert("Please enter a valid feed amount between 0.01 and 0.99 kg");

    addSchedule(time, feedAmount);
    setFeedSched({ feedSched: "", feedAmount: "" });
  };

  const handleClearAll = () =>
    setOperationDetails({
      feedSched: "",
      feedAmount: "",
      numberOfFish: "",
      fishStage: "",
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
    operationDetails.numberOfFish ||
    operationDetails.feedSize ||
    operationDetails.feedShape ||
    operationDetails.pondLength ||
    operationDetails.pondWidth ||
    operationDetails.pondDepth;

  const summaryMessage = hasAdvanced ? (
    <div className="space-y-1 text-sm">
      <p>
        <strong>Fish Count:</strong> {operationDetails.numberOfFish || "--"} (
        {operationDetails.fishStage || "N/A"})
      </p>
      <p>
        <strong>Feed Type:</strong> {operationDetails.feedSize || "--"} /{" "}
        {operationDetails.feedShape || "--"}
      </p>
      <p>
        <strong>Pond Dimensions:</strong>{" "}
        {operationDetails.pondLength &&
        operationDetails.pondWidth &&
        operationDetails.pondDepth
          ? `${operationDetails.pondLength}m × ${operationDetails.pondWidth}m × ${operationDetails.pondDepth}m`
          : "--"}
      </p>
      <p>
        <strong>FCR:</strong> {operationDetails.fcr || "--"}
      </p>
      <p>
        <strong>Aeration Duration:</strong>{" "}
        {operationDetails.aerationDuration
          ? `${operationDetails.aerationDuration} hrs`
          : "--"}
      </p>

      <h1 className="reccomendations-fcr text-[2vh] flex flex-col items-start mt-2">
        {/* Lightbulb icon at top */}
        <span className="flex items-center mb-2 text-[#002033]">
          <Lightbulb className="h-[3vh] w-[3vh] mr-2 text-cyan-600 " />
          <span className="font-semibold">Recommendations</span>
        </span>

        {/* FCR text */}
        {`Your Feed Conversion Ratio (FCR) is ${
          operationDetails.fcr >= 1.5 && operationDetails.fcr <= 2.0
            ? "within"
            : "not within"
        } the ideal range. The optimal FCR is between 1.5 and 2.0. ${
          operationDetails.fcr < 1.5
            ? "This indicates very efficient feed utilization — great job!"
            : operationDetails.fcr > 2.0
            ? "Consider adjusting your feeding practices to improve efficiency."
            : ""
        }`}
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
              Feed Input
            </h2>

            {/* Toggle Advanced */}
            <button
              type="button"
              onClick={() => {
                if (showAdvanced) {
                  saveOperationDetails(operationDetails); // save when advanced is shown
                }
                setShowAdvanced(!showAdvanced); // toggle advanced
              }}
              className="flex items-center gap-2 mb-3 text-[#002033] hover:text-cyan-700"
            >
              {showAdvanced ? (
                <>
                  <Save className="h-[clamp(12px,5vw,15px)] w-[clamp(12px,5vw,15px)]" />
                  Save Details
                </>
              ) : (
                <>
                  <Edit3 className="h-[clamp(12px,5vw,15px)] w-[clamp(12px,5vw,15px)]" />
                  Edit Details
                </>
              )}
            </button>

            {/* Summary */}
            {!showAdvanced && (
              <div className="w-[105%] bg-white/60 border border-gray-300 rounded-lg p-3 mb-3 text-sm text-[#002033] h-[clamp(100px,60vh,250px)] overflow-y-auto">
                {summaryMessage}
              </div>
            )}

            {/* Advanced Section */}
            {showAdvanced && (
              <FeedingAerationSettings
                operationDetails={operationDetails}
                setOperationDetails={setOperationDetails}
                handleClearAll={handleClearAll}
                onHardDeleteDetails={deleteOperationDetails}
                onShowAdvanced={setShowAdvanced}
                showAdvanced={showAdvanced}
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
