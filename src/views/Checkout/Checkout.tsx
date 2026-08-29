"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useCart } from "../../hooks/CartContext";
import { useAuth } from "../../hooks/useAuth";
import Breadcrumb from "../../components/Breadcrumb/Breadcrumb";
import "../../styles/checkout.css";

/* ── Payment Method Types ── */
type PaymentMethodType = "credit-card" | "debit-card" | "other" | "net-banking";

type OtherWalletId = "amazon-pay" | "paypal" | "swift" | "razorpay" | "stripe";

const OTHER_WALLETS: { id: OtherWalletId; name: string; logo: React.ReactNode }[] = [
  {
    id: "amazon-pay",
    name: "Amazon Pay",
    logo: (
      <svg viewBox="0 0 60 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="60" height="24">
        <text x="0" y="17" fontFamily="Arial Black,Arial" fontWeight="900" fontSize="13" fill="#FF9900">amazon</text>
        <text x="40" y="17" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="10" fill="#232F3E">pay</text>
      </svg>
    ),
  },
  {
    id: "paypal",
    name: "PayPal",
    logo: (
      <svg viewBox="0 0 80 24" xmlns="http://www.w3.org/2000/svg" width="72" height="22">
        <path d="M16.5 4H11c-.4 0-.7.3-.8.6L7.8 16c0 .2.1.4.4.4h2.6c.4 0 .7-.3.8-.6l.5-3.1c.1-.4.4-.6.8-.6h1.6c3.3 0 5.2-1.6 5.7-4.8.2-1.4 0-2.5-.6-3.2-.7-.8-1.9-1.1-3.1-1.1zm.6 4.7c-.3 1.7-1.6 1.7-2.9 1.7h-.7l.5-3.2c0-.2.2-.4.4-.4h.3c.9 0 1.7 0 2.2.5.2.3.3.8.2 1.4z" fill="#253B80"/>
        <path d="M30.2 8.6h-2.6c-.2 0-.4.1-.4.4l-.1.7-.2-.3c-.6-.9-2-1.2-3.3-1.2-3.1 0-5.7 2.3-6.2 5.6-.3 1.6.1 3.2 1 4.3.9 1 2.1 1.4 3.6 1.4 2.5 0 3.9-1.6 3.9-1.6l-.1.7c0 .2.1.4.4.4h2.3c.4 0 .7-.3.8-.6l1.4-8.5c0-.2-.1-.4-.5-.3zm-3.5 5.4c-.3 1.6-1.5 2.7-3.1 2.7-.8 0-1.4-.3-1.8-.7-.4-.5-.5-1.1-.4-1.8.3-1.6 1.5-2.7 3.1-2.7.8 0 1.4.3 1.8.7.4.5.5 1.2.4 1.8z" fill="#253B80"/>
        <path d="M44.4 8.6h-2.6c-.3 0-.5.1-.7.4L38 14.5l-1.3-5.3c-.1-.3-.4-.6-.8-.6h-2.5c-.3 0-.4.3-.4.5l2.5 7.3-2.3 3.3c-.2.3 0 .6.3.6h2.6c.3 0 .5-.1.7-.4l7.4-10.7c.2-.2 0-.6-.4-.6z" fill="#253B80"/>
        <path d="M52.5 4h-5.4c-.4 0-.7.3-.8.6L43.9 16c0 .2.1.4.4.4h2.7c.3 0 .5-.2.5-.4l.5-3.3c.1-.4.4-.6.8-.6h1.6c3.3 0 5.2-1.6 5.7-4.8.2-1.4 0-2.5-.6-3.2-.7-.8-1.9-1.1-3-1.1zm.5 4.7c-.3 1.7-1.6 1.7-2.9 1.7h-.7l.5-3.2c0-.2.2-.4.4-.4h.3c.9 0 1.7 0 2.2.5.3.3.4.8.2 1.4z" fill="#179BD7"/>
        <path d="M66.2 8.6h-2.6c-.2 0-.4.1-.4.4l-.1.7-.2-.3c-.6-.9-2-1.2-3.3-1.2-3.1 0-5.7 2.3-6.2 5.6-.3 1.6.1 3.2 1 4.3.9 1 2.1 1.4 3.6 1.4 2.5 0 3.9-1.6 3.9-1.6l-.1.7c0 .2.1.4.4.4h2.3c.4 0 .7-.3.8-.6l1.4-8.5c0-.2-.2-.4-.5-.3zm-3.5 5.4c-.3 1.6-1.5 2.7-3.1 2.7-.8 0-1.4-.3-1.8-.7-.4-.5-.5-1.1-.4-1.8.3-1.6 1.5-2.7 3.1-2.7.8 0 1.4.3 1.8.7.4.5.5 1.2.4 1.8z" fill="#179BD7"/>
        <path d="M69.5 4.3l-2.5 15.8c0 .2.1.4.4.4h2.2c.4 0 .7-.3.8-.6L72.7 4c0-.2-.1-.4-.4-.4h-2.4c-.3 0-.4.2-.4.4v.3z" fill="#179BD7"/>
      </svg>
    ),
  },
  {
    id: "swift",
    name: "Swift",
    logo: (
      <svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg" width="60" height="24">
        <rect x="0" y="3" width="18" height="18" rx="4" fill="#F05138"/>
        <path d="M14.5 7c-2.2 2-4.7 4.8-4.7 4.8S8.2 13.2 6 14c1.4.3 3-.3 4.3-1.4l2.3 2.4H15l-3-3.2c2.2-1.8 3.2-4.2 2.5-4.8z" fill="white"/>
        <text x="22" y="17" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="13" fill="#333">Swift</text>
      </svg>
    ),
  },
  {
    id: "razorpay",
    name: "Razorpay",
    logo: (
      <svg viewBox="0 0 90 24" xmlns="http://www.w3.org/2000/svg" width="88" height="24">
        <polygon points="8,4 16,4 10,12 14,12 4,22 7,14 3,14" fill="#2D8FF0"/>
        <text x="20" y="17" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="13" fill="#1A2B6D">Razorpay</text>
      </svg>
    ),
  },
  {
    id: "stripe",
    name: "Stripe",
    logo: (
      <svg viewBox="0 0 60 24" xmlns="http://www.w3.org/2000/svg" width="56" height="24">
        <rect width="60" height="24" rx="4" fill="#635BFF"/>
        <text x="8" y="16" fontFamily="Arial,sans-serif" fontWeight="800" fontSize="12" fill="white">stripe</text>
      </svg>
    ),
  },
];

