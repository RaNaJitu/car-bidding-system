const io = require("socket.io-client");

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

const auctionId = "fea224db-b3e8-4e95-afaa-e0d5e4ae5844";

socket.on("connect", () => {
  console.log("✅ Connected to WebSocket");

  socket.emit("joinAuction", { auctionId });

  socket.on("joinedAuction", (msg) => {
    console.log("🟢", msg);
  });

  socket.on("bidUpdate", (bid) => {
    console.log("📡 Bid update:", bid);
  });

  socket.on("auction-ended", (data) => {
    console.log("🏁 Auction ended:", data);
  });
});
