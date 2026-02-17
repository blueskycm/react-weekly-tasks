import { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CurrencyDisplay from "../../components/CurrencyDisplay";
import Pagination from "../../components/Pagination";

import { rarityMap } from "../../utils/constants";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Products() {
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const formatTitle = (title) => title ? title.replace(/\\n/g, '\n') : "";

  const getProducts = async (page = 1) => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${BASE_URL}/api/${API_PATH}/products?page=${page}`);

      const processedProducts = res.data.products.map(product => {
        try {
          const customData = JSON.parse(product.content);
          const rarityKey = customData.rarity && rarityMap[customData.rarity] ? customData.rarity : 'Normal';
          return {
            ...product,
            rarity: rarityKey,
          };
        } catch (e) {
          return { ...product, rarity: 'Normal' };
        }
      });

      setProducts(processedProducts);

      setPagination(res.data.pagination || {});

    } catch (error) {
      console.error("取得產品列表失敗:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getProducts();
  }, []);

  return (
    <div className="container py-5">
      {isLoading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "200px" }}>
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
        <>
          <h2 className="text-center mb-4">精選商品</h2>
          <div className="row row-cols-1 row-cols-md-2 row-cols-lg-4 g-4">
            {products.map((product) => {
              const rarityConfig = rarityMap[product.rarity] || rarityMap.Normal;

              return (
                <div className="col" key={product.id}>
                  <div className="card h-100 shadow-sm border-0 position-relative">
                    <div className="position-absolute top-0 start-0 m-2">
                      <span
                        className="badge border"
                        style={{
                          backgroundColor: rarityConfig.color,
                          color: rarityConfig.textColor,
                          fontSize: '0.9rem',
                          textShadow: '0 0 2px rgba(0,0,0,0.5)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.3)'
                        }}
                      >
                        {product.category}
                      </span>
                    </div>

                    <img src={product.imageUrl} className="card-img-top" alt={product.title} style={{ height: "200px", objectFit: "contain" }} />
                    <div className="card-body d-flex flex-column">
                      <h5 className="card-title mb-2 text-center" style={{ whiteSpace: 'pre-line' }}>
                        {formatTitle(product.title)}
                      </h5>
                      <p
                        className="card-text text-muted mb-3"
                        style={{
                          whiteSpace: 'pre-line',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis'
                        }}
                      >
                        {formatTitle(product.description)}
                      </p>

                      <div className="mt-auto d-flex justify-content-between align-items-end">
                        <div className="d-flex align-items-center gap-2">
                          {product.origin_price > product.price && (
                            <del className="text-secondary" style={{ fontSize: '0.9rem' }}>
                              {product.origin_price}
                            </del>
                          )}
                          <CurrencyDisplay price={product.price} unit={product.unit} />
                        </div>

                        <Link to={`/week7/products/${product.id}`} className="btn btn-outline-primary stretched-link">
                          查看內容
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="d-flex justify-content-center mt-5">
            {pagination?.total_pages > 1 && (
              <Pagination
                pageInfo={pagination}
                handlePageChange={getProducts}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
}