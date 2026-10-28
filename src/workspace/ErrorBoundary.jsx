import { Component } from "react";

export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="session-state"><h1>La page n’a pas pu s’afficher</h1><p>Rechargez TaskFlow pour retrouver votre espace.</p><button className="primary-button" onClick={() => window.location.reload()}>Recharger la page</button></main>;
    return this.props.children;
  }
}
