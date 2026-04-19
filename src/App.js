import { useEffect, useState, useMemo } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

import Sidenav from "examples/Sidenav";
import Configurator from "examples/Configurator";
import theme from "assets/theme";
import themeDark from "assets/theme-dark";

import routes from "routes";
import { supabase } from "./api/supabase";
import { Logout } from "./api/logout";
// Material Dashboard 2 React contexts
import { useMaterialUIController, setMiniSidenav, setOpenConfigurator } from "context";

// Images
import MDBox from "./components/MDBox";
import Icon from "@mui/material/Icon";

export default function App() {
  const [controller, dispatch] = useMaterialUIController();
  const { pathname } = useLocation();
  const {
    miniSidenav,
    direction,
    layout,
    openConfigurator,
    sidenavColor,
    transparentSidenav,
    whiteSidenav,
    darkMode,
  } = controller;

  const handleConfiguratorOpen = () => setOpenConfigurator(dispatch, !openConfigurator);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  // 로그인 상태 가져오기
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (session !== data.session) {
        setSession(data.session);
      }
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // 페이지 이동 시 스크롤 초기화
  useEffect(() => {
    document.documentElement.scrollTop = 0;
  }, [pathname]);

  // 라우트 생성 (session 의존!)
  const getRoutes = (allRoutes) =>
    allRoutes.map((route) => {
      if (route.collapse) return getRoutes(route.collapse);

      if (route.route) {
        // 로그인 안됐으면 막기
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

  // 사이드바 메뉴 필터링
  const filteredRoutes = useMemo(() => {
    if (!session) {
      return routes.filter((r) => r.key === "sign-in");
    }

    return routes.map((r) => {
      if (r.key === "sign-in") {
        return {
          ...r,
          name: "로그아웃",
          key: "sign-out",
          route: "/logout",
        };
      }
      return r;
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

  // 로딩 중이면 아무것도 안그림 (깜빡임 방지)
  if (loading) return null;

  return (
    <ThemeProvider theme={darkMode ? themeDark : theme}>
      <CssBaseline />

      {/* 로그인 상태 따라 강제 리렌더 */}
      <Sidenav
        key={session ? "login" : "logout"}
        color="success"
        brandName="관리자 페이지"
        routes={filteredRoutes}
      />

      <Configurator />
      {configsButton}

      <Routes>
        {routesElement}

        {/* 로그아웃 */}
        <Route path="/logout" element={<Logout />} />

        {/* 기본 리다이렉트 */}
        <Route path="*" element={<Navigate to={session ? "/case" : "/authentication/sign-in"} />} />
      </Routes>
    </ThemeProvider>
  );
}
