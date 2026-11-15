import { Component, type ReactNode } from 'react'

interface State {
  failed: boolean
}

/** If a screen throws, show a sentence instead of a blank page. No internal error text. */
export class AppErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main id="main" className="boot-fail" role="alert">
        <h1>Terra Trace hit a problem.</h1>
        <p>Cette page a rencontré un problème.</p>
        <p>Reload the page. Rechargez la page.</p>
        <button type="button" className="cta" onClick={() => window.location.reload()}>
          Reload
        </button>
      </main>
    )
  }
}
