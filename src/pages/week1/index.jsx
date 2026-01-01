import { useState } from 'react';

function Week1() {
  // 產品資料
  const products = [
    {
      category: "胸甲",
      content: "福爾驍勇善戰，登基稱王。\n奈何治國無方，終至滅亡。",
      description: "護甲值: 577\n能量護盾: 201\n需求 等級 59, 52 力量, 52 智慧\n增加 194%護甲值和能量護盾\n減少 25% 最大魔力\n+17% 混沌抗性\n暴擊時有 25% 機率獲得一個暴擊球",
      id: "-L9tH8jxVb2Ka_DYPwng",
      is_enabled: 1,
      origin_price: 500,
      price: 400,
      rarity: "Unique",
      title: "福爾的戰鎧\n鎧甲法衣",
      unit: "崇高石",
      num: 10,
      imageUrl: "images/VollsProtector.png",
      imagesUrl: [
        "images/vols-detail-1.jpg",
      ],
    },
    {
      category: "魔符",
      content: "",
      description: "物理傷害: 474 到 848\n暴擊率: 8.00%\n每秒攻擊次數: 1.25\n需求 等級 79, 100 力量, 67 智慧\n增加 36%物理傷害\n命定: 增加 40%完全破甲的效果\n+12 層最大盛怒\n增加 244%物理傷害\n+182 命中值\n+27 點力量\n以 9.08% 物理傷害偷取生命\n以 8.14% 物理傷害偷取魔力\n附加 43 至 72 物理傷害",
      id: "-McJ-VvcwfN1_Ye_NtVA",
      is_enabled: 1,
      origin_price: 120,
      price: 100,
      rarity: "Rare",
      title: "遺忘模仿\n聖賢魔符",
      unit: "神聖石",
      num: 1,
      imageUrl: "images/聖賢魔符.png",
      imagesUrl: [
        "images/遺忘模仿聖賢魔符-detail-1.jpg",
      ],
    },
    {
      category: "頭盔",
      content: "冰霜嚴寒，他的赤足傷痕佈滿，\n雷霆萬鈞，他的心念無法動彈，\n惡火猛烈，情人容顏化為飛灰，\n此時他才終於奮起復仇，猛攻不退。\n - 薩恩的維多里奧著作「獵龍記」",
      description: "閃避值: 126\n能量護盾: 51\n需求 等級 45, 36 敏捷, 36 智慧\n增加 45%閃避和能量護盾\n+10% 全元素抗性\n擊中造成的火焰傷害貢獻至感電機率，而非易燃和點燃幅度\n擊中造成的冰冷傷害貢獻至易燃和點燃幅度，而非冰緩幅度或冰凍累積\n擊中的閃電傷害貢獻至冰凍累積，而非感電機率",
      id: "-McJ-VyqaFlLzUMmpPpm",
      is_enabled: 1,
      origin_price: 2,
      price: 1,
      rarity: "Unique",
      title: "三龍戰紀\n堅固之面",
      unit: "混沌石",
      num: 15,
      imageUrl: "images/TheThreeDragons.png",
      imagesUrl: [
        "images/三龍戰紀堅固之面-detail-1.jpg",
      ],
    },
  ];

  // 定義稀有度對照表
  const rarityMap = {
    Normal: { label: "一般", color: "#C8C8C8", textColor: "#000" }, // 白裝
    Magic:  { label: "魔法", color: "#8888FF", textColor: "#FFF" }, // 藍裝
    Rare:   { label: "稀有", color: "#FFFF77", textColor: "#000" }, // 黃裝
    Unique: { label: "傳奇", color: "#AF6025", textColor: "#FFF" }  // 橘裝
  };
  // 定義貨幣圖示
  const currencyIcons = {
    "崇高石": "images/崇高石.png",
    "神聖石": "images/神聖石.png",
    "混沌石": "images/混沌石.png"
  };
  const CurrencyDisplay = ({ price, unit }) => {
    const iconPath = currencyIcons[unit];
    return (
      <span className="d-flex align-items-center justify-content-end">
        {price}
        {iconPath && (
          <img 
            src={iconPath} 
            alt={unit} 
            style={{ width: '24px', height: '24px', marginLeft: '6px', marginRight: '2px' }} 
          />
        )}
        {unit}
      </span>
    );
  };

  // 使用者點了哪個產品
  const [tempProduct, setTempProduct] = useState(null);

  const currentRarity = tempProduct 
    ? (rarityMap[tempProduct.rarity] || rarityMap.Normal) 
    : rarityMap.Normal;

  return (
    <div className="container-fluid mt-5 px-3 px-lg-5">
      <div className="row align-items-start">
        {/* 左側：產品列表 */}
        <div className="col-12 col-lg-7" style={{ minWidth: 0 }}>
          <h2 className="mb-3">商品列表</h2>
          <div className="table-responsive">
            <table className="table table-hover align-middle w-100" style={{ tableLayout: 'fixed' }}>
              <thead>
                <tr>
                  <th scope="col" className="text-nowrap">商品名稱</th>
                  <th scope="col" className="text-end text-nowrap">原價</th>
                  <th scope="col" className="text-end text-nowrap">售價</th>
                  <th scope="col" className="text-end text-nowrap">是否啟用</th>
                  <th scope="col" className="text-end text-nowrap">查看細節</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item) => (
                  <tr key={item.id}>
                    <td className="text-nowrap">{item.title}</td>
                    <td className="text-end text-nowrap">
                      <CurrencyDisplay price={item.origin_price} unit={item.unit} />
                    </td>
                    <td className="text-end text-nowrap">
                      <CurrencyDisplay price={item.price} unit={item.unit} />
                    </td>
                    <td className="text-end text-nowrap">
                      {item.is_enabled ? (
                        <span className="text-success fw-bold">啟用</span>
                      ) : (
                        <span>未啟用</span>
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      {/* 點擊按鈕，更新 tempProduct */}
                      <button className="btn btn-primary btn-sm" onClick={() => setTempProduct(item)}>
                        查看細節
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 右側：產品細節 */}
        <div className="col-12 col-lg-5" style={{ minWidth: 0 }}>
          <h2 className="mb-3">單一物品細節</h2>
          {tempProduct ? (
            <div className="card mb-3 w-100">
              <img src={tempProduct.imageUrl} className="card-img-top primary-image" alt={tempProduct.title} style={{ height: '200px', objectFit: 'contain', width: '100%' }}/>
              <div className="card-body">
                <h5 className="card-title mb-2">
                  <div style={{ whiteSpace: 'pre-line' }}>
                    {tempProduct.title}
                  </div>
                  <span className="badge ms-2" style={{ backgroundColor: currentRarity.color, color: currentRarity.textColor, border: '1px solid #333'}}>
                    {tempProduct.category}
                  </span>
                </h5>

                <p className="card-text">
                  物品稀有度：
                  <span style={{ color: currentRarity.color, fontWeight: 'bold' }}>{currentRarity.label}</span>
                </p>
                <p className="card-text" style={{ whiteSpace: 'pre-line' }}>物品描述：{'\n'}{tempProduct.description}</p>
                <p className="card-text" style={{ whiteSpace: 'pre-line' }}>額外說明：{'\n'}{tempProduct.content}</p>
                <div className="d-flex">
                  <p className="card-text">售價：</p>
                  <p className="card-text text-secondary">
                    <del>{tempProduct.origin_price}</del>
                  </p>
                  <p className="card-text ms-2 fw-bold">
                    <CurrencyDisplay price={tempProduct.price} unit={tempProduct.unit} />
                  </p>
                </div>
              </div>
              <div className="card-footer d-flex flex-wrap">
                {tempProduct.imagesUrl?.map((url, index) => (
                  <img 
                  key={url} 
                  src={url} 
                  alt={`${tempProduct.title} ${index + 1}`} 
                  className="img-thumbnail me-2" 
                  style={{ height: '100px', width: 'auto' }}
                  />
                ))}
              </div>
            </div>
            ) : (
            <div className="alert alert-secondary w-100">
              請選擇一個商品查看
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Week1;