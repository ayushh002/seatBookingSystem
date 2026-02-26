# 🪑 Seat Booking System

A full‑stack employee seat reservation platform built with the MERN stack, Redis, and modern UI tools.  
Employees can book designated or floater seats based on their batch and squad, with real‑time availability and admin controls.

---

Video Demo 
Linke: https://drive.google.com/file/d/1Ufr33OuYeVKDz82T_bps8D3ig6U6BO_S/view?usp=sharing

## ✨ Features

- **Authentication** – JWT stored in HTTP‑only cookies, protected routes, role‑based access (employee / admin).
- **Booking Rules** – Batch‑specific days, pre‑booking limits, floater time restrictions.
- **Real‑time Availability** – Redis‑cached seat counts, invalidated on booking/cancellation.
- **Dashboard** – Animated stats cards, seat occupancy progress bar, upcoming bookings.
- **Admin Panel** – View all bookings, cancel any booking, squad‑wise analytics.
- **Responsive UI** – DaisyUI + Tailwind, Framer Motion animations, collapsible sidebar.
- **Error Handling** – Centralized error middleware, toast notifications.

---

## 🛠️ Tech Stack

| Frontend          | Backend           | Database & Cache  | Tools             |
| ----------------- | ----------------- | ----------------- | ----------------- |
| React (Vite)      | Node.js + Express | MongoDB (Mongoose)| Redis             |
| Redux Toolkit     | JWT                | Redis             | Tailwind CSS      |
| React Router      | bcrypt             |                   | DaisyUI           |
| React Hook Form   | cookie‑parser      |                   | Framer Motion     |
| Zod               | cors               |                   | date‑fns          |
| Axios             |                    |                   | react‑hot‑toast   |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)
- [Redis](https://redis.io/) (local or cloud)
- npm or yarn

---

## 🚀 Installation

### 1. Clone the repository
```bash
git clone https://github.com/yourusername/seat-booking-system.git
cd seat-booking-system
