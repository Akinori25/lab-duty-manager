'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function seedDatabase() {
  const membersCount = await prisma.member.count();
  if (membersCount > 0) {
    return { success: false, message: 'Database already seeded' };
  }

  const members = [
    { name: '田中 太郎' },
    { name: '佐藤 花子' },
    { name: '鈴木 一郎' },
    { name: '高橋 次郎' },
    { name: '伊藤 三郎' },
    { name: '渡辺 四郎' },
    { name: '山本 五郎' },
    { name: '中村 六郎' },
    { name: '小林 七郎' },
    { name: '加藤 八郎' },
  ];

  for (const member of members) {
    await prisma.member.create({
      data: member,
    });
  }

  revalidatePath('/');
  return { success: true, message: 'Seed data created successfully' };
}
