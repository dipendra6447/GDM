import { db } from './src/db/index.js';
import { subscriptionPlans } from './src/db/schema/index.js';
import { eq } from 'drizzle-orm';

async function test() {
  try {
    const plans = await db.select().from(subscriptionPlans).where(eq(subscriptionPlans.isDeleted, false)).limit(1);
    console.log("Drizzle Select result keys:", Object.keys(plans[0]));
    console.log("Drizzle Select full result:", plans[0]);
  } catch (err) {
    console.error("Test failed:", err);
  }
}
test();
