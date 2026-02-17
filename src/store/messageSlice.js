import { createSlice } from "@reduxjs/toolkit";

const messageSlice = createSlice({
	name: "message",
	initialState: [],
	reducers: {
		createMessage(state, action) {
			// 如果接收到的是 { success, message } 格式 (來自 Admin.jsx)
			if (action.payload.success !== undefined) {
				const id = Date.now();
				state.push({
					id,
					type: action.payload.success ? 'success' : 'danger',
					text: Array.isArray(action.payload.message)
						? action.payload.message.join('、')
						: action.payload.message,
				});
			} else {
				// 如果接收到的是舊格式 { type, text }
				const id = Date.now();
				state.push({ id, ...action.payload });
			}
		},
		removeMessage(state, action) {
			const index = state.findIndex((item) => item.id === action.payload);
			if (index !== -1) {
				state.splice(index, 1);
			}
		},
	},
});

export const { createMessage, removeMessage } = messageSlice.actions;
export default messageSlice.reducer;