# @vektopay/node-sdk

Node.js SDK for Vektopay API (server-side). MVP: charges + checkout sessions + polling.

## Install

```bash
npm install @vektopay/node-sdk
```

## Usage

```ts
import { VektopaySDK } from "@vektopay/node-sdk";

const sdk = new VektopaySDK({
  apiKey: process.env.VEKTOPAY_API_KEY!,
  baseUrl: "https://api.vektopay.com",
});

const session = await sdk.createCheckoutSession({
  customerId: "cust_123",
  amount: 1000,
  currency: "BRL",
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
