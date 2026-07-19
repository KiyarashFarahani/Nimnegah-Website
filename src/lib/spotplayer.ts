const SPOTPLAYER_API_URL = 'https://panel.spotplayer.ir/license/edit/'

type CreateLicenseResult =
  | { success: true; id: string; key: string; url: string }
  | { success: false; error: string }

export async function createSpotPlayerLicense(
  name: string,
  courseIds: string[],
  watermarkText: string,
): Promise<CreateLicenseResult> {
  const apiKey = process.env.SPOTPLAYER_API_KEY!

  const response = await fetch(SPOTPLAYER_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      $API: apiKey,
      $LEVEL: '-1',
    },
    body: JSON.stringify({
      name,
      course: courseIds,
      watermark: {
        texts: [{ text: watermarkText }],
      },
    }),
  })

  const data = await response.json()

  if (data._id && data.key) {
    return { success: true, id: data._id, key: data.key, url: data.url }
  }

  console.error('SpotPlayer API error:', JSON.stringify(data))
  const errorMsg = data.ex?.msg || 'خطا در ایجاد لایسنس اسپات‌پلیر'
  return { success: false, error: errorMsg }
}
