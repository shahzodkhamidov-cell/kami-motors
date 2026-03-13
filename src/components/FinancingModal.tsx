"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { X, CheckCircle, Loader2 } from "lucide-react";
import { Car } from "@/types";
import { formatCurrency } from "@/lib/utils";

const schema = z.object({
  firstName: z.string().min(2, "Required"),
  lastName: z.string().min(2, "Required"),
  email: z.string().email("Invalid email"),
  phone: z.string().min(10, "Invalid phone number"),
  dateOfBirth: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  employmentStatus: z.enum(["employed", "self-employed", "unemployed", "retired"]),
  employer: z.string().optional(),
  monthlyIncome: z.number().min(1, "Required"),
  creditScoreRange: z.enum(["excellent", "good", "fair", "poor"]),
  downPayment: z.number().min(0),
  loanTerm: z.number().min(12).max(84),
  additionalNotes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

interface FinancingModalProps {
  car: Car;
  isOpen: boolean;
  onClose: () => void;
}

export default function FinancingModal({ car, isOpen, onClose }: FinancingModalProps) {
  const [step, setStep] = useState(1);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      loanTerm: 60,
      downPayment: 0,
    },
  });

  if (!isOpen) return null;

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          carId: car.id,
          monthlyIncome: Math.round(data.monthlyIncome * 100),
          downPayment: Math.round(data.downPayment * 100),
        }),
      });
      if (!res.ok) throw new Error("Submission failed");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full bg-[var(--bg-card-2)] border border-[var(--border)] text-[var(--text-primary)] px-3 py-2.5 text-sm focus:border-[var(--gold)] transition-colors placeholder-[var(--text-dim)]";
  const labelClass = "block text-[var(--text-dim)] text-[10px] tracking-widest uppercase font-medium mb-1.5";
  const errorClass = "text-red-400 text-xs mt-1";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-[var(--bg-card)] border border-[var(--border)] w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-[var(--bg-card)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between z-10">
          <div>
            <h2
              className="text-[var(--text-primary)] text-2xl leading-none"
              style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}
            >
              Financing Application
            </h2>
            <p className="text-[var(--text-dim)] text-xs tracking-wide mt-0.5">
              {car.year} {car.make} {car.model} — {formatCurrency(car.price)}
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--text-dim)] hover:text-[var(--text-primary)] transition-colors p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 border border-(--gold)/30 bg-(--gold)/5 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-[var(--gold)]" />
              </div>
              <h3
                className="text-[var(--text-primary)] text-3xl leading-none mb-2"
                style={{ fontFamily: "var(--font-bebas), sans-serif" }}
              >
                Application Submitted!
              </h3>
              <p className="text-[var(--text-muted)] text-sm mb-6">
                We&apos;ve received your application for the {car.year} {car.make} {car.model}.
                Our team will contact you within 24 hours.
              </p>
              <button
                onClick={onClose}
                className="bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[#080807] font-bold px-6 py-2.5 text-sm tracking-widest uppercase transition-colors"
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Step indicator */}
              <div className="flex gap-2 mb-6">
                {[1, 2, 3].map((s) => (
                  <div key={s} className="flex items-center gap-2 flex-1">
                    <div
                      className={`w-7 h-7 flex items-center justify-center text-xs font-bold shrink-0 border ${
                        step >= s
                          ? "bg-[var(--gold)] border-[var(--gold)] text-[#080807]"
                          : "bg-transparent border-[var(--border)] text-[var(--text-dim)]"
                      }`}
                    >
                      {s}
                    </div>
                    <div className={`h-px flex-1 ${s < 3 ? (step > s ? "bg-[var(--gold)]" : "bg-[var(--border)]") : "hidden"}`} />
                  </div>
                ))}
              </div>

              {step === 1 && (
                <>
                  <h3 className="text-[var(--gold)] text-xl leading-none mb-4" style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}>Personal Information</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={labelClass}>First Name *</label>
                      <input {...register("firstName")} placeholder="John" className={inputClass} />
                      {errors.firstName && <p className={errorClass}>{errors.firstName.message}</p>}
                    </div>
                    <div>
                      <label className={labelClass}>Last Name *</label>
                      <input {...register("lastName")} placeholder="Doe" className={inputClass} />
                      {errors.lastName && <p className={errorClass}>{errors.lastName.message}</p>}
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>Email *</label>
                    <input {...register("email")} type="email" placeholder="john@email.com" className={inputClass} />
                    {errors.email && <p className={errorClass}>{errors.email.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Phone *</label>
                    <input {...register("phone")} placeholder="(305) 815-8880" className={inputClass} />
                    {errors.phone && <p className={errorClass}>{errors.phone.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Date of Birth</label>
                    <input {...register("dateOfBirth")} type="date" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Address</label>
                    <input {...register("address")} placeholder="123 Main St" className={inputClass} />
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2">
                      <label className={labelClass}>City</label>
                      <input {...register("city")} placeholder="Metairie" className={inputClass} />
                    </div>
                    <div>
                      <label className={labelClass}>State</label>
                      <input {...register("state")} placeholder="LA" maxLength={2} className={inputClass} />
                    </div>
                  </div>
                  <div>
                    <label className={labelClass}>ZIP Code</label>
                    <input {...register("zipCode")} placeholder="70001" className={inputClass} />
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  <h3 className="text-[var(--gold)] text-xl leading-none mb-4" style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}>Employment & Income</h3>
                  <div>
                    <label className={labelClass}>Employment Status *</label>
                    <select {...register("employmentStatus")} className={inputClass}>
                      <option value="">Select status</option>
                      <option value="employed">Employed</option>
                      <option value="self-employed">Self-Employed</option>
                      <option value="retired">Retired</option>
                      <option value="unemployed">Unemployed</option>
                    </select>
                    {errors.employmentStatus && <p className={errorClass}>{errors.employmentStatus.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Employer Name</label>
                    <input {...register("employer")} placeholder="ABC Company" className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Gross Monthly Income ($) *</label>
                    <input
                      {...register("monthlyIncome", { valueAsNumber: true })}
                      type="number"
                      placeholder="4000"
                      className={inputClass}
                    />
                    {errors.monthlyIncome && <p className={errorClass}>{errors.monthlyIncome.message}</p>}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  <h3 className="text-[var(--gold)] text-xl leading-none mb-4" style={{ fontFamily: "var(--font-bebas), sans-serif", letterSpacing: "0.05em" }}>Loan Details</h3>
                  <div>
                    <label className={labelClass}>Credit Score Range *</label>
                    <select {...register("creditScoreRange")} className={inputClass}>
                      <option value="">Select range</option>
                      <option value="excellent">Excellent (750+)</option>
                      <option value="good">Good (700–749)</option>
                      <option value="fair">Fair (650–699)</option>
                      <option value="poor">Poor (Below 650)</option>
                    </select>
                    {errors.creditScoreRange && <p className={errorClass}>{errors.creditScoreRange.message}</p>}
                  </div>
                  <div>
                    <label className={labelClass}>Down Payment ($)</label>
                    <input
                      {...register("downPayment", { valueAsNumber: true })}
                      type="number"
                      placeholder="0"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Loan Term (months)</label>
                    <select {...register("loanTerm", { valueAsNumber: true })} className={inputClass}>
                      <option value={24}>24 months (2 years)</option>
                      <option value={36}>36 months (3 years)</option>
                      <option value={48}>48 months (4 years)</option>
                      <option value={60}>60 months (5 years)</option>
                      <option value={72}>72 months (6 years)</option>
                      <option value={84}>84 months (7 years)</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Additional Notes</label>
                    <textarea
                      {...register("additionalNotes")}
                      rows={3}
                      placeholder="Any other information you'd like to share..."
                      className={inputClass + " resize-none"}
                    />
                  </div>
                  {error && (
                    <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                      {error}
                    </p>
                  )}
                </>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-2">
                {step > 1 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="flex-1 bg-[var(--bg-card-2)] border border-[var(--border)] hover:border-(--gold)/30 text-[var(--text-muted)] hover:text-[var(--text-primary)] font-medium py-3 text-xs tracking-widest uppercase transition-colors"
                  >
                    Back
                  </button>
                )}
                {step < 3 ? (
                  <button
                    type="button"
                    onClick={() => setStep(step + 1)}
                    className="flex-1 bg-[var(--gold)] hover:bg-[var(--gold-light)] text-[#080807] font-bold py-3 text-xs tracking-widest uppercase transition-colors"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-[var(--gold)] hover:bg-[var(--gold-light)] disabled:bg-(--gold)/40 disabled:cursor-not-allowed text-[#080807] font-bold py-3 text-xs tracking-widest uppercase transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      "Submit Application"
                    )}
                  </button>
                )}
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
