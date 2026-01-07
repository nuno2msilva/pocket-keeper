# Expense Tracker - Vanilla HTML/CSS/JS Rebuild Guide

A complete guide to rebuilding the Expense Tracker using only HTML, CSS, and vanilla JavaScript. No frameworks, no build tools, no dependencies beyond what browsers provide natively.

---

## Table of Contents

1. [Overview](#overview)
2. [Project Structure](#project-structure)
3. [HTML Foundation](#html-foundation)
4. [CSS Architecture](#css-architecture)
5. [JavaScript Modules](#javascript-modules)
6. [Hash-Based Routing](#hash-based-routing)
7. [LocalStorage Repository](#localstorage-repository)
8. [Canvas Pie Charts](#canvas-pie-charts)
9. [Component Patterns](#component-patterns)
10. [JSON Import/Export](#json-importexport)
11. [Complete Code Examples](#complete-code-examples)
12. [Kanban Board for Development](#kanban-board-for-development)

---

## Overview

### Why Vanilla JS?

- **Zero dependencies**: No npm, no build tools, no framework updates
- **Maximum portability**: Works in any browser, any server, even file://
- **Complete control**: No abstraction layers, direct DOM manipulation
- **Learning value**: Understand how things actually work
- **Performance**: No framework overhead, minimal JavaScript

### Browser Requirements

- Modern browser with ES6+ support (Chrome 60+, Firefox 55+, Safari 11+, Edge 79+)
- Canvas API for charts
- localStorage API for persistence

---

## Project Structure

```
expense-tracker-vanilla/
├── index.html              # Single HTML file (SPA shell)
├── css/
│   ├── main.css           # Core styles and CSS variables
│   ├── components.css     # Reusable component styles
│   ├── pages.css          # Page-specific styles
│   └── utilities.css      # Utility classes
├── js/
│   ├── app.js             # Application entry point
│   ├── router.js          # Hash-based routing
│   ├── repository.js      # LocalStorage data layer
│   ├── utils.js           # Helper functions
│   ├── components/
│   │   ├── header.js      # Header component
│   │   ├── nav.js         # Navigation component
│   │   ├── modal.js       # Modal dialog component
│   │   ├── toast.js       # Toast notifications
│   │   ├── pie-chart.js   # Canvas pie chart
│   │   └── list-card.js   # Reusable list card
│   └── pages/
│       ├── dashboard.js   # Dashboard page
│       ├── receipts.js    # Receipts list page
│       ├── receipt-detail.js
│       ├── merchants.js   # Merchants list page
│       ├── products.js    # Products list page
│       ├── categories.js  # Categories page
│       ├── insights.js    # Analytics page
│       └── settings.js    # Settings page
├── assets/
│   ├── icons/             # SVG icons
│   └── images/            # Static images
├── data/
│   └── defaults.json      # Default categories/data
└── manifest.json          # PWA manifest (optional)
```

---

## HTML Foundation

### index.html - The Application Shell

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="theme-color" content="#1a9b8a">
    <meta name="apple-mobile-web-app-capable" content="yes">
    
    <title>ExpenseTrack - Smart Expense Tracking</title>
    <meta name="description" content="Track your expenses with detailed receipts, merchants, and products.">
    
    <!-- Stylesheets -->
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/components.css">
    <link rel="stylesheet" href="css/pages.css">
    <link rel="stylesheet" href="css/utilities.css">
    
    <!-- PWA -->
    <link rel="manifest" href="manifest.json">
    <link rel="apple-touch-icon" href="assets/icons/icon-192.png">
</head>
<body>
    <!-- Application Root -->
    <div id="app">
        <!-- Header (injected by JS) -->
        <header id="app-header"></header>
        
        <!-- Main Content Area (pages render here) -->
        <main id="app-content"></main>
        
        <!-- Bottom Navigation (injected by JS) -->
        <nav id="app-nav"></nav>
        
        <!-- Modal Container -->
        <div id="modal-container"></div>
        
        <!-- Toast Container -->
        <div id="toast-container"></div>
    </div>
    
    <!-- Templates (hidden, used by JS) -->
    <template id="template-receipt-card">
        <article class="card receipt-card" data-id="">
            <div class="card-header">
                <h3 class="merchant-name"></h3>
                <span class="receipt-date"></span>
            </div>
            <div class="card-body">
                <span class="item-count"></span>
                <span class="receipt-total"></span>
            </div>
        </article>
    </template>
    
    <template id="template-category-item">
        <div class="category-item" data-id="">
            <span class="category-icon"></span>
            <span class="category-name"></span>
            <span class="category-amount"></span>
            <div class="category-bar">
                <div class="category-bar-fill"></div>
            </div>
        </div>
    </template>
    
    <template id="template-modal">
        <div class="modal-backdrop">
            <div class="modal" role="dialog" aria-modal="true">
                <header class="modal-header">
                    <h2 class="modal-title"></h2>
                    <button class="modal-close" aria-label="Close">&times;</button>
                </header>
                <div class="modal-body"></div>
                <footer class="modal-footer"></footer>
            </div>
        </div>
    </template>
    
    <template id="template-toast">
        <div class="toast" role="alert">
            <span class="toast-icon"></span>
            <span class="toast-message"></span>
        </div>
    </template>

    <!-- JavaScript Modules -->
    <script type="module" src="js/app.js"></script>
</body>
</html>
```

---

## CSS Architecture

### main.css - CSS Variables and Base Styles

```css
/* ========================================
   CSS Variables - Design Tokens
   ======================================== */
:root {
    /* Colors - HSL Format */
    --color-primary-h: 170;
    --color-primary-s: 75%;
    --color-primary-l: 36%;
    --color-primary: hsl(var(--color-primary-h), var(--color-primary-s), var(--color-primary-l));
    --color-primary-light: hsl(var(--color-primary-h), var(--color-primary-s), 46%);
    --color-primary-dark: hsl(var(--color-primary-h), var(--color-primary-s), 26%);
    
    --color-background: hsl(0, 0%, 100%);
    --color-surface: hsl(0, 0%, 98%);
    --color-surface-hover: hsl(0, 0%, 96%);
    --color-border: hsl(0, 0%, 90%);
    
    --color-text-primary: hsl(0, 0%, 10%);
    --color-text-secondary: hsl(0, 0%, 40%);
    --color-text-muted: hsl(0, 0%, 60%);
    
    --color-success: hsl(142, 76%, 36%);
    --color-warning: hsl(38, 92%, 50%);
    --color-error: hsl(0, 84%, 60%);
    
    /* Spacing Scale */
    --space-xs: 0.25rem;   /* 4px */
    --space-sm: 0.5rem;    /* 8px */
    --space-md: 1rem;      /* 16px */
    --space-lg: 1.5rem;    /* 24px */
    --space-xl: 2rem;      /* 32px */
    --space-2xl: 3rem;     /* 48px */
    
    /* Typography */
    --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    --font-size-xs: 0.75rem;   /* 12px */
    --font-size-sm: 0.875rem;  /* 14px */
    --font-size-md: 1rem;      /* 16px */
    --font-size-lg: 1.125rem;  /* 18px */
    --font-size-xl: 1.25rem;   /* 20px */
    --font-size-2xl: 1.5rem;   /* 24px */
    --font-size-3xl: 2rem;     /* 32px */
    
    --font-weight-normal: 400;
    --font-weight-medium: 500;
    --font-weight-semibold: 600;
    --font-weight-bold: 700;
    
    --line-height-tight: 1.25;
    --line-height-normal: 1.5;
    --line-height-relaxed: 1.75;
    
    /* Borders */
    --border-radius-sm: 0.375rem;  /* 6px */
    --border-radius-md: 0.5rem;    /* 8px */
    --border-radius-lg: 0.75rem;   /* 12px */
    --border-radius-xl: 1rem;      /* 16px */
    --border-radius-full: 9999px;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    
    /* Transitions */
    --transition-fast: 150ms ease;
    --transition-normal: 250ms ease;
    --transition-slow: 350ms ease;
    
    /* Z-Index Scale */
    --z-dropdown: 100;
    --z-modal-backdrop: 200;
    --z-modal: 210;
    --z-toast: 300;
    
    /* Layout */
    --header-height: 3.5rem;
    --nav-height: 4rem;
    --max-width: 48rem;
}

/* Dark Mode */
@media (prefers-color-scheme: dark) {
    :root {
        --color-background: hsl(0, 0%, 8%);
        --color-surface: hsl(0, 0%, 12%);
        --color-surface-hover: hsl(0, 0%, 16%);
        --color-border: hsl(0, 0%, 20%);
        
        --color-text-primary: hsl(0, 0%, 95%);
        --color-text-secondary: hsl(0, 0%, 70%);
        --color-text-muted: hsl(0, 0%, 50%);
    }
}

/* Manual dark mode class */
.dark {
    --color-background: hsl(0, 0%, 8%);
    --color-surface: hsl(0, 0%, 12%);
    --color-surface-hover: hsl(0, 0%, 16%);
    --color-border: hsl(0, 0%, 20%);
    
    --color-text-primary: hsl(0, 0%, 95%);
    --color-text-secondary: hsl(0, 0%, 70%);
    --color-text-muted: hsl(0, 0%, 50%);
}

/* ========================================
   Reset & Base Styles
   ======================================== */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

html {
    font-size: 16px;
    -webkit-text-size-adjust: 100%;
}

body {
    font-family: var(--font-family);
    font-size: var(--font-size-md);
    line-height: var(--line-height-normal);
    color: var(--color-text-primary);
    background-color: var(--color-background);
    min-height: 100vh;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
}

/* App Layout */
#app {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    max-width: var(--max-width);
    margin: 0 auto;
}

#app-header {
    position: sticky;
    top: 0;
    z-index: 50;
    height: var(--header-height);
    background: var(--color-background);
    border-bottom: 1px solid var(--color-border);
}

#app-content {
    flex: 1;
    padding: var(--space-md);
    padding-bottom: calc(var(--nav-height) + var(--space-md));
    overflow-y: auto;
}

#app-nav {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: var(--nav-height);
    background: var(--color-background);
    border-top: 1px solid var(--color-border);
    z-index: 50;
}

/* Links */
a {
    color: var(--color-primary);
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}

/* Buttons */
button {
    font-family: inherit;
    font-size: inherit;
    cursor: pointer;
    border: none;
    background: none;
}

button:disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

/* Forms */
input, select, textarea {
    font-family: inherit;
    font-size: inherit;
}

/* Lists */
ul, ol {
    list-style: none;
}

/* Images */
img {
    max-width: 100%;
    height: auto;
    display: block;
}

/* Focus Styles (Accessibility) */
:focus-visible {
    outline: 2px solid var(--color-primary);
    outline-offset: 2px;
}
```

### components.css - Reusable Component Styles

```css
/* ========================================
   Buttons
   ======================================== */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--border-radius-md);
    font-weight: var(--font-weight-medium);
    transition: all var(--transition-fast);
    white-space: nowrap;
}

.btn-primary {
    background: var(--color-primary);
    color: white;
}

.btn-primary:hover {
    background: var(--color-primary-dark);
}

.btn-secondary {
    background: var(--color-surface);
    color: var(--color-text-primary);
    border: 1px solid var(--color-border);
}

.btn-secondary:hover {
    background: var(--color-surface-hover);
}

.btn-ghost {
    background: transparent;
    color: var(--color-text-secondary);
}

.btn-ghost:hover {
    background: var(--color-surface);
}

.btn-danger {
    background: var(--color-error);
    color: white;
}

.btn-icon {
    width: 2.5rem;
    height: 2.5rem;
    padding: 0;
    border-radius: var(--border-radius-full);
}

.btn-lg {
    padding: var(--space-md) var(--space-lg);
    font-size: var(--font-size-lg);
}

.btn-sm {
    padding: var(--space-xs) var(--space-sm);
    font-size: var(--font-size-sm);
}

/* ========================================
   Cards
   ======================================== */
.card {
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-lg);
    padding: var(--space-md);
    transition: all var(--transition-fast);
}

.card:hover {
    background: var(--color-surface-hover);
}

.card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: var(--space-sm);
}

.card-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
}

.card-body {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-clickable {
    cursor: pointer;
}

/* ========================================
   Form Elements
   ======================================== */
.form-group {
    margin-bottom: var(--space-md);
}

.form-label {
    display: block;
    margin-bottom: var(--space-xs);
    font-size: var(--font-size-sm);
    font-weight: var(--font-weight-medium);
    color: var(--color-text-secondary);
}

.form-input {
    width: 100%;
    padding: var(--space-sm) var(--space-md);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    background: var(--color-background);
    color: var(--color-text-primary);
    transition: border-color var(--transition-fast);
}

.form-input:focus {
    border-color: var(--color-primary);
    outline: none;
}

.form-input::placeholder {
    color: var(--color-text-muted);
}

.form-input-error {
    border-color: var(--color-error);
}

.form-error {
    margin-top: var(--space-xs);
    font-size: var(--font-size-sm);
    color: var(--color-error);
}

.form-checkbox {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    cursor: pointer;
}

.form-checkbox input[type="checkbox"] {
    width: 1.25rem;
    height: 1.25rem;
    accent-color: var(--color-primary);
}

.form-select {
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right var(--space-sm) center;
    padding-right: var(--space-xl);
}

/* ========================================
   Modal
   ======================================== */
.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: var(--z-modal-backdrop);
    padding: var(--space-md);
    animation: fadeIn var(--transition-fast);
}

.modal {
    background: var(--color-background);
    border-radius: var(--border-radius-xl);
    width: 100%;
    max-width: 28rem;
    max-height: 90vh;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    z-index: var(--z-modal);
    animation: slideUp var(--transition-normal);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: var(--space-md);
    border-bottom: 1px solid var(--color-border);
}

.modal-title {
    font-size: var(--font-size-xl);
    font-weight: var(--font-weight-semibold);
}

.modal-close {
    font-size: var(--font-size-2xl);
    color: var(--color-text-muted);
    width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: var(--border-radius-full);
}

.modal-close:hover {
    background: var(--color-surface);
    color: var(--color-text-primary);
}

.modal-body {
    flex: 1;
    overflow-y: auto;
    padding: var(--space-md);
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: var(--space-sm);
    padding: var(--space-md);
    border-top: 1px solid var(--color-border);
}

/* ========================================
   Toast Notifications
   ======================================== */
#toast-container {
    position: fixed;
    top: var(--space-md);
    right: var(--space-md);
    z-index: var(--z-toast);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.toast {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    padding: var(--space-md);
    background: var(--color-surface);
    border: 1px solid var(--color-border);
    border-radius: var(--border-radius-md);
    box-shadow: var(--shadow-lg);
    animation: slideIn var(--transition-normal);
}

.toast-success {
    border-left: 4px solid var(--color-success);
}

.toast-error {
    border-left: 4px solid var(--color-error);
}

.toast-warning {
    border-left: 4px solid var(--color-warning);
}

/* ========================================
   Navigation
   ======================================== */
.bottom-nav {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100%;
    max-width: var(--max-width);
    margin: 0 auto;
}

.nav-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-xs);
    padding: var(--space-sm);
    color: var(--color-text-muted);
    text-decoration: none;
    transition: color var(--transition-fast);
}

.nav-item:hover {
    color: var(--color-text-secondary);
    text-decoration: none;
}

.nav-item.active {
    color: var(--color-primary);
}

.nav-icon {
    width: 1.5rem;
    height: 1.5rem;
}

.nav-label {
    font-size: var(--font-size-xs);
}

/* ========================================
   Animations
   ======================================== */
@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes slideUp {
    from {
        opacity: 0;
        transform: translateY(1rem);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

@keyframes slideIn {
    from {
        opacity: 0;
        transform: translateX(1rem);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

/* ========================================
   Loading Spinner
   ======================================== */
.spinner {
    width: 2rem;
    height: 2rem;
    border: 3px solid var(--color-border);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

/* ========================================
   Empty State
   ======================================== */
.empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: var(--space-2xl);
    text-align: center;
}

.empty-state-icon {
    width: 4rem;
    height: 4rem;
    color: var(--color-text-muted);
    margin-bottom: var(--space-md);
}

.empty-state-title {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-semibold);
    margin-bottom: var(--space-sm);
}

.empty-state-text {
    color: var(--color-text-secondary);
    margin-bottom: var(--space-md);
}
```

---

## JavaScript Modules

### js/app.js - Application Entry Point

```javascript
/**
 * Application Entry Point
 * Initializes the app, loads components, and starts the router
 */

import { Router } from './router.js';
import { Repository } from './repository.js';
import { Header } from './components/header.js';
import { BottomNav } from './components/nav.js';
import { Toast } from './components/toast.js';

// Initialize global app state
window.App = {
    repository: new Repository(),
    router: null,
    toast: null,
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    console.log('ExpenseTrack initializing...');
    
    // Initialize toast system
    App.toast = new Toast();
    
    // Render static components
    Header.render();
    BottomNav.render();
    
    // Initialize router (this will render the initial page)
    App.router = new Router();
    
    // Load demo data if first visit
    if (App.repository.isFirstVisit()) {
        App.repository.loadDemoData();
        App.toast.show('Welcome! Demo data loaded.', 'success');
    }
    
    console.log('ExpenseTrack ready!');
});

// Handle visibility change (for potential data sync)
document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
        // Refresh data when tab becomes visible
        App.router.refresh();
    }
});
```

---

## Hash-Based Routing

### js/router.js - Complete Router Implementation

```javascript
/**
 * Hash-Based Router
 * Handles navigation without page reloads using URL hash
 * 
 * Routes use the format: #/page or #/page/id
 * Examples:
 *   #/              -> Dashboard
 *   #/receipts      -> Receipts list
 *   #/receipts/123  -> Receipt detail
 */

