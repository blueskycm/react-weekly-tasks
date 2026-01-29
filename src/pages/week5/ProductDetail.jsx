import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";
import CurrencyDisplay from "../../components/CurrencyDisplay";
import { rarityMap } from "../../utils/constants";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState({});
  const [qty, setQty] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // 紀錄目前顯示的大圖網址
  const [displayImage, setDisplayImage] = useState("");

  // 格式化標題 (處理 \n)
  const formatTitle = (title) => title ? title.replace(/\\n/g, '\n') : "";

  useEffect(() => {
    const getProduct = async () => {
      setIsLoading(true);
      try {
        const res = await axios.get(`${BASE_URL}/api/${API_PATH}/product/${id}`);
        const productData = res.data.product;

        // 資料解析邏輯 (同 Products.jsx)
        try {
          const customData = JSON.parse(productData.content);
          productData.rarity = customData.rarity || 'Normal';
          productData.note = customData.note || '';
        } catch (e) {
          productData.rarity = 'Normal';
          productData.note = productData.content;
        }

        setProduct(productData);

        // 預設顯示主圖
        setDisplayImage(productData.imageUrl);

      } catch (error) {
        alert("讀取產品失敗");
        navigate("/week5/products");
      } finally {
        setIsLoading(false);
      }
    };
    getProduct();
  }, [id, navigate]);

  const addToCart = async () => {
    setIsAdding(true);
    try {
      await axios.post(`${BASE_URL}/api/${API_PATH}/cart`, {
        data: {
          product_id: product.id,
          qty: Number(qty),
        },
      });
      alert("成功加入購物車！");
    } catch (error) {
      alert("加入購物車失敗");
    } finally {
      setIsAdding(false);
    }
  };

  const rarityConfig = rarityMap[product.rarity] || rarityMap.Normal;

  // 整合所有圖片列表 以便渲染縮圖列表
  const allImages = Array.from(new Set([product.imageUrl, ...(product.imagesUrl || [])].filter(url => url)));

  return (
    <div className="container py-5">
      <nav aria-label="breadcrumb" className="mb-4">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">
            <Link to="/week5/products" className="text-decoration-none">產品列表</Link>
          </li>
          <li className="breadcrumb-item active" aria-current="page">
            {product.title?.split('\\n')[0]}
          </li>
        </ol>
      </nav>

      {isLoading ? (
        <div className="d-flex justify-content-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <div className="row justify-content-center">
          {/* 左側：圖片區 */}
          <div className="col-md-6 mb-4">
            <div className="card border-secondary shadow-sm">
              <img
                src={displayImage}
                className="card-img-top bg-dark"
                alt={product.title}
                style={{ height: "400px", objectFit: "contain", width: "100%", transition: 'opacity 0.3s ease-in-out' }}
                // 如果圖片載入失敗，顯示預設圖或保持原狀
                onError={(e) => { e.target.onerror = null; e.target.src = product.imageUrl || 'https://placehold.co/400x400?text=No+Image'; }}
              />

              {/* 多圖預覽區 */}
              {allImages.length > 1 && (
                <div className="card-footer bg-transparent border-top border-secondary d-flex flex-wrap gap-2">
                  {allImages.map((url, index) => (
                    <img
                      key={index}
                      src={url}
                      alt={`${product.title} thumbnail ${index + 1}`}
                      className={`img-thumbnail bg-dark ${displayImage === url ? 'border-primary' : 'border-secondary'}`} // 4️⃣ 視覺回饋：選中時變藍色邊框
                      style={{
                        height: '80px',
                        width: '80px',
                        objectFit: 'cover',
                        cursor: 'pointer',
                        opacity: displayImage === url ? 1 : 0.7, // 選中時較亮，未選中稍暗
                        transition: 'all 0.2s'
                      }}
                      // 點擊事件：更新大圖狀態
                      onClick={() => setDisplayImage(url)}
                      // hover
                      onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
                      onMouseLeave={(e) => displayImage !== url && (e.currentTarget.style.opacity = 0.7)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* 右側：資訊與操作區 */}
          <div className="col-md-6">
            <div className="h-100 p-3">

              <h2 className="mb-3 d-flex align-items-center flex-wrap">
                <div style={{ whiteSpace: 'pre-line', marginRight: '10px' }}>
                  {formatTitle(product.title)}
                </div>
                <span
                  className="badge"
                  style={{
                    backgroundColor: rarityConfig.color,
                    color: rarityConfig.textColor,
                    border: '1px solid #333',
                    fontSize: '1rem',
                    alignSelf: 'flex-start',
                    marginTop: '5px'
                  }}
                >
                  {product.category}
                </span>
              </h2>

              <p className="card-text fs-5">
                物品稀有度：
                <span style={{ color: rarityConfig.color, fontWeight: 'bold' }}>
                  {rarityConfig.label}
                </span>
              </p>

              <hr />

              <div className="mb-4">
                <h5 className="text-muted">物品描述：</h5>
                <p style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
                  {formatTitle(product.description)}
                </p>
              </div>

              {product.note && (
                <div className="mb-4">
                  <h5 className="text-muted">額外說明：</h5>
                  <p style={{ whiteSpace: 'pre-line', color: '#aaa' }}>
                    {formatTitle(product.note)}
                  </p>
                </div>
              )}

              <hr />

              {/* 價格與加入購物車區塊 */}
              <div className="p-4 rounded border border-secondary">
                <div className="d-flex align-items-center mb-3">
                  <span className="h5 mb-0 me-3">售價：</span>

                  {product.origin_price > product.price && (
                    <del className="text-secondary me-3 fs-5">
                      {product.origin_price}
                    </del>
                  )}

                  <div className="fs-3 fw-bold">
                    <CurrencyDisplay price={product.price} unit={product.unit} />
                  </div>
                </div>

                <div className="row g-2">
                  <div className="col-4">
                    <div className="input-group">
                      <select
                        className="form-select"
                        value={qty}
                        onChange={(e) => setQty(e.target.value)}
                      >
                        {[...Array(10)].map((_, i) => (
                          <option value={i + 1} key={i}>
                            {i + 1}
                          </option>
                        ))}
                      </select>
                      <span className="input-group-text">個</span>
                    </div>
                  </div>
                  <div className="col-8">
                    <button
                      type="button"
                      className="btn btn-primary w-100 py-2"
                      onClick={addToCart}
                      disabled={isAdding}
                    >
                      {isAdding ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" />
                          加入中...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-cart-plus me-2"></i>
                          加入購物車
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}