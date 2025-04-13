import React from 'react';

const Spinner = () => (
  <div className="spinner flex justify-center items-center mt-4">
    <svg
      className="animate-spin h-8 w-8 border-t-2 border-blue-500 border-solid rounded-full"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
    </svg>
  </div>
);

export default Spinner;
