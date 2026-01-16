import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// 匯入
import { rarityMap } from "../../utils/constants";
import CurrencyDisplay from "../../components/CurrencyDisplay";
import ProductModal from "../../components/ProductModal";
import DeleteModal from "../../components/DeleteModal";
import Pagination from "../../components/Pagination";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function Week4() {
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalState, setModalState] = useState({ isOpen: false, type: '' });
  const [userEmail, setUserEmail] = useState("");
  const [pageInfo, setPageInfo] = useState({});

  // 預設空產品資料
  const emptyProduct = {
    title: "", category: "", rarity: "Normal", origin_price: 0, price: 0,
    unit: "", description: "", content: "", is_enabled: 1, imageUrl: "", imagesUrl: [],
    quantity: 1
  };

  const [tempProduct, setTempProduct] = useState(emptyProduct);

  const [isLoading, setIsLoading] = useState(true);

  // --- 初始化與驗證 ---
  const checkAdmin = async () => {
    try {
      const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, "$1");
      // 如果連 token 都沒有，直接視為未登入，結束 loading
      if (!token) {
        setIsAuth(false);
        setIsLoading(false); // 結束讀取
        return;
      }
      
      axios.defaults.headers.common['Authorization'] = token;
      
      await axios.post(`${API_BASE}/api/user/check`);
      
      // 驗證成功
      setIsAuth(true);
      getData(); // 取得產品列表
      
    } catch (err) {
      // 驗證失敗
      setIsAuth(false);
    } finally {
      // 無論成功或失敗，最後都要把 Loading 關掉
      setIsLoading(false); 
    }
  };

  useEffect(() => { checkAdmin(); }, []);

