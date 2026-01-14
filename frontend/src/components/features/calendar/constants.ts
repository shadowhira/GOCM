/**
 * Calendar component constants and style configurations
 * Uses design tokens from globals.css for consistent theming
 */

/**
 * Calendar skeleton height for loading state
 * This is a specific height for the calendar picker area
 */
export const CALENDAR_SKELETON_HEIGHT = "h-72"; // ~288px, close to actual calendar height

/**
 * Calendar event type color mappings using design tokens
 * - Assignment: Uses 'error' color (red) to indicate deadline urgency
 * - LiveRoom: Uses 'success' color (green) to indicate scheduled sessions
 */
export const CALENDAR_EVENT_COLORS = {
  assignment: {
    indicator: "bg-error",
    iconBg: "bg-info/10 text-info dark:bg-info/20",
    badge: "bg-info/10 text-info dark:bg-info/20",
  },
  liveroom: {
    indicator: "bg-success",
    iconBg: "bg-success/10 text-success dark:bg-success/20",
    badge: "bg-success/10 text-success dark:bg-success/20",
  },
} as const;

/**
 * Calendar indicator colors using design tokens
 * - Today highlight: Uses 'info' color (blue ring)
 * - Today with deadline: Uses 'error' color (red ring)
 */
export const CALENDAR_INDICATOR_COLORS = {
  today: "ring-info",
  todayDeadline: "ring-error",
} as const;

/**
 * Submission status colors
 */
export const SUBMISSION_STATUS_COLORS = {
  submitted: "text-success",
  notSubmitted: "text-warning",
} as const;

/**
 * DayPicker classNames configuration
 * Extracted for reusability and cleaner component code
 */
export const DAY_PICKER_CLASS_NAMES = {
  root: "flex justify-center",
  months: "flex flex-col items-center",
  month: "space-y-4",
  month_caption: "flex justify-center items-center pt-1 relative w-[252px]",
  caption_label: "text-sm font-medium",
  nav: "flex items-center justify-between w-full",
  button_previous:
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground",
  button_next:
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 inline-flex items-center justify-center rounded-md border border-input hover:bg-accent hover:text-accent-foreground",
  month_grid: "w-full border-collapse space-y-1",
  weekdays: "flex justify-center",
  weekday:
    "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
  week: "flex w-full mt-2 justify-center",
  day: "h-9 w-9 text-center text-sm p-0 relative focus-within:relative focus-within:z-20",
  day_button:
    "h-9 w-9 p-0 font-normal rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground inline-flex items-center justify-center aria-selected:opacity-100",
  selected:
    "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-md",
  today: "bg-accent text-accent-foreground rounded-md",
  outside:
    "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
  disabled: "text-muted-foreground opacity-50",
  hidden: "invisible",
} as const;
