import { useEffect, useState } from "react";
import axios from "axios";
import CurrencyDisplay from "../../components/CurrencyDisplay";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_EXCHANGE_API;

export default function Exchange() {
  const [amount, setAmount] = useState(1);
  const [isCtoD, setIsCtoD] = useState(true);

  // 匯率狀態
  const [exchangeRate, setExchangeRate] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // 1. 新增：用來記錄後台設定的「原始價格」 (崇高石單位)
  const [divinePrice, setDivinePrice] = useState(0);
  const [chaosPrice, setChaosPrice] = useState(0);

  useEffect(() => {
    const getRates = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/${API_PATH}/products/all`);
        const products = res.data.products;

        const divineProduct = products.find(p => p.title === "神聖石");
        const chaosProduct = products.find(p => p.title === "混沌石");

        if (divineProduct && chaosProduct) {
          // 計算匯率
          const rate = divineProduct.price / chaosProduct.price;
          setExchangeRate(rate);

          // 2. 更新：把抓到的價格存起來
          setDivinePrice(divineProduct.price);
          setChaosPrice(chaosProduct.price);
        } else {
          console.warn("找不到 '神聖石' 或 '混沌石' 的商品資料");
          setExchangeRate(0);
        }

      } catch (error) {
        console.error("取得匯率失敗", error);
      } finally {
        setIsLoading(false);
      }
    };

    getRates();
  }, []);

  const calculateResult = () => {
    if (!amount || !exchangeRate) return 0;
    if (isCtoD) {
      return (amount / exchangeRate).toFixed(2);
    } else {
      return Math.floor(amount * exchangeRate);
    }
  };

  const handleSwap = () => {
    setIsCtoD(!isCtoD);
    setAmount(1);
  };

  const sourceUnit = isCtoD ? "混沌石" : "神聖石";
  const targetUnit = isCtoD ? "神聖石" : "混沌石";

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-6">

          <h2 className="text-center mb-4">
            <i className="bi bi-arrow-left-right me-2"></i>
            通貨交易所
          </h2>

          <div className="card shadow border-secondary">
            <div className="card-header bg-transparent border-secondary text-center">
              <span className="text-muted">目前市集匯率</span>
              <div className="fw-bold mt-1 fs-5">
                {isLoading ? (
                  <span className="spinner-border spinner-border-sm text-secondary"></span>
                ) : exchangeRate > 0 ? (
                  <>
                    1 <span style={{ color: '#e5b847' }}>神聖石</span> ≈ {exchangeRate} <span style={{ color: '#dcbfa1' }}>混沌石</span>
                  </>
                ) : (
                  <span className="text-danger small">無法取得匯率資料 (請確認後台商品)</span>
                )}
              </div>
            </div>

            <div className="card-body p-4">
              {/* 輸入區塊 (維持不變) */}
              <div className="mb-4">
                <label className="form-label text-muted">您預計支付 (Pay)</label>
                <div className="input-group input-group-lg">
                  <input
                    type="number"
                    className="form-control bg-dark text-white border-secondary"
                    value={amount}
                    onChange={(e) => setAmount(Math.max(0, e.target.value))}
                    min="0"
                    disabled={isLoading || exchangeRate === 0}
                  />
                  <span className="input-group-text bg-secondary text-white border-secondary" style={{ minWidth: '100px' }}>
                    {sourceUnit}
                  </span>
                </div>
              </div>

              {/* 切換按鈕 (維持不變) */}
              <div className="text-center mb-4 position-relative">
                <hr className="border-secondary" />
                <button
                  className="btn btn-outline-primary position-absolute top-50 start-50 translate-middle rounded-circle"
                  style={{ width: '40px', height: '40px', padding: 0 }}
                  onClick={handleSwap}
                  disabled={isLoading || exchangeRate === 0}
                >
                  <i className="bi bi-arrow-down-up"></i>
                </button>
              </div>

              {/* 結果區塊 (維持不變) */}
              <div className="mb-4">
                <label className="form-label text-muted">您將獲得 (Get)</label>
                <div className="p-3 rounded border border-secondary bg-dark d-flex justify-content-between align-items-center">
                  <span className="fs-3 fw-bold text-white">
                    {calculateResult()}
                  </span>

                  <div className="d-flex align-items-center">
                    <CurrencyDisplay price={0} unit={targetUnit} style={{ fontSize: '0px' }} />
                    <span className="ms-2 fs-5 text-white">{targetUnit}</span>
                  </div>
                </div>
              </div>

              <button className="btn btn-primary w-100 py-2 disabled">
                <i className="bi bi-check2-circle me-2"></i>
                確認交易 (功能開發中)
              </button>

            </div>
          </div>

          {/* 3. 修改：動態顯示後台設定的價格基準 */}
          <div className="text-center mt-3 text-muted small">
            {isLoading ? (
              <span>載入匯率資訊中...</span>
            ) : (
              <span>
                * 匯率基準：1 神聖石 = {divinePrice} 崇高石 / 1 混沌石 = {chaosPrice} 崇高石
              </span>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}