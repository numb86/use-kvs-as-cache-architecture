import { React } from "../deps.ts";

const { useState, useEffect } = React;

export function useHistoryApi() {
  const [_, setState] = useState(true);

  function reRender() {
    setState((t) => !t);
  }

  useEffect(() => {
    window.addEventListener("popstate", reRender);
    return () => {
      window.removeEventListener("popstate", reRender);
    };
  }, [reRender]);

  return (path) => {
    window.history.pushState(null, null, path);
    reRender();
  };
}
