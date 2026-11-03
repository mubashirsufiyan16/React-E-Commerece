function SortControl({ value, onChange }) {
  return (
    <label className="sort-control">
      <span>Sort by</span>
      <select onChange={(event) => onChange(event.target.value)} value={value}>
        <option value="featured">Featured</option>
        <option value="price-low">Price: low to high</option>
        <option value="price-high">Price: high to low</option>
        <option value="rating">Top rated</option>
        <option value="name">Name</option>
      </select>
    </label>
  )
}

export default SortControl
