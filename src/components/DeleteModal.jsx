import { useEffect, useRef } from "react";
import * as bootstrap from "bootstrap";

const DeleteModal = ({ isOpen, product, onSoftDelete, onHardDelete, onClose }) => {
  const modalRef = useRef(null);
  const modalInstance = useRef(null);

  useEffect(() => {
    modalInstance.current = new bootstrap.Modal(modalRef.current, { backdrop: 'static' });
  }, []);

  useEffect(() => {
    if (isOpen) modalInstance.current.show();
    else modalInstance.current.hide();
  }, [isOpen]);

  return (
    <div className="modal fade" ref={modalRef} tabIndex="-1">
      <div className="modal-dialog">
        <div className="modal-content border-0">
          <div className="modal-header bg-danger text-white">
            <h5 className="modal-title">刪除確認</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            <p>您打算如何刪除 <strong className="text-danger mx-1">{product?.title}</strong> ？</p>
            <ul className="text-secondary small">
              <li><strong>移至回收桶 (軟刪除)</strong>：資料保留，可隨時還原，但前台看不見。</li>
              <li><strong>永久刪除 (硬刪除)</strong>：資料將從資料庫完全移除，無法復原。</li>
            </ul>
          </div>
          <div className="modal-footer justify-content-between">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>取消</button>
            
            <div className="d-flex gap-2">
              {/* 軟刪除 */}
              <button type="button" className="btn btn-warning text-dark" onClick={onSoftDelete}>
                <i className="bi bi-trash3 me-1"></i> 移至回收桶
              </button>
              
              {/* 硬刪除 */}
              <button type="button" className="btn btn-danger" onClick={onHardDelete}>
                <i className="bi bi-x-circle me-1"></i> 永久刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;