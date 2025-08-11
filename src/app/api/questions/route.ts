import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 獲取題目列表
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  
  try {
    const questions = await prisma.question.findMany({
      where: category ? { category } : undefined,
      orderBy: { createdAt: 'desc' },
    });
    
    // Ensure options is properly parsed
    const processedQuestions = questions.map(q => {
      let options: string[] = [];
      if (q.options) {
        if (typeof q.options === 'string') {
          try {
            const parsedOptions = JSON.parse(q.options);
            if (Array.isArray(parsedOptions)) {
              options = parsedOptions.map(String);
            }
          } catch (error) {
            // If parsing fails, options will remain an empty array.
            console.error(`Error parsing options for question ${q.id}:`, error);
          }
        } else if (Array.isArray(q.options)) {
          // If it's already an array, just ensure its elements are strings.
          options = q.options.map(String);
        }
      }
      return {
        ...q,
        options,
      };
    });
    
    return NextResponse.json({ questions: processedQuestions });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

// 創建新題目
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { content, options, answer, explanation, category } = body;
    
    const newQuestion = await prisma.question.create({
      data: {
        content,
        options: JSON.stringify(options),       
        answer,
        explanation,
        category,
      },
    });
    
    return NextResponse.json({ question: newQuestion });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    );
  }
}