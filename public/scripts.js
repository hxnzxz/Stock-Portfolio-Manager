/*
 * These functions below are for various webpage functionalities.
 * Each function serves to process data on the frontend:
 *      - Before sending requests to the backend.
 *      - After receiving responses from the backend.
 *
 * To tailor them to your specific needs,
 * adjust or expand these functions to match both your
 *   backend endpoints
 * and
 *   HTML structure.
 *
 */

// NOTE: Much of the code is inspired from/ based on the example code given by the course.

// This function checks the database connection and updates its status on the frontend.
async function checkDbConnection() {
  const statusElem = document.getElementById("dbStatus");
  const loadingGifElem = document.getElementById("loadingGif");

  const response = await fetch("/check-db-connection", {
    method: "GET",
  });

  // Hide the loading GIF once the response is received.
  loadingGifElem.style.display = "none";
  // Display the statusElem's text in the placeholder.
  statusElem.style.display = "inline";

  response
    .text()
    .then((text) => {
      statusElem.textContent = text;
    })
    .catch((error) => {
      statusElem.textContent = "connection timed out"; // Adjust error handling if required.
    });
}

// run SQL scripts
async function runSQLScripts() {
  const response = await fetch("/run-SQL-scripts", {
    method: "POST",
  });
  const responseData = await response.json();

  if (responseData.success) {
    alert("sql script ran successfully!");
  } else {
    alert("Error initiating table!");
  }
  fetchTableData();
}

//template for fetch&display
// Fetches data from the demotable and displays it.

const tableHeaders = {
  demotable: {
    header: ["ID", "Name"],
  },
  LocationAndCurrency: {
    header: ["CurrencyLocation", "Currency"],
  },
  stockExchangeTable: {
    header: ["Ticker", "Price", "MarketCap", "Shares", "Volume", "Exchange"],
  },
  StockExchangeLocation: {
    header: ["Exchange", "Location"],
  },
  LocationAndExchange: {
    header: ["Exchange", "Location", "Currency"],
  },
};
async function fetchAndDisplayUsers() {
  const tableElement = document.getElementById("demotable");
  const tableBody = tableElement.querySelector("tbody");

  const response = await fetch("/demotable", {
    method: "GET",
  });

  const responseData = await response.json();
  const demotableContent = responseData.data;

  // Always clear old, already fetched data before new fetching process.
  if (tableBody) {
    tableBody.innerHTML = "";
  }

  demotableContent.forEach((user) => {
    const row = tableBody.insertRow();
    user.forEach((field, index) => {
      const cell = row.insertCell(index);
      cell.textContent = field;
    });
  });
}

// Fetches data from LocationAndCurrency table and displays it
async function fetchAndDisplayExchangeAndLocation() {
  const tableElement = document.getElementById("StockExchangeLocation");
  const tableBody = tableElement.querySelector("tbody");

  const response = await fetch("/ExchangeAndLocation", {
    method: "GET",
  });

  const responseData = await response.json();
  const ExchangeAndLocation = responseData.data;
  // Always clear old, already fetched data before new fetching process.
  if (tableBody) {
    tableBody.innerHTML = "";
  }

  ExchangeAndLocation.forEach((user) => {
    const row = tableBody.insertRow();
    user.forEach((field, index) => {
      const cell = row.insertCell(index);
      cell.textContent = field;
    });
  });
}

// Fetches data from LocationAndCurrency table and displays it
async function fetchAndDisplayLocationAndCurrency() {
  const tableElement = document.getElementById("LocationAndCurrency");
  const tableBody = tableElement.querySelector("tbody");

  const response = await fetch("/LocationAndCurrency", {
    method: "GET",
  });

  const responseData = await response.json();
  const LocationAndCurrencyContent = responseData.data;
  // Always clear old, already fetched data before new fetching process.
  if (tableBody) {
    tableBody.innerHTML = "";
  }

  LocationAndCurrencyContent.forEach((user) => {
    const row = tableBody.insertRow();
    user.forEach((field, index) => {
      const cell = row.insertCell(index);
      cell.textContent = field;
    });
  });
}

