import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { createMessage } from "../../store/messageSlice";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_EXCHANGE_API;

export default function AdminExchange() {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 神聖石與混沌石
  const [divine, setDivine] = useState(null);
  const [chaos, setChaos] = useState(null);
  // 新台幣設定
  const [ntd, setNtd] = useState(null);

  const [isLoading, setIsLoading] = useState(false);

  const [divinePrice, setDivinePrice] = useState("");
  const [chaosPrice, setChaosPrice] = useState("");
  // 新台幣價格 State
  const [ntdPrice, setNtdPrice] = useState("");

  useEffect(() => {
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, "$1");

    if (token) {
      axios.defaults.headers.common['Authorization'] = token;
      getProducts();
    } else {
      dispatch(createMessage({ success: false, message: "請先登入" }));
      navigate('/login');
    }
  }, []);

  const getProducts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/${API_PATH}/admin/products?page=1`);
      const allProducts = Object.values(res.data.products || {});

      const divineItem = allProducts.find(p => p.title === "神聖石" && p.category === "Exchange");
      const chaosItem = allProducts.find(p => p.title === "混沌石" && p.category === "Exchange");
      const ntdItem = allProducts.find(p => p.title === "新台幣" && p.category === "Exchange");

      if (divineItem) {
        setDivine(divineItem);
        setDivinePrice(divineItem.price);
      }
      if (chaosItem) {
        setChaos(chaosItem);
        setChaosPrice(chaosItem.price);
      }
      if (ntdItem) {
        setNtd(ntdItem);
        setNtdPrice(ntdItem.price);
      }

    } catch (error) {
      console.error(error);
      dispatch(createMessage({ success: false, message: "匯率資料讀取失敗" }));
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrice = async (product, newPrice) => {
    if (!product) return;
    setIsLoading(true);
    try {
      await axios.put(`${BASE_URL}/api/${API_PATH}/admin/product/${product.id}`, {
        data: {
          ...product,
          price: Number(newPrice),
          origin_price: Number(newPrice),
        }
      });
      dispatch(createMessage({ success: true, message: `「${product.title}」匯率更新成功！` }));
      getProducts();
    } catch (error) {
      console.error(error);
      dispatch(createMessage({ success: false, message: "更新失敗: " + error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  // 一鍵建立功能
  const createDefaultItem = async (title, defaultPrice, unit = "崇高石") => {
    setIsLoading(true);
    try {
      const data = {
        title: title,
        category: "Exchange",
        origin_price: defaultPrice,
        price: defaultPrice,
        unit: unit,
        description: "系統匯率設定檔，請勿刪除",
        content: "{}",
        is_enabled: 1,
        imageUrl: "",
        imagesUrl: []
      };
      await axios.post(`${BASE_URL}/api/${API_PATH}/admin/product`, { data });
      dispatch(createMessage({ success: true, message: `${title} 設定檔建立成功！` }));
      getProducts();
    } catch (error) {
      console.error(error);
      dispatch(createMessage({ success: false, message: "建立失敗: " + error.message }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2><i className="bi bi-gear-fill me-2"></i>匯率基準設定</h2>
        <Link to="/week7/admin" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-return-left me-1"></i> 返回列表
        </Link>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">

        {/* 卡片 1: 神聖石 */}
        <div className="col">
          <div className="card shadow-sm border-warning h-100">
            <div className="card-header bg-warning text-dark fw-bold">
              神聖石 (Divine Orb)
            </div>
            <div className="card-body">
              {divine ? (
                <>
                  <label className="form-label">目前價值 (單位：崇高石)</label>
                  <div className="input-group mb-3">
                    <input
                      type="number" className="form-control"
                      value={divinePrice} onChange={(e) => setDivinePrice(e.target.value)}
                    />
                    <button className="btn btn-primary" onClick={() => updatePrice(divine, divinePrice)} disabled={isLoading}>更新</button>
                  </div>
                  <small className="text-muted">ID: {divine.id}</small>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-danger">尚未找到設定檔</p>
                  <button className="btn btn-outline-warning" onClick={() => createDefaultItem("神聖石", 800)} disabled={isLoading}>一鍵建立 (預設 800)</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 卡片 2: 混沌石 */}
        <div className="col">
          <div className="card shadow-sm border-secondary h-100">
            <div className="card-header bg-secondary text-white fw-bold">
              混沌石 (Chaos Orb)
            </div>
            <div className="card-body">
              {chaos ? (
                <>
                  <label className="form-label">目前價值 (單位：崇高石)</label>
                  <div className="input-group mb-3">
                    <input
                      type="number" className="form-control"
                      value={chaosPrice} onChange={(e) => setChaosPrice(e.target.value)}
                    />
                    <button className="btn btn-dark" onClick={() => updatePrice(chaos, chaosPrice)} disabled={isLoading}>更新</button>
                  </div>
                  <small className="text-muted">ID: {chaos.id}</small>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-danger">尚未找到設定檔</p>
                  <button className="btn btn-outline-secondary" onClick={() => createDefaultItem("混沌石", 5)} disabled={isLoading}>一鍵建立 (預設 5)</button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 卡片 3: 新台幣 */}
        <div className="col">
          <div className="card shadow-sm border-success h-100">
            <div className="card-header bg-success text-white fw-bold">
              新台幣現金匯率 (NTD)
            </div>
            <div className="card-body">
              {ntd ? (
                <>
                  <label className="form-label">1 神聖石 = 多少新台幣</label>
                  <div className="input-group mb-3">
                    <span className="input-group-text">NT$</span>
                    <input
                      type="number" className="form-control"
                      value={ntdPrice} onChange={(e) => setNtdPrice(e.target.value)}
                    />
                    <button className="btn btn-success" onClick={() => updatePrice(ntd, ntdPrice)} disabled={isLoading}>更新</button>
                  </div>
                  <small className="text-muted">ID: {ntd.id}</small>
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-danger">尚未找到設定檔</p>
                  {/* 預設單位設為 TWD，預設價格 5 */}
                  <button className="btn btn-outline-success" onClick={() => createDefaultItem("新台幣", 5, "TWD")} disabled={isLoading}>一鍵建立 (預設 5)</button>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>

      <div className="alert alert-info mt-4">
        <i className="bi bi-info-circle me-2"></i>
        <strong>說明：</strong>
        <ul>
          <li><strong>遊戲匯率：</strong> 用於計算神聖石與混沌石的兌換比例 (<code>神聖石 / 混沌石</code>)。</li>
          <li><strong>現金匯率：</strong> 設定 <code>1 神聖石</code> 等值於多少 <code>新台幣</code>，可用於現金交易計算機。</li>
        </ul>
      </div>
    </div>
  );
}