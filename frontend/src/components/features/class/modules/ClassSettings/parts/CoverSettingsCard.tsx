'use client'

import React from 'react'
import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Camera, Image as ImageIcon, Palette, Trash2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { classApi } from '@/api/classApi'
import { useUpdateClass, useGetClassById } from '@/queries/classQueries'
import { useQueryClient } from '@tanstack/react-query'
import { classKeys } from '@/queries/classQueries'

// Preset colors with gradients
const PRESET_COLORS = [
  { name: 'primary', value: 'linear-gradient(135deg, #6366f1, #8b5cf6)', preview: '#6366f1' },
  { name: 'blue', value: 'linear-gradient(135deg, #3b82f6, #06b6d4)', preview: '#3b82f6' },
  { name: 'cyan', value: 'linear-gradient(135deg, #06b6d4, #14b8a6)', preview: '#06b6d4' },
  { name: 'teal', value: 'linear-gradient(135deg, #14b8a6, #22c55e)', preview: '#14b8a6' },
  { name: 'green', value: 'linear-gradient(135deg, #22c55e, #84cc16)', preview: '#22c55e' },
  { name: 'lime', value: 'linear-gradient(135deg, #84cc16, #eab308)', preview: '#84cc16' },
  { name: 'yellow', value: 'linear-gradient(135deg, #eab308, #f97316)', preview: '#eab308' },
  { name: 'orange', value: 'linear-gradient(135deg, #f97316, #ef4444)', preview: '#f97316' },
  { name: 'red', value: 'linear-gradient(135deg, #ef4444, #ec4899)', preview: '#ef4444' },
  { name: 'pink', value: 'linear-gradient(135deg, #ec4899, #a855f7)', preview: '#ec4899' },
  { name: 'purple', value: 'linear-gradient(135deg, #a855f7, #6366f1)', preview: '#a855f7' },
  { name: 'slate', value: 'linear-gradient(135deg, #64748b, #475569)', preview: '#64748b' },
]

// Default gradient value
export const DEFAULT_COVER_GRADIENT = 'linear-gradient(135deg, #6366f1, #8b5cf6)'

interface CoverSettingsCardProps {
  classId: number
  isTeacher: boolean
}

