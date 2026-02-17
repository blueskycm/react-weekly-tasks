import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LoadingOverlay from "../../components/LoadingOverlay";
// 1. 引入 CurrencyDisplay 元件
import CurrencyDisplay from "../../components/CurrencyDisplay";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

export default function Checkout() {
	const [cart, setCart] = useState({});
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	// 接收從購物車傳過來的「計算後金額」與「幣別」
	const location = useLocation();
	const { totalPrice, currency } = location.state || {};

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
					navigate("/week6/products");
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
			// 組合訂單備註：包含遊戲ID、支付幣別、金額
			let finalMessage = `【訂單資訊】\n遊戲ID: ${data.gameId}`;

			if (currency && totalPrice) {
				finalMessage += `\n支付貨幣: ${currency}\n應付金額: ${totalPrice}`;
			}

			// 如果是現金，提示後台檢查匯款
			if (currency === "新台幣") {
				finalMessage += `\n(請確認買家是否已回報末五碼)`;
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
				填寫交易資訊
			</h2>

			<div className="row justify-content-center">
				{/* 左側：訂單摘要 & 付款說明 */}
				<div className="col-md-4 order-md-2 mb-4">

					{/* 1. 訂單摘要卡片 */}
					<div className="card border-secondary shadow-sm mb-3">
						<div className="card-header bg-secondary text-white">
							訂單摘要
						</div>
						<ul className="list-group list-group-flush">
							{cart.carts?.map((item) => (
								<li className="list-group-item d-flex justify-content-between align-items-center lh-sm bg-dark text-light border-secondary" key={item.id}>
									<div className="text-truncate" style={{ maxWidth: '140px' }}>
										<h6 className="my-0">{item.product.title.split('\\n')[0]}</h6>
										<small className="text-muted">數量: {item.qty}</small>
									</div>
									<div className="text-end">
										{/* 2. 這裡改用 CurrencyDisplay 顯示圖示 */}
										<CurrencyDisplay price={item.final_total} unit={item.product.unit} style={{ fontSize: '1rem' }} />
									</div>
								</li>
							))}

							<li className="list-group-item d-flex justify-content-between align-items-center bg-dark text-white border-secondary py-3">
								<span>總計 ({currency || "原始"})</span>
								<div className="text-end">
									{/* 3. 總計顯示邏輯：台幣顯示文字，遊戲幣顯示圖示 */}
									{currency && totalPrice ? (
										currency === "新台幣" ? (
											<strong className="text-success fs-4">NT$ {totalPrice}</strong>
										) : (
											<div className="d-flex align-items-center justify-content-end">
												<CurrencyDisplay
													price={totalPrice}
													unit={currency}
													style={{ fontSize: '1.5rem', fontWeight: 'bold' }}
												/>
											</div>
										)
									) : (
										<strong>{cart.final_total} (未換算)</strong>
									)}
								</div>
							</li>
						</ul>
					</div>

					{/* 2. 付款方式說明卡片 */}
					<div className="card border-info shadow-sm">
						<div className="card-header bg-info text-dark fw-bold">
							<i className="bi bi-info-circle-fill me-2"></i>
							付款與交易方式
						</div>
						<div className="card-body bg-dark text-light border-secondary">
							{currency === "新台幣" ? (
								// --- 現金交易說明 ---
								<div>
									<h6 className="fw-bold text-warning mb-2">銀行匯款</h6>
									<ul className="list-unstyled small mb-3 text-light opacity-75">
										<li><strong>銀行：</strong> 玉山銀行 (808)</li>
										<li><strong>分行：</strong> 東台南分行</li>
										<li><strong>帳號：</strong> 0761-976-056514</li>
										<li><strong>戶名：</strong> 陳宗葆</li>
									</ul>
									<div className="alert alert-dark border-secondary small">
										<p className="mb-1 text-warning">⚠ 匯款完成後：</p>
										<ol className="ps-3 mb-0">
											<li>請在下方留言告知<strong>帳號末五碼</strong>。</li>
											<li>加好友：<strong className="text-info">blueskycm#0594</strong></li>
											<li>前往我的藏身處交易。</li>
										</ol>
									</div>
								</div>
							) : (
								// --- 遊戲幣交易說明 ---
								<div className="text-center py-2">
									<p className="mb-2">請直接在遊戲內進行交易</p>
									<div className="p-2 border border-secondary rounded bg-black mb-2">
										ID: <strong className="text-primary fs-5">blueskycm#0594</strong>
									</div>
									<small className="text-muted d-block">
										請至我的藏身處 (Hideout)
										<br />
										一手交錢，一手交貨。
									</small>
								</div>
							)}
						</div>
					</div>

				</div>

				{/* 右側：表單 */}
				<div className="col-md-8 order-md-1">
					<div className="card border-0 shadow-sm p-4 bg-dark text-light border border-secondary">
						<h4 className="mb-3">流亡者資訊</h4>

						<form onSubmit={handleSubmit(onSubmit)} className="needs-validation">
							<div className="row g-3">

								{/* 4. 新增：遊戲 ID (必填) */}
								<div className="col-12">
									<label htmlFor="gameId" className="form-label text-warning fw-bold">
										<i className="bi bi-controller me-1"></i> 遊戲 ID (Game Tag)
									</label>
									<input
										type="text"
										className={`form-control ${errors.gameId ? "is-invalid" : ""}`}
										id="gameId"
										placeholder="例如: blueskycm#0594"
										{...register("gameId", {
											required: "遊戲 ID 為必填，否則無法交易",
											// 驗證是否有 #
											pattern: {
												value: /^.+#\d+$/,
												message: "格式錯誤，請包含 Tag 編號 (例如 Name#1234)"
											}
										})}
									/>
									{errors.gameId && <div className="invalid-feedback">{errors.gameId.message}</div>}
									<small className="text-muted">請務必確認 ID 正確，以便我們密語您。</small>
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
										{...register("address", { required: "地址為必填" })}
									/>
									{errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
								</div>

								<div className="col-12">
									<label htmlFor="message" className="form-label">留言 / 匯款資訊</label>
									<textarea
										className="form-control"
										id="message"
										rows="3"
										// 動態提示：如果是台幣，提示輸入末五碼
										placeholder={currency === "新台幣" ? "如果是銀行匯款，請務必在此填寫您的【帳號末五碼】..." : "交易備註..."}
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