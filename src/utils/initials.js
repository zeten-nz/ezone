/** "Aziz Karimov" -> "AK" — shared by the sidebar, header profile menu, and profile page avatars. */
export function initialsOf(name = '') {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || '?'
  );
}
