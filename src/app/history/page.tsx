'use client';

import { useEffect, useState } from 'react';

type RecordType = {
  id: string;
  questionId: string;
  userAnswer: string;
  isCorrect: boolean;
  answeredAt: string;
  question: {
    id: string;
    content: string;
    options: string;
    answer: string;
    explanation: string;
    category: string;
  };
};

export default function HistoryPage() {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchRecords = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/records');
        
        if (!response.ok) {
          throw new Error('Failed to fetch records');
        }
        
        const data = await response.json();
        setRecords(data.records);
      } catch (err) {
        console.error('Error:', err);
        setError('歷史記錄載入失敗，請重試');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRecords();
  }, []);
  
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
          onClick={() => window.location.reload()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          重試
        </button>
      </div>
    );
  }
  
  if (records.length === 0) {
    return (
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">答題歷史記錄</h1>
        <p className="text-xl">目前沒有答題記錄</p>
        <p className="mt-4">開始練習題目來建立您的答題記錄吧！</p>
      </div>
    );
  }
  
  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">答題歷史記錄</h1>
      
      <div className="mb-6 p-4 bg-blue-50 rounded-md">
        <p className="font-semibold">總共答題: {records.length} 題</p>
        <p className="font-semibold">正確率: {Math.round((records.filter(r => r.isCorrect).length / records.length) * 100)}%</p>
      </div>
      
      <div className="space-y-6">
        {records.map((record) => {
          let options = [];
          try {
            options = typeof record.question.options === 'string' 
              ? JSON.parse(record.question.options) 
              : record.question.options;
            if (!Array.isArray(options)) {
              options = []; // Ensure it's an array even if JSON.parse returns non-array
            }
          } catch (e) {
            console.error('Error parsing options for history record:', record.id, e);
            options = [];
          }

            
          return (
            <div 
              key={record.id} 
              className={`p-6 rounded-lg shadow-md ${record.isCorrect ? 'bg-green-50' : 'bg-red-50'}`}
            >
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-semibold">{record.question.content}</h3>
                <span className={`px-3 py-1 rounded-full text-white ${record.isCorrect ? 'bg-green-500' : 'bg-red-500'}`}>
                  {record.isCorrect ? '正確' : '錯誤'}
                </span>
              </div>
              
              <div className="mb-4">
                <p className="font-medium">選項:</p>
                <ul className="ml-6 list-disc">
                  {options.map((option: string, index: number) => (
                    <li 
                      key={index} 
                      className={`${option.charAt(0) === record.question.answer ? 'font-bold text-green-700' : ''} ${option.charAt(0) === record.userAnswer && option.charAt(0) !== record.question.answer ? 'font-bold text-red-700' : ''}`}

                    >
                      {option}
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="mb-2">
                <p className="font-medium">您的答案: {record.userAnswer}</p>
                <p className="font-medium">正確答案: {record.question.answer}</p>
              </div>
              
              {record.question.explanation && (
                <div className="mt-4 p-4 bg-gray-50 rounded-md">
                  <p className="font-medium">解釋:</p>
                  <p>{record.question.explanation}</p>
                </div>
              )}
              
              <p className="text-sm text-gray-500 mt-4">
                答題時間: {new Date(record.answeredAt).toLocaleString()}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}