import { ColorRing } from 'react-loader-spinner';

export default function LoadingOverlay({ isLoading }) {
  if (!isLoading) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // 半透明黑色背景
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999, // 確保蓋在最上面
        backdropFilter: 'blur(2px)' // 模糊背景效果
      }}
    >
      <div className="text-center">
        <ColorRing
          visible={true}
          height="80"
          width="80"
          ariaLabel="blocks-loading"
          wrapperStyle={{}}
          wrapperClass="blocks-wrapper"
          colors={['#e15b64', '#f47e60', '#f8b26a', '#abbd81', '#849b87']}
        />
        <div className="text-white mt-3 fw-bold">處理中，流亡者請稍候...</div>
      </div>
    </div>
  );
}