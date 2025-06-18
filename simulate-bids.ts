import axios from 'axios';

const AUCTION_ID = '37d623ba-c11d-4720-a103-ad2642943616';
const BIDS = [
  { userId: 1, amount: 1000 },
  { userId: 2, amount: 1600 },
  { userId: 3, amount: 2400 },
  { userId: 4, amount: 3000 },
  { userId: 5, amount: 3600 },
  { userId: 6, amount: 4200 },
];

const API_URL = 'http://localhost:3000/bids';

async function simulateBid(bid) {
  try {
    const res = await axios.post(API_URL, {
      auctionId: AUCTION_ID,
      userId: bid.userId,
      amount: bid.amount,
    });
    console.log(`✅ User-${bid.userId} bid accepted: ${bid.amount}`);
  } catch (err: any) {
    console.log(`❌ User-${bid.userId} bid failed: ${err.response?.data?.message}`);
  }
}

async function run() {
  await Promise.all(BIDS.map(bid => simulateBid(bid)));
}

run();
