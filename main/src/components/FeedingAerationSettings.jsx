import React, { useState, useEffect } from "react";
import { XCircle, Trash2 } from "lucide-react";

export default function FeedingAerationSettings({
  operationDetails,
  handleClearAll,
  onHardDeleteDetails,
  onClose,
  updateOperationDetails,
  setLocalReadings,
  onShowAdvanced,
  showAdvanced,
}) {
  // Unified handler for instant input + Firebase sync
  const handleReadingChange = (field, value) => {
    setLocalReadings((prev) => ({ ...prev, [field]: value }));
    updateOperationDetails({ [field]: value }); // instantly updates Firebase
  };

  console.log(operationDetails);
  return (
    <>
      <div className="relative w-[90%] mb-3 p-3 bg-white/60 rounded-lg space-y-3 overflow-y-auto max-h-[280px] border border-gray-300 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent hover:scrollbar-thumb-gray-400">
        {/* Close Button */}
        <button
          type="button"
          onClick={() => onShowAdvanced(false)}
          className="absolute top-1 right-1 text-gray-500 hover:text-red-600"
        >
          <XCircle className="h-[clamp(10px,5vw,14px)] w-[clamp(10px,5vw,14px)]" />
        </button>

        {/* Number of Fish, Weight, and Growth Stage */}
        <label className="text-sm font-medium text-gray-700">
          Number of Fish, Weight, & Growth Stage
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            min="0"
            placeholder="e.g., 200"
            value={operationDetails.numberOfFish || ""}
            onChange={(e) =>
              handleReadingChange("numberOfFish", e.target.value)
            }
            className="text-[clamp(10px,3vw,12px)] border border-gray-400 rounded-md p-2"
          />

          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Fish Wt (kg)"
            value={operationDetails.fishWeight || ""}
            onChange={(e) => handleReadingChange("fishWeight", e.target.value)}
            className="text-[clamp(10px,3vw,12px)] border border-gray-400 rounded-md p-2"
          />

          <select
            value={operationDetails.fishStage || ""}
            onChange={(e) => handleReadingChange("fishStage", e.target.value)}
            className="border border-gray-400 rounded-md p-2 text-[clamp(10px,3vw,12px)]"
          >
            <option value="">Growth Stage</option>
            <option value="Fry">Fry</option>
            <option value="Fingerling">Fingerling</option>
            <option value="Juvenile">Juvenile</option>
            <option value="Adult">Adult</option>
            <option value="Broodstock">Broodstock</option>
          </select>
        </div>

        {/* Feed Size & Shape */}
        <label className="text-sm font-medium text-gray-700">
          Feed Size & Shape
        </label>
        <div className="flex gap-2">
          <select
            value={operationDetails.feedSize || ""}
            onChange={(e) => handleReadingChange("feedSize", e.target.value)}
            className="feed-size text-[clamp(10px,3vw,12px)] border border-gray-400 rounded-md p-2 w-1/2"
          >
            <option value="">Select Size</option>
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
          </select>
          <select
            value={operationDetails.feedShape || ""}
            onChange={(e) => handleReadingChange("feedShape", e.target.value)}
            className="feed-shape text-[clamp(10px,3vw,12px)] border border-gray-400 rounded-md p-2 w-1/2"
          >
            <option value="">Select Shape</option>
            <option value="Pellet">Pellet</option>
            <option value="Crumb">Crumb</option>
            <option value="Powder">Powder</option>
            <option value="Ball">Ball</option>
          </select>
        </div>

        {/* FCR Inputs */}
        <label className="text-sm font-medium text-gray-700">
          FCR Calculation Inputs (kg)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Total Feed Used"
            value={operationDetails.totalFeedUsed || ""}
            onChange={(e) =>
              handleReadingChange("totalFeedUsed", e.target.value)
            }
            className="total-feed-used text-[clamp(10px,3vw,12px)] border border-gray-400 rounded-md p-2"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Stocking Wt"
            value={operationDetails.stockingWeight || ""}
            onChange={(e) =>
              handleReadingChange("stockingWeight", e.target.value)
            }
            className="stocking-weight text-[clamp(9px,3vw,10px)] border border-gray-400 rounded-md p-2"
          />
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Harvest Wt"
            value={operationDetails.harvestWeight || ""}
            onChange={(e) =>
              handleReadingChange("harvestWeight", e.target.value)
            }
            className="harvest-weight text-[clamp(9px,3vw,10px)] border border-gray-400 rounded-md p-2"
          />
        </div>

        <p className="text-[clamp(9px,3vw,10px)] mt-1 text-gray-600">
          FCR = Total Feed Used ÷ (Harvest Weight − Stocking Weight)
        </p>

        {/* Pond Dimensions */}
        <label className="text-sm font-medium text-gray-700 mt-2">
          Pond Dimensions (m)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["pondLength", "pondWidth", "pondDepth"].map((dim) => (
            <input
              key={dim}
              type="number"
              min="0"
              placeholder={dim.replace("pond", "")}
              value={operationDetails[dim] || ""}
              onChange={(e) => handleReadingChange(dim, e.target.value)}
              className={`${dim} text-[clamp(9px,3vw,10px)] border border-gray-400 rounded-md p-2`}
            />
          ))}
        </div>

        {/* Buttons */}
        <div className="flex justify-between mt-2">
          <button
            type="button"
            onClick={() => {
              handleClearAll();
            }}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 text-[clamp(9px,3vw,10px)]"
          >
            <XCircle className="h-[clamp(10px,4vw,14px)] w-[clamp(10px,4vw,14px)]" />
            Clear All Inputs
          </button>

          <button
            type="button"
            onClick={onHardDeleteDetails}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded-lg text-[clamp(9px,3vw,10px)]"
          >
            <Trash2 className="h-[clamp(10px,4vw,14px)] w-[clamp(10px,4vw,14px)]" />
            Delete
          </button>
        </div>
      </div>
    </>
  );
}
