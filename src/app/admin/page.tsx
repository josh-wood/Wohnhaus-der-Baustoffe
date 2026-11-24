import type { Metadata } from "next";
import { CampaignToggle, EndTextForm, LoginForm } from "@/components/admin/AdminForms";
import { WINDOWS } from "@/config/windows";
import { texts } from "@/content/texts";
import { isAdmin, isAdminConfigured } from "@/lib/auth";
import { listBookings } from "@/lib/bookings";
import { formatDateTime, formatRange } from "@/lib/campaign";
import { getSettings } from "@/lib/settings";
import { logout } from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: texts.admin.title, robots: { index: false, follow: false } };

const t = texts.admin;

export default async function AdminPage() {
  if (!(await isAdmin())) {
    return (
      <section className="mx-auto max-w-sm space-y-6 pt-8">
        <h1 className="text-3xl italic">{t.loginTitle}</h1>
        <LoginForm configured={isAdminConfigured()} />
      </section>
    );
  }

  const [bookings, settings] = await Promise.all([listBookings(), getSettings()]);
  const perWindow = WINDOWS.map((w) => ({ ...w, count: bookings.filter((b) => b.windowId === w.id).length }));

  return (
    <section className="space-y-10" data-testid="admin-dashboard">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-3xl italic">{t.loginTitle}</h1>
        <form action={logout}>
          <button type="submit" className="underline underline-offset-4">
            {t.logout}
          </button>
        </form>
      </div>

      <div className="space-y-4 rounded-lg bg-white/70 p-4 shadow-sm">
        <h2 className="text-2xl">{t.campaign}</h2>
        <p data-testid="campaign-status" className={settings.campaignClosed ? "font-semibold text-accent" : ""}>
          {settings.campaignClosed ? t.statusClosed : t.statusOpen}
        </p>
        <CampaignToggle closed={settings.campaignClosed} />
        <EndTextForm endText={settings.endText} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="text-2xl">
            {t.bookings} <span className="text-base opacity-70" data-testid="booking-total">({t.total(bookings.length)})</span>
          </h2>
          <a href="/admin/export.csv" className="btn-secondary" data-testid="export-csv" download>
            {t.exportCsv}
          </a>
        </div>

        <ul className="grid grid-cols-3 gap-2 text-center text-sm sm:grid-cols-6" data-testid="per-window">
          {perWindow.map((w) => (
            <li key={w.id} className="rounded bg-white/70 p-2 shadow-sm">
              <div className="opacity-70">{w.label}</div>
              <div className="text-xl">{w.count}</div>
            </li>
          ))}
        </ul>

        {bookings.length === 0 ? (
          <p className="opacity-70">{t.none}</p>
        ) : (
          <>
            {/* Cards on phones */}
            <ul className="space-y-2 sm:hidden" data-testid="booking-cards">
              {bookings.map((b) => (
                <li key={b.id} className="rounded-lg bg-white/70 p-3 shadow-sm">
                  <div className="flex justify-between">
                    <strong>Fenster {b.windowId}</strong>
                    <span className="text-sm opacity-70">{formatDateTime(b.createdAt)}</span>
                  </div>
                  <div>{formatRange(b)}</div>
                  <div className="break-all text-sm">{b.email}</div>
                </li>
              ))}
            </ul>
            {/* Table from sm up */}
            <table className="hidden w-full text-left text-sm sm:table" data-testid="booking-table">
              <thead>
                <tr className="border-b border-ink/20">
                  <th className="py-2 pr-3">{t.colWindow}</th>
                  <th className="py-2 pr-3">{t.colRange}</th>
                  <th className="py-2 pr-3">{t.colEmail}</th>
                  <th className="py-2">{t.colCreated}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((b) => (
                  <tr key={b.id} className="border-b border-ink/10">
                    <td className="py-2 pr-3">{b.windowId}</td>
                    <td className="py-2 pr-3 whitespace-nowrap">{formatRange(b)}</td>
                    <td className="py-2 pr-3 break-all">{b.email}</td>
                    <td className="py-2 whitespace-nowrap">{formatDateTime(b.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </section>
  );
}
