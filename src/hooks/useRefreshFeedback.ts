import { useState } from "react";

import { impactLight, notifySuccess } from "@/utils/haptics";

export function useRefreshFeedback(duration = 850) {
  const [refreshing, setRefreshing] = useState(false);

  function refresh() {
    impactLight();
    setRefreshing(true);

    setTimeout(() => {
      setRefreshing(false);
      notifySuccess();
    }, duration);
  }

  return { refresh, refreshing };
}
