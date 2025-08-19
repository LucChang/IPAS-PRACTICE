import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// 獲取答題記錄
export async function GET(request: NextRequest) {
  try {
    const records = await prisma.record.findMany({
      include: { question: true },
      orderBy: { answeredAt: 'desc' },
    });
    
    return NextResponse.json({ records });
  } catch (error) {
    console.error('Error fetching records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch records' },
      { status: 500 }
    );
  }
}

// 創建新答題記錄
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { questionId, userAnswer } = body;
    
    // 獲取問題以檢查答案是否正確
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });
    
    if (!question) {
      return NextResponse.json(
        { error: 'Question not found' },
        { status: 404 }
      );
    }
    
    // 檢查答案是否正確
    const isCorrect = userAnswer === question.answer;
    
    // 創建答題記錄
    const newRecord = await prisma.record.create({
      data: {
        questionId,
        userAnswer,
        isCorrect,
      },
    });

    // 更新題目的 answered 為 true
    await prisma.question.update({
      where: { id: questionId },
      data: { answered: true },
    });
    
    return NextResponse.json({ record: newRecord, isCorrect });
  } catch (error) {
    console.error('Error creating record:', error);
    return NextResponse.json(
      { error: 'Failed to create record' },
      { status: 500 }
    );
  }
}