import { ServerRequest } from "../deps.ts";

import {
  overwriteInventoryFile,
  readInventoryFile,
  synchronizeKvValue,
} from "../inventory/inventory.ts";

export async function buy(req: ServerRequest) {
  const remainingInventory = Number(await readInventoryFile());

  if (remainingInventory > 0) {
    const nextInventoryCount = remainingInventory - 1;
    await overwriteInventoryFile(String(nextInventoryCount));
    req.respond({
      status: 200,
      headers: new Headers({
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({ result: "success" }),
    });

    synchronizeKvValue(nextInventoryCount);

    return;
  }

  req.respond({
    status: 500,
    headers: new Headers({
      "Content-Type": "application/json",
    }),
    body: JSON.stringify({ result: "error" }),
  });
}
