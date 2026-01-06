import React, { useState, useEffect } from 'react';
import { RefreshCcw, Scale, DollarSign, Loader2, AlertCircle, ArrowLeftRight } from 'lucide-react';

const App = () => {
  const [inputValue, setInputValue] = useState('');
  const [isWeightMode, setIsWeightMode] = useState(false);
  const [isInverted, setIsInverted] = useState(false); // false: ILS->CAD, true: CAD->ILS
  const [resultValue, setResultValue] = useState(0);
  const [rate, setRate] = useState(0.4366); // 1 ILS = X CAD
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Constants
  const KG_TO_LB = 2.20462;
  const API_URL = 'https://api.frankfurter.dev/v1/latest?base=ILS&symbols=CAD';

  const fetchRate = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error('Failed to fetch rates');
      const data = await response.json();
      setRate(data.rates.CAD);
    } catch (err) {
      console.error(err);
      setError('Could not update live rate. Using fallback.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRate();
  }, []);

  useEffect(() => {
    const amount = parseFloat(inputValue) || 0;
    
    if (!isInverted) {
      if (isWeightMode) {
        setResultValue((amount * rate) / KG_TO_LB);
      } else {
        setResultValue(amount * rate);
      }
    } else {
      const inverseRate = 1 / rate;
      if (isWeightMode) {
        setResultValue((amount * KG_TO_LB) * inverseRate);
      } else {
        setResultValue(amount * inverseRate);
      }
    }
  }, [inputValue, isWeightMode, isInverted, rate]);

  const handleFlip = () => setIsInverted(!isInverted);
  const handleClear = () => setInputValue('');

  const sourceCurrency = isInverted ? 'CAD' : 'ILS';
  const targetCurrency = isInverted ? 'ILS' : 'CAD';
  const sourceSymbol = isInverted ? '$' : '₪';
  const targetSymbol = isInverted ? '₪' : '$';
  const sourceWeightUnit = isInverted ? 'lb' : 'kg';
  const targetWeightUnit = isInverted ? 'kg' : 'lb';

  const displayRate = isInverted ? (1 / rate).toFixed(4) : rate.toFixed(4);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <div className="w-full max-w-md bg-slate-50 dark:bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="bg-slate-900 dark:bg-indigo-950 p-6 text-white text-center relative">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            Price Converter
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1 text-slate-400 dark:text-indigo-200 text-sm font-medium">
            <span>{sourceCurrency}</span>
            <ArrowLeftRight size={14} className="opacity-50" />
            <span>{targetCurrency}</span>
          </div>
          
          <button 
            onClick={() => fetchRate()}
            disabled={isLoading}
            className="absolute right-4 top-6 p-2 rounded-full hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCcw className="w-5 h-5" />}
          </button>
        </div>

        {error && (
          <div className="bg-amber-50 dark:bg-amber-950/30 border-b border-amber-100 dark:border-amber-900/50 px-4 py-2 flex items-center gap-2 text-amber-700 dark:text-amber-400 text-xs">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="p-8 space-y-6">
          
          {/* Controls: Mode & Flip */}
          <div className="space-y-3">
            <div className="flex bg-slate-200 dark:bg-slate-800 p-1 rounded-2xl">
              <button 
                onClick={() => setIsWeightMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${!isWeightMode ? 'bg-white dark:bg-slate-700 shadow-sm font-bold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <DollarSign size={18} />
                Total
              </button>
              <button 
                onClick={() => setIsWeightMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl transition-all ${isWeightMode ? 'bg-white dark:bg-slate-700 shadow-sm font-bold text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}`}
              >
                <Scale size={18} />
                Weight
              </button>
            </div>

            <button 
              onClick={handleFlip}
              className="w-full flex items-center justify-center gap-2 py-3 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 transition-colors text-sm font-semibold shadow-sm"
            >
              <ArrowLeftRight size={16} />
              Switch Direction
            </button>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest block ml-1">
              Input Price ({sourceSymbol}) {isWeightMode ? `per ${sourceWeightUnit}` : ''}
            </label>
            <div className="relative group">
              <span className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-600 text-2xl font-light">
                {sourceSymbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0.00"
                className="w-full pl-12 pr-6 py-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-400 focus:ring-4 focus:ring-indigo-500/10 rounded-[1.5rem] text-3xl font-medium outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-700"
              />
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-white dark:bg-slate-800 rounded-[1.5rem] p-6 border border-slate-200 dark:border-slate-700 text-center shadow-sm">
            <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mb-2">
              Result in {targetCurrency}
            </p>
            <div className="text-5xl font-bold text-slate-900 dark:text-white tracking-tight">
              {targetSymbol}{resultValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xl text-slate-400 dark:text-slate-600 font-medium ml-2">
                {isWeightMode ? `/ ${targetWeightUnit}` : ''}
              </span>
            </div>
          </div>

          {/* Detailed Info Card */}
          <div className="bg-slate-200/50 dark:bg-slate-950/50 rounded-2xl p-4 space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 dark:text-slate-400">Exchange Rate</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
                1 {sourceCurrency} = {displayRate} {targetCurrency}
              </span>
            </div>
            {isWeightMode && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500 dark:text-slate-400">Weight Standard</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300">1 kg = 2.2046 lb</span>
              </div>
            )}
            <button 
              onClick={handleClear}
              className="w-full pt-2 text-indigo-600 dark:text-indigo-400 font-bold text-xs uppercase tracking-widest hover:opacity-80 transition-opacity"
            >
              Clear All
            </button>
          </div>

        </div>

        <div className="bg-slate-100 dark:bg-slate-900/50 p-4 text-center border-t border-slate-200 dark:border-slate-800">
          <p className="text-[9px] text-slate-400 dark:text-slate-600 uppercase tracking-[0.3em] font-black">
            Systems Online • Rate Updated {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
      
      <div className="mt-8 text-slate-400 dark:text-slate-600 text-[10px] text-center max-w-xs leading-relaxed uppercase tracking-widest">
        Handy for kosher grocery checks in Israel & Canada
      </div>
    </div>
  );
};

export default App;


