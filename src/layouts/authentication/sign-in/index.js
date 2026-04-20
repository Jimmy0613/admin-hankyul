import { useState } from "react";
import { useNavigate } from "react-router-dom";

import Card from "@mui/material/Card";
import Switch from "@mui/material/Switch";

import MDBox from "components/MDBox";
import MDTypography from "components/MDTypography";
import MDInput from "components/MDInput";
import MDButton from "components/MDButton";

import BasicLayout from "layouts/authentication/components/BasicLayout";
import bgImage from "assets/images/bg-sign-in-basic.jpeg";

import { supabase } from "../../../api/supabase";

function Basic() {
  const [rememberMe, setRememberMe] = useState(localStorage.getItem("EMAIL"));
  const [email, setEmail] = useState(localStorage.getItem("EMAIL") ?? "");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSetRememberMe = () => setRememberMe(!rememberMe);

  const handleLogin = async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert("로그인에 실패했습니다: " + error.message);
      return;
    }

    if (rememberMe) {
      localStorage.setItem("EMAIL", email);
    } else {
      localStorage.removeItem("EMAIL");
    }

    alert("로그인되었습니다.");
    navigate("/");
  };

  return (
    <BasicLayout image={bgImage}>
      <Card>
        <MDBox
          variant="gradient"
          bgColor="dark"
          borderRadius="lg"
          coloredShadow="dark"
          mx={2}
          mt={-3}
          p={2}
          mb={1}
          textAlign="center"
        >
          <MDTypography variant="h4" fontWeight="medium" color="white" mt={1}>
            관리자 로그인
          </MDTypography>
        </MDBox>

        <MDBox pt={4} pb={3} px={3}>
          <MDBox component="form" role="form">
            <MDBox mb={2}>
              <MDInput
                type="email"
                label="이메일"
                fullWidth
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </MDBox>

            <MDBox mb={2}>
              <MDInput
                type="password"
                label="비밀번호"
                fullWidth
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
            </MDBox>

            <MDBox display="flex" alignItems="center" ml={-1}>
              <Switch checked={rememberMe} onChange={handleSetRememberMe} />
              <MDTypography
                variant="button"
                color="text"
                onClick={handleSetRememberMe}
                sx={{ cursor: "pointer", ml: 1 }}
              >
                이메일 기억하기
              </MDTypography>
            </MDBox>

            <MDBox mt={4} mb={1}>
              <MDButton variant="gradient" color="dark" fullWidth onClick={handleLogin}>
                로그인
              </MDButton>
            </MDBox>
          </MDBox>
        </MDBox>
      </Card>
    </BasicLayout>
  );
}

export default Basic;
