import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const priorityColors = {
  Alta: 'bg-red-100 text-red-800 border-red-400',
  Média: 'bg-yellow-100 text-yellow-800 border-yellow-400',
  Baixa: 'bg-green-100 text-green-800 border-green-400'
};

function PriorityBadge({ priority }) {
  return (
    <span className={`inline-block px-2 py-1 text-sm border rounded ${priorityColors[priority] || ''}`}>{priority}</span>
  );
}

function createEntryPage({ storageKey, title, description, placeholder, showPriority = false, showType = false, showDeadline = false }) {
  return function EntryPage() {
    const [entries, setEntries] = useState([]);
    const [input, setInput] = useState('');
    const [area, setArea] = useState('Pessoal');
    const [priority, setPriority] = useState('Média');
    const [type, setType] = useState('Mental');
    const [deadline, setDeadline] = useState('');
    const [search, setSearch] = useState('');
    const [filterDone, setFilterDone] = useState('all');
    const [filterPriority, setFilterPriority] = useState('all');
    const [sortKey, setSortKey] = useState('createdAt');
    const [filteredEntries, setFilteredEntries] = useState([]);
    const [filtersActive, setFiltersActive] = useState(false); // Novo estado para controlar filtros
    const isInitialLoad = useRef(true); // Adicionado para controlar a carga inicial

  useEffect(() => {
      try {
        const stored = JSON.parse(localStorage.getItem(storageKey)) || [];
        console.log("Carregado do localStorage:", stored);
        setEntries(stored);
        setFilteredEntries(stored);
      } catch (error) {
        console.error("Erro ao carregar do localStorage:", error);
      }
    }, [storageKey]);

    // Sincroniza os dados com o localStorage sempre que `entries` mudar
    useEffect(() => {
      if (isInitialLoad.current) {
        isInitialLoad.current = false; // Marca que a carga inicial já foi feita
        return;
      }

      try {
        localStorage.setItem(storageKey, JSON.stringify(entries));
        console.log("Salvo no localStorage:", entries);
      } catch (error) {
        console.error("Erro ao salvar no localStorage:", error);
      }
    }, [entries, storageKey]);

 // Atualiza filteredEntries automaticamente quando entries muda e os filtros não estão ativos
    useEffect(() => {
      if (!filtersActive) {
        setFilteredEntries(entries);
      }
    }, [entries, filtersActive]);

    const addEntry = () => {
      if (!input.trim()) return;
      setEntries([
        ...entries,
        {
          text: input,
          done: false,
          area,
          priority,
          type,
          createdAt: new Date().toISOString(),
          deadline: deadline || null
        }
      ]);
      setInput('');
      setDeadline('');
    };

    const toggleDone = index => {
      const updated = [...entries];
      updated[index].done = !updated[index].done;
      setEntries(updated);
    };

    const deleteEntry = index => {
      const updated = entries.filter((_, i) => i !== index);
      setEntries(updated);
    };

    const exportEntries = () => {
      const blob = new Blob([JSON.stringify(entries)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${storageKey}.json`;
      a.click();
      URL.revokeObjectURL(url);
    };

    const importEntries = (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target.result);
          setEntries(imported);
        } catch (error) {
          alert('Erro ao importar arquivo. Certifique-se de que é um JSON válido.');
        }
      };
      reader.readAsText(file);
    };

    const applyFilters = () => {
      const filtered = entries
        .filter(e => e.text.toLowerCase().includes(search.toLowerCase()))
        .filter(e => (filterDone === 'all' ? true : e.done === (filterDone === 'done')))
        .filter(e => (filterPriority === 'all' ? true : e.priority === filterPriority))
        .sort((a, b) => {
          if (sortKey === 'createdAt') return new Date(b.createdAt) - new Date(a.createdAt);
          if (sortKey === 'deadline') return new Date(a.deadline || '9999-12-31') - new Date(b.deadline || '9999-12-31');
          if (sortKey === 'priority') return a.priority.localeCompare(b.priority);
          return 0;
        });
      setFilteredEntries(filtered);
      setFiltersActive(true);
    };

     const clearFilters = () => {
      setSearch('');
      setFilterDone('all');
      setFilterPriority('all');
      setSortKey('createdAt');
      setFilteredEntries(entries); // Restaura todas as entradas
      setFiltersActive(false); // Desativa os filtros
    };
    

    const completedCount = entries.filter(e => e.done).length;
    const percentComplete = Math.round((completedCount / entries.length) * 100 || 0);

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">{title}</h2>
        </div>
        <p className="text-gray-700 italic dark:text-gray-300">{description}</p>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          {/* Bloco de busca e filtros */}
          <div className="bg-white dark:bg-slate-800 p-4 rounded shadow mb-4 space-y-2">
            <input placeholder="🔍 Buscar" className="p-2 border rounded w-full placeholder-gray-400 text-gray-700" value={search} onChange={(e) => setSearch(e.target.value)} />
            <div className="flex flex-wrap gap-2">
              <select value={filterDone} onChange={e => setFilterDone(e.target.value)} className="p-2 border rounded text-gray-700">
                <option value="all">Todos</option>
                <option value="done">Concluídos</option>
                <option value="pending">Pendentes</option>
              </select>
              <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="p-2 border rounded text-gray-700">
                <option value="all">Todas Prioridades</option>
                <option value="Alta">Alta</option>
                <option value="Média">Média</option>
                <option value="Baixa">Baixa</option>
              </select>
              <select value={sortKey} onChange={e => setSortKey(e.target.value)} className="p-2 border rounded text-gray-700">
                <option value="createdAt">Mais recente</option>
                <option value="deadline">Por Deadline</option>
                <option value="priority">Por Prioridade</option>
              </select>
              <button onClick={applyFilters} className="px-4 py-2 bg-blue-600 text-white rounded">Filtrar</button>
               {filtersActive && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-red-600 text-white rounded"
                >
                  Desativar Filtros
                </button>
              )}
            </div>
          </div>

          {/* Bloco de novo item */}
<div className="bg-white dark:bg-slate-800 p-4 rounded shadow mb-4">
  <div className="flex flex-wrap gap-2">
    {/* Adicione label para o input */}
    <label htmlFor="new-entry" className="block text-gray-700 dark:text-gray-300 font-medium">
      📝 Nova Tarefa
    </label>
    <input
      id="new-entry"
      className="flex-1 p-2 border rounded placeholder-gray-400 text-gray-600"
      placeholder={`${placeholder} ✍️`}
      value={input}
      onChange={e => setInput(e.target.value)}
    />
    {showDeadline && (
      <>
        <label htmlFor="deadline" className="block text-gray-700 dark:text-gray-300 font-medium">
          📅 Prazo
        </label>
        <input
          id="deadline"
          type="date"
          className="p-2 border rounded text-gray-600"
          value={deadline}
          onChange={e => setDeadline(e.target.value)}
        />
      </>
    )}

  </div>

  {/* Inputs para Prioridade, Tipo e Área */}
  <div className="flex flex-wrap gap-2 mt-4">
   {showPriority &&
   <>
    <label htmlFor="priority" className="block text-gray-700 dark:text-gray-300 font-medium">
      🚦 Prioridade
    </label>
    <select
      id="priority"
      value={priority}
      onChange={e => setPriority(e.target.value)}
      className="p-2 border rounded text-gray-700 w-full"
    >
      <option value="Alta">🔥 Alta</option>
      <option value="Média">⚖️ Média</option>
      <option value="Baixa">🌱 Baixa</option>
    </select>
  </>}
    {showType && (
      <>
        <label htmlFor="type" className="block text-gray-700 dark:text-gray-300 font-medium">
          🧠 Tipo
        </label>
        <select
          id="type"
          value={type}
          onChange={e => setType(e.target.value)}
          className="p-2 border rounded text-gray-700 w-full"
        >
          <option value="Mental">🧠 Mental</option>
          <option value="Físico">🏋️ Físico</option>
          <option value="Emocional">💖 Emocional</option>
        </select>
      </>
    )}

    <label htmlFor="area" className="block text-gray-700 dark:text-gray-300 font-medium">
      🌍 Área
    </label>
    <select
      id="area"
      value={area}
      onChange={e => setArea(e.target.value)}
      className="p-2 border rounded text-gray-700 w-full"
    >
      <option value="Pessoal">👤 Pessoal</option>
      <option value="Profissional">💼 Profissional</option>
      <option value="Social">🌐 Social</option>
    </select>
      {/* Botão Adicionar no final */}
  <div className="mt-4">
    <button onClick={addEntry} className="w-full px-4 py-2 bg-blue-600 text-white rounded">
      ➕ Adicionar
    </button>
  </div>
  </div>
</div>

          <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <button onClick={exportEntries}>⬇️ Exportar</button>
            <label className="cursor-pointer">
              ⬆️ Importar
              <input type="file" accept="application/json" onChange={importEntries} className="hidden" />
            </label>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-4 rounded shadow">
          <h3 className="font-bold mb-2">📊 Progresso</h3>
          <p>{completedCount} de {entries.length} concluídos ({percentComplete}%)</p>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={[{ name: 'Concluído', value: completedCount }, { name: 'Pendente', value: entries.length - completedCount }]} dataKey="value" outerRadius={60} fill="#8884d8" label>
                <Cell fill="#34d399" />
                <Cell fill="#f87171" />
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <ul className="space-y-2">
          {filteredEntries.map((entry, i) => (
            <li key={i} className={`p-3 border rounded dark:border-slate-600 flex flex-col sm:flex-row sm:justify-between sm:items-center ${entry.done ? 'line-through text-gray-500 dark:text-gray-400 bg-white/60 dark:bg-slate-700/60' : 'bg-white/90 dark:bg-slate-700'}`}>
              <div className="mb-2 sm:mb-0">
                <p className="font-medium">{entry.text}</p>
                <p className="text-xs text-gray-500">🕒 Criado em: {new Date(entry.createdAt).toLocaleDateString()}</p>
                {entry.deadline && <p className="text-xs">🗓 Deadline: {entry.deadline}</p>}
                {entry.type && <p className="text-xs">🧠 Tipo: {entry.type}</p>}
                {entry.area && <p className="text-xs">🔵 Área: {entry.area}</p>}
                {entry.priority && <PriorityBadge priority={entry.priority} />}
              </div>
              <div className="flex gap-2">
                <button onClick={() => toggleDone(i)} className="text-sm text-blue-600">{entry.done ? 'Desfazer' : 'Concluir'}</button>
                <button onClick={() => deleteEntry(i)} className="text-sm text-red-600">Excluir</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  };
}

const KnowYourself = createEntryPage({ storageKey: 'knowYourselfEntries', title: '🧬 Conheça-se', description: 'Reflita sobre o que te limita e onde você pode crescer.', placeholder: 'Descreva uma limitação ou situação marcante', showType: true  });
const Accountability = createEntryPage({ storageKey: 'accountabilityGoals', title: '🎯 Responsabilidade e Metas', description: 'Liste metas reais com prazos e cumpra-as com disciplina.', placeholder: 'Meta concreta e objetiva', showType: true ,showDeadline: true });
const Discipline = createEntryPage({ storageKey: 'disciplineTasks', title: '🏋️ Disciplina Diária', description: 'Registre pequenas ações desconfortáveis para sair da zona de conforto.', placeholder: 'Tarefa desconfortável para hoje',showType: true , showPriority: true });
const ToughMind = createEntryPage({ storageKey: 'toughMindEntries', title: '🧠 Mente Calejada', description: 'Visualize desafios e recorde vitórias para fortalecer sua mente.', placeholder: 'Visualização ou vitória marcante', showType: true });
const BeRare = createEntryPage({ storageKey: 'beRareEntries', title: '💎 Seja Raro', description: 'Defina onde você se tornará verdadeiramente raro entre os raros.', placeholder: 'Área onde será excepcional', showType: true });

const pages = [
  { path: '/', label: 'Início', component: () => (
      <div className="text-center p-8">
        <h1 className="text-4xl font-bold">Desafios "Can't Hurt Me"</h1>
        <p className="text-gray-600 mt-2">Escolha um desafio e comece sua jornada.</p>
        <div className="mt-6 space-y-4">
          <Link to="/conheca-se" className="block text-blue-600 hover:underline">
            🧬 Conheça-se - Reflita sobre o que te limita e onde você pode crescer.
          </Link>
          <Link to="/responsabilidade" className="block text-blue-600 hover:underline">
            🎯 Responsabilidade e Metas - Liste metas reais com prazos e cumpra-as com disciplina.
          </Link>
          <Link to="/disciplina" className="block text-blue-600 hover:underline">
            🏋️ Disciplina Diária - Registre pequenas ações desconfortáveis para sair da zona de conforto.
          </Link>
          <Link to="/mente-calejada" className="block text-blue-600 hover:underline">
            🧠 Mente Calejada - Visualize desafios e recorde vitórias para fortalecer sua mente.
          </Link>
          <Link to="/seja-raro" className="block text-blue-600 hover:underline">
            💎 Seja Raro - Defina onde você se tornará verdadeiramente raro entre os raros.
          </Link>
        </div>
      </div>
    )
  },
  { path: '/conheca-se', label: '🧬 Conheça-se', component: KnowYourself },
  { path: '/responsabilidade', label: '🎯 Responsabilidade e Metas', component: Accountability },
  { path: '/disciplina', label: '🏋️ Disciplina Diária', component: Discipline },
  { path: '/mente-calejada', label: '🧠 Mente Calejada', component: ToughMind },
  { path: '/seja-raro', label: '💎 Seja Raro', component: BeRare }
];

function Header() {
  return (
    <header className="bg-blue-100 dark:bg-slate-900 shadow p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between sticky top-0 z-50">
      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-800 dark:text-white">🛡️ Can't Hurt Me</h1>
      <nav className="mt-4 sm:mt-0 flex flex-wrap gap-4 font-medium">
        {pages.map(({ path, label }) => (
          <Link key={path} to={path} className="text-blue-600 dark:text-blue-400 hover:text-black dark:hover:text-white">{label}</Link>
        ))}
      </nav>
    </header>
  );
}

export default function App() {
  return (
    <Router >
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-900 dark:to-slate-800 text-gray-800 dark:text-white">
        <Header />
        <main className="p-4 max-w-3xl mx-auto space-y-8">
          <Routes EntryPage= 'Início'>
            {pages.map(({ path, component: Component }) => (
              <Route key={path} path={path} element={<Component />} />
            ))}
          </Routes>
        </main>
      </div>
    </Router>
  );
}