async function insertLocationAndCurrency(event) {
  event.preventDefault();

  const locationValue = document.getElementById("insertLocation").value;
  const currencyValue = document.getElementById("insertCurrency").value;

  const response = await fetch("/insert-LocationAndCurrency", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      location: locationValue,
      currency: currencyValue,
    }),
  });

  const responseData = await response.json();
  const messageElement = document.getElementById(
    "insertLocationAndCurrencyMsg"
  );

  if (responseData.success) {
    messageElement.textContent = "Data inserted successfully!";
    fetchTableData();
  } else {
    messageElement.textContent = "Error inserting data!";
  }
}

// This function resets or initializes the demotable.
async function resetDemotable() {
  const response = await fetch("/initiate-demotable", {
    method: "POST",
  });
  const responseData = await response.json();

  if (responseData.success) {
    const messageElement = document.getElementById("resetResultMsg");
    messageElement.textContent = "demotable initiated successfully!";
    fetchTableData();
  } else {
    alert("Error initiating table!");
  }
}

// Inserts new records into the demotable.
async function insertDemotable(event) {
  event.preventDefault();

  const idValue = document.getElementById("insertId").value;
  const nameValue = document.getElementById("insertName").value;

  const response = await fetch("/insert-demotable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: idValue,
      name: nameValue,
    }),
  });

  const responseData = await response.json();
  const messageElement = document.getElementById("insertResultMsg");

  if (responseData.success) {
    messageElement.textContent = "Data inserted successfully!";
    fetchTableData();
  } else {
    messageElement.textContent = "Error inserting data!";
  }
}

// // This function resets or initializes the stock exchange table.
// async function resetStockExchangeTable() {
//   const response = await fetch("/initiate-stockTable", {
//     method: "POST",
//   });
//   const responseData = await response.json();
//
//   if (responseData.success) {
//     const messageElement = document.getElementById("stockTableResetMsg");
//     messageElement.textContent = "stock-exchange table initiated successfully!";
//     fetchTableData();
//   } else {
//     alert("Error initiating table!");
//   }
// }

// Insert function for StockExchange Relation
async function insertStockExchange(event) {
  event.preventDefault();

  const exchangeValue = document.getElementById("insertExchange").value;
  const tickerValue = document.getElementById("insertTicker").value;
  const priceValue = document.getElementById("insertPrice").value;
  const volumeValue = document.getElementById("insertVolume").value;
  const marketCapValue = document.getElementById("insertMarketCap").value;
  const sharesValue = document.getElementById("insertShares").value;

  if (
    !exchangeValue ||
    !tickerValue ||
    !priceValue ||
    !marketCapValue ||
    !sharesValue ||
    !volumeValue
  ) {
    document.getElementById("insertStockResultMsg").textContent =
      "Please fill in all fields";
    return;
  }

  // makes request to backend with fetch; backend tries to insert into database.
  const response = await fetch("/insert-stock", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      tickerID: tickerValue,
      price: priceValue,
      marketCap: marketCapValue,
      shares: sharesValue,
      volume: volumeValue,
      StockExchangeName: exchangeValue,
    }),
  });

  const responseData = await response.json();
  const messageElement = document.getElementById("insertStockResultMsg");

  if (responseData.success) {
    messageElement.textContent = "Data inserted successfully!";
    fetchTableData();
  } else {
    messageElement.textContent = `Error inserting data: ${responseData.message}`;
  }
}

async function deleteStock(event) {
  event.preventDefault();

  const stockToDelete = document.getElementById("stockToDelete").value;

  const response = await fetch(`/delete-stock/${stockToDelete}`, {
    method: "DELETE",
  });

  const messageElement = document.getElementById("deleteStockMessage");

  if (response.ok) {
    messageElement.textContent = "stock deleted successfully!";
    fetchTableData();
  } else {
    messageElement.textContent = "Error deleting stock!";
  }
}

