"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

export default function SearchBar() {
  const [searchValue, setSearchValue] = useState("");
  const router = useRouter();

  const handleSearch = (e) => {
    e.preventDefault();

    if (!searchValue.trim()) return; 
    router.push(`/search?search=${encodeURIComponent(searchValue)}`);
  };

  return (
    <form onSubmit={handleSearch} className="flex w-1/2">
      <input
        className="w-11/12 px-4 py-1 font-normal border rounded-s focus:outline-none"
        type="text"
        placeholder="Search for products..."
        value={searchValue}
        onChange={(e) => setSearchValue(e.target.value)}
      />
      <button
        className="flex items-center justify-center w-1/12 px-4 text-white bg-blue-950 rounded-e hover:bg-blue-900"
        type="submit"
      >
        <FontAwesomeIcon icon={faSearch} />
      </button>
    </form>
  );
}
