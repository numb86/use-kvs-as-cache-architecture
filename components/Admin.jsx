import { React } from "../deps.ts";

import { INVENTORY_API_ENDPOINT } from "../constants.ts";

const { useState, useEffect } = React;

export function Admin() {
  const [inventoryCount, setInventoryCount] = useState(null);
  const [inputValue, setInputValue] = useState(0);
  const [isCompletedHydrate, setIsCompletedHydrate] = useState(false);

  const fetchInventoryCount = () => {
    fetch(INVENTORY_API_ENDPOINT)
      .then((res) => res.text())
      .then((text) => setInventoryCount(text));
  };

  const reFetch = () => {
    setInventoryCount(null);
    fetchInventoryCount();
  };

  useEffect(() => {
    fetchInventoryCount();
  }, []);

  useEffect(() => {
    setIsCompletedHydrate(true);
  }, []);

  const onChange = (e) => {
    setInputValue(e.currentTarget.value);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setInventoryCount(null);
    await fetch(INVENTORY_API_ENDPOINT, { method: "PUT", body: inputValue });
    fetchInventoryCount();
  };

  return (
    <div>
      <h1 style={{ color: "red" }}>When actually, restricted access page.</h1>
      <p>
        Current Inventory Count: {inventoryCount || "Loading..."}
        <br />
        <button disabled={!isCompletedHydrate} type="button" onClick={reFetch}>
          reload
        </button>
      </p>
      <form onSubmit={onSubmit}>
        <div>Edit Inventory</div>
        <input type="number" value={inputValue} onChange={onChange} />{" "}
        <button disabled={!isCompletedHydrate} type="submit">
          Submit
        </button>
      </form>
      <p>
        <a href="/">to product page</a>
      </p>
    </div>
  );
}
