import { React, ReactDOM } from "../deps.ts";

import { App } from "../components/App.jsx";
import {
  INVENTORY_STATE_EMBEDDED_ELEMENT_ID,
  ROOT_ELEMENT_ID_REACT_APP,
} from "../constants.ts";

const inventoryState = document
  .getElementById(INVENTORY_STATE_EMBEDDED_ELEMENT_ID)
  .getAttribute("data");

ReactDOM.hydrate(
  <App inventoryState={inventoryState} />,
  document.getElementById(ROOT_ELEMENT_ID_REACT_APP),
);
