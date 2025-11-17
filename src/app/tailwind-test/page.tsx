export default function TailwindTest() {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-blue-600 mb-4 text-center">Tailwind CSS Test</h1>
        <p className="text-gray-700 mb-6 text-center">
          If you can see this text styled correctly, Tailwind CSS is working!
        </p>
        
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="w-16 h-16 bg-red-500 rounded-full mx-auto"></div>
          <div className="w-16 h-16 bg-green-500 rounded-full mx-auto"></div>
          <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto"></div>
        </div>
        
        <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-300">
          Test Button
        </button>
        
        <div className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg">
          <p className="text-yellow-800 text-sm">
            This is a test alert box to verify Tailwind CSS styling.
          </p>
        </div>
      </div>
    </div>
  );
}