"use client"

const LoadingSpinner = () => {
  return (
    <div className="fixed top-0 left-0 flex items-center justify-center w-full h-full bg-white z-60">
      <div className="relative w-16 h-16 border-8 border-t-8 border-pink-400 border-solid rounded-full animate-spin">
        <div className="absolute inset-0 border-t-8 border-solid rounded-full border-t-blue-100"></div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
