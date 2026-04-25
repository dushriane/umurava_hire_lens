/**
 * Utility script to generate bcrypt hashes for mock users
 * This script reads mock-users.json and creates a new version with hashed passwords
 * Run with: npm run hash-passwords
 */
import bcryptjs from "bcryptjs";
import * as fs from "fs";
import * as path from "path";

async function hashPasswords() {
  const usersPath = path.join(__dirname, "../fixtures/mock-users.json");
  const backupPath = path.join(__dirname, "../fixtures/mock-users.backup.json");

  try {
    console.log("Reading mock-users.json...\n");
    const usersData = fs.readFileSync(usersPath, "utf-8");
    const users = JSON.parse(usersData);

    // Create backup
    fs.writeFileSync(backupPath, usersData);
    console.log(`✓ Backup created at: ${backupPath}\n`);

    console.log("Hashing passwords with bcryptjs (rounds: 10)...\n");

    // Hash all passwords
    const hashedUsers = await Promise.all(
      users.map(async (user: any) => ({
        ...user,
        password: await bcryptjs.hash(user.password, 10),
      }))
    );

    // Write updated file
    fs.writeFileSync(usersPath, JSON.stringify(hashedUsers, null, 2));
    console.log(`✓ Updated mock-users.json with hashed passwords\n`);

    console.log("User accounts:");
    users.forEach((user: any) => {
      console.log(`  - ${user.username} (${user.name})`);
    });

    console.log("\n✓ Password migration complete!");
    console.log("Demo accounts are still available with the same credentials.");
  } catch (error) {
    console.error("Error hashing passwords:", error);
    process.exit(1);
  }
}

hashPasswords();
