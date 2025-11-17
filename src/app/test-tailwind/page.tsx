export default function TestTailwind() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Tailwind CSS Test Page</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Test Card 1 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Card 1</h2>
            <p className="text-gray-600 mb-4">This card should have a white background with a shadow and padding.</p>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition">
              Click Me
            </button>
          </div>
          
          {/* Test Card 2 */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold mb-4 text-indigo-600">Card 2</h2>
            <p className="text-gray-600 mb-4">This card should also have a white background with a shadow and padding.</p>
            <div className="flex space-x-4">
              <div className="w-12 h-12 bg-red-500 rounded-full"></div>
              <div className="w-12 h-12 bg-green-500 rounded-full"></div>
              <div className="w-12 h-12 bg-blue-500 rounded-full"></div>
            </div>
          </div>
        </div>
        
        {/* Test Alert */}
        <div className="mt-8 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                This is a test alert to verify Tailwind CSS is working properly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}