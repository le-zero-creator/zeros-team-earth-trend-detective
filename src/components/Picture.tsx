/** Photo approuvée : WebP d'abord, JPEG si le navigateur ne sait pas le lire. */
export function Picture({ name, alt }: { name: 'earth-hero' | 'satellite' | 'congo-forest'; alt: string }) {
  const base = import.meta.env.BASE_URL
  return (
    <picture>
      <source srcSet={`${base}img/${name}.webp`} type="image/webp" />
      <img src={`${base}img/${name}.jpg`} alt={alt} width={1600} height={1000} />
    </picture>
  )
}
