import { configureStore } from "@reduxjs/toolkit";
import messageReducer from "./messageSlice";

export const store = configureStore({
	reducer: {
		message: messageReducer, // 這裡註冊了 message slice
	},
});