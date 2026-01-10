import { currencyIcons } from "../utils/constants"; // 引入剛剛拆出去的設定

const CurrencyDisplay = ({ price, unit }) => {
  const currentUnit = unit || "";
  const iconPath = currencyIcons[currentUnit];

  return (
    <span className="d-flex align-items-center justify-content-end">
      <span className="fw-bold">{price}</span>
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

export default CurrencyDisplay;