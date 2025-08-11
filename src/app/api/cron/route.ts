import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { GoogleGenerativeAI } from '@google/generative-ai';
// Add to package.json: "@google/generative-ai": "^0.2.1"
import { parsePdf } from '@/lib/pdf-parser';
import path from 'path';
import fs from 'fs/promises';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

async function generateQuestions(category: string, count: number = 20) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash"});
  console.log('Current Working Directory:', process.cwd());
  // 使用固定路径避免文件访问错误
  const pdfPath = path.resolve(__dirname, '../../../../../test/data/05-versions-space.pdf');

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

  const prompt = `請根據以下iPAS資訊安全檢定的內容，生成${count}道題目，主題為「${category}」。

---
${pdfContent}
---

每道題目需要包含以下部分：
- 題目內容 (content)
- 四個選項，格式為JSON字串 (options)
- 正確答案 (answer)
- 答案解釋 (explanation)
- 題目類別 (category)
請以JSON格式返回，且key的名稱需與上述英文相符。`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    
    // 移除Markdown代码块标记
    const cleanedText = text.replace(/^```json\n|\n```$/g, '');
    const questions = JSON.parse(cleanedText);
    return Array.isArray(questions) ? questions : [];
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