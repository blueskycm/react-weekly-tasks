import React from 'react';
import CurrencyDisplay from "./CurrencyDisplay";
import Pagination from "./Pagination";
import { rarityMap } from "../utils/constants";

const ProductTable = ({ 
  products, 
  pageInfo, 
  handlePageChange, 
  openProductModal, 
  openDeleteModal, 
  selectedProduct, 
  setSelectedProduct 
}) => {
  
  // 格式化
  const formatTitle = (title) => title ? title.replace(/\\n/g, '\n') : "";

  return (
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
      
      {/* 分頁資訊與元件 */}
      <p className="text-white-50 text-muted-dark mb-3">
        本頁顯示 {products.length} 筆資料，
        <span className="ms-2">
          第 {pageInfo.current_page || 1} 頁 / 共 {pageInfo.total_pages || 1} 頁
        </span>
      </p>
      <div className="d-flex justify-content-center mt-4">
        <Pagination pageInfo={pageInfo} handlePageChange={handlePageChange} />
      </div>
    </div>
  );
};

export default ProductTable;