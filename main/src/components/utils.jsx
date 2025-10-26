// All utilies will be stored here
import { useState, useEffect, useCallback } from "react";

export function useAnimatedToggle(duration = 300) {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);
  const open = useCallback(() => {
    setVisible(true);
    setAnimating(true);
  }, []);
  const close = useCallback(() => {
    setAnimating(false);
    setTimeout(() => setVisible(false), duration);
  }, [duration]);
  const shouldRender = visible || animating;
  return { visible, animating, open, close, shouldRender };
}

import { app, auth, db } from "../firebase.js";
import {
  getDatabase,
  ref,
  set,
  onValue,
  update,
  remove,
  push,
} from "firebase/database";
import { onAuthStateChanged } from "firebase/auth";

// ---------------------- READ HOOK ----------------------
//
export function useReadDatabase(path = "/machines/machine0") {
  const [readings, setReadings] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const db = getDatabase(app);
    const dbRef = ref(db, path);

    const unsubscribe = onValue(dbRef, (snapshot) => {
      setReadings(snapshot.val());
      setLoading(false);
    });

    return () => unsubscribe();
  }, [path]);

  return { readings, loading };
}

// ------------------------Water Parameter Analyics-------------------
export function useAnalyticsData() {
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
    const path = `/analytics/week-${year}-${weekNumber}`;

    const dbRef = ref(db, path);
    const unsub = onValue(dbRef, (snapshot) => {
      setAnalytics(snapshot.val());
    });

    return () => unsub();
  }, []);

  return analytics;
}

// ---------------------- FEEDING SCHEDULE HOOKS ----------------------

// 🔹 Add a new custom feeding schedule
export function useAddSchedule(machineId = "machine0") {
  const addSchedule = async (time, amount) => {
    try {
      const db = getDatabase(app);
      const newSchedRef = push(
        ref(db, `/machines/${machineId}/feedingSched/custom`)
      );

      // 🔹 Use Firebase's generated key as schedId
      const schedKey = newSchedRef.key;

      await set(newSchedRef, {
        schedId: schedKey, // store the encrypted key as ID
        time,
        amount,
        isActive: false,
        isDeleted: false,
      });

      console.log("New schedule added with ID:", schedKey);
      return schedKey; // return it so caller can use it
    } catch (error) {
      console.error("Error adding schedule:", error);
      return null;
    }
  };

  return { addSchedule };
}

// 🔹 Update an existing schedule (toggle active, edit time/amount, etc.)
export function useUpdateSchedule(machineId = "machine0") {
  const updateSchedule = async (schedId, updates) => {
    try {
      const db = getDatabase(app);
      await update(
        ref(db, `/machines/${machineId}/feedingSched/custom/${schedId}`),
        updates
      );
      console.log("Schedule updated:", schedId);
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };
  return { updateSchedule };
}

// 🔹 Save operation details (overwrite or create new data)
export function useUpdateOperationDetails(machineId = "machine0") {
  const updateOperationDetails = async (operationDetails) => {
    try {
      const db = getDatabase(app);

      await update(
        ref(db, `/machines/${machineId}/operationDetails`),
        operationDetails
      );
      console.log("Operation details saved successfully for:", machineId);
    } catch (error) {
      console.error("Error saving operation details:", error);
    }
  };
  return { updateOperationDetails };
}

// Save operation details
export function useSaveOperationDetails(machineId = "machine0") {
  const saveOperationDetails = async (operationDetails) => {
    try {
      const db = getDatabase(app);
      await set(
        ref(db, `/machines/${machineId}/operationDetails`),
        operationDetails
      );
      console.log("Operation details saved successfully for:", machineId);
    } catch (error) {
      console.error("Error saving operation details:", error);
    }
  };

  return { saveOperationDetails };
}

// Delete Operation Details
export function usedeleteOperationDetails(machineId = "machine0") {
  const deleteOperationDetails = async () => {
    try {
      const db = getDatabase(app);
      await remove(ref(db, `/machines/${machineId}/operationDetails`));
      console.log("Operation details deleted for:", machineId);
    } catch (error) {
      console.error("Error deleting operation details:", error);
    }
  };
  return { deleteOperationDetails };
}

// 🔹 Soft delete a schedule (set isDeleted = true)
export function useSoftDeleteSchedule(machineId = "machine0") {
  const softDeleteSchedule = async (schedId) => {
    try {
      const db = getDatabase(app);
      await update(
        ref(db, `/machines/${machineId}/feedingSched/custom/${schedId}`),
        {
          isDeleted: true,
        }
      );
      console.log("Schedule soft-deleted:", schedId);
    } catch (error) {
      console.error("Error soft-deleting schedule:", error);
    }
  };
  return { softDeleteSchedule };
}

// 🔹 Hard delete a schedule (remove node entirely)
export function useDeleteSchedule(machineId = "machine0") {
  const deleteSchedule = async (schedId) => {
    try {
      const db = getDatabase(app);
      await remove(
        ref(db, `/machines/${machineId}/feedingSched/custom/${schedId}`)
      );
      console.log("Schedule hard-deleted:", schedId);
    } catch (error) {
      console.error("Error deleting schedule:", error);
    }
  };
  return { deleteSchedule };
}

export function useCurrentUser() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const snapshot = await get(ref(db, `/users/${user.uid}`));
          if (snapshot.exists()) {
            setUserData(snapshot.val());
          } else {
            setUserData(null);
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
          setError(err);
        }
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { userData, loading, error };
}
