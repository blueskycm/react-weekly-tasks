import { NavLink } from "react-router-dom";

export default function Navbar() {
  const routes = [
    { path: "/week5", name: "商場首頁" },
    { path: "/week5/products", name: "產品列表" },
    { path: "/week5/cart", name: "購物車" },
  ];

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
      <div className="container">
        <span className="navbar-brand">阿葆的POE2 商場</span>
        <div className="collapse navbar-collapse">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {routes.map((route) => (
              <li className="nav-item" key={route.path}>
                <NavLink
                  className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                  to={route.path}
                  end={route.path === "/week5"}
                >
                  {route.name}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </nav>
  );
}