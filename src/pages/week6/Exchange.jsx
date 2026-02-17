import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import CurrencyDisplay from "../../components/CurrencyDisplay";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_EXCHANGE_API;

export default function Exchange() {
	const [activeTab, setActiveTab] = useState("budget");
	const [rates, setRates] = useState({});
	const [isLoading, setIsLoading] = useState(true);

	// 模式 A：預算分配
	const [budget, setBudget] = useState({ amount: 100, unit: "新台幣" });
	const [wishlist, setWishlist] = useState([
		{ id: 1, amount: 10, unit: "神聖石" },
		{ id: 2, amount: 2000, unit: "崇高石" },
	]);
	const [remainderUnit, setRemainderUnit] = useState("混沌石");

	// 模式 B：資產整合
	const [assets, setAssets] = useState([
		{ id: 1, amount: 2000, unit: "崇高石" },
		{ id: 2, amount: 1500, unit: "混沌石" },
	]);
	const [targetUnit, setTargetUnit] = useState("神聖石");

	useEffect(() => {
		const getRates = async () => {
			setIsLoading(true);
			try {
				const res = await axios.get(`${BASE_URL}/api/${API_PATH}/products/all`);
				const products = res.data.products;

				const newRates = { "崇高石": 1 };
				const divine = products.find(p => p.title === "神聖石");
				const chaos = products.find(p => p.title === "混沌石");
				const ntd = products.find(p => p.title === "新台幣");

				if (divine) newRates["神聖石"] = divine.price;
				if (chaos) newRates["混沌石"] = chaos.price;
				if (ntd) newRates["新台幣"] = ntd.price;

				setRates(newRates);
			} catch (error) {
				console.error("取得匯率失敗", error);
			} finally {
				setIsLoading(false);
			}
		};
		getRates();
	}, []);

	// 通用清單操作
	const updateRow = (setList, id, field, value) => {
		setList(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
	};
	const addRow = (setList) => {
		setList(prev => [...prev, { id: Date.now(), amount: 0, unit: "混沌石" }]);
	};
	const removeRow = (setList, id) => {
		setList(prev => prev.filter(item => item.id !== id));
	};

	// 取得 該單位等於多少崇高石 的匯率
	const getRateToBase = (unit) => {
		if (!rates["神聖石"]) return 0;

		// 特殊處理：新台幣
		if (unit === "新台幣") {
			// 1 神聖石 = 800 崇高石
			// 1 神聖石 = 5 台幣
			// => 5 台幣 = 800 崇高石 => 1 台幣 = 800 / 5 = 160 崇高石
			const ntdRate = rates["新台幣"] || 1;
			return rates["神聖石"] / ntdRate;
		}

		// 一般遊戲通貨 (直接回傳設定檔的崇高石價格)
		return rates[unit] || 0;
	};


	// 計算預算模式結果
	const budgetResult = useMemo(() => {
		if (!rates["崇高石"]) return { isDeficit: false, totalBudgetBase: 0, totalCostBase: 0, remainingTargetAmount: 0 };

		// 總預算 (換算成崇高石)
		const totalBudgetBase = budget.amount * getRateToBase(budget.unit);

		// 願望清單總花費 (換算成崇高石)
		const totalCostBase = wishlist.reduce((sum, item) => {
			return sum + (item.amount * getRateToBase(item.unit));
		}, 0);

		// 剩餘價值 (崇高石)
		const remainingBase = totalBudgetBase - totalCostBase;

		// 換算成剩餘目標單位
		const targetRate = getRateToBase(remainderUnit) || 1;
		const remainingTargetAmount = remainingBase / targetRate;

		return {
			totalBudgetBase,
			totalCostBase,
			remainingBase,
			remainingTargetAmount,
			isDeficit: remainingBase < 0
		};
	}, [budget, wishlist, remainderUnit, rates]);

	// 計算資產整合結果
	const swapResult = useMemo(() => {
		if (!rates["崇高石"]) return { finalAmount: 0, floorAmount: 0, remainderInTarget: 0 };

		// 所有資產轉為 Base
		const totalAssetsBase = assets.reduce((sum, item) => {
			return sum + (item.amount * getRateToBase(item.unit));
		}, 0);

		// 換算成目標單位
		const targetRate = getRateToBase(targetUnit) || 1;
		const finalAmount = totalAssetsBase / targetRate;

		const floorAmount = Math.floor(finalAmount);
		const remainderDecimal = finalAmount - floorAmount;
		const remainderInTarget = remainderDecimal;

		return {
			totalAssetsBase,
			finalAmount,
			floorAmount,
			remainderInTarget
		};
	}, [assets, targetUnit, rates]);


	return (
		<div className="container py-5">
			<h2 className="text-center mb-4 text-warning">
				<i className="bi bi-briefcase me-2"></i>
				資產配置計算機
			</h2>

			{/* 分頁切換 */}
			<ul className="nav nav-pills justify-content-center mb-4">
				<li className="nav-item">
					<button
						className={`nav-link px-4 ${activeTab === 'budget' ? 'active bg-primary' : 'bg-dark text-white'}`}
						onClick={() => setActiveTab('budget')}
					>
						<i className="bi bi-list-check me-2"></i> 預算分配
					</button>
				</li>
				<li className="nav-item mx-2">
					<button
						className={`nav-link px-4 ${activeTab === 'swap' ? 'active bg-success' : 'bg-dark text-white'}`}
						onClick={() => setActiveTab('swap')}
					>
						<i className="bi bi-arrow-repeat me-2"></i> 資產整合
					</button>
				</li>
			</ul>

			{/* 匯率看板 */}
			<div className="text-center mb-4 text-muted small">
				目前匯率：1 神聖石 = {rates["神聖石"]} 崇高石 | 1 混沌石 = {rates["混沌石"]} 崇高石 | 1 神聖石 = NT$ {rates["新台幣"]}
			</div>

			{activeTab === 'budget' ? (
				// --- 預算分配介面 ---
				<div className="card shadow border-secondary bg-dark text-light">
					<div className="card-header bg-primary text-white">
						<h5 className="mb-0">我要用這筆預算，買這些東西</h5>
					</div>
					<div className="card-body">

						<div className="mb-4 pb-3 border-bottom border-secondary">
							<label className="form-label text-warning">1. 您有多少預算？</label>
							<div className="input-group">
								<input
									type="number" className="form-control bg-black text-white border-secondary"
									value={budget.amount} onChange={(e) => setBudget({ ...budget, amount: Number(e.target.value) })}
								/>
								<select
									className="form-select bg-secondary text-white border-secondary" style={{ maxWidth: '120px' }}
									value={budget.unit} onChange={(e) => setBudget({ ...budget, unit: e.target.value })}
								>
									{Object.keys(rates).map(u => <option key={u} value={u}>{u}</option>)}
								</select>
							</div>
						</div>

						<div className="mb-4">
							<div className="d-flex justify-content-between align-items-center mb-2">
								<label className="form-label text-info mb-0">2. 您想買什麼？ (願望清單)</label>
								<button className="btn btn-sm btn-outline-light" onClick={() => addRow(setWishlist)}>
									<i className="bi bi-plus-lg"></i> 新增物品
								</button>
							</div>

							{wishlist.map((item, idx) => (
								<div key={item.id} className="input-group mb-2">
									<span className="input-group-text bg-dark text-muted border-secondary">#{idx + 1}</span>
									<input
										type="number" className="form-control bg-black text-white border-secondary" placeholder="數量"
										value={item.amount} onChange={(e) => updateRow(setWishlist, item.id, 'amount', Number(e.target.value))}
									/>
									<select
										className="form-select bg-dark text-white border-secondary"
										value={item.unit} onChange={(e) => updateRow(setWishlist, item.id, 'unit', e.target.value)}
									>
										{Object.keys(rates).map(u => <option key={u} value={u}>{u}</option>)}
									</select>
									<button className="btn btn-outline-danger" onClick={() => removeRow(setWishlist, item.id)}>
										<i className="bi bi-trash"></i>
									</button>
								</div>
							))}
						</div>

						<div className={`alert ${budgetResult.isDeficit ? 'alert-danger' : 'alert-success'} border-0`}>
							<div className="d-flex justify-content-between align-items-center">
								<div>
									<h6 className="fw-bold mb-1">
										{budgetResult.isDeficit ? "⚠️ 預算不足 (透支)" : "🎉 預算充足，剩下："}
									</h6>
									<div className="d-flex align-items-center mt-2">
										<span className="fs-2 fw-bold me-2">
											{Math.abs(budgetResult.remainingTargetAmount).toFixed(1)}
										</span>
										<select
											className="form-select form-select-sm bg-transparent border-dark fw-bold text-dark"
											style={{ width: 'auto', minWidth: '100px' }}
											value={remainderUnit} onChange={(e) => setRemainderUnit(e.target.value)}
										>
											{Object.keys(rates).map(u => <option key={u} value={u}>{u}</option>)}
										</select>
									</div>
								</div>
								<div className="text-end text-muted small">
									<div>預算價值: {budgetResult.totalBudgetBase.toFixed(0)} 崇</div>
									<div>購物總價: {budgetResult.totalCostBase.toFixed(0)} 崇</div>
								</div>
							</div>
						</div>

					</div>
				</div>
			) : (
				// --- 資產整合介面 ---
				<div className="card shadow border-secondary bg-dark text-light">
					<div className="card-header bg-success text-white">
						<h5 className="mb-0">我要把這些雜物，全部換成同一種</h5>
					</div>
					<div className="card-body">

						<div className="mb-4">
							<div className="d-flex justify-content-between align-items-center mb-2">
								<label className="form-label text-warning mb-0">1. 您持有什麼資產？</label>
								<button className="btn btn-sm btn-outline-light" onClick={() => addRow(setAssets)}>
									<i className="bi bi-plus-lg"></i> 新增資產
								</button>
							</div>

							{assets.map((item, idx) => (
								<div key={item.id} className="input-group mb-2">
									<span className="input-group-text bg-dark text-muted border-secondary">資產 {idx + 1}</span>
									<input
										type="number" className="form-control bg-black text-white border-secondary"
										value={item.amount} onChange={(e) => updateRow(setAssets, item.id, 'amount', Number(e.target.value))}
									/>
									<select
										className="form-select bg-dark text-white border-secondary"
										value={item.unit} onChange={(e) => updateRow(setAssets, item.id, 'unit', e.target.value)}
									>
										{Object.keys(rates).map(u => <option key={u} value={u}>{u}</option>)}
									</select>
									<button className="btn btn-outline-danger" onClick={() => removeRow(setAssets, item.id)}>
										<i className="bi bi-trash"></i>
									</button>
								</div>
							))}
						</div>

						<div className="mb-4 pb-3 border-bottom border-secondary">
							<label className="form-label text-info">2. 您想換成什麼？</label>
							<select
								className="form-select bg-black text-white border-secondary"
								value={targetUnit} onChange={(e) => setTargetUnit(e.target.value)}
							>
								{Object.keys(rates).map(u => <option key={u} value={u}>{u}</option>)}
							</select>
						</div>

						<div className="alert alert-secondary bg-dark border border-success text-light">
							<h6 className="text-success fw-bold">計算結果：</h6>
							<div className="row align-items-center mt-3">
								<div className="col-12 text-center">
									<p className="mb-0 text-muted">總價值約等於</p>
									<h2 className="text-warning fw-bold my-2">
										{swapResult.finalAmount.toFixed(4)} <small className="fs-6 text-white">{targetUnit}</small>
									</h2>
								</div>
							</div>

							<hr className="border-secondary" />

							<div className="d-flex justify-content-center gap-3">
								<div className="text-center p-2 border border-secondary rounded">
									<span className="d-block text-muted small">可兌換整數</span>
									<span className="fs-4 fw-bold">{swapResult.floorAmount}</span>
									<CurrencyDisplay price={0} unit={targetUnit} style={{ fontSize: '0px' }} />
								</div>
								<div className="d-flex align-items-center text-muted">+</div>
								<div className="text-center p-2 border border-secondary rounded">
									<span className="d-block text-muted small">剩餘殘值</span>
									<span className="fs-4 fw-bold">{swapResult.remainderInTarget.toFixed(3)}</span>
									<CurrencyDisplay price={0} unit={targetUnit} style={{ fontSize: '0px' }} />
								</div>
							</div>
						</div>

					</div>
				</div>
			)}

			<div className="text-center mt-4">
				<Link to="/week6/products" className="btn btn-outline-secondary">
					<i className="bi bi-arrow-left me-2"></i> 返回市集
				</Link>
			</div>

		</div>
	);
}