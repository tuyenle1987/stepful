const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 mx-auto"></div>
        <div className="mt-4 text-lg text-gray-700">Loading...</div>
      </div>
    </div>
  );
};

export default Loading;