interface CardFormState {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
}

const BANKS = [
  { id: "chase", name: "JPMorgan Chase", icon: "🏦" },
  { id: "bofa", name: "Bank of America", icon: "🏛️" },
  { id: "wellsfargo", name: "Wells Fargo", icon: "🏦" },
  { id: "citi", name: "Citibank", icon: "🏛️" },
  { id: "capitalone", name: "Capital One", icon: "🏦" },
  { id: "usbank", name: "U.S. Bank", icon: "🏛️" },
];


const PAYMENT_METHODS = [
  {
    id: "credit-card" as PaymentMethodType,
    name: "Credit Card",
    desc: "Visa, Mastercard, AMEX, Discover",
    icon: "💳",
  },
  {
    id: "debit-card" as PaymentMethodType,
    name: "Debit Card",
    desc: "All major banks supported",
    icon: "💳",
  },
  {
    id: "net-banking" as PaymentMethodType,
    name: "Net Banking",
    desc: "All major banks",
    icon: "🏦",
  },
  {
    id: "other" as PaymentMethodType,
    name: "Other",
    desc: "Amazon Pay, PayPal, Razorpay, Stripe & more",
    icon: "🌐",
  },
];

/* ── Confetti Component ── */
const Confetti: React.FC = () => {
  const colors = ["#D4AF37", "#B8860B", "#F5E27C", "#4CAF50", "#2196F3", "#FF9800", "#E91E63"];
  const pieces = Array.from({ length: 40 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    color: colors[Math.floor(Math.random() * colors.length)],
    delay: Math.random() * 1.5,
    duration: 1.5 + Math.random() * 2,
    rotation: Math.random() * 360,
    size: 6 + Math.random() * 8,
  }));

  return (
    <div className="confetti-container">
      {pieces.map((p) => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: Math.random() > 0.5 ? "50%" : "2px",
            animationDuration: `${p.duration}s`,
            animationDelay: `${p.delay}s`,
            transform: `rotate(${p.rotation}deg)`,
          }}
        />
      ))}
    </div>
  );
};

