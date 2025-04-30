import { legacy_createStore, applyMiddleware } from "redux";
import { composeWithDevTools } from "redux-devtools-extension";
import MainReducer from "./reducer/MainReducer";
import thunk from "redux-thunk";

const initialState = {};

const middleware = [thunk];

const Store = legacy_createStore(
  MainReducer,
  initialState,
  composeWithDevTools(applyMiddleware(...middleware))
);

export default Store;
