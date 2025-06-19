# 📦 Auction System Modules

This document lists and describes each module in the Car Auction System, highlighting its responsibilities and interactions.

---

## 🧩 Core Modules

### 1. **AuctionModule**

* **Responsibilities**:

  * Manage auction lifecycle
  * Schedule and update auction status
  * Determine winners
* **Key Providers**:

  * `AuctionService`
  * `AuctionGateway`
* **Imports**:

  * `PrismaModule`, `RedisModule`, `RabbitMQModule`, `BidModule`, `JwtModule`

### 2. **BidModule**

* **Responsibilities**:

  * Place and validate bids
  * Ensure real-time bid updates
  * Publish events to queues and Redis
* **Key Providers**:

  * `BidService`
* **Imports**:

  * `PrismaModule`, `RedisModule`, `RabbitMQModule`, `AuctionModule`

### 3. **UserModule**

* **Responsibilities**:

  * Manage user registration and lookup
  * Used for linking bids to users
* **Key Providers**:

  * `UserService`
* **Imports**:

  * `PrismaModule`

### 4. **AuthModule**

* **Responsibilities**:

  * JWT Authentication
  * Redis-based token blacklisting
  * Guards for securing APIs and WebSockets
* **Key Providers**:

  * `AuthService`, `JwtBlacklistGuard`, `JwtAuthGuard`
* **Imports**:

  * `JwtModule`, `RedisModule`, `UserModule`

---

## ⚙️ Infrastructure Modules

### 5. **RedisModule**

* **Responsibilities**:

  * Redis Pub/Sub
  * Manage WebSocket connections and events
* **Key Providers**:

  * `RedisService`, `RedisSubscriberService`
* **Exports**:

  * `RedisService`

### 6. **RabbitMQModule**

* **Responsibilities**:

  * Send messages to `bid.queue`, `notification.queue`, and `audit.queue`
* **Key Providers**:

  * `RabbitMQService`
* **Exports**:

  * `RabbitMQService`

### 7. **PrismaModule**

* **Responsibilities**:

  * Connects to PostgreSQL database
  * Provides `PrismaService`
* **Exports**:

  * `PrismaService`

---

## 🕑 Scheduler Module

### 8. **ScheduleModule** (from `@nestjs/schedule`)

* **Responsibilities**:

  * Runs background cron jobs
  * Transitions auctions between statuses based on time

---

## 📁 Summary

Each module follows the NestJS modular design pattern and encapsulates a specific concern in the system. This structure ensures that the system is easy to maintain, extend, and test.

By decoupling business logic across feature modules and utilizing infrastructure modules for messaging and real-time updates, the system remains highly scalable and efficient.
