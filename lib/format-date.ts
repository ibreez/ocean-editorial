const DHIVEHI_MONTHS = [
  "ޖަނަވަރީ",
  "ފެބުރުވަރީ",
  "މާރިޗު",
  "އެޕްރީލް",
  "މޭ",
  "ޖޫން",
  "ޖުލައި",
  "އޮގަސްޓު",
  "ސެޕްޓެމްބަރު",
  "އޮކްޓޯބަރު",
  "ނޮވެމްބަރު",
  "ޑިސެމްބަރު",
];

const DHIVEHI_DAYS = [
  "އާދީއްތަ",
  "ހޯމަ",
  "އަންގާރަ",
  "ބުދަ",
  "ބުރާސްފަތި",
  "ހުކުރު",
  "ހޮނިހިރު",
];

export function formatDhivehiDate(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const day = date.getDate();
  const monthName = DHIVEHI_MONTHS[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${monthName} ${year}`;
}

export function formatDhivehiDateTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const dateStr = formatDhivehiDate(date);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${dateStr} ${hours}:${minutes}`;
}

export function formatDhivehiRelativeTime(dateInput: string | Date): string {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "";

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "ދެންމެ";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} މިނެޓު ކުރިން`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ގަޑިއިރު ކުރިން`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ދުވަސް ކުރިން`;
  }

  return formatDhivehiDate(date);
}

export function getCurrentDhivehiDateFormatted(): string {
  const now = new Date();
  const dayName = DHIVEHI_DAYS[now.getDay()];
  const day = now.getDate();
  const monthName = DHIVEHI_MONTHS[now.getMonth()];
  const year = now.getFullYear();

  return `${dayName}، ${day} ${monthName} ${year}`;
}
