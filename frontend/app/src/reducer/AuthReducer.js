import TYPE from "./Type";

const initialState = {
  access: localStorage.getItem("access"),
  refresh: localStorage.getItem("refresh"),
  isAuthenticated: !!localStorage.getItem("access"),
  user: null,
};

const AuthReducer = (state = initialState, action) => {
  const { type, payload } = action;
  switch (type) {
    case TYPE.LOGIN_SUCCESS:
      localStorage.setItem("access", payload.access);
      localStorage.setItem("refresh", payload.refresh);
      return {
        ...state,
        access: payload.access,
        refresh: payload.refresh,
        isAuthenticated: true,
        user: null,
      };
    case TYPE.LOGIN_FAIL:
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return {
        ...state,
        access: null,
        refresh: null,
        isAuthenticated: false,
        user: null,
      };
    case TYPE.VERIFY_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: payload.user,
      };
    case TYPE.VERIFY_FAIL:
      return {
        ...state,
        isAuthenticated: false,
        user: null,
      };
    case TYPE.GET_USER_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
        user: payload,
      };
    case TYPE.GET_USER_FAIL:
      return {
        ...state,
        user: null,
      };
    case TYPE.REFRESH_SUCCESS:
      localStorage.setItem("access", payload.access);
      return {
        ...state,
        access: payload.access,
        isAuthenticated: true,
      };
    case TYPE.REFRESH_FAIL:
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return {
        ...state,
        access: null,
        refresh: null,
        isAuthenticated: false,
        user: null,
      };
    case TYPE.CHANGE_PASSWORD_SUCCESS:
      return {
        ...state,
      };
    case TYPE.CHANGE_PASSWORD_FAIL:
      return {
        ...state,
      };
    case TYPE.REGISTER_SUCCESS:
      return {
        ...state,
      };
    case TYPE.REGISTER_FAIL:
      return {
        ...state,
      };
    case TYPE.ACTIVATE_ACCOUNT_SUCCESS:
      return {
        ...state,
      };
    case TYPE.ACTIVATE_ACCOUNT_FAIL:
      return {
        ...state,
      };
    case TYPE.RESET_SUCCESS:
      return {
        ...state,
      };
    case TYPE.RESET_FAIL:
      return {
        ...state,
      };
    case TYPE.SET_SUCCESS:
      return {
        ...state,
      };
    case TYPE.SET_FAIL:
      return {
        ...state,
      };
    case TYPE.LOGOUT:
      localStorage.removeItem("access");
      localStorage.removeItem("refresh");
      return {
        ...state,
        access: null,
        refresh: null,
        isAuthenticated: false,
        user: null,
      };

    case TYPE.GUEST_VIEW:
      return {
        ...state,
      };
    default:
      return state;
  }
};

export default AuthReducer;
