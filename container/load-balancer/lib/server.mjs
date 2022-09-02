import express from "express";
import { serverInstances } from "./config.mjs";
import cookieParser from "cookie-parser";
import http from "http";

const app = express();

const LB_AFFINITY = "lb-affinity";

app.use(cookieParser());

app.get("*", async (req, res) => {
  const affinity = parseInt(req.cookies?.[LB_AFFINITY] || "");
  const index = isNaN(affinity)
    ? Math.floor(Math.random() * serverInstances.length)
    : affinity;

  const instance = serverInstances[index];
  const searchParams = new URLSearchParams();

  for (const param in req.query) {
    searchParams.set(param, req.query[param]);
  }

  const url = new URL(`${req.path}?${searchParams.toString()}`, instance);

  res.setHeader(LB_AFFINITY, `${index} - ${serverInstances[index]}`);

  // Short lived cookie - 5s, to enforce all follow-up requests stick with the same server
  res.cookie(LB_AFFINITY, index, {
    expires: new Date(Date.now() + 500),
    httpOnly: true,
  });

  http.get(url, (proxyReq) => {
    res.setHeader("content-type", proxyReq.headers["content-type"]);
    proxyReq.pipe(res);
  });

  console.log(
    `Proxy request ${req.path} ->`,
    url.toString(),
    `| Affintiy: ${affinity}`,
    ` | Actual: ${index}`
  );
});

app.listen(process.env.PORT, () => {
  console.log(`Load balancer listening on port ${process.env.PORT}`);
});
