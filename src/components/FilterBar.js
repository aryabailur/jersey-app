import React from 'react';
import { Zap, ChevronDown } from 'lucide-react';

export default function FilterBar({ sortBy, onSortChange }) {
  return (
    <div id="products" className="filter-bar">
      <div className="container filter-bar__container">
        <div className="filter-bar__group">
          <span className="filter-bar__label">Filter by:</span>
          <button className="filter-bar__button">All</button>
          <button className="filter-bar__button">
            <Zap size={14} /> New
          </button>
          <button className="filter-bar__button">On Sale</button>
        </div>
        <div className="filter-bar__group">
          <span className="filter-bar__label">Sort by:</span>
          <div className="filter-bar__select-wrapper">
            <select
              className="filter-bar__select"
              value={sortBy}
              onChange={(e) => onSortChange(e.target.value)}
            >
              <option value="popularity">Popularity</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Rating</option>
            </select>
            <ChevronDown size={16} className="filter-bar__select-icon" />
          </div>
        </div>
      </div>
    </div>
  );
}