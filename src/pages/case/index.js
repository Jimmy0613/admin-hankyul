import { useEffect, useState } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";

import caseData from "./data/caseData";
import { useMaterialUIController } from "../../context";
import { useNavigate } from "react-router-dom";
import MDButton from "../../components/MDButton";

function Case() {
  const [tableData, setTableData] = useState({ columns: [], rows: [] });
  const [controller, dispatch] = useMaterialUIController();
  const { sidenavColor, darkMode } = controller;
  const navigate = useNavigate();

  useEffect(() => {
    const fetch = async () => {
      const result = await caseData(navigate);
      setTableData(result);
    };
    fetch();
  }, []);

  return (
    <DashboardLayout>
      <DashboardNavbar />

      <MDBox px={3}>
        <MDTypography variant="h5" color={darkMode ? "white" : "dark"}>
          업무사례
        </MDTypography>
      </MDBox>

      <MDBox pt={3} pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3}>
                <DataTable table={tableData} isSorted entriesPerPage showTotalEntries />
              </MDBox>
            </Card>
            <MDBox mt={2} display="flex" justifyContent="space-between" alignItems="center">
              <MDButton
                onClick={() => {
                  navigate("/case/write/");
                }}
                color="info"
              >
                작성
              </MDButton>
            </MDBox>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}

export default Case;
