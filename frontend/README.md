# Hotel Management System - Frontend

A comprehensive hotel management system built with modern web technologies for efficient hotel operations management.

## 🏨 Overview

This frontend application provides a complete interface for hotel staff to manage:

- **Front Desk Operations**: Room availability, check-ins/check-outs
- **Reservations**: Booking management, guest information
- **Housekeeping**: Room status, maintenance tracking
- **Accounting**: Financial records, cash books
- **Reports**: Analytics and operational insights

## 🛠 Tech Stack

- **Framework**: Vue 3 with Composition API
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS + UnoCSS
- **State Management**: Pinia
- **Icons**: Lucide Icons via UnoCSS
- **Build Tool**: Vite
- **Development**: Hot Module Replacement (HMR)

## 📁 Project Structure

```
src/
├── auth/              # Authentication components
├── component/         # Main UI components
│   ├── frontdesk/     # Front desk specific components
│   └── reservations/  # Reservation management components
├── composables/       # Vue composables (business logic)
├── data/             # Static data files
├── page/             # Page components
├── router/           # Vue router configuration
├── stores/           # Pinia stores
└── types/            # TypeScript type definitions
```

## 🎯 Key Features

### Front Desk Management

- **Room Availability Grid**: 14-day view with real-time status
- **Reservation Blocks**: Visual representation of bookings
- **Guest Check-in/Check-out**: Streamlined process management
- **Room Status Tracking**: Available, occupied, maintenance

### Reservation System

- **Comprehensive Booking Table**: Sortable, filterable reservations
- **Status Management**: Confirmed, pending, checked-in, cancelled
- **Guest Information**: Complete guest profiles and preferences
- **Payment Tracking**: Balance and payment status monitoring

### Type Safety

- **Centralized Types**: All interfaces defined in `types/hotel.ts`
- **Strict TypeScript**: Full type checking across components
- **Enhanced Reservation Interface**: Includes amount, balance, source, orders, booking date, notes

## 🎨 Design System

### Color Scheme

- **Confirmed**: Blue (`bg-blue-100 text-blue-700`)
- **Pending**: Orange (`bg-orange-100 text-orange-700`)
- **Checked In**: Green (`bg-green-100 text-green-700`)
- **Cancelled**: Red (`bg-red-100 text-red-700`)

### UI Patterns

- Consistent spacing with Tailwind utilities
- Hover states and smooth transitions
- Responsive grid layouts
- Modern card-based interfaces

## 🔧 Development Setup

### Prerequisites

- Node.js ^20.19.0 || >=22.12.0
- npm or yarn package manager

### IDE Setup

[VSCode](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (disable Vetur)

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Type-Check, Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
