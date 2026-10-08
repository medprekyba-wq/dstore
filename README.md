# Installing and Deploying CozyCommerce

## Install and Deploy CozyCommerce

In this part of the documentation we will show you how to install CozyCommerce.

<Callout type="info">
  Before moving forward, make sure you have Node.js installed on your machine.
  Otherwise the installation commands will not work.
</Callout>

**1.** Download template and extract it. Then CD into that directory and run this command to install the dependencies:

```bash
npm install
# or
yarn install
```

<!-- > Some included packages causes peer-deps issue with React 19 while installing.
> With npm the `--legacy-peer-deps` flag is a workaround for that at the moment. -->

**2.** After completing the installation run this command to start the developement server:

```bash copy
npm run dev
```

or

```bash copy
yarn dev
```

### Next Steps

Once the installation is done,  
Follow these steps to complete the installation.

1. [Database Integration - PostgreSQL on Vercel](https://CozyCommerce.com//docs/database/postgresql)

<Callout type="info">
  **Note:** you can use any PostgreSQL you want. Just save the database url in
  the env using this name:
</Callout>

```
DATABASE_URL=YOUR_DB_CONNECT_URL
```

2. [Authentication](https://CozyCommerce.com/docs/authentication)

3.[Stripe Integration](https://CozyCommerce.com/docs/stripe)

4.[Algolia Integration](https://CozyCommerce.com/docs/algolia)

---

## Deploying to server

After the installation and customization are done you have to deploy the template.
Here are the steps you need to follow to deploy the template:

Build the template locally and then deploy it to the server.
Build the template using the following command, When you run this command you'll get a build folder. Now you can upload this folder to your server and your site will be live.

```bash copy
npm run build
```

or

```bash copy
yarn build
```

## Update Logs

## Version 1.5.0 - [April 02, 2026] - Latest Features

### 1. User Dashboard & Account Enhancements
- **Enhanced Dashboard Overview**: Added visual counters for *Total Orders*, *Pending*, *Processing*, and *Delivered Orders* to give users a quick overview of their shopping activity.
- **Recent Orders List**: A new streamlined view of recent orders with status tracking and quick access to order details.

### 2. Advanced Invoice System
- **Professional Invoice Layout**: Completely redesigned invoice specifically for better readability and a premium look.
- **PDF Export & Printing**: Integrated features to allow users to download their invoices as PDF files or print them directly from the browser.

### 3. Integrated Order Tracking
- **Visual Order Timeline**: Added a "Track Your Order" page where users can follow the progress of their package in real-time (e.g., Order Placed, Shipped, Delivered).
- **History Logs**: Detailed history logs showing timestamps for each status update.

### 4. Product Review Management
- **"My Reviews" Section**: A dedicated area for users to manage their product feedback.
- **Dual-Tab Interface**:
  - **Need to Review**: Auto-populated with products from successful orders that haven't been reviewed yet.
  - **Reviewed Products**: A collection of the user's past feedback.
- **Direct Review Actions**: Quick "Write Review" button to simplify the feedback process.

### 5. Administrative Customization
- **Testimonials Manager**: New dashboard interface in the admin panel to manage user testimonials (`/admin/customization/testimonials`).
- **Review List**: View avatar, author name, rating, and perform quick actions like editing or deleting entries.

### 6. New Caching Architecture (Next.js 16+)
- Migrated from `unstable_cache` to `'use cache'` directive with `cacheLife` for TTL control and `cacheTag` for on-demand invalidation.

### 7. Partial Prerendering (PPR)
- (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content

Version 1.4.0 - Enhancements - [Mar 16, 2026]

- update project dependencies, standardize image component styling and fix Swiper navigation button SVG fill.

Version 1.3.0 - Enhancements - [Dec 02, 2025]

- updated to next 16
- some dependencies updated
- Added localStorage persistence for shopping cart and remove use-shopping-cart package
- Cart items now persist across page refreshes and browser sessions
- Implemented Redux middleware for automatic cart state synchronization
- Fixed React hydration errors with client-side cart loading
- Improved email error handling in order creation (SMTP failures no longer block orders)

Version 1.2.1 - Features - [Feb 13, 2025]

- Upgraded to Next15
- Upgraded to Tailwind v4
- Form validation using React Hook Form
- Fully functional checkout page(with input validation and state changes)
- Refactored products filtering; querying from Sanity.
- Managing user addresses(Shipping and Billing) on database.
- Improve re-usability, code refactoring etc.

Version 1.0.1 - Patches - [Feb 02, 2025]

- Fix countdown timer
- Showing indicator if product has been added to wishlist
- Redesign _Empty Cart_ page
