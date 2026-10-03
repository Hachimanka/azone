/** Largest photo we accept before resizing (phone cameras produce 3–12 MB). */
export const MAX_PHOTO_BYTES = 15 * 1024 * 1024

/**
 * Center-crops an image file to a square and scales it to `size`px, returned as a JPEG data URL.
 * Keeps uploads tiny (~15–40 KB at 256px) so they fit the API's request limit.
 */
export async function squareImageDataUrl(file: File, size = 256, quality = 0.85): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Please choose an image file.')
  if (file.size > MAX_PHOTO_BYTES) throw new Error('That photo is too large (max 15 MB).')

  // createImageBitmap applies the photo's EXIF rotation, so phone portraits aren't sideways
  const bitmap = await createImageBitmap(file).catch(() => {
    throw new Error("Couldn't read that image. Try a JPG or PNG.")
  })
  const side = Math.min(bitmap.width, bitmap.height)
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#ffffff' // JPEG has no transparency: put transparent PNGs on white, not black
  ctx.fillRect(0, 0, size, size)
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, size, size)
  bitmap.close()
  return canvas.toDataURL('image/jpeg', quality)
}
