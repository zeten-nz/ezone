/**
 * REACT ERROR BOUNDARY
 *
 * Catches JavaScript errors thrown during React rendering below it
 * and renders a fallback UI instead of crashing the component tree.
 *
 * IMPORTANT: Error Boundaries are for unexpected React runtime errors ONLY.
 * API request failures MUST be handled via page-level error state + ErrorState
 * component, NOT via Error Boundaries.
 *
 * Usage:
 *   Global (full-screen fallback):
 *     <ErrorBoundary name="GlobalBoundary">...</ErrorBoundary>
 *
 *   Per-page (inline fallback — other pages remain navigable):
 *     <ErrorBoundary name="DashboardBoundary" inline>
 *       <AdminDashboardModern />
 *     </ErrorBoundary>
 *
 * The `name` prop is used in dev logs so you can identify which boundary caught.
 * The `inline` prop switches from the full-screen fallback to a compact card.
 */

import { Component } from 'react';
import { MdWarning, MdRefresh, MdHome } from 'react-icons/md';
import { LanguageContext } from '../context/LanguageContext';

// The full-screen (GlobalBoundary) fallback sits ABOVE LanguageProvider in
// App.jsx, so it must survive even a crash inside the provider tree — it
// can't use useLanguage()/contextType and reads localStorage directly
// instead, same as src/api/client.js does for the same reason.
const GLOBAL_FALLBACK_TEXT = {
  uz: {
    title: 'Nimadir xato ketdi',
    description: 'Kutilmagan xatolik yuz berdi. Sahifani yangilashga harakat qiling.',
    tryAgain: 'Qayta urinish',
    refresh: 'Sahifani yangilash',
  },
  ru: {
    title: 'Что-то пошло не так',
    description: 'Произошла непредвиденная ошибка. Попробуйте обновить страницу.',
    tryAgain: 'Повторить попытку',
    refresh: 'Обновить страницу',
  },
};
const getGlobalFallbackText = () =>
  GLOBAL_FALLBACK_TEXT[localStorage.getItem('ezone_language') === 'ru' ? 'ru' : 'uz'];

class ErrorBoundary extends Component {
  static contextType = LanguageContext;

  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (import.meta.env.DEV) {
      console.error(
        `[ErrorBoundary:${this.props.name || 'unnamed'}] Caught error:`,
        error,
        info
      );
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    // Custom fallback provided by the caller
    if (this.props.fallback) {
      return this.props.fallback;
    }

    const errorDetail = import.meta.env.DEV && this.state.error
      ? this.state.error.message
      : null;

    // ── Inline page-level fallback ─────────────────────────────────────────
    // Used by per-route boundaries so a crash on one page doesn't cover
    // the entire screen. User can still click browser back / navigate away.
    // Every `inline` usage sits inside LanguageProvider (see App.jsx), so
    // this.context is always populated here.
    if (this.props.inline) {
      const t = this.context.t;
      return (
        <div className="flex items-center justify-center min-h-96 px-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-sm border border-red-200 p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <MdWarning className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-neutral-900">
                {t('somethingWentWrong')}
              </h2>
              <p className="text-neutral-500 text-sm mt-1">
                {t('unexpectedErrorOnPage')}
              </p>
              {errorDetail && (
                <p className="mt-2 font-mono text-xs text-red-600 bg-red-50 p-2 rounded text-left">
                  {errorDetail}
                </p>
              )}
            </div>
            <div className="flex gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                <MdRefresh className="w-4 h-4" />
                {t('tryAgain')}
              </button>
              <button
                onClick={() => window.location.replace('/')}
                className="inline-flex items-center gap-1.5 px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
              >
                <MdHome className="w-4 h-4" />
                {t('home')}
              </button>
            </div>
          </div>
        </div>
      );
    }

    // ── Full-screen fallback (global boundary) ─────────────────────────────
    const gt = getGlobalFallbackText();
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg border border-neutral-200 p-8 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
            <MdWarning className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-neutral-900">
              {gt.title}
            </h2>
            <p className="text-neutral-600 text-sm mt-2">
              {gt.description}
            </p>
            {errorDetail && (
              <p className="mt-2 font-mono text-xs text-red-600 bg-red-50 p-2 rounded text-left">
                {errorDetail}
              </p>
            )}
          </div>
          <div className="flex gap-3 justify-center">
            <button
              onClick={this.handleReset}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              {gt.tryAgain}
            </button>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg text-sm font-medium hover:bg-neutral-50 transition-colors"
            >
              {gt.refresh}
            </button>
          </div>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
