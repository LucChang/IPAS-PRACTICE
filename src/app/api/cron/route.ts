import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Add to package.json: "@google/generative-ai": "^0.2.1"
import { parsePdf } from '@/lib/pdf-parser';
import path from 'path';
import fs from 'fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function generateQuestions(category: string, count: number = 50) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
  console.log('Current Working Directory:', process.cwd());
  // 使用固定路径避免文件访问错误
  const pdfPath = path.join(process.cwd(), 'test', 'data', '05-versions-space.pdf');

  console.log('Defined pdfPath:', pdfPath);

  // 检查文件是否存在
  try {
    await fs.access(pdfPath);
    console.log('PDF file exists at:', pdfPath);
  } catch (error) {
    console.error('PDF file does NOT exist at:', pdfPath, error);
    throw new Error(`PDF file not found at ${pdfPath}`);
  }

  console.log('Attempting to parse PDF from:', pdfPath);
  const fileBuffer = await fs.readFile(pdfPath);
  const pdfContent = await parsePdf(fileBuffer)

  const prompt = `請根據以下iPAS資訊安全檢定的內容，生成${count}道題目，主題為「技術與管理」。

---
${pdfContent}
---

每道題目需要包含以下部分：
- 題目內容 (content)
- 四個選項，格式為JSON字串數組 (options)，例如：["a. 選項一", "b. 選項二", "c. 選項三", "d. 選項四"]
- 正確答案 (answer)，必須是 a、b、c 或 d 其中一個
- 答案解釋 (explanation)
- 題目類別 (category)，題目歸類成'技術'、'管理' 兩類
請以JSON格式返回，且key的名稱需與上述英文相符。每個題目必須有四個選項，不能少於四個選項。`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    // 移除Markdown代码块标记
    const cleanedText = text.replace(/^```json\n|\n```$/g, '');
    const questions = JSON.parse(cleanedText);
    
    // 確保每個題目都有四個選項
    const validQuestions = Array.isArray(questions) ? questions.filter(q => {
      return q.options && Array.isArray(q.options) && q.options.length === 4;
    }) : [];
    
    console.log(`Filtered ${Array.isArray(questions) ? questions.length : 0} questions to ${validQuestions.length} valid questions with 4 options`);
    return validQuestions;
  } catch (error) {
    console.error('Error generating questions from Gemini:', error);
    return [];
  }
}

// 定時生成題目的API
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category = '技術', count = 15 } = body;

    const questions = await generateQuestions(category, count);

    if (!questions.length) {
      return NextResponse.json(
        { error: `Failed to generate questions for category: ${category}` },
        { status: 500 }
      );
    }

    const savedQuestions = await Promise.all(
      questions.map(question =>
        prisma.question.create({
          data: {
            ...question,
            options: JSON.stringify(question.options),
          },
        })
      )
    );

    return NextResponse.json({
      success: true,
      message: `成功生成 ${savedQuestions.length} 道'${category}'類型的題目`,
      count: savedQuestions.length,
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    return NextResponse.json(
      { error: 'Failed to generate questions' },
      { status: 500 }
    );
  }
}