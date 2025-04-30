import TYPE from "./Type";
import toast from "react-hot-toast";
import axios from "axios";

export const login = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ email, password });
  try {
    const res = await axios.post(
      "http://localhost:8000/dj_rest_auth/login/",
      body,
      config
    );
    localStorage.setItem("access", res.data.access);
    localStorage.setItem("refresh", res.data.refresh);

    dispatch({
      type: TYPE.LOGIN_SUCCESS,
      payload: res.data,
    });
    toast.success("Has iniciado sesión correctamente");
  } catch (err) {
    dispatch({
      type: TYPE.LOGIN_FAIL,
    });
    toast.error("Error al iniciar sesión");
  }
};

export const verifySuccess = (user) => (dispatch) => {
  toast.success("Verificación exitosa");
  dispatch({
    type: TYPE.VERIFY_SUCCESS,
    payload: { user },
  });
};

export const verifyFail = () => (dispatch) => {
  toast.error("Error en la verificación");
  dispatch({
    type: TYPE.VERIFY_FAIL,
  });
};

// Continúa con el mismo patrón para todas las acciones
export const registerSuccess = () => (dispatch) => {
  toast.success("Se ha enviado un link de verificación a tu correo");
  dispatch({
    type: TYPE.REGISTER_SUCCESS,
  });
};

export const registerFail = () => (dispatch) => {
  toast.error("Error al registrar el usuario");
  dispatch({
    type: TYPE.REGISTER_FAIL,
  });
};

export const verify = () => async (dispatch) => {
  if (localStorage.getItem("access")) {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ token: localStorage.getItem("access") });
    try {
      await axios.post(
        "http://localhost:8000/dj_rest_auth/token/verify/",
        body,
        config
      );
      dispatch({
        type: TYPE.VERIFY_SUCCESS,
      });
    } catch (err) {
      await dispatch(refresh()); // <-- esto ya devuelve una Promise
    }
  } else {
    dispatch({ type: TYPE.GUEST_VIEW });
  }
};

export const getUser = () => async (dispatch) => {
  if (localStorage.getItem("access")) {
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    };
    try {
      const res = await axios.get(
        "http://localhost:8000/dj_rest_auth/user/",
        config
      );
      dispatch({
        type: TYPE.GET_USER_SUCCESS,
        payload: res.data,
      });
    } catch (err) {
      dispatch({ type: TYPE.GET_USER_FAIL });
    }
  } else {
    dispatch({ type: TYPE.GUEST_VIEW });
  }
};

export const refresh = () => async (dispatch) => {
  if (localStorage.getItem("access")) {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ refresh: localStorage.getItem("refresh") });
    try {
      const res = await axios.post(
        "http://localhost:8000/dj_rest_auth/token/refresh/",
        body,
        config
      );
      localStorage.setItem("access", res.data.access);
      dispatch({
        type: TYPE.REFRESH_SUCCESS,
        payload: res.data,
      });
    } catch (err) {
      dispatch({ type: TYPE.REFRESH_FAIL });
    }
  } else {
    dispatch({ type: TYPE.GUEST_VIEW });
  }
};

export const changePassword =
  (new_password1, new_password2, old_password) => async (dispatch) => {
    await dispatch(verify());
    const config = {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("access")}`,
      },
    };
    const body = JSON.stringify({ new_password1, new_password2, old_password });
    try {
      await axios.post(
        "http://localhost:8000/dj_rest_auth/password/change/",
        body,
        config
      );
      dispatch({
        type: TYPE.CHANGE_PASSWORD_SUCCESS,
      });
      toast.success("Contraseña cambiada correctamente");
    } catch (err) {
      dispatch({
        type: TYPE.CHANGE_PASSWORD_FAIL,
      });
      toast.error("Error al cambiar la contraseña");
    }
  };

export const logout = () => async (dispatch) => {
  const config = {
    headers: {
      "content-Type": "application/json",
    },
  };
  try {
    await axios.post(
      "http://localhost:8000/dj_rest_auth/logout/",

      config
    );
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    dispatch({
      type: TYPE.LOGOUT,
    });
    toast.success("Has cerrado sesión correctamente");
  } catch (err) {
    dispatch({
      type: TYPE.LOGOUT,
    });
    toast.error("Error al cerrar sesión");
  }
};

export const register =
  (email, username, first_name, last_name, password1, password2) =>
  async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({
      email,
      username: email,
      first_name,
      last_name,
      password1,
      password2,
    });
    try {
      await axios.post(
        "http://localhost:8000/dj_rest_auth/registration/",
        body,
        config
      );
      dispatch({ type: TYPE.REGISTER_SUCCESS });
      toast.success("Se ha enviado un link de verificación a tu correo");
    } catch (err) {
      dispatch({ type: TYPE.REGISTER_FAIL });
      toast.error("Error al registrar el usuario");
    }
  };

export const emailVerification = (key) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ key });
  try {
    await axios.post(
      "http://localhost:8000/dj_rest_auth/registration/verify-email/",
      body,
      config
    );
    dispatch({ type: TYPE.ACTIVATE_ACCOUNT_SUCCESS });
    toast.success("Cuenta activada correctamente");
  } catch (err) {
    dispatch({ type: TYPE.ACTIVATE_ACCOUNT_FAIL });
    toast.error("Error al activar la cuenta");
  }
};

export const resetPassword = (email) => async (dispatch) => {
  const config = {
    headers: {
      "Content-Type": "application/json",
    },
  };
  const body = JSON.stringify({ email });
  try {
    await axios.post(
      "http://localhost:8000/dj_rest_auth/password/reset/",
      body,
      config
    );
    dispatch({ type: TYPE.RESET_SUCCESS });
    toast.success("Se ha enviado un link de restablecimiento a tu correo");
  } catch (err) {
    dispatch({ type: TYPE.RESET_FAIL });
    toast.error("Error al enviar el link de restablecimiento");
  }
};

export const resetPasswordConfirm =
  (new_password1, new_password2, uid, token) => async (dispatch) => {
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const body = JSON.stringify({ new_password1, new_password2, uid, token });
    try {
      await axios.post(
        "http://localhost:8000/dj_rest_auth/password/reset/confirm/",
        body,
        config
      );
      dispatch({ type: TYPE.SET_SUCCESS });
      toast.success("Contraseña restablecida correctamente");
    } catch (err) {
      dispatch({ type: TYPE.SET_FAIL });
      toast.error("Error al restablecer la contraseña");
    }
  };
