/**
=========================================================
* Material Dashboard 2 React - v2.2.0
=========================================================

* Product Page: https://www.creative-tim.com/product/material-dashboard-react
* Copyright 2023 Creative Tim (https://www.creative-tim.com)

Coded by www.creative-tim.com

 =========================================================

* The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
*/

/**
  This file is used for controlling the global states of the components,
  you can customize the states for the different components here.
*/

import { createContext, useContext, useReducer, useMemo } from "react";

// prop-types is a library for typechecking of props
import PropTypes from "prop-types";

// Material Dashboard 2 React main context
const MaterialUI = createContext();

// Setting custom name for the context which is visible on react dev tools
MaterialUI.displayName = "MaterialUIContext";

// Material Dashboard 2 React reducer
function reducer(state, action) {
  switch (action.type) {
    case "MINI_SIDENAV": {
      return { ...state, miniSidenav: action.value };
    }
    case "TRANSPARENT_SIDENAV": {
      return { ...state, transparentSidenav: action.value };
    }
    case "WHITE_SIDENAV": {
      return { ...state, whiteSidenav: action.value };
    }
    case "SIDENAV_COLOR": {
      return { ...state, sidenavColor: action.value };
    }
    case "TRANSPARENT_NAVBAR": {
      return { ...state, transparentNavbar: action.value };
    }
    case "FIXED_NAVBAR": {
      return { ...state, fixedNavbar: action.value };
    }
    case "OPEN_CONFIGURATOR": {
      return { ...state, openConfigurator: action.value };
    }
    case "DIRECTION": {
      return { ...state, direction: action.value };
    }
    case "LAYOUT": {
      return { ...state, layout: action.value };
    }
    case "DARKMODE": {
      return { ...state, darkMode: action.value };
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

// Material Dashboard 2 React context provider
function MaterialUIControllerProvider({ children }) {
  const initialState = {
    miniSidenav: JSON.parse(localStorage.getItem("MINI_SIDENAV")) ?? true,
    transparentSidenav: JSON.parse(localStorage.getItem("TRANSPARENT_SIDENAV")) ?? false,
    whiteSidenav: JSON.parse(localStorage.getItem("WHITE_SIDENAV")) ?? false,
    sidenavColor: JSON.parse(localStorage.getItem("SIDENAV_COLOR")) ?? "warning",
    transparentNavbar: JSON.parse(localStorage.getItem("TRANSPARENT_NAVBAR")) ?? true,
    fixedNavbar: JSON.parse(localStorage.getItem("FIXED_NAVBAR")) ?? false,
    openConfigurator: JSON.parse(localStorage.getItem("OPEN_CONFIGURATOR")) ?? false,
    direction: JSON.parse(localStorage.getItem("DIRECTION")) ?? "ltr",
    layout: JSON.parse(localStorage.getItem("LAYOUT")) ?? "dashboard",
    darkMode: JSON.parse(localStorage.getItem("DARKMODE")) ?? false,
  };

  const [controller, dispatch] = useReducer(reducer, initialState);

  const value = useMemo(() => [controller, dispatch], [controller, dispatch]);

  return <MaterialUI.Provider value={value}>{children}</MaterialUI.Provider>;
}

// Material Dashboard 2 React custom hook for using context
function useMaterialUIController() {
  const context = useContext(MaterialUI);

  if (!context) {
    throw new Error(
      "useMaterialUIController should be used inside the MaterialUIControllerProvider."
    );
  }

  return context;
}

// Typechecking props for the MaterialUIControllerProvider
MaterialUIControllerProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Context module functions
const setMiniSidenav = (dispatch, value) => {
  localStorage.setItem("MINI_SIDENAV", JSON.stringify(value));
  dispatch({ type: "MINI_SIDENAV", value });
};
const setTransparentSidenav = (dispatch, value) => {
  localStorage.setItem("TRANSPARENT_SIDENAV", JSON.stringify(value));
  dispatch({ type: "TRANSPARENT_SIDENAV", value });
};
const setWhiteSidenav = (dispatch, value) => {
  localStorage.setItem("WHITE_SIDENAV", JSON.stringify(value));
  dispatch({ type: "WHITE_SIDENAV", value });
};
const setSidenavColor = (dispatch, value) => {
  localStorage.setItem("SIDENAV_COLOR", JSON.stringify(value));
  dispatch({ type: "SIDENAV_COLOR", value });
};
const setTransparentNavbar = (dispatch, value) => {
  localStorage.setItem("TRANSPARENT_NAVBAR", JSON.stringify(value));
  dispatch({ type: "TRANSPARENT_NAVBAR", value });
};
const setFixedNavbar = (dispatch, value) => {
  localStorage.setItem("FIXED_NAVBAR", JSON.stringify(value));
  dispatch({ type: "FIXED_NAVBAR", value });
};
const setOpenConfigurator = (dispatch, value) => {
  localStorage.setItem("OPEN_CONFIGURATOR", JSON.stringify(value));
  dispatch({ type: "OPEN_CONFIGURATOR", value });
};
const setDirection = (dispatch, value) => {
  localStorage.setItem("DIRECTION", JSON.stringify(value));
  dispatch({ type: "DIRECTION", value });
};
const setLayout = (dispatch, value) => {
  localStorage.setItem("LAYOUT", JSON.stringify(value));
  dispatch({ type: "LAYOUT", value });
};
const setDarkMode = (dispatch, value) => {
  localStorage.setItem("DARKMODE", JSON.stringify(value));
  dispatch({ type: "DARKMODE", value });
};

export {
  MaterialUIControllerProvider,
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
  setSidenavColor,
  setTransparentNavbar,
  setFixedNavbar,
  setOpenConfigurator,
  setDirection,
  setLayout,
  setDarkMode,
};
