DROP TABLE UserWatchesStockRelation;
DROP TABLE CEOOwnsCompany;
DROP TABLE RevenueAndExpenses;
DROP TABLE PriceWithShares;
DROP TABLE FinancialReport;
DROP TABLE ETFManagesPM;
DROP TABLE IndexFundManagesPM;
DROP TABLE EquityStockIssuesCompany;
DROP TABLE STOCKEXCHANGE;
DROP TABLE APPUser;
DROP TABLE PortfolioManager;
DROP TABLE Company;
DROP TABLE StockExchangeLocation;
DROP TABLE LocationAndCurrency;


CREATE TABLE LocationAndCurrency
(
    CurrencyLocation VARCHAR2(255),
    Currency         VARCHAR2(255) NOT NULL,
    PRIMARY KEY (CurrencyLocation)
);

CREATE TABLE StockExchangeLocation
(
    StockExchangeName VARCHAR2(255),
    CurrencyLocation  VARCHAR2(255),
    PRIMARY KEY (StockExchangeName),
    FOREIGN KEY (CurrencyLocation)
        REFERENCES LocationAndCurrency (CurrencyLocation)
        ON DELETE CASCADE
);

CREATE TABLE Company
(
    CompanyName VARCHAR2(255),
    Sector      VARCHAR2(255) NOT NULL,
    PRIMARY KEY (CompanyName)
);

CREATE TABLE PortfolioManager
(
    CertificateID INTEGER,
    PMName        VARCHAR2(255),
    PRIMARY KEY (CertificateID)
);

CREATE TABLE APPUser
(
    UserID      VARCHAR2(255) NOT NULL,
    Email       VARCHAR2(255),
    AppUserName VARCHAR2(255) NOT NULL,
    PRIMARY KEY (UserID)
);

CREATE TABLE STOCKEXCHANGE
(
    TickerID          VARCHAR2(5) NOT NULL,
    Price             NUMBER,
    MarketCap         NUMBER,
    Shares            NUMBER,
    Volume            NUMBER,
    StockExchangeName VARCHAR2(255) NOT NULL,
    PRIMARY KEY (TickerID),
    FOREIGN KEY (StockExchangeName)
        REFERENCES StockExchangeLocation (StockExchangeName)
        ON DELETE CASCADE
);

CREATE TABLE EquityStockIssuesCompany
(
    CompanyName VARCHAR2(255) NOT NULL,
    TickerID    VARCHAR2(5) NOT NULL,
    PRIMARY KEY (CompanyName, TickerID),
    FOREIGN KEY (CompanyName)
        REFERENCES Company (CompanyName),
    FOREIGN KEY (TickerID)
        REFERENCES STOCKEXCHANGE (TickerID)
        ON DELETE CASCADE
);

CREATE TABLE IndexFundManagesPM
(
    TickerID      VARCHAR2(5),
    ExpenseRatio  NUMBER(10, 2) NOT NULL,
    CertificateID INTEGER,
    PRIMARY KEY (TickerID),
    FOREIGN KEY (CertificateID)
        REFERENCES PortfolioManager (CertificateID),
    FOREIGN KEY (TickerID)
        REFERENCES STOCKEXCHANGE (TickerID)
        ON DELETE CASCADE
);

CREATE TABLE ETFManagesPM
(
    TickerID      VARCHAR2(5),
    ExpenseRatio  NUMBER(10, 2) NOT NULL,
    CertificateID INTEGER,
    PRIMARY KEY (TickerID),
    FOREIGN KEY (CertificateID)
        REFERENCES PortfolioManager (CertificateID)
        ON DELETE CASCADE,
    FOREIGN KEY (TickerID)
        REFERENCES STOCKEXCHANGE (TickerID)
        ON DELETE CASCADE
);

CREATE TABLE FinancialReport
(
    CompanyName VARCHAR2(255),
    DateQuarter VARCHAR2(255),
    DilutedEPS  NUMBER(10, 2) NOT NULL,
    Expenses    NUMBER(10, 2) NOT NULL,
    Revenue     NUMBER(10, 2) NOT NULL,
    PRIMARY KEY (CompanyName, DateQuarter),
    FOREIGN KEY (CompanyName)
        REFERENCES Company (CompanyName)
        ON DELETE CASCADE
);

