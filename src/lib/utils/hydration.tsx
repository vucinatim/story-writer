// hydration.tsx
"use client";

import * as React from "react";
import { useNovelStore } from "../stores/novels-store";

const Hydration = () => {
  React.useEffect(() => {
    useNovelStore.persist.rehydrate();
  }, []);

  return null;
};

export default Hydration;
