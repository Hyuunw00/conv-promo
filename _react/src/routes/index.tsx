import { useRoutes } from "react-router-dom";
import Home from "@/pages/Home";

export default function AppRoutes() {
  return useRoutes([
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/nearby",
      element: <div>내 주변 (준비 중)</div>,
    },
    {
      path: "/saved",
      element: <div>저장됨 (준비 중)</div>,
    },
    {
      path: "/mypage",
      element: <div>마이페이지 (준비 중)</div>,
    },
  ]);
}
