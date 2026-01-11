import React, { useState } from 'react';
import { ShoppingCart, User, Lock, ArrowRight } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    // Simulate a tiny delay for the loading animation feel
    await new Promise(r => setTimeout(r, 600));

    const user = await onLogin(credentials.username, credentials.password);
    if (!user) {
      setError('Invalid username or password');
      setCredentials({ ...credentials, password: '' }); // Clear password
      setIsLoading(false);
    }
    // If successful, the parent component usually unmounts this, so no need to set loading false
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      {/* Card Container with Animation */}
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/50 animate-fadeIn backdrop-blur-sm">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="bg-gradient-to-tr from-indigo-100 to-blue-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <ShoppingCart className="w-10 h-10 text-indigo-600 animate-pulse" />
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-blue-600 bg-clip-text text-transparent">
            Welcome Back
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Shop Order System</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Input */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700 gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              Username
            </label>
            <input
              type="text"
              value={credentials.username}
              onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white outline-none"
              placeholder="Enter your username"
              required
            />
          </div>
          
          {/* Password Input */}
          <div className="space-y-2">
            <label className="flex items-center text-sm font-semibold text-gray-700 gap-2">
              <Lock className="w-4 h-4 text-indigo-500" />
              Password
            </label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-gray-50 focus:bg-white outline-none"
              placeholder="Enter your password"
              required
            />
          </div>
          
          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-xl animate-slideDown flex items-center gap-2">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <p className="text-red-600 text-sm font-medium">{error}</p>
            </div>
          )}
          
          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-gradient-to-r from-indigo-600 to-blue-600 text-white py-3.5 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all transform hover:scale-[1.02] flex items-center justify-center gap-2 group ${isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:from-indigo-700 hover:to-blue-700'}`}
          >
            {isLoading ? (
              <span className="animate-pulse">Signing in...</span>
            ) : (
              <>
                Login to Dashboard
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-400">
            Secure System • v1.0.0
          </p>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s cubic-bezier(0.2, 0.8, 0.2, 1);
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Login;