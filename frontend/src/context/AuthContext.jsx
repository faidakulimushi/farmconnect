// @refresh reset
import { createContext, useContext, useEffect, useReducer } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

const _parseUser = () => {
  try { return JSON.parse(localStorage.getItem("agrilink_user")) || null; }
  catch { localStorage.removeItem("agrilink_user"); return null; }
};
const initialState = {
  user: _parseUser(),
  token: localStorage.getItem("agrilink_token") || null,
  loading: false,
  error: null,
};

function authReducer(state, action) {
  switch (action.type) {
    case "AUTH_START":
      return { ...state, loading: true, error: null };
    case "AUTH_SUCCESS":
      return { ...state, loading: false, user: action.payload.user, token: action.payload.token, error: null };
    case "AUTH_FAIL":
      return { ...state, loading: false, error: action.payload };
    case "UPDATE_USER":
      return { ...state, user: action.payload };
    case "LOGOUT":
      return { ...initialState, user: null, token: null };
    default:
      return state;
  }
}

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Keep axios default auth header in sync
  useEffect(() => {
    if (state.token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${state.token}`;
      localStorage.setItem("agrilink_token", state.token);
      localStorage.setItem("agrilink_user", JSON.stringify(state.user));
    } else {
      delete api.defaults.headers.common["Authorization"];
      localStorage.removeItem("agrilink_token");
      localStorage.removeItem("agrilink_user");
    }
  }, [state.token, state.user]);

  const login = async (email, password) => {
    dispatch({ type: "AUTH_START" });
    try {
      const { data } = await api.post("/login", { email, password });
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      localStorage.setItem("agrilink_token", data.token);
      localStorage.setItem("agrilink_user", JSON.stringify(data.user));
      dispatch({ type: "AUTH_SUCCESS", payload: data });
      return data;
    } catch (err) {
      let msg;
      if (err.isHtmlResponse || !err.response) {
        msg = "Cannot connect to server. Please try again later.";
      } else if (err.response.status === 401) {
        msg = "Invalid email or password.";
      } else if (err.response.status === 403) {
        msg = "Account has been deactivated.";
      } else {
        msg = err.response?.data?.message || "Login failed. Please try again.";
      }
      dispatch({ type: "AUTH_FAIL", payload: msg });
      throw new Error(msg);
    }
  };

  const register = async (name, email, password, role) => {
    dispatch({ type: "AUTH_START" });
    try {
      const { data } = await api.post("/register", { name, email, password, role });
      api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      localStorage.setItem("agrilink_token", data.token);
      localStorage.setItem("agrilink_user", JSON.stringify(data.user));
      dispatch({ type: "AUTH_SUCCESS", payload: data });
      return data;
    } catch (err) {
      let msg;
      if (err.isHtmlResponse || !err.response) {
        msg = "Cannot connect to server. Please try again later.";
      } else if (err.response.status === 409) {
        msg = "Email is already registered.";
      } else if (err.response.status === 400) {
        msg = err.response?.data?.message || "Please check your details.";
      } else {
        msg = err.response?.data?.message || "Registration failed. Please try again.";
      }
      dispatch({ type: "AUTH_FAIL", payload: msg });
      throw new Error(msg);
    }
  };

  const logout = () => {
    delete api.defaults.headers.common["Authorization"];
    localStorage.removeItem("agrilink_token");
    localStorage.removeItem("agrilink_user");
    dispatch({ type: "LOGOUT" });
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
    localStorage.setItem("agrilink_user", JSON.stringify(userData));
  };

  return (
    <AuthContext.Provider
      value={{ ...state, login, register, logout, updateUser, isAuthenticated: !!state.token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
