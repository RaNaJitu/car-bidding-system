const io = require("socket.io-client");

const socket = io("http://localhost:3000", {
  transports: ["websocket"],
});

const auctionId = "4f92b1f5-ca5f-42a2-9d7d-7887a82c047c";

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
