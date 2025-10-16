import { put } from "@vercel/blob"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const files = formData.getAll("files") as File[]

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 })
    }

    if (files.length > 10) {
      return NextResponse.json({ error: "Maximum 10 images allowed" }, { status: 400 })
    }

    // Upload all files to Vercel Blob
    const uploadPromises = files.map(async (file) => {
      // Generate unique filename with timestamp
      const timestamp = Date.now()
      const filename = `products/${timestamp}-${file.name}`

      const blob = await put(filename, file, {
        access: "public",
      })

      return {
        url: blob.url,
        filename: file.name,
        size: file.size,
        type: file.type,
      }
    })

    const uploadedFiles = await Promise.all(uploadPromises)

    return NextResponse.json({ files: uploadedFiles })
  } catch (error) {
    console.error("[v0] Upload error:", error)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
