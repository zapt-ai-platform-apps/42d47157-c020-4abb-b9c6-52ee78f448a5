import React, { useState } from 'react';
import CurrencySelector from './CurrencySelector';

export default function CurrencyModal({ isOpen, onClose, onConfirm }) {
  const [selectedCurrency, setSelectedCurrency] = useState('GBP');

  if (!isOpen) return null;

  const handleConfirm = () => {
    onConfirm(selectedCurrency);
  };

  return (
    <div className="fixed z-10 inset-0 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={onClose}></div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6">
          <div>
            <div className="mt-3 text-center sm:mt-5">
              <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                Select Currency
              </h3>
              <div className="mt-4">
                <p className="text-sm text-gray-500 mb-4">
                  Choose your preferred currency for billing:
                </p>
                <div className="flex justify-center mt-2">
                  <CurrencySelector 
                    selectedCurrency={selectedCurrency} 
                    onCurrencyChange={setSelectedCurrency} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={onClose}
              className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none cursor-pointer"
            >
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}