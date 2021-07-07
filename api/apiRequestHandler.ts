import { ServerRequest } from "../deps.ts";

import { inventory } from "./inventory.ts";
import { buy } from "./buy.ts";
import { BUY_API_ENDPOINT, INVENTORY_API_ENDPOINT } from "../constants.ts";

export function apiRequestHandler(req: ServerRequest) {
  if (req.url === BUY_API_ENDPOINT) {
    buy(req);
    return;
  }

  if (req.url === INVENTORY_API_ENDPOINT) {
    inventory(req);
    return;
  }

  req.respond({
    status: 404,
    headers: new Headers({
      "Content-Type": "text/plain",
    }),
    body: "Not Found\n",
  });
}
