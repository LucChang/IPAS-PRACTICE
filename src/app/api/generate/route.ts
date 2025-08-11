import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function generateQuestions(category: string, count: number = 20) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
  const prompt = `請生成${count}道關於iPAS資訊安全檢定的題目，主題為「${category}」。每道題目需要包含以下部分：
- 題目內容 (content)
- 四個選項，格式為JSON字符串數組，例如：["選項一", "選項二", "選項三", "選項四"]
- 正確答案 (answer)，必須是 a、b、c 或 d 其中一個
- 答案解釋 (explanation)
- 題目類別 (category)，必須是'${category}'
請以JSON格式返回，且key的名稱需與上述英文相符。`;
  let text = '';
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    text = await response.text();
    console.log('Gemini raw response text:', text);

    // 清理 markdown
    if (text.startsWith('```json')) {
      text = text.slice(7, -3);
    }
    
    // 提取JSON內容，處理前後可能存在的文字
    const firstBracket = text.indexOf('[');
    const firstBrace = text.indexOf('{');
    let startIndex = -1;

    if (firstBracket === -1 && firstBrace === -1) {
        console.error('No JSON object or array found in the response.');
        return [];
    }

    if (firstBracket === -1) {
        startIndex = firstBrace;
    } else if (firstBrace === -1) {
        startIndex = firstBracket;
    } else {
        startIndex = Math.min(firstBracket, firstBrace);
    }

    const lastBracket = text.lastIndexOf(']');
    const lastBrace = text.lastIndexOf('}');
    const endIndex = Math.max(lastBracket, lastBrace);

    if (startIndex === -1 || endIndex === -1 || endIndex < startIndex) {
        console.error('Could not determine a valid start and end for the JSON content.');
        return [];
    }

    const jsonText = text.substring(startIndex, endIndex + 1);

    // 嘗試解析JSON
    try {
      // 移除所有非列印的ASCII控制字符（保留換行和定位）
      const cleanJsonText = jsonText.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
      console.log('Cleaned JSON text:', cleanJsonText);
      
      const questions = JSON.parse(cleanJsonText);
      console.log('Parsed questions from Gemini:', questions);
      
      return Array.isArray(questions) ? questions : [];
    } catch (parseError) {
      console.error('Error parsing JSON:', parseError);
      console.error('Original text:', jsonText);
      return [];
    }
  } catch (error: any) { // 捕獲錯誤時打印原始文本
    console.error('Error parsing Gemini response, raw text:', text); // 添加日誌
    console.error('Error generating questions from Gemini:', error);
    console.error('Error generating questions from Gemini:', error);
    // 如果發生任何錯誤（API調用、解析等），返回空陣列
    return []; 
  }
}

// 生成新題目的API
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category') || '技術';
  const count = parseInt(searchParams.get('count') || '20');
  
  try {
    const generatedQuestions = await generateQuestions(category, count);
    
    if (!generatedQuestions.length) {
      return NextResponse.json(
        { error: 'Failed to generate questions from AI' },
        { status: 500 }
      );
    }

    const savedQuestions = await Promise.all(
      generatedQuestions.map(question =>
        prisma.question.create({
          data: {
            ...question,
            options: JSON.stringify(question.options),
          },
        }),
      ),
    );

    return NextResponse.json({
      success: true,
      message: `成功生成 ${savedQuestions.length} 道題目`,
      questions: savedQuestions.map(q => ({...q, options: JSON.parse(q.options as string)})),
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}