// Import page modules
import { DashboardPage } from './pages/dashboard.js';
import { ReceiptsPage } from './pages/receipts.js';
import { ReceiptDetailPage } from './pages/receipt-detail.js';
import { MerchantsPage } from './pages/merchants.js';
import { ProductsPage } from './pages/products.js';
import { CategoriesPage } from './pages/categories.js';
import { InsightsPage } from './pages/insights.js';
import { SettingsPage } from './pages/settings.js';
import { NotFoundPage } from './pages/not-found.js';

export class Router {
    constructor() {
        // Define routes with their page modules
        this.routes = {
            '': DashboardPage,
            'receipts': ReceiptsPage,
            'receipts/:id': ReceiptDetailPage,
            'merchants': MerchantsPage,
            'merchants/:id': MerchantsPage,  // Detail handled by same page
            'products': ProductsPage,
            'products/:id': ProductsPage,
            'categories': CategoriesPage,
            'categories/:id': CategoriesPage,
            'insights': InsightsPage,
            'settings': SettingsPage,
        };
        
        // Content container
        this.container = document.getElementById('app-content');
        
        // Listen for hash changes
        window.addEventListener('hashchange', () => this.handleRoute());
        
        // Handle initial route
        this.handleRoute();
    }
    
    /**
     * Parse the current hash into route and params
     */
    parseHash() {
        // Remove leading #/ and split by /
        const hash = window.location.hash.slice(2) || '';
        const parts = hash.split('/').filter(Boolean);
        
        // Try to match route patterns
        for (const [pattern, page] of Object.entries(this.routes)) {
            const patternParts = pattern.split('/').filter(Boolean);
            
            // Check if lengths match (accounting for :id params)
            if (patternParts.length !== parts.length) continue;
            
            const params = {};
            let match = true;
            
            for (let i = 0; i < patternParts.length; i++) {
                if (patternParts[i].startsWith(':')) {
                    // This is a parameter
                    const paramName = patternParts[i].slice(1);
                    params[paramName] = parts[i];
                } else if (patternParts[i] !== parts[i]) {
                    // Static part doesn't match
                    match = false;
                    break;
                }
            }
            
            if (match) {
                return { page, params, path: pattern };
            }
        }
        
        // No match found
        return { page: NotFoundPage, params: {}, path: null };
    }
    
