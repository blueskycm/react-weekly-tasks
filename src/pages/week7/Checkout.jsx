import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LoadingOverlay from "../../components/LoadingOverlay";
import CurrencyDisplay from "../../components/CurrencyDisplay";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Checkout() {
	const [cart, setCart] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	// 接收購物車傳來的 "計算後金額" 與 "幣別"
	const location = useLocation();
	const { totalPrice, currency } = location.state || {}; // 若直接輸入網址進來，這些會是 undefined

	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm({
		mode: "onTouched",
	});

	useEffect(() => {
		const getCart = async () => {
			try {
				const res = await axios.get(`${BASE_URL}/api/${API_PATH}/cart`);
				setCart(res.data.data);
				if (res.data.data.carts.length === 0) {
					alert("購物車是空的，快去買點裝備吧！");
					navigate("/week7/products");
				}
			} catch (error) {
				console.error(error);
			}
		};
		getCart();
	}, [navigate]);

	const onSubmit = async (data) => {
		setIsLoading(true);
		try {
			// 組合備註訊息 (因為 API 沒有 gameId 欄位，我們塞在 message 裡)
			// 格式：
			// 【訂單資訊】
			// 遊戲ID: blueskycm#0594
			// 支付方式: 新台幣 / 金額: 500
			let finalMessage = `【訂單資訊】\n遊戲ID: ${data.gameId}`;

			if (currency && totalPrice) {
				finalMessage += `\n支付貨幣: ${currency}\n應付金額: ${totalPrice} (已含手續費/進位)`;
			}

			if (data.message) {
				finalMessage += `\n\n【買家留言】\n${data.message}`;
			}

			const orderData = {
				data: {
					user: {
						name: data.name,
						email: data.email,
						tel: data.tel,
						address: data.address,
					},
					message: finalMessage,
				},
			};

			const res = await axios.post(`${BASE_URL}/api/${API_PATH}/order`, orderData);

			alert(`交易請求已發送！\n請留意遊戲內密語或是 Email 通知。\n\n訂單編號：${res.data.orderId}`);

			navigate("/week7/products");

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
				填寫交易資訊
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
									<div className="text-truncate" style={{ maxWidth: '150px' }}>
										<h6 className="my-0">{item.product.title.split('\\n')[0]}</h6>
										<small className="text-muted">數量: {item.qty}</small>
									</div>
									{/* 這裡顯示原始單價 */}
									<div className="text-end">
										<CurrencyDisplay price={item.total} unit={item.product.unit} style={{ fontSize: '0.9rem' }} />
									</div>
								</li>
							))}

							<li className="list-group-item d-flex justify-content-between align-items-center bg-dark text-white border-secondary py-3">
								<span>總計 ({currency || "混合"})</span>
								<div className="text-end">
									{/* 5. 核心顯示邏輯：根據幣別切換顯示方式 */}
									{currency && totalPrice ? (
										currency === "新台幣" ? (
											// 如果是台幣，顯示 NT$
											<strong className="text-success fs-4">
												NT$ {totalPrice}
											</strong>
										) : (
											// 如果是遊戲幣，使用 CurrencyDisplay 顯示圖示
											<CurrencyDisplay
												price={totalPrice}
												unit={currency}
												style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
											/>
										)
									) : (
										// 如果沒有傳 state 過來 (直接進這頁)，顯示原始混合總計
										<strong>{cart.final_total} (原始)</strong>
									)}
								</div>
							</li>
						</ul>
					</div>
				</div>

				{/* 右側：結帳表單 */}
				<div className="col-md-8 order-md-1">
					<div className="card border-0 shadow-sm p-4 bg-dark text-light border border-secondary">
						<h4 className="mb-3">流亡者資訊</h4>

						<form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
							<div className="row g-3">

								{/* 遊戲 ID (必填) */}
								<div className="col-12">
									<label htmlFor="gameId" className="form-label text-warning fw-bold">
										<i className="bi bi-controller me-1"></i> 遊戲 ID (Game Tag)
									</label>
									<input
										type="text"
										className={`form-control ${errors.gameId ? "is-invalid" : ""}`}
										id="gameId"
										placeholder="例如: blueskycm#0594" // Placeholder 提示
										{...register("gameId", {
											required: "遊戲 ID 為必填，否則無法交易",
											// 可以加個簡單的正則表達式驗證是否有 # (選用)
											pattern: {
												value: /^.+#\d+$/,
												message: "格式錯誤，請包含 Tag 編號 (例如 Name#1234)"
											}
										})}
									/>
									{errors.gameId && <div className="invalid-feedback">{errors.gameId.message}</div>}
									<small className="text-muted">請務必確認 ID 正確，我們將會在遊戲內密語您。</small>
								</div>

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

								<div className="col-12">
									<label htmlFor="name" className="form-label">收件人稱呼</label>
									<input
										type="text"
										className={`form-control ${errors.name ? "is-invalid" : ""}`}
										id="name"
										placeholder="怎麼稱呼您"
										{...register("name", { required: "姓名為必填" })}
									/>
									{errors.name && <div className="invalid-feedback">{errors.name.message}</div>}
								</div>

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

								<div className="col-12">
									<label htmlFor="address" className="form-label">交易地點 (或藏身處)</label>
									<input
										type="text"
										className={`form-control ${errors.address ? "is-invalid" : ""}`}
										id="address"
										defaultValue="我的藏身處 (My Hideout)"
										placeholder="例如: 奧瑞亞, 或是 '我的藏身處'"
										{...register("address", { required: "地址為必填" })}
									/>
									{errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
								</div>

								<div className="col-12">
									<label htmlFor="message" className="form-label">留言 (選填)</label>
									<textarea
										className="form-control"
										id="message"
										rows="3"
										placeholder="交易備註..."
										{...register("message")}
									></textarea>
								</div>
							</div>

							<hr className="my-4 border-secondary" />

							<div className="d-flex justify-content-between">
								<Link to="/week7/cart" className="btn btn-outline-secondary">
									<i className="bi bi-arrow-left"></i> 回購物車
								</Link>
								<button className="btn btn-primary btn-lg" type="submit" disabled={isLoading}>
									送出交易請求
								</button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
}