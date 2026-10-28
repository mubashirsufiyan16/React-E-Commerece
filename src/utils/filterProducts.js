export function filterAndSortProducts(
  products,
  { collection, category, search, maxPrice, sort },
) {
  const normalizedSearch = search.trim().toLowerCase()
  const result = products.filter((product) => {
    const matchesCollection = collection === 'all' || product.collection === collection
    const matchesCategory = category === 'all' || product.category === category
    const matchesPrice = product.price <= maxPrice
    const searchableText = [
      product.name,
      product.collection,
      product.category,
      product.description,
      ...product.colors,
    ]
      .join(' ')
      .toLowerCase()
    const matchesSearch = !normalizedSearch || searchableText.includes(normalizedSearch)

    return matchesCollection && matchesCategory && matchesPrice && matchesSearch
  })

  switch (sort) {
    case 'price-low':
      return result.sort((a, b) => a.price - b.price)
    case 'price-high':
      return result.sort((a, b) => b.price - a.price)
    case 'rating':
      return result.sort((a, b) => b.rating - a.rating)
    case 'name':
      return result.sort((a, b) => a.name.localeCompare(b.name))
    default:
      return result.sort((a, b) => Number(b.featured) - Number(a.featured))
  }
}
