import { React, ReactDOM } from "../deps.ts";

import { Admin } from "../components/Admin.jsx";
import { ROOT_ELEMENT_ID_REACT_APP } from "../constants.ts";

ReactDOM.hydrate(<Admin />, document.getElementById(ROOT_ELEMENT_ID_REACT_APP));
