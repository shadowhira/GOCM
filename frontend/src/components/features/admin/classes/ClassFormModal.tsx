'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { useTranslations } from 'next-intl'
import { Loader2, FileText, Palette, Image as ImageIcon, Settings, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createClassSchema, editClassSchema, type CreateClassFormData, type EditClassFormData } from '@/schemas/classSchema'
import type { ClassResponse } from '@/types/class'

// Preset colors with gradients (same as CoverSettingsCard)
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

export const DEFAULT_COVER_GRADIENT = 'linear-gradient(135deg, #6366f1, #8b5cf6)'

interface ClassFormModalProps {
  mode: 'create' | 'edit'
  open: boolean
  onClose: () => void
  onSubmit: (values: CreateClassFormData | EditClassFormData, coverFile?: File) => void
  defaultValues?: Partial<EditClassFormData>
  classData?: ClassResponse
  isSubmitting?: boolean
  isLoading?: boolean
}

export const ClassFormModal = ({
  mode,
  open,
  onClose,
  onSubmit,
  defaultValues,
  classData,
  isSubmitting = false,
  isLoading = false,
}: ClassFormModalProps) => {
  const t = useTranslations()
  const [activeTab, setActiveTab] = useState<'basic' | 'cover' | 'appearance'>('basic')
  const [coverTab, setCoverTab] = useState<'image' | 'color'>('color')
  const [selectedColor, setSelectedColor] = useState<string>(classData?.coverColor || DEFAULT_COVER_GRADIENT)
  const [previewFile, setPreviewFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | undefined>(undefined)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const schema = mode === 'create' ? createClassSchema : editClassSchema
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<EditClassFormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      coverColor: DEFAULT_COVER_GRADIENT,
      showAvatarFrames: true,
      showChatFrames: true,
      showBadges: true,
      ...defaultValues,
    },
  })

  const watchedColor = watch('coverColor')
  const watchedShowAvatarFrames = watch('showAvatarFrames')
  const watchedShowChatFrames = watch('showChatFrames')
  const watchedShowBadges = watch('showBadges')

  useEffect(() => {
    if (open) {
      if (defaultValues || classData) {
        reset({
          name: defaultValues?.name || classData?.name || '',
          description: defaultValues?.description || classData?.description || '',
          coverColor: defaultValues?.coverColor || classData?.coverColor || DEFAULT_COVER_GRADIENT,
          showAvatarFrames: defaultValues?.showAvatarFrames ?? classData?.appearanceSettings?.showAvatarFrames ?? true,
          showChatFrames: defaultValues?.showChatFrames ?? classData?.appearanceSettings?.showChatFrames ?? true,
          showBadges: defaultValues?.showBadges ?? classData?.appearanceSettings?.showBadges ?? true,
        })
        setSelectedColor(defaultValues?.coverColor || classData?.coverColor || DEFAULT_COVER_GRADIENT)
      } else {
        reset({
          name: '',
          description: '',
          coverColor: DEFAULT_COVER_GRADIENT,
          showAvatarFrames: true,
          showChatFrames: true,
          showBadges: true,
        })
        setSelectedColor(DEFAULT_COVER_GRADIENT)
      }
      setActiveTab('basic')
      setPreviewFile(null)
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
        setPreviewUrl(undefined)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, defaultValues, classData])

  // Sync selected color with form
  useEffect(() => {
    if (selectedColor !== watchedColor) {
      setValue('coverColor', selectedColor)
    }
  }, [selectedColor, setValue, watchedColor])

  // Clean up preview URL on unmount
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      return
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
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

  const handleRemovePreview = () => {
    setPreviewFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(undefined)
    }
  }

  const handleClose = () => {
    if (isSubmitting) {
      return
    }
    handleRemovePreview()
    onClose()
  }

  const handleFormSubmit = (values: EditClassFormData) => {
    onSubmit(values, previewFile || undefined)
  }

  const title = mode === 'create' ? t('create_new_class') : t('edit_class')
  const description = mode === 'create' ? t('start_your_learning_journey') : t('update_class_details')
  const cta = mode === 'create' ? t('create_class') : t('save_changes')
  const submittingLabel = mode === 'create' ? t('creating_class') : t('saving_changes')

  const isEditMode = mode === 'edit'

  return (
    <Dialog open={open} onOpenChange={(value) => !value && handleClose()}>
      <DialogContent className={cn(
        "sm:max-w-md",
        isEditMode && "sm:max-w-xl"
      )}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {isLoading && !defaultValues && isEditMode ? (
          <div className="flex min-h-48 items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
            {isEditMode ? (
              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'basic' | 'cover' | 'appearance')}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="basic" className="gap-2">
                    <FileText className="h-4 w-4" />
                    {t('basic_info')}
                  </TabsTrigger>
                  <TabsTrigger value="cover" className="gap-2">
                    <ImageIcon className="h-4 w-4" />
                    {t('cover')}
                  </TabsTrigger>
                  <TabsTrigger value="appearance" className="gap-2">
                    <Settings className="h-4 w-4" />
                    {t('appearance')}
                  </TabsTrigger>
                </TabsList>

                <ScrollArea className="max-h-[50vh] mt-4">
                  {/* Basic Info Tab */}
                  <TabsContent value="basic" className="space-y-4 mt-0 pr-4">
                    <div className="space-y-2">
                      <label htmlFor="class-name" className="text-sm font-medium">
                        {t('class_name')} <span className="text-error">*</span>
                      </label>
                      <Input
                        id="class-name"
                        placeholder={t('enter_class_name')}
                        {...register('name')}
                        disabled={isSubmitting}
                        className={errors.name ? 'border-error' : ''}
                      />
                      {errors.name && <p className="text-sm text-error">{t(errors.name.message!)}</p>}
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="class-description" className="text-sm font-medium">
                        {t('description_optional')}
                      </label>
                      <Textarea
                        id="class-description"
                        rows={4}
                        placeholder={t('enter_class_description')}
                        {...register('description')}
                        disabled={isSubmitting}
                        className={errors.description ? 'border-error' : ''}
                      />
                      {errors.description && <p className="text-sm text-error">{t(errors.description.message!)}</p>}
                    </div>
                  </TabsContent>

                  {/* Cover Tab */}
                  <TabsContent value="cover" className="space-y-4 mt-0 pr-4">
                    {/* Current Cover Preview */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium">{t('current_cover')}</label>
                      <div className="relative h-24 rounded-lg overflow-hidden">
                        {classData?.coverImageUrl ? (
                          <Image
                            src={classData.coverImageUrl}
                            alt="Current cover"
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div 
                            className="absolute inset-0" 
                            style={{ background: classData?.coverColor || DEFAULT_COVER_GRADIENT }}
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent" />
                      </div>
                    </div>

                    <Tabs value={coverTab} onValueChange={(v) => setCoverTab(v as 'image' | 'color')}>
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

                      {/* Image Upload */}
                      <TabsContent value="image" className="space-y-3">
                        <div
                          onClick={() => fileInputRef.current?.click()}
                          onDrop={handleDrop}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          className={cn(
                            "relative h-32 rounded-lg border-2 border-dashed transition-colors cursor-pointer",
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
                              <ImageIcon className="h-8 w-8 text-muted-foreground" />
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
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={handleRemovePreview}
                            className="w-full"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('cover_remove_image')}
                          </Button>
                        )}
                      </TabsContent>

                      {/* Color Picker */}
                      <TabsContent value="color" className="space-y-3">
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
                            className="h-16 rounded-lg"
                            style={{ background: selectedColor }}
                          />
                        </div>
                      </TabsContent>
                    </Tabs>
                  </TabsContent>

                  {/* Appearance Tab */}
                  <TabsContent value="appearance" className="space-y-4 mt-0 pr-4">
                    <p className="text-sm text-muted-foreground">{t('appearance_settings_subtitle')}</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">{t('appearance_toggle_avatar')}</label>
                          <p className="text-xs text-muted-foreground">{t('appearance_toggle_avatar_desc')}</p>
                        </div>
                        <Switch
                          checked={watchedShowAvatarFrames ?? true}
                          onCheckedChange={(checked) => setValue('showAvatarFrames', checked)}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">{t('appearance_toggle_chat')}</label>
                          <p className="text-xs text-muted-foreground">{t('appearance_toggle_chat_desc')}</p>
                        </div>
                        <Switch
                          checked={watchedShowChatFrames ?? true}
                          onCheckedChange={(checked) => setValue('showChatFrames', checked)}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <label className="text-sm font-medium">{t('appearance_toggle_badge')}</label>
                          <p className="text-xs text-muted-foreground">{t('appearance_toggle_badge_desc')}</p>
                        </div>
                        <Switch
                          checked={watchedShowBadges ?? true}
                          onCheckedChange={(checked) => setValue('showBadges', checked)}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>
                  </TabsContent>
                </ScrollArea>
              </Tabs>
            ) : (
              /* Create mode - simple form without tabs */
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="class-name" className="text-sm font-medium">
                    {t('class_name')} <span className="text-error">*</span>
                  </label>
                  <Input
                    id="class-name"
                    placeholder={t('enter_class_name')}
                    {...register('name')}
                    disabled={isSubmitting}
                    className={errors.name ? 'border-error' : ''}
                  />
                  {errors.name && <p className="text-sm text-error">{t(errors.name.message!)}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="class-description" className="text-sm font-medium">
                    {t('description_optional')}
                  </label>
                  <Textarea
                    id="class-description"
                    rows={4}
                    placeholder={t('enter_class_description')}
                    {...register('description')}
                    disabled={isSubmitting}
                    className={errors.description ? 'border-error' : ''}
                  />
                  {errors.description && <p className="text-sm text-error">{t(errors.description.message!)}</p>}
                </div>
              </div>
            )}

            <DialogFooter className="gap-2 sm:gap-0 pt-4">
              <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                {t('cancel')}
              </Button>
              <Button type="submit" className="gap-2" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
                {isSubmitting ? submittingLabel : cta}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
