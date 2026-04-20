import Icon from "@mui/material/Icon";

import SignIn from "layouts/authentication/sign-in";
import ColumnPostListPage from "features/column-posts/pages/ColumnPostListPage";
import ColumnPostDetailPage from "features/column-posts/pages/ColumnPostDetailPage";
import ColumnPostFormPage from "features/column-posts/pages/ColumnPostFormPage";
import ColumnCategoryListPage from "features/column-categories/pages/ColumnCategoryListPage";
import ColumnCategoryFormPage from "features/column-categories/pages/ColumnCategoryFormPage";

const routes = [
  {
    type: "collapse",
    name: "칼럼",
    key: "column-posts",
    icon: <Icon fontSize="small">article</Icon>,
    route: "/column-posts",
    component: <ColumnPostListPage />,
  },
  {
    name: "칼럼 상세",
    key: "column-post-detail",
    route: "/column-posts/:id",
    component: <ColumnPostDetailPage />,
  },
  {
    name: "칼럼 작성",
    key: "column-post-create",
    route: "/column-posts/new",
    component: <ColumnPostFormPage />,
  },
  {
    name: "칼럼 수정",
    key: "column-post-edit",
    route: "/column-posts/:id/edit",
    component: <ColumnPostFormPage />,
  },
  {
    type: "collapse",
    name: "칼럼 카테고리",
    key: "column-categories",
    icon: <Icon fontSize="small">category</Icon>,
    route: "/column-categories",
    component: <ColumnCategoryListPage />,
  },
  {
    name: "카테고리 등록",
    key: "column-category-create",
    route: "/column-categories/new",
    component: <ColumnCategoryFormPage />,
  },
  {
    name: "카테고리 수정",
    key: "column-category-edit",
    route: "/column-categories/:id/edit",
    component: <ColumnCategoryFormPage />,
  },
  {
    type: "collapse",
    name: "로그인",
    key: "sign-in",
    icon: <Icon fontSize="small">login</Icon>,
    route: "/authentication/sign-in",
    component: <SignIn />,
  },
];

export default routes;