async function fetchAndDisplayStockExchange() {
  const tableElement = document.getElementById("stockExchangeTable");
  const tableBody = tableElement.querySelector("tbody");

  const response = await fetch("/stockExchangeTable", {
    method: "GET",
  });

  const responseData = await response.json();
  const stockExchangeContent = responseData.data;
  // Always clear old, already fetched data before new fetching process.
  if (tableBody) {
    tableBody.innerHTML = "";
  }

  stockExchangeContent.forEach((user) => {
    const row = tableBody.insertRow();
    user.forEach((field, index) => {
      const cell = row.insertCell(index);
      cell.textContent = field;
    });
  });
}

// Updates names in the demotable.
async function updateNameDemotable(event) {
  event.preventDefault();

  const oldNameValue = document.getElementById("updateOldName").value;
  const newNameValue = document.getElementById("updateNewName").value;

  const response = await fetch("/update-name-demotable", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      oldName: oldNameValue,
      newName: newNameValue,
    }),
  });

  const responseData = await response.json();
  const messageElement = document.getElementById("updateNameResultMsg");

  if (responseData.success) {
    messageElement.textContent = "Name updated successfully!";
    fetchTableData();
  } else {
    messageElement.textContent = "Error updating name!";
  }
}

// Counts rows in the demotable.
// Modify the function accordingly if using different aggregate functions or procedures.
async function countDemotable() {
  const response = await fetch("/count-demotable", {
    method: "GET",
  });

  const responseData = await response.json();
  const messageElement = document.getElementById("countResultMsg");

  if (responseData.success) {
    const tupleCount = responseData.count;
    messageElement.textContent = `The number of tuples in demotable: ${tupleCount}`;
  } else {
    alert("Error in count demotable!");
  }
}

async function updateStockExchangeHandler(event) {
  event.preventDefault();

  const tickerID = document.getElementById("updateTickerID").value;
  const newPrice = document.getElementById("updatePrice").value;
  const newMarketCap = document.getElementById("updateMarketCap").value;
  const newVolume = document.getElementById("updateVolume").value;
  const newShares = document.getElementById("updateShares").value;
  const newExchangeName = document.getElementById(
    "updateStockExchangeName"
  ).value;

  const msgDiv = document.getElementById("updateStockMessage");

  try {
    const response = await fetch("/update-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tickerID,
        newPrice,
        newMarketCap,
        newVolume,
        newShares,
        newExchangeName,
      }),
    });

    const responseData = await response.json();

    if (response.ok && responseData.success) {
      msgDiv.textContent = "Stock updated successfully!";
      fetchTableData();
    } else {
      msgDiv.textContent = `Error updating stock: ${
        responseData.message || "Unknown error"
      }`;
    }
  } catch (error) {
    msgDiv.textContent = "Server error while updating stock.";
    console.error("Update error:", error);
  }
}

async function simpleTwoConditionSearch(event) {
  event.preventDefault();

  // Condition A
  const attrA = document.getElementById("attrA").value;
  const opA = document.getElementById("opA").value;
  const valA = document.getElementById("valA").value;

  // Condition B
  const attrB = document.getElementById("attrB").value;
  const opB = document.getElementById("opB").value;
  const valB = document.getElementById("valB").value;

  const logic = document.getElementById("logicAB").value;

  const conditions = [];

  // if it has a non-empty value
  if (valA.trim() !== "") {
    conditions.push({
      attribute: attrA,
      operator: opA,
      value: valA,
      logic,
    });
  }

  if (valB.trim() !== "") {
    conditions.push({
      attribute: attrB,
      operator: opB,
      value: valB,
      logic,
    });
  }

  if (conditions.length === 0) {
    document.getElementById("selectResultMsg").textContent =
      "Please provide at least one condition.";
    return;
  }

  const response = await fetch("/select-stock", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ conditions }),
  });

  const data = await response.json();

  if (data.success) {
    const tableBody = document
      .getElementById("stockExchangeSearch")
      .querySelector("tbody");
    tableBody.innerHTML = "";

    data.data.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((colValue) => {
        const td = document.createElement("td");
        td.textContent = colValue;
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });
  } else {
    document.getElementById("selectResultMsg").textContent = "Error";
  }
  fetchTableData();
}

