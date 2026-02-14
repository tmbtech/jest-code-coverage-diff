import './App.css'
import { Counter } from './components/Counter/Counter'
import { Calculator } from './components/Calculator/Calculator'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Jest Code Coverage Diff Demo</h1>
        <p>
          This project demonstrates line-level code coverage diff in GitHub Actions,
          similar to SonarCloud's quality gates for new code.
        </p>
      </header>

      <main className="App-main">
        <Counter />
        <Calculator />
      </main>

      <footer className="App-footer">
        <p>
          When you create a PR, the GitHub Actions workflow will analyze only the lines
          you changed and report coverage for those specific lines.
        </p>
      </footer>
    </div>
  )
}

export default App
