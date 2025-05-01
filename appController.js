const express = require("express");
const appService = require("./appService");

const router = express.Router();
// NOTE: Much of the code is inspired from/ based on the example code given by the course.


// ----------------------------------------------------------
// API endpoints
// Modify or extend these routes based on your project's needs.
router.get("/check-db-connection", async (req, res) => {
  const isConnect = await appService.testOracleConnection();
  if (isConnect) {
    res.send("connected");
  } else {
    res.send("unable to connect");
  }
});

router.post("/run-SQL-scripts", async (req, res) => {
  const initiateDatabase = await appService.runSQLScript();
  if (initiateDatabase) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.get("/demotable", async (req, res) => {
  const tableContent = await appService.fetchDemotableFromDb();
  res.json({ data: tableContent });
});

router.post("/initiate-demotable", async (req, res) => {
  const initiateResult = await appService.initiateDemotable();
  if (initiateResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/insert-demotable", async (req, res) => {
  const { id, name } = req.body;
  const insertResult = await appService.insertDemotable(id, name);
  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/update-name-demotable", async (req, res) => {
  const { oldName, newName } = req.body;
  const updateResult = await appService.updateNameDemotable(oldName, newName);
  if (updateResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.get("/count-demotable", async (req, res) => {
  const tableCount = await appService.countDemotable();
  if (tableCount >= 0) {
    res.json({
      success: true,
      count: tableCount,
    });
  } else {
    res.status(500).json({
      success: false,
      count: tableCount,
    });
  }
});

// router.post("/initiate-stockTable", async (req, res) => {
//   const initiateResult = await appService.initiateStockExchange();
//   if (initiateResult) {
//     res.json({ success: true });
//   } else {
//     res.status(500).json({ success: false });
//   }
// });

router.post("/insert-stock", async (req, res) => {
  const { tickerID, price, marketCap, shares, volume, StockExchangeName } =
    req.body;
  const insertResult = await appService.insertStockExchange(
    tickerID,
    price,
    marketCap,
    shares,
    volume,
    StockExchangeName
  );
  if (insertResult === "ForeignKeyViolated") {
    res.status(400).json({
      success: false,
      message:
        "Foreign key violation: the referenced stock exchange does not exist.",
    });
  }
  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.delete("/delete-stock/:ticker", async (req, res) => {
  try {
    const { ticker } = req.params;
    const deleteResult = await appService.deleteStockById(ticker);

    if (!deleteResult) {
      return res.status(404).json({ error: "Stock not found" });
    }
    res.json({ message: "Stock deleted successfully" });
  } catch (error) {
    console.error("Error deleting stock:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/stockExchangeTable", async (req, res) => {
  const tableContent = await appService.fetchStockExchangeTableFromDb();
  res.json({ data: tableContent });
});


router.get("/ExchangeAndLocation", async (req, res) => {
  const tableContent = await appService.fetchExchangeAndLocationFromDb();
  res.json({ data: tableContent });
});

//LocationAndCurrency stuff
router.get("/LocationAndCurrency", async (req, res) => {
  const tableContent = await appService.fetchLocationAndCurrencyFromDb();
  res.json({ data: tableContent });
});

// router.post("/initiate-LocationAndCurrency", async (req, res) => {
//   const initiateResult = await appService.initiateLocationAndCurrency();
//   if (initiateResult) {
//     res.json({ success: true });
//   } else {
//     res.status(500).json({ success: false });
//   }
// });

router.post("/insert-LocationAndCurrency", async (req, res) => {
  const { location, currency } = req.body;
  const insertResult = await appService.insertLocationAndCurrency(
    location,
    currency
  );
  if (insertResult) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.get("/count-LocationAndCurrency", async (req, res) => {
  const tableCount = await appService.countLocationAndCurrency();
  if (tableCount >= 0) {
    res.json({
      success: true,
      count: tableCount,
    });
  } else {
    res.status(500).json({
      success: false,
      count: tableCount,
    });
  }
});

router.delete("/delete-LocationAndCurrency/:location", async (req, res) => {
  const location = req.params.location;
  const result = await appService.deleteLocationAndCurrency(location);
  if (result) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/update-stock", async (req, res) => {
  const {
    tickerID,
    newPrice,
    newMarketCap,
    newVolume,
    newShares,
    newExchangeName,
  } = req.body;

  const success = await appService.updateStockExchange(
    tickerID,
    newPrice,
    newMarketCap,
    newVolume,
    newShares,
    newExchangeName
  );
  if (success) {
    res.json({ success: true });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/select-stock", async (req, res) => {
  const { conditions } = req.body;
  const results = await appService.selectStockWithConditions(conditions);

  if (results) {
    res.json({ success: true, data: results });
  } else {
    res.status(500).json({ success: false });
  }
});

router.post("/project-stock", async (req, res) => {
  const { columns } = req.body;
  const result = await appService.projectStockExchange(columns);

  if (result) {
    res.json({ success: true, data: result });
  } else {
    res
      .status(500)
      .json({ success: false, message: "Projection query failed" });
  }
});

//stock exchange location stuff
router.get("/StockExchangeLocation", async (req, res) => {
  const tableContent = await appService.fetchStockExchangeLocationFromDb();
  res.json({ data: tableContent });
});

router.post("/join-LocationAndExchange", async (req, res) => {
  const { currencyLocation } = req.body;
  const results = await appService.joinLocationCurrencyExchange(
    currencyLocation
  );
  // console.log(3);
  // console.log(results);
  if (results) {
    res.json({ success: true, data: results });
  } else {
    res.status(500).json({ success: false });
  }
});

// router.post("/initiate-StockExchangeLocation", async (req, res) => {
//   const initiateResult = await appService.initiateStockExchangeLocation();
//   if (initiateResult) {
//     res.json({ success: true });
//   } else {
//     res.status(500).json({ success: false });
//   }
// });

router.get("/divide-stockExchange", async (req, res) => {
  const tableContent = await appService.divideStockExchange();
  res.json({ data: tableContent });
});

router.get("/aggregated-groupby-stockExchange", async (req, res) => {
  const tableContent = await appService.aggregateGroupByStockExchange();
  res.json({ data: tableContent });
});

router.get("/aggregated-having-stockExchange", async (req, res) => {
  const tableContent = await appService.aggregateHavingStockExchange();
  res.json({ data: tableContent });
});

router.get("/nested-aggregation-stockExchange", async (req, res) => {
  const tableContent = await appService.nestedAggregationStockExchange();
  res.json({ data: tableContent });
});

module.exports = router;
