import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Navbar() {
  // 新增購物車數量狀態
  const [cartCount, setCartCount] = useState(0);

  // 使用 useLocation 來監聽目前的頁面路徑
  const location = useLocation();

  const routes = [
    { path: "/week6", name: "商場首頁" },
    { path: "/week6/products", name: "產品列表" },
    { path: "/week6/cart", name: "購物車" },
    { path: "/week6/exchange", name: "匯率計算機" },
  ];

  // 定義取得購物車數量的函式
  const getCartCount = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/${API_PATH}/cart`);
      // carts.length 代表有多少「種」商品
      setCartCount(res.data.data.carts.length);
    } catch (error) {
      console.error("取得購物車失敗", error);
    }
  };

  // 當網址改變時，重新抓取數量
  useEffect(() => {
    getCartCount();
  }, [location]);

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand">阿葆的POE2 商場</span>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {routes.map((route) => (
              <li className="nav-item" key={route.path}>
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  to={route.path}
                  end={route.path === "/week6"}
                >
                  {route.name}

                  {/* 6. 特別判斷：如果是「購物車」按鈕，後面多加一個括號數字 */}
                  {route.path === "/week6/cart" && (
                    <span className="ms-1">
                      (
                      <span className={cartCount > 0 ? "text-warning fw-bold" : ""}>
                        {cartCount}
                      </span>
                      )
                    </span>
                  )}

                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}