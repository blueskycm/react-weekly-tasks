import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div className="text-center py-5">
      <h1>歡迎光臨 阿葆的POE2 商場</h1>
      <p>這裡有最熱門的商品與最棒的購物體驗</p>
      <Link to="/week5/products" className="btn btn-primary mt-3">去逛逛</Link>
    </div>
  );
}