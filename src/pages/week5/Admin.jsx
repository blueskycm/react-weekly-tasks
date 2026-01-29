import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
// 匯入
import ProductModal from "../../components/ProductModal";
import DeleteModal from "../../components/DeleteModal";
import Login from "../../components/Login";
import ProductTable from "../../components/ProductTable";
import ProductDetail from "../../components/ProductDetail";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

function Week5() {
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

  // 軟刪除
  const handleSoftDelete = async () => {
    try {
      const productToTrash = {
        ...tempProduct,
        content: JSON.stringify({
          rarity: tempProduct.rarity,
          quantity: tempProduct.quantity,
          note: tempProduct.content,
          isDeleted: true // 標記為刪除
        })
      };

      // 使用 PUT 更新
      await axios.put(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`, {
        data: productToTrash
      });

      closeModal();
      getData(pageInfo.current_page); // 重新整理
      if (selectedProduct?.id === tempProduct.id) setSelectedProduct(null);
      alert("商品已移至回收桶！(軟刪除)");

    } catch (err) {
      alert("移至回收桶失敗: " + err.message);
    }
  };

  // 硬刪除
  const handleHardDelete = async () => {
    try {
      // 使用 DELETE API 真實刪除
      await axios.delete(`${API_BASE}/api/${API_PATH}/admin/product/${tempProduct.id}`);

      closeModal();
      getData(pageInfo.current_page); // 重新整理
      if (selectedProduct?.id === tempProduct.id) setSelectedProduct(null);
      alert("商品已永久刪除！(硬刪除)");

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
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '80vh' }}>
          <Login formData={formData} handleInputChange={handleInputChange} handleLogin={handleSubmit} />
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
            {/* 左側：商品列表 */}
            <ProductTable
              products={products}
              pageInfo={pageInfo}
              handlePageChange={getData}
              openProductModal={openProductModal}
              openDeleteModal={openDeleteModal}
              selectedProduct={selectedProduct}
              setSelectedProduct={setSelectedProduct}
            />

            {/* 右側：商品細節 */}
            <ProductDetail selectedProduct={selectedProduct} />
          </div>
        </div>
      )}

      {/* --- Modal 元件 --- */}
      <ProductModal isOpen={modalState.isOpen && (modalState.type === 'create' || modalState.type === 'edit')} type={modalState.type} tempProduct={tempProduct} setTempProduct={setTempProduct} updateProduct={updateProduct} onClose={closeModal} />
      <DeleteModal
        isOpen={modalState.isOpen && modalState.type === 'delete'}
        product={tempProduct}
        onSoftDelete={handleSoftDelete}
        onHardDelete={handleHardDelete}
        onClose={closeModal}
      />
    </div>
  );
}

export default Week5;