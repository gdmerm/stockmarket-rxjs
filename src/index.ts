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

const traders = {
  p1: 40000,
  p2: 10000,
  p3: 2000,
  p4: 0,
  p5: 2000,
  p6: 5000,
  p7: 1000,
  p8: 0,
  p9: 10000,
  p10: 5000
};

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

const ToS = [];

const getStockFloat = () =>
  Object.entries(traders).reduce(
    (stockCount, nextStockCount) => stockCount + nextStockCount[1],
    0
  );
const getLevelOne = () => [orderBook.buy[0], orderBook.sell[0]];
const getOrdersBySide = side => orderBook[side];

function sortBookOrders(side, orders) {
  orderBook[side] = orders.sort((prev: StockOrder, next: StockOrder) =>
    side === "buy" ? next.price - prev.price : prev.price - next.price
  );
}

const addStockOrder = (order: StockOrder) => {
  console.log("=== incoming order ===");
  const { side } = order;
  const mergeOrdersWith = curry((order, orderBookOrders) => [
    ...orderBookOrders,
    order
  ]);
  const sortBookOrdersOf = curry(sortBookOrders);

  flow([getOrdersBySide, mergeOrdersWith(order), sortBookOrdersOf(side)])(side);
};

/**
 * @description
 * unfinished implementation of the reconciliation algorithm
 * that takes place on Level2 on a real stock exchange. The
 * algorithm needs to match buyers and sellers, perform the
 * transactions (execution) and finally update the ToS
 */
function reconciliate() {
  const [topBuyer] = orderBook.buy;
  orderBook.sell = orderBook.sell
    .map(sellOrder => {
      if (topBuyer.price >= sellOrder.price) {
        console.log("purchasing stock!");
        // pending implementation
      } else {
        return sellOrder;
      }
    })
    .filter(x => x);
}

/**
 * This is used to simulate traders adding orders.
 * Later we will be using a real form where a trader can
 * add stock orders, so this array will no longer be needed.
 * (our stream will come by the click event stream on the from
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
    price: 55,
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
    total: 2000,
    orderType: "lmt",
    price: 48,
    trader: "p6"
  },
  {
    side: "sell",
    total: 1000,
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
  }
];

/**
 * @description
 * orders$ is a stream of stock orders. It uses the prepopulated `orders` array
 * to produce a simulated stock market stream where orders are being received every
 * 2 secs.
 */
const ordersSub = zip(interval(800), from(orders))
  .pipe(map(([, o]) => o))
  .subscribe(
    addStockOrder,
    () => {},
    () => console.log(`OrderBook: `, orderBook)
  );
