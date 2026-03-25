import { createHashRouter } from 'react-router-dom';
import App from '../App';
import FrontLayout from '../layouts/FrontLayout';

// 引入主選單首頁
import Home from '../pages/Home';

import FinalHome from '../pages/final/Home';
import FinalProducts from '../pages/final/Products';
import FinalProductDetail from '../pages/final/ProductDetail';
import FinalCart from '../pages/final/Cart';
import FinalCheckout from '../pages/final/Checkout';
import FinalExchange from '../pages/final/Exchange';
import FinalAdmin from '../pages/final/Admin';
import FinalAdminExchange from '../pages/final/AdminExchange';

// 404
import NotFound from '../pages/NotFound';

const router = createHashRouter([
  {
    path: '/',
    element: <App />,
    children: [
      {
        index: true,
        element: <Home />, // 顯示最外層的進入選單
      },
      // === final 路由 ===
      {
        path: 'final',
        element: <FrontLayout />,
        children: [
          // 前台頁面
          { index: true, element: <FinalHome /> },
          { path: 'products', element: <FinalProducts /> },
          { path: 'products/:id', element: <FinalProductDetail /> },
          { path: 'cart', element: <FinalCart /> },
          { path: 'checkout', element: <FinalCheckout /> },
          { path: 'exchange', element: <FinalExchange /> },

          // 後台頁面
          { path: 'admin', element: <FinalAdmin /> },
          { path: 'admin/exchange', element: <FinalAdminExchange /> },
        ],
      },
      // 404 頁面 (永遠放在最後)
      { path: '*', element: <NotFound /> },
    ]
  }
]);

export default router;