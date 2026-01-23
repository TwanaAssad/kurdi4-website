
import { 
  getStatsAction, 
  createPostAction, 
  updatePageAction, 
  getPostsAction,
  updateSiteSettingsAction,
  getSiteSettingsAction
} from "../src/lib/actions";

async function verify() {
  console.log("🚀 Starting verification of database fixes...");

  try {
    // 1. Test getStatsAction (Date issue)
    console.log("\n--- Testing getStatsAction ---");
    const stats = await getStatsAction();
    console.log("✅ getStatsAction successful");
    console.log("Chart data count:", stats.chartData.length);

    // 2. Test createPostAction with problematic data
    console.log("\n--- Testing createPostAction with empty numeric fields ---");
    const postResult = await createPostAction({
      title: "Test Verification Post " + Date.now(),
      content: "This is a test post to verify numeric field handling.",
      category_id: "", // Empty string should be handled
      sub_category_id: "NaN", // Invalid number should be handled
      status: "draft",
      author_id: "test-user"
    });
    console.log("✅ createPostAction successful, ID:", postResult.id);

    // 3. Test getPostsAction with date filter
    console.log("\n--- Testing getPostsAction with date filter ---");
    const today = new Date().toISOString().split('T')[0];
    const posts = await getPostsAction({ dateFilter: today });
    console.log("✅ getPostsAction successful, found:", posts.count);

    // 4. Test updateSiteSettingsAction
    console.log("\n--- Testing updateSiteSettingsAction ---");
    const settings = await getSiteSettingsAction();
    if (settings) {
      const updateResult = await updateSiteSettingsAction({
        ...settings,
        org_name: settings.org_name + " (Verified)"
      });
      console.log("✅ updateSiteSettingsAction successful");
    } else {
      console.log("⚠️ No site settings found to update");
    }

    console.log("\n✨ All verifications passed!");
  } catch (error) {
    console.error("\n❌ Verification failed:");
    console.error(error);
    process.exit(1);
  }
}

verify();
