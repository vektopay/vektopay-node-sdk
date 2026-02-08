export type ChargeInput = {
  customerId: string;
  cardId: string;
  amount: number;
  currency: "BRL" | "USD";
  installments?: number;
  country?: string;
  priceId?: string;
  metadata?: Record<string, unknown>;
  idempotencyKey?: string;
};

export type ChargeResponse =
  | { id: string; status: "PAID" }
  | { id: string; status: "FAILED"; error: { code: string; message: string } }
  | {
      id: string;
      status: "ACTION_REQUIRED";
      challenge: { url: string; method: "iframe" | "redirect" };
    };

export type ChargeStatusResponse =
  | { id: string; status: "PAID" | "FAILED" }
  | { id: string; status: "PENDING_CHALLENGE" }
  | { id: string; status: "PROCESSING_GATEWAY" };

export type TransactionItemInput = {
  priceId: string;
  quantity: number;
};

export type TransactionPaymentMethodInput = {
  type: "credit_card" | "pix";
  token: string;
  installments: number;
};

export type TransactionInput = {
  customerId: string;
  items: TransactionItemInput[];
  couponCode?: string;
  paymentMethod: TransactionPaymentMethodInput;
};

export type TransactionResponse = {
  id: string;
  status: "submitted" | "failed" | string;
  paymentStatus?: "SUCCESS" | "FAILED" | "PENDING";
  merchantId?: string;
  amount?: number;
  currency?: "BRL" | "USD";
};

export type CustomerCreateInput = {
  merchantId: string;
  externalId: string;
  name?: string;
  email?: string;
  docType: "CPF" | "CNPJ";
  docNumber: string;
};

export type CustomerUpdateInput = Partial<CustomerCreateInput>;

export type CustomerCreateResponse = {
  id: string;
};

export type CustomerListParams = {
  merchantId?: string;
  limit?: number;
  offset?: number;
};

export type CustomerDeleteResponse = {
  ok: boolean;
};

