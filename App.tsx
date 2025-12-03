import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { StockCard } from './components/StockCard';
import { analyzeStock } from './services/geminiService';
import { StockData, LoadingState } from './types';
import { useAuth0 } from "@auth0/auth0-react"; // Note: Auth0 is already imported

const SUGGESTIONS = ['AAPL', 'GOOGL', 'NVDA', 'TSLA', 'MSFT', 'BTC-USD'];

export default function App() {

  const { 
        loginWithRedirect, 
        logout, // ⭐ Destructure the logout function
        isAuthenticated, 
        isLoading 
    } = useAuth0();

  const [ticker, setTicker] = useState('');
  const [stockData, setStockData] = useState<StockData | null>(null);
  const [loading, setLoading] = useState<LoadingState>({ status: 'idle' });

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect();
    }
  }, [isLoading, isAuthenticated, loginWithRedirect]);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!ticker.trim()) return;

    setLoading({ status: 'loading' });
    setStockData(null);

    try {
      const data = await analyzeStock(ticker);
      setStockData(data);
      setLoading({ status: 'success' });
    } catch (error) {
      setLoading({
        status: 'error',
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };

  const handleSuggestionClick = (t: string) => {
    setTicker(t);
    autoSearch(t);
  };

  const autoSearch = async (t: string) => {
    setLoading({ status: 'loading' });
    setStockData(null);
    try {
      const data = await analyzeStock(t);
      setStockData(data);
      setLoading({ status: 'success' });
    } catch (error) {
      setLoading({
        status: 'error',
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  };
  

    const handleLogout = () => {
        logout({ 
            logoutParams: { 
                returnTo: window.location.origin // Directs user back to the app's root URL after logout
            } 
        });
    };

  return (
    <Layout>

      {/* Auth0 is checking session */}
      {isLoading && (
        <div className="text-center text-white py-20">
          Loading...
        </div>
      )}

      {/* Not authenticated? 
          ➝ Auto redirect will happen
          ➝ Just show blank screen */}
      {!isLoading && !isAuthenticated && (
        <div className="text-center text-white py-20">
          Redirecting to login...
        </div>
      )}

      {/* Authenticated ➝ Show Dashboard */}
      {!isLoading && isAuthenticated && (
        <>
          <div className="max-w-3xl mx-auto mb-12 text-center space-y-4">
            <div className="flex justify-between items-center"> {/* ⭐ Added flex container */}
                <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight flex-grow text-center pr-4"> 
                  Market Insight <span className="text-indigo-500">Reimagined</span>
                </h2>

                <button
                    onClick={handleLogout}
                    className="text-sm font-medium px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white transition whitespace-nowrap"
                >
                    Logout
                </button>
            </div>


            <p className="text-slate-400 text-lg">
              Real-time pricing and AI-driven analysis powered by Gemini 2.5
            </p>

            <form onSubmit={handleSearch} className="relative max-w-lg mx-auto mt-8 group">
              <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition"></div>
              <div className="relative flex items-center bg-slate-900 rounded-xl border border-slate-700 shadow-2xl overflow-hidden">
                <input
                  type="text"
                  value={ticker}
                  onChange={(e) => setTicker(e.target.value)}
                  placeholder="Enter ticker (e.g. AAPL)..."
                  className="flex-grow bg-transparent border-none text-white px-6 py-4 text-lg focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={loading.status === 'loading'}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-4 font-semibold disabled:opacity-50"
                >
                  {loading.status === 'loading' ? "Loading..." : "Analyze"}
                </button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => handleSuggestionClick(s)}
                  className="text-xs font-medium px-3 py-1 rounded-full bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white transition border border-slate-700"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 transition-all duration-500">
            {loading.status === 'error' && (
              <div className="max-w-2xl mx-auto p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-200 text-center">
                {loading.message}
              </div>
            )}

            {loading.status === 'idle' && !stockData && (
              <div className="text-center py-20 opacity-50">
                <p className="text-slate-500">Enter a stock ticker to generate a report.</p>
              </div>
            )}

            {stockData && <StockCard data={stockData} />}
          </div>
        </>
      )}
    </Layout>
  );
}