    /**
     * Handle the current route
     */
    handleRoute() {
        const { page, params } = this.parseHash();
        
        // Clear current content
        this.container.innerHTML = '';
        
        // Show loading state
        this.container.innerHTML = '<div class="loading"><div class="spinner"></div></div>';
        
        // Render the page
        try {
            const content = page.render(params);
            this.container.innerHTML = '';
            
            if (typeof content === 'string') {
                this.container.innerHTML = content;
            } else if (content instanceof HTMLElement) {
                this.container.appendChild(content);
            }
            
            // Initialize page-specific JS
            if (page.init) {
                page.init(params);
            }
            
            // Update active nav state
            this.updateNavState();
            
            // Scroll to top
            this.container.scrollTop = 0;
            
        } catch (error) {
            console.error('Error rendering page:', error);
            this.container.innerHTML = `
                <div class="empty-state">
                    <h2>Something went wrong</h2>
                    <p>${error.message}</p>
                    <a href="#/" class="btn btn-primary">Go Home</a>
                </div>
            `;
        }
    }
    
    /**
     * Update navigation active state
     */
    updateNavState() {
        const hash = window.location.hash.slice(2).split('/')[0] || '';
        
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href').slice(2).split('/')[0] || '';
            item.classList.toggle('active', href === hash);
        });
    }
    
    /**
     * Navigate to a route programmatically
     */
    navigate(path) {
        window.location.hash = path.startsWith('/') ? path : `/${path}`;
    }
    
    /**
     * Go back in history
     */
    back() {
        window.history.back();
    }
    
    /**
     * Refresh current page
     */
    refresh() {
        this.handleRoute();
    }
}