const getData = async (page = 1) => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products?page=${page}`);
      const productsArray = Object.values(res.data.products); 
      const processedProducts = productsArray.map(product => {
        try {
          // 嘗試把 content 解析成 JSON
          const customData = JSON.parse(product.content);
          return {
            ...product,
            rarity: customData.rarity || product.rarity || 'Normal',
            quantity: customData.quantity !== undefined ? customData.quantity : 1,
            content: customData.note || '',
            isDeleted: customData.isDeleted || false
          };
        } catch (e) {
          // 如果是舊資料或解析失敗，給預設值
          return { ...product, quantity: 1, isDeleted: false };
        }
      })
      // 只保留沒有被標記為刪除的商品
      .filter(product => !product.isDeleted);

      setProducts(processedProducts);
      setPageInfo(res.data.pagination);
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setIsAuth(false);
      } else {
        alert("取得資料失敗: " + err.message);
      }
    }
  };

  // --- 登入與其他邏輯 ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${API_BASE}/admin/signin`, formData);
      const { token, expired } = res.data;
      document.cookie = `hexToken=${token};expires=${new Date(expired)}; path=/`;
      axios.defaults.headers.common["Authorization"] = token;

      localStorage.setItem("poe_email", formData.username);
      setUserEmail(formData.username);

      setIsAuth(true);
      getData();
    } catch (err) {
      alert("登入失敗: " + err.response?.data?.message);
    }
  };

  const handleLogout = () => {
    document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

    localStorage.removeItem("poe_email");
    setUserEmail("");

    setIsAuth(false);
    setProducts([]);
    setSelectedProduct(null);
  };

  const openProductModal = (type, product) => {
    setTempProduct(type === 'create' ? emptyProduct : { ...emptyProduct, ...product, imagesUrl: product.imagesUrl || [] });
    setModalState({ isOpen: true, type: type });
  };

  const openDeleteModal = (product) => {
    setTempProduct(product);
    setModalState({ isOpen: true, type: 'delete' });
  };

  const closeModal = () => {
    setModalState({ ...modalState, isOpen: false });
  };

  const updateProduct = async () => {
    try {
      const cleanImages = (tempProduct.imagesUrl || []).filter(url => url.trim() !== "");
      
      // 將 rarity, quantity, content 打包成 JSON 字串
      const productToSend = { 
        ...tempProduct, 
        imagesUrl: cleanImages,
        content: JSON.stringify({
          rarity: tempProduct.rarity,
          quantity: tempProduct.quantity,
          note: tempProduct.content,
          isDeleted: false
        })
      };

      let api = `${API_BASE}/api/${API_PATH}/admin/product`;
      let method = "post";
      if (modalState.type === 'edit') {
        api = `${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`;
        method = "put";
      }
      await axios[method](api, { data: productToSend });
      closeModal();
      getData(pageInfo.current_page);
      if (selectedProduct && selectedProduct.id === tempProduct.id) setSelectedProduct(tempProduct);
      alert(modalState.type === 'create' ? "新增成功" : "更新成功");
    } catch (err) {
      alert("操作失敗: " + (err.response?.data?.message || err.message));
    }
  };

  const deleteProduct = async () => {
    try {
      const productToDelete = {
        ...tempProduct,
        content: JSON.stringify({
          rarity: tempProduct.rarity,
          quantity: tempProduct.quantity,
          note: tempProduct.content,
          isDeleted: true // 標記為軟刪除
        })
      };

      await axios.put(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`, {
        data: productToDelete
      });

      closeModal();
      getData();
      if (selectedProduct?.id === tempProduct.id) setSelectedProduct(null);
      alert("商品已移至回收桶 (軟刪除成功)");

    } catch (err) {
      alert("刪除失敗: " + err.message);
    }
  };

  const formatTitle = (title) => title ? title.replace(/\\n/g, '\n') : "";

  // 如果正在讀取，顯示 Loading 畫面
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-body" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <span className="ms-3 text-body">Loading...</span>
      </div>
    );
  }

  return (
    <div className="week4-container">
      {!isAuth ? (
        <div className="container login">
          <div className="row justify-content-center mt-5">
            <h1 className="h3 mb-3 font-weight-normal text-center">Week 4 - 商品管理系統</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input type="email" className="form-control" name="username" placeholder="name@example.com" value={formData.username} onChange={handleInputChange} required autoFocus />
                  <label className="text-white-50" htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input type="password" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
                  <label className="text-white-50" htmlFor="password">Password</label>
                </div>
                <button className="btn btn-lg btn-primary w-100 mt-3" type="submit">登入</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div className="container-fluid mt-5 px-3 px-lg-5">
          {/* 頂部 Navbar */}
          <div className="d-flex justify-content-end align-items-center bg-dark text-white p-3 mb-4 rounded shadow-sm gap-3">
            {/* 回首頁按鈕 */}
            <Link to="/" className="btn btn-outline-light btn-sm d-flex align-items-center gap-1 text-decoration-none">
              <i className="bi bi-house-door-fill"></i> 回首頁
            </Link>
            {/* 顯示 Email */}
            <div className="d-flex align-items-center text-light">
              <i className="bi bi-envelope-fill me-2 text-warning"></i>
              <span className="fw-bold" style={{ letterSpacing: '0.5px' }}>
                {userEmail || "管理員"}
              </span>
            </div>
            {/* 登出按鈕 */}
            <button className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1" onClick={handleLogout}>
              <i className="bi bi-box-arrow-right"></i> 登出
            </button>
          </div>

          <div className="row align-items-start">
            {/* 左側：產品列表 */}
            <div className="col-lg-6 mb-3" style={{ minWidth: 0 }}>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h2>商品列表</h2>
                <div>
                  <button className="btn btn-primary me-2" onClick={() => openProductModal('create')}>建立新商品</button>
                </div>
              </div>

              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">分類</th>
                      <th scope="col" className="text-nowrap">商品名稱</th>
                      <th scope="col" className="text-center">數量</th>
                      <th scope="col" className="text-end">售價</th>
                      <th scope="col" className="text-center">狀態</th>
                      <th scope="col" className="text-center">操作</th>
                      <th scope="col" className="text-center">細節</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item) => (
                      <tr key={item.id}>
                        <td className="text-center">
                          {(() => {
                            const rarityKey = item.rarity || "Normal";
                            const rarityConfig = rarityMap[rarityKey] || rarityMap.Normal;
                            return (
                              <span className="badge border" style={{ backgroundColor: rarityConfig.color, color: rarityConfig.textColor, fontSize: '0.9rem', textShadow: '0 0 2px rgba(0,0,0,0.5)' }}>
                                {item.category}
                              </span>
                            );
                          })()}
                        </td>

                        <td>{formatTitle(item.title)}</td>
                        <td className="text-center">{item.quantity}</td>
                        <td className="text-end">
                          <div className="d-flex align-items-center justify-content-end gap-2">
                            <del className="text-white-50 ms-1" style={{ fontSize: '0.9rem' }}>{item.origin_price}</del>
                            <CurrencyDisplay price={item.price} unit={item.unit} />
                          </div>
                        </td>
                        <td className="text-center">
                          {item.is_enabled ? <span className="text-success fw-bold">啟用</span> : <span className="text-white-50 ms-1 text-muted-dark">未啟用</span>}
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openProductModal('edit', item)}>編輯</button>
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => openDeleteModal(item)}>刪除</button>
                          </div>
                        </td>
                        <td className="text-center">
                          <button className={`btn btn-sm ${selectedProduct?.id === item.id ? 'btn-secondary' : 'btn-outline-primary'}`} onClick={() => setSelectedProduct(item)}>
                            查看
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-white-50 text-muted-dark mb-3">
                本頁顯示 {products.length} 筆資料，
                <span className="ms-2">
                  第 {pageInfo.current_page || 1} 頁 / 共 {pageInfo.total_pages || 1} 頁
                </span>
              </p>
              <div className="d-flex justify-content-center mt-4">
                <Pagination pageInfo={pageInfo} handlePageChange={getData} />
              </div>
            </div>

            {/* 右側：產品細節 */}
            <div className="col-lg-6" style={{ minWidth: 0 }}>
              <div className="card shadow-sm border-0 h-100">
                <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
                  <h4 className="mb-0">商品卡片預覽</h4>
                </div>
                <div className="card-body">
                    {selectedProduct ? (
                      <div className="card mb-3 w-100 border-secondary">
                        <img src={selectedProduct.imageUrl} className="card-img-top primary-image bg-dark" alt={selectedProduct.title} style={{ height: '300px', objectFit: 'contain', width: '100%' }} />
                        <div className="card-body">
                          <h5 className="card-title mb-2 d-flex align-items-center">
                              <div style={{ whiteSpace: 'pre-line' }}>{formatTitle(selectedProduct.title)}</div>
                              <span className="badge ms-2" style={{ backgroundColor: (rarityMap[selectedProduct.rarity] || rarityMap.Normal).color, color: (rarityMap[selectedProduct.rarity] || rarityMap.Normal).textColor, border: '1px solid #333' }}>
                                {selectedProduct.category}
                              </span>
                          </h5>
                          <p className="card-text">
                            物品稀有度：
                            <span style={{ color: (rarityMap[selectedProduct.rarity] || rarityMap.Normal).color, fontWeight: 'bold' }}>
                              {(rarityMap[selectedProduct.rarity] || rarityMap.Normal).label}
                            </span>
                          </p>
                          <p className="card-text" style={{ whiteSpace: 'pre-line' }}>物品描述：{'\n'}{formatTitle(selectedProduct.description)}</p>
                          <p className="card-text" style={{ whiteSpace: 'pre-line' }}>額外說明：{'\n'}{formatTitle(selectedProduct.content)}</p>
                          <div className="d-flex align-items-center">
                            <p className="card-text mb-0 me-2">售價：</p>
                            <p className="card-text text-secondary mb-0 text-decoration-line-through me-2">{selectedProduct.origin_price}</p>
                            <p className="card-text mb-0 fw-bold fs-5"><CurrencyDisplay price={selectedProduct.price} unit={selectedProduct.unit} /></p>
                          </div>
                        </div>
                        {selectedProduct.imagesUrl && selectedProduct.imagesUrl.length > 0 && (
                          <div className="card-footer d-flex flex-wrap border-secondary gap-2">
                            {selectedProduct.imagesUrl.map((url, index) => (
                              url ? <img key={index} src={url} alt={`${selectedProduct.title} ${index + 1}`} className="img-thumbnail bg-dark border-secondary" style={{ height: '80px', width: 'auto' }} /> : null
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="alert alert-secondary w-100">請選擇一個商品查看</div>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Modal 元件 --- */}
      <ProductModal isOpen={modalState.isOpen && (modalState.type === 'create' || modalState.type === 'edit')} type={modalState.type} tempProduct={tempProduct} setTempProduct={setTempProduct} updateProduct={updateProduct} onClose={closeModal} />
      <DeleteModal isOpen={modalState.isOpen && modalState.type === 'delete'} product={tempProduct} deleteProduct={deleteProduct} onClose={closeModal} description="此為軟刪除，資料庫仍保留" />
    </div>
  );
}

export default Week4;