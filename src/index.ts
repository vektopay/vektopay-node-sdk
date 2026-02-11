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
  | { id: string; status: "PAID" | "FAILED" | "CANCELED" }
  | {
      id: string;
      status: "PENDING_CHALLENGE" | "PROCESSING_GATEWAY" | "AUTHORIZED";
    };

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
  /**
   * Optional dashboard auth token for dashboard-scoped endpoints (not part of the public API key surface).
   * If provided, some calls may use `Authorization: Bearer <token>` instead of `x-api-key`.
   */
  bearerToken?: string;
};

export type PollOptions = {
  intervalMs?: number;
  timeoutMs?: number;
  signal?: AbortSignal;
};

export type PaymentMethodInput = {
  type: "credit_card" | "pix";
  token?: string;
  cardId?: string;
  cvcToken?: string;
  installments?: number;
};

export type PaymentCustomerInput = {
  externalId: string;
  name?: string;
  email?: string;
  docType: "CPF" | "CNPJ";
  docNumber: string;
};

export type PaymentItemInput = {
  priceId: string;
  quantity: number;
};

export type PaymentInput = {
  customerId?: string;
  customer?: PaymentCustomerInput;
  items?: PaymentItemInput[];
  amount?: number;
  currency?: string;
  couponCode?: string;
  mode?: "one_time" | "subscription";
  webhookUrl?: string;
  paymentMethod: PaymentMethodInput;
};

export type PaymentStatus =
  | "PAID"
  | "FAILED"
  | "ACTION_REQUIRED"
  | "SUBMITTED"
  | "PENDING"
  | "PENDING_CHALLENGE"
  | "PROCESSING_GATEWAY"
  | "AUTHORIZED"
  | "CAPTURED"
  | "CANCELED";

export type PaymentMethodStatus = "SUCCESS" | "FAILED" | "PENDING";

export type PaymentResponse = {
  paymentId: string;
  status: PaymentStatus;
  paymentStatus?: PaymentMethodStatus;
  subscriptionId?: string | null;
  amount?: number | null;
  currency?: string | null;
  challenge?: { url: string };
};

export type PaymentStatusResponse = {
  id: string;
  status:
    | "PENDING_CHALLENGE"
    | "PROCESSING_GATEWAY"
    | "AUTHORIZED"
    | "PAID"
    | "CANCELED"
    | "FAILED";
};

export type CheckoutSessionInput = {
  customerId: string;
  amount: number;
  currency: "BRL" | "USD";
  expiresInSeconds?: number;
  successUrl?: string;
  cancelUrl?: string;
  priceId?: string;
  quantity?: number;
};

export type CheckoutSessionResponse = {
  id: string;
  token: string;
  expiresAt: number;
};

export type ProviderTokenResult = {
  status: "success" | "error";
  tokenId?: string;
  tokenType?: string;
  fingerprintId?: string;
  errorCode?: string;
  errorMessage?: string;
  meta?: Record<string, unknown> | null;
};

export type CardCaptureSessionInput = {
  customerId: string;
  expiresInSeconds?: number;
  successUrl?: string;
  cancelUrl?: string;
};

export type CardCaptureSessionResponse = {
  id: string;
  url: string;
  expiresAt: string;
};

export type CreateCardInput = {
  customerId: string;
  encryptedPan: string;
  cardBrand?: string;
  last4?: string;
  first6?: string;
  expMonth?: number;
  expYear?: number;
  holderName?: string;
  fingerprint?: string;
  providerTokens?: Record<string, ProviderTokenResult>;
  providerMeta?: Record<string, unknown>;
};

export type CompleteCardCaptureInput = {
  token: string;
  encryptedPan: string;
  setDefault?: boolean;
  cardBrand?: string;
  last4?: string;
  first6?: string;
  expMonth?: number;
  expYear?: number;
  holderName?: string;
  fingerprint?: string;
  providerTokens?: Record<string, ProviderTokenResult>;
  providerMeta?: Record<string, unknown>;
};

