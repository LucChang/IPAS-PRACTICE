'use client';

import MermaidDiagram from '@/components/MermaidDiagram';
import QuestionGenerator from '@/components/QuestionGenerator';

export default function AboutPage() {
  const systemFlowChart = `
  graph TD
  subgraph "系統流程"
  A[使用者進入網站] --> B{選擇練習類別} ;
  B -- 技術 --> C[進入技術類別頁面] ;
  B -- 管理 --> D[進入管理類別頁面] ;
  C -- 顯示題目 --> E[推薦系統隨機推薦題目] ;
  D -- 顯示題目 --> E ;
  E --> F[使用者回答題目] ;
  F -- 答題後 --> G[題目從當前頁面消失，下一題上移] ;
  G --> H[將已答題目存入歷史紀錄] ;
  H --> I[題庫資料庫] ;
  E -- 題目來源 --> J[定時生成題目] ;
  I -- 儲存題目 --> J ;
  J --> K[每5分鐘發送請求] ;
  K --> L[NLP模型 Gemini 2.5 flash] ;
  L -- 每次生成20題 --> M[分析iPAS資安PDF內容] ;
  M --> J ;
  end
  
  subgraph "技術架構"
  N[Next.js Framework] -- 前端介面 --> O[RWD響應式設計] ;
  N -- 後端API --> P[題庫資料庫 DB] ;
  N -- 後端API --> Q[NLP模型 Gemini 2.5 flash] ;
  N -- 後端API --> R[推薦系統邏輯] ;
  end
  
  subgraph "資料流"
  S[iPAS資安檢定 - 中級 PDF] -- 輸入 --> T[NLP模型訓練與生成] ;
  T --> U[題庫資料庫 DB 儲存題目] ;
  U -- 讀取題目 --> V[使用者練習頁面] ;
  V -- 答題紀錄 --> W[歷史紀錄資料庫] ;
  end
  
  style A fill:#f9f,stroke:#333,stroke-width:2px
  style B fill:#bbf,stroke:#333,stroke-width:2px
  style E fill:#ccf,stroke:#333,stroke-width:2px
  style F fill:#f9f,stroke:#333,stroke-width:2px
  style G fill:#f9f,stroke:#333,stroke-width:2px
  style L fill:#fcc,stroke:#333,stroke-width:2px
  style N fill:#9f9,stroke:#333,stroke-width:2px
  style P fill:#ffc,stroke:#333,stroke-width:2px
  style R fill:#ccf,stroke:#333,stroke-width:2px
  style T fill:#fcc,stroke:#333,stroke-width:2px
  style U fill:#ffc,stroke:#333,stroke-width:2px
  `;

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">關於iPAS資安檢定刷題網站</h1>
      
      <div className="mb-10">
        <QuestionGenerator />
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">網站介紹</h2>
        <p className="mb-4">
          本網站是為準備iPAS資訊安全檢定(中級)考試的考生設計的刷題平台。
          透過AI技術分析考試內容，自動生成高質量的練習題目，幫助考生更有效地準備考試。
        </p>
        <p>
          網站提供技術和管理兩大類題目，覆蓋考試的主要內容領域。
          每答完一道題目，系統會自動記錄您的答題情況，並提供詳細的解釋，幫助您理解相關知識點。
        </p>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">系統流程圖</h2>
        <div className="overflow-x-auto bg-white p-6 rounded-lg shadow-md">
          <MermaidDiagram chart={systemFlowChart} />
        </div>
      </div>
      
      <div className="mb-10">
        <h2 className="text-2xl font-bold mb-4">技術特點</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>使用Next.js框架開發，提供高效的前後端整合解決方案</li>
          <li>響應式設計(RWD)，適配各種設備尺寸</li>
          <li>使用AI模型(Gemini 2.5 flash)分析考試內容，自動生成練習題目</li>
          <li>每5分鐘自動更新題庫，確保題目的多樣性和新鮮度</li>
          <li>智能推薦系統，根據用戶答題情況推薦適合的題目</li>
          <li>詳細的答題歷史記錄，幫助用戶追蹤學習進度</li>
        </ul>
      </div>
      
      <div>
        <h2 className="text-2xl font-bold mb-4">使用指南</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>從首頁選擇您想練習的題目類別（技術或管理）</li>
          <li>在練習頁面回答題目，每答完一題，下一題會自動上移</li>
          <li>在歷史記錄頁面查看您的答題情況和正確率</li>
          <li>系統會自動生成新題目，您可以持續練習不同的題目</li>
        </ol>
      </div>
    </div>
  );
}