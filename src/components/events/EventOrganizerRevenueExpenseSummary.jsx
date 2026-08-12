import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Download,
  DollarSign,
  FileText,
  Receipt,
  RefreshCcw,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";

const EventOrganizerRevenueExpenseSummary = ({
  transactions = [],
  eventName = "Event",
  currency = "INR",
  onExport,
  className = "",
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      if (!transaction.date) return true;

      const transactionDate = new Date(transaction.date);

      if (Number.isNaN(transactionDate.getTime())) {
        return true;
      }

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        if (transactionDate < start) {
          return false;
        }
      }

      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        if (transactionDate > end) {
          return false;
        }
      }

      return true;
    });
  }, [transactions, startDate, endDate]);

  const summary = useMemo(() => {
    const registrations = filteredTransactions.filter(
      (transaction) =>
        transaction.type === "registration"
    );

    const refunds = filteredTransactions.filter(
      (transaction) =>
        transaction.type === "refund"
    );

    const expenses = filteredTransactions.filter(
      (transaction) =>
        transaction.type === "expense"
    );

    const totalRegistrations = registrations.reduce(
      (total, transaction) =>
        total +
        (Number(transaction.participants) || 1),
      0
    );

    const registrationRevenue = registrations.reduce(
      (total, transaction) =>
        total + Math.abs(Number(transaction.amount) || 0),
      0
    );

    const refundAmount = refunds.reduce(
      (total, transaction) =>
        total + Math.abs(Number(transaction.amount) || 0),
      0
    );

    const expenseAmount = expenses.reduce(
      (total, transaction) =>
        total + Math.abs(Number(transaction.amount) || 0),
      0
    );

    const netRevenue =
      registrationRevenue -
      refundAmount -
      expenseAmount;

    const revenuePerParticipant =
      totalRegistrations > 0
        ? registrationRevenue / totalRegistrations
        : 0;

    return {
      totalRegistrations,
      registrationRevenue,
      refundAmount,
      expenseAmount,
      netRevenue,
      revenuePerParticipant,
    };
  }, [filteredTransactions]);

  const handleExport = async () => {
    setIsExporting(true);

    try {
      if (onExport) {
        await onExport({
          eventName,
          currency,
          startDate,
          endDate,
          summary,
          transactions: filteredTransactions,
        });
      } else {
        exportFinancialReport({
          eventName,
          currency,
          startDate,
          endDate,
          summary,
          transactions: filteredTransactions,
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-6 dark:border-slate-800 dark:bg-slate-950 ${className}`}
    >
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400">
            <Wallet size={20} />
          </div>

          <div>
            <p className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Organizer Finance
            </p>

            <h2 className="mt-1 text-xl font-bold text-slate-900 dark:text-white">
              Revenue & Expense Summary
            </h2>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Financial overview for {eventName}.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleExport}
          disabled={isExporting}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-[8px] font-bold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isExporting ? (
            <RefreshCcw
              size={13}
              className="animate-spin"
            />
          ) : (
            <Download size={13} />
          )}

          {isExporting
            ? "Generating..."
            : "Download Report"}
        </button>
      </div>

      {/* Date filter */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
        <div className="flex items-center gap-2">
          <Calendar
            size={15}
            className="text-slate-500"
          />

          <p className="text-[9px] font-bold text-slate-800 dark:text-white">
            Filter by Date
          </p>
        </div>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <DateInput
            label="From"
            value={startDate}
            onChange={setStartDate}
          />

          <DateInput
            label="To"
            value={endDate}
            onChange={setEndDate}
          />
        </div>

        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => {
              setStartDate("");
              setEndDate("");
            }}
            className="mt-3 text-[7px] font-bold text-emerald-600 hover:underline dark:text-emerald-400"
          >
            Clear date filter
          </button>
        )}
      </div>

      {/* Main statistics */}
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <FinanceCard
          icon={<Receipt size={16} />}
          label="Total Registrations"
          value={summary.totalRegistrations}
          description="Registered participants"
          className="text-indigo-600 dark:text-indigo-400"
        />

        <FinanceCard
          icon={<ArrowUpRight size={16} />}
          label="Registration Revenue"
          value={formatCurrency(
            summary.registrationRevenue,
            currency
          )}
          description="Gross registration income"
          className="text-emerald-600 dark:text-emerald-400"
        />

        <FinanceCard
          icon={<ArrowDownRight size={16} />}
          label="Refunds"
          value={formatCurrency(
            summary.refundAmount,
            currency
          )}
          description="Total refunded amount"
          className="text-red-600 dark:text-red-400"
        />

        <FinanceCard
          icon={<Wallet size={16} />}
          label="Estimated Expenses"
          value={formatCurrency(
            summary.expenseAmount,
            currency
          )}
          description="Event-related expenses"
          className="text-orange-600 dark:text-orange-400"
        />

        <FinanceCard
          icon={<TrendingUp size={16} />}
          label="Net Revenue"
          value={formatCurrency(
            summary.netRevenue,
            currency
          )}
          description="Revenue after refunds & expenses"
          className={
            summary.netRevenue >= 0
              ? "text-emerald-600 dark:text-emerald-400"
              : "text-red-600 dark:text-red-400"
          }
        />

        <FinanceCard
          icon={<DollarSign size={16} />}
          label="Revenue / Participant"
          value={formatCurrency(
            summary.revenuePerParticipant,
            currency
          )}
          description="Average gross revenue"
          className="text-purple-600 dark:text-purple-400"
        />
      </div>

      {/* Net revenue highlight */}
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 dark:border-emerald-900/30 dark:bg-emerald-900/10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[8px] font-bold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
              Net Event Revenue
            </p>

            <p
              className={`mt-1 text-2xl font-bold ${
                summary.netRevenue >= 0
                  ? "text-emerald-700 dark:text-emerald-400"
                  : "text-red-600 dark:text-red-400"
              }`}
            >
              {formatCurrency(
                summary.netRevenue,
                currency
              )}
            </p>

            <p className="mt-1 text-[7px] text-emerald-700/70 dark:text-emerald-400/70">
              Registration revenue − refunds − estimated
              expenses
            </p>
          </div>

          <div className="rounded-xl bg-white px-4 py-3 shadow-sm dark:bg-slate-900">
            <p className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
              Records
            </p>

            <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
              {filteredTransactions.length}
            </p>
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="mt-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[9px] font-bold text-slate-800 dark:text-white">
              Financial Activity
            </p>

            <p className="mt-1 text-[7px] text-slate-400">
              Transactions included in this summary.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-[7px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            {filteredTransactions.length} records
          </span>
        </div>

        <div className="mt-4 space-y-3">
          {filteredTransactions.length === 0 ? (
            <EmptyTransactions />
          ) : (
            filteredTransactions.map(
              (transaction, index) => (
                <TransactionRow
                  key={
                    transaction.id ||
                    `${transaction.date}-${index}`
                  }
                  transaction={transaction}
                  currency={currency}
                />
              )
            )
          )}
        </div>
      </div>
    </section>
  );
};

const DateInput = ({
  label,
  value,
  onChange,
}) => (
  <div>
    <label className="text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </label>

    <input
      type="date"
      value={value}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs outline-none focus:border-emerald-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
    />
  </div>
);

const FinanceCard = ({
  icon,
  label,
  value,
  description,
  className,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 ${className}`}
    >
      {icon}
    </div>

    <p className="mt-3 text-[7px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>

    <p className="mt-1 text-lg font-bold text-slate-800 dark:text-white">
      {value}
    </p>

    <p className="mt-1 text-[7px] text-slate-400">
      {description}
    </p>
  </div>
);

const TransactionRow = ({
  transaction,
  currency,
}) => {
  const isRevenue =
    transaction.type ===
    "registration";

  const isRefund =
    transaction.type ===
    "refund";

  const isExpense =
    transaction.type ===
    "expense";

  const amount = Math.abs(
    Number(transaction.amount) || 0
  );

  const typeLabel = isRevenue
    ? "Registration"
    : isRefund
      ? "Refund"
      : isExpense
        ? "Expense"
        : "Other";

  const amountPrefix =
    isRevenue ? "+" : "-";

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900 sm:flex-row sm:items-center">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          isRevenue
            ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/10 dark:text-emerald-400"
            : isRefund
              ? "bg-red-50 text-red-600 dark:bg-red-900/10 dark:text-red-400"
              : "bg-orange-50 text-orange-600 dark:bg-orange-900/10 dark:text-orange-400"
        }`}
      >
        {isRevenue ? (
          <ArrowUpRight size={16} />
        ) : (
          <ArrowDownRight size={16} />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[9px] font-bold text-slate-800 dark:text-white">
          {transaction.description ||
            typeLabel}
        </p>

        <div className="mt-1 flex flex-wrap gap-3">
          <span className="text-[7px] text-slate-400">
            {formatDate(
              transaction.date
            )}
          </span>

          <span
            className={`text-[7px] font-bold ${
              isRevenue
                ? "text-emerald-600 dark:text-emerald-400"
                : isRefund
                  ? "text-red-600 dark:text-red-400"
                  : "text-orange-600 dark:text-orange-400"
            }`}
          >
            {typeLabel}
          </span>
        </div>
      </div>

      <p
        className={`text-sm font-bold ${
          isRevenue
            ? "text-emerald-600 dark:text-emerald-400"
            : "text-red-600 dark:text-red-400"
        }`}
      >
        {amountPrefix}
        {formatCurrency(
          amount,
          currency
        )}
      </p>
    </div>
  );
};

const EmptyTransactions = () => (
  <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
    <FileText
      size={22}
      className="mx-auto text-slate-400"
    />

    <p className="mt-3 text-[9px] font-bold text-slate-700 dark:text-slate-200">
      No financial records found
    </p>

    <p className="mt-1 text-[7px] text-slate-400">
      Try changing the date range or add financial
      transactions.
    </p>
  </div>
);

const formatCurrency = (
  amount,
  currency
) => {
  try {
    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }
    ).format(amount);
  } catch {
    return `${currency} ${Number(
      amount || 0
    ).toFixed(2)}`;
  }
};

const formatDate = (
  value
) => {
  if (!value) return "N/A";

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value);
  }

  return date.toLocaleDateString(
    undefined,
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );
};

const escapeCSV = (
  value
) => {
  const text = String(
    value ?? ""
  );

  if (
    /[",\n]/.test(text)
  ) {
    return `"${text.replace(
      /"/g,
      '""'
    )}"`;
  }

  return text;
};

