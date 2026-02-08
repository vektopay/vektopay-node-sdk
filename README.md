# @vektopay/node-sdk

Node.js SDK for Vektopay API (server-side). Supports payments, checkout sessions, and payment status polling.

## Install

```bash
npm install @vektopay/node-sdk
```

## Setup

```ts
import { VektopaySDK } from "@vektopay/node-sdk";

const sdk = new VektopaySDK({
  apiKey: process.env.VEKTOPAY_API_KEY!,
  baseUrl: "https://api.vektopay.com",
});
```

## Create Payment (Recommended)

Creates a payment using `/v1/payments`. This replaces the deprecated `/v1/charges` and `/v1/transactions`.

```ts
const payment = await sdk.createPayment({
  customerId: "cust_123",
  items: [{ priceId: "price_basic", quantity: 1 }],
  couponCode: "OFF10",
  paymentMethod: {
    type: "credit_card",
    token: "ev:tk_123",
    installments: 1,
  },
});

console.log(payment.paymentId, payment.status, payment.paymentStatus);
```

## Create Customer (Dashboard Scope)

Customer management is dashboard-scoped. Provide `bearerToken` (dashboard session) in the SDK config.

```ts
const customer = await sdk.createCustomer({
  merchantId: "mrc_123",
  externalId: "cust_ext_123",
  name: "Ana Silva",
  email: "ana@example.com",
  docType: "CPF",
  docNumber: "12345678901",
});
```

## Update Customer

```ts
const updated = await sdk.updateCustomer(customer.id, {
  name: "Ana Maria Silva",
  email: "ana.maria@example.com",
});
```

## Get Customer

```ts
const customerDetail = await sdk.getCustomer(customer.id);
```

## List Customers

```ts
const customers = await sdk.listCustomers({
  merchantId: "mrc_123",
  limit: 50,
  offset: 0,
});
```

## Delete Customer

```ts
const deleted = await sdk.deleteCustomer(customer.id);
```

## Create Charge (Card)

```ts
const charge = await sdk.createCharge({
  customerId: "cust_123",
  cardId: "card_123",
  amount: 1000,
  currency: "BRL",
  installments: 1,
});
```

`createCharge` and `createTransaction` are legacy aliases that call `/v1/payments`.

## Create Checkout Session (Frontend)

Use this to get a `token` and open the hosted/embedded checkout in the browser.

```ts
const session = await sdk.createCheckoutSession({
  customerId: "cust_123",
  amount: 1000,
  currency: "BRL",
  successUrl: "https://example.com/success",
  cancelUrl: "https://example.com/cancel",
});

console.log(session.token);
```

## Poll Payment Status

```ts
const status = await sdk.pollPaymentStatus(payment.paymentId, {
  intervalMs: 3000,
  timeoutMs: 120_000,
});
```

## Build

```bash
bun install
bun run build
```

## Notes
- Requires Node >= 18 (fetch).
- Never expose your API key in the browser.
