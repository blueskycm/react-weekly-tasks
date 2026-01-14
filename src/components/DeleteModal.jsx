import { useEffect, useRef } from "react";
import * as bootstrap from "bootstrap";

// 新增 description prop，並給預設值
const DeleteModal = ({ isOpen, product, deleteProduct, onClose, description = "刪除後將無法恢復" }) => {
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
            <h5 className="modal-title">刪除產品</h5>
            <button type="button" className="btn-close btn-close-white" onClick={onClose}></button>
          </div>
          <div className="modal-body">
            {/* 使用傳入的 description */}
            是否刪除 <strong className="text-danger mx-1">{product?.title}</strong> ({description})。
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline-secondary" onClick={onClose}>取消</button>
            <button type="button" className="btn btn-danger" onClick={deleteProduct}>確認刪除</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;