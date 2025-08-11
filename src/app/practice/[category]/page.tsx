'use client';

import { useEffect, useState } from 'react';
import Question from '@/components/Question';
import { useRouter } from 'next/navigation';

type QuestionType = {
  id: string;
  content: string;
  options: string[];
  answer: string;
  explanation: string;
  category: string;
};

export default function PracticePage({ params }: { params: { category: string } }) {
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  
  const categoryMap: Record<string, string> = {
    'technical': '技術',
    'management': '管理'
  };
  
  const [categoryName, setCategoryName] = useState('');

  useEffect(() => {
    const category = categoryMap[params.category] || '未知';
    setCategoryName(category);
  }, [params.category]);

  useEffect(() => {
    if (!categoryName) return;

    const fetchQuestions = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/questions?category=${categoryName}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch questions');
        }
        
        const data = await response.json();
        // const response1 = await response.text();
        console.log('data:', data);
        // console.log('reponse:', response1)
        const processQuestions = (questions: any[]) => {
          return questions.map((q: any) => ({
            ...q,
            options: q.options || [], // Use q.options directly, or an empty array if null/undefined
          }));
        };

        if (data.questions.length === 0) {
          const generateResponse = await fetch(`/api/generate?category=${categoryName}`);
          if (!generateResponse.ok) {
            throw new Error('Failed to generate questions');
          }
          const generateData = await generateResponse.json();
          setQuestions(processQuestions(generateData.questions));
        } else {
          setQuestions(processQuestions(data.questions));
        }
      } catch (err) {
        console.error('Error:', err);
        setError('題目載入失敗，請重試');
      } finally {
        setLoading(false);
      }
    };
    
    fetchQuestions();
  }, [categoryName]);
  
  const handleAnswer = async (questionId: string, answer: string) => {
    try {
      console.log('Submitting answer for questionId:', questionId, 'userAnswer:', answer);
      const response = await fetch('/api/records', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ questionId, userAnswer: answer }),
      });
      console.log('Response from /api/records:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error('Failed to submit answer');
      }
      
      const data = await response.json();
      console.log('Data from /api/records:', data);
      
      // 從列表中移除已回答的題目
      setQuestions(prevQuestions => 
        prevQuestions.filter(q => q.id !== questionId)
      );
      
      // 如果題目不足，生成更多題目
      if (questions.length < 5) {
        const generateResponse = await fetch(`/api/generate?category=${categoryName}&count=5`);
        if (generateResponse.ok) {
          const generateData = await generateResponse.json();
          setQuestions(prevQuestions => [
            ...prevQuestions,
            ...generateData.questions
          ]);
        }
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('提交答案失敗，請重試');
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <button 
          onClick={() => router.refresh()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          重試
        </button>
      </div>
    );
  }
  
  if (questions.length === 0) {
    return (
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-4">目前沒有可用的題目</h2>
        <p className="mb-4">請稍後再試或生成新題目</p>
        <button 
          onClick={async () => {
            setLoading(true);
            try {
              const response = await fetch(`/api/generate?category=${categoryName}`);
              if (response.ok) {
                const data = await response.json();
                setQuestions(data.questions);
              } else {
                setError('生成題目失敗');
              }
            } catch (err) {
              setError('生成題目失敗');
            } finally {
              setLoading(false);
            }
          }}
          className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
        >
          生成新題目
        </button>
      </div>
    );
  }
  console.log('questions:', questions);
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">{categoryName}類題目練習</h1>
      
      <div className="mb-4 p-4 bg-blue-50 rounded-md">
        <p>目前有 {questions.length} 道題目可練習</p>
      </div>
      
      {questions.slice(0, 5).map((question) => (
        <Question
          key={question.id}
          id={question.id}
          content={question.content}
          options={question.options}
          onAnswer={handleAnswer}
        />
      ))}
    </div>
  );
}