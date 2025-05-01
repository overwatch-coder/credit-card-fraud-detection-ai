"use client";

import { useState } from "react"; // Import useState
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input"; // Import Input
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export function Pagination({ currentPage, totalPages, onPageChange }) {
  const isFirstPage = currentPage === 1;
  const isLastPage = currentPage === totalPages;

  // State to manage the input field value
  const [pageInput, setPageInput] = useState(String(currentPage));

  // Update input field when currentPage changes
  useState(() => {
    setPageInput(String(currentPage));
  }, [currentPage]);

  const handleInputChange = (event) => {
    setPageInput(event.target.value);
  };

  const handleGoToPage = () => {
    const page = parseInt(pageInput, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      // Optionally provide feedback to the user about invalid input
      console.warn(`Invalid page number entered: ${pageInput}`);
      // Reset input to current page if invalid
      setPageInput(String(currentPage));
    }
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "Enter") {
      handleGoToPage();
      event.preventDefault(); // Prevent form submission if the input is inside a form
    }
  };

  return (
    <div className="flex flex-col items-center space-y-2 sm:flex-row sm:space-x-2 sm:space-y-0">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(1)}
          disabled={isFirstPage}
        >
          <ChevronsLeft className="h-4 w-4" />
          <span className="sr-only">First page</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={isFirstPage}
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>
      </div>

      {/* Input for direct page navigation */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium whitespace-nowrap">
          Go to page
        </span>
        <Input
          type="number"
          min={1}
          max={totalPages}
          value={pageInput}
          onChange={handleInputChange}
          onKeyDown={handleInputKeyDown}
          className="h-8 w-[70px] text-center [-moz-appearance:_textfield] [&::-webkit-outer-spin-button]:m-0 [&::-webkit-inner-spin-button]:m-0" // Style to hide number input arrows
        />
        <span className="text-sm font-medium whitespace-nowrap">
          of {totalPages}
        </span>
        <Button variant="outline" size="sm" onClick={handleGoToPage}>
          Go
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={isLastPage}
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(totalPages)}
          disabled={isLastPage}
        >
          <ChevronsRight className="h-4 w-4" />
          <span className="sr-only">Last page</span>
        </Button>
      </div>
    </div>
  );
}
