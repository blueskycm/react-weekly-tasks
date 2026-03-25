import { useEffect, useState } from "react";
import axios from "axios";
import { NavLink, useLocation } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Navbar() {
  const [cartCount, setCartCount] = useState(0);
  const location = useLocation();

  const routes = [
    { path: "/final", name: "商場首頁" },
    { path: "/final/products", name: "產品列表" },
    { path: "/final/cart", name: "購物車" },
    { path: "/final/exchange", name: "匯率計算機" },
  ];

  useEffect(() => {
    const getCartCount = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/${API_PATH}/cart`);
        setCartCount(res.data.data.carts.length);
      } catch (error) {
        console.error("取得購物車失敗", error);
      }
    };

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
                  end={route.path === "/final"}
                >
                  {route.name}

                  {route.path === "/final/cart" && (
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