// Helper function for navigation
export function navigateTo(path) {
    window.location.hash = path.startsWith('/') ? path : `/${path}`;
}
```

---

## LocalStorage Repository

### js/repository.js - Data Layer

```javascript
/**
 * Repository Pattern - LocalStorage Data Layer
 * 
 * Provides a clean interface for data operations.
 * Can be swapped for API calls without changing the interface.
 */

const STORAGE_KEYS = {
    categories: 'expense-tracker-categories',
    subcategories: 'expense-tracker-subcategories',
    merchants: 'expense-tracker-merchants',
    products: 'expense-tracker-products',
    receipts: 'expense-tracker-receipts',
    settings: 'expense-tracker-settings',
    firstVisit: 'expense-tracker-first-visit',
};

export class Repository {
    /**
     * Check if this is the first visit
     */
    isFirstVisit() {
        const visited = localStorage.getItem(STORAGE_KEYS.firstVisit);
        if (!visited) {
            localStorage.setItem(STORAGE_KEYS.firstVisit, 'true');
            return true;
        }
        return false;
    }
    
    /**
     * Load demo data for first-time users
     */
    loadDemoData() {
        // Default categories
        const categories = [
            { id: 'cat-groceries', name: 'Groceries', icon: '🛒', color: '#10b981' },
            { id: 'cat-dining', name: 'Dining', icon: '🍽️', color: '#f59e0b' },
            { id: 'cat-transport', name: 'Transport', icon: '🚗', color: '#3b82f6' },
            { id: 'cat-utilities', name: 'Utilities', icon: '💡', color: '#8b5cf6' },
            { id: 'cat-entertainment', name: 'Entertainment', icon: '🎬', color: '#ec4899' },
        ];
        
        this.setAll('categories', categories);
    }
    
    // ========================================
    // Generic CRUD Operations
    // ========================================
    
