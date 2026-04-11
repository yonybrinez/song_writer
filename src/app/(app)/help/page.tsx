"use client"

import { useState } from "react"

type Lang = "en" | "es"

const content = {
  en: {
    title: "Help — How ChordSheet works",
    sections: [
      {
        heading: "Getting started",
        body: "Register an account. The first user who signs up automatically becomes the Admin. Every other user gets the Editor role, which lets them create and manage their own songs right away.",
      },
      {
        heading: "Creating a song",
        body: "Go to Songs → New Song. Fill in the title, artist, key, tempo and time signature. Write your lyrics using ChordPro notation: place chord names in square brackets directly before the syllable they fall on, for example [G]Amazing [C]grace. Add a category and tags to keep things organised.",
      },
      {
        heading: "ChordPro notation",
        body: "Chords are written inline with the lyrics: [G]Amazing [G7]grace, how [C]sweet the [G]sound. Use # for section headings: # Verse 1, # Chorus. The viewer renders chords above the lyrics automatically.",
      },
      {
        heading: "Transposing",
        body: "Open any song and use the Transpose control to shift the key up or down by semitones. The transposition is applied live and does not save until you explicitly save the song.",
      },
      {
        heading: "Publishing a song",
        body: "Every song is private by default. Toggle Is public when creating or editing a song to make it visible to all users. Public songs appear in everyone's song list.",
      },
      {
        heading: "Allowing edits by others",
        body: "When a song is public you can also enable Allow edits. This lets any logged-in user edit your song directly. Only the author (or an Admin) can change the Is public and Allow edits settings.",
      },
      {
        heading: "Copying a song (fork)",
        body: "On any public song, click Copy. This creates a private copy in your account with the same content. The copy is automatically assigned the next version number (v2, v3, …) so the lineage is always traceable. You own the copy and can edit or publish it independently.",
      },
      {
        heading: "Song versioning",
        body: "Every copy tracks its origin. Versioned songs show an amber v{n} badge on the song card. When you open a versioned song you will see a lineage banner at the top showing the version number, your name as the author, and a link back to the original song and its author. Version numbers are assigned sequentially across all users who copy the same original: the original is v1, the first copy is v2, the second is v3, and so on regardless of who made the copy.",
      },
      {
        heading: "Exporting",
        body: "Open a song and click the Export button to download it as PDF, Markdown, or HTML.",
      },
      {
        heading: "Roles",
        body: "EDITOR (default for all new users): create and manage your own songs. ADMIN: everything an Editor can do, plus manage users and categories. VIEWER: read-only access, assigned manually by an Admin.",
      },
      {
        heading: "Admin panel",
        body: "Admins can access the Users page to change any user's role. Use this to promote someone to Admin or downgrade them to Viewer.",
      },
    ],
  },
  es: {
    title: "Ayuda — Cómo funciona ChordSheet",
    sections: [
      {
        heading: "Primeros pasos",
        body: "Regístrate con una cuenta. El primer usuario en registrarse se convierte automáticamente en Administrador. Todos los demás usuarios obtienen el rol Editor, lo que les permite crear y gestionar sus propias canciones de inmediato.",
      },
      {
        heading: "Crear una canción",
        body: "Ve a Canciones → Nueva canción. Completa el título, artista, tonalidad, tempo y compás. Escribe la letra usando la notación ChordPro: coloca el nombre del acorde entre corchetes justo antes de la sílaba correspondiente, por ejemplo [G]Amazing [C]grace. Agrega una categoría y etiquetas para mantener todo organizado.",
      },
      {
        heading: "Notación ChordPro",
        body: "Los acordes se escriben dentro de la letra: [G]Amazing [G7]grace, how [C]sweet the [G]sound. Usa # para títulos de sección: # Verso 1, # Coro. El visor muestra los acordes sobre la letra de forma automática.",
      },
      {
        heading: "Transportar",
        body: "Abre cualquier canción y usa el control de Transporte para subir o bajar la tonalidad en semitonos. La transposición se aplica en tiempo real y no se guarda hasta que lo confirmes explícitamente.",
      },
      {
        heading: "Publicar una canción",
        body: "Cada canción es privada por defecto. Activa Es pública al crear o editar una canción para que sea visible para todos los usuarios. Las canciones públicas aparecen en la lista de canciones de todos.",
      },
      {
        heading: "Permitir edición por otros usuarios",
        body: "Cuando una canción es pública, también puedes activar Permitir ediciones. Esto permite que cualquier usuario registrado edite tu canción directamente. Solo el autor (o un Administrador) puede cambiar las opciones Es pública y Permitir ediciones.",
      },
      {
        heading: "Copiar una canción (bifurcar)",
        body: "En cualquier canción pública, haz clic en Copiar. Esto crea una copia privada en tu cuenta con el mismo contenido. La copia recibe automáticamente el siguiente número de versión (v2, v3, …) para que el historial siempre sea rastreable. Tú eres el propietario de la copia y puedes editarla o publicarla de forma independiente.",
      },
      {
        heading: "Versionado de canciones",
        body: "Cada copia registra su origen. Las canciones con versiones muestran un distintivo ámbar v{n} en la tarjeta de la canción. Al abrir una canción versionada verás un banner en la parte superior con el número de versión, tu nombre como autor y un enlace hacia la canción original y su autor. Los números de versión se asignan de forma secuencial entre todos los usuarios que copian el mismo original: el original es v1, la primera copia es v2, la segunda es v3, sin importar quién hizo la copia.",
      },
      {
        heading: "Exportar",
        body: "Abre una canción y haz clic en Exportar para descargarla como PDF, Markdown o HTML.",
      },
      {
        heading: "Roles",
        body: "EDITOR (por defecto para todos los nuevos usuarios): crear y gestionar tus propias canciones. ADMIN: todo lo que puede hacer un Editor, más gestionar usuarios y categorías. VIEWER: acceso de solo lectura, asignado manualmente por un Administrador.",
      },
      {
        heading: "Panel de administración",
        body: "Los administradores pueden acceder a la página de Usuarios para cambiar el rol de cualquier usuario. Úsalo para promover a alguien a Administrador o bajarlo a Viewer.",
      },
    ],
  },
}

export default function HelpPage() {
  const [lang, setLang] = useState<Lang>("en")
  const t = content[lang]

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 gap-4">
        <h1 className="text-2xl font-bold text-slate-100">{t.title}</h1>
        <div className="flex rounded-lg border border-slate-700 overflow-hidden flex-shrink-0">
          <button
            onClick={() => setLang("en")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              lang === "en" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang("es")}
            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
              lang === "es" ? "bg-indigo-600 text-white" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            }`}
          >
            ES
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-6">
        {t.sections.map((section) => (
          <div key={section.heading} className="rounded-xl border border-slate-800 bg-slate-900 p-5">
            <h2 className="text-base font-semibold text-indigo-400 mb-2">{section.heading}</h2>
            <p className="text-sm text-slate-300 leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