const Checkout: React.FC = () => {
  const router = useRouter();
  const { user, isLoggedIn, isLoading: isAuthLoading } = useAuth();
  const { item, getPrice, getPriceNum, getBillingLabel, clearCart } = useCart();
  const pageRef = useRef<HTMLDivElement>(null);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [processing, setProcessing] = useState(false);

  /* ── Card form state ── */
  const [creditForm, setCreditForm] = useState<CardFormState>({
    cardNumber: "", expiry: "", cvv: "", cardHolder: "",
  });
  const [debitForm, setDebitForm] = useState<CardFormState>({
    cardNumber: "", expiry: "", cvv: "", cardHolder: "",
  });
  const [selectedWallet, setSelectedWallet] = useState<OtherWalletId | "">("");
  const [selectedBank, setSelectedBank] = useState("");

  /* ── Price calculations ── */
  const subtotal = getPriceNum();
  const gst = useMemo(() => Math.round(subtotal * 0.18), [subtotal]);
  const total = subtotal + gst;

  /* ── Format card number with spaces ── */
  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
  };

  /* ── Format expiry ── */
  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  };

  /* ── Validate form completeness ── */
  const isFormValid = useMemo(() => {
    if (!selectedMethod) return false;
    switch (selectedMethod) {
      case "credit-card":
        return (
          creditForm.cardNumber.replace(/\s/g, "").length === 16 &&
          creditForm.expiry.length === 5 &&
          creditForm.cvv.length >= 3 &&
          creditForm.cardHolder.trim().length > 0
        );
      case "debit-card":
        return (
          debitForm.cardNumber.replace(/\s/g, "").length === 16 &&
          debitForm.expiry.length === 5 &&
          debitForm.cvv.length >= 3 &&
          debitForm.cardHolder.trim().length > 0
        );
      case "other":
        return selectedWallet.length > 0;
      case "net-banking":
        return selectedBank.length > 0;
      default:
        return false;
    }
  }, [selectedMethod, creditForm, debitForm, selectedWallet, selectedBank]);

  /* ── Redirect if no item or unauthenticated ── */
  useEffect(() => {
    if (!isAuthLoading && (!isLoggedIn || !user)) {
      router.push(`/login?redirect=${encodeURIComponent("/checkout")}`);
      return;
    }
    if (!item) {
      router.push("/cart");
    }
  }, [item, isAuthLoading, isLoggedIn, user, router]);

  /* ── GSAP animations ── */
  // useEffect(() => {
  //   if (!pageRef.current || !item) return;
  //   const ctx = gsap.context(() => {
  //     gsap.from(".checkout-steps", { opacity: 0, y: 20, duration: 0.5, ease: "power3.out" });
  //     gsap.from(".payment-section", { opacity: 0, y: 40, duration: 0.7, delay: 0.15, ease: "power3.out" });
  //     gsap.from(".checkout-summary", { opacity: 0, y: 40, duration: 0.7, delay: 0.3, ease: "power3.out" });
  //     gsap.from(".payment-method", { opacity: 0, x: -20, duration: 0.5, stagger: 0.08, delay: 0.4, ease: "power3.out" });
  //   }, pageRef);
  //   return () => ctx.revert();
  // }, [item]);

  /* ── Handle payment ── */
  const handlePayNow = async () => {
    if (!isFormValid || !item) return;

    setProcessing(true);

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const mappedRole = item.category === "jobseeker" ? "job_seeker" : item.category === "employer" ? "job_poster" : "business_promoter";
      const res = await fetch("/api/subscriptions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { "Authorization": `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          planId: item.id,
          billingCycle: item.billing,
        }),
      });

      const data = await res.json();
      if (!res.ok && res.status !== 409) {
        throw new Error(data.message || "Failed to activate subscription.");
      }

      // Store payment details in sessionStorage for the success page to display
      sessionStorage.setItem("last_payment_info", JSON.stringify({
        tier: item.tier,
        tierClass: item.tierClass,
        categoryLabel: item.categoryLabel,
        billing: item.billing,
        total: total,
        subtotal: subtotal,
        gst: gst,
        transactionId: data.invoice?.invoiceNumber || ("TXN" + Date.now().toString().slice(-8)),
        invoiceId: data.invoice?.id || null,
        date: new Date().toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      }));

      clearCart();
      router.push("/checkout/success");
    } catch (err: any) {
      console.error("Subscription activation error:", err);
      alert(err.message || "Something went wrong while activating your subscription. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (!item) return null;

  /* ── Render card form fields ── */
  const renderCardForm = (
    form: CardFormState,
    setForm: React.Dispatch<React.SetStateAction<CardFormState>>,
    prefix: string
  ) => (
    <>
      <div className="payment-form-divider" />
      <div className="payment-form-row single">
        <div className="payment-form-group">
          <label className="payment-form-label" htmlFor={`${prefix}-number`}>Card Number</label>
          <input
            type="text"
            className="payment-form-input"
            id={`${prefix}-number`}
            placeholder="1234 5678 9012 3456"
            value={form.cardNumber}
            onChange={(e) => setForm((prev) => ({ ...prev, cardNumber: formatCardNumber(e.target.value) }))}
            maxLength={19}
          />
        </div>
      </div>
      <div className="payment-form-row">
        <div className="payment-form-group">
          <label className="payment-form-label" htmlFor={`${prefix}-expiry`}>Expiry Date</label>
          <input
            type="text"
            className="payment-form-input"
            id={`${prefix}-expiry`}
            placeholder="MM/YY"
            value={form.expiry}
            onChange={(e) => setForm((prev) => ({ ...prev, expiry: formatExpiry(e.target.value) }))}
            maxLength={5}
          />
        </div>
        <div className="payment-form-group">
          <label className="payment-form-label" htmlFor={`${prefix}-cvv`}>CVV</label>
          <input
            type="password"
            className="payment-form-input"
            id={`${prefix}-cvv`}
            placeholder="•••"
            value={form.cvv}
            onChange={(e) => setForm((prev) => ({ ...prev, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
            maxLength={4}
          />
        </div>
      </div>
      <div className="payment-form-row single">
        <div className="payment-form-group">
          <label className="payment-form-label" htmlFor={`${prefix}-holder`}>Card Holder Name</label>
          <input
            type="text"
            className="payment-form-input"
            id={`${prefix}-holder`}
            placeholder="Enter name on card"
            value={form.cardHolder}
            onChange={(e) => setForm((prev) => ({ ...prev, cardHolder: e.target.value }))}
          />
        </div>
      </div>
    </>
  );

  /* ── Render payment form by type ── */
  const renderPaymentForm = (methodId: PaymentMethodType) => {
    switch (methodId) {
      case "credit-card":
        return renderCardForm(creditForm, setCreditForm, "cc");
      case "debit-card":
        return renderCardForm(debitForm, setDebitForm, "dc");
      case "other":
        return (
          <>
            <div className="payment-form-divider" />
            <label className="payment-form-label" style={{ marginBottom: 14, display: "block" }}>
              Select Wallet / Payment Gateway
            </label>
            <div className="wallet-radio-grid">
              {OTHER_WALLETS.map((wallet) => (
                <label
                  key={wallet.id}
                  className={`wallet-radio-card${selectedWallet === wallet.id ? " selected" : ""}`}
                  htmlFor={`wallet-${wallet.id}`}
                >
                  <input
                    type="radio"
                    id={`wallet-${wallet.id}`}
                    name="other-wallet"
                    value={wallet.id}
                    checked={selectedWallet === wallet.id}
                    onChange={() => setSelectedWallet(wallet.id)}
                    className="wallet-radio-input"
                  />
                  <div className="wallet-radio-check">
                    <div className="wallet-radio-dot" />
                  </div>
                  <div className="wallet-logo">{wallet.logo}</div>
                  <div className="wallet-name">{wallet.name}</div>
                </label>
              ))}
            </div>
          </>
        );
      case "net-banking":
        return (
          <>
            <div className="payment-form-divider" />
            <label className="payment-form-label" style={{ marginBottom: 12, display: "block" }}>
              Select Your Bank
            </label>
            <div className="bank-grid">
              {BANKS.map((bank) => (
                <div
                  key={bank.id}
                  className={`bank-option${selectedBank === bank.id ? " selected" : ""}`}
                  onClick={() => setSelectedBank(bank.id)}
                  id={`bank-${bank.id}`}
                >
                  <span className="bank-option-icon">{bank.icon}</span>
                  {bank.name}
                </div>
              ))}
            </div>
            <div className="payment-form-row single">
              <div className="payment-form-group">
                <label className="payment-form-label" htmlFor="bank-other">Or Select Other Bank</label>
                <select
                  className="payment-form-select"
                  id="bank-other"
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                >
                  <option value="">Choose a bank...</option>
                  <option value="chase">JPMorgan Chase Bank</option>
                  <option value="bofa">Bank of America</option>
                  <option value="wellsfargo">Wells Fargo Bank</option>
                  <option value="citi">Citibank</option>
                  <option value="capitalone">Capital One</option>
                  <option value="usbank">U.S. Bank</option>
                  <option value="pnc">PNC Bank</option>
                  <option value="truist">Truist Financial</option>
                  <option value="td">TD Bank</option>
                  <option value="goldman">Goldman Sachs</option>
                </select>
              </div>
            </div>
          </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="checkout-page" ref={pageRef}>
      {/* Decorative */}
      <div className="checkout-glow-orb checkout-glow-orb-1" />
      <div className="checkout-glow-orb checkout-glow-orb-2" />

      <Breadcrumb items={[
        { label: 'Subscription', href: '/subscription-light' },
        { label: 'Cart', href: '/cart' },
        { label: 'Checkout' },
      ]} />
      <div className="container" style={{ position: "relative", zIndex: 1, paddingTop: "32px" }}>
        {/* Steps Indicator */}
        <div className="checkout-steps">
          <div className="checkout-step completed">
            <span className="checkout-step-number">✓</span>
            <span>Cart</span>
          </div>
          <div className="checkout-step-connector active" />
          <div className="checkout-step active">
            <span className="checkout-step-number">2</span>
            <span>Payment</span>
          </div>
          <div className="checkout-step-connector" />
          <div className="checkout-step">
            <span className="checkout-step-number">3</span>
            <span>Confirmation</span>
          </div>
        </div>

        {/* Main Layout */}
        <div className="checkout-layout">
          {/* Payment Methods */}
          <div className="payment-section" id="payment-section">
            <h2 className="payment-section-title">Payment Method</h2>
            <p className="payment-section-subtitle">Choose your preferred payment option</p>

            {PAYMENT_METHODS.map((method) => (
              <div
                key={method.id}
                className={`payment-method${selectedMethod === method.id ? " selected" : ""}`}
                id={`payment-${method.id}`}
              >
                <div
                  className="payment-method-header"
                  onClick={() => setSelectedMethod(selectedMethod === method.id ? null : method.id)}
                >
                  <div className="payment-radio">
                    <div className="payment-radio-dot" />
                  </div>
                  <div className="payment-method-icon">{method.icon}</div>
                  <div className="payment-method-info">
                    <div className="payment-method-name">{method.name}</div>
                    <div className="payment-method-desc">{method.desc}</div>
                  </div>
                  <i className="bi bi-chevron-down payment-method-arrow" />
                </div>

                <div className="payment-form">
                  {renderPaymentForm(method.id)}
                </div>
              </div>
            ))}

            {/* Trust Badges */}
            <div className="trust-badges">
              <div className="trust-badge">
                <i className="bi bi-shield-lock-fill" /> 256-bit SSL
              </div>
              <div className="trust-badge">
                <i className="bi bi-lock-fill" /> Secure Payment
              </div>
              <div className="trust-badge">
                <i className="bi bi-patch-check-fill" /> PCI Compliant
              </div>
              <div className="trust-badge">
                <i className="bi bi-arrow-repeat" /> Easy Refunds
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="checkout-summary" id="checkout-summary">
            <h3 className="checkout-summary-title">Order Summary</h3>

            {/* Plan Card */}
            <div className="checkout-plan-card">
              <div className="checkout-plan-header">
                <span className="checkout-plan-name">{item.tier} Plan</span>
                <span className={`checkout-plan-badge ${item.tierClass}`}>{item.tier}</span>
              </div>
              <div className="checkout-plan-category">{item.categoryLabel}</div>
              <div className="checkout-plan-billing">
                Billing: {item.billing.charAt(0).toUpperCase() + item.billing.slice(1)}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="checkout-summary-row">
              <span className="label">Subtotal</span>
              <span className="value">${subtotal}</span>
            </div>
            <div className="checkout-summary-row">
              <span className="label">Sales Tax (18%)</span>
              <span className="value">${gst}</span>
            </div>
            <div className="checkout-summary-divider" />
            <div className="checkout-summary-total">
              <span className="label">Total</span>
              <span className="value">${total}</span>
            </div>

            {/* Pay Now */}
            <button
              className={`pay-now-btn ${isFormValid && !processing ? "active" : "disabled"}`}
              onClick={handlePayNow}
              disabled={!isFormValid || processing}
              id="pay-now-btn"
            >
              {processing ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" style={{ width: '1rem', height: '1rem', display: 'inline-block', border: '0.15em solid currentColor', borderRightColor: 'transparent', borderRadius: '50%', verticalAlign: 'text-bottom' }}></span> Activating Plan...
                </>
              ) : isFormValid ? (
                <>
                  <i className="bi bi-lock-fill" /> Pay ${total} Now
                </>
              ) : (
                <>
                  <i className="bi bi-lock-fill" /> Select Payment Method
                </>
              )}
            </button>

            <p style={{ fontSize: 12, color: "var(--text-muted)", textAlign: "center", marginTop: 12, lineHeight: 1.6 }}>
              By proceeding, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Checkout;
