# Can't Hurt Me — Challenge Tracker (React)

A simple browser-only app to track **uncomfortable challenges**, **daily discipline tasks**, and **goals with deadlines** — inspired by the *Can't Hurt Me* mindset.

Everything is stored locally in your browser (**localStorage**). You can also **export/import** your data as JSON.

---

## Features

- 5 pages (one per “chapter/area”) with dedicated lists
- Add items with:
  - **Área**: Pessoal / Profissional / Social
  - **Tipo**: Mental / Físico / Emocional
  - **Prioridade** (only on *Disciplina Diária*): Alta / Média / Baixa
  - **Prazo** (only on *Responsabilidade e Metas*)
- Mark as **Concluir / Desfazer**
- **Search + filters + sorting**
  - Filter by: done status and priority
  - Sort by: newest, deadline, or priority
- **Progress**: completed count + % (and chart UI)
- **Export / Import JSON** (easy backup/restore)

---

## Routes / Pages

- `/` — Início
- `/conheca-se` — Conheça-se
- `/responsabilidade` — Responsabilidade e Metas
- `/disciplina` — Disciplina Diária
- `/mente-calejada` — Mente Calejada
- `/seja-raro` — Seja Raro

---

## Tech Stack

- React (Create React App / `react-scripts`)
- React Router
- Tailwind CSS
- Recharts
- Browser localStorage

---

## Getting Started

### Prerequisites
- Node.js (LTS recommended)
- npm

### Install
```bash
npm install
```

### Run (dev)
```bash
npm start
```

Open:
- http://localhost:3000

### Build
```bash
npm run build
```

---

## Data Storage (localStorage keys)

Each page saves to its own key:

- `knowYourselfEntries`
- `accountabilityGoals`
- `disciplineTasks`
- `toughMindEntries`
- `beRareEntries`

Export downloads a file named like `<storageKey>.json` and import expects a valid JSON array.

---

## Disclaimer

This is a personal productivity project inspired by the themes in *Can't Hurt Me*.  
Not affiliated with David Goggins or the book’s publishers.

---

## License

No license has been added yet.
If you want it to be open-source friendly, consider adding an MIT License.
