PRODUCT REQUIREMENTS DOCUMENT (PRD)
🧠 Product Title

MetalWatch — Exotic Metals Price Tracker

🎯 Problem Statement

Investors and users interested in precious metals often rely on fragmented sources to track prices. There is no simple, mobile-first interface that presents clean, real-time-ish metal pricing with intuitive visualization.

💡 Solution Overview

MetalWatch is a React Native mobile application that provides:

Live (near real-time) prices of exotic metals
Clean, minimal UI for quick insights
Interactive graphs for historical trends

The app focuses on clarity, speed, and usability, especially on low-end devices.

👥 Target Users
Casual investors
Students / learners
Users tracking gold & silver prices in India
📱 Core Features

1. Landing Screen (Home)
   Tiles for:
   Gold (XAU)
   Silver (XAG)
   Platinum (XPT)
   Palladium (XPD)
   Each tile shows:
   Metal name
   Purity (e.g., 24K, 22K)
   Current price (INR/gram)
   Price change (↑ / ↓)
   Last updated timestamp
2. Detail Screen (Graph View)
   Interactive line chart
   Time filters:
   1 Day
   1 Week
   1 Month
   1 Year
   Features:
   Zoom & pan
   Tooltip on touch
   Smooth transitions
   🌐 API Strategy
   Primary API
   Metals-API
   Data Handling
   Convert USD → INR
   Convert ounce → gram
   Derive purity pricing
   🧮 Data Transformation Logic
   Convert ounce → gram
   Apply INR conversion
   Calculate purity values (22K, 18K)
   ⚙️ Technical Architecture
   API Layer (Metals API)
   ↓
   Adapter Layer (conversion + purity)
   ↓
   State Layer (React Query cache)
   ↓
   UI Layer (Tiles + Graph)
   ⚡ Performance Considerations
   API polling every 60 seconds
   Cached responses using React Query
   Skeleton loaders instead of spinners
   Optimized chart rendering (limited data points)
   Memoized components to prevent re-renders
   🎨 UI/UX Principles
   Minimal and modern
   High readability
   Subtle animations (not heavy)
   Color-coded trends:
   Green → price increase
   Red → price decrease
   🎬 Animations
   Card press scale effect
   Smooth screen transitions
   Graph fade-in animation
   Subtle number change transitions
   🚧 Constraints
   2-day development timeline
   Free-tier API usage
   Must work on low-end Android devices
