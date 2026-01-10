import { useState, useEffect, useRef } from "react";
import axios from "axios";

import * as bootstrap from "bootstrap";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function Week3() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [isAuth, setIsAuth] = useState(false);
  const [products, setProducts] = useState([]);
  
  // --- 狀態管理 ---
  const emptyProduct = {
    title: "",
    category: "",
    rarity: "Normal",
    origin_price: 0,
    price: 0,
    unit: "",
    description: "",
    content: "",
    is_enabled: 1,
    imageUrl: "",
    imagesUrl: [],
  };

  const [tempProduct, setTempProduct] = useState(emptyProduct);
  
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [modalType, setModalType] = useState('create'); 
  
  // Modal Refs
  const productModalRef = useRef(null);
  const deleteModalRef = useRef(null);
  const productModalInstance = useRef(null);
  const deleteModalInstance = useRef(null);

  // --- 定義稀有度設定 ---
  const rarityMap = {
    Normal: { label: "一般", value: "Normal", color: "#C8C8C8", textColor: "#000" }, 
    Magic:  { label: "魔法", value: "Magic",  color: "#8888FF", textColor: "#FFF" }, 
    Rare:   { label: "稀有", value: "Rare",   color: "#FFFF77", textColor: "#000" }, 
    Unique: { label: "傳奇", value: "Unique", color: "#AF6025", textColor: "#FFF" }  
  };

  // --- 幣值圖示 ---
  const currencyIcons = {
    "崇高石": "images/崇高石.png",
    "神聖石": "images/神聖石.png",
    "混沌石": "images/混沌石.png"
  };

  const CurrencyDisplay = ({ price, unit }) => {
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
        <span className="ms-1" style={{ fontSize: '0.9rem' }}>
          {currentUnit}
        </span>
      </span>
    );
  };

  const formatTitle = (text) => {
    return text ? text.replaceAll('\\n', '\n') : '';
  };

  useEffect(() => {
    // 這裡需要用到上面引入的 bootstrap
    if (productModalRef.current) {
        productModalInstance.current = new bootstrap.Modal(productModalRef.current);
    }
    if (deleteModalRef.current) {
        deleteModalInstance.current = new bootstrap.Modal(deleteModalRef.current);
    }
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("hexToken="))
      ?.split("=")[1];

    if (token) {
      axios.defaults.headers.common["Authorization"] = token;
      try {
        await axios.post(`${API_BASE}/api/user/check`);
        setIsAuth(true);
        getData();
      } catch (err) {
        setIsAuth(false);
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

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

  const getData = async () => {
    try {
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/admin/products`);
      setProducts(res.data.products);
    } catch (err) {
      console.error(err);
    }
  };

  // --- CRUD Modal 操作 ---

  // --- 修改 openModal (強制給予預設值，解決 Uncontrolled 錯誤) ---
  const openModal = (type, product) => {
    setModalType(type);
    if (type === 'create') {
      setTempProduct({
        title: "",
        category: "",         
        rarity: "Normal",     
        origin_price: 0,
        price: 0,
        unit: "",
        description: "",
        content: "",
        is_enabled: 1,
        imageUrl: "",
        imagesUrl: [],
      });
    } else {
      // 編輯模式：這裡最重要！使用 || "" 確保沒有 undefined
      setTempProduct({ 
        ...product,
        title: product.title || "", // 如果 API 沒給標題，就給空字串
        category: product.category || "",
        rarity: product.rarity || "Normal",
        origin_price: product.origin_price || 0,
        price: product.price || 0,
        unit: product.unit || "",
        description: product.description || "",
        content: product.content || "",
        is_enabled: product.is_enabled || 0,
        imageUrl: product.imageUrl || "", // 常見地雷：有些產品沒圖，會導致 undefined
        imagesUrl: product.imagesUrl || [],
      }); 
    }
    productModalInstance.current.show();
  };

  const openDeleteModal = (product) => {
    setTempProduct({ ...product });
    deleteModalInstance.current.show();
  };

  const handleModalInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTempProduct(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value 
    }));
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setTempProduct(prev => ({
        ...prev,
        [name]: Number(value)
    }));
  }

  // 🔥 新增：圖片處理邏輯區塊開始
  
  // 處理副圖變更
  const handleImagesChange = (e, index) => {
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;
    setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
  };

  // 新增一個空圖片欄位
  const handleAddImage = () => {
    const newImages = [...(tempProduct.imagesUrl || []), ""];
    setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
  };

  // 刪除指定圖片欄位
  const handleRemoveImage = (index) => {
    const newImages = [...tempProduct.imagesUrl];
    newImages.splice(index, 1);
    setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
  };

  const updateProduct = async () => {
    try {
      // 送出前過濾掉空字串的圖片
      const cleanImages = (tempProduct.imagesUrl || []).filter(url => url.trim() !== "");
      
      const productToSend = {
        ...tempProduct,
        origin_price: Number(tempProduct.origin_price),
        price: Number(tempProduct.price),
        imagesUrl: cleanImages
      };

      let api = `${API_BASE}/api/${API_PATH}/admin/product`;
      let method = "post";

      if (modalType === 'edit') {
        api = `${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`;
        method = "put";
      }

      await axios[method](api, { data: productToSend });
      
      productModalInstance.current.hide();
      getData();
      
      if (selectedProduct && selectedProduct.id === tempProduct.id) {
          setSelectedProduct(productToSend); 
      }

      alert(modalType === 'create' ? "新增成功" : "更新成功");

    } catch (err) {
      alert("操作失敗: " + (err.response?.data?.message || err.message));
    }
  };

  const deleteProduct = async () => {
    try {
      await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`);
      deleteModalInstance.current.hide();
      getData();
      
      if (selectedProduct && selectedProduct.id === tempProduct.id) {
        setSelectedProduct(null);
      }
      
      alert("刪除成功");
    } catch (err) {
      alert("刪除失敗: " + (err.response?.data?.message || err.message));
    }
  };


  return (
    <div className="week3-container">
      {!isAuth ? (
        // === 登入頁面 ===
        <div className="container login">
          <div className="row justify-content-center mt-5">
            <h1 className="h3 mb-3 font-weight-normal text-center">Week 3 - 產品管理系統</h1>
            <div className="col-8">
              <form id="form" className="form-signin" onSubmit={handleSubmit}>
                <div className="form-floating mb-3">
                  <input id="username" type="email" className="form-control" name="username" placeholder="name@example.com" value={formData.username} onChange={handleInputChange} required autoFocus />
                  <label htmlFor="username">Email address</label>
                </div>
                <div className="form-floating">
                  <input id="password" type="password" className="form-control" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required />
                  <label htmlFor="password">Password</label>
                </div>
                <button className="btn btn-lg btn-primary w-100 mt-3" type="submit">登入</button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        // === 商品管理頁面 ===
        <div className="container-fluid mt-5 px-3 px-lg-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2>商品列表</h2>
            <div>
                <button className="btn btn-primary me-2" onClick={() => openModal('create')}>建立新商品</button>
                <button className="btn btn-outline-danger" onClick={() => { document.cookie = "hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"; setIsAuth(false); }}>登出</button>
            </div>
          </div>

          <div className="row align-items-start">
            {/* 左側：產品列表 */}
            <div className="col-lg-6" style={{ minWidth: 0 }}>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead>
                    <tr>
                      <th scope="col" className="text-center">分類</th>
                      <th scope="col" className="text-nowrap">商品名稱</th>
                      <th scope="col" className="text-end text-nowrap">原價</th>
                      <th scope="col" className="text-end text-nowrap">售價</th>
                      <th scope="col" className="text-center">啟用狀態</th>
                      <th scope="col" className="text-center">編輯</th>
                      <th scope="col" className="text-center">查看</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item) => (
                      <tr key={item.id}>
                        <td>
                          {(() => {
                            const rarityKey = item.rarity || "Normal";
                            const rarityConfig = rarityMap[rarityKey] || rarityMap.Normal;
                            return (
                              <span 
                                className="badge border" 
                                style={{ 
                                  backgroundColor: rarityConfig.color, 
                                  color: rarityConfig.textColor,
                                  fontSize: '0.9rem',
                                  textShadow: '0 0 2px rgba(0,0,0,0.5)' 
                                }}
                              >
                                {item.category}
                              </span>
                            );
                          })()}
                        </td>

                        <td className="text-nowrap">{formatTitle(item.title)}</td>
                        <td className="text-end text-nowrap">
                          <CurrencyDisplay price={item.origin_price} unit={item.unit} />
                        </td>
                        <td className="text-end text-nowrap">
                          <CurrencyDisplay price={item.price} unit={item.unit} />
                        </td>
                        <td className="text-center">
                          {item.is_enabled ? <span className="text-success fw-bold">啟用</span> : <span className="text-muted">未啟用</span>}
                        </td>
                        <td className="text-center">
                          <div className="btn-group">
                            <button type="button" className="btn btn-outline-primary btn-sm" onClick={() => openModal('edit', item)}>編輯</button>
                            <button type="button" className="btn btn-outline-danger btn-sm" onClick={() => openDeleteModal(item)}>刪除</button>
                          </div>
                        </td>
                        <td className="text-center">
                            <button className="btn btn-primary btn-sm" onClick={() => setSelectedProduct(item)}>查看細節</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p>目前有 {products.length} 項產品</p>
            </div>

            {/* 右側：產品細節 */}
            <div className="col-lg-6" style={{ minWidth: 0 }}>
              <h2 className="mb-3">單一物品細節</h2>
              {selectedProduct ? (
                  <div className="card mb-3 w-100 border-secondary">
                    <img 
                      src={selectedProduct.imageUrl} 
                      className="card-img-top primary-image" 
                      alt={selectedProduct.title} 
                      style={{ height: '300px', objectFit: 'contain', width: '100%', backgroundColor: '#212529' }}
                    />
                    <div className="card-body">
                      <h5 className="card-title mb-2">
                        <div style={{ whiteSpace: 'pre-line' }}>
                          {formatTitle(selectedProduct.title)}
                        </div>
                        <span 
                          className="badge ms-2" 
                          style={{ 
                              backgroundColor: (rarityMap[selectedProduct.rarity] || rarityMap.Normal).color, 
                              color: (rarityMap[selectedProduct.rarity] || rarityMap.Normal).textColor, 
                              border: '1px solid #333'
                          }}
                        >
                          {selectedProduct.category}
                        </span>
                      </h5>
  
                      <p className="card-text">
                        物品稀有度：
                        <span style={{ 
                            color: (rarityMap[selectedProduct.rarity] || rarityMap.Normal).color, 
                            fontWeight: 'bold' 
                        }}>
                            {(rarityMap[selectedProduct.rarity] || rarityMap.Normal).label}
                        </span>
                      </p>
                      <p className="card-text" style={{ whiteSpace: 'pre-line' }}>物品描述：{'\n'}{formatTitle(selectedProduct.description)}</p>
                      <p className="card-text" style={{ whiteSpace: 'pre-line' }}>額外說明：{'\n'}{formatTitle(selectedProduct.content)}</p>
                      <div className="d-flex">
                        <p className="card-text">售價：</p>
                        <p className="card-text text-secondary">
                          <del>{selectedProduct.origin_price}</del>
                        </p>
                        <p className="card-text ms-2 fw-bold">
                          <CurrencyDisplay price={selectedProduct.price} unit={selectedProduct.unit} />
                        </p>
                      </div>
                    </div>
                    {selectedProduct.imagesUrl && selectedProduct.imagesUrl.length > 0 && (
                      <div className="card-footer d-flex flex-wrap border-secondary">
                        {selectedProduct.imagesUrl.map((url, index) => (
                          url ? (
                            <img 
                              key={index} 
                              src={url} 
                              alt={`${selectedProduct.title} ${index + 1}`} 
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

      {/* --- Product Modal --- */}
      <div className="modal fade" ref={productModalRef} tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog modal-xl">
          <div className="modal-content border-0">
            <div className="modal-header bg-dark text-white">
              <h5 className="modal-title">{modalType === 'create' ? '新增產品' : '編輯產品'}</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <div className="row">
                {/* 左側：圖片區 */}
                <div className="col-sm-4">
                  <div className="mb-4">
                    <h5 className="border-bottom pb-2">主要圖片</h5>
                    <div className="mb-3">
                      <label htmlFor="imageUrl" className="form-label">圖片連結 (點我對焦)</label>
                      <input 
                          id="imageUrl"
                          type="text" 
                          className="form-control mb-2" 
                          name="imageUrl"
                          placeholder="請輸入主圖連結" 
                          value={tempProduct.imageUrl}
                          onChange={handleModalInputChange}
                      />
                      {tempProduct.imageUrl ? (
                          <img className="img-fluid rounded" src={tempProduct.imageUrl} alt="主要圖片" />
                      ) : (
                          <div className="bg-light text-secondary rounded d-flex align-items-center justify-content-center" style={{ height: '200px' }}>
                            尚無圖片
                          </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="border-bottom pb-2">多圖設置</h5>
                    {Array.isArray(tempProduct.imagesUrl) && tempProduct.imagesUrl.map((url, index) => (
                      <div key={index} className="mb-3">
                        <label htmlFor={`imagesUrl-${index}`} className="form-label">副圖 {index + 1}</label>
                        <div className="input-group mb-2">
                          <input 
                            id={`imagesUrl-${index}`}
                            type="text" 
                            className="form-control"
                            placeholder={`圖片連結 ${index + 1}`}
                            value={url}
                            onChange={(e) => handleImagesChange(e, index)}
                          />
                          <button 
                            type="button" 
                            className="btn btn-outline-danger"
                            onClick={() => handleRemoveImage(index)}
                          >
                            x
                          </button>
                        </div>
                        {url && (
                            <img className="img-fluid rounded mb-2" src={url} alt={`副圖 ${index + 1}`} />
                        )}
                      </div>
                    ))}

                    {
                      !tempProduct.imagesUrl || 
                      tempProduct.imagesUrl.length === 0 || 
                      tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] 
                      ? (
                        <button 
                          className="btn btn-outline-primary btn-sm d-block w-100"
                          onClick={handleAddImage}
                        >
                          新增圖片
                        </button>
                      ) : (
                        <div className="alert alert-warning py-2 text-center" style={{ fontSize: '0.9rem' }}>
                          請先填寫上方圖片連結
                        </div>
                      )
                    }
                  </div>
                </div>

                {/* 右側：表單區 */}
                <div className="col-sm-8">
                  <div className="mb-3">
                    <label htmlFor="title" className="form-label">標題</label>
                    <input 
                        id="title"
                        type="text" 
                        className="form-control" 
                        name="title" 
                        placeholder="請輸入標題" 
                        value={tempProduct.title} 
                        onChange={handleModalInputChange} 
                    />
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="rarity" className="form-label">稀有度</label>
                      <select
                        id="rarity"
                        className="form-select"
                        name="rarity"
                        value={tempProduct.rarity}
                        onChange={handleModalInputChange}
                      >
                        {Object.keys(rarityMap).map((key) => (
                          <option key={key} value={key}>
                            {rarityMap[key].label} ({key})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3 col-md-6">
                      <label htmlFor="category" className="form-label">分類 (例如：頭盔、權杖)</label>
                      <input 
                        id="category"
                        type="text" 
                        className="form-control" 
                        name="category"
                        placeholder="請輸入分類"
                        value={tempProduct.category}
                        onChange={handleModalInputChange}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="unit" className="form-label">單位 (貨幣)</label>
                      <input 
                        id="unit"
                        type="text" 
                        className="form-control" 
                        name="unit" 
                        placeholder="請輸入單位" 
                        value={tempProduct.unit} 
                        onChange={handleModalInputChange} 
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="mb-3 col-md-6">
                      <label htmlFor="origin_price" className="form-label">原價</label>
                      <input 
                        id="origin_price"
                        type="number" 
                        className="form-control" 
                        name="origin_price" 
                        placeholder="請輸入原價" 
                        value={tempProduct.origin_price} 
                        onChange={handleNumberChange} 
                      />
                    </div>
                    <div className="mb-3 col-md-6">
                      <label htmlFor="price" className="form-label">售價</label>
                      <input 
                        id="price"
                        type="number" 
                        className="form-control" 
                        name="price" 
                        placeholder="請輸入售價" 
                        value={tempProduct.price} 
                        onChange={handleNumberChange} 
                      />
                    </div>
                  </div>
                  <hr />
                  <div className="mb-3">
                    <label htmlFor="description" className="form-label">產品描述</label>
                    <textarea 
                        id="description"
                        className="form-control" 
                        name="description" 
                        rows="2" 
                        value={tempProduct.description} 
                        onChange={handleModalInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <label htmlFor="content" className="form-label">說明內容</label>
                    <textarea  
                        id="content"
                        className="form-control" 
                        name="content" 
                        rows="2" 
                        value={tempProduct.content} 
                        onChange={handleModalInputChange}
                    ></textarea>
                  </div>
                  <div className="mb-3">
                    <div className="form-check">
                      <input 
                        id="is_enabled"
                        className="form-check-input" 
                        type="checkbox" 
                        name="is_enabled" 
                        checked={!!tempProduct.is_enabled} 
                        onChange={handleModalInputChange} 
                      />
                      <label className="form-check-label" htmlFor="is_enabled">是否啟用</label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
              <button type="button" className="btn btn-primary" onClick={updateProduct}>確認</button>
            </div>
          </div>
        </div>
      </div>

      {/* --- Delete Modal --- */}
      <div className="modal fade" ref={deleteModalRef} tabIndex="-1" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content border-0">
            <div className="modal-header bg-danger text-white">
              <h5 className="modal-title">刪除產品</h5>
              <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div className="modal-body">
              是否刪除 <strong className="text-danger mx-1">{tempProduct.title}</strong> (刪除後將無法恢復)。
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline-secondary" data-bs-dismiss="modal">取消</button>
              <button type="button" className="btn btn-danger" onClick={deleteProduct}>確認刪除</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Week3;