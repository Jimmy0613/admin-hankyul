import PropTypes from "prop-types";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";

export default function PageHeader({ title, darkMode, actions = null }) {
  return (
    <MDBox
      px={3}
      mb={3}
      display="flex"
      justifyContent="space-between"
      alignItems={{ xs: "flex-start", md: "center" }}
      flexDirection={{ xs: "column", md: "row" }}
      gap={2}
    >
      <MDTypography variant="h5" color={darkMode ? "white" : "dark"}>
        {title}
      </MDTypography>
      {actions}
    </MDBox>
  );
}

PageHeader.propTypes = {
  title: PropTypes.string.isRequired,
  darkMode: PropTypes.bool,
  actions: PropTypes.node,
};
