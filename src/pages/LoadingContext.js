import React, { createContext, useContext, useState } from "react";

const LoadingContext = createContext();

export function LoadingProvider({ children }) {
  const [count, setCount] = useState(0);

  const show = () => setCount((c) => c + 1);
  const hide = () => setCount((c) => Math.max(0, c - 1));

  return (
    <LoadingContext.Provider value={{ loading: count > 0, show, hide }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  return useContext(LoadingContext);
}
