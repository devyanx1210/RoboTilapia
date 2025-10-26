import React from "react";
import { XCircle, Trash2 } from "lucide-react";

// TODO: close button

export default function FeedingAerationSettings({
  operationDetails,
  setOperationDetails,
  handleClearAll,
  onHardDeleteDetails,
  onClose, // <-- callback function for closing modal
}) {
  return (
    <>
      {/* Advanced Section */}
      <div className="relative w-[90%] mb-3 p-3 bg-white/60 rounded-lg space-y-3 overflow-y-auto max-h-[280px] border border-gray-300">
        {/* Close Button at Top-Right */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-1 right-1 text-gray-500 hover:text-red-600"
        >
          <XCircle className="h-[clamp(10px,5vw,14px)] w-[clamp(10px,5vw,14px)]" />
        </button>

        <label className="text-sm font-medium text-gray-700">
          Number of Fish & Growth Stage
        </label>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="e.g., 200"
            value={operationDetails.numberOfFish}
            onChange={(e) =>
              setOperationDetails({
                ...operationDetails,
                numberOfFish: e.target.value,
              })
            }
            className="text-[clamp(10px,3vw,12px)] input-field border border-gray-400 rounded-md p-2 w-1/2"
          />
          <select
            value={operationDetails.fishStage}
            onChange={(e) =>
              setOperationDetails({
                ...operationDetails,
                fishStage: e.target.value,
              })
            }
            className="border border-gray-400 rounded-md p-2 w-1/2 text-[clamp(10px,3vw,12px)] "
          >
            <option value="">Growth Stage</option>
            <option value="Fry">Fry</option>
            <option value="Fingerling">Fingerling</option>
            <option value="Juvenile">Juvenile</option>
            <option value="Adult">Adult</option>
            <option value="Broodstock">Broodstock</option>
          </select>
        </div>

        <label className="text-sm font-medium text-gray-700">
          Feed Size & Shape
        </label>
        <div className="flex gap-2">
          <select
            value={operationDetails.feedSize}
            onChange={(e) =>
              setOperationDetails({
                ...operationDetails,
                feedSize: e.target.value,
              })
            }
            className="feed-size text-[clamp(10px,3vw,12px)] border border-gray-400 rounded-md p-2 w-1/2"
          >
            <option value="">Select Size</option>
            <option value="Small">Small</option>
            <option value="Medium">Medium</option>
            <option value="Large">Large</option>
          </select>
          <select
            value={operationDetails.feedShape}
            onChange={(e) =>
              setOperationDetails({
                ...operationDetails,
                feedShape: e.target.value,
              })
            }
            className="feed-shape text-[clamp(10px,3vw,12px)] border border-gray-400 rounded-md p-2 w-1/2"
          >
            <option value="">Select Shape</option>
            <option value="Pellet">Pellet</option>
            <option value="Crumb">Crumb</option>
            <option value="Powder">Powder</option>
            <option value="Ball">Ball</option>
          </select>
        </div>

        <label className="text-sm font-medium text-gray-700">
          FCR Calculation Inputs (kg)
        </label>
        <div className="grid grid-cols-3 gap-2">
          <input
            type="number"
            step="0.01"
            placeholder="Total Feed Used"
            value={operationDetails.totalFeedUsed}
            onChange={(e) =>
              setOperationDetails({
                ...operationDetails,
                totalFeedUsed: e.target.value,
              })
            }
            className="total-feed-used text-[clamp(10px,3vw,12px)] border border-gray-400 rounded-md p-2"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Stocking Wt"
            value={operationDetails.stockingWeight}
            onChange={(e) =>
              setOperationDetails({
                ...operationDetails,
                stockingWeight: e.target.value,
              })
            }
            className="stocking-weight text-[clamp(9px,3vw,10px)] border border-gray-400 rounded-md p-2"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Harvest Wt"
            value={operationDetails.harvestWeight}
            onChange={(e) =>
              setOperationDetails({
                ...operationDetails,
                harvestWeight: e.target.value,
              })
            }
            className="harvest-weight text-[clamp(9px,3vw,10px)] border border-gray-400 rounded-md p-2"
          />
        </div>

        <p className="text-[clamp(9px,3vw,10px)] mt-1 text-gray-600">
          FCR = Total Feed Used ÷ (Harvest Weight − Stocking Weight)
        </p>

        <label className="text-sm font-medium text-gray-700 mt-2">
          Pond Dimensions (m)
        </label>
        <div className="grid grid-cols-3 gap-2">
          {["pondLength", "pondWidth", "pondDepth"].map((dim) => (
            <input
              key={dim}
              type="number"
              placeholder={dim.replace("pond", "")}
              value={operationDetails[dim]}
              onChange={(e) =>
                setOperationDetails({
                  ...operationDetails,
                  [dim]: e.target.value,
                })
              }
              className={`${dim} text-[clamp(9px,3vw,10px)] border border-gray-400 rounded-md p-2`}
            />
          ))}
        </div>

        {/* Buttons: Clear All Inputs (left) + Delete (right) */}
        <div className="flex justify-between mt-2">
          {/* Clear All Inputs Button */}
          <button
            type="button"
            onClick={() => {
              handleClearAll();
              onHardDeleteDetails();
            }}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 text-[clamp(9px,3vw,10px)]"
          >
            <XCircle className="h-[clamp(10px,4vw,14px)] w-[clamp(10px,4vw,14px)]" />
            Clear All Inputs
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={onHardDeleteDetails} // just deletes data
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
