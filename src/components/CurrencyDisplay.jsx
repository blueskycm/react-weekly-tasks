import { currencyIcons } from "../utils/constants";

const CurrencyDisplay = ({ price, unit }) => {
  const currentUnit = unit || "";

  // 如果找不到圖示，強制轉成 null
  const iconPath = currencyIcons[currentUnit] || null;

  return (
    <span className="d-flex align-items-center justify-content-end">
      <span className="fw-bold">{price}</span>

      {/* 使用三元運算子，確保有真實網址才產出 img 標籤 */}
      {iconPath ? (
        <img
          src={iconPath}
          alt={currentUnit}
          style={{ width: '24px', height: '24px', marginLeft: '6px', marginRight: '2px', objectFit: 'contain' }}
        />
      ) : null}

      <span className="ms-1" style={{ fontSize: '0.9rem' }}>
        {currentUnit}
      </span>
    </span>
  );
};

export default CurrencyDisplay;