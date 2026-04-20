import { useEffect, useMemo, useState } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";

import Icon from "@mui/material/Icon";
import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import theme from "assets/theme";
import themeDark from "assets/theme-dark";
import MDBox from "components/MDBox";
import Configurator from "examples/Configurator";
import Sidenav from "examples/Sidenav";
import { Logout } from "api/logout";
import { setOpenConfigurator, useMaterialUIController } from "context";
import routes from "routes";
import { supabase } from "shared/api/supabaseClient";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { pathname } = useLocation();
  const { darkMode, openConfigurator } = controller;
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, [pathname]);

  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) return getRoutes(route.collapse);

      if (route.route) {
        if (!session && route.route !== "/authentication/sign-in") {
          return (
            <Route
              path={route.route}
              element={<Navigate to="/authentication/sign-in" />}
              key={route.key}
            />
          );
        }

        return <Route path={route.route} element={route.component} key={route.key} />;
      }

      return null;
    });

  const routesElement = getRoutes(routes);

  const filteredRoutes = useMemo(() => {
    if (!session) {
      return routes.filter((route) => route.key === "sign-in");
    }

    return routes.map((route) => {
      if (route.key === "sign-in") {
        return {
          ...route,
          name: "로그아웃",
          key: "sign-out",
          route: "/logout",
        };
      }

      return route;
    });
  }, [session]);

  const configsButton = (
    <MDBox
      display="flex"
      justifyContent="center"
      alignItems="center"
      width="3.5rem"
      height="3.5rem"
      bgColor="white"
      shadow="sm"
      borderRadius="50%"
      position="fixed"
      left="2rem"
      bottom="5rem"
      zIndex={9999}
      color="dark"
      sx={{ cursor: "pointer" }}
      onClick={handleConfiguratorOpen}
    >
      <Icon fontSize="small" color="inherit">
        settings
      </Icon>
    </MDBox>
  );

  if (loading) return null;

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />

      <Sidenav
        key={session ? "login" : "logout"}
        color="success"
        brandName="한결 관리자"
        routes={filteredRoutes}
      />

      <Configurator />
      {configsButton}

      <Routes>
        {routesElement}
        <Route path="/logout" element={<Logout />} />
        <Route
          path="*"
          element={<Navigate to={session ? "/column-posts" : "/authentication/sign-in"} />}
        />
      </Routes>
    </ThemeProvider>
  );
}