    /**
     * Get all items of a type
     */
    getAll(key) {
        try {
            const data = localStorage.getItem(STORAGE_KEYS[key]);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error reading ${key}:`, error);
            return [];
        }
    }
    
    /**
     * Set all items of a type
     */
    setAll(key, data) {
        try {
            localStorage.setItem(STORAGE_KEYS[key], JSON.stringify(data));
        } catch (error) {
            console.error(`Error writing ${key}:`, error);
        }
    }
    
    /**
     * Get a single item by ID
     */
    getById(key, id) {
        const items = this.getAll(key);
        return items.find(item => item.id === id);
    }
    
    /**
     * Add a new item
     */
    add(key, item) {
        const items = this.getAll(key);
        const newItem = {
            ...item,
            id: item.id || this.generateId(key),
            createdAt: new Date().toISOString(),
        };
        items.push(newItem);
        this.setAll(key, items);
        return newItem;
    }
    
    /**
     * Update an existing item
     */
    update(key, id, updates) {
        const items = this.getAll(key);
        const index = items.findIndex(item => item.id === id);
        
        if (index === -1) {
            throw new Error(`Item with id ${id} not found`);
        }
        
        items[index] = {
            ...items[index],
            ...updates,
            updatedAt: new Date().toISOString(),
        };
        
        this.setAll(key, items);
        return items[index];
    }
    
    /**
     * Delete an item
     */
    delete(key, id) {
        const items = this.getAll(key);
        const filtered = items.filter(item => item.id !== id);
        this.setAll(key, filtered);
    }
    
    /**
     * Generate a unique ID
     */
    generateId(prefix) {
        return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }
    
    // ========================================
    // Specialized Queries
    // ========================================
    
    /**
     * Get receipts for a date range
     */
    getReceiptsByDateRange(startDate, endDate) {
        const receipts = this.getAll('receipts');
        return receipts.filter(r => {
            const date = new Date(r.date);
            return date >= startDate && date <= endDate;
        });
    }
    
    /**
     * Get receipts by merchant
     */
    getReceiptsByMerchant(merchantId) {
        const receipts = this.getAll('receipts');
        return receipts.filter(r => r.merchantId === merchantId);
    }
    
    /**
     * Get products by category
     */
    getProductsByCategory(categoryId) {
        const products = this.getAll('products');
        return products.filter(p => p.categoryId === categoryId);
    }
    
    /**
     * Calculate spending by category for a date range
     */
    getSpendingByCategory(startDate, endDate) {
        const receipts = this.getReceiptsByDateRange(startDate, endDate);
        const products = this.getAll('products');
        const categories = this.getAll('categories');
        
        const spending = {};
        
        // Initialize all categories with 0
        categories.forEach(cat => {
            spending[cat.id] = { category: cat, amount: 0 };
        });
        
        // Add uncategorized
        spending['uncategorized'] = { 
            category: { id: 'uncategorized', name: 'Uncategorized', color: '#9ca3af' }, 
            amount: 0 
        };
        
        // Sum up spending
        receipts.forEach(receipt => {
            receipt.items.forEach(item => {
                const product = products.find(p => p.id === item.productId);
                const categoryId = product?.categoryId || 'uncategorized';
                
                if (spending[categoryId]) {
                    spending[categoryId].amount += item.total;
                } else {
                    spending['uncategorized'].amount += item.total;
                }
            });
        });
        
        // Convert to array and filter out zero amounts
        return Object.values(spending).filter(s => s.amount > 0);
    }
    
    // ========================================
    // Import/Export
    // ========================================
    
    /**
     * Export all data as JSON
     */
    exportData() {
        const data = {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            categories: this.getAll('categories'),
            subcategories: this.getAll('subcategories'),
            merchants: this.getAll('merchants'),
            products: this.getAll('products'),
            receipts: this.getAll('receipts'),
        };
        
        return JSON.stringify(data, null, 2);
    }
    
    /**
     * Import data from JSON
     */
    importData(jsonString) {
        try {
            const data = JSON.parse(jsonString);
            
            if (!data.version) {
                throw new Error('Invalid data format: missing version');
            }
            
            if (data.categories) this.setAll('categories', data.categories);
            if (data.subcategories) this.setAll('subcategories', data.subcategories);
            if (data.merchants) this.setAll('merchants', data.merchants);
            if (data.products) this.setAll('products', data.products);
            if (data.receipts) this.setAll('receipts', data.receipts);
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
    
    /**
     * Clear all data
     */
    clearAll() {
        Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
        });
    }
}
```

---

## Canvas Pie Charts

### js/components/pie-chart.js - Complete Implementation

```javascript
/**
 * Canvas-Based Pie Chart Component
 * 
 * Renders a pie chart using the HTML5 Canvas API.
 * No external dependencies required.
 * 
 * Usage:
 *   const chart = new PieChart(canvasElement, {
 *     data: [{ label: 'Food', value: 100, color: '#10b981' }, ...],
 *     showLegend: true,
 *     showLabels: true,
 *     innerRadius: 0.6, // For donut chart (0 = pie, 0.6 = donut)
 *   });
 *   chart.render();
 */

export class PieChart {
    /**
     * Create a new PieChart
     * @param {HTMLCanvasElement} canvas - The canvas element to draw on
     * @param {Object} options - Chart options
     */
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // Default options
        this.options = {
            data: [],
            showLegend: true,
            showLabels: true,
            showTooltip: true,
            innerRadius: 0.6,  // 0 = full pie, 0-1 = donut
            padding: 20,
            legendPosition: 'bottom',
            animationDuration: 500,
            ...options
        };
        
        // State
        this.hoveredSegment = null;
        this.animationProgress = 0;
        
        // Bind methods
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.handleClick = this.handleClick.bind(this);
        
        // Set up event listeners
        this.setupEvents();
        
        // Handle high DPI displays
        this.setupCanvas();
    }
    
    /**
     * Set up canvas for high DPI displays
     */
    setupCanvas() {
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        // Store display dimensions
        this.width = rect.width;
        this.height = rect.height;
    }
    
    /**
     * Set up mouse events
     */
    setupEvents() {
        this.canvas.addEventListener('mousemove', this.handleMouseMove);
        this.canvas.addEventListener('mouseleave', this.handleMouseLeave);
        this.canvas.addEventListener('click', this.handleClick);
    }
    
    /**
     * Clean up events
     */
    destroy() {
        this.canvas.removeEventListener('mousemove', this.handleMouseMove);
        this.canvas.removeEventListener('mouseleave', this.handleMouseLeave);
        this.canvas.removeEventListener('click', this.handleClick);
    }
    
    /**
     * Update chart data and re-render
     */
    update(data) {
        this.options.data = data;
        this.animate();
    }
    
    /**
     * Animate the chart
     */
    animate() {
        const startTime = performance.now();
        const duration = this.options.animationDuration;
        
        const step = (currentTime) => {
            const elapsed = currentTime - startTime;
            this.animationProgress = Math.min(elapsed / duration, 1);
            
            // Easing function (ease-out)
            const eased = 1 - Math.pow(1 - this.animationProgress, 3);
            
            this.render(eased);
            
            if (this.animationProgress < 1) {
                requestAnimationFrame(step);
            }
        };
        
        requestAnimationFrame(step);
    }
    
    /**
     * Render the chart
     */
    render(animationProgress = 1) {
        const { ctx, width, height, options } = this;
        const { data, padding, innerRadius, showLegend, legendPosition } = options;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        if (!data || data.length === 0) {
            this.renderEmpty();
            return;
        }
        
        // Calculate total
        const total = data.reduce((sum, item) => sum + item.value, 0);
        
        if (total === 0) {
            this.renderEmpty();
            return;
        }
        
        // Calculate chart dimensions
        const legendHeight = showLegend && legendPosition === 'bottom' ? 80 : 0;
        const chartHeight = height - legendHeight - padding * 2;
        const chartWidth = width - padding * 2;
        
        // Center and radius
        const centerX = width / 2;
        const centerY = padding + chartHeight / 2;
        const radius = Math.min(chartWidth, chartHeight) / 2 - 10;
        const innerRadiusPx = radius * innerRadius;
        
        // Draw segments
        let currentAngle = -Math.PI / 2; // Start at top
        
        data.forEach((item, index) => {
            const sliceAngle = (item.value / total) * Math.PI * 2 * animationProgress;
            const isHovered = this.hoveredSegment === index;
            
            // Draw segment
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(
                centerX, 
                centerY, 
                isHovered ? radius + 5 : radius, 
                currentAngle, 
                currentAngle + sliceAngle
            );
            ctx.closePath();
            
            // Fill with color
            ctx.fillStyle = item.color || this.getDefaultColor(index);
            ctx.fill();
            
            // Draw inner circle for donut
            if (innerRadius > 0) {
                ctx.beginPath();
                ctx.arc(centerX, centerY, innerRadiusPx, 0, Math.PI * 2);
                ctx.fillStyle = getComputedStyle(document.documentElement)
                    .getPropertyValue('--color-background').trim() || '#ffffff';
                ctx.fill();
            }
            
            // Store segment info for hit detection
            item._startAngle = currentAngle;
            item._endAngle = currentAngle + sliceAngle;
            item._centerX = centerX;
            item._centerY = centerY;
            item._radius = radius;
            item._innerRadius = innerRadiusPx;
            
            currentAngle += sliceAngle;
        });
        
        // Draw center text (total)
        if (innerRadius > 0 && animationProgress === 1) {
            ctx.fillStyle = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-text-primary').trim() || '#000000';
            ctx.font = 'bold 1.5rem -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(this.formatCurrency(total), centerX, centerY - 10);
            
            ctx.fillStyle = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-text-secondary').trim() || '#666666';
            ctx.font = '0.875rem -apple-system, sans-serif';
            ctx.fillText('Total', centerX, centerY + 15);
        }
        
        // Draw legend
        if (showLegend && legendPosition === 'bottom' && animationProgress === 1) {
            this.renderLegend(data, total, padding, height - legendHeight + 10);
        }
        
        // Draw tooltip
        if (this.hoveredSegment !== null && animationProgress === 1) {
            this.renderTooltip(data[this.hoveredSegment], total);
        }
    }
    
    /**
     * Render empty state
     */
    renderEmpty() {
        const { ctx, width, height } = this;
        
        ctx.fillStyle = getComputedStyle(document.documentElement)
            .getPropertyValue('--color-text-muted').trim() || '#999999';
        ctx.font = '1rem -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No data to display', width / 2, height / 2);
    }
    
    /**
     * Render legend
     */
    renderLegend(data, total, x, y) {
        const { ctx, width } = this;
        const itemWidth = Math.min(150, (width - 40) / Math.min(data.length, 3));
        const startX = (width - itemWidth * Math.min(data.length, 3)) / 2;
        
        data.slice(0, 6).forEach((item, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;
            const itemX = startX + col * itemWidth;
            const itemY = y + row * 25;
            
            // Color dot
            ctx.beginPath();
            ctx.arc(itemX + 8, itemY + 8, 6, 0, Math.PI * 2);
            ctx.fillStyle = item.color || this.getDefaultColor(index);
            ctx.fill();
            
            // Label
            ctx.fillStyle = getComputedStyle(document.documentElement)
                .getPropertyValue('--color-text-primary').trim() || '#000000';
            ctx.font = '0.75rem -apple-system, sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            const percentage = ((item.value / total) * 100).toFixed(1);
            const label = `${item.label} (${percentage}%)`;
            ctx.fillText(label.substring(0, 20), itemX + 20, itemY + 8);
        });
    }
    
    /**
     * Render tooltip
     */
    renderTooltip(item, total) {
        const { ctx, width } = this;
        const percentage = ((item.value / total) * 100).toFixed(1);
        const text = `${item.label}: ${this.formatCurrency(item.value)} (${percentage}%)`;
        
        const padding = 10;
        const textMetrics = ctx.measureText(text);
        const tooltipWidth = textMetrics.width + padding * 2;
        const tooltipHeight = 30;
        
        const x = (width - tooltipWidth) / 2;
        const y = 10;
        
        // Background
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.beginPath();
        ctx.roundRect(x, y, tooltipWidth, tooltipHeight, 5);
        ctx.fill();
        
        // Text
        ctx.fillStyle = '#ffffff';
        ctx.font = '0.875rem -apple-system, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(text, width / 2, y + tooltipHeight / 2);
    }
    
    /**
     * Handle mouse move for hover effects
     */
    handleMouseMove(event) {
        const rect = this.canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        const { data } = this.options;
        let foundSegment = null;
        
        for (let i = 0; i < data.length; i++) {
            const item = data[i];
            if (this.isPointInSegment(x, y, item)) {
                foundSegment = i;
                break;
            }
        }
        
        if (foundSegment !== this.hoveredSegment) {
            this.hoveredSegment = foundSegment;
            this.canvas.style.cursor = foundSegment !== null ? 'pointer' : 'default';
            this.render();
        }
    }
    
    /**
     * Handle mouse leave
     */
    handleMouseLeave() {
        if (this.hoveredSegment !== null) {
            this.hoveredSegment = null;
            this.render();
        }
    }
    
    /**
     * Handle click
     */
    handleClick(event) {
        if (this.hoveredSegment !== null && this.options.onClick) {
            this.options.onClick(this.options.data[this.hoveredSegment], this.hoveredSegment);
        }
    }
    
    /**
     * Check if a point is inside a pie segment
     */
    isPointInSegment(x, y, segment) {
        const dx = x - segment._centerX;
        const dy = y - segment._centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if within radius
        if (distance < segment._innerRadius || distance > segment._radius) {
            return false;
        }
        
        // Calculate angle
        let angle = Math.atan2(dy, dx);
        
        // Normalize angles
        let startAngle = segment._startAngle;
        let endAngle = segment._endAngle;
        
        // Handle angle wrapping
        while (angle < startAngle) angle += Math.PI * 2;
        while (endAngle < startAngle) endAngle += Math.PI * 2;
        
        return angle >= startAngle && angle <= endAngle;
    }
    
    /**
     * Get default color for index
     */
    getDefaultColor(index) {
        const colors = [
            '#10b981', // Green
            '#f59e0b', // Amber
            '#3b82f6', // Blue
            '#8b5cf6', // Purple
            '#ec4899', // Pink
            '#06b6d4', // Cyan
            '#f97316', // Orange
            '#84cc16', // Lime
        ];
        return colors[index % colors.length];
    }
    
    /**
     * Format number as currency
     */
    formatCurrency(value) {
        return new Intl.NumberFormat('pt-PT', {
            style: 'currency',
            currency: 'EUR',
        }).format(value);
    }
}

/**
 * Helper function to create a pie chart in a container
 */
export function createPieChart(containerId, data, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container ${containerId} not found`);
        return null;
    }
    
