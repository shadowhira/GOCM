"use client"

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface SearchPopupProps {
  className?: string
}

export const SearchPopup = ({ className }: SearchPopupProps) => {
  const t = useTranslations()
  const [open, setOpen] = useState(false)
  const [selectedFilter, setSelectedFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')

  const searchFilters = [
    { key: 'all', label: t('all') },
    { key: 'class', label: t('class') },
    { key: 'document', label: t('document') },
    { key: 'assignment', label: t('assignment') },
    { key: 'member', label: t('member') },
  ]

  const handleSearch = () => {
    // TODO: Implement search logic
    console.log('Search:', searchQuery, 'Filter:', selectedFilter)
    setOpen(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className={cn("flex-1 max-w-2xl mx-8", className)}>
          <div className="relative cursor-pointer border border-primary-500 rounded-md bg-muted/30 hover:bg-muted/100 hover:border-foreground transition-colors">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-primary-600" />
            </div>
            <Input
              placeholder={t('search_placeholder')}
              className="pl-10 pr-4 bg-transparent border-0 cursor-pointer focus:ring-0 focus:outline-none"
              readOnly
            />
          </div>
        </div>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-primary-500">
            {/* <Search className="h-5 w-5 text-primary-600" /> */}
            {t('search')}
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Search Input */}
          <div className="relative">
            <div className="absolute left-3 top-1/2 -translate-y-1/2">
              <Search className="h-4 w-4 text-primary-600" />
            </div>
            <Input
              placeholder={t('search_placeholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              className="pl-10 pr-10 text-lg py-3 text-foreground"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Search Filters */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-foreground">Filter by:</h3>
            <div className="flex flex-wrap gap-2">
              {searchFilters.map((filter) => (
                <Badge
                  key={filter.key}
                  variant={selectedFilter === filter.key ? "primary" : "outline"}
                  className="cursor-pointer hover:bg-primary-100 hover:border-primary-300 hover:text-muted transition-colors"
                  onClick={() => setSelectedFilter(filter.key)}
                >
                  {filter.label}
                </Badge>
              ))}
            </div>
          </div>

          {/* Search Results Preview */}
          {searchQuery && (
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-muted-foreground">Recent searches:</h3>
              <div className="text-sm text-muted-foreground">
                No recent searches yet...
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSearch} disabled={!searchQuery.trim()}>
              Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}