import { config } from "../deps.ts";

const env = config();
const ENVIRONMENT = Deno.env.get("ENVIRONMENT") || env.ENVIRONMENT;
function getEnvironmentVariable(key: string): string {
  return (
    ENVIRONMENT === "production" ? Deno.env.get(key) : env[key]
  ) as string;
}

const APP_PAGE_HTML_KEY = encodeURIComponent(
  getEnvironmentVariable("APP_PAGE_URL"),
);
const APP_PAGE_HTML_VALUE_HEADERS_FIELD_NAME = "headers";
const APP_PAGE_HTML_VALUE_BODY_FIELD_NAME = "body";
const ACCOUNT_ID = getEnvironmentVariable("ACCOUNT_ID");
const NAMESPACE_ID = getEnvironmentVariable("NAMESPACE_ID");
const CF_API_KEY = getEnvironmentVariable("CF_API_KEY");
const CF_VERIFIED_EMAIL = getEnvironmentVariable("CF_VERIFIED_EMAIL");

export const KV_API_BASE_URL =
  `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/storage/kv/namespaces/${NAMESPACE_ID}/values/`;

export const AUTH_HEADER = new Headers({
  "X-Auth-Email": CF_VERIFIED_EMAIL,
  "X-Auth-Key": CF_API_KEY,
});

const TTL_OF_APP_PAGE_HTML_KV = "60";

export function sendAppPageHtmlToKv(
  value: {
    [APP_PAGE_HTML_VALUE_HEADERS_FIELD_NAME]: Headers;
    [APP_PAGE_HTML_VALUE_BODY_FIELD_NAME]: string;
  },
) {
  const headers = Array.from(value.headers.entries()).reduce(
    (acc, entry) => {
      return {
        ...acc,
        [entry[0]]: entry[1],
      };
    },
    {},
  );

  fetch(
    `${KV_API_BASE_URL}${APP_PAGE_HTML_KEY}?expiration_ttl=${TTL_OF_APP_PAGE_HTML_KV}`,
    {
      method: "PUT",
      headers: AUTH_HEADER,
      body: JSON.stringify({
        [APP_PAGE_HTML_VALUE_HEADERS_FIELD_NAME]: headers,
        [APP_PAGE_HTML_VALUE_BODY_FIELD_NAME]: value.body,
      }),
    },
  );
}