    // Create canvas
    const canvas = document.createElement('canvas');
    canvas.style.width = '100%';
    canvas.style.height = '300px';
    container.innerHTML = '';
    container.appendChild(canvas);
    
    // Create and render chart
    const chart = new PieChart(canvas, { data, ...options });
    chart.animate();
    
    return chart;
}
```

### Usage Example in a Page

```javascript
// In pages/dashboard.js or pages/insights.js
import { createPieChart } from '../components/pie-chart.js';

export const DashboardPage = {
    render() {
        return `
            <div class="page dashboard-page">
                <h1>Dashboard</h1>
                
                <section class="chart-section">
                    <h2>Spending by Category</h2>
                    <div id="category-chart" class="chart-container"></div>
                </section>
                
                <!-- Other dashboard content -->
            </div>
        `;
    },
    
    init() {
        // Get spending data
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1);
        
        const spending = App.repository.getSpendingByCategory(startDate, endDate);
        
        // Transform to chart data
        const chartData = spending.map(s => ({
            label: s.category.name,
            value: s.amount,
            color: s.category.color,
        }));
        
        // Create chart
        createPieChart('category-chart', chartData, {
            innerRadius: 0.6,
            showLegend: true,
            onClick: (item) => {
                App.router.navigate(`/categories/${item.id}`);
            },
        });
    }
};
```

---

## Component Patterns

### Using Template Elements

```javascript
/**
 * Clone a template and populate with data
 */
