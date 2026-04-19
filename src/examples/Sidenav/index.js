import { useEffect } from "react";
import { useLocation, NavLink } from "react-router-dom";
import PropTypes from "prop-types";

import List from "@mui/material/List";
import Divider from "@mui/material/Divider";
import Icon from "@mui/material/Icon";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDButton from "components/MDButton";

import SidenavCollapse from "examples/Sidenav/SidenavCollapse";
import SidenavRoot from "examples/Sidenav/SidenavRoot";
import sidenavLogoLabel from "examples/Sidenav/styles/sidenav";

import {
  useMaterialUIController,
  setMiniSidenav,
  setTransparentSidenav,
  setWhiteSidenav,
} from "context";

function Sidenav({ brand, brandName, routes, ...rest }) {
  const [controller, dispatch] = useMaterialUIController();
  const location = useLocation();

  const { miniSidenav, transparentSidenav, whiteSidenav, darkMode, sidenavColor } = controller;
  const currentPath = location.pathname;

  let textColor = "white";
  if (transparentSidenav || (whiteSidenav && !darkMode)) textColor = "dark";
  else if (whiteSidenav && darkMode) textColor = "inherit";

  // ✅ Configurator 동작에 필요한 resize 로직
  useEffect(() => {
    function handleMiniSidenav() {
      setMiniSidenav(dispatch, window.innerWidth < 1200);
      setTransparentSidenav(dispatch, window.innerWidth < 1200 ? false : transparentSidenav);
      setWhiteSidenav(dispatch, window.innerWidth < 1200 ? false : whiteSidenav);
    }

    window.addEventListener("resize", handleMiniSidenav);
    handleMiniSidenav();

    return () => window.removeEventListener("resize", handleMiniSidenav);
  }, [dispatch, transparentSidenav, whiteSidenav]);

  const closeSidenav = () => setMiniSidenav(dispatch, true);

  // routes 렌더
  const renderRoutes = routes.map(({ type, name, icon, key, route }) => {
    if (type === "collapse") {
      return (
        <NavLink key={key} to={route} style={{ textDecoration: "none" }}>
          <SidenavCollapse name={name} icon={icon} active={currentPath === route} />
        </NavLink>
      );
    }

    if (type === "divider") return <Divider key={key} />;

    return null;
  });

  return (
    <SidenavRoot
      {...rest}
      variant="permanent"
      ownerState={{
        miniSidenav,
        transparentSidenav,
        whiteSidenav,
        darkMode,
      }}
    >
      {/* 모바일 닫기 버튼 */}
      <MDBox
        display={{ xs: "block", xl: "none" }}
        position="absolute"
        top={0}
        right={0}
        p={1.5}
        onClick={closeSidenav}
        sx={{ cursor: "pointer" }}
      >
        <Icon>close</Icon>
      </MDBox>

      {/* 로고 */}
      <MDBox pt={3} pb={1} px={3} textAlign="center">
        <MDBox component={NavLink} to="/" display="flex" justifyContent="center">
          {brand && <img src={brand} alt="logo" style={{ width: 32 }} />}
          <MDTypography variant="h6" color={textColor}>
            {brandName}
          </MDTypography>
        </MDBox>
      </MDBox>

      <Divider />

      <List>{renderRoutes}</List>

      {/* 하단 버튼 */}
      <MDBox p={2} mt="auto">
        <MDButton
          component="a"
          href="https://law-hankyul.com"
          target="_blank"
          rel="noreferrer"
          variant="gradient"
          color={sidenavColor}
          fullWidth
        >
          공동법률사무소 한결 홈페이지
        </MDButton>
      </MDBox>
    </SidenavRoot>
  );
}

Sidenav.propTypes = {
  brand: PropTypes.string,
  brandName: PropTypes.string.isRequired,
  routes: PropTypes.array.isRequired,
};

export default Sidenav;
