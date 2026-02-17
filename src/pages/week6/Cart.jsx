import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CurrencyDisplay from "../../components/CurrencyDisplay";
import LoadingOverlay from "../../components/LoadingOverlay";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const SHOP_PATH = import.meta.env.VITE_API_PATH;
const EXCHANGE_PATH = import.meta.env.VITE_EXCHANGE_API;

export default function Cart() {
  const [cart, setCart] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  // 下拉選單開關
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // 匯率設定狀態
  const [exchangeRates, setExchangeRates] = useState({
    "崇高石": 1, // 基準單位
    "神聖石": 0,
    "混沌石": 0,
    "新台幣": 0,
  });

  const [targetCurrency, setTargetCurrency] = useState("新台幣");

  // 選項設定
  const currencyOptions = [
    { value: "新台幣", label: "新台幣 (NTD)", type: "flag", icon: "🇹🇼" },
    { value: "神聖石", label: "神聖石 (Divine Orb)", type: "game" },
    { value: "混沌石", label: "混沌石 (Chaos Orb)", type: "game" },
    { value: "崇高石", label: "崇高石 (Exalted Orb)", type: "game" },
  ];

  // 取得購物車 (使用 SHOP_PATH)
  const getCart = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/${SHOP_PATH}/cart`);
      setCart(res.data.data);
    } catch (error) {
      console.error("取得購物車失敗", error);
    }
  };

  // 取得匯率 (使用 EXCHANGE_PATH)
  const getRates = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/api/${EXCHANGE_PATH}/products/all`);
      const products = res.data.products;

      let newRates = {
        "崇高石": 1,
        "神聖石": 900,
        "混沌石": 5,
        "新台幣": 5
      };

      const divine = products.find(p => p.title === "神聖石");
      const chaos = products.find(p => p.title === "混沌石");
      const ntd = products.find(p => p.title === "新台幣");

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

  // 刪除單一項目
  const removeCartItem = async (cartId) => {
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/${SHOP_PATH}/cart/${cartId}`);
      await getCart();
    } catch (error) {
      alert("刪除失敗");
    } finally {
      setIsLoading(false);
    }
  };

  // 更新數量
  const updateCartItem = async (cartId, productId, qty) => {
    setIsLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/${SHOP_PATH}/cart/${cartId}`, {
        data: { product_id: productId, qty: Number(qty) }
      });
      await getCart();
    } catch (error) {
      alert("更新數量失敗");
    } finally {
      setIsLoading(false);
    }
  };

  // 清空購物車
  const removeAllCart = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/${SHOP_PATH}/carts`);
      await getCart();
    } catch (error) {
      alert("清空購物車失敗");
    } finally {
      setIsLoading(false);
    }
  };

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

      {/* 點擊空白處關閉選單的遮罩 */}
      {isDropdownOpen && (
        <div
          style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, zIndex: 990 }}
          onClick={() => setIsDropdownOpen(false)}
        ></div>
      )}

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
              <Link to="/week6/products" className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left me-2"></i> 繼續逛逛
              </Link>
            </div>
          </div>

          {/* 右側：匯率總計看板 */}
          <div className="col-lg-4">
            <div className="card border-0 shadow-lg bg-dark text-white border border-secondary position-sticky" style={{ top: '20px', zIndex: 1000 }}>
              <div className="card-header bg-primary text-white text-center py-3">
                <h5 className="mb-0"><i className="bi bi-calculator me-2"></i>訂單結算</h5>
              </div>

              <div className="card-body p-4">
                {/* 匯率資訊 */}
                <div className="alert alert-dark border-secondary mb-4">
                  <small className="d-block text-muted mb-2">當前市集匯率 (API: {EXCHANGE_PATH})：</small>
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

                {/* 有圖示的下拉選單 */}
                <div className="mb-3 position-relative">
                  <label className="form-label text-muted">選擇支付貨幣</label>

                  <button
                    type="button"
                    className="btn d-flex justify-content-between align-items-center w-100 bg-dark text-white border-secondary"
                    style={{
                      textAlign: 'left',
                      height: '35px',
                      paddingLeft: '12px',
                      paddingRight: '12px'
                    }}
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  >
                    <div className="d-flex align-items-center overflow-hidden">
                      {/* 圖示區 */}
                      <span className="me-2 d-flex align-items-center" style={{ width: '24px', justifyContent: 'center', lineHeight: 0 }}>
                        {targetCurrency === "新台幣" ? (
                          <span style={{ fontSize: '1.2rem' }}>🇹🇼</span>
                        ) : (
                          // 用 div 包裹並強制隱藏多餘文字
                          <div style={{ width: '24px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                            <CurrencyDisplay price={0} unit={targetCurrency} style={{ fontSize: '0px' }} />
                          </div>
                        )}
                      </span>

                      {/* 文字區 */}
                      <span className="text-truncate">
                        {currencyOptions.find(c => c.value === targetCurrency)?.label || targetCurrency}
                      </span>
                    </div>

                    <i className={`bi bi-chevron-down small text-muted transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}></i>
                  </button>

                  {isDropdownOpen && (
                    <div className="card position-absolute w-100 shadow-lg border-secondary mt-1 bg-dark" style={{ zIndex: 1050 }}>
                      <ul className="list-group list-group-flush">
                        {currencyOptions.map((option) => (
                          <li key={option.value} className="list-group-item bg-dark border-secondary p-0">
                            <button
                              type="button"
                              className="btn w-100 text-start text-white d-flex align-items-center px-3 py-2"
                              onMouseEnter={(e) => e.currentTarget.classList.add('bg-secondary')}
                              onMouseLeave={(e) => e.currentTarget.classList.remove('bg-secondary')}
                              onClick={() => {
                                setTargetCurrency(option.value);
                                setIsDropdownOpen(false);
                              }}
                            >
                              <span className="me-2 d-flex align-items-center" style={{ width: '24px', justifyContent: 'center' }}>
                                {option.type === 'flag' ? (
                                  <span style={{ fontSize: '1.2rem' }}>{option.icon}</span>
                                ) : (
                                  <div style={{ width: '24px', overflow: 'hidden', display: 'flex', justifyContent: 'center' }}>
                                    <CurrencyDisplay price={0} unit={option.value} style={{ fontSize: '0px' }} />
                                  </div>
                                )}
                              </span>
                              {option.label}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* 動態交易說明 */}
                <div className="alert alert-secondary border-0 small mt-3">
                  <h6 className="fw-bold mb-2"><i className="bi bi-info-circle me-1"></i>交易須知：</h6>
                  {targetCurrency === "新台幣" ? (
                    // 顯示銀行匯款資訊
                    <div className="lh-sm">
                      <p className="mb-1"><strong>銀行匯款</strong></p>
                      <p className="mb-1">銀行名稱：玉山銀行 (東台南分行)</p>
                      <p className="mb-1">帳號：0761-976-056514</p>
                      <p className="mb-2">戶名：陳宗葆</p>
                      <hr className="my-1 border-secondary" />
                      <p className="mb-1 text-danger">※ 匯款完成後，請將匯款帳號末五碼回報，以便我們對帳確認。</p>
                      <p className="mb-0">請加我好友：<span className="text-primary">blueskycm#0594</span>，到我的藏身處交易</p>
                    </div>
                  ) : (
                    // 顯示一般遊戲交易資訊
                    <div className="lh-sm">
                      <p className="mb-0">請加我好友：<strong className="text-primary">blueskycm#0594</strong>，到我的藏身處交易</p>
                    </div>
                  )}
                </div>

                <hr className="border-secondary" />

                {/* 總計顯示 */}
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <span className="h5 mb-0">總計：</span>
                  <div className="text-end">
                    {targetCurrency === "新台幣" ? (
                      // 台幣：純文字
                      <span className="h2 fw-bold text-success d-block mb-0">
                        NT$ {cartTotalValue.raw}
                        {cartTotalValue.raw !== cartTotalValue.ceil && (
                          <span className="text-white fs-5 ms-2 opacity-75">
                            ({cartTotalValue.ceil})
                          </span>
                        )}
                      </span>
                    ) : (
                      // 遊戲幣：使用 CurrencyDisplay 顯示圖示
                      <div className="d-flex align-items-center justify-content-end">
                        <CurrencyDisplay
                          price={cartTotalValue.raw}
                          unit={targetCurrency}
                          style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
                        />
                        {/* 如果有進位，顯示在旁邊 */}
                        {cartTotalValue.raw !== cartTotalValue.ceil && (
                          <span className="text-white fs-5 ms-2 opacity-75">
                            ({cartTotalValue.ceil})
                          </span>
                        )}
                      </div>
                    )}

                    <small className="text-muted">
                      {targetCurrency}
                      {cartTotalValue.raw !== cartTotalValue.ceil && " (實收)"}
                    </small>
                  </div>
                </div>

                <Link
                  to="/week6/checkout"
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
            <Link to="/week6/products" className="btn btn-primary">前往市集</Link>
          </div>
        )
      )}
    </div>
  );
}