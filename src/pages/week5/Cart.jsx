import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CurrencyDisplay from "../../components/CurrencyDisplay";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Cart() {
  const [cart, setCart] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 標題格式化 helper
  const formatTitle = (title) => title ? title.replace(/\\n/g, '\n') : "";

  // 取得購物車列表
  const getCart = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/${API_PATH}/cart`);
      setCart(res.data.data);
    } catch (error) {
      alert("取得購物車列表失敗");
    } finally {
      setIsLoading(false);
    }
  };

  // 刪除單一項目
  const removeCartItem = async (cartId) => {
    setIsLoading(true); // 刪除時開啟 loading 避免重複點擊
    try {
      await axios.delete(`${BASE_URL}/api/${API_PATH}/cart/${cartId}`);
      getCart(); // 重新取得列表
    } catch (error) {
      alert("刪除失敗");
      setIsLoading(false);
    }
  };

  // 更新數量
  const updateCartItem = async (cartId, productId, qty) => {
    setIsLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/${API_PATH}/cart/${cartId}`, {
        data: {
          product_id: productId,
          qty: Number(qty)
        }
      });
      getCart();
    } catch (error) {
      alert("更新數量失敗");
      setIsLoading(false);
    }
  };

  // 清空購物車
  const removeAllCart = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/${API_PATH}/carts`);
      getCart();
    } catch (error) {
      alert("清空購物車失敗");
      setIsLoading(false);
    }
  }

  useEffect(() => {
    getCart();
  }, []);

  return (
    <div className="container py-5">
      <h2 className="text-center mb-4">您的戰利品</h2>

      {isLoading ? (
        <div className="d-flex justify-content-center" style={{ minHeight: '200px' }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : cart.carts?.length > 0 ? (
        <div>
          {/* 操作列 */}
          <div className="text-end mb-3">
            <button
              className="btn btn-outline-danger btn-sm"
              onClick={removeAllCart}
              disabled={isLoading}
            >
              <i className="bi bi-trash me-1"></i>
              清空購物車
            </button>
          </div>

          {/* 購物車列表 (適應深色模式) */}
          <div className="card shadow-sm border-secondary mb-4">
            <div className="table-responsive">
              <table className="table align-middle table-hover mb-0" style={{ minWidth: '600px' }}>
                <thead className="table-light">
                  <tr>
                    <th className="ps-4">物品名稱</th>
                    <th style={{ width: "120px" }}>數量</th>
                    <th className="text-end">單價</th>
                    <th className="text-end">小計</th>
                    <th style={{ width: "80px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {cart.carts.map((item) => (
                    <tr key={item.id}>
                      <td className="ps-4">
                        <div className="d-flex align-items-center">
                          <img
                            src={item.product.imageUrl}
                            alt={item.product.title}
                            style={{ width: "60px", height: "60px", objectFit: "contain" }}
                            className="rounded me-3 d-none d-sm-block bg-dark"
                          />
                          <div className="d-flex flex-column">
                            {/* 使用 formatTitle 處理換行 */}
                            <span className="fw-bold" style={{ whiteSpace: 'pre-line', fontSize: '0.95rem' }}>
                              {formatTitle(item.product.title.split('\\n')[0])} {/* 只顯示第一行標題 */}
                            </span>
                            <span className="text-muted small" style={{ fontSize: '0.8rem' }}>
                              {item.product.category}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="input-group input-group-sm">
                          <select
                            className="form-select"
                            value={item.qty}
                            onChange={(e) => updateCartItem(item.id, item.product_id, e.target.value)}
                            disabled={isLoading}
                          >
                            {[...Array(20)].map((_, i) => (
                              <option value={i + 1} key={i}>{i + 1}</option>
                            ))}
                          </select>
                        </div>
                      </td>
                      <td className="text-end">
                        {/* 單價顯示 */}
                        <CurrencyDisplay price={item.product.price} unit={item.product.unit} />
                      </td>
                      <td className="text-end fw-bold">
                        {/* 小計顯示 (假設單位同單價) */}
                        <CurrencyDisplay price={item.final_total} unit={item.product.unit} />
                      </td>
                      <td className="text-end pe-4">
                        <button
                          type="button"
                          className="btn btn-sm text-danger border-0"
                          onClick={() => removeCartItem(item.id)}
                          disabled={isLoading}
                        >
                          <i className="bi bi-x-lg"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="border-top">
                  <tr>
                    <td colSpan="3" className="text-end border-0 pt-3">總計</td>
                    <td className="text-end border-0 pt-3 fw-bold fs-4">
                      {/* 總計因為是混合單位，直接顯示數字(之後改) */}
                      {cart.final_total}
                      <span className="fs-6 text-muted ms-2">Values</span>
                    </td>
                    <td className="border-0"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* 底部按鈕區 */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <Link to="/week5/products" className="btn btn-outline-secondary">
              <i className="bi bi-arrow-left me-2"></i>
              繼續逛逛
            </Link>
            <button className="btn btn-primary px-5 py-2 disabled">
              前往結帳
            </button>
          </div>
        </div>
      ) : (
        <div className="text-center py-5 rounded border border-secondary border-dashed">
          <h4 className="text-muted mb-3">您的置物箱是空的</h4>
          <p className="text-secondary mb-4">去市集看看有沒有需要的裝備吧！</p>
          <Link to="/week5/products" className="btn btn-primary">
            前往市集
          </Link>
        </div>
      )}
    </div>
  );
}