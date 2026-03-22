import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CurrencyDisplay from "../../components/CurrencyDisplay";
import LoadingOverlay from "../../components/LoadingOverlay";

const BASE_URL = import.meta.env.VITE_BASE_URL;
// 賣場路徑 (存取購物車用)
const SHOP_PATH = import.meta.env.VITE_API_PATH;
// 匯率路徑 (存取設定檔用)
const EXCHANGE_PATH = import.meta.env.VITE_EXCHANGE_API;

export default function Cart() {
  const [cart, setCart] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 匯率設定狀態
  const [exchangeRates, setExchangeRates] = useState({
    "崇高石": 1, // 基準單位
    "神聖石": 0,
    "混沌石": 0,
    "新台幣": 0,
  });

  const [targetCurrency, setTargetCurrency] = useState("新台幣");

  // 取得購物車 (使用 SHOP_PATH)
  const getCart = async () => {
    try {
      // 購物車是在 "lovecraft" 路徑下
      const res = await axios.get(`${BASE_URL}/api/${SHOP_PATH}/cart`);
      setCart(res.data.data);
    } catch (error) {
      console.error("取得購物車失敗", error);
    }
  };

  // 取得匯率 (使用 EXCHANGE_PATH)
  const getRates = async () => {
    try {
      // 💱 匯率設定檔是在 "exchange" 路徑下
      // 注意：這裡我們抓的是 exchange 路徑下的「所有產品」，裡面只有神聖石、混沌石、新台幣
      const res = await axios.get(`${BASE_URL}/api/${EXCHANGE_PATH}/products/all`);
      const products = res.data.products;

      let newRates = {
        "崇高石": 1,
        "神聖石": 800,
        "混沌石": 5,
        "新台幣": 5
      };

      // 搜尋設定檔 (這裡不用檢查 category 也可以，因為 exchange 路徑下應該全是設定檔)
      const divine = products.find(p => p.title === "神聖石");
      const chaos = products.find(p => p.title === "混沌石");
      const ntd = products.find(p => p.title === "新台幣"); // 記得後台要建立這個

      if (divine) newRates["神聖石"] = divine.price;
      if (chaos) newRates["混沌石"] = chaos.price;
      if (ntd) newRates["新台幣"] = ntd.price;

      setExchangeRates(newRates);

    } catch (error) {
      console.error("取得匯率失敗，請確認 .env 設定與後台資料", error);
    }
  };

  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await Promise.all([getCart(), getRates()]);
      setIsLoading(false);
    };
    init();
  }, []);

  // 購物車操作 (使用 SHOP_PATH)
  const removeCartItem = async (cartId) => {
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/${SHOP_PATH}/cart/${cartId}`);
      getCart();
    } catch (error) {
      alert("刪除失敗");
      setIsLoading(false);
    }
  };

  const updateCartItem = async (cartId, productId, qty) => {
    setIsLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/${SHOP_PATH}/cart/${cartId}`, {
        data: { product_id: productId, qty: Number(qty) }
      });
      getCart();
    } catch (error) {
      alert("更新數量失敗");
      setIsLoading(false);
    }
  };

  const removeAllCart = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/${SHOP_PATH}/carts`);
      getCart();
    } catch (error) {
      alert("清空購物車失敗");
      setIsLoading(false);
    }
  };

  // 計算邏輯
  const cartTotalValue = useMemo(() => {
    if (!cart.carts || exchangeRates["神聖石"] === 0) return { raw: 0, ceil: 0 };

    const totalBase = cart.carts.reduce((sum, item) => {
      const unit = item.product.unit;
      const price = item.product.price;
      const qty = item.qty;
      const rateToBase = exchangeRates[unit] || 1;
      return sum + (price * qty * rateToBase);
    }, 0);

    let rawVal = 0;

    if (targetCurrency === "新台幣") {
      const divineValue = totalBase / exchangeRates["神聖石"];
      rawVal = divineValue * exchangeRates["新台幣"];
    } else {
      const targetRate = exchangeRates[targetCurrency] || 1;
      rawVal = totalBase / targetRate;
    }

    return {
      raw: parseFloat(rawVal.toFixed(2)),
      ceil: Math.ceil(rawVal)
    };
  }, [cart, exchangeRates, targetCurrency]);


  const formatTitle = (title) => title ? title.replace(/\\n/g, '\n') : "";

  return (
    <div className="container py-5">
      <LoadingOverlay isLoading={isLoading} />

      <h2 className="text-center mb-4">您的戰利品</h2>

      {!isLoading && cart.carts?.length > 0 ? (
        <div className="row">
          {/* 左側：購物車列表 */}
          <div className="col-lg-8 mb-4">
            <div className="text-end mb-2">
              <button className="btn btn-outline-danger btn-sm" onClick={removeAllCart}>
                <i className="bi bi-trash me-1"></i> 清空
              </button>
            </div>

            <div className="card shadow-sm border-secondary">
              <div className="table-responsive">
                <table className="table align-middle table-hover mb-0 bg-dark text-light">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-4">物品</th>
                      <th style={{ width: "100px" }}>數量</th>
                      <th className="text-end">單價</th>
                      <th className="text-end">小計</th>
                      <th></th>
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
                              style={{ width: "50px", height: "50px", objectFit: "contain" }}
                              className="rounded me-3 bg-secondary"
                            />
                            <div>
                              <div className="fw-bold text-truncate" style={{ maxWidth: '150px' }}>
                                {formatTitle(item.product.title.split('\\n')[0])}
                              </div>
                              <small className="text-muted">{item.product.category}</small>
                            </div>
                          </div>
                        </td>
                        <td>
                          <select
                            className="form-select form-select-sm bg-dark text-light border-secondary"
                            value={item.qty}
                            onChange={(e) => updateCartItem(item.id, item.product_id, e.target.value)}
                          >
                            {[...Array(20)].map((_, i) => (
                              <option value={i + 1} key={i}>{i + 1}</option>
                            ))}
                          </select>
                        </td>
                        <td className="text-end">
                          <CurrencyDisplay price={item.product.price} unit={item.product.unit} />
                        </td>
                        <td className="text-end fw-bold">
                          <CurrencyDisplay price={item.total} unit={item.product.unit} />
                        </td>
                        <td className="text-end pe-3">
                          <button className="btn btn-sm text-danger" onClick={() => removeCartItem(item.id)}>
                            <i className="bi bi-x-lg"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-3">
              <Link to="/final/products" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i> 繼續逛逛
              </Link>
            </div>
          </div>

          {/* 右側：匯率總計看板 */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg bg-dark text-white border border-secondary position-sticky" style={{ top: '20px' }}>
              <div className="card-header bg-primary text-white text-center py-3">
                <h5 className="mb-0"><i className="bi bi-calculator me-2"></i>訂單結算</h5>
              </div>

              <div className="card-body p-4">
                <div className="alert alert-dark border-secondary mb-4">
                  <small className="d-block text-muted mb-2">📊 當前市集匯率 (API: {EXCHANGE_PATH})：</small>
                  <div className="d-flex justify-content-between mb-1">
                    <span>1 <span style={{ color: '#e5b847' }}>神聖石</span> =</span>
                    <span className="fw-bold">{exchangeRates["神聖石"]} 崇高石</span>
                  </div>
                  <div className="d-flex justify-content-between mb-1">
                    <span>1 <span style={{ color: '#dcbfa1' }}>混沌石</span> =</span>
                    <span className="fw-bold">{exchangeRates["混沌石"]} 崇高石</span>
                  </div>
                  <div className="d-flex justify-content-between border-top border-secondary pt-1 mt-1">
                    <span>1 <span style={{ color: '#e5b847' }}>神聖石</span> =</span>
                    <span className="fw-bold text-success">NT$ {exchangeRates["新台幣"]}</span>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label text-muted">選擇支付貨幣</label>
                  <select
                    className="form-select bg-dark text-white border-secondary"
                    value={targetCurrency}
                    onChange={(e) => setTargetCurrency(e.target.value)}
                  >
                    <option value="新台幣">🇹🇼 新台幣 (NTD)</option>
                    <option value="神聖石">🌟 神聖石 (Divine Orb)</option>
                    <option value="混沌石">🌑 混沌石 (Chaos Orb)</option>
                    <option value="崇高石">👑 崇高石 (Exalted Orb)</option>
                  </select>
                </div>

                <hr className="border-secondary" />

                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="h5 mb-0">總計：</span>
                  <div className="text-end">
                    <span className="h2 fw-bold text-warning d-block mb-0">
                      {targetCurrency === "新台幣" ? "NT$ " : ""}
                      {cartTotalValue.raw}
                      {cartTotalValue.raw !== cartTotalValue.ceil && (
                        <span className="text-white fs-5 ms-2 opacity-75">
                          ({cartTotalValue.ceil})
                        </span>
                      )}
                    </span>
                    <small className="text-muted">
                      {targetCurrency}
                      {cartTotalValue.raw !== cartTotalValue.ceil && " (實收)"}
                    </small>
                  </div>
                </div>

                {/* 傳遞 State 給 Checkout */}
                <Link
                  to="/final/checkout"
                  state={{
                    totalPrice: cartTotalValue.ceil,
                    currency: targetCurrency,
                    rawPrice: cartTotalValue.raw
                  }}
                  className="btn btn-primary w-100 py-3 fw-bold fs-5 shadow"
                >
                  前往結帳 <i className="bi bi-arrow-right ms-2"></i>
                </Link>

                <div className="text-center mt-3">
                  <small className="text-muted">* 括號內為無條件進位後之實際交易金額</small>
                </div>

              </div>
            </div>
          </div>

        </div>
      ) : (
        !isLoading && (
          <div className="text-center py-5 rounded border border-secondary border-dashed">
            <h4 className="text-muted mb-3">您的置物箱是空的</h4>
            <Link to="/final/products" className="btn btn-primary">前往市集</Link>
          </div>
        )
      )}
    </div>
  );
}