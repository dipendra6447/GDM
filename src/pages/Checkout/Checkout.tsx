"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import { useCart } from "../../hooks/CartContext";
import "../../styles/checkout.css";

/* ── Payment Method Types ── */
type PaymentMethodType = "credit-card" | "debit-card" | "upi" | "net-banking" | "emi";

interface CardFormState {
  cardNumber: string;
  expiry: string;
  cvv: string;
  cardHolder: string;
}

const BANKS = [
  { id: "sbi", name: "SBI", icon: "🏦" },
  { id: "hdfc", name: "HDFC", icon: "🏛️" },
  { id: "icici", name: "ICICI", icon: "🏦" },
  { id: "axis", name: "Axis", icon: "🏛️" },
  { id: "kotak", name: "Kotak", icon: "🏦" },
  { id: "pnb", name: "PNB", icon: "🏛️" },
];

const EMI_TENURES = [
  { months: 3, label: "3 Months" },
  { months: 6, label: "6 Months" },
  { months: 9, label: "9 Months" },
  { months: 12, label: "12 Months" },
];

const PAYMENT_METHODS = [
  {
    id: "credit-card" as PaymentMethodType,
    name: "Credit Card",
    desc: "Visa, Mastercard, Rupay",
    icon: "💳",
  },
  {
    id: "debit-card" as PaymentMethodType,
    name: "Debit Card",
    desc: "All major banks supported",
    icon: "💳",
  },
  {
    id: "upi" as PaymentMethodType,
    name: "UPI",
    desc: "Google Pay, PhonePe, Paytm",
    icon: "📱",
  },
  {
    id: "net-banking" as PaymentMethodType,
    name: "Net Banking",
    desc: "All major banks",
    icon: "🏦",
  },
  {
    id: "emi" as PaymentMethodType,
    name: "EMI",
    desc: "Easy installments",
    icon: "📦",
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
  const { item, getPrice, getPriceNum, getBillingLabel, clearCart } = useCart();
  const pageRef = useRef<HTMLDivElement>(null);

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethodType | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);

  /* ── Card form state ── */
  const [creditForm, setCreditForm] = useState<CardFormState>({
    cardNumber: "", expiry: "", cvv: "", cardHolder: "",
  });
  const [debitForm, setDebitForm] = useState<CardFormState>({
    cardNumber: "", expiry: "", cvv: "", cardHolder: "",
  });
  const [upiId, setUpiId] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [emiBank, setEmiBank] = useState("");
  const [emiTenure, setEmiTenure] = useState<number | null>(null);

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
      case "upi":
        return upiId.includes("@") && upiId.length > 3;
      case "net-banking":
        return selectedBank.length > 0;
      case "emi":
        return emiBank.length > 0 && emiTenure !== null;
      default:
        return false;
    }
  }, [selectedMethod, creditForm, debitForm, upiId, selectedBank, emiBank, emiTenure]);

  /* ── Redirect if no item ── */
  useEffect(() => {
    if (!item) {
      router.push("/cart");
    }
  }, [item, router]);

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
  const handlePayNow = () => {
    if (!isFormValid) return;
    setShowSuccess(true);
  };

  /* ── Handle success close ── */
  const handleSuccessClose = () => {
    clearCart();
    setShowSuccess(false);
    router.push("/");
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
      case "upi":
        return (
          <>
            <div className="payment-form-divider" />
            <div className="payment-form-row single">
              <div className="payment-form-group">
                <label className="payment-form-label" htmlFor="upi-id">UPI ID</label>
                <div className="upi-input-wrapper">
                  <input
                    type="text"
                    id="upi-id"
                    placeholder="yourname"
                    value={upiId.split("@")[0] || upiId}
                    onChange={(e) => setUpiId(e.target.value.includes("@") ? e.target.value : e.target.value + "@upi")}
                  />
                  <span className="upi-suffix">@upi</span>
                </div>
              </div>
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
                  <option value="sbi">State Bank of India</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Mahindra Bank</option>
                  <option value="pnb">Punjab National Bank</option>
                  <option value="bob">Bank of Baroda</option>
                  <option value="canara">Canara Bank</option>
                  <option value="idbi">IDBI Bank</option>
                  <option value="yes">Yes Bank</option>
                </select>
              </div>
            </div>
          </>
        );
      case "emi":
        return (
          <>
            <div className="payment-form-divider" />
            <div className="payment-form-row single">
              <div className="payment-form-group">
                <label className="payment-form-label" htmlFor="emi-bank">Select Bank for EMI</label>
                <select
                  className="payment-form-select"
                  id="emi-bank"
                  value={emiBank}
                  onChange={(e) => setEmiBank(e.target.value)}
                >
                  <option value="">Choose a bank...</option>
                  <option value="hdfc">HDFC Bank</option>
                  <option value="icici">ICICI Bank</option>
                  <option value="sbi">SBI Card</option>
                  <option value="axis">Axis Bank</option>
                  <option value="kotak">Kotak Bank</option>
                </select>
              </div>
            </div>
            <label className="payment-form-label" style={{ marginBottom: 12, marginTop: 8, display: "block" }}>
              Select Tenure
            </label>
            <div className="emi-tenure-grid">
              {EMI_TENURES.map((t) => (
                <div
                  key={t.months}
                  className={`emi-tenure-option${emiTenure === t.months ? " selected" : ""}`}
                  onClick={() => setEmiTenure(t.months)}
                  id={`emi-tenure-${t.months}`}
                >
                  <div className="emi-tenure-months">{t.months}</div>
                  <div className="emi-tenure-label">Months</div>
                  <div className="emi-tenure-amount">
                    ₹{Math.round(total / t.months)}/mo
                  </div>
                </div>
              ))}
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

      <div className="container" style={{ position: "relative", zIndex: 1 }}>
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
              <span className="value">₹{subtotal}</span>
            </div>
            <div className="checkout-summary-row">
              <span className="label">GST (18%)</span>
              <span className="value">₹{gst}</span>
            </div>
            <div className="checkout-summary-divider" />
            <div className="checkout-summary-total">
              <span className="label">Total</span>
              <span className="value">₹{total}</span>
            </div>

            {/* Pay Now */}
            <button
              className={`pay-now-btn ${isFormValid ? "active" : "disabled"}`}
              onClick={handlePayNow}
              disabled={!isFormValid}
              id="pay-now-btn"
            >
              {isFormValid ? (
                <>
                  <i className="bi bi-lock-fill" /> Pay ₹{total} Now
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

      {/* Success Modal */}
      {showSuccess && (
        <div className="success-overlay" id="success-overlay">
          <div className="success-modal" id="success-modal">
            <Confetti />

            <div className="success-checkmark">✓</div>
            <h2 className="success-title">Payment Successful!</h2>
            <p className="success-subtitle">
              Your {item.tier} Plan subscription has been activated. Welcome to JobNest Premium!
            </p>

            <div className="success-details">
              <div className="success-detail-row">
                <span className="label">Plan</span>
                <span className="value">{item.categoryLabel} — {item.tier}</span>
              </div>
              <div className="success-detail-divider" />
              <div className="success-detail-row">
                <span className="label">Billing</span>
                <span className="value" style={{ textTransform: "capitalize" }}>{item.billing}</span>
              </div>
              <div className="success-detail-divider" />
              <div className="success-detail-row">
                <span className="label">Amount Paid</span>
                <span className="value" style={{ color: "var(--gold)" }}>₹{total}</span>
              </div>
              <div className="success-detail-divider" />
              <div className="success-detail-row">
                <span className="label">Transaction ID</span>
                <span className="value">TXN{Date.now().toString().slice(-8)}</span>
              </div>
            </div>

            <button className="success-btn" onClick={handleSuccessClose} id="success-go-home">
              Go to Dashboard <span>→</span>
            </button>
            <button className="success-secondary-btn" onClick={handleSuccessClose}>
              Back to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Checkout;
