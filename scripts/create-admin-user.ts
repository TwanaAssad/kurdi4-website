
import { createClient } from '@supabase/supabase-js';
import { db } from '../src/lib/db';
import { profiles } from '../src/lib/schema';
import { eq } from 'drizzle-orm';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function main() {
  const email = 'info@kurdi4.org';
  const password = 'Kurdi4it@89';

  console.log(`Creating user ${email}...`);

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

    if (error) {
      console.log('Supabase Error Message:', error.message);
      if (error.message.toLowerCase().includes('already') || error.message.toLowerCase().includes('registered')) {
        console.log('User already exists in Supabase. Updating password and syncing MySQL profile...');
        const { data: usersData, error: listError } = await supabase.auth.admin.listUsers();
        if (listError) {
            console.error('Error listing users:', listError.message);
            return;
        }
        const user = usersData.users.find(u => u.email === email);
        if (user) {
            const { error: updateError } = await supabase.auth.admin.updateUserById(user.id, { password });
            if (updateError) {
                console.error('Error updating user password:', updateError.message);
            } else {
                console.log('Password updated successfully.');
            }
            await syncProfile(user.id, email);
        }
    } else {
        console.error('Error creating user in Supabase:', error.message);
    }
    return;
  }

  const userId = data.user.id;
  console.log(`User created in Supabase with ID: ${userId}`);

  await syncProfile(userId, email);
}

async function syncProfile(userId: string, email: string) {
    console.log(`Syncing profile for ${email} in MySQL...`);
    
    const existingProfile = await db.query.profiles.findFirst({
        where: eq(profiles.id, userId)
    });

    if (existingProfile) {
        console.log('Profile already exists in MySQL.');
        await db.update(profiles).set({
            role: 'admin',
            status: 'active'
        }).where(eq(profiles.id, userId));
    } else {
        await db.insert(profiles).values({
            id: userId,
            email: email,
            full_name: 'Administrator',
            role: 'admin',
            status: 'active'
        });
        console.log('Profile created in MySQL.');
    }
}

main().catch(console.error).finally(() => process.exit());
