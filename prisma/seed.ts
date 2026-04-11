import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create admin user
  const adminHash = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { email: "admin@chordsheet.app" },
    update: {},
    create: {
      email: "admin@chordsheet.app",
      name: "Admin",
      passwordHash: adminHash,
      role: "ADMIN",
    },
  })

  // Create editor user
  const editorHash = await bcrypt.hash("editor123", 12)
  const editor = await prisma.user.upsert({
    where: { email: "editor@chordsheet.app" },
    update: {},
    create: {
      email: "editor@chordsheet.app",
      name: "Editor User",
      passwordHash: editorHash,
      role: "EDITOR",
    },
  })

  // Create categories
  const worshipCat = await prisma.category.upsert({
    where: { slug: "worship" },
    update: {},
    create: { name: "Worship", slug: "worship", color: "#6366f1" },
  })

  const popCat = await prisma.category.upsert({
    where: { slug: "pop" },
    update: {},
    create: { name: "Pop", slug: "pop", color: "#ec4899" },
  })

  const classicCat = await prisma.category.upsert({
    where: { slug: "classic" },
    update: {},
    create: { name: "Classic", slug: "classic", color: "#eab308" },
  })

  // Create tags
  const tags = await Promise.all(
    ["acoustic", "4/4", "easy", "fingerpicking", "capo 2"].map((name) =>
      prisma.tag.upsert({
        where: { slug: name.replace(/[^a-z0-9]/gi, "-").replace(/-+/g, "-").toLowerCase() },
        update: {},
        create: {
          name,
          slug: name.replace(/[^a-z0-9]/gi, "-").replace(/-+/g, "-").toLowerCase(),
        },
      })
    )
  )

  // Create sample songs
  await prisma.song.upsert({
    where: { id: "seed-song-1" },
    update: {},
    create: {
      id: "seed-song-1",
      title: "Amazing Grace",
      artist: "Traditional",
      key: "G",
      tempo: 70,
      timeSignature: "3/4",
      content: `# Verse 1
[G]Amazing [G7]grace, how [C]sweet the [G]sound
That [G]saved a [D]wretch like [G]me
I [G]once was [G7]lost, but [C]now am [G]found
Was [G]blind, but [D]now I [G]see

# Verse 2
[G]'Twas [G7]grace that [C]taught my [G]heart to fear
And [G]grace my [D]fears re[G]lieved
How [G]precious [G7]did that [C]grace ap[G]pear
The [G]hour I [D]first be[G]lieved

# Chorus
[C]How [G]precious is the [D]sound
That [G]saved a [G7]wretch like [C]me
Amazing [G]grace [D]divine
Through [G]many [D]dangers, toils and [G]snares`,
      authorId: admin.id,
      categoryId: worshipCat.id,
      songTags: {
        create: [{ tagId: tags[0].id }, { tagId: tags[2].id }],
      },
    },
  })

  await prisma.song.upsert({
    where: { id: "seed-song-2" },
    update: {},
    create: {
      id: "seed-song-2",
      title: "House of the Rising Sun",
      artist: "The Animals",
      key: "Am",
      tempo: 80,
      timeSignature: "6/8",
      content: `# Verse 1
[Am]There is [C]a house in [D]New Or[F]leans
They [Am]call the [C]Rising [E]Sun
And it's [Am]been the [C]ruin of [D]many a poor [F]boy
And [Am]God, I [E]know I'm [Am]one

# Verse 2
[Am]My [C]mother was a [D]tailor
She [Am]sewed my [C]new blue [E]jeans
My [Am]father was a [C]gambling [D]man [F]down
In [Am]New Or[E]leans [Am]

# Chorus
[Am]Go tell my [C]baby sister
[D]Never do what [F]I have done
[Am]Shun that [C]house in [E]New Orleans
They [Am]call the [E]Rising [Am]Sun`,
      authorId: editor.id,
      categoryId: classicCat.id,
      songTags: {
        create: [{ tagId: tags[0].id }, { tagId: tags[3].id }],
      },
    },
  })

  await prisma.song.upsert({
    where: { id: "seed-song-3" },
    update: {},
    create: {
      id: "seed-song-3",
      title: "Wonderwall",
      artist: "Oasis",
      key: "Em",
      tempo: 86,
      timeSignature: "4/4",
      content: `# Verse 1
[Em7]Today is gonna be the day that they're
[G]gonna throw it back to you
[Dsus4]By now you should've somehow
[A7sus4]realized what you gotta do
[Em7]I don't believe that anybody
[G]feels the way I do
[Dsus4]about you now [A7sus4]

# Pre-Chorus
[Cadd9]Backbeat, the word was on the street that
[Em7]the fire in your heart is out
[Cadd9]I'm sure you've heard it all before but
[Em7]you never really had a doubt
[Cadd9]I don't believe that anybody
[Em7]feels the way I do
[G]about you [Dsus4]now

# Chorus
[Cadd9]And all the [Em7]roads we have to walk are [G]winding
[Cadd9]And all the [Em7]lights that lead us there are [G]blinding
[Cadd9]There are many [Em7]things that I would
like to [G]say to you
[Dsus4]But I don't know [A7sus4]how

[Cadd9]Because [Em7]maybe [G]
You're gonna be the one that [Dsus4]saves me [A7sus4]
And [Cadd9]after [Em7]all [G]
You're my [Dsus4]wonder[A7sus4]wall`,
      authorId: editor.id,
      categoryId: popCat.id,
      songTags: {
        create: [{ tagId: tags[1].id }, { tagId: tags[4].id }],
      },
    },
  })

  console.log("✅ Seed complete!")
  console.log("   Admin: admin@chordsheet.app / admin123")
  console.log("   Editor: editor@chordsheet.app / editor123")
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
