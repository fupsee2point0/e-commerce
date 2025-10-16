"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { X, Upload } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
  maxImages?: number
}

export function ImageUpload({ images, onChange, maxImages = 10 }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return

    const remainingSlots = maxImages - images.length
    if (files.length > remainingSlots) {
      toast({
        title: "Too many images",
        description: `You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`,
        variant: "destructive",
      })
      return
    }

    // Validate file types
    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: `${file.name} is not an image file`,
          variant: "destructive",
        })
        return false
      }
      return true
    })

    if (validFiles.length === 0) return

    setUploading(true)

    try {
      const formData = new FormData()
      validFiles.forEach((file) => {
        formData.append("files", file)
      })

      const response = await fetch("/api/upload-product-images", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Upload failed")
      }

      const data = await response.json()
      const newImageUrls = data.files.map((file: any) => file.url)

      onChange([...images, ...newImageUrls])

      toast({
        title: "Success",
        description: `${validFiles.length} image(s) uploaded successfully`,
      })
    } catch (error) {
      console.error("[v0] Upload error:", error)
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    handleFileSelect(e.dataTransfer.files)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = () => {
    setDragOver(false)
  }

  const removeImage = async (index: number) => {
    const imageUrl = images[index]

    try {
      // Delete from Blob storage
      await fetch("/api/delete-product-image", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: imageUrl }),
      })

      const newImages = images.filter((_, i) => i !== index)
      onChange(newImages)

      toast({
        title: "Image removed",
        description: "Image deleted successfully",
      })
    } catch (error) {
      console.error("[v0] Delete error:", error)
      toast({
        title: "Delete failed",
        description: "Failed to delete image",
        variant: "destructive",
      })
    }
  }

  const moveImage = (fromIndex: number, toIndex: number) => {
    const newImages = [...images]
    const [movedImage] = newImages.splice(fromIndex, 1)
    newImages.splice(toIndex, 0, movedImage)
    onChange(newImages)
  }

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragOver ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />

        <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />

        <div className="space-y-2">
          <p className="text-sm font-medium">Drag and drop images here, or click to select</p>
          <p className="text-xs text-muted-foreground">
            Upload up to {maxImages} images. At least 1 image is required.
          </p>
          <p className="text-xs text-muted-foreground">
            {images.length} / {maxImages} images uploaded
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading || images.length >= maxImages}
          className="mt-4"
        >
          {uploading ? "Uploading..." : "Select Images"}
        </Button>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border bg-muted">
              <img
                src={image || "/placeholder.svg"}
                alt={`Product image ${index + 1}`}
                className="w-full h-full object-cover"
              />

              {/* Image Controls Overlay */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {/* Move Left */}
                {index > 0 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, index - 1)}
                    className="h-8 w-8 p-0"
                  >
                    ←
                  </Button>
                )}

                {/* Remove */}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => removeImage(index)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>

                {/* Move Right */}
                {index < images.length - 1 && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => moveImage(index, index + 1)}
                    className="h-8 w-8 p-0"
                  >
                    →
                  </Button>
                )}
              </div>

              {/* Display Order Badge */}
              <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">#{index + 1}</div>

              {/* Primary Badge */}
              {index === 0 && (
                <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                  Primary
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
