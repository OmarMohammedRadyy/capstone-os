# Design System — Tokens & Components

## Typography
Arabic: IBM Plex Sans Arabic (or approved open-source equivalent).
Latin/UI metrics: Geist Sans.
Fallbacks defined in CSS variables.

### Scale
Display 36/44 650
H1 30/38 650
H2 24/32 620
H3 20/28 600
Body 15/24 450
Small 13/20 450
Micro 12/16 500
Metric 28/32 650 tabular-nums

## Color Tokens — Light
- canvas: #F6F7F9
- surface: #FFFFFF
- surface-subtle: #F0F2F5
- ink: #111318
- ink-secondary: #5F6673
- border: #E1E5EA
- accent: #3157D5
- accent-hover: #2748B8
- success: #16794B
- warning: #A86206
- danger: #C7353A
- info: #2563A8

## Dark
- canvas: #0C0F14
- surface: #12161D
- surface-subtle: #181D26
- ink: #F5F7FA
- ink-secondary: #AAB2BF
- border: #262D38
- accent: #7892FF
Statuses must maintain AA contrast.

## Spacing
4px base scale: 4,8,12,16,20,24,32,40,48,64.

## Radius
sm 8, md 12, lg 16, xl 20; circular only for avatars/icon buttons.

## Shadows
Use two restrained elevations: floating popover and modal. Cards primarily use border + surface contrast.

## Core Components
Button, IconButton, Input, Textarea, Select, Combobox, Checkbox, Radio, Switch, DatePicker, Badge, StatusChip, Avatar, Tooltip, Popover, Dropdown, Dialog, Drawer, Sheet, Tabs, SegmentedControl, Table, DataGrid, Pagination, Breadcrumb, CommandMenu, Toast, EmptyState, Skeleton, ErrorState, Timeline, Progress, HealthRing, StatRow, FilterBar, ActivityItem, FileRow, CommentComposer.

## Button Hierarchy
Primary, Secondary, Ghost, Destructive. One dominant primary action per region.

## Icons
Lucide or consistent outline icon set. 16/18/20/24 grid. Never mix filled cartoon icons.

## Focus
Visible 2px focus ring with offset. Never remove focus outline without replacement.
