import { INVENTORY_STATE } from "../constants.ts";
import { AUTH_HEADER, KV_API_BASE_URL, sendAppPageHtmlToKv } from "../kv/kv.ts";
import { renderAppPage, returnAppPageHeader } from "../renderAppPage.jsx";

const inventoryStateList = Object.values(INVENTORY_STATE);
type InventoryState = typeof inventoryStateList[number];

const INVENTORY_DIR_PATH = "/inventory";
const INVENTORY_FILE_NAME = "count.txt";

const INITIAL_INVENTORY_COUNT = 5;

const INVENTORY_STATE_KEY_IN_KV = "inventory-state";

const inventoryDirAbsolutePath = `${Deno.cwd()}${INVENTORY_DIR_PATH}`;
const inventoryFileAbsolutePath =
  `${inventoryDirAbsolutePath}/${INVENTORY_FILE_NAME}`;

export function readInventoryFile() {
  return Deno.readTextFile(inventoryFileAbsolutePath);
}

export async function overwriteInventoryFile(value: string) {
  await Deno.writeTextFile(inventoryFileAbsolutePath, value, {
    create: false,
  });
}

export function getInventoryState(inventoryCount: number) {
  if (inventoryCount >= 3) {
    return INVENTORY_STATE.ENOUGH;
  }
  if (inventoryCount < 1) {
    return INVENTORY_STATE.NONE;
  }
  return INVENTORY_STATE.LITTLE;
}

async function fetchInventoryStateFromKv(): Promise<InventoryState | null> {
  const res = await fetch(`${KV_API_BASE_URL}${INVENTORY_STATE_KEY_IN_KV}`, {
    headers: AUTH_HEADER,
  });
  const value = await res.text();

  const isInventoryState = (v: string): v is InventoryState =>
    inventoryStateList.some((item) => item === v);

  return isInventoryState(value) ? value : null;
}

function sendInventoryStateToKv(value: InventoryState) {
  fetch(`${KV_API_BASE_URL}${INVENTORY_STATE_KEY_IN_KV}`, {
    method: "PUT",
    headers: AUTH_HEADER,
    body: value,
  });
}

export async function synchronizeKvValue(inventoryCount: number) {
  const latestInventoryState = getInventoryState(inventoryCount);
  const currentInventoryStateInKv = await fetchInventoryStateFromKv();
  if (currentInventoryStateInKv !== latestInventoryState) {
    sendInventoryStateToKv(latestInventoryState);

    const headers = returnAppPageHeader();
    const body = renderAppPage({
      inventoryState: latestInventoryState,
    }) as string;
    sendAppPageHtmlToKv({ headers, body });
  }
}

async function init() {
  let existInventoryFile = false;

  for await (const dirEntry of Deno.readDir(inventoryDirAbsolutePath)) {
    if (dirEntry.name === INVENTORY_FILE_NAME) {
      existInventoryFile = true;
    }
  }

  if (existInventoryFile) {
    const currentInventoryCount = await readInventoryFile();
    synchronizeKvValue(Number(currentInventoryCount));
  } else {
    await Deno.writeTextFile(
      inventoryFileAbsolutePath,
      String(INITIAL_INVENTORY_COUNT),
    );

    synchronizeKvValue(INITIAL_INVENTORY_COUNT);
  }
}

init();
