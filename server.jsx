import {
  config,
  listenAndServe,
  parse,
  React,
  ReactDOMServer,
} from "./deps.ts";

import { Html } from "./components/Html.jsx";
import { Admin } from "./components/Admin.jsx";
import { BUY_API_ENDPOINT, INVENTORY_API_ENDPOINT } from "./constants.ts";
import { sendAppPageHtmlToKv } from "./kv/kv.ts";
import { apiRequestHandler } from "./api/apiRequestHandler.ts";
import { getInventoryState, readInventoryFile } from "./inventory/inventory.ts";
import { returnAppPageHeader, renderAppPage } from "./renderAppPage.jsx";

const env = config();
const ENVIRONMENT = Deno.env.get("ENVIRONMENT") || env.ENVIRONMENT;
const isProduction = ENVIRONMENT === "production";

const ENTRY_POINT_DIR_PATH = "./entryPoint";
const APP_PAGE_ENTRY_POINT = `${ENTRY_POINT_DIR_PATH}/app.jsx`;
const ADMIN_PAGE_ENTRY_POINT = `${ENTRY_POINT_DIR_PATH}/admin.jsx`;

export const APP_PAGE_BUNDLE_JS_FILE_URL = "/bundle-app.js";
const ADMIN_PAGE_BUNDLE_JS_FILE_URL = "/bundle-admin.js";

const entryPointToBundleJs = new Map([
  [APP_PAGE_ENTRY_POINT, null],
  [ADMIN_PAGE_ENTRY_POINT, null],
]);

const args = parse(Deno.args);
const argPort = args.port;
const port = argPort ? Number(argPort) : 8080;

function bundleClientJsFile(filePath) {
  return Deno.emit(filePath, {
    bundle: "module",
  }).then((res) => {
    return res.files["deno:///bundle.js"];
  });
}

if (isProduction) {
  Array.from(entryPointToBundleJs.entries()).forEach(async ([entryPoint]) => {
    const js = await bundleClientJsFile(entryPoint);
    entryPointToBundleJs.set(entryPoint, js);
  });
}

listenAndServe({ port }, async (req) => {
  switch (true) {
    case req.url === "/": {
      const inventoryCount = Number(await readInventoryFile());
      const inventoryState = getInventoryState(inventoryCount);

      const headers = returnAppPageHeader();
      const body = renderAppPage({
        inventoryState,
      });

      req.respond({
        status: 200,
        headers,
        body,
      });

      sendAppPageHtmlToKv({ headers, body });
      break;
    }
    case req.url === "/thanks": {
      req.respond({
        status: 303,
        headers: new Headers({
          Location: "/",
        }),
      });
      break;
    }
    case req.url === "/admin": {
      req.respond({
        status: 200,
        headers: new Headers({
          "Content-Type": "text/html",
        }),
        body: ReactDOMServer.renderToString(
          <Html
            bundleJs={
              <script
                type="module"
                src={ADMIN_PAGE_BUNDLE_JS_FILE_URL}
              ></script>
            }
          >
            <Admin />
          </Html>
        ),
      });
      break;
    }
    case req.url === APP_PAGE_BUNDLE_JS_FILE_URL: {
      const bundleJs = isProduction
        ? entryPointToBundleJs.get(APP_PAGE_ENTRY_POINT)
        : await bundleClientJsFile(APP_PAGE_ENTRY_POINT);
      req.respond({
        status: 200,
        headers: new Headers({
          "Content-Type": "text/javascript",
        }),
        body: bundleJs,
      });
      break;
    }
    case req.url === ADMIN_PAGE_BUNDLE_JS_FILE_URL: {
      const bundleJs = isProduction
        ? entryPointToBundleJs.get(ADMIN_PAGE_ENTRY_POINT)
        : await bundleClientJsFile(ADMIN_PAGE_ENTRY_POINT);
      req.respond({
        status: 200,
        headers: new Headers({
          "Content-Type": "text/javascript",
        }),
        body: bundleJs,
      });
      break;
    }
    case req.url === INVENTORY_API_ENDPOINT:
    case req.url === BUY_API_ENDPOINT: {
      apiRequestHandler(req);
      break;
    }
    case /\.jpg$/.test(req.url): {
      const file = await Deno.readFile(`.${req.url}`);
      req.respond({
        status: 200,
        headers: new Headers({
          "Content-Type": "image/jpeg",
        }),
        body: file,
      });
      break;
    }
    case req.url === "/favicon.ico": {
      const ico = await Deno.readFile("./images/favicon.ico");
      req.respond({
        status: 200,
        headers: new Headers({
          "Content-Type": "image/vnd.microsoft.icon",
        }),
        body: ico,
      });
      break;
    }
    default: {
      req.respond({
        status: 404,
        headers: new Headers({
          "Content-Type": "text/plain",
        }),
        body: "Not found\n",
      });
      break;
    }
  }
});
