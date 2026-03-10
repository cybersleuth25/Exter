import { useState } from 'react';

export default function ProjectForm({ onSubmit, loading }) {
  const [form, setForm] = useState({
    title: '',
    problem_statement: '',
    description: '',
    tech_stack: '',
    target_users: '',
    business_model: '',
    github_link: '',
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      tech_stack: form.tech_stack.split(',').map((s) => s.trim()).filter(Boolean),
    });
  };

  const inputClass =
    'w-full bg-gray-800/50 border border-gray-700/50 rounded-xl px-4 py-3 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all duration-200';
  const labelClass = 'block text-sm font-medium text-gray-300 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className={labelClass}>Project Title *</label>
        <input name="title" value={form.title} onChange={handleChange} required placeholder="e.g. AI-Powered Health Tracker" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Problem Statement *</label>
        <textarea name="problem_statement" value={form.problem_statement} onChange={handleChange} required rows={3} placeholder="What problem does your project solve?" className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Description *</label>
        <textarea name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="Detailed description of your project, its features, and how it works..." className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>Technology Stack *</label>
        <input name="tech_stack" value={form.tech_stack} onChange={handleChange} required placeholder="React, Node.js, MongoDB, TensorFlow (comma-separated)" className={inputClass} />
        <p className="text-xs text-gray-500 mt-1">Separate technologies with commas</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <label className={labelClass}>Target Users *</label>
          <input name="target_users" value={form.target_users} onChange={handleChange} required placeholder="Students, Healthcare workers..." className={inputClass} />
        </div>
        <div>
          <label className={labelClass}>Business Model</label>
          <input name="business_model" value={form.business_model} onChange={handleChange} placeholder="Freemium, SaaS, B2B..." className={inputClass} />
        </div>
      </div>

      <div>
        <label className={labelClass}>GitHub Repository Link</label>
        <input name="github_link" value={form.github_link} onChange={handleChange} placeholder="https://github.com/user/repo" className={inputClass} />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 rounded-xl font-semibold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
            Submitting...
          </span>
        ) : 'Submit Project'}
      </button>
    </form>
  );
}
