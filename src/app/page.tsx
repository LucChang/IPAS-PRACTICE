import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      <div className="max-w-4xl w-full text-center mb-12">
        <h1 className="text-4xl font-bold mb-6">iPAS資安檢定刷題網站</h1>
        <p className="text-xl mb-8">
          歡迎使用iPAS資訊安全檢定(中級)刷題網站，透過練習題目提升您的資安知識和考試準備度。
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-bold mb-4 text-blue-600">技術類題目</h2>
            <p className="mb-6">練習資訊安全技術相關題目，包括加密算法、網路安全、系統安全等技術性內容。</p>
            <Link 
              href="/practice/technical" 
              className="inline-block bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 transition-colors"
            >
              開始練習
            </Link>
          </div>
          
          <div className="bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow">
            <h2 className="text-2xl font-bold mb-4 text-green-600">管理類題目</h2>
            <p className="mb-6">練習資訊安全管理相關題目，包括風險管理、安全政策、法規遵循等管理性內容。</p>
            <Link 
              href="/practice/management" 
              className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
            >
              開始練習
            </Link>
          </div>
        </div>
        
        <div className="mt-16 p-6 bg-gray-50 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">關於本網站</h2>
          <p className="mb-4">
            本網站使用Next.js框架開發，結合了現代前端技術和AI生成題目功能。
            系統會定期使用NLP模型分析iPAS資安檢定PDF內容，自動生成高質量的練習題目。
          </p>
          <p>
            透過持續練習，您可以更好地準備iPAS資訊安全檢定考試，提升您的資安知識和技能。
          </p>
        </div>
      </div>
    </div>
  );
}
