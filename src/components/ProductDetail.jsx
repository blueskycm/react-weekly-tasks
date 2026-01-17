import React from 'react';
import CurrencyDisplay from "./CurrencyDisplay";
import { rarityMap } from "../utils/constants";

const ProductDetail = ({ selectedProduct }) => {
  
  const formatTitle = (title) => title ? title.replace(/\\n/g, '\n') : "";

  return (
    <div className="col-lg-6" style={{ minWidth: 0 }}>
      <div className="card shadow-sm border-0 h-100">
        <div className="card-header bg-transparent border-0 d-flex justify-content-between align-items-center">
          <h4 className="mb-0">商品卡片預覽</h4>
        </div>
        <div className="card-body">
          {selectedProduct ? (
            <div className="card mb-3 w-100 border-secondary">
              <img 
                src={selectedProduct.imageUrl} 
                className="card-img-top primary-image bg-dark" 
                alt={selectedProduct.title} 
                style={{ height: '300px', objectFit: 'contain', width: '100%' }} 
              />
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
  );
};

export default ProductDetail;