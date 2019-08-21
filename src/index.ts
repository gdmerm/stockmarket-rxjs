import { of, from, interval } from "rxjs";
import { map, tap, delay, mergeMap, takeUntil } from "rxjs/operators";

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
  orderType: "lmt" | "mrk";
  price: number;
}

interface Level2 {
  buy: Array<StockOrder>;
  sell: Array<StockOrder>;
}

const level2: Level2 = {
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
  const { [side]: orders } = level2;
  const order = { side, total, orderType, price };
  level2[side] = [...orders, order];
};

const orders = [
  {
    side: "buy",
    total: 3000,
    orderType: "lmt",
    price: 41
  },
  {
    side: "buy",
    total: 5000,
    orderType: "lmt",
    price: 39
  }
];
const index = 0;
const orders$ = interval(2000)
  .pipe(
    map(() => orders[index]),
    tap(() => index++)
  )
  .subscribe(console.log);
