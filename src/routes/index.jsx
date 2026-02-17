import { createHashRouter } from 'react-router-dom';
import App from '../App';
import FrontLayout from '../layouts/FrontLayout';

// 引入各週頁面
import Home from '../pages/Home'; // 主選單
import Week1 from '../pages/week1/week1';
import Week2 from '../pages/week2/week2';
import Week3 from '../pages/week3/week3';
import Week4 from '../pages/week4/week4';

// Week 5 前台
import ShopHome from '../pages/week5/Home';
import ShopProducts from '../pages/week5/Products';
import ShopProductDetail from '../pages/week5/ProductDetail';
import ShopCart from '../pages/week5/Cart';

// Week 5 後台
import Admin from '../pages/week5/Admin';

// Week 6 商店
import Week6ShopHome from '../pages/week6/Home';
import Week6Products from '../pages/week6/Products';
import Week6ProductDetail from '../pages/week6/ProductDetail';
import Week6Cart from '../pages/week6/Cart';
import Week6Checkout from '../pages/week6/Checkout';

// Week 6 後台
import Week6Admin from '../pages/week6/Admin';
import AdminExchange from '../pages/week6/AdminExchange';
import Exchange from '../pages/week6/Exchange';

// Week 7
import Week7Home from '../pages/week7/Home';
import Week7Products from '../pages/week7/Products';
import Week7ProductDetail from '../pages/week7/ProductDetail';
import Week7Cart from '../pages/week7/Cart';
import Week7Checkout from '../pages/week7/Checkout';
import Week7Admin from '../pages/week7/Admin';
import Week7AdminExchange from '../pages/week7/AdminExchange';

// 404
import NotFound from '../pages/NotFound';

const EXCHANGE_PATH = import.meta.env.VITE_EXCHANGE_API || 'exchange';
const router = createHashRouter([
  {
    path: '/',
    element: <App />, // App.jsx 只需包含 <Outlet />
    children: [
      {
        index: true,
        element: <Home />, // 顯示週數選單
      },
      { path: 'week1', element: <Week1 /> },
      { path: 'week2', element: <Week2 /> },
      { path: 'week3', element: <Week3 /> },
      { path: 'week4', element: <Week4 /> },

      // === Week 5 前台 (巢狀路由) ===
      {
        path: 'week5',
        element: <FrontLayout />, // 使用前台專用 Layout (含 Navbar/Footer)
        children: [
          { index: true, element: <ShopHome /> }, // 商場首頁
          { path: 'products', element: <ShopProducts /> }, // 產品列表
          { path: 'products/:id', element: <ShopProductDetail /> }, // 產品細節
          { path: 'cart', element: <ShopCart /> }, // 購物車

          //後台
          { path: 'admin', element: <Admin /> },
        ]
      },
      // === Week 6 路由 ===
      {
        path: 'week6',
        element: <FrontLayout />, // 或是你有專用的 AdminLayout
        children: [
          { path: EXCHANGE_PATH, element: <Exchange /> },
          // 後台路由
          { path: 'admin', element: <Week6Admin /> },
          { path: 'admin/exchange', element: <AdminExchange /> },
          // 商店頁面
          { index: true, element: <Week6ShopHome /> },
          { path: 'products', element: <Week6Products /> },
          { path: 'products/:id', element: <Week6ProductDetail /> },
          { path: 'cart', element: <Week6Cart /> },
          { path: 'checkout', element: <Week6Checkout /> },
        ]
      },
      // === Week 7 ===
      {
        path: 'week7',
        element: <FrontLayout />,
        children: [
          // 前台頁面
          { index: true, element: <Week7Home /> },
          { path: 'products', element: <Week7Products /> },
          { path: 'products/:id', element: <Week7ProductDetail /> },
          { path: 'cart', element: <Week7Cart /> },
          { path: 'checkout', element: <Week7Checkout /> },

          // 後台頁面
          { path: 'admin', element: <Week7Admin /> },
          { path: 'admin/exchange', element: <Week7AdminExchange /> },
        ],
      },

      // 404 頁面 (永遠放在最後)
      { path: '*', element: <NotFound /> },
    ]
  }
]);

export default router;