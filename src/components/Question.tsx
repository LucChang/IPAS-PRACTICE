'use client';

import { useState } from 'react';

type QuestionProps = {
  id: string;
  content: string;
  options: string[];
  onAnswer: (questionId: string, answer: string) => void;
};

export default function Question({ id, content, options, onAnswer }: QuestionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleSubmit = () => {
    if (selectedOption) {
      onAnswer(id, selectedOption);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h3 className="text-xl font-semibold mb-4">{content}</h3>
      <div className="space-y-3 mb-6">
        {Array.isArray(options) && options.length > 0 ? (
          <div className="mt-4 space-y-2">
            {options.map((option, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border cursor-pointer ${
                  selectedOption === option
                    ? 'bg-blue-100 border-blue-500'
                    : 'border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedOption(option)}
              >
                <span className="font-medium mr-2">{String.fromCharCode(97 + index)}.</span>
                {option}
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-4 text-gray-500">此題目無選項，請聯繫系統管理員</div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={!selectedOption}
        className={`px-4 py-2 rounded-md ${
          selectedOption
            ? 'bg-blue-600 text-white hover:bg-blue-700'
            : 'bg-gray-300 cursor-not-allowed'
        }`}
      >
        提交答案
      </button>
    </div>
  );
}