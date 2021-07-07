import { React } from "../deps.ts";
import { Thanks } from "./Thanks.jsx";

import { BUY_API_ENDPOINT, INVENTORY_STATE } from "../constants.ts";
import { useHistoryApi } from "../customHooks/useHistoryApi.js";

const { useState, useEffect } = React;

const inventoryStateToDescription = new Map([
  [INVENTORY_STATE.ENOUGH, "now on sale!"],
  [INVENTORY_STATE.LITTLE, "limited stock!"],
  [INVENTORY_STATE.NONE, "sold out"],
]);

const inventoryStateToImagePath = new Map([
  [INVENTORY_STATE.ENOUGH, "/images/enough.jpg"],
  [INVENTORY_STATE.LITTLE, "/images/little.jpg"],
  [INVENTORY_STATE.NONE, "/images/none.jpg"],
]);

export function App({ inventoryState }) {
  const [isCompletedHydrate, setIsCompletedHydrate] = useState(false);
  const [isOrderable, setIsOrderable] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const push = useHistoryApi();

  const description = inventoryStateToDescription.get(inventoryState);
  const isSoldOut = inventoryState === INVENTORY_STATE.NONE;

  useEffect(() => {
    setIsCompletedHydrate(true);
  }, []);

  useEffect(() => {
    setIsOrderable(isCompletedHydrate && !isSoldOut);
  }, [isCompletedHydrate]);

  const buy = async () => {
    const res = await fetch(BUY_API_ENDPOINT);
    if (res.ok) {
      push("/thanks");
    } else {
      setErrorMessage("Sorry, sold out.");
    }
  };

  if (!window.Deno) {
    if (window.location.pathname === "/thanks") {
      return <Thanks />;
    }
  }

  return (
    <div>
      <img src={inventoryStateToImagePath.get(inventoryState)} alt="sushi" />
      <p style={{ fontSize: "32px" }}>Sushi $1.0</p>
      <p style={{ fontSize: "26px" }}>{description}</p>
      <button
        type="button"
        style={{ fontSize: "20px" }}
        disabled={!isOrderable}
        onClick={buy}
      >
        Buy
      </button>
      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}
    </div>
  );
}