async function deleteLocationAndCurrency(event) {
  event.preventDefault();

  const locationAndCurrencyToDelete = document.getElementById(
    "locationAndCurrencyToDelete"
  ).value;

  const response = await fetch(
    `/delete-locationAndCurrency/${locationAndCurrencyToDelete}`,
    {
      method: "DELETE",
    }
  );

  const messageElement = document.getElementById(
    "deleteLocationAndCurrencyMessage"
  );

  if (response.ok) {
    messageElement.textContent =
      "Location and related Stocks deleted successfully!";
    fetchTableData();
  } else {
    messageElement.textContent = "Error deleting Location!";
  }
}

async function joinLocationAndExchange(event) {
  event.preventDefault();
  const location = document.getElementById("joinLocationAndExchange").value;
  // console.log("captured input:", location);
  const response = await fetch("/join-LocationAndExchange", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ currencyLocation: location }),
  });

  const responseData = await response.json();
  const messageElement = document.getElementById(
    "joinLocationAndExchangeMessage"
  );

  if (responseData.success) {
    const stockExchangeContent = responseData.data;

    const tableBody = document
      .getElementById("joinLocationAndExchangeTable")
      .querySelector("tbody");
    tableBody.innerHTML = "";

    stockExchangeContent.forEach((rowData) => {
      const row = tableBody.insertRow();
      rowData.forEach((field, index) => {
        const cell = row.insertCell(index);
        cell.textContent = field;
      });
    });
    messageElement.textContent = "successfully joined!";
  } else {
    alert("Error in joining!");
  }
  fetchTableData();
}

async function divideStockExchange() {
  const tableElement = document.getElementById("dividedTable");
  const tableBody = tableElement.querySelector("tbody");
  const response = await fetch("/divide-stockExchange", {
    method: "GET",
  });

  const responseData = await response.json();
  const ExchangeLocations = responseData.data;

  tableBody.innerHTML = "";

  ExchangeLocations.forEach((location) => {
    const row = tableBody.insertRow();
    location.forEach((field, index) => {
      const cell = row.insertCell(index);
      cell.textContent = field;
    });
  });
}

async function groupByAggregation() {
  const tableElement = document.getElementById("groupAggregatedTable");
  const tableBody = tableElement.querySelector("tbody");
  const response = await fetch("/aggregated-groupby-stockExchange", {
    method: "GET",
  });

  const responseData = await response.json();
  const ExchangeAndCap = responseData.data;

  tableBody.innerHTML = "";

  ExchangeAndCap.forEach((pair) => {
    const row = tableBody.insertRow();
    pair.forEach((field, index) => {
      const cell = row.insertCell(index);
      cell.textContent = field;
    });
  });
}

async function aggregationHaving() {
  const tableElement = document.getElementById("aggregationHavingTable");
  const tableBody = tableElement.querySelector("tbody");
  const response = await fetch("/aggregated-having-stockExchange", {
    method: "GET",
  });

  const responseData = await response.json();
  const ExchangeAndVolumeAndPrice = responseData.data;

  tableBody.innerHTML = "";

  ExchangeAndVolumeAndPrice.forEach((trio) => {
    const row = tableBody.insertRow();
    trio.forEach((field, index) => {
      const cell = row.insertCell(index);
      cell.textContent = field;
    });
  });
}

async function nestedAggregation() {
  const tableElement = document.getElementById("nestedAggregationTable");
  const tableBody = tableElement.querySelector("tbody");
  const response = await fetch("/nested-aggregation-stockExchange", {
    method: "GET",
  });

  const responseData = await response.json();
  const ExchangeAndVolumeAndPrice = responseData.data;

  tableBody.innerHTML = "";

  ExchangeAndVolumeAndPrice.forEach((trio) => {
    const row = tableBody.insertRow();
    trio.forEach((field, index) => {
      const cell = row.insertCell(index);
      cell.textContent = field;
    });
  });
}

