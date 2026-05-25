const SSLCommerzPayment = require("sslcommerz-lts");
require("dotenv").config();

const store_id = process.env.STORE_ID;
const store_passwd = process.env.STORE_PASSWORD;
const is_live = false; // true for live, false for sandbox

const sslcommerz = {
  init: (data) => {
    const payment = new SSLCommerzPayment(store_id, store_passwd, is_live);
    return payment.init(data);
  },
  validate: (data) => {
    const payment = new SSLCommerzPayment(store_id, store_passwd, is_live);
    return payment.validate(data);
  },
};

module.exports = sslcommerz;
