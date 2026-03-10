import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { projectAPI } from '@/services/api';
import Navbar from '@/components/Navbar';
import ProjectForm from '@/components/ProjectForm';
import { useEffect } from 'react';

export default function SubmitProject() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('token')) router.push('/login');
  }, []);

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      await projectAPI.create(data);
      router.push('/dashboard');
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to submit project.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Submit Project — ProjectDefense AI</title></Head>
      <div className="min-h-screen bg-gray-950 text-white">
        <Navbar />
        <main className="max-w-2xl mx-auto px-4 pt-24 pb-16">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Submit Your Project</h1>
            <p className="text-gray-400 mt-2">Provide project details for AI analysis and defense preparation.</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800/50 rounded-2xl p-8">
            <ProjectForm onSubmit={handleSubmit} loading={loading} />
          </div>
        </main>
      </div>
    </>
  );
}
