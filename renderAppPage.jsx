import { React, ReactDOMServer } from "./deps.ts";

import { Html } from "./components/Html.jsx";
import { App } from "./components/App.jsx";
import { INVENTORY_STATE_EMBEDDED_ELEMENT_ID } from "./constants.ts";
import { APP_PAGE_BUNDLE_JS_FILE_URL } from "./server.jsx";

export function returnAppPageHeader() {
  return new Headers({
    "Content-Type": "text/html",
  });
}

export function renderAppPage({ inventoryState }) {
  return ReactDOMServer.renderToString(
    <Html
      bundleJs={
        <script type="module" src={APP_PAGE_BUNDLE_JS_FILE_URL}></script>
      }
      dataJs={
        <script
          id={INVENTORY_STATE_EMBEDDED_ELEMENT_ID}
          type="text/plain"
          data={inventoryState}
        ></script>
      }
    >
      <App inventoryState={inventoryState} />
    </Html>
  );
}