export type CustomerResponse = {
  id: string;
  merchantId?: string | null;
  externalId?: string | null;
  name?: string | null;
  email?: string | null;
  docType?: string | null;
  docNumber?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

export type VektopaySdkConfig = {
  apiKey: string;
  baseUrl: string;
  defaultHeaders?: Record<string, string>;
};

export type PollOptions = {
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export type CheckoutSessionInput = {
  customerId: string;
  amount: number;
  currency: "BRL" | "USD";
  expiresInSeconds?: number;
  successUrl?: string;
  cancelUrl?: string;
};

export type CheckoutSessionResponse = {
  id: string;
  token: string;
  expiresAt: string;
};

function resolveErrorMessage(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object") return undefined;
  const err = (payload as { error?: unknown }).error;
  if (!err) return undefined;
  if (typeof err === "string") return err;
  if (typeof err === "object") {
    const message = (err as { message?: unknown }).message;
    const code = (err as { code?: unknown }).code;
    if (typeof message === "string" && message.length > 0) return message;
    if (typeof code === "string" && code.length > 0) return code;
  }
  return undefined;
}

function randomKey() {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  return Math.random().toString(36).slice(2);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export class VektopaySDK {
  private apiKey: string;
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;

  constructor(config: VektopaySdkConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.defaultHeaders = config.defaultHeaders ?? {};
  }

  async createCharge(input: ChargeInput): Promise<ChargeResponse> {
    const idempotencyKey = input.idempotencyKey ?? randomKey();
    const res = await fetch(`${this.baseUrl}/v1/charges`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        "idempotency-key": idempotencyKey,
        ...this.defaultHeaders,
      },
      body: JSON.stringify({
        customer_id: input.customerId,
        card_id: input.cardId,
        amount: input.amount,
        currency: input.currency,
        installments: input.installments,
        country: input.country,
        metadata: input.metadata,
        price_id: input.priceId,
      }),
    });

    const payload = (await res.json()) as ChargeResponse;
    if (!res.ok) {
      throw new Error(
        resolveErrorMessage(payload) ?? `charge_failed_${res.status}`,
      );
    }
    return payload;
  }

  async createTransaction(
    input: TransactionInput,
  ): Promise<TransactionResponse> {
    const res = await fetch(`${this.baseUrl}/v1/transactions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        ...this.defaultHeaders,
      },
      body: JSON.stringify({
        customer_id: input.customerId,
        items: input.items.map((item) => ({
          price_id: item.priceId,
          quantity: item.quantity,
        })),
        coupon_code: input.couponCode,
        payment_method: {
          type: input.paymentMethod.type,
          token: input.paymentMethod.token,
          installments: input.paymentMethod.installments,
        },
      }),
    });

    const payload = (await res.json()) as TransactionResponse;
    if (!res.ok) {
      throw new Error(
        resolveErrorMessage(payload) ?? `transaction_failed_${res.status}`,
      );
    }
    return payload;
  }

  async createCustomer(
    input: CustomerCreateInput,
  ): Promise<CustomerCreateResponse> {
    const res = await fetch(`${this.baseUrl}/v1/customers`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        ...this.defaultHeaders,
      },
      body: JSON.stringify({
        merchant_id: input.merchantId,
        external_id: input.externalId,
        name: input.name,
        email: input.email,
        doc_type: input.docType,
        doc_number: input.docNumber,
      }),
    });

    const payload = (await res.json()) as CustomerCreateResponse;
    if (!res.ok || !payload.id) {
      throw new Error(
        resolveErrorMessage(payload) ?? `customer_create_failed_${res.status}`,
      );
    }
    return payload;
  }

  async updateCustomer(
    id: string,
    input: CustomerUpdateInput,
  ): Promise<CustomerResponse> {
    const res = await fetch(`${this.baseUrl}/v1/customers/${id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        ...this.defaultHeaders,
      },
      body: JSON.stringify({
        merchant_id: input.merchantId,
        external_id: input.externalId,
        name: input.name,
        email: input.email,
        doc_type: input.docType,
        doc_number: input.docNumber,
      }),
    });

    const payload = (await res.json()) as CustomerResponse;
    if (!res.ok) {
      throw new Error(
        resolveErrorMessage(payload) ?? `customer_update_failed_${res.status}`,
      );
    }
    return payload;
  }

  async listCustomers(
    params: CustomerListParams = {},
  ): Promise<CustomerResponse[]> {
    const search = new URLSearchParams();
    if (params.merchantId) search.set("merchant_id", params.merchantId);
    if (typeof params.limit === "number")
      search.set("limit", String(params.limit));
    if (typeof params.offset === "number")
      search.set("offset", String(params.offset));
    const suffix = search.toString();
    const res = await fetch(
      `${this.baseUrl}/v1/customers${suffix ? `?${suffix}` : ""}`,
      {
        headers: { "x-api-key": this.apiKey, ...this.defaultHeaders },
      },
    );

    const payload = (await res.json()) as CustomerResponse[];
    if (!res.ok) {
      throw new Error(
        resolveErrorMessage(payload) ?? `customer_list_failed_${res.status}`,
      );
    }
    return payload;
  }

  async getCustomer(id: string): Promise<CustomerResponse> {
    const res = await fetch(`${this.baseUrl}/v1/customers/${id}`, {
      headers: { "x-api-key": this.apiKey, ...this.defaultHeaders },
    });

    const payload = (await res.json()) as CustomerResponse;
    if (!res.ok) {
      throw new Error(
        resolveErrorMessage(payload) ?? `customer_get_failed_${res.status}`,
      );
    }
    return payload;
  }

  async deleteCustomer(id: string): Promise<CustomerDeleteResponse> {
    const res = await fetch(`${this.baseUrl}/v1/customers/${id}`, {
      method: "DELETE",
      headers: { "x-api-key": this.apiKey, ...this.defaultHeaders },
    });

    const payload = (await res.json()) as CustomerDeleteResponse;
    if (!res.ok) {
      throw new Error(
        resolveErrorMessage(payload) ?? `customer_delete_failed_${res.status}`,
      );
    }
    return payload;
  }

  async createCheckoutSession(
    input: CheckoutSessionInput,
  ): Promise<CheckoutSessionResponse> {
    const res = await fetch(`${this.baseUrl}/v1/checkout-sessions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        ...this.defaultHeaders,
      },
      body: JSON.stringify({
        customer_id: input.customerId,
        amount: input.amount,
        currency: input.currency,
        expires_in_seconds: input.expiresInSeconds,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
      }),
    });

    const payload = (await res.json()) as {
      id?: string;
      token?: string;
      expires_at?: string;
    };
    if (!res.ok || !payload.token || !payload.expires_at || !payload.id) {
      throw new Error(
        resolveErrorMessage(payload) ?? `checkout_session_failed_${res.status}`,
      );
    }
    return {
      id: payload.id,
      token: payload.token,
      expiresAt: payload.expires_at,
    };
  }

  async pollChargeStatus(
    transactionId: string,
    options: PollOptions = {},
  ): Promise<ChargeStatusResponse> {
    const startedAt = Date.now();
    const intervalMs = options.intervalMs ?? 3000;
    const timeoutMs = options.timeoutMs ?? 120_000;

    while (true) {
      if (options.signal?.aborted) {
        throw new Error("poll_aborted");
      }
      if (Date.now() - startedAt > timeoutMs) {
        throw new Error("poll_timeout");
      }

      const res = await fetch(
        `${this.baseUrl}/v1/charges/${transactionId}/status`,
        {
          headers: { "x-api-key": this.apiKey, ...this.defaultHeaders },
        },
      );
      const payload = (await res.json()) as ChargeStatusResponse;
      if (!res.ok) {
        throw new Error(
          resolveErrorMessage(payload) ?? `status_failed_${res.status}`,
        );
      }
      if (payload.status === "PAID" || payload.status === "FAILED") {
        return payload;
      }
      await sleep(intervalMs);
    }
  }

  openChallenge(challenge: { url: string; method: "iframe" | "redirect" }) {
    if (typeof window === "undefined") {
      throw new Error("open_challenge_not_supported");
    }
    if (challenge.method === "redirect") {
      window.location.href = challenge.url;
      return { close: (): undefined => undefined };
    }
    const overlay = document.createElement("div");
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.background = "rgba(15, 23, 42, 0.75)";
    overlay.style.zIndex = "9999";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";

    const frame = document.createElement("iframe");
    frame.src = challenge.url;
    frame.style.width = "420px";
    frame.style.height = "640px";
    frame.style.border = "0";
    frame.style.borderRadius = "16px";
    frame.style.background = "#0f172a";

    overlay.appendChild(frame);
    document.body.appendChild(overlay);

    return {
      close: () => {
        overlay.remove();
      },
    };
  }
}