function createFromTemplate(templateId, data) {
    const template = document.getElementById(templateId);
    const clone = template.content.cloneNode(true);
    
    // Populate data attributes
    Object.entries(data).forEach(([key, value]) => {
        const element = clone.querySelector(`[data-field="${key}"]`);
        if (element) {
            if (element.tagName === 'IMG') {
                element.src = value;
            } else {
                element.textContent = value;
            }
        }
    });
    
    return clone;
}

// Usage
const cardData = {
    merchantName: 'Supermarket',
    date: '2024-01-15',
    total: '€45.99'
};
const card = createFromTemplate('template-receipt-card', cardData);
document.getElementById('receipt-list').appendChild(card);
```

### Creating Components Programmatically

```javascript
/**
 * Create an element with attributes and children
 */
function createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);
    
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'className') {
            element.className = value;
        } else if (key === 'onclick' || key.startsWith('on')) {
            element.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key === 'style' && typeof value === 'object') {
            Object.assign(element.style, value);
        } else {
            element.setAttribute(key, value);
        }
    });
    
    children.forEach(child => {
        if (typeof child === 'string') {
            element.appendChild(document.createTextNode(child));
        } else if (child) {
            element.appendChild(child);
        }
    });
    
    return element;
}

// Usage
const button = createElement('button', {
    className: 'btn btn-primary',
    onclick: () => console.log('Clicked!')
}, ['Click me']);
```

---

## JSON Import/Export

### Complete Implementation

```javascript
/**
 * Export data as downloadable JSON file
 */
function exportData() {
    const data = App.repository.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    App.toast.show('Data exported successfully!', 'success');
}

/**
 * Import data from JSON file
 */
function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    
    input.onchange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
        
        try {
            const text = await file.text();
            const result = App.repository.importData(text);
            
            if (result.success) {
                App.toast.show('Data imported successfully!', 'success');
                App.router.refresh();
            } else {
                App.toast.show(`Import failed: ${result.error}`, 'error');
            }
        } catch (error) {
            App.toast.show('Failed to read file', 'error');
        }
    };
    
    input.click();
}

/**
 * Clear all data with confirmation
 */
function clearAllData() {
    if (confirm('Are you sure you want to delete all data? This cannot be undone.')) {
        App.repository.clearAll();
        App.toast.show('All data cleared', 'success');
        App.router.navigate('/');
    }
}
```

---

## Complete Code Examples

### Settings Page with Import/Export

```javascript
// js/pages/settings.js

