import React from 'react';

export default function CurrencySelector({ selectedCurrency, onCurrencyChange }) {
  return (
    <div className="flex items-center justify-start space-x-3">
      <button 
        onClick={() => onCurrencyChange('GBP')}
        className={`px-3 py-1 text-sm rounded-md ${
          selectedCurrency === 'GBP' 
            ? 'bg-indigo-600 text-white font-medium' 
            : 'bg-white text-gray-700 border border-gray-300'
        } cursor-pointer`}
      >
        GBP (£)
      </button>
      <button 
        onClick={() => onCurrencyChange('USD')}
        className={`px-3 py-1 text-sm rounded-md ${
          selectedCurrency === 'USD' 
            ? 'bg-indigo-600 text-white font-medium' 
            : 'bg-white text-gray-700 border border-gray-300'
        } cursor-pointer`}
      >
        USD ($)
      </button>
    </div>
  );
}