const exportFinancialReport = ({
  eventName,
  currency,
  startDate,
  endDate,
  summary,
  transactions,
}) => {
  const headers = [
    "Event",
    "Date",
    "Description",
    "Type",
    "Amount",
  ];

  const rows = transactions.map(
    (transaction) => [
      eventName,
      formatDate(
        transaction.date
      ),
      transaction.description ||
        "",
      transaction.type ||
        "",
      formatCurrency(
        Math.abs(
          Number(
            transaction.amount
          ) || 0
        ),
        currency
      ),
    ]
  );

  rows.push(
    [],
    [
      "SUMMARY",
      "",
      "Total Registrations",
      "",
      summary.totalRegistrations,
    ],
    [
      "",
      "",
      "Registration Revenue",
      "",
      formatCurrency(
        summary.registrationRevenue,
        currency
      ),
    ],
    [
      "",
      "",
      "Refunds",
      "",
      formatCurrency(
        summary.refundAmount,
        currency
      ),
    ],
    [
      "",
      "",
      "Estimated Expenses",
      "",
      formatCurrency(
        summary.expenseAmount,
        currency
      ),
    ],
    [
      "",
      "",
      "Net Revenue",
      "",
      formatCurrency(
        summary.netRevenue,
        currency
      ),
    ],
    [
      "",
      "",
      "Revenue Per Participant",
      "",
      formatCurrency(
        summary.revenuePerParticipant,
        currency
      ),
    ]
  );

  const csv = rows
    .map((row) =>
      row
        .map(escapeCSV)
        .join(",")
    )
    .join("\n");

  const blob = new Blob(
    [csv],
    {
      type: "text/csv;charset=utf-8;",
    }
  );

  const url =
    URL.createObjectURL(
      blob
    );

  const link =
    document.createElement(
      "a"
    );

  link.href = url;

  link.download =
    `${eventName
      .replace(
        /[^a-z0-9]+/gi,
        "-"
      )
      .toLowerCase()}-financial-report.csv`;

  document.body.appendChild(
    link
  );

  link.click();

  link.remove();

  URL.revokeObjectURL(
    url
  );
};

export default EventOrganizerRevenueExpenseSummary;