export const SettingsPage = {
    render() {
        const settings = App.repository.getAll('settings') || {};
        const theme = settings.theme || 'system';
        
        return `
            <div class="page settings-page">
                <h1>Settings</h1>
                
                <!-- Theme Selection -->
                <section class="settings-section">
                    <h2>Appearance</h2>
                    <div class="form-group">
                        <label class="form-label">Theme</label>
                        <select id="theme-select" class="form-input form-select">
                            <option value="system" ${theme === 'system' ? 'selected' : ''}>System</option>
                            <option value="light" ${theme === 'light' ? 'selected' : ''}>Light</option>
                            <option value="dark" ${theme === 'dark' ? 'selected' : ''}>Dark</option>
                        </select>
                    </div>
                </section>
                
                <!-- Data Management -->
                <section class="settings-section">
                    <h2>Data Management</h2>
                    <div class="button-group">
                        <button id="export-btn" class="btn btn-secondary">
                            📤 Export Data
                        </button>
                        <button id="import-btn" class="btn btn-secondary">
                            📥 Import Data
                        </button>
                    </div>
                </section>
                
                <!-- Danger Zone -->
                <section class="settings-section danger-zone">
                    <h2>Danger Zone</h2>
                    <button id="clear-btn" class="btn btn-danger">
                        🗑️ Clear All Data
                    </button>
                </section>
            </div>
        `;
    },
    
    init() {
        // Theme selection
        document.getElementById('theme-select').addEventListener('change', (e) => {
            const theme = e.target.value;
            this.setTheme(theme);
            App.repository.update('settings', 'user', { theme });
            App.toast.show('Theme updated', 'success');
        });
        
        // Export
        document.getElementById('export-btn').addEventListener('click', () => {
            const data = App.repository.exportData();
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `expense-backup-${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            URL.revokeObjectURL(url);
            App.toast.show('Data exported!', 'success');
        });
        
        // Import
        document.getElementById('import-btn').addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.json';
            
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (!file) return;
                
                const text = await file.text();
                const result = App.repository.importData(text);
                
                if (result.success) {
                    App.toast.show('Data imported!', 'success');
                    App.router.refresh();
                } else {
                    App.toast.show('Import failed: ' + result.error, 'error');
                }
            };
            
            input.click();
        });
        
        // Clear data
        document.getElementById('clear-btn').addEventListener('click', () => {
            if (confirm('Delete ALL data? This cannot be undone!')) {
                App.repository.clearAll();
                App.toast.show('All data cleared', 'success');
                App.router.navigate('/');
            }
        });
    },
    
    setTheme(theme) {
        document.documentElement.classList.remove('light', 'dark');
        
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else if (theme === 'light') {
            document.documentElement.classList.add('light');
        }
        // 'system' uses media query
    }
};
```

---

## Kanban Board for Development

### Phase 1: Foundation (Week 1)

| Status | Task | Description |
|--------|------|-------------|
| ☐ TODO | Project Setup | Create folder structure, index.html, CSS files |
| ☐ TODO | CSS Variables | Define design tokens in main.css |
| ☐ TODO | Base Styles | Reset, typography, layout styles |
| ☐ TODO | Component CSS | Buttons, cards, forms, modal styles |
| ☐ TODO | Router | Implement hash-based routing |
| ☐ TODO | Repository | LocalStorage data layer |

### Phase 2: Core Components (Week 2)

| Status | Task | Description |
|--------|------|-------------|
| ☐ TODO | Header Component | App header with title, actions |
| ☐ TODO | Navigation | Bottom navigation bar |
| ☐ TODO | Modal Component | Reusable modal dialogs |
| ☐ TODO | Toast Component | Notification toasts |
| ☐ TODO | Empty State | No-data placeholder component |
| ☐ TODO | List Card | Reusable list item card |

### Phase 3: Pages (Week 3-4)

| Status | Task | Description |
|--------|------|-------------|
| ☐ TODO | Dashboard Page | Overview with stats and chart |
| ☐ TODO | Pie Chart | Canvas-based category chart |
| ☐ TODO | Receipts List | Receipt listing with search |
| ☐ TODO | Receipt Form | Add/edit receipt modal |
| ☐ TODO | Receipt Detail | Single receipt view |
| ☐ TODO | Merchants Page | Merchant list and management |
| ☐ TODO | Products Page | Product list and management |
| ☐ TODO | Categories Page | Category management |
| ☐ TODO | Insights Page | Analytics and trends |
| ☐ TODO | Settings Page | App settings, import/export |

### Phase 4: Features (Week 5)

| Status | Task | Description |
|--------|------|-------------|
| ☐ TODO | Search | Global search functionality |
| ☐ TODO | Filtering | Date range, category filters |
| ☐ TODO | Sorting | Sort lists by various fields |
| ☐ TODO | QR Scanner | ATCUD QR code parsing |
| ☐ TODO | Price History | Track product prices over time |
| ☐ TODO | Dark Mode | Theme toggle implementation |

### Phase 5: Polish (Week 6)

| Status | Task | Description |
|--------|------|-------------|
| ☐ TODO | PWA Setup | Manifest, service worker |
| ☐ TODO | Offline Support | Cache assets for offline use |
| ☐ TODO | Animations | Smooth transitions |
| ☐ TODO | Accessibility | ARIA labels, keyboard nav |
| ☐ TODO | Performance | Optimize rendering |
| ☐ TODO | Testing | Manual testing, bug fixes |

---

## Deployment

### Static Hosting (GitHub Pages, Netlify, etc.)

Since this is pure HTML/CSS/JS with no build step:

1. Push all files to a Git repository
2. Enable GitHub Pages or connect to Netlify
3. Set the root directory as the deploy folder
4. Done! No build configuration needed

### Local Development

```bash
# Option 1: Python
python -m http.server 8080

# Option 2: Node.js
npx serve .

# Option 3: PHP
php -S localhost:8080

# Then open http://localhost:8080
```

---

## Migration Notes

### From React to Vanilla JS

| React Concept | Vanilla JS Equivalent |
|--------------|----------------------|
| useState | Class properties + render() |
| useEffect | init() method after render |
| Components | Object with render/init methods |
| Props | Function parameters |
| Context | Global App object |
| React Router | Hash-based router |
| npm packages | CDN or copy to /lib folder |

### Key Differences

1. **No Virtual DOM**: Direct DOM manipulation, so be mindful of performance
2. **No JSX**: Use template literals or createElement
3. **No Build Step**: Everything runs directly in browser
4. **Manual State**: Update DOM explicitly when state changes

---

## Summary

This guide provides everything needed to rebuild the Expense Tracker as a vanilla HTML/CSS/JS application:

- ✅ Complete project structure
- ✅ CSS architecture with design tokens
- ✅ Hash-based SPA routing
- ✅ LocalStorage repository pattern
- ✅ Canvas-based pie charts (no libraries)
- ✅ Component patterns without frameworks
- ✅ JSON import/export functionality
- ✅ Development kanban board
- ✅ Deployment instructions

The result is a lightweight, dependency-free application that runs anywhere and is easy to understand and maintain.
