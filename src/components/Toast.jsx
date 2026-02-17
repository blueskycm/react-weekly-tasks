import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { removeMessage } from "../store/messageSlice";

export default function Toast() {
	const messages = useSelector((state) => state.message);
	const dispatch = useDispatch();

	return (
		<div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 1500 }}>
			{messages.map((msg) => (
				<div
					key={msg.id}
					className={`toast show align-items-center text-white bg-${msg.type === 'success' ? 'success' : 'danger'} border-0 mb-2`}
					role="alert"
					aria-live="assertive"
					aria-atomic="true"
				>
					<div className="d-flex">
						<div className="toast-body">
							{msg.type === 'success' ? <i className="bi bi-check-circle me-2"></i> : <i className="bi bi-x-circle me-2"></i>}
							{msg.text}
						</div>
						<button
							type="button"
							className="btn-close btn-close-white me-2 m-auto"
							onClick={() => dispatch(removeMessage(msg.id))}
							aria-label="Close"
						></button>
					</div>
				</div>
			))}
		</div>
	);
}