import React, { useEffect, useState } from "react";
import FeedingSchedule from "./FeedingSchedule.jsx";
import { useOutletContext } from "react-router-dom";
import "../index.css";

// Assets
import feedLevel from "/src/assets/monitoring-icons/feed-level.png";
import feedSchedInput from "/src/assets/monitoring-icons/feed-sched-input.png";
import feedSchedIcon from "/src/assets/monitoring-icons/feeding-sched.png";
import nextFeedSched from "/src/assets/monitoring-icons/next-feed-sched.png";

import {
  Gauge, // for Feed Level
  Clock, // for Feed Schedule Status
  PlusCircle, // for Feed Input
  ListChecks, // for Feeding Schedule
  AlertTriangle,
  Info,
  CheckCircle,
  Trash2,
} from "lucide-react";

import {
  useReadDatabase,
  useAddSchedule,
  useUpdateSchedule,
  useSoftDeleteSchedule,
  useDeleteSchedule,
} from "./utils.jsx";

function FeedingManagement() {
  const { readings } = useOutletContext();
  const defaultFeedingSchedule = [
    { schedId: 1, time: "7:30", amount: 0.5 },
    { schedId: 2, time: "16:30", amount: 0.5 },
  ];

  // 🔹 Get schedules directly from DB
  const feedingSchedules = useReadDatabase(
    "/machines/machine0/feedingSched/custom"
  );
  // const defaultFeedSchedules = useReadDatabase(
  //   "/machines/machine0/feedingSched/default"
  // );
  console.log(feedingSchedules.readings);

  const { addSchedule } = useAddSchedule("machine0");
  const { updateSchedule } = useUpdateSchedule("machine0");
  const { softDeleteSchedule } = useSoftDeleteSchedule("machine0");
  const { deleteSchedule } = useDeleteSchedule("machine0");
  const [feedSched, setFeedSched] = useState({ feedSched: "", feedAmount: 0 });

  // ✅ Add schedule
  const handleAddSchedule = (e) => {
    e.preventDefault();
    const { feedAmount } = feedSched;
    if (
      !feedSched.feedSched ||
      !feedSched.feedAmount ||
      feedSched.feedAmount <= 0 ||
      feedSched.feedAmount >= 1
    ) {
      return alert("Please enter a valid feed amount between 0.01 and 0.99 kg");
    } 
    addSchedule(feedSched.feedSched, feedSched.feedAmount);
    setFeedSched({ feedSched: "", feedAmount: 0 });
  };

  const handleToggle = (schedId, currentStatus) => {
    updateSchedule(schedId, { isActive: !currentStatus });
  };

  const handleSoftDeleteSched = (schedId) => {
    softDeleteSchedule(schedId);
  };

  const handleHardDeleteSched = (schedId) => {
    deleteSchedule(schedId);
  };

  const [schedArr, setSchedArr] = useState([]);

  useEffect(() => {
    if (feedingSchedules.readings) {
      setSchedArr(Object.values(feedingSchedules.readings));
    }
  }, [feedingSchedules.readings]);

  // Count of active and deleted schedules
  const [count, setCount] = useState({ activeCount: 0, deletedCount: 0 });

  useEffect(() => {
    let active = 0;
    let deleted = 0;

    schedArr.forEach((sched) => {
      if (sched.isDeleted) deleted++;
      if (sched.isActive) active++;
    });

    setCount({ activeCount: active, deletedCount: deleted });
  }, [schedArr]);

  console.log(schedArr);
  console.log(feedingSchedules.readings);
  console.log(readings);

  return (
    <>
      {/* Loading overlay */}
      {!readings && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-xl">
          <section className="flex gap-2">
            <div className="w-3 h-3 bg-white rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-100" />
            <div className="w-3 h-3 bg-white rounded-full animate-bounce delay-200" />
          </section>
        </div>
      )}

      {/* Main modal wrapper with scroll-x */}
      <div className="w-full h-full overflow-x-auto">
        <div
          className="
        grid
        grid-cols-1
        gap-4
        md:[@media(min-width:680px)]:grid-cols-[1fr_1.5fr_2fr]
        md:[@media(min-width:680px)]:w-[1450px]
        md:[@media(min-width:800px)]:mx-auto
        overflow-y-hidden
        rounded-xl
        p-4
        items-stretch
      "
        >
          {/* Left column - stacked */}
          <div className="grid grid-rows-2 gap-3 h-full">
            {/* Feed Level */}
            <div className="feedlevel-container flex flex-col items-center justify-center rounded-xl bg-[#edeae47b] shadow-md p-4 h-[clamp(270px,49vh,300px)]">
              <h2 className="flex items-center w-full px-2 text-title font-medium">
                <Gauge className="mr-2 h-5 w-5" />
                Feed Level
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

            {/* Next Feed Schedule Status */}
            <div className="next-feed-schedule-container flex flex-col rounded-xl bg-[#edeae47b] shadow-md p-4 h-[clamp(270px,49vh,300px)]">
              <h2 className="flex items-center text-title font-medium mb-2">
                <Clock className="mr-2 h-5 w-5" />
                Feed Schedule Status
              </h2>
              <div className="flex flex-col gap-2 flex-1">
                {(() => {
                  const activeScheds = schedArr
                    .filter((s) => !s.isDeleted && s.isActive)
                    .sort((a, b) => a.time.localeCompare(b.time));

                  if (activeScheds.length >= 2) {
                    const currentSched = activeScheds[0];
                    const nextSched = activeScheds[1];
                    return (
                      <>
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
                      </>
                    );
                  } else {
                    return (
                      <>
                        <div className="bg-white rounded-lg px-3 py-2">
                          Current: {defaultFeedingSchedule[0].time}
                          <p className="mt-1 rounded-lg bg-cyan-600 px-3 py-1 text-xs font-medium text-white w-[70%]">
                            {defaultFeedingSchedule[0].amount}kg
                          </p>
                        </div>
                        {defaultFeedingSchedule[1] && (
                          <div className="opacity-50 bg-white rounded-lg px-3 py-2">
                            Next: {defaultFeedingSchedule[1].time}
                            <p className="mt-1 rounded-lg bg-cyan-600 px-3 py-1 text-xs font-medium text-white w-[70%]">
                              {defaultFeedingSchedule[1].amount}kg
                            </p>
                          </div>
                        )}
                      </>
                    );
                  }
                })()}
              </div>
            </div>
          </div>

          {/* Middle column - Feed Input */}
          <form
            onSubmit={handleAddSchedule}
            className="feed-input-container flex flex-col items-center justify-start rounded-xl bg-[#edeae46e] shadow-md p-3 h-[clamp(300px,50vh,400px)]  
"
          >
            <h2 className="flex items-center w-full text-title font-medium mb-2">
              <PlusCircle className="mr-2 h-5 w-5" />
              Feed Input
            </h2>
            <label className="text-[clamp(14px,1vw,20px)] mb-2 text-center ">
              Input time and Feed Amount in Kilograms
            </label>
            <input
              id="feeding-input-time"
              type="time"
              className="my-3 w-[80%] h-[70px] text-[clamp(1.5rem,3vw,2rem)] text-[#002033] rounded-lg border-2 border-[#002033] bg-[#7f81825b] px-3 cursor-pointer"
              value={feedSched.feedSched || ""}
              onChange={(e) =>
                setFeedSched((rec) => ({ ...rec, feedSched: e.target.value }))
              }
              required
            />
            <div className="flex flex-row justify-between items-center w-[80%]">
              <input
                type="number"
                placeholder="Feed Amount (kg)"
                step="0.01"
                className="my-3 text-[clamp(15px, 2.5vh,20px)] w-[50%] h-[70px] text-center text-[#002033] rounded-lg border-2 border-[#002033] bg-[#7f81825b] text-base placeholder:text-[#002033]/70 cursor-pointer"
                value={feedSched.feedAmount || ""}
                onChange={(e) => {
                  let value = e.target.value.replace(/[^0-9.]/g, "");
                  value = parseFloat(value);
                  if (isNaN(value) || value <= 0) value = "";
                  else if (value > 0.99) value = 0.99;
                  else value = Math.floor(value * 100) / 100;
                  setFeedSched((rec) => ({ ...rec, feedAmount: value }));
                }}
                required
              />
              <input
                id="feeding-submit-btn"
                type="submit"
                value="Submit"
                className="h-[60px] w-[45%] text-white text-[clamp(15px, 2.5vh,20px)] font-medium rounded-lg bg-[#002033] cursor-pointer hover:bg-[#0b66b1] active:opacity-70"
              />
            </div>
          </form>

          {/* Right column - Feeding Schedule list */}
          <div className="feed-schedule-list flex flex-col w-full rounded-xl bg-[#edeae47c] shadow-md p-4 h-[clamp(500px,100vh,600px)] mb-10">
            <div className="flex flex-row justify-between items-center lg:mb-0 mb-15">
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
              {!feedingSchedules.loading &&
                schedArr.map((sched) => {
                  if (sched.isDeleted) return null;
                  return (
                    <FeedingSchedule
                      key={sched.schedId}
                      id={sched.schedId}
                      sched={sched}
                      onToggle={handleToggle}
                      onSoftDelete={handleSoftDeleteSched}
                      onHardDelete={handleHardDeleteSched}
                    />
                  );
                })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FeedingManagement;

// ------------------ COLOR CODE FUNCTION ------------------
const colorCode = (feedLevel) => {
  if (feedLevel === undefined || feedLevel === null) {
    return { color: "#D3D3D3" }; // Default gray for no data
  }
  if (feedLevel < 50) return { color: "#de2e2eff" };
  if (feedLevel >= 50 && feedLevel <= 70) return { color: "#8a9406ff" };
  return { color: "#3bcb3bff" };
};

// ------------------ REFILL MESSAGE FUNCTION ------------------
const refillMessage = (feedLevel) => {
  if (feedLevel === undefined || feedLevel === null) {
    return (
      <span className="flex items-center gap-2 text-gray-500">
        <Info className="w-5 h-5" />
        No data
      </span>
    );
  }
  if (feedLevel < 50) {
    return (
      <span className="flex items-center gap-2 text-red-600">
        <AlertTriangle className="w-5 h-5" />
        Refill now!
      </span>
    );
  }
  if (feedLevel >= 50 && feedLevel <= 70) {
    return (
      <span className="flex items-center gap-2 text-yellow-600">
        <Info className="w-5 h-5" />
        Monitor level
      </span>
    );
  }
  return (
    <span className="flex items-center gap-2 text-green-600">
      <CheckCircle className="w-5 h-5" />
      Sufficient
    </span>
  );
};
