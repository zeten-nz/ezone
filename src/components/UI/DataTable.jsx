/**
 * Generic columns-config table with a responsive card fallback — same data,
 * no horizontal scroll on mobile. Column definitions are supplied per page
 * (warranty lists, user management, ...), while `renderMobileCard` gives each
 * caller full control over the compact layout.
 */
const DataTable = ({ columns, rows, rowKey, renderMobileCard, actionsHeader, renderActions }) => (
  <>
    <div className="hidden md:block overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-neutral-200">
            {columns.map((col) => (
              <th key={col.key} className="text-left py-3 px-3 font-medium text-neutral-500 whitespace-nowrap">
                {col.header}
              </th>
            ))}
            {renderActions && (
              <th className="text-right py-3 px-3 font-medium text-neutral-500">{actionsHeader}</th>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={rowKey(row)} className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50 transition-colors">
              {columns.map((col) => (
                <td key={col.key} className={`py-3.5 px-3 text-neutral-700 ${col.className || ''}`}>
                  {col.render ? col.render(row) : row[col.key]}
                </td>
              ))}
              {renderActions && (
                <td className="py-3.5 px-3">
                  <div className="flex items-center justify-end gap-2">{renderActions(row)}</div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>

    <div className="md:hidden space-y-3">
      {rows.map((row) => (
        <div key={rowKey(row)}>{renderMobileCard(row)}</div>
      ))}
    </div>
  </>
);

export default DataTable;
