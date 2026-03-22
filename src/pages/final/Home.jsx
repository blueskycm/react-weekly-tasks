import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Home() {
  const baseUrl = import.meta.env.BASE_URL;

  const [hotProducts, setHotProducts] = useState([]);

  // 建立輪播用的 Ref 與 Hover 狀態
  const scrollRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  // 取得商品資料
  useEffect(() => {
    const getHotProducts = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/${API_PATH}/products`);
        const filteredProducts = res.data.products
          .filter(p => p.is_enabled)
          .slice(0, 10);
        setHotProducts(filteredProducts);
      } catch (error) {
        console.error("取得輪播商品失敗", error);
      }
    };
    getHotProducts();
  }, []);

  // 自動輪播邏輯
  useEffect(() => {
    // 如果沒有資料，或是滑鼠正在懸停，就暫停計時器
    if (hotProducts.length === 0 || isHovered) return;

    const intervalId = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        // 計算每次要捲動的距離 (卡片寬度 280px + gap 24px = 304px)
        const scrollAmount = 304;

        // 如果快到底部了，就平滑地捲回最左邊
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          // 否則向右平滑捲動一張卡片的距離
          scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
      }
    }, 2500); // 這裡設定 2.5 秒輪播一次

    return () => clearInterval(intervalId); // 元件卸載或重新渲染時清除計時器
  }, [isHovered, hotProducts]);

  return (
    <div className="bg-dark text-light" style={{ minHeight: "100vh" }}>

      {/* Hero Banner */}
      <div
        className="position-relative d-flex align-items-center justify-content-center"
        style={{
          height: "60vh",
          background: `linear-gradient(rgba(33, 37, 41, 0.8), rgba(33, 37, 41, 0.9)), url('${baseUrl}images/TheLastDruid.jpg') center/cover no-repeat`,
          borderBottom: "1px solid #495057"
        }}
      >
        <div className="text-center px-3" style={{ zIndex: 1 }}>
          <h1 className="display-3 fw-bold mb-3 text-warning" style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.8)" }}>
            阿葆的 POE2 商場
          </h1>
          <p className="fs-4 mb-4 text-light opacity-75">
            瓦爾克拉斯最安全的黑市交易中心，為你的流亡之旅添增助力。
          </p>
          <Link to="/final/products" className="btn btn-warning btn-lg px-5 py-3 fw-bold shadow">
            <i className="bi bi-shop me-2"></i>進入市集
          </Link>
        </div>
      </div>

      <div className="container py-5">

        {/* 商場特色保證 */}
        <div className="row g-4 mb-5 pb-5 border-bottom border-secondary">
          <div className="col-md-4 text-center">
            <div className="p-4 bg-transparent border border-secondary rounded h-100 hover-shadow transition-all">
              <i className="bi bi-lightning-charge-fill text-warning display-4 mb-3 d-block"></i>
              <h4 className="fw-bold">極速發貨</h4>
              <p className="text-muted">下單後專人遊戲內密語，五分鐘內完成藏身處面交，絕不耽誤您的刷圖時間。</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className="p-4 bg-transparent border border-secondary rounded h-100 hover-shadow transition-all">
              <i className="bi bi-shield-fill-check text-success display-4 mb-3 d-block"></i>
              <h4 className="fw-bold">安全無虞</h4>
              <p className="text-muted">所有通貨與裝備皆為純手工農出，零外掛風險，100% 保障您的帳號安全。</p>
            </div>
          </div>
          <div className="col-md-4 text-center">
            <div className="p-4 bg-transparent border border-secondary rounded h-100 hover-shadow transition-all">
              <i className="bi bi-currency-exchange text-info display-4 mb-3 d-block"></i>
              <h4 className="fw-bold">雙幣值結算</h4>
              <p className="text-muted">獨創神聖石/新台幣雙軌結算系統，匯率透明公開，讓您選擇最划算的支付方式。</p>
            </div>
          </div>
        </div>

        {/* 熱門商品自動輪播 */}
        <h3 className="text-center fw-bold mb-4 mt-5">熱門商品</h3>
        <div className="mb-5 pb-5 border-bottom border-secondary">
          {hotProducts.length > 0 ? (
            <div
              className="d-flex flex-nowrap overflow-x-auto pb-3 gap-4"
              // 掛載 Ref，並綁定滑鼠移入/移出事件，同時隱藏 scrollbar
              ref={scrollRef}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              style={{
                scrollSnapType: "x mandatory",
                WebkitOverflowScrolling: "touch",
                scrollbarWidth: "none",
                msOverflowStyle: "none",
              }}
            >
              {/* 讓 Chrome/Safari 隱藏卷軸的內部樣式 (Hack) */}
              <style>{`.overflow-x-auto::-webkit-scrollbar { display: none; }`}</style>

              {hotProducts.map((product) => (
                <div className="flex-shrink-0" key={product.id} style={{ width: "280px", scrollSnapAlign: "start" }}>
                  <div className="card bg-dark border-secondary h-100 hover-shadow transition-all shadow-sm">
                    <div className="text-center pt-4 pb-2" style={{ height: "160px" }}>
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        style={{ maxHeight: "100%", width: "auto", objectFit: "contain", filter: "drop-shadow(0 0 5px rgba(255,255,255,0.15))" }}
                      />
                    </div>
                    <div className="card-body text-center border-top border-secondary d-flex flex-column justify-content-end">
                      <h5 className="card-title text-warning fw-bold text-truncate" title={product.title ? product.title.replace('\\n', ' ') : ''}>
                        {product.title ? product.title.split('\\n')[0] : '神秘商品'}
                      </h5>
                      <Link to={`/final/products/${product.id}`} className="btn btn-outline-warning btn-sm mt-2 fw-bold">
                        查看商品
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="col-12 text-center text-muted py-5 rounded border border-secondary bg-transparent">
              <div className="spinner-border spinner-border-sm text-warning me-2" role="status"></div>
              瓦爾克拉斯珍寶載入中...
            </div>
          )}
        </div>

        <div className="row mb-5 pb-5 border-bottom border-secondary">
          <div className="col-12">
            <h3 className="fw-bold mb-4">
              <i className="bi bi-megaphone-fill me-2 text-warning"></i>市集快訊
            </h3>
            <div className="card bg-dark border-secondary shadow-sm">
              <div className="list-group list-group-flush rounded">

                {/* 公告 1：促銷活動 */}
                <Link to="/final/products" className="list-group-item list-group-item-action bg-transparent text-light border-secondary d-flex align-items-center py-3 hover-bg-light-subtle">
                  <span className="badge bg-danger me-3 px-2 py-1">促銷</span>
                  <div className="flex-grow-1 text-truncate">
                    歡慶商場新開幕！首週下單輸入隱藏碼，全館通貨享有 95 折優惠。
                  </div>
                  <small className="text-muted ms-3 text-nowrap">2026-03-22</small>
                </Link>

                {/* 公告 2：補貨通知 */}
                <Link to="/final/products" className="list-group-item list-group-item-action bg-transparent text-light border-secondary d-flex align-items-center py-3 hover-bg-light-subtle">
                  <span className="badge bg-success me-3 px-2 py-1">補貨</span>
                  <div className="flex-grow-1 text-truncate">
                    【現貨供應】大量「完美神聖石」已入庫！洗裝備缺通貨的流亡者請把握機會。
                  </div>
                  <small className="text-muted ms-3 text-nowrap">2026-03-18</small>
                </Link>

                {/* 公告 3：官方情報 (把你說的最後一篇新聞拿來用) */}
                <a href="https://pathofexile.tw/" target="_blank" rel="noreferrer" className="list-group-item list-group-item-action bg-transparent text-light border-secondary d-flex align-items-center py-3 hover-bg-light-subtle">
                  <span className="badge bg-primary me-3 px-2 py-1">情報</span>
                  <div className="flex-grow-1 text-truncate">
                    【官方更新】POE2 1.26 季中更新上線，部分傳奇裝備價格將有波動預警。
                  </div>
                  <small className="text-muted ms-3 text-nowrap">2026-01-26</small>
                </a>

              </div>
            </div>
          </div>
        </div>

        {/* 交易流程教學 與 匯率看板 */}
        <div className="row g-5 align-items-center mb-4">
          <div className="col-lg-7">
            <h3 className="fw-bold mb-4"><i className="bi bi-map me-2 text-primary"></i>如何進行交易？</h3>
            <div className="d-flex align-items-start mb-4">
              <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow" style={{ width: "40px", height: "40px", flexShrink: 0 }}>1</div>
              <div>
                <h5 className="fw-bold">挑選商品並結帳</h5>
                <p className="text-muted">將需要的裝備或通貨加入購物車，選擇您的結算幣別，填寫您的「遊戲 ID」並送出訂單。</p>
              </div>
            </div>
            <div className="d-flex align-items-start mb-4">
              <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow" style={{ width: "40px", height: "40px", flexShrink: 0 }}>2</div>
              <div>
                <h5 className="fw-bold">保持在線等候密語</h5>
                <p className="text-muted">我們的專員會根據您留下的 ID，在遊戲內發送組隊邀請給您。</p>
              </div>
            </div>
            <div className="d-flex align-items-start">
              <div className="bg-primary text-white rounded-circle d-flex justify-content-center align-items-center me-3 shadow" style={{ width: "40px", height: "40px", flexShrink: 0 }}>3</div>
              <div>
                <h5 className="fw-bold">藏身處面交確認</h5>
                <p className="text-muted">前往專員的藏身處，放入隨機一件無用的黃裝進行安全交易即可完成！</p>
              </div>
            </div>
          </div>

          <div className="col-lg-5">
            <div className="card bg-dark border-warning shadow-lg">
              <div className="card-header bg-warning text-dark fw-bold text-center fs-5">
                <i className="bi bi-graph-up-arrow me-2"></i>今日重點行情
              </div>
              <div className="card-body text-center p-4">
                <p className="mb-3 text-muted">我們提供最即時、透明的雙軌匯率</p>
                <div className="fs-5 mb-3 p-2 border border-secondary rounded">
                  1 <span className="text-warning fw-bold mx-1">神聖石</span> ≈ <span className="text-success fw-bold ms-1">NT$ 5</span>
                </div>
                <div className="fs-5 mb-4 p-2 border border-secondary rounded">
                  1 <span className="text-warning fw-bold mx-1">神聖石</span> ≈ 800 <span className="text-secondary fw-bold ms-1">崇高石</span>
                </div>
                <Link to="/final/exchange" className="btn btn-outline-warning w-100 py-2 fw-bold">
                  <i className="bi bi-calculator me-2"></i>前往匯率計算機
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}