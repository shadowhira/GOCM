// Enhanced UI Components with Design System Integration
export { Button, buttonVariants } from "./button"
export { Card, CardHeader, CardContent, CardFooter, CardTitle, CardDescription } from "./card"
export { Badge, badgeVariants } from "./badge"
export { Alert, AlertTitle, AlertDescription } from "./alert"

// Form components
export { Input } from "./input"
export { Textarea } from "./textarea"
export { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
export { Checkbox } from "./checkbox"
export { RadioGroup, RadioGroupItem } from "./radio-group"
export { Switch } from "./switch"
export { Toggle } from "./toggle"

// File Upload
export { FileUploadInput, type FileItem } from "./file-upload-input"
export { AttachmentList } from "./attachment-list"

// Navigation & Interaction
export { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./dropdown-menu"
export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog"
export { Popover, PopoverContent, PopoverTrigger } from "./popover"
export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip"
export { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "./sheet"

// Layout & Structure
export { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs"
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./accordion"
export { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./table"
export { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage } from "./breadcrumb"

// Feedback & Status
export { Progress } from "./progress"
export { Avatar, AvatarFallback, AvatarImage } from "./avatar"
export { Toaster } from "./sonner" // Toast replacement

// Date & Time
export { Calendar } from "./calendar"

// Custom Classroom Components
export { ClassCard, classCardVariants } from "./class-card"
export { AssignmentCard, assignmentCardVariants } from "./assignment-card"

// Re-export design system utilities and tokens
export { cn } from "@/lib/utils"
export { designTokens, colors, typography, spacing } from "@/lib/design-tokens"