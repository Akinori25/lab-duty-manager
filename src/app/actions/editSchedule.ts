'use server';

import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateAssignment(
  assignmentId: string, 
  data: { memberId?: string }
) {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: { schedule: true }
    });

    if (!assignment) throw new Error('Assignment not found');

    // Conflict Validation: Ensure the new member isn't already assigned to another role on the exact same date
    if (data.memberId && data.memberId !== assignment.memberId) {
      const conflict = await prisma.assignment.findFirst({
        where: {
          scheduleId: assignment.scheduleId,
          memberId: data.memberId,
          id: { not: assignmentId }
        }
      });

      if (conflict) {
        throw new Error('This member is already assigned to the other role on this date.');
      }
    }

    await prisma.assignment.update({
      where: { id: assignmentId },
      data: {
        ...(data.memberId && { memberId: data.memberId })
      }
    });

    revalidatePath('/schedule');
    revalidatePath('/');
    
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

