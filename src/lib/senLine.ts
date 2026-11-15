/**
 * Droite de Sen autorisée à l'écran (results.json, meta.method.trend_line).
 * y = intercept + (pente_decennie / 10) × (année − première année).
 * Ce n'est pas un nouveau calcul de pente : intercept et pente_decennie viennent du fichier.
 */
export function senY(intercept: number, slopePerDecade: number, year: number, firstYear: number): number {
  return intercept + (slopePerDecade / 10) * (year - firstYear)
}
