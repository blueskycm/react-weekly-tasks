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

          // 如果想把後台放在這裡也可以，或者拉出去獨立
          { path: 'admin', element: <Admin /> },
        ]
      },
    ]
  }
]);

export default router;