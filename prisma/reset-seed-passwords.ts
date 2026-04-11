/**
 * One-time script: rotate the default seed passwords for admin and editor accounts.
 *
 * Usage:
 *   DATABASE_URL="postgres://..." DIRECT_URL="postgres://..." npx tsx prisma/reset-seed-passwords.ts
 *
 * The script generates cryptographically strong passwords, updates the DB,
 * and prints the new credentials. Save them somewhere safe — they are not
 * stored anywhere after this script exits.
 */

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"
import { randomBytes } from "crypto"

const prisma = new PrismaClient()

function generatePassword(length = 24): string {
  // URL-safe base64 chars: letters, digits, - and _
  // Each byte → ~1.33 base64 chars, so we need ceil(length * 0.75) bytes
  return randomBytes(Math.ceil(length * 0.75))
    .toString("base64url")
    .slice(0, length)
}

async function main() {
  const accounts = [
    { email: "admin@chordsheet.app",  label: "Admin"  },
    { email: "editor@chordsheet.app", label: "Editor" },
  ]

  console.log("\n🔐 Rotating seed account passwords...\n")

  const results: { label: string; email: string; password: string }[] = []

  for (const account of accounts) {
    const user = await prisma.user.findUnique({ where: { email: account.email } })

    if (!user) {
      console.warn(`  ⚠  ${account.label} (${account.email}) not found — skipping`)
      continue
    }

    const newPassword = generatePassword(24)
    const passwordHash = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { email: account.email },
      data: { passwordHash },
    })

    results.push({ label: account.label, email: account.email, password: newPassword })
    console.log(`  ✓  ${account.label} (${account.email}) updated`)
  }

  if (results.length === 0) {
    console.log("\nNo accounts were updated.\n")
    return
  }

  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("  NEW CREDENTIALS — save these now, shown only once")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
  for (const r of results) {
    console.log(`  ${r.label}`)
    console.log(`    Email   : ${r.email}`)
    console.log(`    Password: ${r.password}\n`)
  }
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n")
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
