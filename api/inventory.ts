import { readAll, ServerRequest } from "../deps.ts";

import {
  overwriteInventoryFile,
  readInventoryFile,
  synchronizeKvValue,
} from "../inventory/inventory.ts";

const ALLOWED_METHODS = ["GET", "PUT"] as const;
type ALLOWED_METHOD = typeof ALLOWED_METHODS[number];

async function resCurrentInventoryCount(req: ServerRequest) {
  const currentInventoryCount = await readInventoryFile();
  req.respond({
    status: 200,
    headers: new Headers({
      "Content-Type": "text/plain",
    }),
    body: currentInventoryCount,
  });
}

async function editInventoryCount(req: ServerRequest) {
  const decoder = new TextDecoder("utf-8");
  const body = await readAll(req.body);
  const receivedValue = decoder.decode(body);

  await overwriteInventoryFile(receivedValue);

  req.respond({
    status: 200,
  });

  synchronizeKvValue(Number(receivedValue));
}

export function inventory(req: ServerRequest) {
  const isAllowedMethod = (m: string): m is ALLOWED_METHOD =>
    ALLOWED_METHODS.some((item) => item === m);

  const { method } = req;

  if (!isAllowedMethod(method)) {
    req.respond({
      status: 405,
      headers: new Headers({
        "Content-Type": "text/plain",
      }),
      body: "Method Not Allowed\n",
    });
    return;
  }

  switch (method) {
    case "GET": {
      resCurrentInventoryCount(req);
      return;
    }
    case "PUT": {
      editInventoryCount(req);
      return;
    }
    default: {
      const strangeMethod: never = method;
      throw new Error(`${strangeMethod} is not allowed.`);
    }
  }
}
