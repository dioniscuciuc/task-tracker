function AuthScreen({
  mode,
  onModeChange,
  form,
  onChange,
  onSubmit,
  loading,
  error,
}) {
  return (
    <div className="auth-shell">
      <div className="auth-card panel">
        <div className="auth-header">
          <div className="brand-mark auth-brand">L</div>
          <div>
            <p className="eyebrow">Personal workspace</p>
            <h1>Lattice Board</h1>
          </div>
        </div>

        <div className="auth-toggle" role="tablist" aria-label="Authentication mode">
          <button
            type="button"
            className={mode === 'login' ? 'auth-toggle-button active' : 'auth-toggle-button'}
            onClick={() => onModeChange('login')}
          >
            Log in
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'auth-toggle-button active' : 'auth-toggle-button'}
            onClick={() => onModeChange('register')}
          >
            Create account
          </button>
        </div>

        <form onSubmit={onSubmit} className="auth-form">
          <label className="field">
            <span>Email</span>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={onChange}
              placeholder="you@example.com"
              required
            />
          </label>

          <label className="field">
            <span>Password</span>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="At least 6 characters"
              minLength="6"
              required
            />
          </label>

          {error ? <p className="auth-error">{error}</p> : null}

          <button type="submit" className="primary-button auth-submit" disabled={loading}>
            {loading ? 'Please wait...' : mode === 'login' ? 'Log in' : 'Create account'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AuthScreen
