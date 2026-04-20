import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import { useNavigate } from "react-router-dom";

import MDBox from "components/MDBox";
import MDButton from "components/MDButton";
import DataTable from "examples/Tables/DataTable";
import DashboardLayout from "examples/LayoutContainers/DashboardLayout";
import DashboardNavbar from "examples/Navbars/DashboardNavbar";
import { useMaterialUIController } from "context";
import PageHeader from "shared/ui/PageHeader";
import { useColumnPostList } from "../hooks/useColumnPostList";

export default function ColumnPostListPage() {
  const [controller] = useMaterialUIController();
  const { darkMode } = controller;
  const navigate = useNavigate();
  const { tableData } = useColumnPostList(navigate);

  return (
    <DashboardLayout>
      <DashboardNavbar />
      <PageHeader
        title="칼럼"
        darkMode={darkMode}
        actions={
          <MDButton color="info" onClick={() => navigate("/column-posts/new")}>
            칼럼 작성
          </MDButton>
        }
      />

      <MDBox pb={3}>
        <Grid container spacing={6}>
          <Grid item xs={12}>
            <Card>
              <MDBox pt={3}>
                <DataTable table={tableData} isSorted entriesPerPage showTotalEntries />
              </MDBox>
            </Card>
          </Grid>
        </Grid>
      </MDBox>
    </DashboardLayout>
  );
}
