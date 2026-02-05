import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import LoadingOverlay from "../../components/LoadingOverlay";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Checkout() {
	const [cart, setCart] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	// 1. 初始化 React Hook Form
	const {
		register, // 用來綁定 input
		handleSubmit, // 用來處理送出
		formState: { errors }, // 取得錯誤訊息
	} = useForm({
		mode: "onTouched", // 當欄位被碰觸後就開始驗證
	});

	// 取得購物車資料 (為了顯示總金額)
	useEffect(() => {
		const getCart = async () => {
			try {
				const res = await axios.get(`${BASE_URL}/api/${API_PATH}/cart`);
				setCart(res.data.data);
				// 如果購物車是空的，踢回賣場
				if (res.data.data.carts.length === 0) {
					alert("購物車是空的，快去買點裝備吧！");
					navigate("/week6/products");
				}
			} catch (error) {
				console.error(error);
			}
		};
		getCart();
	}, [navigate]);

	// 2. 表單送出邏輯
	const onSubmit = async (data) => {
		setIsLoading(true);
		try {
			const orderData = {
				data: {
					user: {
						name: data.name,
						email: data.email,
						tel: data.tel,
						address: data.address,
					},
					message: data.message,
				},
			};

			// 送出訂單 API
			const res = await axios.post(`${BASE_URL}/api/${API_PATH}/order`, orderData);

			// 成功後，通常會清空購物車並導向到付款頁 (或完成頁)
			alert(`訂單建立成功！訂單編號：${res.data.orderId}`);

			// 這裡我們先導回首頁，或是你可以做一個 "Success" 頁面
			navigate("/week6/products");

		} catch (error) {
			alert("建立訂單失敗：" + error.message);
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="container py-5">
			<LoadingOverlay isLoading={isLoading} />

			<h2 className="text-center mb-4">
				<i className="bi bi-card-checklist me-2"></i>
				填寫收件資訊
			</h2>

			<div className="row justify-content-center">
				{/* 左側：訂單摘要 */}
				<div className="col-md-4 order-md-2 mb-4">
					<div className="card border-secondary shadow-sm">
						<div className="card-header bg-secondary text-white">
							訂單摘要
						</div>
						<ul className="list-group list-group-flush">
							{cart.carts?.map((item) => (
								<li className="list-group-item d-flex justify-content-between lh-sm bg-dark text-light border-secondary" key={item.id}>
									<div>
										<h6 className="my-0">{item.product.title.split('\\n')[0]}</h6>
										<small className="text-muted">數量: {item.qty}</small>
									</div>
									<span className="text-light">
										{/* 這裡簡單顯示，如果有 CurrencyDisplay 更好 */}
										{item.final_total} {item.product.unit}
									</span>
								</li>
							))}
							<li className="list-group-item d-flex justify-content-between bg-dark text-white border-secondary">
								<span>總計 (混合單位)</span>
								<strong>{cart.final_total}</strong>
							</li>
						</ul>
					</div>
				</div>

				{/* 右側：結帳表單 */}
				<div className="col-md-8 order-md-1">
					<div className="card border-0 shadow-sm p-4 bg-dark text-light border border-secondary">
						<h4 className="mb-3">藏身處資訊</h4>

						{/* 使用 handleSubmit 包裹 onSubmit */}
						<form onSubmit={handleSubmit(onSubmit)} className="needs-validation">

							<div className="row g-3">
								{/* Email */}
								<div className="col-12">
									<label htmlFor="email" className="form-label">Email</label>
									<input
										type="email"
										className={`form-control ${errors.email ? "is-invalid" : ""}`}
										id="email"
										placeholder="exile@wraeclast.com"
										{...register("email", {
											required: "Email 為必填",
											pattern: {
												value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
												message: "Email 格式不正確",
											},
										})}
									/>
									{errors.email && <div className="invalid-feedback">{errors.email.message}</div>}
								</div>

								{/* 姓名 */}
								<div className="col-12">
									<label htmlFor="name" className="form-label">收件人姓名</label>
									<input
										type="text"
										className={`form-control ${errors.name ? "is-invalid" : ""}`}
										id="name"
										placeholder="流亡者名稱"
										{...register("name", { required: "姓名為必填" })}
									/>
									{errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
								</div>

								{/* 電話 */}
								<div className="col-12">
									<label htmlFor="tel" className="form-label">聯絡電話</label>
									<input
										type="tel"
										className={`form-control ${errors.tel ? "is-invalid" : ""}`}
										id="tel"
										placeholder="請輸入手機號碼"
										{...register("tel", {
											required: "電話為必填",
											minLength: { value: 8, message: "電話號碼至少需要 8 碼" },
											pattern: {
												value: /^\d+$/,
												message: "請輸入純數字",
											},
										})}
									/>
									{errors.tel && <div className="invalid-feedback">{errors.tel.message}</div>}
								</div>

								{/* 地址 */}
								<div className="col-12">
									<label htmlFor="address" className="form-label">收件地址 (藏身處)</label>
									<input
										type="text"
										className={`form-control ${errors.address ? "is-invalid" : ""}`}
										id="address"
										placeholder="奧瑞亞 聖潔大教堂 3號..."
										{...register("address", { required: "地址為必填" })}
									/>
									{errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
								</div>

								{/* 留言 */}
								<div className="col-12">
									<label htmlFor="message" className="form-label">留言 (選填)</label>
									<textarea
										className="form-control"
										id="message"
										rows="3"
										placeholder="交易備註，例如：請線上密我..."
										{...register("message")}
									></textarea>
								</div>
							</div>

							<hr className="my-4 border-secondary" />

							<div className="d-flex justify-content-between">
								<Link to="/week6/cart" className="btn btn-outline-secondary">
									<i className="bi bi-arrow-left"></i> 回購物車
								</Link>
								<button className="btn btn-primary btn-lg" type="submit" disabled={isLoading}>
									送出訂單
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}