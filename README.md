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


📁 2. Configure Environment

Create a .env file in the root with the following content:

DATABASE_URL="postgresql://user:password@localhost:5432/bidding_db"
REDIS_URL="redis://localhost:6379"
RABBITMQ_URL="amqp://localhost"
Update credentials as per your local setup.


🧩 3. Setup Database

Run Prisma migration & generate client:

npx prisma generate
npx prisma migrate dev --name init

🚀 4. Start the App

npm run start:dev
Swagger docs: http://localhost:3000/api

🕑 5. Scheduled Auction Status Updates

The app automatically updates auction status using a cron job that runs every 30 seconds:

PENDING → ACTIVE if current time >= startTime
ACTIVE → COMPLETED if current time >= endTime
@Cron("*/30 * * * * *")
updateAuctionStatus()

⚡ 6. Real-time Bidding

Bids are placed through HTTP or WebSocket and:

Highest bid is cached in Redis for fast comparison
Bids are sent to RabbitMQ
RabbitMQ consumer persists bid into PostgreSQL
Socket.IO emits bid updates to all connected clients

🔄 7. Simulate Concurrent Bids

We simulate multiple users bidding at once using:

simulate-bids.ts
const BIDS = [
  { userId: 1, amount: 1000 },
  { userId: 2, amount: 1600 },
  ...
];

Run Simulation
npx ts-node simulate-bids.ts


🧪 8. API Examples

Create Auction
POST /auctions
{
  "carId": "CAR123",
  "startTime": "2025-06-18T14:00:00Z",
  "endTime": "2025-06-18T14:10:00Z",
  "startingBid": 500
}


Place Bid
POST /bids
{
  "auctionId": "uuid-auction-id",
  "userId": 1,
  "amount": 1500
}

🔐 9. Swagger Docs

Visit: http://localhost:3000/api

✅ Future Improvements

Role-based auth (e.g., Admin/User)
Payment integration for winning bidders
Email notifications for winners
Pagination + filtering in bid history
Monitoring dashboards


👨‍💻 Author

Jeet | @yourusername