export type CreateCardResponse = {
  id: string;
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
  private bearerToken?: string;

  constructor(config: VektopaySdkConfig) {
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.defaultHeaders = config.defaultHeaders ?? {};
    this.bearerToken = config.bearerToken;
  }

  async createPayment(input: PaymentInput): Promise<PaymentResponse> {
    const res = await fetch(`${this.baseUrl}/v1/payments`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        ...this.defaultHeaders,
      },
      body: JSON.stringify({
        customer_id: input.customerId,
        customer: input.customer
          ? {
              external_id: input.customer.externalId,
              name: input.customer.name,
              email: input.customer.email,
              doc_type: input.customer.docType,
              doc_number: input.customer.docNumber,
            }
          : undefined,
        items: input.items?.map((i) => ({
          price_id: i.priceId,
          quantity: i.quantity,
        })),
        amount: input.amount,
        currency: input.currency,
        coupon_code: input.couponCode,
        mode: input.mode,
        webhook_url: input.webhookUrl,
        payment_method: {
          type: input.paymentMethod.type,
          token: input.paymentMethod.token,
          card_id: input.paymentMethod.cardId,
          cvc_token: input.paymentMethod.cvcToken,
          installments: input.paymentMethod.installments,
        },
      }),
    });

    const payload = (await res.json()) as unknown;
    if (!res.ok) {
      throw new Error(
        resolveErrorMessage(payload) ?? `payment_failed_${res.status}`,
      );
    }

    const p = payload as {
      payment_id?: unknown;
      status?: unknown;
      payment_status?: unknown;
      subscription_id?: unknown;
      amount?: unknown;
      currency?: unknown;
      challenge?: unknown;
    };

    const paymentId =
      typeof p.payment_id === "string" ? p.payment_id : undefined;
    const status =
      typeof p.status === "string" ? (p.status as PaymentStatus) : undefined;
    if (!paymentId || !status) {
      throw new Error("payment_invalid_response");
    }

    const challenge =
      p.challenge && typeof p.challenge === "object"
        ? (() => {
            const url = (p.challenge as { url?: unknown }).url;
            return typeof url === "string" ? { url } : undefined;
          })()
        : undefined;

    return {
      paymentId,
      status,
      paymentStatus:
        typeof p.payment_status === "string"
          ? (p.payment_status as PaymentMethodStatus)
          : undefined,
      subscriptionId:
        typeof p.subscription_id === "string" || p.subscription_id === null
          ? (p.subscription_id as string | null)
          : undefined,
      amount:
        typeof p.amount === "number" || p.amount === null
          ? (p.amount as number | null)
          : undefined,
      currency:
        typeof p.currency === "string" || p.currency === null
          ? (p.currency as string | null)
          : undefined,
      challenge,
    };
  }

  async getPaymentStatus(id: string): Promise<PaymentStatusResponse> {
    const res = await fetch(`${this.baseUrl}/v1/payments/${id}/status`, {
      headers: { "x-api-key": this.apiKey, ...this.defaultHeaders },
    });
    const payload = (await res.json()) as unknown;
    if (!res.ok) {
      throw new Error(
        resolveErrorMessage(payload) ?? `payment_status_failed_${res.status}`,
      );
    }
    const p = payload as { id?: unknown; status?: unknown };
    if (typeof p.id !== "string" || typeof p.status !== "string") {
      throw new Error("payment_status_invalid_response");
    }
    return { id: p.id, status: p.status as PaymentStatusResponse["status"] };
  }

  async pollPaymentStatus(
    paymentId: string,
    options: PollOptions = {},
  ): Promise<PaymentStatusResponse> {
    const startedAt = Date.now();
    const intervalMs = options.intervalMs ?? 3000;
    const timeoutMs = options.timeoutMs ?? 120_000;

    while (true) {
      if (options.signal?.aborted) throw new Error("poll_aborted");
      if (Date.now() - startedAt > timeoutMs) throw new Error("poll_timeout");

      const status = await this.getPaymentStatus(paymentId);
      if (
        status.status === "PAID" ||
        status.status === "FAILED" ||
        status.status === "CANCELED"
      ) {
        return status;
      }
      await sleep(intervalMs);
    }
  }

  /**
   * @deprecated `/v1/charges` is deprecated; prefer `createPayment`.
   */
  async createCharge(input: ChargeInput): Promise<ChargeResponse> {
    const result = await this.createPayment({
      customerId: input.customerId,
      amount: input.amount,
      currency: input.currency,
      paymentMethod: {
        type: "credit_card",
        cardId: input.cardId,
        installments: input.installments,
      },
    });

    if (result.status === "FAILED") {
      return {
        id: result.paymentId,
        status: "FAILED",
        error: { code: "payment_failed", message: "payment_failed" },
      };
    }
    if (result.status === "ACTION_REQUIRED" && result.challenge?.url) {
      return {
        id: result.paymentId,
        status: "ACTION_REQUIRED",
        challenge: { url: result.challenge.url, method: "redirect" },
      };
    }
    return { id: result.paymentId, status: "PAID" };
  }

  /**
   * @deprecated `/v1/transactions` is deprecated; prefer `createPayment` with `items`.
   */
  async createTransaction(
    input: TransactionInput,
  ): Promise<TransactionResponse> {
    const result = await this.createPayment({
      customerId: input.customerId,
      items: input.items.map((i) => ({
        priceId: i.priceId,
        quantity: i.quantity,
      })),
      couponCode: input.couponCode,
      paymentMethod: {
        type: input.paymentMethod.type,
        token: input.paymentMethod.token,
        installments: input.paymentMethod.installments,
      },
    });

    return {
      id: result.paymentId,
      status: result.status,
      paymentStatus: result.paymentStatus,
      amount: result.amount ?? undefined,
      currency: (result.currency as "BRL" | "USD" | undefined) ?? undefined,
    };
  }

  /**
   * Dashboard-scoped: requires `bearerToken` in SDK config.
   */
  async createCustomer(
    input: CustomerCreateInput,
  ): Promise<CustomerCreateResponse> {
    if (!this.bearerToken) throw new Error("bearer_token_required");
    const res = await fetch(`${this.baseUrl}/v1/customers`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.bearerToken}`,
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

  /**
   * Dashboard-scoped: requires `bearerToken` in SDK config.
   */
  async updateCustomer(
    id: string,
    input: CustomerUpdateInput,
  ): Promise<CustomerResponse> {
    if (!this.bearerToken) throw new Error("bearer_token_required");
    const res = await fetch(`${this.baseUrl}/v1/customers/${id}`, {
      method: "PUT",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.bearerToken}`,
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

  /**
   * Dashboard-scoped: requires `bearerToken` in SDK config.
   */
  async listCustomers(
    params: CustomerListParams = {},
  ): Promise<CustomerResponse[]> {
    if (!this.bearerToken) throw new Error("bearer_token_required");
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
        headers: {
          authorization: `Bearer ${this.bearerToken}`,
          ...this.defaultHeaders,
        },
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

  /**
   * Dashboard-scoped: requires `bearerToken` in SDK config.
   */
  async getCustomer(id: string): Promise<CustomerResponse> {
    if (!this.bearerToken) throw new Error("bearer_token_required");
    const res = await fetch(`${this.baseUrl}/v1/customers/${id}`, {
      headers: {
        authorization: `Bearer ${this.bearerToken}`,
        ...this.defaultHeaders,
      },
    });

    const payload = (await res.json()) as CustomerResponse;
    if (!res.ok) {
      throw new Error(
        resolveErrorMessage(payload) ?? `customer_get_failed_${res.status}`,
      );
    }
    return payload;
  }

  /**
   * Dashboard-scoped: requires `bearerToken` in SDK config.
   */
  async deleteCustomer(id: string): Promise<CustomerDeleteResponse> {
    if (!this.bearerToken) throw new Error("bearer_token_required");
    const res = await fetch(`${this.baseUrl}/v1/customers/${id}`, {
      method: "DELETE",
      headers: {
        authorization: `Bearer ${this.bearerToken}`,
        ...this.defaultHeaders,
      },
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
        price_id: input.priceId,
        quantity: input.quantity,
        expires_in_seconds: input.expiresInSeconds,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
      }),
    });

    const payload = (await res.json()) as {
      id?: string;
      token?: string;
      expires_at?: string | number;
    };
    if (
      !res.ok ||
      !payload.token ||
      payload.expires_at == null ||
      !payload.id
    ) {
      throw new Error(
        resolveErrorMessage(payload) ?? `checkout_session_failed_${res.status}`,
      );
    }
    const expiresAt =
      typeof payload.expires_at === "number"
        ? payload.expires_at
        : Number(payload.expires_at);
    if (!Number.isFinite(expiresAt)) {
      throw new Error("checkout_session_invalid_expires_at");
    }
    return {
      id: payload.id,
      token: payload.token,
      expiresAt,
    };
  }

  async createCardCaptureSession(
    input: CardCaptureSessionInput,
  ): Promise<CardCaptureSessionResponse> {
    const res = await fetch(`${this.baseUrl}/v1/card-capture-sessions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        ...this.defaultHeaders,
      },
      body: JSON.stringify({
        customer_id: input.customerId,
        expires_in_seconds: input.expiresInSeconds,
        success_url: input.successUrl,
        cancel_url: input.cancelUrl,
      }),
    });

    const payload = (await res.json()) as {
      id?: string;
      url?: string;
      expires_at?: string;
    };
    if (!res.ok || !payload.id || !payload.url || !payload.expires_at) {
      throw new Error(
        resolveErrorMessage(payload) ??
          `card_capture_session_failed_${res.status}`,
      );
    }
    return {
      id: payload.id,
      url: payload.url,
      expiresAt: payload.expires_at,
    };
  }

  async completeCardCapture(
    input: CompleteCardCaptureInput,
  ): Promise<CreateCardResponse> {
    const res = await fetch(`${this.baseUrl}/v1/card-capture/complete`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        ...this.defaultHeaders,
      },
      body: JSON.stringify({
        token: input.token,
        encrypted_pan: input.encryptedPan,
        set_default: input.setDefault,
        card_brand: input.cardBrand,
        last4: input.last4,
        first6: input.first6,
        exp_month: input.expMonth,
        exp_year: input.expYear,
        holder_name: input.holderName,
        fingerprint: input.fingerprint,
        provider_tokens: mapProviderTokensToApi(input.providerTokens),
        provider_meta: input.providerMeta,
      }),
    });

    const payload = (await res.json()) as CreateCardResponse;
    if (!res.ok || !payload.id) {
      throw new Error(
        resolveErrorMessage(payload) ??
          `card_capture_complete_failed_${res.status}`,
      );
    }
    return payload;
  }

  async createCard(input: CreateCardInput): Promise<CreateCardResponse> {
    const res = await fetch(`${this.baseUrl}/v1/cards`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.apiKey,
        ...this.defaultHeaders,
      },
      body: JSON.stringify({
        customer_id: input.customerId,
        encrypted_pan: input.encryptedPan,
        card_brand: input.cardBrand,
        last4: input.last4,
        first6: input.first6,
        exp_month: input.expMonth,
        exp_year: input.expYear,
        holder_name: input.holderName,
        fingerprint: input.fingerprint,
        provider_tokens: mapProviderTokensToApi(input.providerTokens),
        provider_meta: input.providerMeta,
      }),
    });

    const payload = (await res.json()) as CreateCardResponse;
    if (!res.ok || !payload.id) {
      throw new Error(
        resolveErrorMessage(payload) ?? `card_create_failed_${res.status}`,
      );
    }
    return payload;
  }

  async pollChargeStatus(
    transactionId: string,
    options: PollOptions = {},
  ): Promise<ChargeStatusResponse> {
    const status = await this.pollPaymentStatus(transactionId, options);
    return { id: status.id, status: status.status };
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

function mapProviderTokensToApi(
  value: Record<string, ProviderTokenResult> | undefined,
) {
  if (!value) return undefined;
  const output: Record<string, Record<string, string>> = {};
  for (const [key, item] of Object.entries(value)) {
    output[key] = {
      status: item.status,
      ...(item.tokenId ? { token_id: item.tokenId } : {}),
      ...(item.tokenType ? { token_type: item.tokenType } : {}),
      ...(item.fingerprintId ? { fingerprint_id: item.fingerprintId } : {}),
      ...(item.errorCode ? { error_code: item.errorCode } : {}),
      ...(item.errorMessage ? { error_message: item.errorMessage } : {}),
    };
  }
  return output;
}
