import { ScholarshipsApplicationInterface } from '@rusaint/react-native';

import { db } from '@/db';
import { scholarships } from '@/entities/scholarships/model';
import { cache } from '@/shared/model/schema/cache';

export const syncScholarships = async (client: ScholarshipsApplicationInterface) => {
  const data = await client.scholarships();

  // Delete existing data
  await db.delete(scholarships).execute();

  // Save scholarship information
  if (data.length > 0) {
    await db
      .insert(scholarships)
      .values(
        data.map((scholarship) => ({
          year: scholarship.year,
          semester: scholarship.semester,
          name: scholarship.name,
          receivedAmount: scholarship.receivedAmount.toString(),
          receiveType: scholarship.receiveType ?? null,
          status: scholarship.status ?? null,
          processedAt: scholarship.processedAt ?? null,
          selectedAmount: scholarship.selectedAmount?.toString() ?? null,
          refundedAmount: scholarship.refundedAmount?.toString() ?? null,
          replacedAmount: scholarship.replacedAmount?.toString() ?? null,
          replacedBy: scholarship.replacedBy ?? null,
          dropReason: scholarship.dropReason ?? null,
          note: scholarship.note ?? null,
          workedAt: scholarship.workedAt ?? null,
        })),
      )
      .execute();
  }

  // Update cache
  const cacheKey = 'scholarships';
  await db
    .insert(cache)
    .values({
      key: cacheKey,
      updatedAt: Date.now(),
    })
    .onConflictDoUpdate({
      target: cache.key,
      set: {
        updatedAt: Date.now(),
      },
    })
    .execute();
};
