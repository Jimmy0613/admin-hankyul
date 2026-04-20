import PropTypes from "prop-types";

import MDButton from "components/MDButton";
import { useCopyForBlog } from "../hooks/useCopyForBlog";

export default function CopyForBlogButton({ html }) {
  const { copy } = useCopyForBlog();

  const handleClick = async () => {
    try {
      await copy(html);
      alert("블로그 작성용 HTML 본문을 복사했습니다.");
    } catch (error) {
      console.error(error);
      alert("HTML 본문 복사에 실패했습니다.");
    }
  };

  return (
    <MDButton color="info" variant="outlined" onClick={handleClick}>
      본문 복사
    </MDButton>
  );
}

CopyForBlogButton.propTypes = {
  html: PropTypes.string,
};
