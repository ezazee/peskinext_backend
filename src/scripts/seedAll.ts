import { execSync } from "child_process";

const runCommand = (command: string) => {
    try {
        console.log(`\n🚀 Running: ${command}...`);
        execSync(command, { stdio: "inherit" });
        console.log(`✅ Completed: ${command}`);
    } catch (error) {
        console.error(`❌ Error running command: ${command}`);
        process.exit(1);
    }
};

const main = () => {
    console.log("🌱 Starting Database Seeding...");

    // Order matters for Foreign Keys
    runCommand("npm run seedUser");
    runCommand("npm run seedProduct");
    runCommand("npm run seedCoupon");
    runCommand("npm run seedBanner");
    runCommand("npm run seedReview");

    console.log("\n✨ All seeders completed successfully!");
};

main();