CREATE TABLE PriceWithShares
(
    Price     NUMBER(10, 2) NOT NULL,
    Shares    INTEGER       NOT NULL,
    MarketCap NUMBER(10, 2),
    PRIMARY KEY (Price, Shares)
);

CREATE TABLE RevenueAndExpenses
(
    Revenue   NUMBER(10, 2) NOT NULL,
    Expenses  NUMBER(10, 2) NOT NULL,
    NetIncome NUMBER(10, 2) NOT NULL,
    PRIMARY KEY (Revenue, Expenses)
);

CREATE TABLE CEOOwnsCompany
(
    CompanyName VARCHAR2(255),
    CEOName     VARCHAR2(255) NOT NULL,
    PRIMARY KEY (CompanyName, CEOName),
    UNIQUE (CompanyName),
    FOREIGN KEY (CompanyName)
        REFERENCES Company (CompanyName)
        ON DELETE CASCADE
);

CREATE TABLE UserWatchesStockRelation
(
    UserID   VARCHAR2(255),
    TickerID VARCHAR2(5),
    PRIMARY KEY (UserID, TickerID),
    FOREIGN KEY (UserID)
        REFERENCES APPUser (UserID)
        ON DELETE CASCADE,
    FOREIGN KEY (TickerID)
        REFERENCES STOCKEXCHANGE (TickerID)
        ON DELETE CASCADE
);

INSERT INTO LocationAndCurrency VALUES ('Canada', 'CAD Dollar');
INSERT INTO LocationAndCurrency VALUES ('USA', 'USD Dollar');
INSERT INTO LocationAndCurrency VALUES ('Mexico', 'Peso');
INSERT INTO LocationAndCurrency VALUES ('Japan', 'Yen');

INSERT INTO StockExchangeLocation VALUES ('TSX', 'Canada');
INSERT INTO StockExchangeLocation VALUES ('CSE', 'Canada');
INSERT INTO StockExchangeLocation VALUES ('NASDAQ', 'USA');
INSERT INTO StockExchangeLocation VALUES ('NYSE', 'USA');
INSERT INTO StockExchangeLocation VALUES ('MSX', 'Mexico');
INSERT INTO StockExchangeLocation VALUES ('JSX', 'Japan');
INSERT INTO StockExchangeLocation VALUES ('TYO', 'Japan');

INSERT INTO STOCKEXCHANGE VALUES ('APPLE', 10, 20000, 2000, 100, 'NASDAQ');

INSERT INTO STOCKEXCHANGE VALUES ('FACEB', 12, 24000, 2000, 100, 'NASDAQ');
INSERT INTO STOCKEXCHANGE VALUES ('AMZON', 15, 22500, 1500, 100, 'NASDAQ');
INSERT INTO STOCKEXCHANGE VALUES ('NTFLX', 7, 14000, 2000, 100, 'NASDAQ');
INSERT INTO STOCKEXCHANGE VALUES ('GOOGL', 28, 56000, 2000, 100, 'NASDAQ');
INSERT INTO STOCKEXCHANGE VALUES ('MCSFT', 5, 10000, 2000, 200, 'NASDAQ');
INSERT INTO STOCKEXCHANGE VALUES ('PALTR', 20, 30000, 1500, 300, 'NYSE');
INSERT INTO STOCKEXCHANGE VALUES ('SUNCO', 2, 2000, 1000, 50, 'TSX');
INSERT INTO STOCKEXCHANGE VALUES ('BROOK', 2, 2000, 1000, 50, 'CSE');
INSERT INTO STOCKEXCHANGE VALUES ('TOYOT', 7, 7000, 1000, 25, 'JSX');
INSERT INTO STOCKEXCHANGE VALUES ('MEXCO', 5, 2500, 500, 75, 'MSX');
INSERT INTO STOCKEXCHANGE VALUES ('JAPCO', 30, 2500, 500, 75, 'TYO');