async function projectStockExchange(event) {
  event.preventDefault();

  const checkboxes = document.querySelectorAll(
    'input[name="stockCols"]:checked'
  );
  const columns = Array.from(checkboxes).map((cb) => cb.value);

  if (columns.length === 0) {
    document.getElementById("projectStockMsg").textContent =
      "Select at least one column";
    return;
  }

  try {
    const response = await fetch("/project-stock", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ columns }),
    });

    const data = await response.json();

    if (!data.success) {
      document.getElementById("projectStockMsg").textContent =
        data.message || "Error projecting data";
      return;
    }

    // Fill table
    const rows = data.data;
    const tableHead = document.getElementById("projectStockHead");
    const tableBody = document.getElementById("projectStockBody");

    tableHead.innerHTML = "";
    tableBody.innerHTML = "";

    columns.forEach((col) => {
      const th = document.createElement("th");
      th.textContent = col;
      tableHead.appendChild(th);
    });

    rows.forEach((row) => {
      const tr = document.createElement("tr");
      row.forEach((cell) => {
        const td = document.createElement("td");
        td.textContent = cell;
        tr.appendChild(td);
      });
      tableBody.appendChild(tr);
    });

    document.getElementById(
      "projectStockMsg"
    ).textContent = `Returned ${rows.length} row(s).`;
  } catch (err) {
    console.error("Projection error:", err);
    document.getElementById("projectStockMsg").textContent = "Server error.";
  }
}

// ---------------------------------------------------------------
// Initializes the webpage functionalities.
// Add or remove event listeners based on the desired functionalities.
window.onload = function () {
  checkDbConnection();
  fetchTableData();
  // document
  //     .getElementById("resetDemotable")
  //     .addEventListener("click", resetDemotable);
  // document
  //     .getElementById("insertDemotable")
  //     .addEventListener("submit", insertDemotable);
  // document
  //     .getElementById("updataNameDemotable")
  //     .addEventListener("submit", updateNameDemotable);
  // document
  //     .getElementById("countDemotable")
  //     .addEventListener("click", countDemotable);
  document
    .getElementById("insertStock")
    .addEventListener("submit", insertStockExchange);
  // document
  //   .getElementById("resetStockExchangeTable")
  //   .addEventListener("click", resetStockExchangeTable);

  document
    .getElementById("deleteStock")
    .addEventListener("submit", deleteStock);
  document
    .getElementById("runSQLScripts")
    .addEventListener("click", runSQLScripts);
  document
    .getElementById("insertLocationAndCurrency")
    .addEventListener("submit", insertLocationAndCurrency);
  document
    .getElementById("updateStock")
    .addEventListener("submit", updateStockExchangeHandler);
  document
    .getElementById("selectStockForm")
    .addEventListener("submit", simpleTwoConditionSearch);
  document
    .getElementById("deleteLocationAndCurrency")
    .addEventListener("submit", deleteLocationAndCurrency);
  document
    .getElementById("joinLocationAndExchangeForm")
    .addEventListener("submit", joinLocationAndExchange);
  document
    .getElementById("runDivision")
    .addEventListener("click", divideStockExchange);
  document
    .getElementById("groupByAggregation")
    .addEventListener("click", groupByAggregation);
  document
    .getElementById("aggregationHaving")
    .addEventListener("click", aggregationHaving);

  document
    .getElementById("projectStockForm")
    .addEventListener("submit", projectStockExchange);
  document
    .getElementById("nestedAggregation")
    .addEventListener("click", nestedAggregation);
};

// General function to refresh the displayed table data.
// You can invoke this after any table-modifying operation to keep consistency.
function fetchTableData() {
  fetchAndDisplayLocationAndCurrency();
  //fetchAndDisplayUsers();
  fetchAndDisplayExchangeAndLocation();
  fetchAndDisplayStockExchange();
}