export const CoverSettingsCard = ({ classId, isTeacher }: CoverSettingsCardProps) => {
  const t = useTranslations()
  const queryClient = useQueryClient()
  const { data: classData } = useGetClassById(classId)
  const updateClassMutation = useUpdateClass()
  
  const [isModalOpen, setIsModalOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<'image' | 'color'>('color')
  const [selectedColor, setSelectedColor] = React.useState<string>(classData?.coverColor || DEFAULT_COVER_GRADIENT)
  const [previewFile, setPreviewFile] = React.useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = React.useState<string | undefined>(undefined)
  const [isUploading, setIsUploading] = React.useState(false)
  const [isDragging, setIsDragging] = React.useState(false)

  const fileInputRef = React.useRef<HTMLInputElement>(null)

  // Sync state when class data changes
  React.useEffect(() => {
    if (classData) {
      setSelectedColor(classData.coverColor || DEFAULT_COVER_GRADIENT)
    }
  }, [classData])

  // Clean up preview URL on unmount
  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error(t('invalid_file_type'))
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      toast.error(t('file_too_large'))
      return
    }

    // Clean up old preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
    }

    const newPreviewUrl = URL.createObjectURL(file)
    setPreviewFile(file)
    setPreviewUrl(newPreviewUrl)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleSave = async () => {
    if (!classData) return

    try {
      setIsUploading(true)

      if (activeTab === 'image' && previewFile) {
        // Upload image first
        await classApi.uploadCover(classId, previewFile)
        // Invalidate queries to refresh data
        queryClient.invalidateQueries({ queryKey: classKeys.detail(classId) })
        queryClient.invalidateQueries({ queryKey: classKeys.lists() })
        queryClient.invalidateQueries({ queryKey: classKeys.myClasses() })
        toast.success(t('cover_saved_success'))
      } else if (activeTab === 'color') {
        // Save color
        await updateClassMutation.mutateAsync({
          id: classId,
          data: {
            name: classData.name,
            description: classData.description,
            coverImageUrl: undefined,
            coverColor: selectedColor,
          },
        })
        toast.success(t('cover_saved_success'))
      }

      setIsModalOpen(false)
      setPreviewFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(undefined)
      }
    } catch {
      toast.error(t('cover_save_error'))
    } finally {
      setIsUploading(false)
    }
  }

  const handleRemoveCover = async () => {
    if (!classData) return

    try {
      await updateClassMutation.mutateAsync({
        id: classId,
        data: {
          name: classData.name,
          description: classData.description,
          coverImageUrl: undefined,
          coverColor: undefined,
        },
      })
      toast.success(t('cover_removed'))
      setIsModalOpen(false)
    } catch {
      toast.error(t('cover_remove_error'))
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setPreviewFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(undefined)
    }
    // Reset to current values
    setSelectedColor(classData?.coverColor || DEFAULT_COVER_GRADIENT)
  }

  const hasChanges = activeTab === 'image'
    ? previewFile !== null
    : selectedColor !== (classData?.coverColor || DEFAULT_COVER_GRADIENT)

  const hasCover = classData?.coverImageUrl || classData?.coverColor

  // Render cover preview
  const renderCoverPreview = () => {
    if (classData?.coverImageUrl) {
      return (
        <Image
          src={classData.coverImageUrl}
          alt="Class cover"
          fill
          className="object-cover"
        />
      )
    }
    if (classData?.coverColor) {
      return (
        <div 
          className="absolute inset-0" 
          style={{ background: classData.coverColor }}
        />
      )
    }
    return (
      <div 
        className="absolute inset-0" 
        style={{ background: DEFAULT_COVER_GRADIENT }}
      />
    )
  }

  if (!isTeacher) return null

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            {t('cover_settings')}
          </CardTitle>
          <CardDescription>{t('cover_settings_description')}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Cover Preview */}
          <div className="relative h-32 rounded-lg overflow-hidden">
            {renderCoverPreview()}
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 to-transparent" />
          </div>

          {/* Edit Button */}
          <Button onClick={() => setIsModalOpen(true)} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            {t('edit_cover')}
          </Button>
        </CardContent>
      </Card>

      {/* Cover Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={(open) => !open && handleCloseModal()}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{t('cover_editor_title')}</DialogTitle>
            <DialogDescription>{t('cover_editor_description')}</DialogDescription>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'image' | 'color')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="image" className="gap-2">
                <ImageIcon className="h-4 w-4" />
                {t('cover_option_image')}
              </TabsTrigger>
              <TabsTrigger value="color" className="gap-2">
                <Palette className="h-4 w-4" />
                {t('cover_option_color')}
              </TabsTrigger>
            </TabsList>

            {/* Image Upload Tab */}
            <TabsContent value="image" className="space-y-4">
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                  "relative h-40 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
                  "flex flex-col items-center justify-center gap-2",
                  isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                )}
              >
                {previewUrl ? (
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover rounded-lg"
                  />
                ) : (
                  <>
                    <ImageIcon className="h-10 w-10 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground text-center px-4">
                      {t('cover_upload_drag')}
                    </p>
                    <p className="text-xs text-muted-foreground">{t('cover_upload_hint')}</p>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleInputChange}
                  className="hidden"
                />
              </div>
              {previewUrl && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setPreviewFile(null)
                    if (previewUrl) {
                      URL.revokeObjectURL(previewUrl)
                      setPreviewUrl(undefined)
                    }
                  }}
                  className="w-full"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {t('cover_remove_image')}
                </Button>
              )}
            </TabsContent>

            {/* Color Picker Tab */}
            <TabsContent value="color" className="space-y-4">
              <p className="text-sm text-muted-foreground">{t('cover_preset_colors')}</p>
              <div className="grid grid-cols-6 gap-2">
                {PRESET_COLORS.map((color) => (
                  <button
                    key={color.name}
                    type="button"
                    onClick={() => setSelectedColor(color.value)}
                    className={cn(
                      "h-10 w-full rounded-md border-2 transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2",
                      selectedColor === color.value
                        ? "border-foreground ring-2 ring-foreground/20"
                        : "border-transparent"
                    )}
                    style={{ background: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
              
              {/* Preview */}
              <div className="space-y-2">
                <p className="text-sm font-medium">{t('cover_preview_title')}</p>
                <div 
                  className="h-24 rounded-lg"
                  style={{ background: selectedColor }}
                />
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="gap-2 sm:gap-0">
            {hasCover && (
              <Button
                variant="destructive"
                onClick={handleRemoveCover}
                disabled={isUploading || updateClassMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                {t('remove_cover')}
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" onClick={handleCloseModal}>
              {t('cancel')}
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={!hasChanges || isUploading || updateClassMutation.isPending}
            >
              {isUploading ? t('saving_cover') : t('save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
