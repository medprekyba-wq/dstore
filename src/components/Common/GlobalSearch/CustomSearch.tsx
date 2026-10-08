"use client";

import type React from "react";

import { XIcon, SearchIcon } from "@/assets/icons";
import { useSearchBox, type UseSearchBoxProps } from "react-instantsearch";
import { useEffect, useState } from "react";

interface CustomSearchBoxProps extends UseSearchBoxProps {
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  iconClassName?: string;
  clearButtonClassName?: string;
}

const CustomSearchBox = ({
  placeholder = "Type anything to search...",
  className = "p-10 pb-1",
  inputClassName = "flex h-[56px] w-full items-center rounded-lg border border-gray-3 pl-12 pr-6 outline-hidden duration-300 focus:border-primary",
  iconClassName = "absolute left-0 top-0 w-[56px] h-[56px] flex items-center justify-center p-5",
  clearButtonClassName = "absolute right-0 top-0 w-[56px] h-[56px] flex items-center justify-center p-5",
  ...props
}: CustomSearchBoxProps) => {
  const { query, refine, clear, isSearchStalled } = useSearchBox(props);
  const [inputValue, setInputValue] = useState(query);

  useEffect(() => {
    setInputValue(query);
  }, [query]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (inputValue.trim() === "") {
      clear();
    } else {
      refine(inputValue);
    }
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(event.target.value);
  };

  const handleReset = () => {
    setInputValue("");
    clear();
  };

  return (
    <div className={className}>
      <form onSubmit={handleSubmit} className="relative top-0 z-999">
        <input
          type="search"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          className={inputClassName}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <button type="submit" className={iconClassName} title="Submit search">
          <SearchIcon width={24} height={24} />
        </button>
        {inputValue.length > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className={clearButtonClassName}
            title="Clear search"
          >
            <XIcon width={20} height={20} />
          </button>
        )}
      </form>
    </div>
  );
};

export default CustomSearchBox;
