import React, { useMemo } from "react";

export const MailIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect x="3" y="5" width="18" height="14" rx="2"/>
    <path d="M3 7l9 6 9-6"/>
  </svg>
);

export const UserIcon = (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4" />
    <path d="M4 20a8 8 0 0 1 16 0" />
  </svg>
);

export const EyeIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="text-gray-600">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8Z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>
);

export const EyeOffIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
       viewBox="0 0 24 24" fill="none" stroke="currentColor"
       strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
       className="text-gray-600">
    <path d="M3 3l18 18M10.58 10.58A3 3 0 0 0 12 15a3 3 0 0 0 2.42-1.36"/>
    <path d="M9.88 5.06A10.94 10.94 0 0 1 12 4c7 0 11 8 11 8a19.79 19.79 0 0 1-5.1 6.1"/>
    <path d="M6.12 6.12A19.79 19.79 0 0 0 1 12s4 8 11 8a10.94 10.94 0 0 0 2.12-.22"/>
  </svg>
);

export const LockIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"
    aria-hidden="true">
    <rect x="4" y="11" width="16" height="9" rx="2"/>
    <path d="M8 11V7a4 4 0 0 1 8 0v4"/>
  </svg>
);

export const CheckIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="text-emerald-500" aria-hidden="true">
    <path d="M20 6L9 17l-5-5"/>
  </svg>
);

export const ErrorIcon = (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18"
    viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
    className="text-red-500" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 8v5M12 16h.01"/>
  </svg>
);

export const Spinner = (
  <svg className="animate-spin text-gray-400" xmlns="http://www.w3.org/2000/svg"
    width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10" strokeOpacity="0.25"/>
    <path d="M12 2a10 10 0 0 1 10 10" />
  </svg>
);

export default function SmartInput({
  id,
  type = "text",
  value,
  onChange,
  label = "Label",
  placeholder,
  autoComplete,
  icon = null,
  status = "idle",
  message = "",
  inputMode,
  maxLength,
  disabled = false,
  readOnly = false,
  endSlot = null,
  className = "",
}) {
  const ringClasses = useMemo(() => {
    if (status === "valid")   return "focus:ring-2 focus:ring-emerald-500";
    if (status === "invalid") return "focus:ring-2 focus:ring-red-500";
    if (status === "loading") return "focus:ring-2 focus:ring-[#3D418A]";
    return "focus:ring-2 focus:ring-[#3D418A]";
  }, [status]);

  const borderColor = useMemo(() => {
    if (status === "valid")   return "border-emerald-300";
    if (status === "invalid") return "border-red-400";
    return "border-gray-300";
  }, [status]);

  const resolvedPlaceholder = placeholder ?? label;

  return (
    <div className={`w-full ${className}`}>
      <div className="relative">
        {icon && (
          <div
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600 pointer-events-none"
            aria-hidden="true"
          >
            {icon}
          </div>
        )}

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {endSlot ? (
            <div className="flex items-center">{endSlot}</div>
          ) : status === "loading" ? (
            Spinner
          ) : status === "invalid" ? (
            ErrorIcon
          ) : status === "valid" ? (
            CheckIcon
          ) : null}
        </div>

        <input
          id={id}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={resolvedPlaceholder}
          autoComplete={autoComplete}
          inputMode={inputMode}
          maxLength={maxLength}
          disabled={disabled}
          readOnly={readOnly}
          aria-invalid={status === "invalid"}
          className={`
            w-full bg-white ${borderColor} rounded-xl
            h-12 pl-10 pr-10
            text-[15px] leading-[1.2] text-gray-900 placeholder-gray-500
            shadow-sm focus:outline-none ${ringClasses} focus:border-transparent
            transition
          `}
        />
      </div>

      {message && (
        <div
          className={`mt-1.5 text-[12px] ${
            status === "invalid" ? "text-red-600" : "text-gray-600"
          }`}
          role={status === "invalid" ? "alert" : undefined}
        >
          {message}
        </div>
      )}
    </div>
  );
}
