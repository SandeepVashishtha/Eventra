"use client";

import React, { createContext, useContext, useState } from "react";
import DetailDrawer from "@/components/ui/DetailDrawer";

const DrawerContext = createContext({
  openDrawer: (type, data) => {},
  closeDrawer: () => {},
});

export function DrawerProvider({ children }) {
  const [drawerState, setDrawerState] = useState({
    isOpen: false,
    type: "event",
    data: null,
  });

  const openDrawer = (type, data) => {
    if (!data) return;
    setDrawerState({
      isOpen: true,
      type,
      data,
    });
  };

  const closeDrawer = () => {
    setDrawerState((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <DrawerContext.Provider value={{ openDrawer, closeDrawer }}>
      {children}
      <DetailDrawer
        isOpen={drawerState.isOpen}
        onClose={closeDrawer}
        type={drawerState.type}
        data={drawerState.data}
      />
    </DrawerContext.Provider>
  );
}

export function useDrawer() {
  return useContext(DrawerContext);
}
