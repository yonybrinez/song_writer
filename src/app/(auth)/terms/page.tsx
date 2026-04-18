"use client"

import { useState } from "react"
import Link from "next/link"
import { Music, ArrowLeft } from "lucide-react"

const UPDATED = "April 18, 2026"
const UPDATED_ES = "18 de abril de 2026"

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-3">{title}</h2>
      <div className="space-y-2 text-sm text-slate-300 leading-relaxed">{children}</div>
    </section>
  )
}

function EnglishTerms() {
  return (
    <div>
      <p className="text-xs text-slate-500">Last updated: {UPDATED}</p>

      <Section title="1. The Service">
        <p>
          ChordSheet is a platform for creating, organizing, and sharing songs with chords. By
          creating an account you agree to these Terms & Conditions and Privacy Policy.
        </p>
      </Section>

      <Section title="2. Information We Collect">
        <p>When you register, we collect only the following personal data:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
          <li>Your <strong className="text-slate-300">name</strong></li>
          <li>Your <strong className="text-slate-300">email address</strong></li>
        </ul>
        <p>We do not collect payment information, phone numbers, or any other personal data.</p>
      </Section>

      <Section title="3. How We Use Your Information">
        <p>Your name and email are used exclusively to:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
          <li>Create and identify your account</li>
          <li>Allow you to log in to the service</li>
          <li>Display your name on songs you create or edit</li>
        </ul>
        <p>
          We do <strong className="text-slate-300">not</strong> sell, share, rent, or use your
          personal data for advertising or marketing purposes.
        </p>
      </Section>

      <Section title="4. Data Security">
        <p>
          Your password is never stored in plain text. We use bcrypt, a strong one-way hashing
          algorithm, to protect it. We apply reasonable technical and organizational measures to
          safeguard all personal data we hold.
        </p>
      </Section>

      <Section title="5. Your Rights, Consent, and Responsibilities">
        <p>
          By creating an account, you grant ChordSheet your{" "}
          <strong className="text-slate-300">voluntary and explicit consent</strong> to store your
          name and email address solely for the purposes described in Section 3.
        </p>
        <p>
          You retain full control over your personal data and may exercise your rights directly
          from your account settings, without needing to contact us:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
          <li>
            <strong className="text-slate-300">Update</strong> your name or email address at any
            time from your <strong className="text-slate-300">Profile</strong> page.
          </li>
          <li>
            <strong className="text-slate-300">Delete</strong> your account permanently from your
            Profile page. Upon deletion, your songs are transferred to a platform editor account.
          </li>
        </ul>
        <p>
          ChordSheet is <strong className="text-slate-300">not responsible</strong> for the
          accuracy of the information you provide, nor for any content you create or publish on the
          platform. You accept full responsibility for the songs and content you upload or share.
        </p>
        <p>
          The platform bears no liability for any consequences arising from account deletion,
          content transfer, or discontinuation of the service.
        </p>
      </Section>

      <Section title="6. Colombian Users — Ley 1581 de 2012">
        <p>
          For users located in Colombia, the following applies in accordance with the{" "}
          <strong className="text-slate-300">
            Ley 1581 de 2012 (Personal Data Protection Act)
          </strong>{" "}
          and Decree 1377 of 2013:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
          <li>
            The data controller (<em>responsable del tratamiento</em>) is ChordSheet.
          </li>
          <li>
            Personal data is collected and processed based on your{" "}
            <strong className="text-slate-300">explicit consent</strong>, provided at the time of
            registration.
          </li>
          <li>
            You hold the rights of access (<em>acceso</em>), correction (
            <em>rectificación</em>), update (<em>actualización</em>), deletion (
            <em>supresión</em>), and revocation of consent, as established in Article 8 of Ley
            1581 de 2012 (<strong className="text-slate-300">Habeas Data</strong>).
          </li>
          <li>
            Data rights requests can be directed to our contact email. You may also file a
            complaint with the{" "}
            <strong className="text-slate-300">
              Superintendencia de Industria y Comercio (SIC)
            </strong>
            , the Colombian data protection authority.
          </li>
        </ul>
      </Section>

      <Section title="7. Changes to These Terms">
        <p>
          We may update these terms at any time. Continued use of the service after changes are
          published constitutes your acceptance of the updated terms.
        </p>
      </Section>

      <Section title="8. Contact">
        <p>
          For any question, rights request, or data-related concern, contact us at:{" "}
          <a
            href="mailto:support@chordsheet.app"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            support@chordsheet.app
          </a>
        </p>
      </Section>
    </div>
  )
}

