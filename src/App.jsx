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
      // ILS to CAD
      if (isWeightMode) {
        // (ILS/kg * rate) / 2.20462 = CAD/lb
        setResultValue((amount * rate) / KG_TO_LB);
      } else {
        setResultValue(amount * rate);
      }
    } else {
      // CAD to ILS
      const inverseRate = 1 / rate;
      if (isWeightMode) {
        // ($/lb * 2.20462) * inverseRate = ILS/kg
        setResultValue((amount * KG_TO_LB) * inverseRate);
      } else {
        setResultValue(amount * inverseRate);
      }
    }
  }, [inputValue, isWeightMode, isInverted, rate]);

  const handleFlip = () => {
    setIsInverted(!isInverted);
  };

  const handleClear = () => setInputValue('');

  const sourceCurrency = isInverted ? 'CAD' : 'ILS';
  const targetCurrency = isInverted ? 'ILS' : 'CAD';
  const sourceSymbol = isInverted ? '$' : '₪';
  const targetSymbol = isInverted ? '₪' : '$';
  const sourceWeightUnit = isInverted ? 'lb' : 'kg';
  const targetWeightUnit = isInverted ? 'kg' : 'lb';

  // Calculate the display rate based on direction
  const displayRate = isInverted ? (1 / rate).toFixed(4) : rate.toFixed(4);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 font-sans text-slate-900">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
        
        {/* Header */}
        <div className="bg-indigo-600 p-6 text-white text-center relative">
          <h1 className="text-2xl font-bold flex items-center justify-center gap-2">
            Price Converter
          </h1>
          <div className="flex items-center justify-center gap-2 mt-1 text-indigo-100 text-sm">
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
          <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 flex items-center gap-2 text-amber-700 text-xs">
            <AlertCircle size={14} />
            {error}
          </div>
        )}

        <div className="p-8 space-y-6">
          
          {/* Controls: Mode & Flip */}
          <div className="space-y-3">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setIsWeightMode(false)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${!isWeightMode ? 'bg-white shadow-sm font-semibold text-indigo-600' : 'text-slate-500'}`}
              >
                <DollarSign size={18} />
                Total Price
              </button>
              <button 
                onClick={() => setIsWeightMode(true)}
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg transition-all ${isWeightMode ? 'bg-white shadow-sm font-semibold text-indigo-600' : 'text-slate-500'}`}
              >
                <Scale size={18} />
                Per Weight
              </button>
            </div>

            <button 
              onClick={handleFlip}
              className="w-full flex items-center justify-center gap-2 py-2 border-2 border-slate-100 rounded-xl text-slate-500 hover:bg-slate-50 transition-colors text-sm font-medium"
            >
              <ArrowLeftRight size={16} />
              Switch Direction ({sourceCurrency} → {targetCurrency})
            </button>
          </div>

          {/* Input Section */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-500 block">
              Price in {sourceSymbol} {isWeightMode ? `per ${sourceWeightUnit}` : ''}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xl font-light">
                {sourceSymbol}
              </span>
              <input
                type="number"
                inputMode="decimal"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="0.00"
                className="w-full pl-10 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-indigo-400 focus:bg-white rounded-2xl text-2xl outline-none transition-all"
              />
            </div>
          </div>

          {/* Result Section */}
          <div className="bg-indigo-50 rounded-2xl p-6 border border-indigo-100 text-center relative">
            <p className="text-indigo-600 text-xs font-bold uppercase tracking-widest mb-1">
              Estimated Price in {targetCurrency}
            </p>
            <div className="text-4xl font-bold text-slate-800">
              {targetSymbol}{resultValue.toFixed(2)}
              <span className="text-lg text-slate-400 font-normal ml-2">
                {isWeightMode ? `/ ${targetWeightUnit}` : ''}
              </span>
            </div>
          </div>

          {/* Details */}
          <div className="text-[11px] text-slate-400 space-y-2 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
            <div className="flex justify-between">
              <span>Current Rate:</span>
              <span className="font-mono text-slate-600 font-medium">
                1 {sourceCurrency} = {displayRate} {targetCurrency}
              </span>
            </div>
            {isWeightMode && (
              <div className="flex justify-between">
                <span>Weight Factor:</span>
                <span className="font-mono text-slate-600">1 kg = 2.2046 lb</span>
              </div>
            )}
            <button 
              onClick={handleClear}
              className="w-full pt-2 text-indigo-500 font-semibold hover:text-indigo-600"
            >
              Clear
            </button>
          </div>

        </div>

        <div className="bg-slate-50 p-3 border-t border-slate-100 text-center">
          <p className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">
            Live Market Rates • Frankfurter API
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;


