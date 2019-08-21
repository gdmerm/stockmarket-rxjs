import { of, from, interval } from "rxjs";
import { map, tap, delay, mergeMap, takeUntil, take } from "rxjs/operators";

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

const orderBook: Level2 = {
  buy: [],
  sell: []
};

const getStockFloat = () =>
  Object.entries(traders).reduce(
    (stockCount, nextStockCount) => stockCount + nextStockCount[1],
    0
  );

const addStockOrder = ({
  side = "buy",
  total = 0,
  orderType = "lmt",
  price = 0
}) => {
  const { [side]: orders } = orderBook;
  const order = { side, total, orderType, price };
  orderBook[side] = [...orders, order];
};

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
const index = 0;
const orders$ = interval(2000)
  .pipe(
    map(() => orders[index]),
    tap(() => index++),
    take(orders.length)
  )
  .subscribe(console.log);
