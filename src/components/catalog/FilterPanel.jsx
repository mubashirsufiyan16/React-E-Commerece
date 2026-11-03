function FilterPanel({ categories, category, onCategoryChange, maxPrice, onMaxPriceChange }) {
  return (
    <div className="filter-controls">
      <label className="filter-field">
        <span>Category</span>
        <select onChange={(event) => onCategoryChange(event.target.value)} value={category}>
          <option value="all">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </label>
      <label className="filter-field">
        <span>Max price: ${maxPrice}</span>
        <input
          max="200"
          min="20"
          onChange={(event) => onMaxPriceChange(Number(event.target.value))}
          step="5"
          type="range"
          value={maxPrice}
        />
      </label>
    </div>
  )
}

export default FilterPanel
