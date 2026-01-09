import React from 'react';
import { ChevronLeft } from 'lucide-react';

/**
 * Pagination component for the post list.
 * features "Next page" text and arrow icons styled with a subtle border and clean typography.
 * Follows RTL layout and the specific light theme styling.
 */
const Pagination: React.FC = () => {
  return (
    <div className="flex justify-center items-center mt-10 mb-10 w-full" dir="ltr">
      <nav 
        className="flex items-center" 
        aria-label="Pagination"
      >
        <div className="flex border border-[#eeeeee] bg-white">
          {/* Previous Page Button (Left Arrow) */}
          <button 
            type="button"
            className="flex items-center justify-center min-w-[34px] h-[34px] border-r border-[#eeeeee] hover:bg-[#f5f5f5] transition-colors duration-200 cursor-pointer group"
          >
            <ChevronLeft className="w-4 h-4 text-[#333333] group-hover:text-[#563a4a]" />
          </button>

          {/* Next Page Text Button */}
          <button 
            type="button"
            className="flex items-center px-4 h-[34px] text-[13px] font-normal text-[#333333] hover:bg-[#f5f5f5] transition-colors duration-200 cursor-pointer"
          >
            Next page
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Pagination;