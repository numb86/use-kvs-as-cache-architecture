import { React } from "../deps.ts";

import { ROOT_ELEMENT_ID_REACT_APP } from "../constants.ts";

export function Html({ children, bundleJs, dataJs }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" sizes="192x192" href="favicon.ico" />
        <title>Sushi Shop</title>
        <meta charSet="utf-8" />
      </head>
      <body>
        {dataJs}
        <div id={ROOT_ELEMENT_ID_REACT_APP}>{children}</div>
        {bundleJs}
      </body>
    </html>
  );
}
