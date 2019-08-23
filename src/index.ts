import { of, from, interval, zip } from "rxjs";
import { map, tap, delay, mergeMap, takeUntil, take } from "rxjs/operators";
import flow from "lodash/flow";
import curry from "lodash/curry";

document.getElementById("app").innerHTML = `
<h1>Hello Parcel!</h1>
<div>
  Look
  <a href="https://parceljs.org" target="_blank" rel="noopener noreferrer">here</a>
  for more info about Parcel.
</div>
`;

interface StockOrder {
  side: "sell" | "buy";
  total: number;
  orderType?: "lmt" | "mrk";
  price?: number;
  trader: string;
}

interface Level2 {
  buy: Array<StockOrder>;
  sell: Array<StockOrder>;
}

interface TimeOfSales {
  timestamp: Date;
  price: number;
}

type TradeSide = 'buy' | 'sell';

/**
 * The level2 orderbook.
 * - Buyers are sorted by descending price order (highest price first)
 * - Sellers are sorted by ascending price order (lowest price first)
 * The idea is that buyers can buy at the most affordable price and
 * sellers can sell at the best price.
 */
const orderBook: Level2 = {
  buy: [],
  sell: []
};

/**
 * The ToS. This will hold records of all executions.
 */
let ToS = [];
const getLevelOne = () => [orderBook.buy[0], orderBook.sell[0]];
const getOrdersBySide = side => orderBook[side];


function addStockOrder(order: StockOrder) {
  console.log("=== incoming order ===", order);

  function sortBookOrders(side, orders) {
    orderBook[side] = orders.sort((prev: StockOrder, next: StockOrder) =>
      side === "buy" ? next.price - prev.price : prev.price - next.price
    );
  }

  const { side } = order;
  const mergeOrdersWith = curry((order, orderBookOrders) => [
    ...orderBookOrders,
    order
  ]);
  const sortBookOrdersOf = curry(sortBookOrders);

  flow([
    getOrdersBySide, 
    mergeOrdersWith(order), 
    sortBookOrdersOf(side)
  ])(side);
};

function updateTradeOrderAt(side: TradeSide, trade: StockOrder) {
  let newArray = orderBook[side].slice();
  newArray[0] = {...trade};
  orderBook[side] = newArray;
}

function removeTradeFrom(side: TradeSide) {
  let newArray = orderBook[side].slice();
  const trade = newArray.splice(0, 1);
  orderBook[side] = newArray;
  return trade;
}

/**
 * @description
 * unfinished implementation of the reconciliation algorithm
 * that takes place on Level2 on a real stock exchange. The
 * algorithm needs to match buyers and sellers, perform the
 * transactions (execution) and finally update the ToS
 * 
 * UPDATE: Algorithm now works properly for all LIMIT orders. It still doesn't
 * work for MARKET orders as it is incorrectly sorting the MARKET orders on the
 * bottom of the order stack
 */
function reconciliate() {
  const [topBuyer] = orderBook.buy;
  let { total: totalStockRemainingToBuy } = topBuyer;

  const canExecuteTrade = (buy, sell) => buy.price >= sell.price;
  const purchaseStockFrom = seller => totalStockRemainingToBuy -= seller.total;
  const sellerSoldOut = (buy, sell) => sell.total - buy.total <= 0;
  const buyerBuyOut = () => totalStockRemainingToBuy <= 0;
  const buyerHasMoreStocksToBuy = (buyer) => totalStockRemainingToBuy < buyer.total;
  
  function updateSellersWith(seller) {
    console.log(`Asking ${topBuyer.total} stocks out of ${seller.total}`);
    updateTradeOrderAt('sell', { ...seller, total: seller.total - topBuyer.total });
    if (sellerSoldOut(topBuyer, seller)) {
      console.log(`Seller was sold out. Selling ${seller.total} stocks and removing seller from orderBook.`);
      removeTradeFrom('sell');
    }
  }

  console.log('reconciliating with buyer: ', topBuyer);

  for (let i=0,_len = orderBook.sell.length; i < _len; i++) {
    const [topSeller] = orderBook.sell;
    if (canExecuteTrade(topBuyer, topSeller)) {
      purchaseStockFrom(topSeller);
      updateSellersWith(topSeller);
      //this buyer needs no more sellers.
      if (buyerBuyOut()) break;
    } else {
      //do nothing, this seller wants to sell at higher prices
      console.log('This seller is too expensive for this buyer. Ending reconciliation.');
      break;
    }
  }

  if (buyerBuyOut()) {
    console.log('buyer was bought out. Trying the next buyer');
    removeTradeFrom('buy');
    reconciliate();
  } else if (buyerHasMoreStocksToBuy(topBuyer)) {
    console.log(`buyer was partially filled. Waiting for next trades...`);
    updateTradeOrderAt('buy', {...topBuyer, total: totalStockRemainingToBuy});
  }
}

/**
 * This is used to simulate traders adding orders.
 * Later we will be using a real form where a trader can
 * add stock orders, so this array will no longer be needed.
 * (our stream will come by the click event stream on the form
 * submit button).
 */
const orders: Array<StockOrder> = [
  {
    side: "buy",
    total: 3000,
    orderType: "lmt",
    price: 41,
    trader: "p1"
  },
  {
    side: "buy",
    total: 5000,
    orderType: "lmt",
    price: 39,
    trader: "p2"
  },
  {
    side: "sell",
    total: 5000,
    orderType: "lmt",
    price: 30,
    trader: "p2"
  },
  {
    side: "sell",
    total: 5000,
    orderType: "lmt",
    price: 59,
    trader: "p2"
  },
  {
    side: "sell",
    total: 2000,
    orderType: "lmt",
    price: 52,
    trader: "p3"
  },
  {
    side: "buy",
    total: 1000,
    orderType: "lmt",
    price: 50,
    trader: "p5"
  },
  {
    side: "buy",
    total: 1000,
    orderType: "lmt",
    price: 52,
    trader: "p5"
  },
  {
    side: "buy",
    total: 2000,
    orderType: "lmt",
    price: 48,
    trader: "p6"
  },
  {
    side: "sell",
    total: 5000,
    orderType: "lmt",
    price: 51,
    trader: "p7"
  },
  {
    side: "buy",
    total: 5000,
    orderType: "lmt",
    price: 46,
    trader: "p8"
  },
  {
    side: "sell",
    total: 5000,
    orderType: "mrk",
    trader: "p9"
  },
  {
    side: "buy",
    total: 5000,
    orderType: "lmt",
    price: 53,
    trader: "p10"
  },
];

/**
 * @description
 * orders$ is a stream of stock orders. It uses the prepopulated `orders` array
 * to produce a simulated stock market stream where orders are being received every
 * 2 secs.
 */
const ordersSub = zip(interval(200), from(orders))
  .pipe(map(([, o]) => o))
  .subscribe(
    flow([
      addStockOrder,
      reconciliate
    ]),
    () => {},
    () => console.log(`OrderBook: `, orderBook)
  );
