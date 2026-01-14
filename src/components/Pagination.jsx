import React from 'react';

const Pagination = ({ pageInfo, handlePageChange }) => {
  return (
    <div className="d-flex justify-content-center">
      <nav>
        <ul className="pagination pagination-dark">
          {/* 上一頁按鈕 */}
          <li className={`page-item ${!pageInfo.has_pre && 'disabled'}`}>
            <a 
              className="page-link" 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (pageInfo.has_pre) {
                  handlePageChange(pageInfo.current_page - 1);
                }
              }}
            >
              上一頁
            </a>
          </li>

          {/* 頁碼按鈕迴圈 */}
          {Array.from({ length: pageInfo.total_pages }).map((_, index) => (
            <li 
              key={index} 
              className={`page-item ${pageInfo.current_page === index + 1 && 'active'}`}
            >
              <a 
                className="page-link" 
                href="#" 
                onClick={(e) => {
                  e.preventDefault();
                  handlePageChange(index + 1);
                }}
              >
                {index + 1}
              </a>
            </li>
          ))}

          {/* 下一頁按鈕 */}
          <li className={`page-item ${!pageInfo.has_next && 'disabled'}`}>
            <a 
              className="page-link" 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                if (pageInfo.has_next) {
                  handlePageChange(pageInfo.current_page + 1);
                }
              }}
            >
              下一頁
            </a>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Pagination;