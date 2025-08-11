'use client';

import { useEffect, useState } from 'react';

export default function QuestionGenerator() {
  const [lastGenerated, setLastGenerated] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState('技術');
  const [isAutoGenerating, setIsAutoGenerating] = useState(false);



  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isAutoGenerating) {
      interval = setInterval(() => {
        console.log(`Auto-generating questions for category: ${category}`);
        generateQuestions(category);
      }, 5 * 60 * 1000); // 5 minutes
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAutoGenerating, category]);

  const generateQuestions = async (selectedCategory: string) => {
    try {
      const response = await fetch('/api/cron', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ category: selectedCategory }),
      });
      if (response.ok) {
        const data = await response.json();
        setLastGenerated(new Date());
        console.log(`'${selectedCategory}' questions generated successfully:`, data.message);
        setError(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to generate '${selectedCategory}' questions`);
      }
    } catch (err: any) {
      console.error(`Failed to generate '${selectedCategory}' questions:`, err);
      setError(err.message);
    }
  };

  const handleManualGenerate = async () => {
    setIsLoading(true);
    await generateQuestions(category);
    setIsLoading(false);
  };

  return (
    <div className="p-4 border rounded-lg shadow-md bg-white">
      <h2 className="text-xl font-bold mb-2">題目生成器</h2>
      <p className="mb-4">選擇要生成的題目類型，然後點擊按鈕。</p>
      <div className="flex items-center gap-4 mb-4">
        <select 
          value={category} 
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border rounded-md"
        >
          <option value="技術">技術</option>
          <option value="管理">管理</option>
          <option value="其他">其他</option>
        </select>
        <button 
          onClick={handleManualGenerate} 
          disabled={isLoading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isLoading ? '生成中...' : `生成 ${category} 題目`}
        </button>
        <button
          onClick={() => setIsAutoGenerating(!isAutoGenerating)}
          className={`px-4 py-2 rounded-md text-white ${
            isAutoGenerating
              ? 'bg-red-500 hover:bg-red-600'
              : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {isAutoGenerating ? '關閉自動生成' : '開啟自動生成'}
        </button>
      </div>
      {lastGenerated && (
        <p className="text-sm text-gray-600 mt-2">
          上次成功生成時間: {lastGenerated.toLocaleTimeString()}
        </p>
      )}
      {error && (
        <p className="text-sm text-red-500 mt-2">
          錯誤: {error}
        </p>
      )}
    </div>
  );
}