function SpanishTerms() {
  return (
    <div>
      <p className="text-xs text-slate-500">Última actualización: {UPDATED_ES}</p>

      <Section title="1. El Servicio">
        <p>
          ChordSheet es una plataforma para crear, organizar y compartir canciones con acordes. Al
          crear una cuenta, aceptas estos Términos y Condiciones y la Política de Privacidad.
        </p>
      </Section>

      <Section title="2. Información que Recopilamos">
        <p>Al registrarte, recopilamos únicamente los siguientes datos personales:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
          <li>Tu <strong className="text-slate-300">nombre</strong></li>
          <li>Tu <strong className="text-slate-300">correo electrónico</strong></li>
        </ul>
        <p>
          No recopilamos información de pago, números de teléfono ni ningún otro dato personal.
        </p>
      </Section>

      <Section title="3. Uso de tu Información">
        <p>Tu nombre y correo se utilizan exclusivamente para:</p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
          <li>Crear e identificar tu cuenta</li>
          <li>Permitirte iniciar sesión en el servicio</li>
          <li>Mostrar tu nombre en las canciones que crees o edites</li>
        </ul>
        <p>
          <strong className="text-slate-300">No</strong> vendemos, compartimos, alquilamos ni
          usamos tus datos personales con fines publicitarios o de mercadeo.
        </p>
      </Section>

      <Section title="4. Seguridad de los Datos">
        <p>
          Tu contraseña nunca se almacena en texto plano. Utilizamos bcrypt, un algoritmo de hash
          unidireccional robusto, para protegerla. Aplicamos medidas técnicas y organizativas
          razonables para resguardar todos los datos personales que tratamos.
        </p>
      </Section>

      <Section title="5. Tus Derechos, Consentimiento y Responsabilidades">
        <p>
          Al crear una cuenta, otorgas a ChordSheet tu{" "}
          <strong className="text-slate-300">consentimiento voluntario y explícito</strong> para
          almacenar tu nombre y correo electrónico únicamente con los fines descritos en la
          Sección 3.
        </p>
        <p>
          Conservas el control total sobre tus datos personales y puedes ejercer tus derechos
          directamente desde la configuración de tu cuenta, sin necesidad de contactarnos:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
          <li>
            <strong className="text-slate-300">Actualizar</strong> tu nombre o correo electrónico
            en cualquier momento desde tu página de{" "}
            <strong className="text-slate-300">Perfil</strong>.
          </li>
          <li>
            <strong className="text-slate-300">Eliminar</strong> tu cuenta de forma permanente
            desde tu página de Perfil. Al eliminarla, tus canciones serán transferidas a una
            cuenta editora de la plataforma.
          </li>
        </ul>
        <p>
          ChordSheet <strong className="text-slate-300">no se hace responsable</strong> de la
          exactitud de la información que proporcionas, ni del contenido que creas o publicas en
          la plataforma. Aceptas plena responsabilidad por las canciones y el contenido que subes
          o compartes.
        </p>
        <p>
          La plataforma no asume ninguna responsabilidad por las consecuencias derivadas de la
          eliminación de cuentas, la transferencia de contenido o la discontinuación del servicio.
        </p>
      </Section>

      <Section title="6. Usuarios en Colombia — Ley 1581 de 2012">
        <p>
          Para los usuarios ubicados en Colombia, aplica lo siguiente de conformidad con la{" "}
          <strong className="text-slate-300">
            Ley 1581 de 2012 (Régimen General de Protección de Datos Personales)
          </strong>{" "}
          y el Decreto 1377 de 2013:
        </p>
        <ul className="list-disc list-inside space-y-1 text-slate-400 pl-2">
          <li>
            El responsable del tratamiento de datos personales es ChordSheet.
          </li>
          <li>
            Los datos personales se recopilan y tratan con base en tu{" "}
            <strong className="text-slate-300">consentimiento explícito</strong>, otorgado al
            momento del registro.
          </li>
          <li>
            Tienes los derechos de acceso, rectificación, actualización, supresión y revocación
            del consentimiento sobre tus datos personales (
            <strong className="text-slate-300">Habeas Data</strong>), conforme al artículo 8 de
            la Ley 1581 de 2012.
          </li>
          <li>
            Las solicitudes de ejercicio de derechos pueden dirigirse a nuestro correo de
            contacto. También puedes presentar una queja ante la{" "}
            <strong className="text-slate-300">
              Superintendencia de Industria y Comercio (SIC)
            </strong>
            , autoridad de protección de datos de Colombia.
          </li>
        </ul>
      </Section>

      <Section title="7. Modificaciones">
        <p>
          Podemos actualizar estos términos en cualquier momento. El uso continuado del servicio
          tras la publicación de los cambios implica la aceptación de los términos actualizados.
        </p>
      </Section>

      <Section title="8. Contacto">
        <p>
          Para consultas, solicitudes de derechos o cualquier asunto relacionado con tus datos,
          escríbenos a:{" "}
          <a
            href="mailto:support@chordsheet.app"
            className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
          >
            support@chordsheet.app
          </a>
        </p>
      </Section>
    </div>
  )
}

export default function TermsPage() {
  const [lang, setLang] = useState<"en" | "es">("en")

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-600">
              <Music className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-100">
                {lang === "en" ? "Terms & Conditions" : "Términos y Condiciones"}
              </h1>
              <p className="text-xs text-slate-500">ChordSheet</p>
            </div>
          </div>

          {/* Language toggle */}
          <div className="flex items-center gap-1 rounded-lg border border-slate-700 p-1 flex-shrink-0">
            <button
              onClick={() => setLang("en")}
              className={[
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                lang === "en"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200",
              ].join(" ")}
            >
              EN
            </button>
            <button
              onClick={() => setLang("es")}
              className={[
                "rounded px-3 py-1 text-xs font-medium transition-colors",
                lang === "es"
                  ? "bg-indigo-600 text-white"
                  : "text-slate-400 hover:text-slate-200",
              ].join(" ")}
            >
              ES
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="rounded-xl border border-slate-800 bg-slate-900 px-6 py-8">
          {lang === "en" ? <EnglishTerms /> : <SpanishTerms />}
        </div>

        {/* Back link */}
        <div className="mt-6 flex items-center gap-2">
          <Link
            href="/register"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {lang === "en" ? "Back to registration" : "Volver al registro"}
          </Link>
        </div>
      </div>
    </div>
  )
}
