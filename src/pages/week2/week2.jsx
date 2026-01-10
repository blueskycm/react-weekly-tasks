import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function Week2() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [tempProduct, setTempProduct] = useState(null);

  // 定義稀有度對照表
  const rarityMap = {
    Normal: { label: "一般", color: "#C8C8C8", textColor: "#000" }, // 白裝
    Magic:  { label: "魔法", color: "#8888FF", textColor: "#FFF" }, // 藍裝
    Rare:   { label: "稀有", color: "#FFFF77", textColor: "#000" }, // 黃裝
    Unique: { label: "傳奇", color: "#AF6025", textColor: "#FFF" }  // 橘裝
  };

  // 定義貨幣圖示 (對應 public/images 資料夾)
  const currencyIcons = {
    "崇高石": "images/崇高石.png",
    "神聖石": "images/神聖石.png",
    "混沌石": "images/混沌石.png"
  };

  // 顯示價格的小元件
  const CurrencyDisplay = ({ price, unit }) => {
    // 如果 API 沒填單位，給空字串避免報錯
    const currentUnit = unit || ""; 
    const iconPath = currencyIcons[currentUnit];

    return (
      <span className="d-flex align-items-center justify-content-end">
        {price}
        {iconPath && (
          <img 
            src={iconPath} 
            alt={currentUnit} 
            style={{ width: '24px', height: '24px', marginLeft: '6px', marginRight: '2px', objectFit: 'contain' }} 
          />
        )}
        {/* text-white-50 (半透明白) */}
        <span className="text-white-50 ms-1" style={{ fontSize: '0.9rem' }}>
          {currentUnit}
        </span>
      </span>
    );
  };

  // 處理文字換行的 Helper
  const formatTitle = (text) => {
    return text ? text.replaceAll('\\n', '\n') : '';
  };


  // 檢查登入狀態
  useEffect(() => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
      axios.post(`${API_BASE}/api/user/check`)
        .then(() => {
          setIsAuth(true);
          getData();
        })
        .catch((err) => {
          console.error(err);
          setIsAuth(false);
        });
    }
  }, []);

  // 表單處理
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 登入提交
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)}; path=/`;
      axios.defaults.headers.common["Authorization"] = token;
      setIsAuth(true);
      getData();
    } catch (err) {
      alert("登入失敗: " + (err.response?.data?.message || "未知錯誤"));
    }
  };

  // 取得資料
  const getData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setIsAuth(false);
      }
    }
  };

  // 檢查登入狀態
  // 獨立出來，方便在 useEffect 或其他地方重複呼叫
  const checkAdmin = async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

    if (!token) return;

    try {
      axios.defaults.headers.common["Authorization"] = token;
      await axios.post(`${API_BASE}/api/user/check`);
      
      // 驗證成功
      setIsAuth(true);
      getData(); // 確保驗證過後才拉資料
    } catch (err) {
      // 驗證失敗，清除狀態
      setIsAuth(false);
    }
  };

  // 執行登入流程
  const login = async () => {
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data;
      
      // 寫入 Cookie
      document.cookie = `hexToken=${token};expires=${new Date(expired)}; path=/`;
      
      // 設定 Axios 預設 Header
      axios.defaults.headers.common["Authorization"] = token;

      // 登入成功後，直接切換狀態並取得資料
      setIsAuth(true);
      getData();

    } catch (err) {
      alert("登入失敗: " + (err.response?.data?.message || "未知錯誤"));
    }
  };

  // 畫面初始載入時，檢查一次登入狀態
  useEffect(() => {
    checkAdmin();
  }, []);

  // 計算當前選中商品的稀有度(API還不能新增鍵值)
  const currentRarity = tempProduct 
    ? (rarityMap[tempProduct.rarity] || rarityMap.Normal) 
    : rarityMap.Normal;

  // --- 畫面渲染 ---
  return (
    <div className="week2-container">
      {!isAuth ? (
        // === 登入頁面 ===
        <div className="container login">
          <div className="row justify-content-center mt-5">
            <h1 className="h3 mb-3 font-weight-normal text-center">Week 2 - 產品管理</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input
                    type="email"
                    className="form-control"
                    id="username"
                    name="username"
                    placeholder="name@example.com"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                    autoFocus
                  />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                  <label htmlFor="password">Password</label>
                </div>
                <button className="btn btn-lg btn-primary w-100 mt-3" type="submit">
                  登入
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        // === 產品列表頁面 ===
        <div className="container-fluid mt-5 px-3 px-lg-5">
          <div className="row align-items-start">
            {/* 左側：產品列表 */}
            <div className="col-lg-6" style={{ minWidth: 0 }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>商品列表</h2>
                <Link to="/" className="btn btn-secondary btn-sm me-2">
                  回首頁
                </Link>
                <button 
                  className="btn btn-outline-danger btn-sm" 
                  onClick={() => {
                    document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                    setIsAuth(false);
                    setTempProduct(null);
                  }}
                >
                  登出
                </button>
              </div>
              
              <div className="table-responsive">
                <table className="table table-hover align-middle w-100">
                  <thead>
                    <tr>
                      <th scope="col" className="text-nowrap">商品名稱</th>
                      <th scope="col" className="text-end text-nowrap">原價</th>
                      <th scope="col" className="text-end text-nowrap">售價</th>
                      <th scope="col" className="text-end text-nowrap">是否啟用</th>
                      <th scope="col" className="text-end text-nowrap">查看細節</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item) => (
                      <tr key={item.id}>
                        <td className="text-nowrap">{formatTitle(item.title)}</td>
                        <td className="text-end text-nowrap">
                          <CurrencyDisplay price={item.origin_price} unit={item.unit} />
                        </td>
                        <td className="text-end text-nowrap">
                          <CurrencyDisplay price={item.price} unit={item.unit} />
                        </td>
                        <td className="text-end text-nowrap">
                          {item.is_enabled ? (
                            <span className="text-success fw-bold">啟用</span>
                          ) : (
                            <span>未啟用</span>
                          )}
                        </td>
                        <td className="text-end text-nowrap">
                          <button className="btn btn-primary btn-sm" onClick={() => setTempProduct(item)}>
                            查看細節
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="mb-3">目前有 {products.length} 項商品</p>
            </div>

            {/* 右側：產品細節 */}
            <div className="col-lg-6" style={{ minWidth: 0 }}>
              <h2 className="mb-3">單一物品細節</h2>
              {tempProduct ? (
                <div className="card mb-3 w-100 border-secondary">
                  <img 
                    src={tempProduct.imageUrl} 
                    className="card-img-top primary-image" 
                    alt={tempProduct.title} 
                    style={{ height: '200px', objectFit: 'contain', width: '100%', backgroundColor: '#212529' }}
                  />
                  <div className="card-body">
                    <h5 className="card-title mb-2">
                      <div style={{ whiteSpace: 'pre-line' }}>
                        {formatTitle(tempProduct.title)}
                      </div>
                      <span className="badge ms-2" style={{ backgroundColor: currentRarity.color, color: currentRarity.textColor, border: '1px solid #333'}}>
                        {tempProduct.category}
                      </span>
                    </h5>

                    <p className="card-text">
                      物品稀有度：
                      <span style={{ color: currentRarity.color, fontWeight: 'bold' }}>{currentRarity.label}</span>
                    </p>
                    <p className="card-text" style={{ whiteSpace: 'pre-line' }}>物品描述：{'\n'}{formatTitle(tempProduct.description)}</p>
                    <p className="card-text" style={{ whiteSpace: 'pre-line' }}>額外說明：{'\n'}{formatTitle(tempProduct.content)}</p>
                    <div className="d-flex">
                      <p className="card-text">售價：</p>
                      <p className="card-text text-secondary">
                        <del>{tempProduct.origin_price}</del>
                      </p>
                      <p className="card-text ms-2 fw-bold">
                        <CurrencyDisplay price={tempProduct.price} unit={tempProduct.unit} />
                      </p>
                    </div>
                  </div>
                  {tempProduct.imagesUrl && tempProduct.imagesUrl.length > 0 && (
                    <div className="card-footer d-flex flex-wrap border-secondary">
                      {tempProduct.imagesUrl.map((url, index) => (
                        url ? (
                          <img 
                            key={index} 
                            src={url} 
                            alt={`${tempProduct.title} ${index + 1}`} 
                            className="img-thumbnail me-2 bg-dark border-secondary" 
                            style={{ height: '100px', width: 'auto' }}
                          />
                        ) : null
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="alert alert-secondary w-100">
                  請選擇一個商品查看
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Week2;