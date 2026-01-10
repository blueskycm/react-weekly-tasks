import { useEffect, useRef } from "react";
import * as bootstrap from "bootstrap";
import { rarityMap, suggestedCategories } from "../utils/constants";

const ProductModal = ({ isOpen, type, tempProduct, setTempProduct, updateProduct, onClose }) => {
  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  useEffect(() => {
    modalInstance.current = new bootstrap.Modal(modalRef.current, { backdrop: 'static' });
  }, []);

  useEffect(() => {
    if (isOpen) modalInstance.current.show();
    else modalInstance.current.hide();
  }, [isOpen]);

  // --- 內部處理函式 (原本在 Week3 的邏輯搬進來) ---
  const handleInputChange = (e) => {
    const { name, value, type: inputType, checked } = e.target;
    setTempProduct(prev => ({
      ...prev,
      [name]: inputType === 'checkbox' ? (checked ? 1 : 0) : value
    }));
  };
  
  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    setTempProduct(prev => ({ ...prev, [name]: Number(value) }));
  }

  const handleImagesChange = (e, index) => {
    const { value } = e.target;
    const newImages = [...tempProduct.imagesUrl];
    newImages[index] = value;
    setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
  };

  const handleAddImage = () => {
    const newImages = [...(tempProduct.imagesUrl || []), ""];
    setTempProduct((prev) => ({ ...prev, imagesUrl: newImages }));
  };

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
                <div className="mb-4">
                  <h5 className="border-bottom pb-2">主要圖片</h5>
                  <div className="mb-3">
                    <label htmlFor="imageUrl" className="form-label">圖片連結</label>
                    <input id="imageUrl" type="text" className="form-control mb-2" name="imageUrl" placeholder="請輸入主圖連結" value={tempProduct.imageUrl} onChange={handleInputChange}/>
                    {tempProduct.imageUrl ? <img className="img-fluid rounded" src={tempProduct.imageUrl} alt="主要圖片" /> : <div className="bg-light text-secondary rounded d-flex align-items-center justify-content-center" style={{ height: '200px' }}>尚無圖片</div>}
                  </div>
                </div>
                 {/* 副圖區塊 (省略重複代碼，請直接貼上您原本的副圖邏輯，記得 handler 改用上面的) */}
                <div>
                  <h5 className="border-bottom pb-2">多圖設置</h5>
                  {Array.isArray(tempProduct.imagesUrl) && tempProduct.imagesUrl.map((url, index) => (
                    <div key={index} className="mb-3">
                      <label htmlFor={`imagesUrl-${index}`} className="form-label">副圖 {index + 1}</label>
                      <div className="input-group mb-2">
                        <input id={`imagesUrl-${index}`} type="text" className="form-control" placeholder={`圖片連結 ${index + 1}`} value={url} onChange={(e) => handleImagesChange(e, index)}/>
                        <button type="button" className="btn btn-outline-danger" onClick={() => handleRemoveImage(index)}>x</button>
                      </div>
                      {url && <img className="img-fluid rounded mb-2" src={url} alt={`副圖 ${index + 1}`} />}
                    </div>
                  ))}
                  {!tempProduct.imagesUrl?.length || tempProduct.imagesUrl[tempProduct.imagesUrl.length - 1] ? 
                    <button className="btn btn-outline-primary btn-sm d-block w-100" onClick={handleAddImage}>新增圖片</button> : 
                    <div className="alert alert-warning py-2 text-center" style={{ fontSize: '0.9rem' }}>請先填寫上方圖片連結</div>
                  }
                </div>
              </div>

              {/* 右側表單區 */}
              <div className="col-sm-8">
                {/* 標題 */}
                <div className="mb-3">
                  <label htmlFor="title" className="form-label">標題</label>
                  <input id="title" type="text" className="form-control" name="title" placeholder="請輸入標題" value={tempProduct.title} onChange={handleInputChange} />
                </div>
                {/* 稀有度與分類 */}
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="rarity" className="form-label">稀有度</label>
                    <select id="rarity" className="form-select" name="rarity" value={tempProduct.rarity} onChange={handleInputChange}>
                      {Object.keys(rarityMap).map((key) => <option key={key} value={key}>{rarityMap[key].label} ({key})</option>)}
                    </select>
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="category" className="form-label">分類</label>
                    <input id="category" type="text" className="form-control" name="category" placeholder="請輸入分類" value={tempProduct.category} onChange={handleInputChange} />
                    <div className="mt-2">
                      <small className="text-muted me-2">快速輸入：</small>
                      {suggestedCategories.map((cat) => (
                        <span key={cat} className="badge bg-secondary me-1" style={{ cursor: 'pointer' }} onClick={() => setTempProduct(prev => ({ ...prev, category: cat }))}>{cat}</span>
                      ))}
                    </div>
                  </div>
                </div>
                {/* 價格與單位 */}
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="unit" className="form-label">單位</label>
                    <input id="unit" type="text" className="form-control" name="unit" value={tempProduct.unit} onChange={handleInputChange} />
                  </div>
                </div>
                <div className="row">
                  <div className="mb-3 col-md-6">
                    <label htmlFor="origin_price" className="form-label">原價</label>
                    <input id="origin_price" type="number" className="form-control" name="origin_price" value={tempProduct.origin_price} onChange={handleNumberChange} />
                  </div>
                  <div className="mb-3 col-md-6">
                    <label htmlFor="price" className="form-label">售價</label>
                    <input id="price" type="number" className="form-control" name="price" value={tempProduct.price} onChange={handleNumberChange} />
                  </div>
                </div>
                <hr />
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">產品描述</label>
                  <textarea id="description" className="form-control" name="description" rows="2" value={tempProduct.description} onChange={handleInputChange}></textarea>
                </div>
                <div className="mb-3">
                  <label htmlFor="content" className="form-label">說明內容</label>
                  <textarea id="content" className="form-control" name="content" rows="2" value={tempProduct.content} onChange={handleInputChange}></textarea>
                </div>
                <div className="mb-3">
                  <div className="form-check">
                    <input id="is_enabled" className="form-check-input" type="checkbox" name="is_enabled" checked={!!tempProduct.is_enabled} onChange={handleInputChange} />
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