import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaSearch } from 'react-icons/fa';

const SearchBox = () => {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState('');

  const submitHandler = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/search/${keyword}`);
    } else {
      navigate('/products');
    }
  };

  return (
    <form onSubmit={submitHandler} className="flex">
      <input
        type="text"
        name="q"
        onChange={(e) => setKeyword(e.target.value)}
        placeholder="Search products..."
        className="rounded-l-md py-2 px-4 border-t border-b border-l text-gray-800 border-gray-200 bg-white focus:outline-none focus:ring-primary focus:border-primary"
      />
      <button
        type="submit"
        className="bg-primary px-4 rounded-r-md text-white hover:bg-primary-dark transition-colors duration-300"
      >
        <FaSearch />
      </button>
    </form>
  );
};

export default SearchBox;