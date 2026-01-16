import { useEffect, useRef, useMemo } from "react";
import * as bootstrap from "bootstrap";
import axios from "axios";
import Select from 'react-select';
import { rarityMap, suggestedCategories, currencyIcons } from "../utils/constants";

const API_BASE = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

const ProductModal = ({ isOpen, type, tempProduct, setTempProduct, updateProduct, onClose }) => {
  const modalRef = useRef(null);
  const modalInstance = useRef(null);
  
  // 建立兩個 Ref
  const fileInputRef = useRef(null);
  const uploadTargetRef = useRef("");

  const currencyOptions = useMemo(() => (
    Object.keys(currencyIcons).map(currencyName => ({
      value: currencyName,
      label: currencyName,
      icon: currencyIcons[currencyName]
    }))
  ), []);
  const selectedCurrency = currencyOptions.find(option => option.value === tempProduct.unit);
  const customStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: '#2b3035',
      borderColor: '#495057',
      color: '#fff',
      boxShadow: state.isFocused ? '0 0 0 0.25rem rgba(13, 110, 253, 0.25)' : null,
      '&:hover': { borderColor: '#495057' }
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#2b3035',
      border: '1px solid #495057',
      zIndex: 9999
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#0d6efd' : state.isSelected ? '#0a58ca' : '#2b3035',
      color: state.isFocused || state.isSelected ? '#fff' : '#dee2e6',
      cursor: 'pointer',
      ':active': { backgroundColor: '#0a58ca' }
    }),
    singleValue: (provided) => ({
      ...provided,
      color: '#fff',
      display: 'flex',
      alignItems: 'center'
    }),
    input: (provided) => ({ ...provided, color: '#fff' })
  };
  const formatOptionLabel = ({ label, icon }) => (
    <div className="d-flex align-items-center">
      <img src={icon} alt={label} style={{ width: '20px', height: '20px', marginRight: '8px', objectFit: 'contain' }} />
      <span>{label}</span>
    </div>
  );

  // Modal 初始化
  useEffect(() => {
    modalInstance.current = new bootstrap.Modal(modalRef.current, { backdrop: 'static' });
  }, []);

  useEffect(() => {
    if (isOpen) modalInstance.current.show();
    else modalInstance.current.hide();
  }, [isOpen]);

  // 一般欄位變更處理
  const handleChange = (valueOrEvent, meta) => {
    if (meta && meta.name) {
      const name = meta.name;
      const value = valueOrEvent ? valueOrEvent.value : '';
      setTempProduct(prev => ({ ...prev, [name]: value }));
      return;
    }
    if (valueOrEvent && valueOrEvent.target) {
      const { name, value, type, checked } = valueOrEvent.target;
      let finalValue = value;
      if (type === 'checkbox') finalValue = checked ? 1 : 0;
      else if (type === 'number') finalValue = Number(value);
      setTempProduct(prev => ({ ...prev, [name]: finalValue }));
    }
  };

  // 觸發上傳的函式 (設定目標 -> 點擊隱藏 Input)
  const handleTriggerUpload = (target) => {
    uploadTargetRef.current = target; // 紀錄目標: 'main' 或 0, 1, 2...
    fileInputRef.current.click();     // 觸發點擊
  };

  // 實際執行上傳與驗證
  const uploadFile = async () => {
    const file = fileInputRef.current.files[0];
    if (!file) return;

    // --- 驗證邏輯 ---
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!validTypes.includes(file.type)) {
      alert("格式錯誤：僅限使用 jpg、jpeg 與 png 格式");
      fileInputRef.current.value = ""; // 清空
      return;
    }
    if (file.size > 3 * 1024 * 1024) { // 檢查檔案大小 < 3MB = 3 * 1024 * 1024 bytes
      alert("檔案過大：限制為 3MB 以下");
      fileInputRef.current.value = "";
      return;
    }
    // ----------------

    const formData = new FormData();
    formData.append("file-to-upload", file);

    try {
      const res = await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`, formData);
      const uploadedUrl = res.data.imageUrl;

      // --- 判斷要更新哪裡 ---
      if (uploadTargetRef.current === 'main') {
        // 更新主圖
        setTempProduct(prev => ({ ...prev, imageUrl: uploadedUrl }));
      } else {
        // 更新附圖 (index)
        const index = uploadTargetRef.current;
        const newImages = [...tempProduct.imagesUrl];
        newImages[index] = uploadedUrl;
        setTempProduct(prev => ({ ...prev, imagesUrl: newImages }));
      }

      fileInputRef.current.value = ""; // 清空 input 以便下次能選同檔名
    } catch (err) {
      alert("圖片上傳失敗: " + (err.response?.data?.message || err.message));
    }
  };

  // 附圖：手動輸入網址變更
  const handleImagesChange = (e, index) => {
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;
    setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
  };

  // 附圖：新增欄位
  const handleAddImage = () => {
    const newImages = [...(tempProduct.imagesUrl || []), ""];
    setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
  };

  // 附圖：移除欄位
  const handleRemoveImage = (index) => {
    const newImages = [...tempProduct.imagesUrl];
    newImages.splice(index, 1);
    setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
  };

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1">
      <div className="modal-dialog modal-xl">
        <div className="modal-content border-0">
          <div className="modal-header bg-dark text-white">
            <h5 className="modal-title">{type === 'create' ? '新增產品' : '編輯產品'}</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <div className="row">
              {/* 左側圖片區 */}
              <div className="col-sm-4">
                <input 
                  type="file" 
                  className="d-none" 
                  ref={fileInputRef} 
                  onChange={uploadFile} 
                  accept=".jpg,.jpeg,.png"
                />

                <div className="alert alert-secondary p-2 mb-3" style={{ fontSize: '0.85rem' }}>
                  <i className="bi bi-info-circle me-1"></i>
                  圖片支援網址輸入或上傳。<br/>
                  僅限 <strong>jpg, jpeg, png</strong> 格式，<strong>3MB</strong> 以下。
                </div>

                <div className="mb-4">
                  <h5 className="border-bottom pb-2">主要圖片</h5>
                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">圖片連結</label>
                    <div className="input-group mb-2">
                      <input 
                        id="imageUrl" 
                        type="text" 
                        className="form-control" 
                        name="imageUrl" 
                        placeholder="請輸入主圖連結" 
                        value={tempProduct.imageUrl} 
                        onChange={handleChange}
                      />
                      {/* 呼叫 handleTriggerUpload('main') */}
                      <button className="btn btn-primary" type="button" onClick={() => handleTriggerUpload('main')}>
                        上傳
                      </button>
                    </div>
                    {tempProduct.imageUrl ? <img className="img-fluid rounded" src={tempProduct.imageUrl} alt="主要圖片" /> : <div className="bg-light text-secondary rounded d-flex align-items-center justify-content-center" style={{ height: '200px' }}>尚無圖片</div>}
                  </div>
                </div>
                
                {/* 副圖區塊 */}
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
                        {/* 呼叫 handleTriggerUpload(index) */}
                        <button className="btn btn-outline-primary" type="button" onClick={() => handleTriggerUpload(index)}>
                          上傳
                        </button>
                        <button type="button" className="btn btn-outline-danger" onClick={() => handleRemoveImage(index)}>x</button>
                      </div>
                      {url && <img className="img-fluid rounded mb-2" src={url} alt={`副圖 ${index + 1}`} />}
                    </div>
                  ))}
                  
                  {!tempProduct.imagesUrl?.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] ? 
                    <button className="btn btn-outline-primary btn-sm d-block w-100" onClick={handleAddImage}>新增圖片欄位</button> : 
                    <div className="alert alert-warning py-2 text-center" style={{ fontSize: '0.9rem' }}>請先填寫上方圖片連結</div>
                  }
                </div>
              </div>

              {/* 右側表單區 */}
              <div className="col-sm-8">
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">標題</label>
                  <input id="title" type="text" className="form-control" name="title" placeholder="請輸入標題" value={tempProduct.title} onChange={handleChange} />
                  <div className="form-text text-white-50" style={{ fontSize: '0.85rem' }}>
                    提示：輸入 <code className="text-warning fw-bold">\n</code> 可進行強制換行
                  </div>
                </div>
                <hr />
                
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="rarity" className="form-label">稀有度</label>
                    <select id="rarity" className="form-select" name="rarity" value={tempProduct.rarity} onChange={handleChange}>
                      {Object.keys(rarityMap).map((key) => <option key={key} value={key}>{rarityMap[key].label} ({key})</option>)}
                    </select>
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="category" className="form-label">分類</label>
                    <input id="category" type="text" className="form-control" name="category" placeholder="請輸入分類" value={tempProduct.category} onChange={handleChange} />
                    <div className="mt-2">
                      <small className="text-white-50 text-muted-dark me-2">快速輸入：</small>
                      {suggestedCategories.map((cat) => (
                        <span key={cat} className="badge bg-secondary me-1" style={{ cursor: 'pointer' }} onClick={() => setTempProduct(prev => ({ ...prev, category: cat }))}>{cat}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="unit" className="form-label">單位</label>
                    {/* 改用 inputId 避免 ID 重複警告，並用 handleChange */}
                    <Select
                      inputId="unit" 
                      name="unit"
                      options={currencyOptions}
                      value={selectedCurrency}
                      onChange={handleChange}
                      placeholder="請選擇貨幣單位"
                      formatOptionLabel={formatOptionLabel}
                      styles={customStyles}
                      isSearchable={false}
                    />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="quantity" className="form-label">數量</label>
                    <input id="quantity" type="number" className="form-control" name="quantity" min="0" value={tempProduct.quantity} onChange={handleChange} placeholder="請輸入數量"/>
                  </div>
                </div>

                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="origin_price" className="form-label">原價</label>
                    <input id="origin_price" type="number" className="form-control" name="origin_price" min="0" value={tempProduct.origin_price} onChange={handleChange} />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="price" className="form-label">售價</label>
                    <input id="price" type="number" className="form-control" name="price"  min="0"  value={tempProduct.price} onChange={handleChange} />
                  </div>
                </div>
                <hr />
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">產品描述</label>
                  <textarea id="description" className="form-control" name="description" rows="2" value={tempProduct.description} onChange={handleChange}></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">說明內容</label>
                  <textarea id="content" className="form-control" name="content" rows="2" value={tempProduct.content} onChange={handleChange}></textarea>
                </div>
                <div className="form-text text-white-50" style={{ fontSize: '0.85rem' }}>
                  提示：輸入 <code className="text-warning fw-bold">\n</code> 可進行強制換行
                </div>
                <hr />
                <div className="mb-3">
                  <div className="form-check">
                    <input id="is_enabled" className="form-check-input" type="checkbox" name="is_enabled" checked={!!tempProduct.is_enabled} onChange={handleChange} />
                    <label className="form-check-label" htmlFor="is_enabled">是否啟用</label>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>取消</button>
            <button type="button" className="btn btn-primary" onClick={updateProduct}>確認</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductModal;