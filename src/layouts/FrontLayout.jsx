import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function FrontLayout() {
  return (
    // 1. 使用 Flexbox 讓 Footer 能夠在內容少時保持在底部 (Sticky Footer)
    <div className="d-flex flex-column min-vh-100">

      {/* 2. 放入導覽列元件 */}
      <Navbar />

      {/* 3. 內容區域：flex-grow-1 會自動填滿剩餘高度 */}
      <div className="container mt-4 flex-grow-1">
        <Outlet />
      </div>

      {/* 4. 放入頁尾元件 */}
      <Footer />
    </div>
  );
}