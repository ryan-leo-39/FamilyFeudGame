import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { sampleQuestions, sampleFastMoneyQuestions } from '../data/sampleQuestions';

const BLANK_ANSWER = { text: '', points: 0 };
const BLANK_QUESTION = {
  id: '',
  question: '',
  answers: Array(8).fill(null).map(() => ({ ...BLANK_ANSWER })),
  isFastMoney: false,
};

function generateId() {
  return 'q-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
}

function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

export default function Admin() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('regular'); // regular | fastmoney
  const [questions, setQuestions] = useState(() =>
    loadFromStorage('ff-questions', sampleQuestions)
  );
  const [fmQuestions, setFmQuestions] = useState(() =>
    loadFromStorage('ff-fastmoney-questions', sampleFastMoneyQuestions)
  );
  const [editing, setEditing] = useState(null); // question being edited
  const [saved, setSaved] = useState(false);

  const currentList = tab === 'regular' ? questions : fmQuestions;
  const setCurrentList = tab === 'regular' ? setQuestions : setFmQuestions;
  const storageKey = tab === 'regular' ? 'ff-questions' : 'ff-fastmoney-questions';

  const saveAll = () => {
    localStorage.setItem('ff-questions', JSON.stringify(questions));
    localStorage.setItem('ff-fastmoney-questions', JSON.stringify(fmQuestions));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleAddNew = () => {
    const newQ = {
      ...BLANK_QUESTION,
      id: generateId(),
      isFastMoney: tab === 'fastmoney',
      answers: tab === 'fastmoney'
        ? Array(5).fill(null).map(() => ({ ...BLANK_ANSWER }))
        : Array(6).fill(null).map(() => ({ ...BLANK_ANSWER })),
    };
    setEditing(newQ);
  };

  const handleEdit = (q) => {
    setEditing(JSON.parse(JSON.stringify(q)));
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this question?')) return;
    setCurrentList((prev) => prev.filter((q) => q.id !== id));
  };

  const handleSaveEdit = () => {
    if (!editing.question.trim()) {
      alert('Please enter a question.');
      return;
    }
    const filledAnswers = editing.answers.filter((a) => a.text.trim());
    if (filledAnswers.length < 2) {
      alert('Please add at least 2 answers.');
      return;
    }
    const totalPts = filledAnswers.reduce((s, a) => s + Number(a.points), 0);
    if (totalPts !== 100) {
      alert(`Points for filled answers must add up to 100. Currently: ${totalPts}`);
      return;
    }
    // Only keep filled answers + strip empty trailing slots
    const cleanedAnswers = editing.answers.map((a) =>
      a.text.trim() ? { text: a.text.trim(), points: Number(a.points) } : { text: '', points: 0 }
    );

    const savedQuestion = { ...editing, answers: cleanedAnswers };
    setCurrentList((prev) => {
      const exists = prev.find((q) => q.id === editing.id);
      if (exists) return prev.map((q) => (q.id === editing.id ? savedQuestion : q));
      return [...prev, savedQuestion];
    });
    setEditing(null);
  };

  const handleExport = () => {
    const data = {
      questions,
      fastMoneyQuestions: fmQuestions,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family-feud-questions.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrintAnswerKey = () => {
    const allQ = loadFromStorage('ff-questions', sampleQuestions);
    const fmQ = loadFromStorage('ff-fastmoney-questions', sampleFastMoneyQuestions);

    const renderQuestions = (list, prefix) =>
      list.map((q, qi) => `
        <div class="question">
          <div class="question-text">${prefix}${qi + 1}. ${q.question}</div>
          <table>
            <tr><th>#</th><th>Answer</th><th>Points</th></tr>
            ${q.answers
              .filter((a) => a.text)
              .map((a, i) => `<tr><td>${i + 1}</td><td>${a.text}</td><td class="pts">${a.points}</td></tr>`)
              .join('')}
          </table>
        </div>`).join('');

    const html = `<!DOCTYPE html>
<html>
<head>
  <title>Family Feud — Answer Key</title>
  <style>
    body { font-family: Arial, sans-serif; max-width: 820px; margin: 0 auto; padding: 24px; color: #111; }
    h1 { text-align: center; color: #0d2044; margin-bottom: 4px; }
    .subtitle { text-align: center; color: #888; font-size: 13px; margin-bottom: 24px; }
    h2 { color: #c8841a; border-bottom: 3px solid #c8841a; padding-bottom: 6px; margin-top: 32px; }
    .question { margin-bottom: 22px; page-break-inside: avoid; }
    .question-text { font-weight: bold; font-size: 15px; margin-bottom: 6px; }
    table { width: 100%; border-collapse: collapse; font-size: 14px; }
    th { background: #1a3a6b; color: white; padding: 5px 10px; text-align: left; }
    td { padding: 4px 10px; border-bottom: 1px solid #ddd; }
    tr:nth-child(even) td { background: #f5f5f5; }
    .pts { font-weight: bold; color: #1a3a6b; text-align: right; }
    @media print {
      body { padding: 12px; }
      h2 { margin-top: 20px; }
    }
  </style>
</head>
<body>
  <h1>🎮 Family Feud — Host Answer Key</h1>
  <div class="subtitle">Printed ${new Date().toLocaleDateString()} — Keep this away from players!</div>
  <h2>Regular Questions (${allQ.length})</h2>
  ${renderQuestions(allQ, 'Q')}
  <h2>Fast Money Questions (${fmQ.length})</h2>
  ${renderQuestions(fmQ, 'FM')}
</body>
</html>`;

    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
    }
  };

  const handleImport = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target.result);
        if (data.questions) setQuestions(data.questions);
        if (data.fastMoneyQuestions) setFmQuestions(data.fastMoneyQuestions);
        alert('Questions imported successfully!');
      } catch {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="min-h-screen bg-ff-blue p-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          <button onClick={() => navigate('/')} className="text-ff-gold text-sm hover:underline">
            ← Home
          </button>
          <h2 className="gold-shimmer text-2xl sm:text-3xl font-black uppercase flex-1 text-center">Question Manager</h2>
          <div className="flex gap-2 flex-wrap justify-end">
            <button
              onClick={handlePrintAnswerKey}
              className="px-3 py-2 bg-ff-gold text-ff-blue text-xs font-black uppercase rounded-lg border border-ff-gold hover:brightness-110 transition-all"
              title="Open printable answer key in a new tab"
            >
              🖨 Answer Key
            </button>
            <label className="px-3 py-2 bg-ff-tile text-white text-xs font-bold uppercase rounded-lg border border-blue-700 hover:border-ff-gold cursor-pointer transition-all">
              Import
              <input type="file" accept=".json" className="hidden" onChange={handleImport} />
            </label>
            <button
              onClick={handleExport}
              className="px-3 py-2 bg-ff-tile text-white text-xs font-bold uppercase rounded-lg border border-blue-700 hover:border-ff-gold transition-all"
            >
              Export
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-4">
          {['regular', 'fastmoney'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-lg font-black uppercase text-sm border-2 transition-all ${
                tab === t
                  ? 'bg-ff-gold text-ff-blue border-ff-gold'
                  : 'bg-transparent text-ff-gold border-ff-gold hover:bg-ff-gold hover:text-ff-blue'
              }`}
            >
              {t === 'regular' ? `Regular (${questions.length})` : `Fast Money (${fmQuestions.length})`}
            </button>
          ))}
        </div>

        {/* Question list */}
        <div className="space-y-3 mb-4">
          <AnimatePresence>
            {currentList.map((q) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-ff-navy rounded-xl p-4 border border-blue-800"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-white font-bold text-sm uppercase truncate">{q.question}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {q.answers.slice(0, 3).map((a, i) => (
                        <span key={i} className="text-xs bg-ff-tile text-blue-300 rounded px-2 py-0.5">
                          {a.text} ({a.points})
                        </span>
                      ))}
                      {q.answers.length > 3 && (
                        <span className="text-xs text-blue-500">+{q.answers.length - 3} more</span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleEdit(q)}
                      className="px-3 py-1.5 bg-ff-tile-revealed text-white text-xs font-bold uppercase rounded-lg border border-blue-500 hover:border-ff-gold transition-all"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(q.id)}
                      className="px-3 py-1.5 bg-ff-red text-white text-xs font-bold uppercase rounded-lg border border-red-500 hover:brightness-110 transition-all"
                    >
                      Del
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {currentList.length === 0 && (
            <div className="text-center text-blue-500 py-10 text-sm uppercase tracking-wide">
              No questions yet — add one below
            </div>
          )}
        </div>

        {/* Add + Save buttons */}
        <div className="flex gap-3">
          <button
            onClick={handleAddNew}
            className="flex-1 py-3 bg-ff-tile text-ff-gold font-black uppercase rounded-xl border-2 border-ff-gold hover:bg-ff-gold hover:text-ff-blue transition-all"
          >
            + Add Question
          </button>
          <button
            onClick={saveAll}
            className={`flex-1 py-3 font-black uppercase rounded-xl border-2 transition-all ${
              saved
                ? 'bg-ff-green text-white border-green-500'
                : 'bg-gradient-to-b from-ff-gold to-ff-gold-dark text-ff-blue border-ff-gold'
            }`}
          >
            {saved ? '✓ Saved!' : 'Save All'}
          </button>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 flex items-center justify-center p-4 z-50 overflow-y-auto"
            onClick={(e) => e.target === e.currentTarget && setEditing(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-ff-navy rounded-2xl p-4 sm:p-6 w-full max-w-lg border border-blue-700 my-4 max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="text-ff-gold font-black uppercase text-lg mb-4">
                {editing.id && questions.find((q) => q.id === editing.id) ? 'Edit' : 'New'} Question
              </h3>

              {/* Question text */}
              <div className="mb-4">
                <label className="text-blue-300 text-xs uppercase tracking-widest block mb-1">
                  Question
                </label>
                <input
                  type="text"
                  value={editing.question}
                  onChange={(e) => setEditing({ ...editing, question: e.target.value })}
                  placeholder="Name something people do on weekends..."
                  className="w-full bg-ff-tile text-white px-4 py-3 rounded-lg border border-blue-700 focus:border-ff-gold focus:outline-none"
                />
              </div>

              {/* Answers */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-blue-300 text-xs uppercase tracking-widest">
                    Answers (filled answers must total 100 pts)
                  </label>
                  <span className={`text-xs font-bold ${
                    editing.answers.filter(a => a.text.trim()).reduce((s, a) => s + Number(a.points), 0) === 100
                      ? 'text-ff-green'
                      : 'text-ff-red'
                  }`}>
                    {editing.answers.filter(a => a.text.trim()).reduce((s, a) => s + Number(a.points), 0)} / 100
                  </span>
                </div>
                <div className="space-y-2">
                  {editing.answers.map((ans, i) => (
                    <div key={i} className="flex gap-2">
                      <span className="text-blue-500 text-sm font-bold w-5 flex-shrink-0 mt-3">{i + 1}.</span>
                      <input
                        type="text"
                        value={ans.text}
                        onChange={(e) => {
                          const a = [...editing.answers];
                          a[i] = { ...a[i], text: e.target.value };
                          setEditing({ ...editing, answers: a });
                        }}
                        placeholder={`Answer ${i + 1}`}
                        className="flex-1 bg-ff-tile text-white px-3 py-2 rounded-lg border border-blue-700 focus:border-ff-gold focus:outline-none text-sm"
                      />
                      <input
                        type="number"
                        value={ans.points}
                        min={0}
                        max={100}
                        onChange={(e) => {
                          const a = [...editing.answers];
                          a[i] = { ...a[i], points: parseInt(e.target.value) || 0 };
                          setEditing({ ...editing, answers: a });
                        }}
                        className="w-16 bg-ff-tile text-ff-gold font-black px-2 py-2 rounded-lg border border-blue-700 focus:border-ff-gold focus:outline-none text-sm text-center"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setEditing(null)}
                  className="flex-1 py-3 bg-ff-tile text-white font-black uppercase rounded-lg border border-blue-700 hover:border-ff-gold transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 py-3 bg-gradient-to-b from-ff-gold to-ff-gold-dark text-ff-blue font-black uppercase rounded-lg"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
