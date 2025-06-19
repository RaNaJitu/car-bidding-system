# 🚗 Car Bidding System

A real-time car auction platform built using **NestJS**, **PostgreSQL**, **Redis**, **RabbitMQ**, and **Socket.IO**. This system supports high-concurrency bid placement, automatic auction status transitions, live bid updates, and leaderboard features.

---

## 📌 Features

- ✅ Create time-bound car auctions
- ✅ Automatically transition auction status (PENDING → ACTIVE → COMPLETED)
- ✅ Place bids with validation against the current highest bid
- ✅ Store and serve bid history and leaderboards
- ✅ Real-time bid updates using WebSockets
- ✅ Redis caching for high-performance bid validation
- ✅ RabbitMQ message queuing for decoupled bid persistence
- ✅ Swagger UI documentation for APIs
- ✅ Bid simulation script to test concurrency and robustness

---

## 🛠️ Tech Stack

| Layer        | Technology     |
|--------------|----------------|
| Framework    | NestJS         |
| Database     | PostgreSQL (via Prisma ORM) |
| Cache        | Redis          |
| Queue        | RabbitMQ       |
| Real-Time    | Socket.IO      |
| Scheduler    | @nestjs/schedule |
| API Docs     | Swagger        |

---

## 🧱 Project Structure

src/
├── auctions/ # Auction logic (CRUD, scheduler, leaderboard)
├── bids/ # Bid service, controller, gateway
├── users/ # Basic user management
├── redis/ # Redis client setup
├── rabbitmq/ # RabbitMQ publish/consume logic
├── prisma/ # DB schema & service
├── main.ts # App bootstrap
└── simulate-bids.ts # Bid concurrency tester




---

## 🚀 Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/your-username/car-bidding-system.git
cd car-bidding-system
npm install
