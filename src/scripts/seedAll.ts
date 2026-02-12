import { execSync } from "child_process";

const runCommand = (command: string) => {
    try {

        execSync(command, { stdio: "inherit" });

    } catch (error) {
        console.error(`❌ Error running command: ${command}`);
        process.exit(1);
    }
};

const main = () => {


    // Order matters for Foreign Keys
    runCommand("npm run seedUser");
    runCommand("npm run seedProduct");
    runCommand("npm run seedCoupon");
    runCommand("npm run seedBanner");
    runCommand("npm run seedReview");


};

main();
