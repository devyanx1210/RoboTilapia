import React from "react";
import DeleteBtn from "../assets/delete-btn.png";
import { Trash2 } from "lucide-react";

function FeedingSchedule({ id, sched, onToggle, onSoftDelete, onHardDelete }) {
  return (
    <div
      id={`feeding-schedule-${id}`}
      className="feeding-schedule flex items-center justify-between bg-gray-200/60 rounded-2xl p-2 m-2 w-[100%] h-[clamp(80px,17vh,100px)]"
    >
      {/* Left side: toggle + time/amount */}
      <div className="flex items-center w-[70%] ml-2">
        {/* Toggle switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            onClick={() => onToggle(id, { isActive: !sched.isActive })}
            type="checkbox"
            className="sr-only peer"
          />
          <div
            className="  
      group peer 
      bg-gray-300 
      rounded-full 
      duration-300 
      w-12 h-6 sm:w-14 sm:h-7   /* Medium toggle, responsive */
      ring-2 ring-[#002033] 
      peer-checked:bg-[#002033]   /* Background turns dark blue when ON */
      after:duration-300 
      after:bg-[#002033]          /* Ball dark blue by default */
      peer-checked:after:bg-white /* Ball turns white when ON */
      after:rounded-full 
      after:absolute 
      after:h-4 after:w-4 sm:after:h-5 sm:after:w-5 
      after:top-1 after:left-1 
      after:flex after:justify-center after:items-center 
      peer-checked:after:translate-x-6 sm:peer-checked:after:translate-x-7
      peer-hover:after:scale-95
    "
          ></div>
        </label>

        {/* Feeding schedule details */}
        <div className="flex flex-col justify-start w-full ml-4">
          <h2 className="text-[clamp(14px,1.8vw,23px)] font-semibold navy-blue-text">
            Time: {sched.time}
          </h2>
          <p className="text-[clamp(12px,2vw,18px)] text-blue-800 m-0">
            Feed Amount: {sched.amount} kg
          </p>
        </div>
      </div>

      {/* Right side: delete button */}
      <button
        onClick={() => onHardDelete(id)}
        className="mr-2 p-2 rounded-lg hover:bg-red-100 hover:scale-110 transition"
      >
        <Trash2 className="h-[clamp(5px,3h,30px)] -[clamp(5px,2.6vh,3px)] navy-blue-text" />
      </button>
    </div>
  );
}

export default FeedingSchedule;
