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
npm test
npm run preview
```

`npm run preview` serves the production build locally; run `npm run build` first.
`npm test` runs the automated unit tests with Node's built-in test runner.

## Features

- Men's and women's collections with category navigation.
- Product search, category and maximum-price filters, and sorting.
- Product detail pages with images, variants, stock information, and quantity limits.
- Shared cart state with variant-aware quantity updates, removal, stock caps, totals, and browser `localStorage` persistence.
- Checkout contact and shipping form validation, order summary, and simulated order confirmation.
- Product images fall back to a local placeholder if a hosted image cannot be loaded.
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
    ImageWithFallback.jsx
                Shared product image with a local error fallback
    layout/     Shared header, search, sidebar, and app layout
    styles/     SCSS files, separate from JSX components
      _storefront.scss
      dark-theme.scss
      index.scss
  context/      Shared cart state and persistence
  data/         Local product catalog and collection categories
  hooks/        Shared cart hook
  pages/        Listing, product, checkout, confirmation, and not-found pages
  services/     Simulated orders and hosted payment-session boundary
  utils/        Formatting, product filtering, and cart calculations
tests/          Automated catalog, cart, checkout-helper, and payment-session tests
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
10. `orderService.js` creates a simulated order. `paymentGateway.js` creates a hosted checkout
    session through a configured backend endpoint; `OrderConfirmationPage.jsx` displays only a
    simulated order confirmation in the current demo.
11. `formatCurrency.js` formats prices. `filterProducts.js` filters and sorts the catalog.
    `components/styles/` contains the app's visual styles and theme.

SCSS is compiled by Vite with Sass. `index.scss` loads the storefront styles and the dark theme.

## Routes and data flow

- `/` and `/collections/:collection` render the product listing; supported collections are `men` and `women`.
- `/products/:productId` loads a product by its catalog ID and shows its variants and stock.
- `/checkout` shows the customer form and a summary derived from shared cart state.
- `/order-confirmation` shows only a successfully simulated order, passed through route state or restored from session storage.

`App` provides the router and shared `CartProvider`. `AppLayout` composes `Header`, `Sidebar`, the route outlet, and `CartDrawer`. The listing derives search, category, price, and sort results from the catalog and URL parameters; `ProductList` passes each product to `ProductCard`. `ProductDetailsPage` calls the cart context's `addItem`. `CartContext` is the single source of truth for cart variants, stock-limited quantities, totals, and local-storage persistence. Checkout reads those same totals and passes cart controls to `OrderSummary`; COD and the default demo-card flow use the simulated order service, while a configured card flow requests a hosted payment session and redirects.

## Payment checkout configuration

The default checkout is a frontend-only simulation. To hand a card checkout to a hosted payment
provider in a future integration, copy `.env.example` to `.env.local` and set
`VITE_PAYMENT_SESSION_URL` to your **HTTPS backend endpoint**. That endpoint must authenticate and
validate the order, create a payment session with the provider using server-side credentials, and
return JSON containing an absolute `checkoutUrl`. The frontend then redirects the browser to that
URL. The request sends only the order reference, customer email, and product variant/quantity list;
card numbers and security codes are never sent to this endpoint.

The endpoint and provider must independently verify prices, stock, and payment status. This sample
does not implement a backend, provider webhook, payment-result callback, or verified post-payment
order confirmation/inventory update. Do not treat the redirect alone as proof of payment. Leave the
environment variable unset to use the assessment's simulated checkout.

## AI-assisted development notes

This section records AI use in the assessment review and follow-up work documented here. The original
development conversation and any earlier prompts or AI tools used before this review were not
available, so this record does not claim to reconstruct that history. Add those original details
before submission if applicable.

- **Tool and purpose:** Copilot SDK in VS Code was used to compare the supplied assessment brief with
  the source, identify implementation gaps, and assist with the follow-up changes and tests.
- **Requirement breakdown:** The brief was checked against collection navigation, catalog/search,
  product details, cart persistence/stock, checkout/confirmation, responsive layout, dataset,
  documentation, and maintainability. The follow-up work targeted the missing AI-use record, a
  payment-session integration boundary, missing-image handling, and automated tests.
- **Prompt summaries:** The requests were to review the project against the supplied StyleHub
  requirements and report fulfilled versus pending items; then to implement the pending tasks. The
  payment refinement was to preserve the current simulated flow while allowing a future secure,
  hosted checkout handoff without sending card data from the browser.
- **Technical decisions:** React components and React Router keep page/navigation concerns clear;
  the local JavaScript catalog is sufficient for a frontend-only assessment; cart state is shared
  through context and persisted locally. Pure cart, filter, validation, and payment-session logic is
  tested separately from presentation.
- **Review and verification:** AI-assisted changes were checked against the existing component and
  service patterns, and the project was validated with `npm test`, `npm run lint`, and `npm run build`.
  The payment flow remains explicitly a simulation unless a backend endpoint is configured.
- **Known issues and next improvements:** The sample still needs a real backend, provider webhook,
  and verified payment-result flow for production. A future pass should add browser-level tests and
  document any original AI prompts/tools used during the initial implementation.

## Demo limitations

- This is a frontend assessment demo: there is no backend, account system, inventory reservation, or real order fulfillment.
- With no payment endpoint configured, checkout creates a simulated order only. COD is marked as due
  on delivery. The demo card option validates example card fields in the browser but does not send or
  save them and does not process a payment. Use only the example test values shown in checkout,
  never a real card. Configuring a payment-session endpoint enables a hosted redirect, but does not
  by itself implement or verify payment.
- Cart contents persist in the current browser using `localStorage`. The latest simulated order confirmation is retained in the current browser session.
- Remaining demo stock persists separately in `localStorage` and is decremented after a simulated order succeeds.
- Product images are hosted by Unsplash and Pexels, so an internet connection is needed for catalog
  images; a local placeholder is shown if an image cannot be loaded.
