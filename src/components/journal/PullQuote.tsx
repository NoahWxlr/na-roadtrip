export default function PullQuote({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <blockquote className="mx-auto my-10 max-w-[600px] border-l-[3px] border-[var(--accent)] pl-6 font-display text-2xl italic leading-snug text-[var(--text-primary)]">
      {children}
    </blockquote>
  )
}
