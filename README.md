# StyleHub

StyleHub is a responsive fashion storefront built with React and Vite. It includes a 20-item local catalog across men's and women's collections, product search and filters, product details, a persistent shopping cart, and a simulated checkout flow.

## Requirements

Install a current Node.js LTS release and npm before running the project.

## Setup and commands

From the project directory:

```sh
npm install
npm run dev
```
Vite prints the local development URL after startup. The other available scripts are:

```sh
npm run build
npm run lint
npm run preview
```

`npm run preview` serves the production build locally; run `npm run build` first.

## Features

- Men's and women's collections with category navigation.
- Product search, category and maximum-price filters, and sorting.
- Product detail pages with images, variants, stock information, and quantity limits.
- Shared cart state with variant-aware quantity updates, removal, stock caps, totals, and browser `localStorage` persistence.
- Checkout contact and shipping form validation, order summary, and simulated order confirmation.
- Responsive layouts for desktop, tablet, and mobile.

The catalog contains 20 sample products (10 per collection). Remaining stock is demo data and is persisted in the current browser; a successful simulated checkout decrements it by the ordered quantities. It is not shared across browsers or connected to a live inventory system.

## Libraries and tooling

- React and React DOM for the UI.
- React Router for client-side routing.
- Sass/SCSS compiled by Vite for styling.
- Vite for development and production builds.
- Oxlint for linting.

## Project structure

```text
src/
  components/
    cart/       Cart drawer, cart item, and summary
    checkout/   Checkout form and order summary
    catalog/    Product card, filters, and sorting controls
    layout/     Shared header, search, sidebar, and app layout
    styles/     SCSS files, separate from JSX components
      _storefront.scss
      dark-theme.scss
      index.scss
  context/      Shared cart state and persistence
  data/         Local product catalog and collection categories
  hooks/        Shared cart hook
  pages/        Listing, product, checkout, confirmation, and not-found pages
  services/     Simulated order boundary for future integration
  utils/        Formatting, product filtering, and cart calculations
  App.jsx       Route configuration and providers
  main.jsx      React entry point
```

### Beginner guide: how the app works

1. `main.jsx` finds the HTML element named `root` and renders the React app there.
2. `App.jsx` sets up the router, shared cart provider, and page routes.
3. `AppLayout.jsx` draws the header, sidebar, page content, and cart drawer around each route.
4. `data/products.js` is the sample catalog. Listing and detail pages read products from it.
5. `ProductListingPage.jsx` reads the collection and filters from the URL, then shows `ProductList`.
   `ProductList` creates one `ProductCard` for each product.
6. `ProductDetailsPage.jsx` lets a shopper choose a size, color, and quantity. It calls `useCart()`
   to add the selected item to the shared cart.
7. `CartContext.jsx` is the shared cart and stock state. It saves cart and stock data in
   `localStorage`; `utils/cart.js` contains the calculations and quantity rules.
8. `CartDrawer.jsx` and `OrderSummary.jsx` show cart items and totals. `CartItem.jsx` is the
   reusable row used for each item.
9. `CheckoutPage.jsx` validates customer details, creates the order, saves the latest confirmation
   in `sessionStorage`, updates stock, empties the cart, and opens the confirmation route.
   `CheckoutForm.jsx` displays the form, while `utils/phoneNumber.js` and `utils/payment.js`
   contain phone and demo-card validation.
10. `orderService.js` is the boundary where a real order API could be connected later. Today it only
    creates a simulated order. `OrderConfirmationPage.jsx` displays that order.
11. `formatCurrency.js` formats prices. `filterProducts.js` filters and sorts the catalog.
    `components/styles/` contains the app's visual styles and theme.

SCSS is compiled by Vite with Sass. `index.scss` loads the storefront styles and the dark theme.

## Routes and data flow

- `/` and `/collections/:collection` render the product listing; supported collections are `men` and `women`.
- `/products/:productId` loads a product by its catalog ID and shows its variants and stock.
- `/checkout` shows the customer form and a summary derived from shared cart state.
- `/order-confirmation` shows only a successfully simulated order, passed through route state or restored from session storage.

`App` provides the router and shared `CartProvider`. `AppLayout` composes `Header`, `Sidebar`, the route outlet, and `CartDrawer`. The listing derives search, category, price, and sort results from the catalog and URL parameters; `ProductList` passes each product to `ProductCard`. `ProductDetailsPage` calls the cart context's `addItem`. `CartContext` is the single source of truth for cart variants, stock-limited quantities, totals, and local-storage persistence. Checkout reads those same totals, passes cart controls to `OrderSummary`, and sends validated customer/order data to the simulated order service before navigating to confirmation.

## Demo limitations

- This is a frontend assessment demo: there is no backend, account system, inventory reservation, or real order fulfillment.
- Checkout creates a simulated order only. COD is marked as due on delivery. The card option asks
  for demo card fields and validates them in the browser, but does not send or save those fields and
  does not process a payment. Use only the example test values shown in checkout, never a real card.
  A real payment provider needs a secure backend and a separate integration; the simulated order
  service does not process payments.
- Cart contents persist in the current browser using `localStorage`. The latest simulated order confirmation is retained in the current browser session.
- Remaining demo stock persists separately in `localStorage` and is decremented after a simulated order succeeds.
- Product images are hosted by Unsplash and Pexels, so an internet connection is needed to load them.

There is no automated test script configured in `package.json`; use `npm run build` and `npm run lint` for the available project checks.
